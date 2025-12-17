"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Pencil, Trash2, Plus, FileText, Settings, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/utils/permissions";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ShareWorkspaceDialog } from "@/components/dialogs/share-workspace-dialog";
import { Workspace } from "@/features/workspace/services/workspace-service";
import { useWorkspaceForms } from "@/features/workspace/hooks/use-workspaces";
import { useAuth } from "@/lib/auth-context";

interface WorkspaceItemProps {
    workspace: Workspace;
    isSelected: boolean;
    onRename: (workspace: Workspace) => void;
    onDelete: (workspace: Workspace) => void;
    onSelect: (workspace: Workspace) => void;
}

export function WorkspaceItem({
    workspace,
    isSelected,
    onRename,
    onDelete,
    onSelect,
}: WorkspaceItemProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch forms only when expanded
    const { data: forms = [], isLoading: isLoadingForms } = useWorkspaceForms(workspace._id, isExpanded);

    const toggleExpansion = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    // Helper function to get user's role in a workspace
    const getUserRole = (workspace: Workspace): Role | null => {
        if (!user?.id || !workspace.members) return null;

        // Check if user is the owner (userId field)
        if (workspace.userId === user.id) return 'owner';

        const member = workspace.members.find((m) => {
            const memberId = typeof m.user === 'string' ? m.user : m.user._id;
            return memberId === user.id;
        });
        return member?.role || null;
    };

    // Helper function to check if user can perform an action
    const canPerformAction = (workspace: Workspace, requiredRoles: string[]): boolean => {
        const role = getUserRole(workspace);
        return role ? requiredRoles.includes(role) : false;
    };

    // Check if user has permission to see context menu (not a viewer)
    const canShowContextMenu = canPerformAction(workspace, ["owner", "admin", "editor"]);

    // Check if workspace is PM type (hide Forms/Documents for PM)
    const isPMWorkspace = workspace.mainFocus === 'product-management' || workspace.mainFocus === 'project-management';

    return (
        <div>
            <ContextMenu>
                <ContextMenuTrigger disabled={!canShowContextMenu}>
                    <div className="flex items-center group">
                        <button
                            onClick={toggleExpansion}
                            className="p-1 hover:bg-muted rounded flex-shrink-0"
                        >
                            <ChevronDown
                                className={cn(
                                    "h-3 w-3 transform transition-transform",
                                    isExpanded ? "rotate-180" : ""
                                )}
                            />
                        </button>
                        <Link
                            href={`/${workspace.mainFocus === 'product-management' || workspace.mainFocus === 'project-management' ? 'pm' : 'hr'}/workspace/${workspace._id}`}
                            onClick={() => onSelect(workspace)}
                            className={cn(
                                "flex-1 rounded-md px-2 py-1.5 hover:bg-muted block",
                                isSelected ? "bg-muted font-medium" : ""
                            )}
                        >
                            {workspace.name}
                        </Link>
                    </div>
                </ContextMenuTrigger>
                {canShowContextMenu && (
                    <ContextMenuContent>
                        {/* Settings - owner, admin, editor */}
                        {canPerformAction(workspace, ["owner", "admin", "editor"]) && (
                            <ContextMenuItem onClick={() => router.push(`/${workspace.mainFocus === 'product-management' || workspace.mainFocus === 'project-management' ? 'pm' : 'hr'}/workspace/${workspace._id}/settings`)}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </ContextMenuItem>
                        )}

                        {/* Share - owner, admin */}
                        {canPerformAction(workspace, ["owner", "admin"]) && (
                            <ShareWorkspaceDialog workspace={workspace} canManageMembers={true}>
                                <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                </ContextMenuItem>
                            </ShareWorkspaceDialog>
                        )}

                        {/* Add Form - owner, admin, editor (HR workspaces only) */}
                        {!isPMWorkspace && canPerformAction(workspace, ["owner", "admin", "editor"]) && (
                            <ContextMenuItem
                                onClick={() => {
                                    window.location.href = `/${workspace.mainFocus === 'product-management' || workspace.mainFocus === 'project-management' ? 'pm' : 'hr'}/workspace/${workspace._id}/forms`;
                                }}
                                className="text-blue-600"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Form
                            </ContextMenuItem>
                        )}
                        {/* Documents - all roles (HR workspaces only) */}
                        {!isPMWorkspace && (
                            <ContextMenuItem
                                onClick={() => {
                                    window.location.href = `/${workspace.mainFocus === 'product-management' || workspace.mainFocus === 'project-management' ? 'pm' : 'hr'}/workspace/${workspace._id}/documents`;
                                }}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Documents
                            </ContextMenuItem>
                        )}
                        {/* Rename - owner, admin */}
                        {canPerformAction(workspace, ["owner", "admin"]) && (
                            <ContextMenuItem onClick={() => onRename(workspace)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Rename
                            </ContextMenuItem>
                        )}
                        {/* Delete - owner only */}
                        {canPerformAction(workspace, ["owner"]) && (
                            <ContextMenuItem
                                className="text-red-600"
                                onClick={() => onDelete(workspace)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Workspace
                            </ContextMenuItem>
                        )}
                    </ContextMenuContent>
                )}
            </ContextMenu>

            {/* Nested Forms List */}
            {isExpanded && (
                <div className="pl-6 pt-1 space-y-0.5">
                    {isLoadingForms ? (
                        <p className="px-2 py-1 text-[0.65rem] text-muted-foreground">
                            Loading forms...
                        </p>
                    ) : forms.length > 0 ? (
                        forms.map((form: any) => (
                            <Link
                                key={form._id}
                                href={`/${workspace.mainFocus === 'product-management' || workspace.mainFocus === 'project-management' ? 'pm' : 'hr'}/workspace/${workspace._id}/forms`}
                                className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted text-[0.65rem]"
                            >
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                {form.title}
                            </Link>
                        ))
                    ) : (
                        canPerformAction(workspace, ["owner", "admin", "editor"]) && (
                            <Link
                                href={`/${workspace.mainFocus === 'product-management' || workspace.mainFocus === 'project-management' ? 'pm' : 'hr'}/workspace/${workspace._id}/forms`}
                                className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-blue-50 hover:text-blue-700 text-[0.65rem] font-medium transition-colors group"
                            >
                                <Plus className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                <span>Create Form</span>
                            </Link>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
