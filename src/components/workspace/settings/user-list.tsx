"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Trash2 } from "lucide-react";
import { Role } from "@/utils/permissions";
import { Member } from "@/features/workspace/services/workspace-service";

interface UserListProps {
    members: Member[];
    currentRole: Role | null;
    canManageMembers: boolean;
    onUpdateRole: (userId: string, role: Role) => void;
    onRemoveMember: (userId: string) => void;
    currentUserId?: string;
}

export function UserList({
    members,
    currentRole,
    canManageMembers,
    onUpdateRole,
    onRemoveMember,
    currentUserId,
}: UserListProps) {
    // If currentUserId is not passed, try to get it from localStorage
    const myId = currentUserId || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user") || "{}").id : null);

    const [roleToUpdate, setRoleToUpdate] = useState<{ userId: string, role: Role } | null>(null);

    const handleRoleChange = (userId: string, role: Role) => {
        setRoleToUpdate({ userId, role });
    };

    const confirmRoleChange = () => {
        if (roleToUpdate) {
            onUpdateRole(roleToUpdate.userId, roleToUpdate.role);
            setRoleToUpdate(null);
        }
    };

    return (
        <div className="space-y-3">
            {members.map((member) => {
                const isOwner = currentRole === 'owner';
                const isAdmin = currentRole === 'admin';
                const isMemberOwner = member.role === 'owner';
                const isMe = member.user._id === myId;

                // Determine if current user can edit this member's role
                const canEditRole = (isOwner && !isMe) || (isAdmin && !isMemberOwner && member.role !== 'admin' && !isMe);

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
                                    onValueChange={(value: Role) => handleRoleChange(member.user._id, value)}
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
                                    onClick={() => onRemoveMember(member.user._id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}

            <AlertDialog open={!!roleToUpdate} onOpenChange={(open) => !open && setRoleToUpdate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change User Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change this user's role to <span className="font-bold capitalize">{roleToUpdate?.role}</span>?
                            This will update their permissions within the workspace.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRoleChange}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
