"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { workspaceService } from "@/features/workspace/services/workspace-service";
import apiClient from "@/utils/api.client";
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
  const [tasks, setTasks] = useState<any[]>([]);

  const loadWorkspace = async () => {
    if (params.id) {
      try {
        const details = await workspaceService.getWorkspaceDetails(params.id as string);
        setSelectedWorkspace(details);
        setTasks(details.table?.rows || []);
      } catch (error) {
        console.error("Failed to load workspace", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [params.id]);

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
    // Refresh tasks after close (in case created/edited)
    loadWorkspace();
  };

  const handleTaskMove = async (result: any) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId;
    
    // Optimistic update
    const updatedTasks = tasks.map(t => 
      t._id === draggableId ? { ...t, data: { ...t.data, status: newStatus } } : t
    );
    setTasks(updatedTasks);

    try {
      // Find the row to update
      const taskToUpdate = tasks.find(t => t._id === draggableId);
      if (taskToUpdate) {
        await apiClient.put(`/workspaces/${params.id}/rows/${draggableId}`, {
          rowData: { ...taskToUpdate.data, status: newStatus }
        });
      }
    } catch (error) {
      console.error("Failed to update task status", error);
      // Revert on error
      loadWorkspace();
    }
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
              tasks={tasks}
              onTaskMove={handleTaskMove}
            />
          )}
          {currentView === 'summary' && (
            <PMSummaryView 
              workspaceName={selectedWorkspace?.name || "Workspace"} 
              onCreateClick={handleCreateClick} 
              tasks={tasks}
            />
          )}
          {currentView === 'list' && (
            <PMListView 
              workspaceId={params.id as string} 
              onCreateClick={handleCreateClick}
              onEditTask={handleEditTask}
              tasks={tasks}
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

