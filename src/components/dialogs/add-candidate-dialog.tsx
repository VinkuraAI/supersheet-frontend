"use client";

import { useState, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { UserPlus, Upload, X, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import apiClient from "@/utils/api.client";

interface AddCandidateDialogProps {
  workspaceId: string;
  onCandidatesAdded?: () => void;
  disabled?: boolean;
}

interface UploadFile {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export function AddCandidateDialog({
  workspaceId,
  onCandidatesAdded,
  disabled = false,
}: AddCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    // Filter only PDF files
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length === 0) {
      alert("Please select only PDF files.");
      return;
    }

    // Check if total files exceed 5
    const currentCount = uploadFiles.length;
    const newCount = currentCount + pdfFiles.length;

    if (newCount > 5) {
      alert(`You can only upload a maximum of 5 resumes. You have ${currentCount} already.`);
      return;
    }

    const newUploadFiles: UploadFile[] = pdfFiles.map((file) => ({
      file,
      status: "pending",
      progress: 0,
    }));

    setUploadFiles((prev) => [...prev, ...newUploadFiles]);
  };

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (uploadFiles.length === 0) {
      alert("Please select at least one resume to upload.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    uploadFiles.forEach(uploadFile => {
        formData.append("resume", uploadFile.file);
    });
    formData.append("source", "Upload");

    try {
        setUploadFiles(prev => prev.map(f => ({ ...f, status: 'uploading', progress: 0 })));

        await apiClient.post(
            `/workspaces/upload-resume/${workspaceId}`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadFiles(prev => prev.map(f => ({ ...f, progress })));
                },
            }
        );

        setUploadFiles(prev => prev.map(f => ({ ...f, status: 'success', progress: 100 })));

        setTimeout(() => {
            setOpen(false);
            setUploadFiles([]);
            if (onCandidatesAdded) {
                onCandidatesAdded();
            }
        }, 1000);

    } catch (error: any) {
        console.error(`Error uploading resumes:`, error);
        setUploadFiles(prev => prev.map(f => ({
            ...f,
            status: 'error',
            error: error.response?.data?.message || "Upload failed",
        })));
    } finally {
        setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) {
      const confirmClose = confirm(
        "Upload in progress. Are you sure you want to cancel?"
      );
      if (!confirmClose) return;
    }
    setOpen(false);
    setUploadFiles([]);
    setIsUploading(false);
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "pending":
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case "uploading":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const allUploaded = uploadFiles.length > 0 && uploadFiles.every((f) => f.status === "success");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="default"
          className="gap-1.5 h-7 px-2 text-xs"
          disabled={disabled}
        >
          <UserPlus className="size-3" />
          Add Candidate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Candidates from Resume</DialogTitle>
          <DialogDescription className="sr-only">
            Upload up to 5 PDF resumes to automatically extract candidate information
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 py-2 min-h-0">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              Drop PDF resumes here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Maximum 5 resumes • PDF format only
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFileInput}
              disabled={isUploading || uploadFiles.length >= 5}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || uploadFiles.length >= 5}
              className="h-7 px-3 text-xs"
            >
              Select Files
            </Button>
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {uploadFiles.length} / 5 Resumes
              </p>
              {uploadFiles.map((uploadFile, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(uploadFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadFile.file.size / 1024).toFixed(1)} KB
                      </p>
                      {uploadFile.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {uploadFile.error}
                        </p>
                      )}
                    </div>
                    {!isUploading && uploadFile.status !== "success" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {uploadFile.status === "uploading" && (
                    <Progress value={uploadFile.progress} className="h-1" />
                  )}
                </div>
              ))}
            </div>
          )}

          {allUploaded && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-green-900">
                  All resumes uploaded successfully!
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  {uploadFiles.length} candidate{uploadFiles.length > 1 ? "s" : ""} will be added to the workspace.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="text-xs h-8"
          >
            {allUploaded ? "Close" : "Cancel"}
          </Button>
          {!allUploaded && (
            <Button
              onClick={handleSubmit}
              disabled={uploadFiles.length === 0 || isUploading}
              className="text-xs h-8"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload & Add Candidates"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
