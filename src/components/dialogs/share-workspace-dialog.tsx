"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useWorkspace } from "@/lib/workspace-context";
import { useWorkspaceMembers, useInviteMember, useRemoveMember, useUpdateMemberRole } from "@/features/workspace/hooks/use-workspaces";
import { toast } from "sonner";
import { Loader2, UserPlus, Copy, Check } from "lucide-react";
import { Role } from "@/utils/permissions";
import { UserList } from "@/components/workspace/settings/user-list";

interface ShareWorkspaceDialogProps {
  children: React.ReactNode;
  workspace?: { _id: string; name: string };
  canManageMembers?: boolean;
}

export function ShareWorkspaceDialog({ children, workspace: propWorkspace, canManageMembers: propCanManageMembers }: ShareWorkspaceDialogProps) {
  const { selectedWorkspace, permissions, currentRole } = useWorkspace();
  const workspace = propWorkspace || selectedWorkspace;
  const canManageMembers = propCanManageMembers !== undefined ? propCanManageMembers : permissions.canManageMembers;

  const { data: members = [], isLoading: isMembersLoading } = useWorkspaceMembers(workspace?._id);
  const { mutateAsync: inviteMember, isPending: isInviting } = useInviteMember();
  const { mutateAsync: removeMember } = useRemoveMember();
  const { mutateAsync: updateMemberRole } = useUpdateMemberRole();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [isOpen, setIsOpen] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<Array<{ email: string, role: Role, link: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleInvite = async () => {
    if (!workspace || !inviteEmail) return;

    try {
      const response = await inviteMember({
        id: workspace._id,
        email: inviteEmail,
        role: inviteRole,
        origin: window.location.origin
      });
      toast.success("Invitation sent successfully");

      // If backend returns invitationId or _id, construct the link
      const invId = response.invitationId || response._id;
      if (invId) {
        const link = `${window.location.origin}/accept-invitation/${invId}`;
        setInvitedUsers(prev => [...prev, { email: inviteEmail, role: inviteRole, link }]);
      } else {
        console.warn("No invitationId or _id in response");
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
    if (!workspace) return;

    try {
      await removeMember({ workspaceId: workspace._id, userId });
      toast.success("Member removed successfully");
    } catch (error: any) {
      console.error("Remove member failed:", error);
      const message = error.response?.data?.error || "Failed to remove member";
      toast.error(message);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    if (!workspace) return;

    try {
      await updateMemberRole({ workspaceId: workspace._id, userId, role: newRole });
      toast.success("Role updated successfully");
    } catch (error: any) {
      console.error("Update role failed:", error);
      const message = error.response?.data?.error || "Failed to update role";
      toast.error(message);
    }
  };

  const totalMembers = members.length;
  const maxMembers = 6; // 1 Owner + 5 Shared
  const sharedCount = members.filter((m: any) => m.role !== 'owner').length;
  const maxShared = 5;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Workspace: {workspace?.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Shared with {sharedCount} / {maxShared} users</span>
              <span className="text-muted-foreground">{maxShared - sharedCount} slots remaining</span>
            </div>
            <Progress value={(sharedCount / maxShared) * 100} className="h-2" />
          </div>

          {canManageMembers && (
            <div className="space-y-4 mb-6">
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
                canManageMembers={canManageMembers}
                onUpdateRole={handleUpdateRole}
                onRemoveMember={handleRemoveMember}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
