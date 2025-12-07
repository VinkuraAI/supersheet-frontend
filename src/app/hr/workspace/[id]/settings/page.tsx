"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { useUpdateWorkspace, useDeleteWorkspace } from "@/features/workspace/hooks/use-workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
// import apiClient from "@/utils/api.client"; // Removed as we use hooks now
import { ShareWorkspaceDialog } from "@/components/dialogs/share-workspace-dialog";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { useWorkspaceMembers, useInviteMember, useRemoveMember, useUpdateMemberRole } from "@/features/workspace/hooks/use-workspaces";
import { UserList } from "@/components/workspace/settings/user-list";
import { Role } from "@/utils/permissions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Copy, Check } from "lucide-react";
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

function UserManagementSection({ workspaceId }: { workspaceId: string }) {
  const { permissions, currentRole } = useWorkspace();
  const { data: members = [], isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
  const { mutateAsync: inviteMember, isPending: isInviting } = useInviteMember();
  const { mutateAsync: removeMember } = useRemoveMember();
  const { mutateAsync: updateMemberRole } = useUpdateMemberRole();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [invitedUsers, setInvitedUsers] = useState<Array<{ email: string, role: Role, link: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleInvite = async () => {
    if (!workspaceId || !inviteEmail) return;

    try {
      const response = await inviteMember({
        id: workspaceId,
        email: inviteEmail,
        role: inviteRole,
        origin: window.location.origin
      });
      toast.success("Invitation sent successfully");

      const invId = response.invitationId || response._id;
      if (invId) {
        const link = `${window.location.origin}/accept-invitation/${invId}`;
        setInvitedUsers(prev => [...prev, { email: inviteEmail, role: inviteRole, link }]);
      } else {
        console.warn("No invitationId or _id in response (settings)");
      }

      setInviteEmail("");
      setInviteRole('editor');
    } catch (error: any) {
      console.error("Invite failed:", error);
      const message = error.response?.data?.error || "Failed to send invitation";
      toast.error(message);
    }
  };

  const copyToClipboard = (link: string, index: number) => {
    navigator.clipboard.writeText(link);
    setCopiedIndex(index);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember({ workspaceId, userId });
      toast.success("Member removed successfully");
    } catch (error: any) {
      console.error("Remove member failed:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      await updateMemberRole({ workspaceId, userId, role: newRole });
      toast.success("Role updated successfully");
    } catch (error: any) {
      console.error("Update role failed:", error);
      toast.error("Failed to update role");
    }
  };

  const totalMembers = members.length;
  const maxMembers = 6;

  return (
    <div className="space-y-6">
      {permissions.canManageMembers && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={totalMembers >= maxMembers}
              className="flex-1"
            />
            <Select value={inviteRole} onValueChange={(value: Role) => setInviteRole(value)}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || isInviting || totalMembers >= maxMembers}
            >
              {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Invite
            </Button>
          </div>

          {invitedUsers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Invited Users</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setInvitedUsers([])}>
                  Clear All
                </Button>
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {invitedUsers.map((user, index) => (
                  <div key={index} className="rounded-md bg-muted p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{user.email} <span className="text-xs text-foreground/70 capitalize">({user.role})</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={user.link}
                        className="h-8 text-xs font-mono bg-background"
                      />
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => copyToClipboard(user.link, index)}>
                        {copiedIndex === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Share this link directly if the user doesn't receive the email.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Workspace Members</h4>
        {isMembersLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <UserList
            members={members}
            currentRole={currentRole}
            canManageMembers={permissions.canManageMembers}
            onUpdateRole={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
          />
        )}
      </div>
    </div>
  );
}

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { selectedWorkspace, permissions, setWorkspaces, workspaces, isLoading } = useWorkspace();
  const [newName, setNewName] = useState(selectedWorkspace?.name || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: updateWorkspace } = useUpdateWorkspace();
  const { mutateAsync: deleteWorkspace } = useDeleteWorkspace();

  // Redirect if not owner
  useEffect(() => {
    if (!isLoading && selectedWorkspace && !permissions.canDeleteWorkspace) {
      router.push(`/hr/workspace/${selectedWorkspace._id}`);
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
      await updateWorkspace({ id: selectedWorkspace._id, data: { name: newName } });
      toast.success("Workspace updated successfully");
      // No need to manually update state, React Query invalidation handles it
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error("Failed to update workspace");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWorkspace) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace(selectedWorkspace._id);
      toast.success("Workspace deleted successfully");
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
            <Button className="mt-4" onClick={() => router.push(`/hr/workspace/${selectedWorkspace?._id}`)}>
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

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage workspace members and their roles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedWorkspace && <UserManagementSection workspaceId={selectedWorkspace._id} />}
              </CardContent>
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
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Workspace"}
                </Button>
              </CardFooter>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your workspace
                    and remove all associated data and members.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}


