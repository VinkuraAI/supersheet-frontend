"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import apiClient from "@/utils/api.client";
import { ShareWorkspaceDialog } from "@/components/dialogs/share-workspace-dialog";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { selectedWorkspace, permissions, setWorkspaces, workspaces, isLoading } = useWorkspace();
  const [newName, setNewName] = useState(selectedWorkspace?.name || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not owner
  useEffect(() => {
    if (!isLoading && selectedWorkspace && !permissions.canDeleteWorkspace) {
      router.push(`/workspace/${selectedWorkspace._id}`);
      toast.error("You do not have permission to access settings.");
    }
  }, [selectedWorkspace, permissions, isLoading, router]);

  // If not owner, render nothing (while redirecting)
  if (!isLoading && selectedWorkspace && !permissions.canDeleteWorkspace) {
    return null;
  }

  // Update local state when workspace changes
  if (selectedWorkspace && newName === "" && selectedWorkspace.name !== newName) {
     setNewName(selectedWorkspace.name);
  }

  const handleSave = async () => {
    if (!selectedWorkspace) return;
    setIsSaving(true);
    try {
      await apiClient.put(`/workspaces/${selectedWorkspace._id}`, { name: newName });
      toast.success("Workspace updated successfully");
      // Update local state
      setWorkspaces(workspaces.map(w => w._id === selectedWorkspace._id ? { ...w, name: newName } : w));
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error("Failed to update workspace");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWorkspace) return;
    if (!confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/workspaces/${selectedWorkspace._id}`);
      toast.success("Workspace deleted successfully");
      setWorkspaces(workspaces.filter(w => w._id !== selectedWorkspace._id));
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete workspace");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <WorkspaceLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {!permissions.canManageWorkspace ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground mt-2">You do not have permission to manage this workspace.</p>
            <Button className="mt-4" onClick={() => router.push(`/workspace/${selectedWorkspace?._id}`)}>
              Go back to Workspace
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Workspace Settings</h2>
              <p className="text-muted-foreground">
                Manage your workspace settings and preferences.
              </p>
            </div>
            <Separator />
            
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>
                  Update your workspace name and other general settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Workspace Name
                  </label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter workspace name"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Deleting a workspace will permanently remove all data, documents, and member associations.
                  This action cannot be undone.
                </p>
              </CardContent>
              <CardFooter className="border-t border-destructive/10 px-6 py-4 bg-destructive/5">
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleting(true)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Workspace"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}


