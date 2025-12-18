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
import { CreateTaskDialog } from "@/components/pm/CreateTaskDialog";
import { CalendarView } from "@/components/pm/calendar/CalendarView";
import { RequestList } from "@/components/pm/requests/RequestList";
import { RequestCreateModal } from "@/components/pm/requests/RequestCreateModal";
import { IssueList } from "@/components/pm/issues/IssueList";
import { IssueCreateModal } from "@/components/pm/issues/IssueCreateModal";
import { AttachmentsView } from "@/components/pm/attachments/AttachmentsView";
import { TopBar } from "@/components/service-desk/topbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { PMSettingsView } from "@/components/pm/pm-settings-view";
import { PMReportView } from "@/components/pm/pm-report-view";

export default function PMWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspace();
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('summary');
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [requestTaskContext, setRequestTaskContext] = useState<{ id: string; title: string } | undefined>(undefined);
  const [issueTaskContext, setIssueTaskContext] = useState<{ id: string; title: string } | undefined>(undefined);
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

  const fetchTasks = async () => {
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
    fetchTasks();
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
    fetchTasks();
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
      fetchTasks();
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
      fetchTasks();
    }
  };

  const handleRequest = (task: any) => {
    setRequestTaskContext({ id: task._id, title: task.data?.summary });
    setIsRequestModalOpen(true);
  };

  const handleReportIssue = (task: any) => {
    setIssueTaskContext({ id: task._id, title: task.data?.summary });
    setIsIssueModalOpen(true);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col">
      <TopBar
        onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
        rightSidebarOpen={rightSidebarOpen}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {leftSidebarOpen && (
          <SideNav />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <PMTopNav currentView={currentView} onViewChange={setCurrentView} />

          <div className="flex-1 overflow-hidden p-6">
            {currentView === 'summary' && (
              <PMSummaryView
                workspaceName={selectedWorkspace?.name || "Workspace"}
                onCreateClick={handleCreateClick}
                tasks={tasks}
              />
            )}
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
            {currentView === 'list' && (
              <PMListView
                workspaceId={params.id as string}
                onCreateClick={handleCreateClick}
                onEditTask={handleEditTask}
                tasks={tasks}
                onDeleteTask={handleDeleteTask}
                onRequest={handleRequest}
                onReportIssue={handleReportIssue}
              />
            )}
            {currentView === 'calendar' && (
              <CalendarView
                tasks={tasks}
                onCreateClick={handleCreateClick}
                onEditTask={handleEditTask}
              />
            )}
            {currentView === 'approvals' && <RequestList onCreate={() => setIsRequestModalOpen(true)} />}
            {currentView === 'reports' && <PMReportView tasks={tasks} workspaceName={selectedWorkspace?.name || "Workspace"} />}
            {currentView === 'issues' && <IssueList onCreate={() => setIsIssueModalOpen(true)} />}
            {currentView === 'archived' && <IssueList isArchived />}
            {currentView === 'attachments' && <AttachmentsView />}
            {currentView === 'settings' && selectedWorkspace && <PMSettingsView workspaceId={selectedWorkspace._id} />}
          </div>
        </div>

        <CreateTaskDialog
          isOpen={isCreatePanelOpen}
          onClose={handleClosePanel}
          initialData={editingTask}
          onDelete={() => {
            if (editingTask) {
              handleDeleteTask(editingTask._id);
              setIsCreatePanelOpen(false);
              setEditingTask(null);
            }
          }}
        />

        <RequestCreateModal
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setRequestTaskContext(undefined);
          }}
          taskId={requestTaskContext?.id}
          taskTitle={requestTaskContext?.title}
          availableTasks={tasks}
        />

        <IssueCreateModal
          isOpen={isIssueModalOpen}
          onClose={() => {
            setIsIssueModalOpen(false);
            setIssueTaskContext(undefined);
          }}
          taskId={issueTaskContext?.id}
          taskTitle={issueTaskContext?.title}
          availableTasks={tasks}
        />
      </div>
    </div>
  );
}
