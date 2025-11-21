"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { AddCandidateDialog } from "@/components/dialogs/add-candidate-dialog";
import { useWorkspace } from "@/lib/workspace-context";

interface WorkspaceActionsProps {
    onAddRow: () => void;
    onAddColumn: () => void;
    onDeleteRows: () => void;
    onSync: () => void;
    isSynced: boolean;
    selectedRowsCount: number;
    disabled: boolean;
    workspaceId: string;
    onRefreshData?: () => void;
}

export function WorkspaceActions({
    onAddRow,
    onAddColumn,
    onDeleteRows,
    onSync,
    isSynced,
    selectedRowsCount,
    disabled,
    workspaceId,
    onRefreshData,
}: WorkspaceActionsProps) {
    const { permissions } = useWorkspace();

    // If user is a viewer (cannot edit), hide these actions
    if (!permissions.canEditContent) {
        return null;
    }

    return (
        <div className="flex gap-1.5 p-2 border-b bg-card flex-shrink-0">
            <Button
                onClick={onAddRow}
                size="sm"
                className="gap-1.5 h-7 px-2 text-xs"
                disabled={disabled}
            >
                <Plus className="size-3" />
                Add Row
            </Button>
            <Button
                onClick={onAddColumn}
                size="sm"
                variant="outline"
                className="gap-1.5 h-7 px-2 text-xs"
                disabled={disabled}
            >
                <Plus className="size-3" />
                Add Column
            </Button>
            <Button
                onClick={onDeleteRows}
                size="sm"
                variant="destructive"
                className="gap-1.5 h-7 px-2 text-xs"
                disabled={selectedRowsCount === 0 || disabled}
            >
                <Trash2 className="size-3" />
                Delete Row{selectedRowsCount > 1 ? "s" : ""}
            </Button>
            <Button
                onClick={onSync}
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
                    workspaceId={workspaceId}
                    onCandidatesAdded={onRefreshData}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}
