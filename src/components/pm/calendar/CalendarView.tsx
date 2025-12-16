"use client";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";

// Setup the localizer by providing the moment (or globalize, or Luxon) instance
// to the localizer function.
const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  tasks: any[];
  onCreateClick: () => void;
  onEditTask: (task: any) => void;
}

export function CalendarView({ tasks, onCreateClick, onEditTask }: CalendarViewProps) {
  const { selectedWorkspace } = useWorkspace();
  const [date, setDate] = useState(new Date());

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
      };
    });

  const eventStyleGetter = (event: any) => {
    const backgroundColor = event.color;
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  return (
    <div className="h-full w-full bg-white p-4 overflow-hidden flex flex-col">
       <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Calendar</h2>
         <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-blue-700 text-white font-medium rounded-sm hover:bg-blue-800 transition-colors text-sm"
          >
            Create Task
          </button>
      </div>
      <div className="flex-1">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={["month", "week", "day"]}
          defaultView="month"
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          onSelectEvent={(event) => onEditTask(event.resource)}
          eventPropGetter={eventStyleGetter}
          components={{
            event: (props) => (
              <div className="text-xs p-1 font-medium truncate">
                {props.title}
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
