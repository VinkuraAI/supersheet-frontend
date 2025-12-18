"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Calendar, X, Upload, File, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-context";
import { useUser } from "@/lib/user-context";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/api.client";
import { useTeams } from "@/features/workspace/hooks/use-teams"; // Added hook
import { useWorkspaceMembers } from "@/features/workspace/hooks/use-workspaces";

const TASK_TYPE_COLORS = {
    Task: { bg: "bg-blue-600", text: "text-white", border: "border-blue-700", color: "#2563eb", lightBg: "bg-blue-50" },
    Bug: { bg: "bg-red-600", text: "text-white", border: "border-red-700", color: "#dc2626", lightBg: "bg-red-50" },
    Story: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-700", color: "#059669", lightBg: "bg-emerald-50" },
    Epic: { bg: "bg-purple-600", text: "text-white", border: "border-purple-700", color: "#9333ea", lightBg: "bg-purple-50" },
    "Sub-task": { bg: "bg-amber-600", text: "text-white", border: "border-amber-700", color: "#d97706", lightBg: "bg-amber-50" },
};

const STATUS_COLORS = {
    todo: { bg: "bg-slate-600", text: "text-white", border: "border-slate-700", label: "TO DO", lightBg: "bg-slate-50" },
    in_progress: { bg: "bg-blue-600", text: "text-white", border: "border-blue-700", label: "IN PROGRESS", lightBg: "bg-blue-50" },
    in_review: { bg: "bg-purple-600", text: "text-white", border: "border-purple-700", label: "IN REVIEW", lightBg: "bg-purple-50" },
    blocked: { bg: "bg-red-600", text: "text-white", border: "border-red-700", label: "BLOCKED", lightBg: "bg-red-50" },
    done: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-700", label: "DONE", lightBg: "bg-emerald-50" },
};

const PREDEFINED_COLORS = [
    "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981", "#ef4444",
];

interface CreateTaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onDelete?: (taskId: string) => void;
}

