"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2 } from "lucide-react";
import apiClient from "@/utils/api.client";
import { useAuth } from "@/lib/auth-context";

interface JobDescriptionDialogProps {
  workspaceId: string;
  workspaceName: string;
  initialJd?: string;
  onJdUpdate?: (newJd: string) => void;
}

export function JobDescriptionDialog({
  workspaceId,
  workspaceName,
  initialJd = "",
  onJdUpdate,
}: JobDescriptionDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [jd, setJd] = useState(initialJd);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setJd(initialJd);
    setHasChanges(false);
  }, [initialJd, open]);

  const handleJdChange = (value: string) => {
    setJd(value);
    setHasChanges(value !== initialJd);
  };

  const handleSave = async () => {
    if (!user) {
      console.error("No user found. Please log in.");
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.put(`/api/workspaces/${workspaceId}`, {
        userId: user.id,
        jd: jd,
      });

      if (onJdUpdate) {
        onJdUpdate(jd);
      }

      setHasChanges(false);
      setOpen(false);
    } catch (error) {
      console.error("Error updating job description:", error);
      alert("Failed to update job description. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmCancel) return;
    }
    setJd(initialJd);
    setHasChanges(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          <FileText className="mr-1.5 h-3 w-3" />
          Job Description
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Job Description</DialogTitle>
          <DialogDescription className="sr-only">
            View and edit the job description for {workspaceName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 py-2 min-h-0">
          <div>
            <label
              htmlFor="job-description"
              className="text-sm font-medium mb-2 block"
            >
              Job Description for {workspaceName}
            </label>
            <Textarea
              id="job-description"
              value={jd}
              onChange={(e) => handleJdChange(e.target.value)}
              placeholder="Enter the job description here..."
              className="min-h-[400px] resize-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {jd.length} characters
          </p>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="text-xs h-8"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
