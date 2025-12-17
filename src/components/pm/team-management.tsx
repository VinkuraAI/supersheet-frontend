"use client";

import { useState } from "react";
import { Plus, Trash2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeams, useAddTeam, useUpdateTeam, useDeleteTeam } from "@/features/workspace/hooks/use-teams";
import { useWorkspace } from "@/lib/workspace-context";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

interface TeamMember {
    name: string;
    email: string;
    isLeader: boolean;
}

interface TeamManagementProps {
    workspaceId: string;
    showSetupHint?: boolean; // Show hint only during workspace creation
}

export function TeamManagement({ workspaceId, showSetupHint = false }: TeamManagementProps) {
    const { data: teams = [], isLoading: isTeamsLoading } = useTeams(workspaceId);
    const { mutateAsync: addTeam, isPending: isAddingTeam } = useAddTeam();
    const { mutateAsync: updateTeam, isPending: isUpdatingTeam } = useUpdateTeam();
    const { mutateAsync: deleteTeam } = useDeleteTeam();
    const { permissions } = useWorkspace();

    const [isAdding, setIsAdding] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [teamName, setTeamName] = useState("");
    const [members, setMembers] = useState<TeamMember[]>([
        { name: "", email: "", isLeader: false },
        { name: "", email: "", isLeader: false }
    ]);

    const resetForm = () => {
        setTeamName("");
        setMembers([
            { name: "", email: "", isLeader: false },
            { name: "", email: "", isLeader: false }
        ]);
        setIsAdding(false);
        setEditingTeamId(null);
    };

    const handleStartEdit = (team: any) => {
        setTeamName(team.name);

        // Convert team members to the form format
        const formMembers: TeamMember[] = team.members.map((m: any) => ({
            name: m.name || "",
            email: m.email || "",
            isLeader: team.leader?._id === m._id || team.leader === m._id
        }));

        setMembers(formMembers.length >= 2 ? formMembers : [
            ...formMembers,
            { name: "", email: "", isLeader: false }
        ]);
        setEditingTeamId(team._id);
        setIsAdding(true);
    };

    const handleAddMember = () => {
        if (members.length >= 8) {
            toast.warning("Maximum 8 members per team");
            return;
        }
        setMembers([...members, { name: "", email: "", isLeader: false }]);
    };

    const handleRemoveMember = (index: number) => {
        if (members.length > 2) {
            const newMembers = [...members];
            newMembers.splice(index, 1);
            setMembers(newMembers);
        }
    };

    const updateMember = (index: number, field: keyof TeamMember, value: any) => {
        const newMembers = [...members];
        // @ts-ignore
        newMembers[index][field] = value;

        if (field === 'isLeader' && value === true) {
            // Uncheck others
            newMembers.forEach((m, i) => {
                if (i !== index) m.isLeader = false;
            });
        }
        setMembers(newMembers);
    };

    const handleSubmit = async () => {
        if (!teamName.trim()) {
            toast.error("Please provide a team name");
            return;
        }

        const leader = members.find(m => m.isLeader);
        if (!leader || !leader.email) {
            toast.error("Please select a team leader");
            return;
        }

        // Filter out empty members
        const validMembers = members.filter(m => m.email.trim());
        if (validMembers.length === 0) {
            toast.error("Please add at least one team member");
            return;
        }

        if (validMembers.length > 8) {
            toast.error("Maximum 8 members per team");
            return;
        }

        try {
            const teamData = {
                name: teamName,
                leaderEmail: leader.email,
                members: validMembers.map(m => ({
                    name: m.name,
                    email: m.email,
                    isLeader: m.isLeader
                }))
            };

            if (editingTeamId) {
                await updateTeam({
                    workspaceId,
                    teamId: editingTeamId,
                    teamData
                });
                toast.success("Team updated successfully");
            } else {
                await addTeam({
                    workspaceId,
                    teamData
                });
                toast.success("Team created successfully");
            }
            resetForm();
        } catch (error: any) {
            console.error("Failed to save team:", error);
            toast.error(error.response?.data?.error || "Failed to save team");
        }
    };

    const handleDelete = async (teamId: string) => {
        if (!confirm("Are you sure you want to delete this team? Tasks assigned to this team will be unassigned.")) return;
        try {
            await deleteTeam({ workspaceId, teamId });
            toast.success("Team deleted successfully");
        } catch (error: any) {
            console.error("Failed to delete team:", error);
            toast.error("Failed to delete team");
        }
    };

    const isSubmitting = isAddingTeam || isUpdatingTeam;

    if (isTeamsLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!isAdding && teams.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    {teams.map((team: any) => (
                        <Card key={team._id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg font-semibold">{team.name}</CardTitle>
                                        <CardDescription className="text-sm mt-1.5 flex items-center gap-1">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                👑 {team.leader?.name || "Unknown"}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    {permissions.canManageWorkspace && (
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50" onClick={() => handleStartEdit(team)}>
                                                <Pencil className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => handleDelete(team._id)}>
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-medium text-muted-foreground">Team Members</p>
                                        <span className="text-xs text-muted-foreground">{team.members?.length || 0}/8</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {team.members?.map((m: any) => {
                                            const isPending = m.isPending;
                                            const expiresAt = m.expiresAt ? new Date(m.expiresAt) : null;
                                            const timeLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

                                            return (
                                                <div key={m._id} className="relative group">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${isPending
                                                            ? "bg-amber-50 text-amber-700 border-amber-200 dashed-border"
                                                            : "bg-slate-100 text-slate-700 border-slate-200"
                                                        }`}>
                                                        {m.name}
                                                        {isPending && (
                                                            <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Invitation Pending" />
                                                        )}
                                                    </span>
                                                    {isPending && (
                                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                            Pending • Expires in {timeLeft} days
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {isAdding ? (
                <Card className="border-2 border-blue-200">
                    <CardHeader className="bg-blue-50/50">
                        <CardTitle className="text-base flex items-center gap-2">
                            {editingTeamId ? (
                                <>
                                    <Pencil className="h-4 w-4" />
                                    Edit Team
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Create New Team
                                </>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {editingTeamId ? "Update team details and members" : "Add a new team to your project (max 2 teams)"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Team Name *</label>
                            <Input
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="e.g. Alpha Squad"
                                className="border-slate-300"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Team Members (Min 2) *</label>
                                <span className="text-xs text-muted-foreground">{members.filter(m => m.email).length}/8</span>
                            </div>

                            <div className="space-y-3">
                                {members.map((member, index) => (
                                    <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex-1 space-y-3">
                                            <Input
                                                type="text"
                                                value={member.name}
                                                onChange={(e) => updateMember(index, 'name', e.target.value)}
                                                placeholder="Name"
                                                className="w-full p-2 border rounded-lg text-sm"
                                            />
                                            <Input
                                                type="email"
                                                value={member.email}
                                                onChange={(e) => updateMember(index, 'email', e.target.value)}
                                                placeholder="Email"
                                                className="w-full p-2 border rounded-lg text-sm"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 items-center pt-1">
                                            <button
                                                type="button"
                                                onClick={() => updateMember(index, 'isLeader', !member.isLeader)}
                                                className={`p-2 rounded-full transition-colors ${member.isLeader ? 'bg-yellow-100 text-yellow-600' : 'text-slate-400 hover:bg-slate-200'}`}
                                                title="Toggle Team Leader"
                                            >
                                                <Crown className="w-5 h-5" />
                                            </button>
                                            {members.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(index)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {members.length < 8 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddMember}
                                    className="w-full border-dashed"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Member
                                </Button>
                            )}

                            {showSetupHint && (
                                <p className="text-xs text-muted-foreground">
                                    Click the crown icon to set team leader. Only one team can be added now. You can add more teams later from Project Settings.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !teamName.trim() || !members.some(m => m.isLeader)}
                                className="min-w-[100px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    editingTeamId ? "Update Team" : "Create Team"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                teams.length < 2 && permissions.canManageWorkspace && (
                    <Button
                        variant="outline"
                        className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 h-12 text-slate-600 hover:text-blue-600 transition-all"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Create New Team
                    </Button>
                )
            )}

            {teams.length >= 2 && !isAdding && (
                <div className="text-center py-3 px-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 font-medium">
                        ⚠️ Maximum team limit reached (2/2)
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                        Delete an existing team to create a new one
                    </p>
                </div>
            )}
        </div>
    );
}
