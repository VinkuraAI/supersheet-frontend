"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";

interface PMTopNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "summary", label: "Summary" },
  { id: "board", label: "Board" },
  { id: "list", label: "List" },
  { id: "calendar", label: "Calendar" },
  { id: "approvals", label: "Request" },
  { id: "forms", label: "Forms" },
  { id: "pages", label: "Pages" },
  { id: "attachments", label: "Attachments" },
  { id: "issues", label: "Issues" },
  { id: "reports", label: "Reports" },
  { id: "archived", label: "Archived Issues" },
  { id: "shortcuts", label: "Shortcuts", hasDropdown: true },
];

export function PMTopNav({ currentView, onViewChange }: PMTopNavProps) {
  const { selectedWorkspace, currentRole } = useWorkspace();
  // Check if user has permission to view settings (Owner/Admin)
  const canViewSettings = currentRole === 'owner' || currentRole === 'admin';

  return (
    <div className="w-full bg-white border-b border-slate-200 px-4 flex items-center h-12 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1 min-w-max">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.hasDropdown && onViewChange(item.id)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-sm transition-colors flex items-center gap-1",
              currentView === item.id
                ? "text-blue-700 bg-blue-50 relative after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-700"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {item.label}
            {item.hasDropdown && <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-300 mx-2" />

        <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-sm">
          Automation
        </button>

        {canViewSettings && (
          <button
            onClick={() => onViewChange('settings')}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-sm"
          >
            Project Settings
          </button>
        )}
      </div>
    </div>
  );
}
