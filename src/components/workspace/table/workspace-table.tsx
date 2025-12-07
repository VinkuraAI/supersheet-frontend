"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";
import { EmailComposerDialog } from "@/components/dialogs/email-composer-dialog";
import { useWorkspace } from "@/lib/workspace-context";
import { useSendRowMail, useSyncWorkspace } from "@/features/workspace/hooks/use-workspaces";
import { useIsMobile } from "@/hooks/use-mobile";

import { WorkspaceToolbar } from "./workspace-toolbar";
import { WorkspaceActions } from "./workspace-actions";
import {
    FeedbackCell,
    InformedCell,
    StatusCell,
    TruncatedCell,
} from "./table-cells";
import { MailConsent } from "./mail-consent";

import { useAuth } from "@/lib/auth-context";

export function WorkspaceTable({
    tickets,
    schema,
    setData,
    onRefreshData,
    workspaceName,
    workspaceId,
    jd,
    onJdUpdate,
    routePrefix,
}: {
    tickets: any[];
    schema: any[];
    setData: React.Dispatch<React.SetStateAction<any[]>>;
    onRefreshData?: () => void;
    workspaceName: string;
    workspaceId: string;
    jd: string;
    onJdUpdate: (newJd: string) => void;
    routePrefix: string;
}) {
    const { selectedWorkspace } = useWorkspace();
    const { user } = useAuth();
    const { mutateAsync: sendRowMail } = useSendRowMail();
    const { mutateAsync: syncWorkspace } = useSyncWorkspace();
    const disabled = !selectedWorkspace;
    const isMobile = useIsMobile();

    // Helper function to check if user can edit
    const canEdit = () => {
        if (!selectedWorkspace || !user) return false;
        // Owner always has access
        if (selectedWorkspace.userId === user.id) return true;

        // Check member role
        const member = selectedWorkspace.members?.find(m =>
            (typeof m.user === 'string' ? m.user : m.user._id) === user.id
        );

        if (!member) return false;
        return ['owner', 'admin', 'editor'].includes(member.role);
    };

    const isEditable = canEdit();

    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [editingCell, setEditingCell] = useState<{
        row: number;
        col: string;
    } | null>(null);
    const [editValue, setEditValue] = useState("");
    const [currentData, setCurrentData] = useState<any[]>(tickets);
    const resizingRef = useRef<{
        col: string;
        startX: number;
        startWidth: number;
    } | null>(null);
    const initialData = useRef<any[]>([]);
    const [isSynced, setIsSynced] = useState(true);
    const [showSyncWarning, setShowSyncWarning] = useState(false);
    const [mailConsentInfo, setMailConsentInfo] = useState<{ open: boolean, onSend?: () => void, onDontSend?: () => void }>({ open: false });
    const [emailComposerOpen, setEmailComposerOpen] = useState(false);
    const [selectedCandidateForEmail, setSelectedCandidateForEmail] = useState<{ name: string; email: string; rowIndex: number; newStatus: string } | null>(null);

    // Local schema state
    const [localSchema, setLocalSchema] = useState<any[]>(schema);

    // Initialize initialData, currentData, and localSchema once when component mounts
    useEffect(() => {
        if (selectedWorkspace) {
            // We do NOT load from local storage on mount - we want to force a "reset to server state" behavior on refresh.
            // But we should clear any lingering local storage to avoid confusion if they were expecting drafts to persist across reloads (per requirements).
            localStorage.removeItem(`workspace-${selectedWorkspace._id}-data`);

            // Use the props data as the baseline
            initialData.current = [...tickets];
            setCurrentData(tickets);
            setLocalSchema(schema);
        }
    }, [selectedWorkspace]); // Only run when workspace changes

    // Track if there are uncommitted changes using a ref
    const hasUncommittedChangesRef = useRef(false);

    // Update our ref whenever currentData changes to track if we have uncommitted changes
    // Verify sync status (schema changes or data changes)
    useEffect(() => {
        const added = currentData.some((row) => row.isNew);
        const updated = currentData.some((row) => {
            const initialRow = initialData.current.find((r) => r._id === row._id);
            return (
                initialRow &&
                JSON.stringify(initialRow) !== JSON.stringify(row) &&
                !row.isNew
            );
        });
        const deleted = initialData.current.some(
            (initialRow) => !currentData.some((row) => row._id === initialRow._id)
        );

        // Check for schema changes (columns added)
        const schemaChanged = JSON.stringify(localSchema) !== JSON.stringify(schema);

        hasUncommittedChangesRef.current = added || updated || deleted || schemaChanged;
    }, [currentData, initialData, localSchema, schema]);

    // Update currentData when tickets prop changes from parent (after sync or initial load)
    // But only if there are no uncommitted local changes
    useEffect(() => {
        // Only update from parent if there are no local uncommitted changes
        if (!hasUncommittedChangesRef.current) {
            setCurrentData(tickets);
            setLocalSchema(schema);

            // After successful sync, update initialData to match the fresh data from parent
            if (initialData.current.length !== tickets.length ||
                JSON.stringify(initialData.current) !== JSON.stringify(tickets)) {
                initialData.current = [...tickets];
            }
        }
    }, [tickets, schema]);

    useEffect(() => {
        const checkSyncStatus = () => {
            // Only check sync status if initialData has been properly initialized
            if (initialData.current.length === 0 && tickets.length > 0) {
                // edge case where loading happening
            }

            const added = currentData.some((row) => row.isNew);
            const updated = currentData.some((row) => {
                const initialRow = initialData.current.find((r) => r._id === row._id);
                return (
                    initialRow &&
                    JSON.stringify(initialRow) !== JSON.stringify(row) &&
                    !row.isNew
                );
            });
            const deleted = initialData.current.some(
                (initialRow) => !currentData.some((row) => row._id === initialRow._id)
            );

            const schemaChanged = JSON.stringify(localSchema) !== JSON.stringify(schema);

            if (added || updated || deleted || schemaChanged) {
                setIsSynced(false);
                setShowSyncWarning(true);
            } else {
                setIsSynced(true);
                setShowSyncWarning(false);
            }
        };

        checkSyncStatus();
    }, [currentData, localSchema]);

    useEffect(() => {
        const initialWidths: Record<string, number> = { checkbox: 38 };
        localSchema.forEach(col => {
            // Set different default widths based on column type
            if (col.name === "Feedback") {
                initialWidths[col.name] = 270; // Wider for feedback text
            } else if (col.name === "Status") {
                initialWidths[col.name] = 140; // Wider for status dropdown
            } else if (col.name === "Informed") {
                initialWidths[col.name] = 140; // Wider for informed dropdown
            } else if (col.name === "Notes") {
                initialWidths[col.name] = 220; // Wider for notes
            } else if (col.name === "Name" || col.name === "Email") {
                initialWidths[col.name] = 160; // Wider for name and email
            } else if (col.name === "Phone" || col.name === "Location") {
                initialWidths[col.name] = 140; // Medium width
            } else if (col.name === "AI Score" || col.name === "Experience") {
                initialWidths[col.name] = 50; // Very compact for numeric values
            } else if (col.name === "Skills" || col.name === "Education") {
                initialWidths[col.name] = 180; // Medium-wide for skills/education
            } else {
                initialWidths[col.name] = 130; // Default width
            }
        });
        setColumnWidths(initialWidths);
    }, [localSchema]);

    // Handle column resize
    const handleMouseDown = (col: string, e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        resizingRef.current = {
            col,
            startX: e.clientX,
            startWidth: columnWidths[col],
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizingRef.current) return;
            const { col, startX, startWidth } = resizingRef.current;
            const diff = e.clientX - startX;
            const newWidth = Math.max(60, startWidth + diff);
            setColumnWidths((prev) => ({ ...prev, [col]: newWidth }));
        };

        const handleMouseUp = () => {
            resizingRef.current = null;
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    // Handle double-click to edit
    const handleDoubleClick = (rowIndex: number, col: string, value: string) => {
        if (disabled || !isEditable) return;
        setEditingCell({ row: rowIndex, col });
        setEditValue(value);
    };

    const handleSaveEdit = () => {
        if (!editingCell) return;
        const { row, col } = editingCell;
        const newData = currentData.map((item, i) =>
            i === row
                ? {
                    ...item,
                    data: { ...item.data, [col]: editValue },
                }
                : item
        );
        setCurrentData(newData);
        setData(newData); // Notify parent
        if (selectedWorkspace) {
            localStorage.setItem(
                `workspace-${selectedWorkspace._id}-data`,
                JSON.stringify({ rows: newData, schema: localSchema })
            );
        }
        setEditingCell(null);
        setEditValue("");
    };

    // Helper function to update status and send email
    const sendMailAndUpdate = async (rowIndex: number, newStatus: string) => {
        if (disabled || !isEditable) return;

        const row = currentData[rowIndex];
        const updatedRowData = { ...row.data, Status: newStatus, Informed: 'Yes' };

        // Optimistically update UI
        const newData = currentData.map((item, i) =>
            i === rowIndex
                ? {
                    ...item,
                    data: updatedRowData,
                }
                : item
        );

        setCurrentData(newData);
        setData(newData);
        initialData.current = newData;

        if (selectedWorkspace) {
            localStorage.setItem(
                `workspace-${selectedWorkspace._id}-data`,
                JSON.stringify({ rows: newData, schema: localSchema })
            );
        }

        try {
            // Persist to backend
            await syncWorkspace({
                workspaceId: selectedWorkspace._id,
                changes: {
                    added: [],
                    updated: [{
                        _id: row._id,
                        data: updatedRowData
                    }],
                    deleted: []
                }
            });
        } catch (err) {
            console.error("Failed to sync status update", err);
            // Optionally revert UI change here if needed
        }
    };

    // Helper function to update status only without sending email
    const updateStatusOnly = async (rowIndex: number, newStatus: string) => {
        if (disabled || !isEditable) return;

        const row = currentData[rowIndex];
        const updatedRowData = { ...row.data, Status: newStatus };

        // Optimistically update UI
        const newData = currentData.map((item, i) =>
            i === rowIndex
                ? {
                    ...item,
                    data: updatedRowData,
                }
                : item
        );

        setCurrentData(newData);
        setData(newData);
        initialData.current = newData;

        if (selectedWorkspace) {
            localStorage.setItem(
                `workspace-${selectedWorkspace._id}-data`,
                JSON.stringify({ rows: newData, schema: localSchema })
            );
        }

        try {
            // Persist to backend
            await syncWorkspace({
                workspaceId: selectedWorkspace._id,
                changes: {
                    added: [],
                    updated: [{
                        _id: row._id,
                        data: updatedRowData
                    }],
                    deleted: []
                }
            });
        } catch (err) {
            console.error("Failed to sync status update", err);
        }
    };

    const handleStatusChange = (rowIndex: number, newStatus: string) => {
        if (disabled || !isEditable) return;
        const row = currentData[rowIndex];
        const oldStatus = row.data.Status;

        // Auto-reject if AI Score < 40
        const aiScore = parseFloat(row.data['AI Score']) || 0;
        if (aiScore > 0 && aiScore < 40 && oldStatus === 'New') {
            // Automatically set to Rejected and skip email
            updateStatusOnly(rowIndex, 'Rejected');
            return;
        }

        // If status is changing to any status except 'New', ask about sending email
        if (newStatus !== 'New' && oldStatus !== newStatus) {
            if (!row.data.Name || !row.data.Email) {
                alert("Please fill in the candidate's Name and Email before changing status.");
                return;
            }
            setSelectedCandidateForEmail({
                name: row.data.Name,
                email: row.data.Email,
                rowIndex,
                newStatus
            });
            setMailConsentInfo({
                open: true,
                onSend: () => {
                    setMailConsentInfo({ open: false });
                    setEmailComposerOpen(true);
                },
                onDontSend: () => {
                    updateStatusOnly(rowIndex, newStatus);
                    setMailConsentInfo({ open: false });
                }
            });
        } else {
            updateStatusOnly(rowIndex, newStatus);
        }
    };

    const handleInformedChange = (rowIndex: number, newValue: string) => {
        if (disabled || !isEditable) return;
        const row = currentData[rowIndex];

        // Simply update the Informed status locally without making API call
        // The email sending is handled by the EmailComposerDialog component
        const newData = currentData.map((item, i) =>
            i === rowIndex
                ? {
                    ...item,
                    data: { ...item.data, Informed: newValue },
                }
                : item
        );

        setCurrentData(newData);
        setData(newData);
        initialData.current = newData;

        // Save to localStorage
        // Save to localStorage
        if (selectedWorkspace) {
            localStorage.setItem(
                `workspace-${selectedWorkspace._id}-data`,
                JSON.stringify({ rows: newData, schema: localSchema })
            );
        }
    };

    const handleAddRow = () => {
        if (disabled || !isEditable) return;
        const newRow: any = { data: {}, isNew: true };
        schema.forEach((col) => {
            newRow.data[col.name] = ""; // Initialize with empty strings
        });
        const newData = [...currentData, newRow];
        setCurrentData(newData);
        setData(newData); // Notify parent
        if (selectedWorkspace) {
            localStorage.setItem(
                `workspace-${selectedWorkspace._id}-data`,
                JSON.stringify({ rows: newData, schema: localSchema })
            );
        }
    };

    const handleDeleteRows = () => {
        if (disabled || !isEditable) return;
        const newData = currentData.filter(
            (_: any, index: number) => !selectedRows.has(index)
        );
        setCurrentData(newData);
        setData(newData); // Notify parent
        if (selectedWorkspace) {
            localStorage.setItem(
                `workspace-${selectedWorkspace._id}-data`,
                JSON.stringify({ rows: newData, schema: localSchema })
            );
        }
        setSelectedRows(new Set());
    };

    const handleAddColumn = () => {
        if (disabled || !isEditable) return;
        const newColumnName = prompt("Enter new column name");
        if (newColumnName) {
            // Update local schema state
            const newColumn = { name: newColumnName, type: "text", isDefault: false };
            const newSchema = [...localSchema, newColumn];
            setLocalSchema(newSchema);

            // Update rows with new key
            const newData = currentData.map((row) => ({
                ...row,
                data: {
                    ...row.data,
                    [newColumnName]: "",
                },
            }));
            setCurrentData(newData);
            setData(newData); // Notify parent
            if (selectedWorkspace) {
                localStorage.setItem(
                    `workspace-${selectedWorkspace._id}-data`,
                    JSON.stringify({ rows: newData, schema: newSchema })
                );
            }
        }
    };

    const handleSync = async () => {
        if (disabled || !isEditable) return;

        const added = currentData.filter((row) => row.isNew);
        const updated = currentData.filter((row) => {
            const initialRow = initialData.current.find((r) => r._id === row._id);
            return (
                initialRow &&
                JSON.stringify(initialRow) !== JSON.stringify(row) &&
                !row.isNew
            );
        });
        const deleted = initialData.current.filter(
            (initialRow) => !currentData.some((row) => row._id === initialRow._id)
        );

        try {
            await syncWorkspace({
                workspaceId: selectedWorkspace?._id,
                changes: { added, updated, deleted },
                columns: localSchema // Send the current local schema to persist column changes
            });

            if (selectedWorkspace) {
                localStorage.removeItem(`workspace-${selectedWorkspace._id}-data`);
            }

            alert("Sync successful! The page will now reload to reflect the changes.");
            window.location.reload();

        } catch (error) {
            console.error("Sync failed:", error);
            alert("Sync failed. Please try again.");
        }
    };

    // Handle individual row selection
    const handleRowSelect = (rowIndex: number, checked: boolean) => {
        if (disabled) return;
        setSelectedRows((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(rowIndex);
            } else {
                newSet.delete(rowIndex);
            }
            return newSet;
        });
    };

    // Handle select all
    const handleSelectAll = (checked: boolean) => {
        if (disabled) return;
        if (checked) {
            setSelectedRows(new Set(currentData.map((_, index) => index)));
        } else {
            setSelectedRows(new Set());
        }
    };

    return (
        <div
            className={`flex flex-col h-[100%] min-w-0 ${disabled ? "opacity-50 pointer-events-none" : ""
                }`}
        >
            <WorkspaceToolbar
                workspaceId={workspaceId}
                workspaceName={workspaceName}
                jd={jd}
                onJdUpdate={onJdUpdate}
                routePrefix={routePrefix}
            />

            <WorkspaceActions
                onAddRow={handleAddRow}
                onAddColumn={handleAddColumn}
                onDeleteRows={handleDeleteRows}
                onSync={handleSync}
                isSynced={isSynced}
                selectedRowsCount={selectedRows.size}
                disabled={disabled}
                workspaceId={workspaceId}
                onRefreshData={onRefreshData}
            />

            {!isSynced && showSyncWarning && (
                <div className="fixed top-12  right-3 bg-yellow-100 border-l-3 border-yellow-500 text-yellow-700 p-3 rounded-md shadow-lg z-50">
                    <div className="flex justify-between items-start">
                        <div className="flex">
                            <div className="py-0.5">
                                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-3" />
                            </div>
                            <div>
                                <p className="font-bold text-xs">Unsynced Changes</p>
                                <p className="text-[0.65rem]">
                                    You have changes that have not been synced with the server.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSyncWarning(false)}
                            className="text-yellow-700 hover:text-yellow-900"
                        >
                            <span className="sr-only">Dismiss</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-auto min-h-0 scrollbar-light">
                <Table className="border-collapse w-full min-w-max table-fixed border-b">
                    <TableHeader className="sticky top-0 z-10 bg-sky-50 shadow-sm">
                        <TableRow className="h-8 hover:bg-transparent">
                            <TableHead className="w-[38px] p-0 text-center border-r h-8">
                                <input
                                    type="checkbox"
                                    className="translate-y-0.5"
                                    checked={currentData.length > 0 && selectedRows.size === currentData.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    disabled={disabled}
                                />
                            </TableHead>
                            {localSchema.map((col) => (
                                <TableHead
                                    key={col.name}
                                    className="relative border-r px-2 h-8 text-xs font-medium select-none group"
                                    style={{ width: columnWidths[col.name] }}
                                >
                                    <div className="flex items-center justify-between h-full">
                                        <span className="truncate">{col.name}</span>
                                        <div
                                            className="w-1 h-full absolute right-0 top-0 cursor-col-resize hover:bg-primary/50 group-hover:bg-primary/20"
                                            onMouseDown={(e) => handleMouseDown(col.name, e)}
                                        />
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.map((row, rowIndex) => (
                            <ContextMenu key={row._id || rowIndex}>
                                <ContextMenuTrigger asChild disabled={!isEditable}>
                                    <TableRow className="h-8 hover:bg-muted/50">
                                        <TableCell className="p-0 text-center border-r h-8">
                                            <input
                                                type="checkbox"
                                                className="translate-y-0.5"
                                                checked={selectedRows.has(rowIndex)}
                                                onChange={(e) => handleRowSelect(rowIndex, e.target.checked)}
                                                disabled={disabled}
                                            />
                                        </TableCell>
                                        {localSchema.map((col) => (
                                            <TableCell
                                                key={`${rowIndex}-${col.name}`}
                                                className="p-0 border-r h-8 relative"
                                                style={{ width: columnWidths[col.name] }}
                                            >
                                                {editingCell?.row === rowIndex &&
                                                    editingCell?.col === col.name ? (
                                                    <Input
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSaveEdit();
                                                            if (e.key === "Escape") {
                                                                setEditingCell(null);
                                                                setEditValue("");
                                                            }
                                                        }}
                                                        className="h-full w-full rounded-none border-0 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary px-2 text-xs"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full px-2 flex items-center">
                                                        {col.name === "Feedback" ? (
                                                            <FeedbackCell aiScore={parseFloat(row.data['AI Score'])} />
                                                        ) : col.name === "Status" ? (
                                                            <StatusCell
                                                                value={row.data[col.name]}
                                                                onChange={(val) => handleStatusChange(rowIndex, val)}
                                                                disabled={disabled || !isEditable}
                                                            />
                                                        ) : col.name === "Informed" ? (
                                                            <InformedCell
                                                                value={row.data[col.name]}
                                                                onChange={(val) => handleInformedChange(rowIndex, val)}
                                                                rowData={row.data}
                                                            />
                                                        ) : (
                                                            <TruncatedCell
                                                                content={row.data[col.name]}
                                                                onDoubleClick={() => handleDoubleClick(rowIndex, col.name, row.data[col.name])}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </ContextMenuTrigger>
                                {isEditable && (
                                    <ContextMenuContent>
                                        <ContextMenuLabel>Actions</ContextMenuLabel>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem
                                            onClick={() => {
                                                if (disabled) return;
                                                const newSet = new Set(selectedRows);
                                                newSet.add(rowIndex);
                                                setSelectedRows(newSet);
                                            }}
                                        >
                                            Select Row
                                        </ContextMenuItem>
                                        <ContextMenuItem
                                            className="text-destructive"
                                            onClick={() => {
                                                if (disabled) return;
                                                const newData = currentData.filter((_, i) => i !== rowIndex);
                                                setCurrentData(newData);
                                                setData(newData);
                                                if (selectedWorkspace) {
                                                    localStorage.setItem(
                                                        `workspace-${selectedWorkspace._id}-data`,
                                                        JSON.stringify(newData)
                                                    );
                                                }
                                            }}
                                        >
                                            Delete Row
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                )}
                            </ContextMenu>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mail Consent Dialog for Status Change */}
            <MailConsent
                open={mailConsentInfo.open}
                onOpenChange={(open: boolean) => setMailConsentInfo(prev => ({ ...prev, open }))}
                onSend={mailConsentInfo.onSend || (() => { })}
                onDontSend={mailConsentInfo.onDontSend || (() => { })}
            />

            {/* Email Composer Dialog */}
            {selectedCandidateForEmail && (
                <EmailComposerDialog
                    open={emailComposerOpen}
                    onOpenChange={setEmailComposerOpen}
                    candidateData={{
                        name: selectedCandidateForEmail.name,
                        email: selectedCandidateForEmail.email
                    }}
                    status={selectedCandidateForEmail.newStatus as any}
                    onEmailSent={async () => {
                        await sendMailAndUpdate(selectedCandidateForEmail.rowIndex, selectedCandidateForEmail.newStatus);
                        setEmailComposerOpen(false);
                    }}
                />
            )}
        </div>
    );
}
