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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useWorkspace } from "@/lib/workspace-context";
import apiClient from "@/utils/api.client";
import { toast } from "sonner";
import { Loader2, Trash2, UserPlus, Copy, Check } from "lucide-react";
import { Role } from "@/utils/permissions";

interface Member {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: Role;
}

interface ShareWorkspaceDialogProps {
  children: React.ReactNode;
  workspace?: { _id: string; name: string };
  canManageMembers?: boolean;
}

export function ShareWorkspaceDialog({ children, workspace: propWorkspace, canManageMembers: propCanManageMembers }: ShareWorkspaceDialogProps) {
  const { selectedWorkspace, permissions, currentRole } = useWorkspace();
  const workspace = propWorkspace || selectedWorkspace;
  const canManageMembers = propCanManageMembers !== undefined ? propCanManageMembers : permissions.canManageMembers;

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [isInviting, setIsInviting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastInvitedLink, setLastInvitedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchMembers = async () => {
    if (!workspace) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/workspaces/${workspace._id}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("Failed to load workspace members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, workspace]);

  const handleInvite = async () => {
    if (!workspace || !inviteEmail) return;

    setIsInviting(true);
    setLastInvitedLink(null);
    try {
      const response = await apiClient.post(`/workspaces/${workspace._id}/invite`, {
        email: inviteEmail,
        role: inviteRole,
        origin: window.location.origin // Send origin so backend can construct the full link
      });
      toast.success("Invitation sent successfully");

      // If backend returns invitationId, construct the link
      if (response.data.invitationId) {
        const link = `${window.location.origin}/accept-invitation/${response.data.invitationId}`;
        setLastInvitedLink(link);
      }

      setInviteEmail("");
      setInviteRole('editor');
      fetchMembers(); // Refresh list
    } catch (error: any) {
      console.error("Invite failed:", error);
      const message = error.response?.data?.error || "Failed to send invitation";
      toast.error(message);
    } finally {
      setIsInviting(false);
    }
  };

  const copyToClipboard = () => {
    if (lastInvitedLink) {
      navigator.clipboard.writeText(lastInvitedLink);
      setIsCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!workspace) return;

    try {
      await apiClient.delete(`/workspaces/${workspace._id}/members/${userId}`);
      toast.success("Member removed successfully");
      setMembers(members.filter(m => m.user._id !== userId));
    } catch (error: any) {
      console.error("Remove member failed:", error);
      const message = error.response?.data?.error || "Failed to remove member";
      toast.error(message);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    if (!workspace) return;

    try {
      await apiClient.put(`/workspaces/${workspace._id}/members/${userId}`, { role: newRole });
      toast.success("Role updated successfully");
      setMembers(members.map(m => m.user._id === userId ? { ...m, role: newRole } : m));
    } catch (error: any) {
      console.error("Update role failed:", error);
      const message = error.response?.data?.error || "Failed to update role";
      toast.error(message);
    }
  };

  const totalMembers = members.length;
  const maxMembers = 6; // 1 Owner + 5 Shared
  const sharedCount = members.filter(m => m.role !== 'owner').length;
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

              {lastInvitedLink && (
                <div className="rounded-md bg-muted p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Invitation Link</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setLastInvitedLink(null)}>
                      <span className="sr-only">Close</span>
                      &times;
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={lastInvitedLink}
                      className="h-8 text-xs font-mono bg-background"
                    />
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={copyToClipboard}>
                      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Share this link directly if the user doesn't receive the email.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Workspace Members</h4>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const isOwner = currentRole === 'owner';
                  const isAdmin = currentRole === 'admin';
                  const isSelf = false; // We don't have current user ID easily available here without parsing token again or passing it. 
                  // Actually we can check if member.role is owner.
                  const isMemberOwner = member.role === 'owner';

                  // Determine if current user can edit this member's role
                  // Owner can edit everyone (except themselves usually, but let's assume they can't change their own role here to avoid locking themselves out easily or it's handled by backend)
                  // Admin can edit non-owners and non-admins (wait, prompt says "except his", implying they can't edit themselves. Can they edit other admins? Prompt says "Admin can make it Editor or Viewer for other user roles". It doesn't explicitly forbid editing other admins, but usually admins can't demote other admins unless they are owner. I'll assume Admin can edit anyone who is NOT an owner and NOT themselves).
                  // Actually, let's look at the prompt again: "Admin can make it Editor or Viewer for other user roles except his".

                  // We need the current user's ID to know if it's "his".
                  // We can get it from localStorage as done in workspace-context, or just rely on the fact that the UI shouldn't show edit for self.
                  // Let's try to get current user ID from localStorage for the check.
                  const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
                  const currentUserId = storedUserStr ? JSON.parse(storedUserStr).id : null;
                  const isMe = member.user._id === currentUserId;

                  const canEditRole = (isOwner && !isMe) || (isAdmin && !isMemberOwner && !isMe);

                  return (
                    <div key={member.user._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user.email}`} />
                          <AvatarFallback>{member.user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {member.user.name}
                            {!canEditRole && <span className="ml-2 text-xs text-muted-foreground capitalize">({member.role})</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {canEditRole ? (
                          <Select
                            value={member.role}
                            onValueChange={(value: Role) => handleUpdateRole(member.user._id, value)}
                          >
                            <SelectTrigger className="w-[100px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {isOwner && <SelectItem value="admin">Admin</SelectItem>}
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : null}

                        {canManageMembers && member.role !== 'owner' && !isMe && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 w-8"
                            onClick={() => handleRemoveMember(member.user._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
