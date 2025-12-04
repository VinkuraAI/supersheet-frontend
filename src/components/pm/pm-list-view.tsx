"use client";

import { useState, useEffect } from "react";
import {
  Search, Filter, SlidersHorizontal, Share2, Download, MoreHorizontal,
  Plus, Calendar, ChevronDown, UserCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PMListViewProps {
  workspaceId: string;
  onCreateClick: () => void;
  onEditTask: (task: any) => void;
  tasks: any[];
  onDeleteTask?: (taskId: string) => void;
}

export function PMListView({ workspaceId, onCreateClick, onEditTask, tasks, onDeleteTask }: PMListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Removed LocalStorage logic as we now receive tasks via props

  const filteredTasks = tasks.filter(t =>
    (t.data?.summary || t.data?.content || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border-2 border-white hover:bg-slate-300 cursor-pointer" onClick={onCreateClick}>
                <Plus className="w-4 h-4" />
              </div>
            </div>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-sm">Filter</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-sm text-slate-500"><Share2 className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-slate-100 rounded-sm text-slate-500"><Download className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-slate-100 rounded-sm text-slate-500"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </div>

      {/* List Header */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-12">Type</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-24">Key</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Summary</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32">Status</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-40">Assignee</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32">Due Date</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Create Row */}
            <tr onClick={onCreateClick} className="hover:bg-slate-50 group cursor-pointer">
              <td className="px-6 py-3" colSpan={7}>
                <div className="flex items-center gap-2 text-slate-500 group-hover:text-blue-600">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Create</span>
                </div>
              </td>
            </tr>

            {/* Task Rows */}
            {filteredTasks.map((task) => (
              <tr
                key={task._id || task.id}
                className="hover:bg-slate-50 group transition-colors cursor-pointer"
                onClick={() => onEditTask(task)}
              >
                <td className="px-6 py-3">
                  <div className={cn(
                    "w-4 h-4 rounded-sm flex items-center justify-center",
                    task.data?.issueType === "Bug" ? "bg-red-500" :
                      task.data?.issueType === "Story" ? "bg-green-500" :
                        task.data?.issueType === "Epic" ? "bg-purple-500" :
                          "bg-blue-500"
                  )}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="text-sm text-slate-500 font-medium hover:underline">{task._id.slice(-4)}</span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-sm text-slate-700 font-medium group-hover:text-blue-600">{task.data?.summary || "Untitled"}</span>
                </td>
                <td className="px-6 py-3">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded uppercase",
                    task.data?.status === "todo" ? "bg-slate-100 text-slate-600" :
                      task.data?.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        task.data?.status === "done" ? "bg-emerald-100 text-emerald-700" :
                          task.data?.status === "in_review" ? "bg-purple-100 text-purple-700" :
                            task.data?.status === "blocked" ? "bg-red-100 text-red-700" :
                              "bg-slate-100 text-slate-600"
                  )}>
                    {task.data?.status || "todo"}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    {(!task.data?.assignee || task.data?.assignee === "Unassigned") ? (
                      <UserCircle2 className="w-6 h-6 text-slate-300" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[0.65rem] font-bold">
                        {task.data.assignee.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-slate-600">{task.data?.assignee || "Unassigned"}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="text-sm text-slate-500">{task.data?.dueDate ? new Date(task.data.dueDate).toLocaleDateString() : "None"}</span>
                </td>
                <td className="px-6 py-3">
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
            ))}
          </tbody>
        </table>

        {/* Empty State (if no tasks) */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-48 h-32 bg-slate-100 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-slate-300">Illustration</div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">View your work in a list</h3>
            <p className="text-slate-500 mb-6 max-w-sm text-center">
              Plan, track and manage your project in a spreadsheet-like view.
            </p>
            <button
              onClick={onCreateClick}
              className="px-4 py-2 bg-blue-700 text-white font-medium rounded-sm hover:bg-blue-800 transition-colors"
            >
              Create an item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
