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
import { TopBar } from "@/components/service-desk/topbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export default function PMWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspace();
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('summary');
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const { toast } = useToast();

  // Sidebar state
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 1272) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      } else {
        setLeftSidebarOpen(true);
        setRightSidebarOpen(false);
      }
    };

    // Run on mount
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      // Optimistic update
      setTasks(prev => prev.filter(t => t._id !== taskId));

      await apiClient.delete(`/workspaces/${params.id}/rows/${taskId}`);
      toast({
        title: "Task Deleted",
        description: "The task has been permanently deleted.",
      });
    } catch (error) {
      console.error("Failed to delete task", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task.",
      });
      // Revert
      loadWorkspace();
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-dvh flex flex-col text-[0.75rem]">
      <header className="fixed top-0 left-0 right-0 z-40 h-[60px] border-b bg-card">
        <TopBar
          onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
          onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
          rightSidebarOpen={rightSidebarOpen}
        />
      </header>

      <section className="flex flex-1 overflow-hidden relative pt-[60px]">
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

        {/* Main Content */}
        <div
          className={`
            flex-1 flex flex-col transition-all duration-300 min-w-0
            ${leftSidebarOpen ? "ml-[256px]" : "ml-0"}
            ${rightSidebarOpen ? "mr-[240px]" : "mr-0"}
          `}
        >
          {/* Top Navigation for PM Views */}
          <PMTopNav currentView={currentView} onViewChange={setCurrentView} />

          {/* View Content */}
          <div className="flex-1 overflow-hidden relative p-4">
            {currentView === 'board' && (
              <KanbanBoard
                workspaceId={params.id as string}
                onCreateClick={handleCreateClick}
                onEditTask={handleEditTask}
                tasks={tasks}
                onTaskMove={handleTaskMove}
                onDeleteTask={handleDeleteTask}
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
                onDeleteTask={handleDeleteTask}
              />
            )}
          </div>
        </div>

        {/* Right context panel placeholder - if needed later */}
        {/* 
        <aside
          className={`
            fixed right-0 top-[60px] bottom-0 z-30 w-[240px]
            bg-card border-l transition-transform duration-300
            overflow-y-auto scrollbar-hide
            ${rightSidebarOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
           <RightPanel /> 
        </aside> 
        */}
      </section>

      {/* Create/Edit Issue Panel */}
      <CreateIssuePanel
        isOpen={isCreatePanelOpen}
        onClose={handleClosePanel}
        initialData={editingTask}
        onDelete={handleDeleteTask}
      />
    </main>
  );
}
