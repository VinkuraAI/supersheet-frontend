"use client";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { useUser } from "@/lib/user-context";
import { useTeams } from "@/features/workspace/hooks/use-teams";
import { CustomToolbar } from "./CustomToolbar";
import { cn } from "@/lib/utils";

// Setup the localizer by providing the moment (or globalize, or Luxon) instance
// to the localizer function.
const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  tasks: any[];
  onCreateClick: () => void;
  onEditTask: (task: any) => void;
  workspaceId: string; // Ensure we pass this or get from context if possible, but context is safer if prop missing
}

export function CalendarView({ tasks, onCreateClick, onEditTask, workspaceId }: CalendarViewProps) {
  const { selectedWorkspace, currentRole } = useWorkspace();
  const { user } = useUser();
  const [date, setDate] = useState(new Date());

  // Using workspaceId prop or fallback to selectedWorkspace._id if safer, 
  // but prop is cleaner if parent grants it.
  const targetWorkspaceId = workspaceId || selectedWorkspace?._id || "";
  const { data: teams } = useTeams(targetWorkspaceId);

  // Check if user is a leader of any team in this workspace
  const isTeamLeader = teams?.some((team: any) => team.leader === (user as any)?.id || team.leader?._id === (user as any)?.id || team.leader === (user as any)?._id || team.leader?._id === (user as any)?._id);

  // Permission check: Owner, Admin, Editor OR Team Leader can create.
  const canCreate = currentRole === 'owner' || currentRole === 'admin' || currentRole === 'editor' || isTeamLeader;


  // Map tasks to events
  const events = tasks
    .filter((task) => task.data?.dueDate) // Keep filter for dueDate validity base
    .map((task) => {
      let start = task.data?.startDate ? new Date(task.data.startDate) : new Date(task.data.dueDate);
      let end = new Date(task.data.dueDate);

      // If start > end (legacy bad data), ensure start = end
      if (start > end) start = end;

      return {
        id: task._id,
        title: task.data?.summary || 'Untitled',
        start: start,
        end: end,
        allDay: true, // Default to all day for simplicity unless we have times
        resource: task,
        color: task.data?.color || "#3b82f6",
        status: task.data?.status || 'todo',
        priority: task.data?.priority || 'Medium',
      };
    });

  const eventStyleGetter = (event: any) => {
    const backgroundColor = event.color;
    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        fontSize: "0.85rem",
        padding: "2px 5px",
        marginBottom: "2px"
      },
    };
  };

  const CustomEvent = ({ event }: any) => {
    return (
      <div className="flex flex-col h-full justify-center overflow-hidden" title={`${event.title} (${event.status})`}>
        <div className="font-semibold text-xs truncate leading-tight">{event.title}</div>
        {/* Optional: Show status or priority dot */}
        {/* <div className="text-[10px] opacity-80 truncate">{event.status}</div> */}
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-white p-6 overflow-hidden flex flex-col rounded-xl shadow-sm border border-slate-100/50">

      <div className="flex items-center justify-between mb-2">
        {/* Header is handled by toolbar now, but we put the create button here or integrate? 
               The toolbar is inside the Calendar component. 
               We can put the CREATE button top-right above the calendar. 
           */}
        <div className="flex-1"></div> {/* Spacer to push button right if needed, or remove if we want it aligned with toolbar */}

        {canCreate && (
          <button
            onClick={onCreateClick}
            className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center gap-2"
          >
            <span>+ Create Task</span>
          </button>
        )}
        {!canCreate && (
          <div className="mb-4 text-sm text-slate-500 italic px-2">
            Read-only view
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
        {/* min-h-0 is crucial for flex child scroll */}
        <div className="absolute inset-0">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={["month", "week", "day", "agenda"]}
            defaultView="month"
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            onSelectEvent={(event) => onEditTask(event.resource)}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
              event: CustomEvent,
            }}
            popup
            selectable={canCreate} // Only selectable if can create? Or just always selectable for slots.
            onSelectSlot={(slotInfo) => {
              if (canCreate) {
                // Ideally open create dialog with date pre-filled
                onCreateClick();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
