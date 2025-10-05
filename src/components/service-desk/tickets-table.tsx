"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, RefreshCw, AlertTriangle, X } from "lucide-react";
import apiClient from "@/utils/api.client";
import { AddCandidateDialog } from "@/components/dialogs/add-candidate-dialog";

// Status options with colors
const STATUS_OPTIONS = [
  { value: "New", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "Under Review", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "Shortlisted", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "Hired", color: "bg-green-100 text-green-700 border-green-200" },
];

// Get feedback based on AI score
function getFeedbackFromScore(score: number): { text: string; color: string } {
  if (score >= 90) {
    return { 
      text: "Excellent match, highly recommended", 
      color: "bg-green-100 text-green-800 border-green-300" 
    };
  } else if (score >= 75) {
    return { 
      text: "Good match, recommended", 
      color: "bg-blue-100 text-blue-800 border-blue-300" 
    };
  } else if (score >= 60) {
    return { 
      text: "Moderate match, consider", 
      color: "bg-yellow-100 text-yellow-800 border-yellow-300" 
    };
  } else if (score >= 40) {
    return { 
      text: "Weak match, gaps in requirements", 
      color: "bg-orange-100 text-orange-800 border-orange-300" 
    };
  } else {
    return { 
      text: "Poor match, not recommended", 
      color: "bg-red-100 text-red-800 border-red-300" 
    };
  }
}

// Feedback Cell Component
function FeedbackCell({ aiScore }: { aiScore: number }) {
  const feedback = getFeedbackFromScore(aiScore || 0);
  
  return (
    <div className={`px-2 py-1 rounded border text-xs font-medium ${feedback.color}`}>
      {feedback.text}
    </div>
  );
}

