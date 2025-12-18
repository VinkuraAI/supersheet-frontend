"use client";

import { useState, useEffect } from "react";
import {
  Search, Filter, SlidersHorizontal, Share2, Download, MoreHorizontal,
  Plus, Calendar, ChevronDown, UserCircle2, FileText, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface PMListViewProps {
  workspaceId: string;
  onCreateClick: () => void;
  onEditTask: (task: any) => void;
  tasks: any[];
  onDeleteTask?: (taskId: string) => void;
  onRequest: (task: any) => void;
  onReportIssue: (task: any) => void;
}

import { useWorkspace } from "@/lib/workspace-context";
import { useUser } from "@/lib/user-context";

import { useTeams } from "@/features/workspace/hooks/use-teams";

export function PMListView({ workspaceId, onCreateClick, onEditTask, tasks, onDeleteTask, onRequest, onReportIssue }: PMListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState<"all" | "assigned_to_me">("all");
  const { currentRole } = useWorkspace();
  const { user } = useUser();
  const { data: teams } = useTeams(workspaceId);

  // Check if user is a leader of any team
  const isTeamLeader = teams?.some((team: any) => team.leader === (user as any)?.id || team.leader?._id === (user as any)?.id || team.leader === (user as any)?._id || team.leader?._id === (user as any)?._id);

  // Permission check
  const canCreate = currentRole === 'owner' || currentRole === 'admin' || currentRole === 'editor' || isTeamLeader;

  // Filter tasks logic
  const filteredTasks = tasks.filter(t => {
    // 1. Search Query
    const matchesSearch = (t.data?.summary || t.data?.content || "").toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Assigned to Me Filter
    let matchesFilter = true;
    if (currentFilter === "assigned_to_me" && user) {
      // Check "assignee" (single) or "assignedTo" (multiple)
      const assigneeName = t.data?.assignee;
      const assignedToArray = t.data?.assignedTo || [];
      // Match against user name (since we store names in assignee currently, improving to ID would be better but following existing pattern)
      const userName = (user as any).name || "";

      matchesFilter = assigneeName === userName || assignedToArray.includes(userName);
    }

    return matchesSearch && matchesFilter;
  });

  // Pagination Logic
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, currentFilter]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-sm w-64 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white">FO</div>
              {canCreate && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border-2 border-white hover:bg-slate-300 cursor-pointer" onClick={onCreateClick}>
                  <Plus className="w-4 h-4" />
                </div>
              )}
            </div>
            {/* Filter Toggle */}
            <div className="flex bg-slate-100 rounded-sm p-0.5">
              <button
                onClick={() => setCurrentFilter("all")}
                className={cn("px-3 py-1 text-xs font-medium rounded-sm transition-all", currentFilter === "all" ? "bg-white shadow text-blue-700" : "text-slate-500 hover:text-slate-700")}
              >
                All Tasks
              </button>
              <button
                onClick={() => setCurrentFilter("assigned_to_me")}
                className={cn("px-3 py-1 text-xs font-medium rounded-sm transition-all", currentFilter === "assigned_to_me" ? "bg-white shadow text-blue-700" : "text-slate-500 hover:text-slate-700")}
              >
                Assigned to Me
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-sm text-slate-500"><Share2 className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-slate-100 rounded-sm text-slate-500"><Download className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-slate-100 rounded-sm text-slate-500"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </div>

      {/* List Header */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-300">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-12 text-center">Type</th>
              <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-24 whitespace-nowrap">Key</th>
              <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">Summary</th>
              <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32 whitespace-nowrap">Status</th>
              <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-40 whitespace-nowrap">Assignee</th>
              <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32 whitespace-nowrap">Due Date</th>
              <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32 whitespace-nowrap">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {/* Create Row - Only if allowed */}
            {canCreate && (
              <tr onClick={onCreateClick} className="hover:bg-blue-50/50 group cursor-pointer transition-colors border-l-4 border-l-transparent hover:border-l-blue-500">
                <td className="px-6 py-3" colSpan={7}>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-600 transition-colors pl-2">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Create new task...</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Task Rows */}
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <ContextMenu key={task._id || task.id}>
                  <ContextMenuTrigger asChild>
                    <tr
                      className="hover:bg-slate-50/80 group transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-blue-400"
                      onClick={() => onEditTask(task)}
                    >
                      <td className="px-6 py-3 text-center">
                        <div className={cn(
                          "w-5 h-5 rounded-[4px] flex items-center justify-center mx-auto shadow-sm",
                          task.data?.issueType === "Bug" ? "bg-red-500" :
                            task.data?.issueType === "Story" ? "bg-green-500" :
                              task.data?.issueType === "Epic" ? "bg-purple-500" :
                                "bg-blue-500"
                        )}>
                          <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90" />
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="text-sm text-slate-500 font-medium hover:text-blue-600 hover:underline font-mono">{task._id.slice(-4)}</span>
                      </td>
                      <td className="px-6 py-3 max-w-[400px]">
                        <span className="text-sm text-slate-700 font-medium group-hover:text-blue-700 line-clamp-1">{task.data?.summary || "Untitled"}</span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={cn(
                          "text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
                          task.data?.status === "todo" ? "bg-slate-100 text-slate-600" :
                            task.data?.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                              task.data?.status === "done" ? "bg-emerald-100 text-emerald-700" :
                                task.data?.status === "in_review" ? "bg-purple-100 text-purple-700" :
                                  task.data?.status === "blocked" ? "bg-red-100 text-red-700" :
                                    "bg-slate-100 text-slate-600"
                        )}>
                          {task.data?.status?.replace('_', ' ') || "todo"}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {(!task.data?.assignee || task.data?.assignee === "Unassigned") ? (
                            <UserCircle2 className="w-6 h-6 text-slate-300" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[0.65rem] font-bold shadow-sm border border-emerald-200">
                              {task.data.assignee.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-slate-600 truncate max-w-[100px]">{task.data?.assignee || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={cn("text-sm", task.data?.dueDate && new Date(task.data.dueDate) < new Date() ? "text-red-600 font-medium" : "text-slate-500")}>
                          {task.data?.dueDate ? new Date(task.data.dueDate).toLocaleDateString() : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {task.data?.priority === "Highest" ? <ChevronDown className="w-4 h-4 text-red-500 rotate-180" /> :
                            task.data?.priority === "High" ? <ChevronDown className="w-4 h-4 text-orange-500 rotate-180" /> :
                              task.data?.priority === "Medium" ? <div className="w-4 h-4 flex items-center justify-center"><div className="w-3 h-0.5 bg-yellow-500" /></div> :
                                <ChevronDown className="w-4 h-4 text-blue-500" />
                          }
                          <span className="text-sm text-slate-600">{task.data?.priority || "Medium"}</span>
                        </div>
                      </td>
                    </tr>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => onRequest(task)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Request
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => onReportIssue(task)}>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Report Issue
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-500">
                  <p className="text-sm font-medium">{tasks.length === 0 ? "No tasks found." : "No tasks match your filter."}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Empty State (if no tasks in workspace at all) */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in duration-500">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">View your work in a list</h3>
            <p className="text-slate-500 mb-3 max-w-sm text-center">
              Plan, track and manage your project in a spreadsheet-like view.
            </p>
            {canCreate ? (
              <button
                onClick={onCreateClick}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                Create an item
              </button>
            ) : (
              <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-200">
                Team leader will assign tasks to you.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
