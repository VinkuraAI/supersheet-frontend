"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { workspaceService, Workspace } from "@/features/workspace/services/workspace-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowRight, Shield } from "lucide-react";
import { format } from "date-fns";

export default function SharedWithMePage() {
    const router = useRouter();
    const [sharedWorkspaces, setSharedWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const data = await workspaceService.getWorkspaces();
                setSharedWorkspaces(data.sharedWorkspaces || []);
            } catch (error) {
                console.error("Failed to fetch shared workspaces:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <WorkspaceLayout>
            <div className="p-8 max-w-7xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Shared with me</h1>
                    <p className="text-slate-500 mt-2">Workspaces you have been invited to collaborate on</p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardHeader className="pb-4">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-10 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : sharedWorkspaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sharedWorkspaces.map((workspace) => (
                            <Card key={workspace._id} className="group hover:shadow-lg transition-all duration-200 border-slate-200">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                        {workspace.mainFocus && (
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                                {workspace.mainFocus === 'human-resources' ? 'HR' : 'PM'}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl text-slate-800 group-hover:text-blue-600 transition-colors">
                                        {workspace.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Shield className="w-3 h-3" />
                                        <span>Role: {workspace.members?.find(m => m.user._id !== workspace.userId)?.role || 'Member'}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all"
                                        variant="outline"
                                        onClick={() => {
                                            const prefix = workspace.mainFocus === 'project-management' ? 'pm' : 'hr';
                                            router.push(`/${prefix}/workspace/${workspace._id}`);
                                        }}
                                    >
                                        Open Workspace
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No shared workspaces</h3>
                        <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                            When someone invites you to their workspace, it will appear here.
                        </p>
                    </div>
                )}
            </div>
        </WorkspaceLayout>
    );
}
