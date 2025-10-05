"use client"

import { Suspense, useState, useEffect } from "react"
import { TopBar } from "@/components/service-desk/topbar"
import { SideNav } from "@/components/service-desk/sidenav"
import { FiltersBar } from "@/components/service-desk/filters-bar"
import { TicketsTable } from "@/components/service-desk/tickets-table"
import { RightPanel } from "@/components/service-desk/right-panel"
import { AiChatWidget } from "@/components/service-desk/ai-chat-widget"

import { NoWorkspaceSelected } from "@/components/service-desk/no-workspace-selected";
import { useWorkspace } from "@/lib/workspace-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspacePage() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      // Close both sidebars when screen is too narrow (below 1280px)
      if (width < 1272) {
        setLeftSidebarOpen(false)
        setRightSidebarOpen(false)
      }
    }

    // Run on mount
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [leftSidebarOpen, rightSidebarOpen])

  return (
    <PageContent 
      leftSidebarOpen={leftSidebarOpen} 
      rightSidebarOpen={rightSidebarOpen} 
      setLeftSidebarOpen={setLeftSidebarOpen} 
      setRightSidebarOpen={setRightSidebarOpen} 
    />
  )
}

interface PageContentProps {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
}

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import apiClient from "@/utils/api.client";
import { JobDescriptionDialog } from "@/components/dialogs/job-description-dialog";

function PageContent({ leftSidebarOpen, rightSidebarOpen, setLeftSidebarOpen, setRightSidebarOpen }: PageContentProps) {
  const { selectedWorkspace, isLoading } = useWorkspace();
  const [rows, setRows] = useState<any[]>([]);
  const [schema, setSchema] = useState<any[]>([]);
  const [workspaceData, setWorkspaceData] = useState<any>(null);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceData();
    }
  }, [selectedWorkspace]);

  const fetchWorkspaceData = async () => {
    if (!selectedWorkspace) return;
    
    try {
      const response = await apiClient.get(`/api/workspaces/${selectedWorkspace._id}`);
      setRows(response.data.table.rows || []);
      
      // Deduplicate schema by column name, keeping the first occurrence
      const rawSchema = response.data.table.schema || [];
      const uniqueSchema = rawSchema.filter((col: any, index: number, self: any[]) => 
        index === self.findIndex((c: any) => c.name === col.name)
      );
      
      // Add Feedback column if it doesn't exist (appears after Notes column)
      if (!uniqueSchema.find((col: any) => col.name === "Feedback")) {
        uniqueSchema.push({
          name: "Feedback",
          type: "text",
          required: false
        });
      }
      
      setSchema(uniqueSchema);
      
      setWorkspaceData(response.data);
    } catch (error) {
      console.error("Failed to fetch workspace data:", error);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col text-[0.75rem]">
      <header className="border-b bg-card flex-shrink-0">
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
            fixed left-0 top-[43px] bottom-0 z-30 w-[195px] 
            bg-card border-r transition-transform duration-300
            overflow-y-auto scrollbar-hide
            ${leftSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          aria-label="Project navigation"
        >
          <div className="p-1.5">
            <SideNav />
          </div>
        </aside>

        {/* Center content - adjusts margin based on sidebar state */}
        <div
          className={`
            flex-1 flex flex-col transition-all duration-300 pb-18 min-w-0
            ${leftSidebarOpen ? "ml-[195px]" : "ml-0"}
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
                <div className="bg-card border rounded-md flex-shrink-0">
                  <div className="flex items-center justify-between border-b px-3 py-2">
                    <h1 className="text-sm font-semibold text-pretty">
                      {selectedWorkspace.name}
                    </h1>
                    <div className="flex items-center gap-1.5">
                      <JobDescriptionDialog
                        workspaceId={selectedWorkspace._id}
                        workspaceName={selectedWorkspace.name}
                        initialJd={workspaceData?.jd || ""}
                        onJdUpdate={(newJd) => {
                          setWorkspaceData((prev: any) => ({ ...prev, jd: newJd }));
                        }}
                      />
                      <Link href={`/workspace/${selectedWorkspace._id}/forms`}>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                          <FileText className="mr-1.5 h-3 w-3" />
                          Workspace Form
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="p-2">
                    <Suspense>
                      <FiltersBar />
                    </Suspense>
                  </div>
                </div>

                <div className="bg-card border rounded-md flex-1 min-h-0 flex flex-col">
                  <TicketsTable 
                    tickets={rows} 
                    schema={schema} 
                    setData={setRows}
                    onRefreshData={fetchWorkspaceData}
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
            fixed right-0 top-[43px] bottom-0 z-30 w-[240px]
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
