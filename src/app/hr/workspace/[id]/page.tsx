"use client"
import { Suspense, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { TopBar } from "@/components/service-desk/topbar"
import { SideNav } from "@/components/service-desk/sidenav"
import { FiltersBar } from "@/components/service-desk/filters-bar"
import { WorkspaceTable } from "@/components/workspace/table/workspace-table"
import { RightPanel } from "@/components/service-desk/right-panel"
import { AiChatWidget } from "@/components/service-desk/ai-chat-widget"
import { Sheet, SheetContent, SheetTrigger, SheetOverlay } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

import { NoWorkspaceSelected } from "@/components/service-desk/no-workspace-selected";
import { useWorkspace } from "@/lib/workspace-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, Share2 } from "lucide-react";
import Link from "next/link";
import { useWorkspaceDetails } from "@/features/workspace/hooks/use-workspaces";
// import { JobDescriptionDialog } from "@/components/dialogs/job-description-dialog"; // Moved to WorkspaceToolbar
import { ShareWorkspaceDialog } from "@/components/dialogs/share-workspace-dialog";
import { useToast } from "@/hooks/use-toast";

export default function WorkspacePage() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth

      if (width < 1272) {
        setLeftSidebarOpen(false)
        setRightSidebarOpen(false)
      } else {
        setLeftSidebarOpen(true)
        setRightSidebarOpen(false)
      }
    }

    // Run on mount
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <PageContent
      leftSidebarOpen={leftSidebarOpen}
      rightSidebarOpen={rightSidebarOpen}
      setLeftSidebarOpen={setLeftSidebarOpen}
      setRightSidebarOpen={setRightSidebarOpen}
      isMobile={isMobile}
    />
  )
}

interface PageContentProps {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

function PageContent({ leftSidebarOpen, rightSidebarOpen, setLeftSidebarOpen, setRightSidebarOpen, isMobile }: PageContentProps) {
  const { selectedWorkspace, isLoading, workspaces, setSelectedWorkspace } = useWorkspace();
  const { toast } = useToast();
  const params = useParams();
  const workspaceId = params.id as string;
  const [rows, setRows] = useState<any[]>([]);
  const [schema, setSchema] = useState<any[]>([]);
  const [workspaceData, setWorkspaceData] = useState<any>(null);

  const {
    data: workspaceDetails,
    isLoading: isDetailsLoading,
    error: detailsError,
    refetch: refetchWorkspaceDetails
  } = useWorkspaceDetails(selectedWorkspace?._id);

  // Sync selectedWorkspace with URL params
  useEffect(() => {
    if (workspaceId && workspaces.length > 0 && (!selectedWorkspace || selectedWorkspace._id !== workspaceId)) {
      const workspace = workspaces.find(w => w._id === workspaceId);
      if (workspace) {
        setSelectedWorkspace(workspace);
      }
    }
  }, [workspaceId, workspaces, selectedWorkspace, setSelectedWorkspace]);

  // Process workspace details when data is available
  useEffect(() => {
    if (workspaceDetails) {
      setRows(workspaceDetails.table.rows || []);

      // Deduplicate schema by column name, keeping the first occurrence
      const rawSchema = workspaceDetails.table.schema || [];
      const uniqueSchema = rawSchema.filter((col: any, index: number, self: any[]) =>
        index === self.findIndex((c: any) => c.name === col.name)
      );

      // Add Informed column if it doesn't exist
      if (!uniqueSchema.find((col: any) => col.name === "Informed")) {
        const statusIndex = uniqueSchema.findIndex((col: any) => col.name === "Status");
        uniqueSchema.splice(statusIndex + 1, 0, {
          name: "Informed",
          type: "text",
          isDefault: true
        });
      }

      // Add Source column if it doesn't exist
      if (!uniqueSchema.find((col: any) => col.name === "Source")) {
        const informedIndex = uniqueSchema.findIndex((col: any) => col.name === "Informed");
        uniqueSchema.splice(informedIndex + 1, 0, {
          name: "Source",
          type: "text",
          isDefault: true,
        });
      }

      // Add Feedback column if it doesn't exist (appears after Notes column)
      if (!uniqueSchema.find((col: any) => col.name === "Feedback")) {
        uniqueSchema.push({
          name: "Feedback",
          type: "text",
          required: false
        });
      }

      setSchema(uniqueSchema);
      setWorkspaceData(workspaceDetails);
    }
  }, [workspaceDetails]);

  // Handle errors
  useEffect(() => {
    if (detailsError) {
      console.error("Failed to fetch workspace data:", detailsError);
      // @ts-ignore
      if (detailsError.response?.status === 403) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have permission to view this workspace.",
        });
      }
    }
  }, [detailsError, toast]);

  return (
    <main className="min-h-dvh flex flex-col text-[0.75rem]">
      <header className="fixed top-0 left-0 right-0 z-40 h-[60px] border-b bg-card">
        <TopBar
          onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
          onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
          rightSidebarOpen={rightSidebarOpen}
        />
      </header>

      <section className="flex flex-1 overflow-hidden relative">
        {/* Left sidebar - fixed and toggleable */}
        <aside
          className={`
            fixed left-0 top-[60px] bottom-0 z-30 w-[256px] 
            bg-card border-r transition-transform duration-300
            overflow-y-auto scrollbar-hide
            ${leftSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          aria-label="Project navigation"
        >
          <SideNav />
        </aside>

        {/* Center content - adjusts margin based on sidebar state */}
        <div
          className={`
            flex-1 flex flex-col transition-all duration-300 pb-18 min-w-0 pt-[60px]
            ${leftSidebarOpen ? "ml-[256px]" : "ml-0"}
            ${rightSidebarOpen ? "mr-[240px]" : "mr-0"}
          `}
        >
          <div className="flex-1 flex flex-col gap-2 p-3 min-w-0 min-h-0">
            {isLoading ? (
              <div className="flex-1 flex flex-col gap-2 overflow-hidden w-full ">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="flex-1 w-full" />
              </div>
            ) : selectedWorkspace ? (
              <>
                <div className="bg-card border rounded-md flex-1 min-h-0 flex flex-col h-full">
                  <WorkspaceTable
                    tickets={rows}
                    schema={schema}
                    setData={setRows}
                    onRefreshData={refetchWorkspaceDetails}
                    workspaceName={selectedWorkspace.name}
                    workspaceId={selectedWorkspace._id}
                    jd={workspaceData?.jd || ""}
                    onJdUpdate={(newJd) => {
                      setWorkspaceData((prev: any) => ({ ...prev, jd: newJd }));
                    }}
                    routePrefix="hr"
                  />
                </div>
              </>
            ) : (
              <NoWorkspaceSelected />
            )}
          </div>
        </div>

        {/* Right context panel - fixed and toggleable */}
        <aside
          className={`
            fixed right-0 top-[60px] bottom-0 z-30 w-[240px]
            bg-card border-l transition-transform duration-300
            overflow-y-auto scrollbar-hide
            ${rightSidebarOpen ? "translate-x-0" : "translate-x-full"}
          `}
          aria-label="Project info"
        >
          <div className="p-2">
            <RightPanel />
          </div>
        </aside>
      </section>

      <AiChatWidget />
    </main>
  )
}

