"use client";

import { useState, useEffect } from "react";
import apiClient from "@/utils/api.client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/lib/workspace-context";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RequestCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string; // Optional context from a task
  taskTitle?: string;
  onSuccess?: () => void;
  availableTasks: any[]; // Passed from parent to avoid 404 on fetching
}

export function RequestCreateModal({ isOpen, onClose, taskId, taskTitle, onSuccess, availableTasks }: RequestCreateModalProps) {
  const { selectedWorkspace } = useWorkspace();
  const { toast } = useToast();

  // Form State
  const [title, setTitle] = useState(taskTitle ? `Request regarding: ${taskTitle}` : "");
  const [description, setDescription] = useState("");
  // 'overall' or taskId
  const [selectedContext, setSelectedContext] = useState<string>(taskId || "overall");

  // Data State
  const [issues, setIssues] = useState<any[]>([]);
  // Selected Issue IDs (Multi-select)
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [isIssuesOpen, setIsIssuesOpen] = useState(false);

  // Fetch Issues only (tasks are passed as props)
  useEffect(() => {
    if (isOpen && selectedWorkspace?._id) {
      // Fetch Issues
      apiClient.get(`/workspaces/${selectedWorkspace._id}/issues`)
        .then(res => {
          setIssues(Array.isArray(res.data) ? res.data : []);
        })
        .catch(err => console.error("Failed to fetch issues", err));
    }
  }, [isOpen, selectedWorkspace]);

  // Sync taskId prop to state
  useEffect(() => {
    setSelectedContext(taskId || "overall");
    if (taskId) { // If specific task opened, clear issues initially or maybe logic to find related? keeping simple
      setSelectedIssueIds([]);
    }
    if (taskTitle) setTitle(`Request regarding: ${taskTitle}`);
  }, [taskId, taskTitle, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and description are required.",
      });
      return;
    }

    if (!selectedWorkspace?._id) return;

    setIsLoading(true);
    try {
      const payload: any = {
        title,
        description,
        taskId: selectedContext === "overall" ? undefined : selectedContext,
      };

      // Add issues if not global context and issues are selected
      if (selectedContext !== "overall" && selectedIssueIds.length > 0) {
        payload.issueIds = selectedIssueIds;
      }

      await apiClient.post(`/workspaces/${selectedWorkspace._id}/requests`, payload);

      toast({
        title: "Request Sent",
        description: "Your request has been submitted to the team.",
      });
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error("Failed to create request", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form after short delay to avoid UI flicker while closing
    setTimeout(() => {
      setTitle("");
      setDescription("");
      setSelectedContext("overall");
      setSelectedIssueIds([]);
    }, 300);
  };

  // Helper to get selected task name
  const selectedTaskName = selectedContext === "overall"
    ? "Global / General"
    : availableTasks.find((t: any) => t._id === selectedContext)?.data?.summary || "Unknown Task";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit a Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Section: Context */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900 border-b pb-1">Context</h4>
            <p className="text-xs text-slate-500">Select whether this request applies to the entire project or a specific task.</p>

            <Popover open={isContextOpen} onOpenChange={setIsContextOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isContextOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedTaskName}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[550px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search context..." />
                  <CommandList>
                    <CommandEmpty>No context found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="global / general"
                        onSelect={() => {
                          setSelectedContext("overall");
                          setIsContextOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedContext === "overall" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Global / General
                      </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Tasks">
                      {availableTasks.map((task) => (
                        <CommandItem
                          key={task._id}
                          value={task.data?.summary || "Untitled"}
                          onSelect={() => {
                            setSelectedContext(task._id);
                            setIsContextOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedContext === task._id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {task.data?.summary || "Untitled Task"}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Section: Related Issues (Conditional) */}
          {selectedContext !== "overall" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <h4 className="text-sm font-semibold text-slate-900 border-b pb-1">Related Issues</h4>
              <p className="text-xs text-slate-500">Select any issues related to this request.</p>

              <Popover open={isIssuesOpen} onOpenChange={setIsIssuesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal min-h-[40px] h-auto"
                  >
                    <span className="truncate">
                      {selectedIssueIds.length === 0
                        ? "Select issues..."
                        : `${selectedIssueIds.length} issue${selectedIssueIds.length === 1 ? '' : 's'} selected`
                      }
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[550px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search issues..." />
                    <CommandList>
                      <CommandEmpty>No issues found.</CommandEmpty>
                      <CommandGroup heading="Issues">
                        {issues.map((issue) => {
                          const isSelected = selectedIssueIds.includes(issue._id);
                          return (
                            <CommandItem
                              key={issue._id}
                              value={issue.title}
                              onSelect={() => {
                                setSelectedIssueIds(prev =>
                                  isSelected
                                    ? prev.filter(id => id !== issue._id)
                                    : [...prev, issue._id]
                                );
                              }}
                            >
                              <div className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                              )}>
                                <Check className={cn("h-4 w-4")} />
                              </div>
                              <span className="truncate">{issue.title}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected Issues Chips - Optional visualization */}
              {selectedIssueIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedIssueIds.map(id => {
                    const issue = issues.find(i => i._id === id);
                    if (!issue) return null;
                    return (
                      <div key={id} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md flex items-center border border-slate-200">
                        <span className="truncate max-w-[200px]">{issue.title}</span>
                        <button
                          className="ml-1.5 hover:text-red-500"
                          onClick={() => setSelectedIssueIds(prev => prev.filter(pid => pid !== id))}
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section: Request Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 border-b pb-1">Request Details</h4>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title for your request..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of what you need..."
                className="min-h-[120px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>Create Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
