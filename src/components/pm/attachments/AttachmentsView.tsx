"use client";

import { useState, useEffect } from "react";
import apiClient from "@/utils/api.client";
import { useWorkspace } from "@/lib/workspace-context";
import { format } from "date-fns";
import { FileIcon, ImageIcon, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Attachment {
  _id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  size: number;
  uploaderId: { name: string };
  createdAt: string;
}

export function AttachmentsView() {
  const { selectedWorkspace } = useWorkspace();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const fetchAttachments = async () => {
    if (!selectedWorkspace?._id) return;
    try {
      const res = await apiClient.get(`/workspaces/${selectedWorkspace._id}/attachments`);
      setAttachments(res.data);
    } catch (error) {
      console.error("Failed to fetch attachments", error);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [selectedWorkspace]);

  const handleUpload = async (file: File) => {
    if (!selectedWorkspace?._id) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await apiClient.post(`/workspaces/${selectedWorkspace._id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({
        title: "File Uploaded",
        description: "Your file has been uploaded successfully.",
      });
      fetchAttachments();
    } catch (error) {
      console.error("Upload failed", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload file.",
      });
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-50">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center transition-colors mb-8
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white hover:border-blue-400"}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <UploadCloud className="w-10 h-10 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-700">Drag & Drop files here</h3>
        <p className="text-slate-500 mb-4">or</p>
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Browse Files
          <input
            type="file"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
          />
        </label>
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex-1">
        <div className="px-6 py-4 border-b border-slate-200 font-medium text-slate-700">
          Attached Files
        </div>
        <ul className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
          {attachments.map((file) => (
            <li key={file._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-500">
                  {file.fileType.startsWith("image/") ? <ImageIcon className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{file.filename}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • Uploaded by {file.uploaderId?.name || "User"} • {format(new Date(file.createdAt), "PP")}
                  </p>
                </div>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}${file.fileUrl}`}
                target="_blank"
                className="text-sm text-blue-600 hover:underline"
              >
                Download
              </a>
            </li>
          ))}
           {attachments.length === 0 && (
            <li className="px-6 py-8 text-center text-slate-500 text-sm">No attachments yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
