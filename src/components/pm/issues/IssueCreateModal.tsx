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

interface IssueCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
  taskTitle?: string;
  onSuccess?: () => void;
  availableTasks: any[]; // Passed from parent to avoid 404
}

export function IssueCreateModal({ isOpen, onClose, taskId, taskTitle, onSuccess, availableTasks }: IssueCreateModalProps) {
  const { selectedWorkspace } = useWorkspace();
  const { toast } = useToast();

  const [title, setTitle] = useState(taskTitle ? `Issue regarding: ${taskTitle}` : "");
  const [description, setDescription] = useState("");
  const [selectedContext, setSelectedContext] = useState<string>(taskId || "overall");
  const [isLoading, setIsLoading] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);

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
      await apiClient.post(`/workspaces/${selectedWorkspace._id}/issues`, {
        title,
        description,
        taskId: selectedContext === "overall" ? undefined : selectedContext,
      });

      toast({
        title: "Issue Reported",
        description: "The issue has been logged successfully.",
      });
      if (onSuccess) onSuccess();
      onClose();
      setTitle("");
      setDescription("");
      setSelectedContext("overall");
    } catch (error) {
      console.error("Failed to create issue", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create issue.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTaskName = selectedContext === "overall"
    ? "Global / General"
    : availableTasks.find((t: any) => t._id === selectedContext)?.data?.summary || "Unknown Task";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Report an Issue</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Context Selection - Modern Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Context</label>
            <p className="text-xs text-slate-500">Select the task this issue relates to, or choose Global for general issues.</p>
            <Popover open={isContextOpen} onOpenChange={setIsContextOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-11 bg-slate-50 hover:bg-slate-100 font-medium"
                >
                  {selectedTaskName}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search context..." />
                  <CommandList>
                    <CommandEmpty>No context found.</CommandEmpty>
                    <CommandGroup heading="General">
                      <CommandItem
                        value="overall"
                        onSelect={() => {
                          setSelectedContext("overall");
                          setIsContextOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedContext === "overall" ? "opacity-100" : "opacity-0")} />
                        Global / General
                      </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Tasks">
                      {availableTasks.map((task: any) => (
                        <CommandItem
                          key={task._id}
                          value={task.data?.summary || "Untitled"}
                          onSelect={() => {
                            setSelectedContext(task._id);
                            setIsContextOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedContext === task._id ? "opacity-100" : "opacity-0")} />
                          {task.data?.summary || "Untitled Task"}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for the issue..."
              className="h-11"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Description *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="min-h-[120px] resize-y"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Reporting..." : "Report Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
