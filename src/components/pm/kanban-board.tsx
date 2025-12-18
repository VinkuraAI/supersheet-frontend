"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, Clock, CheckCircle2, Circle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  content?: string; // Legacy support
  summary: string;
  status: 'todo' | 'ongoing' | 'completed' | 'in_review' | 'blocked';
  priority: string;
  assignee: string;
  issueType: string;
}

interface KanbanBoardProps {
  workspaceId: string;
  onCreateClick: () => void;
  onEditTask: (task: any) => void;
  tasks: any[];
  onTaskMove: (result: any) => void;
  onDeleteTask?: (taskId: string) => void;
}

import { useWorkspace } from "@/lib/workspace-context";

// ... previous imports ...

import { useTeams } from "@/features/workspace/hooks/use-teams";
import { useUser } from "@/lib/user-context";

export function KanbanBoard({ workspaceId, onCreateClick, onEditTask, tasks, onTaskMove, onDeleteTask }: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedWorkspace, currentRole } = useWorkspace();
  const { user } = useUser();
  const { data: teams } = useTeams(workspaceId);

  // Check if user is a leader of any team in this workspace
  const isTeamLeader = teams?.some((team: any) => team.leader === (user as any)?.id || team.leader?._id === (user as any)?.id || team.leader === (user as any)?._id || team.leader?._id === (user as any)?._id);

  // Permission check: Owner, Admin, Editor OR Team Leader can create.
  const canCreate = currentRole === 'owner' || currentRole === 'admin' || currentRole === 'editor' || isTeamLeader;

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    onTaskMove(result);
  };

  const columns = [
    { id: 'todo', title: 'TO DO', bg: 'bg-slate-100' },
    { id: 'in_progress', title: 'IN PROGRESS', bg: 'bg-blue-50' },
    { id: 'in_review', title: 'IN REVIEW', bg: 'bg-purple-50' },
    { id: 'blocked', title: 'BLOCKED', bg: 'bg-red-50' },
    { id: 'done', title: 'DONE', bg: 'bg-emerald-50' },
  ];

  const filteredTasks = tasks.filter(t =>
    (t.data?.summary || t.data?.content || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to normalize status
  const getTaskStatus = (status: string) => {
    if (status === 'ongoing') return 'in_progress';
    if (status === 'completed') return 'done';
    return status || 'todo';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Board Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search board"
              className="pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-sm w-48 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white">FO</div>
            {canCreate && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border-2 border-white hover:bg-slate-300 cursor-pointer" onClick={onCreateClick}>
                <Plus className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">Group by: Status</span>
          <MoreHorizontal className="w-5 h-5 text-slate-500 cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-64 h-48 bg-slate-100 rounded-lg mb-6 flex items-center justify-center shadow-inner">
              <div className="text-slate-300 font-medium">No Tasks Yet</div>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Visualize your work with a board</h2>
            <p className="text-slate-600 mb-6 max-w-md">Track, organize and prioritize your team&apos;s work. Get started by creating an item for your team.</p>
            {canCreate ? (
              <button
                onClick={onCreateClick}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Create an item
              </button>
            ) : (
              <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-200">
                Team leader will assign tasks to you.
              </div>
            )}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 min-w-max pb-4">
              {columns.map(col => (
                <div key={col.id} className="w-[280px] flex flex-col h-full rounded-lg bg-slate-100/50 border border-slate-200/60 shadow-sm transition-colors hover:bg-slate-100/80">
                  <div className="p-3 flex items-center justify-between border-b border-white/50">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full",
                        col.id === 'todo' ? "bg-slate-400" :
                          col.id === 'in_progress' ? "bg-blue-400" :
                            col.id === 'done' ? "bg-emerald-400" : "bg-slate-400"
                      )} />
                      <span className="font-semibold text-xs text-slate-700 uppercase tracking-wide">{col.title}</span>
                      <span className="text-xs text-slate-500 font-medium bg-white px-1.5 py-0.5 rounded-full shadow-sm">
                        {filteredTasks.filter(t => getTaskStatus(t.data?.status) === col.id).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Header actions if needed */}
                    </div>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided: any, snapshot: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 px-2 pb-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent pt-2",
                          snapshot.isDraggingOver ? "bg-blue-50/30" : ""
                        )}
                      >
                        {filteredTasks
                          .filter(t => getTaskStatus(t.data?.status) === col.id)
                          .map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided: any, snapshot: any) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "bg-white p-3.5 rounded-md shadow-sm border border-slate-200/80 group hover:shadow-md hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing relative",
                                    snapshot.isDragging ? "shadow-xl ring-2 ring-blue-500/20 rotate-2 z-50 scale-105" : ""
                                  )}
                                  onClick={() => onEditTask(task)}
                                >
                                  <div className="flex justify-between items-start mb-2.5">
                                    <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-relaxed">{task.data?.summary || task.data?.content}</p>
                                    {canCreate && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditTask(task);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-md transition-all absolute top-2 right-2 text-slate-400 hover:text-blue-600"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                      <div className={cn(
                                        "w-4 h-4 rounded-[4px] flex items-center justify-center shadow-sm",
                                        task.data?.issueType === "Bug" ? "bg-red-500" :
                                          task.data?.issueType === "Story" ? "bg-green-500" :
                                            task.data?.issueType === "Epic" ? "bg-purple-500" :
                                              "bg-blue-500"
                                      )} title={task.data?.issueType}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90" />
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {task._id.slice(-4)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {task.data?.priority === "Highest" && <div className="w-2 h-2 bg-red-500 rounded-full" title="Highest Priority" />}
                                      {task.data?.priority === "High" && <div className="w-2 h-2 bg-orange-500 rounded-full" title="High Priority" />}

                                      <div title={task.data?.assignee || "Unassigned"} className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[0.6rem] font-bold shadow-sm">
                                        {task.data?.assignee?.slice(0, 2).toUpperCase() || "UN"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}

                        {canCreate && (
                          <button
                            onClick={onCreateClick}
                            className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-md text-sm transition-all border border-dashed border-slate-300 hover:border-blue-300"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-xs font-medium">Create Issue</span>
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}

              <div className="w-[280px] shrink-0">
                <button className="w-full h-12 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                  <span className="text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add Column</span>
                </button>
              </div>
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
