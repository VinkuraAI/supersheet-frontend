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

export function KanbanBoard({ workspaceId, onCreateClick, onEditTask, tasks, onTaskMove, onDeleteTask }: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border-2 border-white hover:bg-slate-300 cursor-pointer" onClick={onCreateClick}>
              <Plus className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">Group by: Status</span>
          <MoreHorizontal className="w-5 h-5 text-slate-500 cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-50/50">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-64 h-48 bg-slate-100 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-slate-300">Illustration</div>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Visualize your work with a board</h2>
            <p className="text-slate-600 mb-6 max-w-md">Track, organize and prioritize your team&apos;s work. Get started by creating an item for your team.</p>
            <button
              onClick={onCreateClick}
              className="px-4 py-2 bg-blue-700 text-white font-medium rounded-sm hover:bg-blue-800 transition-colors"
            >
              Create an item
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 min-w-max">
              {columns.map(col => (
                <div key={col.id} className="w-[280px] flex flex-col h-full rounded-sm bg-slate-100/50">
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-500 uppercase tracking-wide">{col.title}</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {filteredTasks.filter(t => getTaskStatus(t.data?.status) === col.id).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={onCreateClick} className="p-1 hover:bg-slate-200 rounded-sm text-slate-400 hover:text-slate-600">
                        <Plus className="w-4 h-4" />
                      </button>
                      <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided: any, snapshot: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 px-2 pb-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300",
                          snapshot.isDraggingOver ? "bg-slate-200/50" : ""
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
                                    "bg-white p-3 rounded-sm shadow-sm border border-slate-200 group hover:bg-slate-50 transition-colors cursor-grab active:cursor-grabbing relative",
                                    snapshot.isDragging ? "shadow-lg rotate-1 z-50" : ""
                                  )}
                                  onClick={() => onEditTask(task)}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm text-slate-800 line-clamp-2">{task.data?.summary || task.data?.content}</p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditTask(task);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-opacity absolute top-2 right-2"
                                    >
                                      <Pencil className="w-3 h-3 text-slate-500" />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                      <div className={cn(
                                        "w-4 h-4 rounded-sm flex items-center justify-center",
                                        task.data?.issueType === "Bug" ? "bg-red-500" :
                                          task.data?.issueType === "Story" ? "bg-green-500" :
                                            task.data?.issueType === "Epic" ? "bg-purple-500" :
                                              "bg-blue-500"
                                      )}>
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                      </div>
                                      <span className="text-xs text-slate-500 font-medium hover:underline cursor-pointer">
                                        {task._id.slice(-4)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {task.data?.priority === "Highest" && <div className="w-3 h-3 bg-red-500 rounded-full" title="Highest" />}
                                      {task.data?.priority === "High" && <div className="w-3 h-3 bg-orange-500 rounded-full" title="High" />}
                                      {task.data?.priority === "Medium" && <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Medium" />}
                                      {task.data?.priority === "Low" && <div className="w-3 h-3 bg-blue-500 rounded-full" title="Low" />}

                                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[0.65rem] font-bold">
                                        {task.data?.assignee?.slice(0, 2).toUpperCase() || "UN"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}

                        <button
                          onClick={onCreateClick}
                          className="w-full py-2 flex items-center gap-2 text-slate-500 hover:bg-slate-200 rounded-sm text-sm transition-colors px-2"
                        >
                          <Plus className="w-4 h-4" />
                          Create
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}

              <div className="w-[280px]">
                <button className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-sm flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
