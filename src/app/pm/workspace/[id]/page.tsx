"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { workspaceService } from "@/features/workspace/services/workspace-service";
import { SideNav } from "@/components/service-desk/sidenav";
import { PMTopNav } from "@/components/pm/pm-top-nav";
import { KanbanBoard } from "@/components/pm/kanban-board";
import { PMSummaryView } from "@/components/pm/pm-summary-view";
import { PMListView } from "@/components/pm/pm-list-view";
import { CreateIssuePanel } from "@/components/pm/create-issue-panel";

export default function PMWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspace();
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('summary');
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  useEffect(() => {
    const loadWorkspace = async () => {
      if (params.id) {
        try {
          // In a real app, we would fetch by ID. 
          // For now, we'll try to find it in the list or just set the ID
          const workspaces = await workspaceService.getWorkspaces();
          const found = workspaces.ownedWorkspaces.find(w => w._id === params.id) || 
                        workspaces.sharedWorkspaces.find(w => w._id === params.id);
          
          if (found) {
            setSelectedWorkspace(found);
          } else {
            // Fallback if not found in list (e.g. direct link)
            // We might need a getWorkspaceById service method
          }
        } catch (error) {
          console.error("Failed to load workspace", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWorkspace();
  }, [params.id, setSelectedWorkspace]);

  const handleCreateClick = () => {
    setEditingTask(null);
    setIsCreatePanelOpen(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsCreatePanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsCreatePanelOpen(false);
    setEditingTask(null);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <SideNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <PMTopNav currentView={currentView} onViewChange={setCurrentView} />

        {/* View Content */}
        <div className="flex-1 overflow-hidden relative">
          {currentView === 'board' && (
            <KanbanBoard 
              workspaceId={params.id as string} 
              onCreateClick={handleCreateClick}
              onEditTask={handleEditTask}
            />
          )}
          {currentView === 'summary' && (
            <PMSummaryView 
              workspaceName={selectedWorkspace?.name || "Workspace"} 
              onCreateClick={handleCreateClick} 
            />
          )}
          {currentView === 'list' && (
            <PMListView 
              workspaceId={params.id as string} 
              onCreateClick={handleCreateClick}
              onEditTask={handleEditTask}
            />
          )}
          {/* Add other views here */}
        </div>
      </div>

      {/* Create/Edit Issue Panel */}
      <CreateIssuePanel 
        isOpen={isCreatePanelOpen} 
        onClose={handleClosePanel}
        initialData={editingTask}
      />
    </div>
  );
}