// Status Cell Component
function StatusCell({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
}) {
  const currentStatus = STATUS_OPTIONS.find(opt => opt.value === value) || STATUS_OPTIONS[0];
  
  return (
    <Select value={value || "New"} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger 
        className={`h-7 text-xs border ${currentStatus.color} font-medium`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="text-xs"
          >
            <div className={`px-2 py-1 rounded ${option.color}`}>
              {option.value}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Helper function to format cell content with proper spacing
function formatCellContent(content: any): string {
  // Handle null, undefined, or empty values
  if (content === null || content === undefined || content === "") return "";
  
  // Convert to string if it's not already
  const contentStr = String(content);
  
  // Handle arrays stored as strings (e.g., "skill1,skill2,skill3")
  if (contentStr.includes(",")) {
    return contentStr.split(",").map(item => item.trim()).join(", ");
  }
  
  // Handle JSON arrays
  try {
    const parsed = JSON.parse(contentStr);
    if (Array.isArray(parsed)) {
      return parsed.join(", ");
    }
  } catch (e) {
    // Not JSON, continue with string
  }
  
  return contentStr;
}

// Truncated Cell Component with Popover
function TruncatedCell({
  content,
  onDoubleClick,
}: {
  content: any;
  onDoubleClick?: () => void;
}) {
  const formattedContent = formatCellContent(content);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="cursor-pointer hover:text-primary hover:underline truncate w-full text-left"
          onDoubleClick={onDoubleClick}
          title={formattedContent}
        >
          {formattedContent}
        </div>
      </PopoverTrigger>
      <PopoverContent className="max-w-md p-4" side="top">
        <div className="text-sm whitespace-pre-wrap break-words">{formattedContent}</div>
      </PopoverContent>
    </Popover>
  );
}

import { useWorkspace } from "@/lib/workspace-context";
import { useIsMobile } from "@/hooks/use-mobile";

export function TicketsTable({
  tickets,
  schema,
  setData,
  onRefreshData,
}: {
  tickets: any[];
  schema: any[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  onRefreshData?: () => void;
}) {
  const { selectedWorkspace } = useWorkspace();
  const disabled = !selectedWorkspace;
  const isMobile = useIsMobile();

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

  // Initialize initialData and currentData once when component mounts with the original data
  useEffect(() => {
    if (selectedWorkspace && !initialData.current.length) {
      // First check if there's local storage data
      const localData = localStorage.getItem(
        `workspace-${selectedWorkspace._id}-data`
      );
      if (localData) {
        const parsedData = JSON.parse(localData);
        setData(parsedData);
        initialData.current = [...parsedData]; // Store original data
        setCurrentData(parsedData);
      } else {
        // Use the tickets prop data as the baseline
        initialData.current = [...tickets]; // Store original data
        setCurrentData(tickets);
      }
    }
  }, [selectedWorkspace]); // Only run when workspace changes, not tickets

  // Track if there are uncommitted changes using a ref
  const hasUncommittedChangesRef = useRef(false);

  // Update our ref whenever currentData changes to track if we have uncommitted changes
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
    
    hasUncommittedChangesRef.current = added || updated || deleted;
  }, [currentData, initialData]);

  // Update currentData when tickets prop changes from parent (after sync or initial load)
  // But only if there are no uncommitted local changes
  useEffect(() => {
    // Only update from parent if there are no local uncommitted changes
    if (!hasUncommittedChangesRef.current) {
      setCurrentData(tickets);
      // After successful sync, update initialData to match the fresh data from parent
      if (initialData.current.length !== tickets.length || 
          JSON.stringify(initialData.current) !== JSON.stringify(tickets)) {
        initialData.current = [...tickets];
      }
    }
  }, [tickets]);

  useEffect(() => {
    const checkSyncStatus = () => {
      // Only check sync status if initialData has been properly initialized
      if (initialData.current.length === 0) {
        setIsSynced(true);
        setShowSyncWarning(false);
        return;
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

      if (added || updated || deleted) {
        setIsSynced(false);
        setShowSyncWarning(true);
      } else {
        setIsSynced(true);
        setShowSyncWarning(false);
      }
    };

    checkSyncStatus();
  }, [currentData]);

  useEffect(() => {
    const initialWidths: Record<string, number> = { checkbox: 38 };
    schema.forEach(col => {
      // Set different default widths based on column type
      if (col.name === "Feedback") {
        initialWidths[col.name] = 200; // Wider for feedback text
      } else if (col.name === "Status") {
        initialWidths[col.name] = 120; // Wider for status dropdown
      } else if (col.name === "Notes") {
        initialWidths[col.name] = 150; // Wider for notes
      } else {
        initialWidths[col.name] = 90; // Default width reduced by 25%
      }
    });
    setColumnWidths(initialWidths);
  }, [schema]);

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
    if (disabled) return;
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
        JSON.stringify(newData)
      );
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleStatusChange = (rowIndex: number, newStatus: string) => {
    if (disabled) return;
    const newData = tickets.map((item, i) =>
      i === rowIndex
        ? {
            ...item,
            data: { ...item.data, Status: newStatus },
          }
        : item
    );
    setData(newData);
    if (selectedWorkspace) {
      localStorage.setItem(
        `workspace-${selectedWorkspace._id}-data`,
        JSON.stringify(newData)
      );
    }
  };

  const handleAddRow = () => {
    if (disabled) return;
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
        JSON.stringify(newData)
      );
    }
  };

  const handleDeleteRows = () => {
    if (disabled) return;
    const newData = currentData.filter(
      (_: any, index: number) => !selectedRows.has(index)
    );
    setCurrentData(newData);
    setData(newData); // Notify parent
    if (selectedWorkspace) {
      localStorage.setItem(
        `workspace-${selectedWorkspace._id}-data`,
        JSON.stringify(newData)
      );
    }
    setSelectedRows(new Set());
  };

  const handleAddColumn = () => {
    if (disabled) return;
    const newColumnName = prompt("Enter new column name");
    if (newColumnName) {
      const newColumn = { name: newColumnName, type: "text", isDefault: false };
      // This component doesn't own the schema, it should be passed up.
      // For now, let's update the local filteredSchema state to make it appear.
      setFilteredSchema([...filteredSchema, newColumn]);

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
          JSON.stringify(newData)
        );
      }
    }
  };

  const handleSync = async () => {
    if (disabled) return;

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
      await apiClient.post(`/api/workspaces/${selectedWorkspace?._id}/sync`, {
        added,
        updated,
        deleted,
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
      className={`flex flex-col h-full min-w-0 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex gap-1.5 p-2 border-b bg-card flex-shrink-0">
        <Button
          onClick={handleAddRow}
          size="sm"
          className="gap-1.5 h-7 px-2 text-xs"
          disabled={disabled}
        >
          <Plus className="size-3" />
          Add Row
        </Button>
        <Button
          onClick={handleAddColumn}
          size="sm"
          variant="outline"
          className="gap-1.5 h-7 px-2 text-xs"
          disabled={disabled}
        >
          <Plus className="size-3" />
          Add Column
        </Button>
        <Button
          onClick={handleDeleteRows}
          size="sm"
          variant="destructive"
          className="gap-1.5 h-7 px-2 text-xs"
          disabled={selectedRows.size === 0 || disabled}
        >
          <Trash2 className="size-3" />
          Delete Row{selectedRows.size > 1 ? "s" : ""}
        </Button>
        <Button
          onClick={handleSync}
          size="sm"
          variant={isSynced ? "outline" : "default"}
          className={`gap-1.5 h-7 px-2 text-xs ${!isSynced ? "animate-pulse" : ""}`}
          disabled={disabled || isSynced}
        >
          <RefreshCw className="size-3" />
          Sync
        </Button>
        <div className="ml-auto">
          <AddCandidateDialog
            workspaceId={selectedWorkspace?._id || ""}
            onCandidatesAdded={onRefreshData}
            disabled={disabled}
          />
        </div>
      </div>

      {!isSynced && showSyncWarning && (
        <div className="fixed top-12 right-3 bg-yellow-100 border-l-3 border-yellow-500 text-yellow-700 p-3 rounded-md shadow-lg z-50">
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
            <button onClick={() => setShowSyncWarning(false)} className="ml-3">
              <X className="h-4 w-4 text-yellow-700" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-light">
          <Table 
            style={{ 
              tableLayout: 'fixed',
              width: Object.values(columnWidths).reduce((sum, width) => sum + width, 0) + 'px'
            }}
          >
          <TableHeader>
            <TableRow>
              <TableHead
                className="border-r bg-blue-100 relative whitespace-nowrap"
                style={{
                  width: columnWidths.checkbox,
                  minWidth: columnWidths.checkbox,
                  maxWidth: columnWidths.checkbox,
                }}
              >
                <Checkbox
                  aria-label="Select all"
                  checked={
                    selectedRows.size === currentData.length && currentData.length > 0
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked === true)
                  }
                />
                {!isMobile && <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("checkbox", e)}
                />}
              </TableHead>
              {schema.map((col, colIndex) => (
                <TableHead
                  key={`${col.name}-${colIndex}`}
                  className="border-r bg-blue-100 relative whitespace-nowrap"
                  style={{
                    width: columnWidths[col.name],
                    minWidth: columnWidths[col.name],
                    maxWidth: columnWidths[col.name],
                  }}
                >
                  {col.name}
                  {!isMobile && <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                    onMouseDown={(e) => handleMouseDown(col.name, e)}
                  />}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={schema.length + 1} 
                  className="h-48 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm text-muted-foreground">There are no candidates in this workspace yet.</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Click "Add Row" to add candidates manually or approve them from the workspace form.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((row, rowIndex) => (
                <TableRow
                  key={row._id || rowIndex}
                  className="hover:bg-primary/5"
                >
                  <TableCell
                    className="border-r bg-muted/30 cursor-pointer"
                    style={{ 
                      width: columnWidths.checkbox,
                      minWidth: columnWidths.checkbox,
                      maxWidth: columnWidths.checkbox,
                    }}
                    onClick={() =>
                      handleRowSelect(rowIndex, !selectedRows.has(rowIndex))
                    }
                  >
                    <Checkbox
                      aria-label={`Select row ${rowIndex}`}
                      checked={selectedRows.has(rowIndex)}
                      onCheckedChange={(checked) =>
                        handleRowSelect(rowIndex, checked === true)
                      }
                    />
                  </TableCell>
                  {schema.map((col, colIndex) => (

<TableCell
                      key={`${col.name}-${colIndex}`}
                      className="border-r bg-background overflow-hidden whitespace-nowrap"
                      style={{
                        width: columnWidths[col.name],
                        minWidth: columnWidths[col.name],
                        maxWidth: columnWidths[col.name],
                      }}
                    >
                      {col.name === "Status" ? (
                        <StatusCell
                          value={row.data[col.name] || "New"}
                          onChange={(newStatus) => handleStatusChange(rowIndex, newStatus)}
                          disabled={disabled}
                        />
                      ) : col.name === "Feedback" ? (
                        <FeedbackCell aiScore={row.data["AI Score"] || 0} />
                      ) : editingCell?.row === rowIndex &&
                        editingCell?.col === col.name ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                          autoFocus
                          className="h-7"
                        />
                      ) : (
                        <TruncatedCell
                          content={row.data[col.name]}
                          onDoubleClick={() =>
                            handleDoubleClick(
                              rowIndex,
                              col.name,
                              row.data[col.name]
                            )
                          }
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
