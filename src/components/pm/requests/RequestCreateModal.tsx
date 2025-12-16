"use client";

import { useState, useEffect } from "react";
import apiClient from "@/utils/api.client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/lib/workspace-context";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RequestCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string; // Optional context from a task
  taskTitle?: string;
  onSuccess?: () => void;
}

export function RequestCreateModal({ isOpen, onClose, taskId, taskTitle, onSuccess }: RequestCreateModalProps) {
  const { selectedWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [title, setTitle] = useState(taskTitle ? `Request regarding: ${taskTitle}` : "");
  const [description, setDescription] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string>(taskId || "overall");
  const [tasks, setTasks] = useState<any[]>([]); // For context dropdown
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tasks
  useEffect(() => {
    if (isOpen && selectedWorkspace?._id) {
       apiClient.get(`/workspaces/${selectedWorkspace._id}/rows`)
        .then(res => {
            const rows = res.data?.rows || res.data || [];
            setTasks(Array.isArray(rows) ? rows : []);
        })
        .catch(err => console.error("Failed to fetch tasks for context", err));
    }
  }, [isOpen, selectedWorkspace]);

  // Sync taskId prop to state when it opens/changes
  useEffect(() => {
      setSelectedTaskId(taskId || "overall");
      if(taskTitle) setTitle(`Request regarding: ${taskTitle}`);
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
      await apiClient.post(`/workspaces/${selectedWorkspace._id}/requests`, {
        title,
        description,
        taskId: selectedTaskId === "overall" ? undefined : selectedTaskId,
      });

      toast({
        title: "Request Sent",
        description: "Your request has been submitted to the team.",
      });
      if (onSuccess) onSuccess();
      onClose();
      setTitle("");
      setDescription("");
      setSelectedTaskId("overall");
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
           {/* Context Dropdown */}
           <div className="space-y-2">
            <label className="text-sm font-medium">Context</label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Select context" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall / General</SelectItem>
                {tasks.map(t => (
                    <SelectItem key={t._id} value={t._id}>
                        {t.data?.summary || "Untitled Task"}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Request title..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your request..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
