"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { useUpdateWorkspace, useDeleteWorkspace } from "@/features/workspace/hooks/use-workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { TeamManagement } from "@/components/pm/team-management";

export function PMSettingsView({ workspaceId }: { workspaceId: string }) {
    const router = useRouter();
    const { selectedWorkspace, permissions } = useWorkspace();
    const [newName, setNewName] = useState(selectedWorkspace?.name || "");
    const [isSaving, setIsSaving] = useState(false);
    const { mutateAsync: updateWorkspace } = useUpdateWorkspace();
    const { mutateAsync: deleteWorkspace } = useDeleteWorkspace();

    const handleSave = async () => {
        if (!selectedWorkspace) return;
        setIsSaving(true);
        try {
            await updateWorkspace({ id: selectedWorkspace._id, data: { name: newName } });
            toast.success("Workspace updated successfully");
        } catch (error: any) {
            toast.error("Failed to update workspace");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedWorkspace || !confirm("Are you sure? This action cannot be undone.")) return;
        try {
            await deleteWorkspace(selectedWorkspace._id);
            toast.success("Workspace deleted successfully");
            router.push("/dashboard");
        } catch (error: any) {
            toast.error("Failed to delete workspace");
        }
    };

    if (!permissions.canManageWorkspace) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground mt-2">You do not have permission to manage this workspace.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 overflow-y-auto h-full pb-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Project Settings</h2>
                <p className="text-muted-foreground">Manage your project settings and preferences.</p>
            </div>
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>General</CardTitle>
                    <CardDescription>Update your workspace name and other general settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Workspace Name</label>
                        <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter workspace name" />
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
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>Create and manage teams for your project. Maximum 2 teams allowed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <TeamManagement workspaceId={workspaceId} />
                </CardContent>
            </Card>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for your workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Deleting a workspace will permanently remove all data, documents, and member associations. This action cannot be undone.
                    </p>
                </CardContent>
                <CardFooter className="border-t border-destructive/10 px-6 py-4 bg-destructive/5">
                    <Button variant="destructive" onClick={handleDelete}>Delete Workspace</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
