"use client";

import { useState, useEffect } from "react";
import { X, Maximize2, Minimize2, Paperclip, ChevronDown, Calendar, Clock, Link as LinkIcon, AlertCircle, Check, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-context";
import { useUser } from "@/lib/user-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/api.client";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const PREDEFINED_COLORS = [
  "#3b82f6", // Blue (Default)
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ec4899", // Pink
];

interface CreateIssuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onDelete?: (taskId: string) => void;
}

export function CreateIssuePanel({ isOpen, onClose, initialData, onDelete }: CreateIssuePanelProps) {
  const { selectedWorkspace, workspaces } = useWorkspace();
  const { user } = useUser();
  const { toast } = useToast();
  const [isMaximized, setIsMaximized] = useState(false);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [issueType, setIssueType] = useState("Task");
  const [status, setStatus] = useState("todo");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignee, setAssignee] = useState("automatic");
  const [reporter, setReporter] = useState("current_user");
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [color, setColor] = useState("#3b82f6");

  // Validation State
  const [errors, setErrors] = useState<{ summary?: boolean; project?: boolean; dueDate?: boolean; startDate?: boolean }>({});

  // Pre-fill data if editing
  useEffect(() => {
    if (initialData) {
      const data = initialData.data || {};
      setSelectedProjectId(initialData.projectId || selectedWorkspace?._id || "");
      setIssueType(data.issueType || "Task");
      setStatus(data.status || "todo");
      setSummary(data.summary || "");
      setDescription(data.description || "");
      setPriority(data.priority || "Medium");
      setAssignee(data.assignee || "automatic");
      setReporter(data.reporter || "current_user");
      setLabels(data.labels || []);
      setLabels(data.labels || []);
      setDueDate(data.dueDate ? new Date(data.dueDate) : undefined);
      setStartDate(data.startDate ? new Date(data.startDate) : undefined);
      setColor(data.color || "#3b82f6");
    } else {
      // Reset form when opening fresh
      setSelectedProjectId(selectedWorkspace?._id || "");
      setIssueType("Task");
      setStatus("todo");
      setSummary("");
      setDescription("");
      setPriority("Medium");
      setAssignee("automatic");
      setReporter("current_user");
      setLabels([]);
      setDueDate(undefined);
      setStartDate(undefined);
      setColor("#3b82f6");
    }
    setErrors({});
  }, [initialData, isOpen, selectedWorkspace]);

  const handleCreate = async () => {
    // Fallback to selectedWorkspace if not found in list (e.g. incomplete list)
    const targetWorkspace = workspaces.find(w => w._id === selectedProjectId) || (selectedWorkspace?._id === selectedProjectId ? selectedWorkspace : null);

    // Validation
    const newErrors: { summary?: boolean; project?: boolean; dueDate?: boolean } = {};
    let hasError = false;

    if (!summary.trim()) {
      newErrors.summary = true;
      hasError = true;
    }
    if (!targetWorkspace) {
      newErrors.project = true;
      hasError = true;
    }
    if (!dueDate) {
      newErrors.dueDate = true;
      hasError = true;
    }
    if (startDate && dueDate && startDate > dueDate) {
       newErrors.startDate = true;
       hasError = true;
       toast({
         variant: "destructive",
         title: "Invalid Dates",
         description: "Start date cannot be after due date.",
       });
       // Don't disable submission solely on date logic here if we rely on backend, 
       // but for good UX we should block it.
    }

    if (hasError) {
      setErrors(newErrors);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    const taskData = {
      issueType,
      status,
      summary,
      description,
      priority,
      assignee: assignee === "automatic" ? "Unassigned" : assignee === "current_user" ? (user as any)?.name || "User" : assignee,
      reporter: reporter === "current_user" ? (user as any)?.name || "User" : reporter,
      labels,
      dueDate: dueDate?.toISOString(),
      startDate: startDate?.toISOString(),
      color,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (initialData) {
        // Update existing task
        await apiClient.put(`/workspaces/${targetWorkspace!._id}/rows/${initialData._id}`, {
          rowData: taskData
        });
        toast({
          title: "Task Updated",
          description: `Task has been updated successfully.`,
        });
      } else {
        // Create new task
        await apiClient.post(`/workspaces/${targetWorkspace!._id}/rows`, {
          data: {
            ...taskData,
            createdAt: new Date().toISOString(),
          }
        });
        toast({
          title: "Task Created",
          description: `Task has been created successfully in ${targetWorkspace!.name}.`,
        });
      }

      onClose();
    } catch (error) {
      console.error("Failed to save task", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save task. Please try again.",
      });
    }
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
      onDelete(initialData._id);
      onClose();
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && labelInput.trim()) {
      e.preventDefault();
      if (!labels.includes(labelInput.trim())) {
        setLabels([...labels, labelInput.trim()]);
      }
      setLabelInput("");
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter(l => l !== labelToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-all duration-300">
      <div
        className={cn(
          "bg-white h-full shadow-2xl flex flex-col transition-all duration-300",
          isMaximized ? "w-full" : "w-[600px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-0.5 rounded-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">{initialData ? "Edit task" : "New task"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 hover:bg-slate-100 rounded-sm text-slate-500"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-sm text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="space-y-1">
            <p className="text-xs text-red-500 font-medium">Required fields are marked with an asterisk *</p>
          </div>

          {/* Project Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Project *</label>
            <Select
              value={selectedProjectId}
              onValueChange={(value) => {
                setSelectedProjectId(value);
                if (value) setErrors(prev => ({ ...prev, project: false }));
              }}
            >
              <SelectTrigger className={cn(
                "w-full border-slate-200 rounded-sm h-10 bg-slate-50",
                errors.project ? "border-red-500 bg-red-50" : "border-slate-200"
              )}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-sm flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>
                  <SelectValue placeholder="Select Project" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((ws) => (
                  <SelectItem key={ws._id} value={ws._id}>
                    {ws.name}
                  </SelectItem>
                ))}
                {/* Ensure selected workspace is in list if not already */}
                {selectedWorkspace && !workspaces.find(w => w._id === selectedWorkspace._id) && (
                  <SelectItem key={selectedWorkspace._id} value={selectedWorkspace._id}>
                    {selectedWorkspace.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.project && <p className="text-xs text-red-500">Project is required</p>}
          </div>

          {/* Issue Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Issue type *</label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger className="w-full border-slate-200 rounded-sm h-10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Task">Task</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Story">Story</SelectItem>
                  <SelectItem value="Epic">Epic</SelectItem>
                  <SelectItem value="Sub-task">Sub-task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full border-slate-200 rounded-sm h-10 bg-slate-50">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">TO DO</SelectItem>
                  <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                  <SelectItem value="in_review">IN REVIEW</SelectItem>
                  <SelectItem value="blocked">BLOCKED</SelectItem>
                  <SelectItem value="done">DONE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Summary *</label>
            <Input
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                if (e.target.value.trim()) setErrors(prev => ({ ...prev, summary: false }));
              }}
              className={cn(
                "rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                errors.summary ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-slate-300"
              )}
              placeholder="What needs to be done?"
            />
            {errors.summary && <p className="text-xs text-red-500">Summary is required</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Description</label>
            <div className="border border-slate-300 rounded-sm min-h-[150px] flex flex-col">
              <div className="border-b border-slate-200 p-2 flex items-center gap-2 bg-slate-50">
                <button className="p-1 hover:bg-slate-200 rounded text-xs font-bold">B</button>
                <button className="p-1 hover:bg-slate-200 rounded text-xs italic">I</button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button className="p-1 hover:bg-slate-200 rounded text-xs">List</button>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 border-0 resize-none focus-visible:ring-0 p-3"
                placeholder="Add a description..."
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-1/2 border-slate-200 rounded-sm h-10">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Highest">Highest</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Lowest">Lowest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee & Reporter */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Assignee</label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="w-full border-slate-200 rounded-sm h-10">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="current_user">{(user as any)?.name || "Me"}</SelectItem>
                </SelectContent>
              </Select>
              <p
                className="text-xs text-blue-600 hover:underline cursor-pointer"
                onClick={() => setAssignee("current_user")}
              >
                Assign to me
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Reporter</label>
              <Select value={reporter} onValueChange={setReporter}>
                <SelectTrigger className="w-full border-slate-200 rounded-sm h-10">
                  <SelectValue placeholder="Select reporter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_user">{(user as any)?.name || "Me"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Labels</label>
            <div className="p-2 border border-slate-200 rounded-sm hover:bg-slate-50 cursor-text min-h-[42px] flex flex-wrap gap-2">
              {labels.map(label => (
                <span key={label} className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                  {label}
                  <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => removeLabel(label)} />
                </span>
              ))}
              <input
                className="bg-transparent outline-none text-sm flex-1 min-w-[100px]"
                placeholder={labels.length === 0 ? "Select labels" : ""}
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={handleLabelKeyDown}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold text-slate-600 uppercase">Start date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal border-slate-200 rounded-sm h-10 hover:bg-slate-50",
                      !startDate && "text-muted-foreground",
                      errors.startDate && "border-red-500 bg-red-50 text-red-600"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (date) setErrors(prev => ({ ...prev, startDate: false }));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
               {errors.startDate && <p className="text-xs text-red-500">Start date {'>'} Due date</p>}
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold text-slate-600 uppercase">Due date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal border-slate-200 rounded-sm h-10 hover:bg-slate-50",
                      !dueDate && "text-muted-foreground",
                      errors.dueDate && "border-red-500 bg-red-50 text-red-600"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      if (date) setErrors(prev => ({ ...prev, dueDate: false }));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && <p className="text-xs text-red-500">Due date is required</p>}
            </div>
          </div>
          
          {/* Color Picker - Optimized & in Popover */}
          <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Color</label>
              <Popover>
                <PopoverTrigger asChild>
                   <Button variant="outline" className="w-full h-10 justify-start px-3 border-slate-200 hover:bg-slate-50 relative">
                     <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }} />
                     <span className="text-slate-600">{color}</span>
                     <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                   </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                    <div className="grid grid-cols-5 gap-2 mb-3">
                       {PREDEFINED_COLORS.map((c) => (
                        <button
                            key={c}
                            className={cn(
                                "w-8 h-8 rounded-full border border-slate-200 transition-all hover:scale-110",
                                color === c && "ring-2 ring-blue-500 ring-offset-2"
                            )}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                       ))}
                    </div>
                    <div className="relative">
                         <label className="text-xs font-bold text-slate-500 mb-1 block">Custom Hex</label>
                         <div className="flex gap-2">
                             <div className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-200 shrink-0">
                                <input 
                                    type="color" 
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 cursor-pointer border-0"
                                />
                             </div>
                             <Input 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)}
                                className="h-8 text-xs font-mono uppercase"
                             />
                         </div>
                    </div>
                </PopoverContent>
              </Popover>
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Attachment</label>
            <div className="border-2 border-dashed border-slate-200 rounded-sm p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <Paperclip className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 font-medium">Drop files to attach, or <span className="text-blue-600">browse</span></p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            {initialData && onDelete && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="text-slate-600 hover:bg-slate-200">Cancel</Button>
            <Button
              onClick={handleCreate}
              className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-6"
            >
              {initialData ? "Save Changes" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