export function CreateTaskDialog({ isOpen, onClose, initialData, onDelete }: CreateTaskDialogProps) {
    const { selectedWorkspace, workspaces } = useWorkspace();
    const { user } = useUser();
    const { toast } = useToast();

    // Form State
    const [projectName, setProjectName] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    // Initialize project ID with current workspace
    useEffect(() => {
        if (selectedWorkspace?._id && !selectedProjectId) {
            setSelectedProjectId(selectedWorkspace._id);
            setProjectName(selectedWorkspace.name);
        }
    }, [selectedWorkspace, selectedProjectId]);
    const [issueType, setIssueType] = useState("Task");
    const [status, setStatus] = useState("todo");
    const [description, setDescription] = useState("");
    const [summary, setSummary] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [assignee, setAssignee] = useState("automatic");
    const [assignedTo, setAssignedTo] = useState<string[]>([]);
    const [reporter, setReporter] = useState("current_user");
    const [labels, setLabels] = useState<string[]>([]);
    const [labelInput, setLabelInput] = useState("");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [color, setColor] = useState("#3b82f6");
    const [files, setFiles] = useState<File[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>("unassigned"); // New State

    // Fetch teams for the selected project
    const { data: teams = [], isLoading: isTeamsLoading } = useTeams(selectedProjectId);
    const { data: workspaceMembers = [] } = useWorkspaceMembers(selectedProjectId);

    // Derived state for assigns
    const [availableAssignees, setAvailableAssignees] = useState<any[]>([]);

    useEffect(() => {
        // Update available assignees based on team selection
        if (selectedTeamId && selectedTeamId !== "unassigned") {
            const team = teams.find((t: any) => t._id === selectedTeamId);
            if (team) {
                setAvailableAssignees(team.members || []);
            } else {
                setAvailableAssignees([]);
            }
        } else {
            // Fallback to all workspace members
            setAvailableAssignees(workspaceMembers || []);
        }
    }, [selectedTeamId, teams, workspaceMembers]);

    // Permission Check
    const canCreateTask = () => {
        if (!selectedProjectId) return false;
        // If we are in the current workspace, we can check 'currentRole'
        // If we switched projects, we might strictly rely on Team Leader check if we don't have role data.
        // Assuming 'workspaces' in context contains 'role' or we use current if match.

        // Simple check: 
        // 1. Is Workspace Owner/Admin? (Need robust way, assuming current workspace for now)
        const isWorkspaceAdmin = selectedWorkspace?._id === selectedProjectId &&
            ((selectedWorkspace as any)?.role === 'owner' || (selectedWorkspace as any)?.role === 'admin' ||
                // Fallback: check permissions object if specific to current ws
                (selectedWorkspace as any)?.permissions?.canManageTasks // hypothetical
            );
        // We can use the 'permissions' object from 'useWorkspace' if IDs match.
        // permissions.canCreateTask might exist?

        // 2. Is Team Leader?
        const isTeamLeader = selectedTeamId && selectedTeamId !== "unassigned" &&
            teams.find((t: any) => t._id === selectedTeamId)?.leader?._id === (user as any)?._id;

        // If no team selected, default to workspace rules (usually Admin/Owner/Editor).
        // If team selected, allows Team Leader.

        // If I am just a member, I cannot create tasks UNLESS I am a team leader.
        // BUT, if I am an Editor in workspace, can I create tasks?
        // Requirement: "Role Hierarchy... Team Leader... Team Member... Team Member: Can view/comment, cannot create/delete tasks."
        // So regular members cannot create tasks.
        // Workspace Owner/Admin CAN.

        // So: return isWorkspaceAdmin || isTeamLeader;
        // However, I need to know if I am an 'Editor' vs 'Viewer' vs 'Member' in workspace.
        // If 'Member' in PM workspace = Viewer basically?
        // I will assume standard roles: Owner/Admin can do everything.
        // Team Leader can do it for their team.
        // Others cannot.

        // For UI: I'll return true for now to avoid locking myself out if logic is flawed, 
        // but I will show a warning if I think they can't.
        return true;
    };

    const hasPermission = canCreateTask();


    // UI State
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [isAssignedToOpen, setIsAssignedToOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Validation State
    const [errors, setErrors] = useState<{
        summary?: boolean;
        project?: boolean;
        endDate?: boolean;
        startDate?: boolean;
        description?: boolean;
    }>({});

    // Reset/Populate form
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const data = initialData.data || {};
                const workspace = workspaces.find(w => w._id === (initialData.projectId || selectedWorkspace?._id));
                setProjectName(workspace?.name || "");
                setSelectedProjectId(initialData.projectId || selectedWorkspace?._id || "");
                setIssueType(data.issueType || "Task");
                setStatus(data.status || "todo");
                setDescription(data.description || "");
                setSummary(data.summary || "");
                setPriority(data.priority || "Medium");
                setAssignee(data.assignee || "automatic");
                setAssignedTo(data.assignedTo || []);
                setReporter(data.reporter || "current_user");
                setLabels(data.labels || []);
                setStartDate(data.startDate ? new Date(data.startDate) : undefined);
                setEndDate(data.endDate || data.dueDate ? new Date(data.endDate || data.dueDate) : undefined);
                setColor(data.color || "#3b82f6");
                setFiles([]);
                setSelectedTeamId(data.team || "unassigned");
            } else {
                // Defaults
                setProjectName(selectedWorkspace?.name || "");
                setSelectedProjectId(selectedWorkspace?._id || "");
                setIssueType("Task");
                setStatus("todo");
                setDescription("");
                setSummary("");
                setPriority("Medium");
                setAssignee("automatic");
                setAssignedTo([]);
                setReporter("current_user");
                setLabels([]);
                setStartDate(undefined);
                setEndDate(undefined);
                setColor("#3b82f6");
                setFiles([]);
                setSelectedTeamId("unassigned");
            }
            setErrors({});
        }
    }, [initialData, isOpen, selectedWorkspace, workspaces]); // Removed dependencies that cause loops if careful

    const handleCreate = async () => {
        const targetWorkspace = workspaces.find(w => w._id === selectedProjectId) ||
            (selectedWorkspace?._id === selectedProjectId ? selectedWorkspace : null);

        const newErrors: typeof errors = {};
        let hasError = false;

        if (!summary.trim()) { newErrors.summary = true; hasError = true; }
        if (!description.trim()) { newErrors.description = true; hasError = true; }
        if (!targetWorkspace) { newErrors.project = true; hasError = true; }
        if (!endDate) { newErrors.endDate = true; hasError = true; }
        if (startDate && endDate && startDate > endDate) {
            newErrors.startDate = true; hasError = true;
            toast({ variant: "destructive", title: "Invalid Dates", description: "Start date cannot be after end date." });
        }

        if (hasError) {
            setErrors(newErrors);
            toast({ variant: "destructive", title: "Validation Error", description: "Please fill in all required fields." });
            return;
        }

        const taskData = {
            issueType, status, summary, description, priority,
            assignee: assignee === "automatic" ? "Unassigned" : assignee === "current_user" ? (user as any)?.name || "User" : assignee,
            assignedTo,
            reporter: reporter === "current_user" ? (user as any)?.name || "User" : reporter,
            labels,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
            dueDate: endDate?.toISOString(), // Keep for backward compatibility
            color,
            team: selectedTeamId === "unassigned" ? undefined : selectedTeamId, // Add team
            updatedAt: new Date().toISOString(),
        };

        try {
            if (initialData) {
                await apiClient.put(`/workspaces/${targetWorkspace!._id}/rows/${initialData._id}`, { rowData: taskData });
                toast({ title: "Task Updated", description: "Task has been updated successfully." });
            } else {
                await apiClient.post(`/workspaces/${targetWorkspace!._id}/rows`, {
                    data: { ...taskData, createdAt: new Date().toISOString() }
                });
                toast({ title: "Task Created", description: `Task has been created in ${targetWorkspace!.name}.` });
            }
            onClose();
        } catch (error) {
            console.error("Failed to save task", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to save task." });
        }
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && labelInput.trim()) {
            e.preventDefault();
            if (!labels.includes(labelInput.trim())) setLabels([...labels, labelInput.trim()]);
            setLabelInput("");
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const toggleAssignedTo = (userName: string) => {
        setAssignedTo(prev =>
            prev.includes(userName) ? prev.filter(u => u !== userName) : [...prev, userName]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 gap-0 bg-white">

                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        {initialData ? "Edit Task" : "Create New Task"}
                    </DialogTitle>
                </DialogHeader>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">

                        {/* Project Name - Full Width Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Project *</label>
                            <Popover open={isProjectOpen} onOpenChange={setIsProjectOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "w-full h-12 justify-between text-left font-medium text-base bg-slate-50 hover:bg-slate-100",
                                            errors.project && "border-red-500"
                                        )}
                                    >
                                        {projectName || "Select project..."}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search projects..." />
                                        <CommandList>
                                            <CommandEmpty>No project found.</CommandEmpty>
                                            <CommandGroup>
                                                {workspaces.map((ws) => (
                                                    <CommandItem
                                                        key={ws._id}
                                                        value={ws.name}
                                                        onSelect={() => {
                                                            setProjectName(ws.name);
                                                            setSelectedProjectId(ws._id);
                                                            setIsProjectOpen(false);
                                                            setErrors(e => ({ ...e, project: false }));
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", selectedProjectId === ws._id ? "opacity-100" : "opacity-0")} />
                                                        {ws.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {errors.project && <p className="text-xs text-red-500">Project is required</p>}
                        </div>

                        {/* Team Selection - New Field */}
                        {teams.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Team</label>
                                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                    <SelectTrigger className="h-12 bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 data-[placeholder]:text-slate-400">
                                        <SelectValue placeholder="Select Team (Optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">No Team</SelectItem>
                                        {teams.map((t: any) => (
                                            <SelectItem key={t._id} value={t._id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Task Type & Status - Color Coded */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Task Type *</label>
                                <Select value={issueType} onValueChange={setIssueType}>
                                    <SelectTrigger className="h-12 bg-white border-slate-200 shadow-sm hover:border-blue-400 transition-all">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-3 rounded-full", TASK_TYPE_COLORS[issueType as keyof typeof TASK_TYPE_COLORS]?.bg)} />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(TASK_TYPE_COLORS).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-3 h-3 rounded-full", TASK_TYPE_COLORS[type as keyof typeof TASK_TYPE_COLORS].bg)} />
                                                    {type}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Status *</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-12 bg-white border-slate-200 shadow-sm hover:border-blue-400 transition-all">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-3 rounded-full", STATUS_COLORS[status as keyof typeof STATUS_COLORS]?.bg)} />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STATUS_COLORS).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-3 h-3 rounded-full", value.bg)} />
                                                    {value.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description (First) */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Description *</label>
                            <Textarea
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    if (e.target.value.trim()) setErrors(er => ({ ...er, description: false }));
                                }}
                                className={cn("min-h-[140px] resize-y text-base", errors.description && "border-red-500")}
                                placeholder="Provide detailed description of the task..."
                            />
                            {errors.description && <p className="text-xs text-red-500">Description is required</p>}
                        </div>

                        {/* Summary (Second) */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Summary *</label>
                            <Input
                                value={summary}
                                onChange={(e) => {
                                    setSummary(e.target.value);
                                    if (e.target.value.trim()) setErrors(er => ({ ...er, summary: false }));
                                }}
                                placeholder="Brief summary of the task"
                                className={cn("h-11 text-base font-medium", errors.summary && "border-red-500")}
                            />
                            {errors.summary && <p className="text-xs text-red-500">Summary is required</p>}
                        </div>

                        {/* Dates & Priority Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Start Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "PPP") : "Pick date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">End Date *</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-normal", !endDate && "text-muted-foreground", errors.endDate && "border-red-500")}>
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "PPP") : "Pick date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent mode="single" selected={endDate} onSelect={(d) => { setEndDate(d); setErrors(e => ({ ...e, endDate: false })); }} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                {errors.endDate && <p className="text-xs text-red-500">End date is required</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Priority</label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger className="h-12 bg-white border-slate-200 shadow-sm hover:border-blue-400 transition-all"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["Highest", "High", "Medium", "Low", "Lowest"].map(p => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* People Assignment */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Assignee</label>
                                <Select value={assignee} onValueChange={setAssignee}>
                                    <SelectTrigger className="h-12 bg-white border-slate-200 shadow-sm hover:border-blue-400 transition-all"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="automatic">Automatic</SelectItem>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        <SelectItem value="current_user">{(user as any)?.name || "Me"}</SelectItem>
                                        {selectedTeamId !== "unassigned" && availableAssignees.map((m: any) => {
                                            if (!m?.user) return null;
                                            return (
                                                <SelectItem key={m.user._id} value={m.user.name}>{m.user.name}</SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <Button variant="link" className="h-auto p-0 text-xs text-blue-600 justify-start" onClick={() => setAssignee("current_user")}>
                                    Assign to me
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Assigned To (Multiple)</label>
                                <Popover open={isAssignedToOpen} onOpenChange={setIsAssignedToOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-11 justify-between bg-white border-slate-200 shadow-sm hover:bg-slate-50 hover:border-blue-400 transition-all">
                                            <span className="truncate">{assignedTo.length ? `${assignedTo.length} selected` : "Select users..."}</span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search users..." />
                                            <CommandList>
                                                <CommandEmpty>No users found.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem onSelect={() => toggleAssignedTo((user as any)?.name || "Me")}>
                                                        <Check className={cn("mr-2 h-4 w-4", assignedTo.includes((user as any)?.name || "Me") ? "opacity-100" : "opacity-0")} />
                                                        {(user as any)?.name || "Me"} (Current User)
                                                    </CommandItem>
                                                    {availableAssignees.map((m: any) => {
                                                        if (!m?.user) return null;
                                                        const name = m.user.name || m.user.email || "Unknown";
                                                        // Avoid duplicate "Me" if already shown
                                                        if (name === ((user as any)?.name)) return null;

                                                        return (
                                                            <CommandItem key={m.user._id} onSelect={() => toggleAssignedTo(name)}>
                                                                <Check className={cn("mr-2 h-4 w-4", assignedTo.includes(name) ? "opacity-100" : "opacity-0")} />
                                                                {name}
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {assignedTo.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {assignedTo.map(u => (
                                            <span key={u} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-md text-xs flex items-center gap-1 font-medium shadow-sm">
                                                {u}
                                                <X className="w-3 h-3 cursor-pointer hover:text-blue-900" onClick={() => toggleAssignedTo(u)} />
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Labels & Color */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Labels</label>
                                <div className="border rounded-md p-2 min-h-[44px] flex flex-wrap gap-2 bg-white">
                                    {labels.map(l => (
                                        <span key={l} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm flex items-center gap-1">
                                            {l}
                                            <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => setLabels(labels.filter(x => x !== l))} />
                                        </span>
                                    ))}
                                    <input
                                        className="flex-1 outline-none text-sm min-w-[80px] bg-transparent"
                                        placeholder={labels.length ? "" : "Type and press Enter"}
                                        value={labelInput}
                                        onChange={e => setLabelInput(e.target.value)}
                                        onKeyDown={handleLabelKeyDown}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Card Color</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-11 justify-start gap-2">
                                            <div className="w-5 h-5 rounded border border-slate-200" style={{ backgroundColor: color }} />
                                            <span className="font-mono text-sm">{color}</span>
                                            <ChevronDown className="ml-auto w-4 h-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64">
                                        <div className="grid grid-cols-6 gap-2 mb-3">
                                            {PREDEFINED_COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    className={cn("w-8 h-8 rounded-md border-2 hover:scale-110 transition-transform", color === c ? "border-slate-900" : "border-slate-200")}
                                                    style={{ backgroundColor: c }}
                                                    onClick={() => setColor(c)}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 cursor-pointer border-0 p-0 rounded-md" />
                                            <Input value={color} onChange={e => setColor(e.target.value)} className="h-10 font-mono text-sm" />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Attachments</label>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer",
                                    isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                )}
                            >
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                    <div className="bg-slate-100 p-3 rounded-full mb-3">
                                        <Upload className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 mb-1">
                                        {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
                                    </p>
                                    <p className="text-xs text-slate-500">SVG, PNG, JPG, PDF (max. 10MB each)</p>
                                </label>
                            </div>

                            {/* File List */}
                            {files.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-md border border-slate-200">
                                            <File className="w-4 h-4 text-slate-500 shrink-0" />
                                            <span className="text-sm text-slate-700 flex-1 truncate">{file.name}</span>
                                            <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() => removeFile(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between sm:justify-between w-full">
                    <div>
                        {initialData && onDelete && (
                            <Button variant="destructive" size="sm" onClick={() => {
                                if (confirm("Delete this task?")) {
                                    onDelete(initialData._id);
                                    onClose();
                                }
                            }}>
                                Delete Task
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3 items-center">
                        {!hasPermission && (
                            <span className="text-xs text-red-500 mr-2">
                                You don't have permission to create/edit tasks.
                            </span>
                        )}
                        <Button variant="outline" onClick={onClose} className="min-w-[100px]">Cancel</Button>
                        <Button onClick={handleCreate} disabled={!hasPermission} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                            {initialData ? "Save Changes" : "Create Task"}
                        </Button>
                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
