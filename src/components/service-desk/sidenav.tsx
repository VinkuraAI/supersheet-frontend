"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Pencil, Trash2, Plus, FileText } from "lucide-react"
import { ChevronDown, Pencil, Trash2, Plus, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import apiClient from "@/utils/api.client"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useWorkspace } from "@/lib/workspace-context"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { CreateWorkspaceDialog } from "@/components/dialogs/create-workspace-dialog"

interface Workspace {
  _id: string
  name: string
  userId: string
}

interface WorkspaceForm {
  _id: string
  title: string
  workspaceId: string
}

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
        items: [{ label: "Create Workspace", icon: "plus", action: "create-workspace" }],
    },
]

export function SideNav() {
  const router = useRouter();
  const { user } = useAuth();
  const { workspaces, setWorkspaces, selectedWorkspace, setSelectedWorkspace, isLoading } = useWorkspace();
  const [isWorkspacesOpen, setIsWorkspacesOpen] = useState(true)
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set())
  const [workspaceForms, setWorkspaceForms] = useState<Record<string, WorkspaceForm[]>>({})
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null)
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCreateWorkspaceDialog, setShowCreateWorkspaceDialog] = useState(false)
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingWorkspaceId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingWorkspaceId])

  // Fetch forms for a workspace when it's expanded
  const fetchWorkspaceForms = async (workspaceId: string) => {
    if (workspaceForms[workspaceId]) return; // Already fetched

    try {
      const response = await apiClient.get(`/api/workspaces/${workspaceId}/forms`);
      setWorkspaceForms(prev => ({
        ...prev,
        [workspaceId]: response.data || []
      }));
    } catch (error) {
      console.error(`Failed to fetch forms for workspace ${workspaceId}:`, error);
      setWorkspaceForms(prev => ({
        ...prev,
        [workspaceId]: []
      }));
    }
  };

  const toggleWorkspaceExpansion = (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking chevron
    
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
      fetchWorkspaceForms(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const handleWorkspaceClick = (workspace: Workspace, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedWorkspace(workspace);
  };

  const handleFormClick = (workspaceId: string, formId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/workspace/${workspaceId}/forms`);
  };

  const toggleWorkspaces = () => {
    setIsWorkspacesOpen(!isWorkspacesOpen)
  }

  const handleRenameClick = (workspace: Workspace) => {
    setEditingWorkspaceId(workspace._id)
    setNewWorkspaceName(workspace.name)
  }

  const handleRenameSubmit = async () => {
    if (!editingWorkspaceId || !user) return

    try {
      await apiClient.put(`/api/workspaces/${editingWorkspaceId}`, {
        name: newWorkspaceName,
        userId: user.id,
      })
      setWorkspaces(
        workspaces.map((w) =>
          w._id === editingWorkspaceId ? { ...w, name: newWorkspaceName } : w
        )
      )
      if (selectedWorkspace?._id === editingWorkspaceId) {
        setSelectedWorkspace({ ...selectedWorkspace, name: newWorkspaceName });
      }
      toast.success(`Workspace renamed to "${newWorkspaceName}"`);
    } catch (error) {
      console.error("Failed to rename workspace:", error)
      toast.error("Failed to rename workspace.");
    } finally {
      setEditingWorkspaceId(null)
      setShowRenameDialog(false)
    }
  }

  const handleDeleteClick = (workspace: Workspace) => {
    setWorkspaceToDelete(workspace);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workspaceToDelete) return;

    try {
      await apiClient.delete(`/api/workspaces/${workspaceToDelete._id}`);
      const newWorkspaces = workspaces.filter((w) => w._id !== workspaceToDelete._id);
      setWorkspaces(newWorkspaces);

      if (selectedWorkspace?._id === workspaceToDelete._id) {
        setSelectedWorkspace(newWorkspaces[0] || null);
      }
      
      toast.success(`Workspace "${workspaceToDelete.name}" deleted successfully!`);
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
      e.preventDefault()
      setShowRenameDialog(true)
    } else if (e.key === "Escape") {
        setEditingWorkspaceId(null)
    }
  }

  const handleInputBlur = () => {
    // Timeout to allow click on dialog to register
    setTimeout(() => {
        if (!showRenameDialog) {
            setShowDiscardDialog(true)
        }
    }, 100)
  }

  return (
    <>
      <Toaster richColors />
      <nav className="text-xs">
        {initialSections.map((section) => (
          <div key={section.title} className="mb-2">
            <div className="px-1.5 pb-0.5 text-[0.65rem] font-medium text-muted-foreground">
              {section.title}
            </div>
            <ul className="space-y-0">
              {section.items.map((item: any) => (
                <li key={item.label}>
                  {item.action === "create-workspace" ? (
                    <button
                      onClick={() => setShowCreateWorkspaceDialog(true)}
                      className={cn(
                        "w-full flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-muted text-left transition-colors",
                        "hover:bg-blue-50 hover:text-blue-700 font-medium"
                      )}
                    >
                      <Plus className="h-3 w-3" />
                      {item.label}
                    </button>
                  ) : (
                    <a
                      href="#"
                      className={cn(
                        "block rounded-md px-1.5 py-1 hover:bg-muted",
                        item.active ? "bg-muted font-medium" : ""
                      )}
                      aria-current={item.active ? "page" : undefined}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            {section.title === "Views" && (
              <div className="mt-1">
                <button
                  onClick={toggleWorkspaces}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-muted"
                >
                  <span>Workspaces</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transform transition-transform",
                      isWorkspacesOpen ? "rotate-180" : ""
                    )}
                  />
                </button>
                {isWorkspacesOpen && (
                  <div className="pl-4 pt-1">
                    {isLoading ? (
                      <p className="px-2 py-1.5 text-xs text-muted-foreground">Loading...</p>
                    ) : workspaces.length > 0 ? (
                      <ul className="space-y-0.5">
                        {workspaces.map((workspace) => (
                          <li key={workspace._id}>
                            {editingWorkspaceId === workspace._id ? (
                              <Input
                                ref={inputRef}
                                value={newWorkspaceName}
                                onChange={(e) => setNewWorkspaceName(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                onBlur={handleInputBlur}
                                className="h-8"
                              />
                            ) : (
                              <div>
                                <ContextMenu>
                                  <ContextMenuTrigger>
                                    <div className="flex items-center group">
                                      <button
                                        onClick={(e) => toggleWorkspaceExpansion(workspace._id, e)}
                                        className="p-1 hover:bg-muted rounded flex-shrink-0"
                                      >
                                        <ChevronDown
                                          className={cn(
                                            "h-3 w-3 transform transition-transform",
                                            expandedWorkspaces.has(workspace._id) ? "rotate-180" : ""
                                          )}
                                        />
                                      </button>
                                      <a
                                        href="#"
                                        onClick={(e) => handleWorkspaceClick(workspace, e)}
                                        className={cn(
                                          "flex-1 rounded-md px-2 py-1.5 hover:bg-muted",
                                          selectedWorkspace?._id === workspace._id ? "bg-muted font-medium" : ""
                                        )}
                                      >
                                        {workspace.name}
                                      </a>
                                    </div>
                                  </ContextMenuTrigger>
                                  <ContextMenuContent>
                                    <ContextMenuItem
                                      onClick={() => handleRenameClick(workspace)}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Rename
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDeleteClick(workspace)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Workspace
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenu>

                                {/* Nested Forms List */}
                                {expandedWorkspaces.has(workspace._id) && (
                                  <div className="pl-6 pt-1 space-y-0.5">
                                    {workspaceForms[workspace._id] === undefined ? (
                                      <p className="px-2 py-1 text-[0.65rem] text-muted-foreground">
                                        Loading forms...
                                      </p>
                                    ) : workspaceForms[workspace._id].length > 0 ? (
                                      workspaceForms[workspace._id].map((form) => (
                                        <a
                                          key={form._id}
                                          href="#"
                                          onClick={(e) => handleFormClick(workspace._id, form._id, e)}
                                          className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted text-[0.65rem]"
                                        >
                                          <FileText className="h-3 w-3 text-muted-foreground" />
                                          {form.title}
                                        </a>
                                      ))
                                    ) : (
                                      <p className="px-2 py-1 text-[0.65rem] text-muted-foreground">
                                        No forms yet
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-2 py-1.5 text-xs text-muted-foreground">
                        There are no workspaces.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Rename Confirmation Dialog */}
      <AlertDialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rename this workspace to &quot;{newWorkspaceName}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingWorkspaceId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRenameSubmit}>Rename</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to discard them or continue editing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
                setShowDiscardDialog(false)
                inputRef.current?.focus()
            }}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                setEditingWorkspaceId(null)
                setShowDiscardDialog(false)
            }}>
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
              Are you sure you want to permanently delete the workspace named "{workspaceToDelete?.name}"? This action cannot be undone.
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
  )
}
