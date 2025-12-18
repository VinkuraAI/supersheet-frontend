import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ToolbarProps } from "react-big-calendar";

export function CustomToolbar({ label, onNavigate, onView, view, date }: ToolbarProps) {

    // Helper to format the label purely based on date/view if needed, 
    // but 'label' prop from RBC is usually sufficient. 
    // We can customize it if we want 'October 2023' vs 'Oct 2023'.

    const goToBack = () => {
        onNavigate('PREV');
    };

    const goToNext = () => {
        onNavigate('NEXT');
    };

    const goToToday = () => {
        onNavigate('TODAY');
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 p-2 gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 rounded-md p-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToBack}
                        className="h-8 w-8 hover:bg-white hover:shadow-sm"
                    >
                        <ChevronLeft className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToToday}
                        className="h-8 px-3 text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-sm"
                    >
                        Today
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNext}
                        className="h-8 w-8 hover:bg-white hover:shadow-sm"
                    >
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                    </Button>
                </div>
                <h2 className="text-xl font-bold text-slate-800 ml-2 capitalize tracking-tight flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600 mb-0.5" />
                    {label}
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500 hidden sm:inline-block">
                    View:
                </span>
                <Select value={view} onValueChange={(v) => onView(v as any)}>
                    <SelectTrigger className="h-9 w-[120px] bg-white border-slate-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="agenda">Agenda</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
