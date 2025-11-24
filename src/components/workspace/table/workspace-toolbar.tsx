"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, Settings } from "lucide-react";
import { JobDescriptionDialog } from "@/components/dialogs/job-description-dialog";
import { FiltersBar } from "@/components/service-desk/filters-bar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkspaceToolbarProps {
    workspaceId: string;
    workspaceName: string;
    jd: string;
    onJdUpdate: (newJd: string) => void;
    routePrefix: string;
}

export function WorkspaceToolbar({
    workspaceId,
    workspaceName,
    jd,
    onJdUpdate,
    routePrefix,
}: WorkspaceToolbarProps) {
    return (
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 z-20">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-1 bg-blue-600 rounded-full" />
                    <h1 className="text-lg font-bold text-slate-800">{workspaceName}</h1>
                </div>

                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <JobDescriptionDialog
                                        workspaceId={workspaceId}
                                        workspaceName={workspaceName}
                                        initialJd={jd}
                                        onJdUpdate={onJdUpdate}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Job Description</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={`/${routePrefix}/workspace/${workspaceId}/documents`}>
                                    <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                        <FolderOpen className="mr-2 h-4 w-4" />
                                        Documents
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View Workspace Documents</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={`/${routePrefix}/workspace/${workspaceId}/forms`}>
                                    <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Forms
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Manage Forms</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <div className="px-6 pb-3">
                <Suspense>
                    <FiltersBar />
                </Suspense>
            </div>
        </div>
    );
}
