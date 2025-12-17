"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
// import apiClient from "@/utils/api.client"; // Removed
import { Role } from "@/utils/permissions";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { CreateWorkspaceDialog } from "@/components/dialogs/create-workspace-dialog";
import { ShareWorkspaceDialog } from "@/components/dialogs/share-workspace-dialog";

import { WorkspaceItem } from "./workspace-item";
import { useUpdateWorkspace, useDeleteWorkspace } from "@/features/workspace/hooks/use-workspaces";
import { Workspace } from "@/features/workspace/services/workspace-service";

const initialSections = [
  {
    title: "Queues",
    items: [
      { label: "All open", active: true },
      { label: "Assigned to me" },
      { label: "Unassigned" },
      { label: "View all queues" },
    ],
  },
  {
    title: "Views",
    items: [
      { label: "Reports" },
      { label: "Knowledge Base" },
      { label: "Customers" },
      { label: "Channels" },
      { label: "Raise a request" },
    ],
  },
  {
    title: "Recommended",
    items: [
      { label: "Create Workspace", icon: "plus", action: "create-workspace" },
    ],
  },
];

export function SideNav() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    workspaces,
    ownedWorkspaces,
    sharedWorkspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    isLoading,
    canCreateWorkspace,
    workspaceCount,
    maxWorkspaces,
  } = useWorkspace();

  const { mutateAsync: updateWorkspace } = useUpdateWorkspace();
  const { mutateAsync: deleteWorkspace } = useDeleteWorkspace();

  const [isOwnWorkspacesOpen, setIsOwnWorkspacesOpen] = useState(true);
  const [isSharedWorkspacesOpen, setIsSharedWorkspacesOpen] = useState(true);

  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(
    null
  );
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateWorkspaceDialog, setShowCreateWorkspaceDialog] =
    useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingWorkspaceId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingWorkspaceId]);

  const handleWorkspaceClick = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
  };

  const toggleOwnWorkspaces = () => {
    setIsOwnWorkspacesOpen(!isOwnWorkspacesOpen);
  };

  const toggleSharedWorkspaces = () => {
    setIsSharedWorkspacesOpen(!isSharedWorkspacesOpen);
  };

  const handleRenameClick = (workspace: Workspace) => {
    setEditingWorkspaceId(workspace._id);
    setNewWorkspaceName(workspace.name);
  };

  const handleRenameSubmit = async () => {
    if (!editingWorkspaceId || !user) return;

    try {
      await updateWorkspace({ id: editingWorkspaceId, data: { name: newWorkspaceName } });

      if (selectedWorkspace?._id === editingWorkspaceId) {
        // Optimistic update handled by React Query
      }
      toast.success(`Workspace renamed to "${newWorkspaceName}"`);
    } catch (error) {
      console.error("Failed to rename workspace:", error);
      toast.error("Failed to rename workspace.");
    } finally {
      setEditingWorkspaceId(null);
      setShowRenameDialog(false);
    }
  };

  const handleDeleteClick = (workspace: Workspace) => {
    setWorkspaceToDelete(workspace);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workspaceToDelete) return;

    try {
      await deleteWorkspace(workspaceToDelete._id);

      // If we deleted the currently selected workspace, redirect to dashboard
      if (selectedWorkspace?._id === workspaceToDelete._id) {
        router.push('/dashboard');
      }

      toast.success(
        `Workspace "${workspaceToDelete.name}" deleted successfully!`
      );
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      toast.error("Failed to delete workspace.");
    } finally {
      setShowDeleteDialog(false);
      setWorkspaceToDelete(null);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowRenameDialog(true);
    } else if (e.key === "Escape") {
      setEditingWorkspaceId(null);
    }
  };

  const handleInputBlur = () => {
    // Timeout to allow click on dialog to register
    setTimeout(() => {
      if (!showRenameDialog) {
        setShowDiscardDialog(true);
      }
    }, 100);
  };

  return (
    <>
      <Toaster richColors />
      <nav className="text-xs p-2 space-y-4 w-64 border-r border-slate-200 h-full bg-slate-50/50 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {initialSections.map((section) => (
            <div key={section.title} className="mb-4">
              <div className="px-2 pb-2 text-[0.7rem] font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item: any) => (
                  <li key={item.label}>
                    {item.action === "create-workspace" ? (
                      <button
                        onClick={() =>
                          canCreateWorkspace && setShowCreateWorkspaceDialog(true)
                        }
                        disabled={!canCreateWorkspace}
                        title={
                          !canCreateWorkspace
                            ? `Workspace limit reached (${workspaceCount}/${maxWorkspaces})`
                            : "Create new workspace"
                        }
                        className={cn(
                          "w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all duration-200",
                          canCreateWorkspace
                            ? "hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-medium cursor-pointer group"
                            : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                          canCreateWorkspace ? "bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600" : "bg-slate-100"
                        )}>
                          <Plus className="h-3.5 w-3.5" />
                        </div>
                        {item.label}
                      </button>
                    ) : item.label === "Reports" ? (
                      <Link
                        href="/reports"
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-200",
                          item.active
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                        aria-current={item.active ? "page" : undefined}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors",
                          item.active ? "bg-blue-500" : "bg-slate-300"
                        )} />
                        {item.label}
                      </Link>
                    ) : item.label === "Assigned to me" ? (
                      <Link
                        href="/workspace/shared-with-me"
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-200",
                          item.active
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                        aria-current={item.active ? "page" : undefined}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors",
                          item.active ? "bg-blue-500" : "bg-slate-300"
                        )} />
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        href="#"
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-200",
                          item.active
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                        aria-current={item.active ? "page" : undefined}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors",
                          item.active ? "bg-blue-500" : "bg-slate-300"
                        )} />
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              {section.title === "Views" && (
                <>
                  {/* Own Workspaces Section */}
                  <div className="mt-4">
                    <button
                      onClick={toggleOwnWorkspaces}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 transition-colors group"
                    >
                      <span className="font-semibold text-slate-700 group-hover:text-slate-900">Own Workspaces</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transform transition-transform duration-200",
                          isOwnWorkspacesOpen ? "rotate-180" : ""
                        )}
                      />
                    </button>
                    {isOwnWorkspacesOpen && (
                      <div className="pl-2 pt-1">
                        {isLoading ? (
                          <p className="px-2 py-1.5 text-xs text-slate-400 italic">
                            Loading...
                          </p>
                        ) : ownedWorkspaces.length > 0 ? (
                          <ul className="space-y-0.5">
                            {ownedWorkspaces.map((workspace) => (
                              <li key={workspace._id}>
                                {editingWorkspaceId === workspace._id ? (
                                  <Input
                                    ref={inputRef}
                                    value={newWorkspaceName}
                                    onChange={(e) =>
                                      setNewWorkspaceName(e.target.value)
                                    }
                                    onKeyDown={handleInputKeyDown}
                                    onBlur={handleInputBlur}
                                    className="h-7 text-xs"
                                  />
                                ) : (
                                  <WorkspaceItem
                                    workspace={workspace}
                                    isSelected={selectedWorkspace?._id === workspace._id}
                                    onRename={handleRenameClick}
                                    onDelete={handleDeleteClick}
                                    onSelect={handleWorkspaceClick}
                                  />
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="px-2 py-1.5 text-xs text-slate-400 italic">
                            No own workspaces.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Shared Workspaces Section */}
                  <div className="mt-2">
                    <button
                      onClick={toggleSharedWorkspaces}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 transition-colors group"
                    >
                      <span className="font-semibold text-slate-700 group-hover:text-slate-900">Shared Workspaces</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transform transition-transform duration-200",
                          isSharedWorkspacesOpen ? "rotate-180" : ""
                        )}
                      />
                    </button>
                    {isSharedWorkspacesOpen && (
                      <div className="pl-2 pt-1">
                        {isLoading ? (
                          <p className="px-2 py-1.5 text-xs text-slate-400 italic">
                            Loading...
                          </p>
                        ) : sharedWorkspaces.length > 0 ? (
                          <ul className="space-y-0.5">
                            {sharedWorkspaces.map((workspace) => (
                              <li key={workspace._id}>
                                <WorkspaceItem
                                  workspace={workspace}
                                  isSelected={selectedWorkspace?._id === workspace._id}
                                  onRename={handleRenameClick}
                                  onDelete={handleDeleteClick}
                                  onSelect={handleWorkspaceClick}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="px-2 py-1.5 text-xs text-slate-400 italic">
                            No shared workspaces.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Workspace Category Badge */}
        {selectedWorkspace && (
          <div className="mt-auto px-2 pb-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm",
              (selectedWorkspace.mainFocus === 'product-management' || selectedWorkspace.mainFocus === 'project-management')
                ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                : "bg-emerald-50 border-emerald-100 text-emerald-700"
            )}>
              <div className={cn(
                "p-1.5 rounded-md",
                (selectedWorkspace.mainFocus === 'product-management' || selectedWorkspace.mainFocus === 'project-management')
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-emerald-100 text-emerald-600"
              )}>
                {(selectedWorkspace.mainFocus === 'product-management' || selectedWorkspace.mainFocus === 'project-management')
                  ? <Clock className="w-4 h-4" />
                  : <Users className="w-4 h-4" />
                }
              </div>
              <div className="flex flex-col">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider opacity-70">Workspace</span>
                <span className="text-xs font-bold">
                  {(selectedWorkspace.mainFocus === 'product-management' || selectedWorkspace.mainFocus === 'project-management')
                    ? "Product Management"
                    : "Human Resource"
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Rename Confirmation Dialog */}
      <AlertDialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rename this workspace to &quot;
              {newWorkspaceName}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingWorkspaceId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRenameSubmit}>
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to discard them or continue
              editing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDiscardDialog(false);
                inputRef.current?.focus();
              }}
            >
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setEditingWorkspaceId(null);
                setShowDiscardDialog(false);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the workspace named
              &quot;{workspaceToDelete?.name}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog
        open={showCreateWorkspaceDialog}
        onOpenChange={setShowCreateWorkspaceDialog}
      />
    </>
  );
}
