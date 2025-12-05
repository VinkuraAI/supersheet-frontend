"use client";

import { useState, useEffect, useRef } from "react";
import apiClient from "@/utils/api.client";
import { useParams, useRouter } from "next/navigation";
import { Document } from "@/types/document";
import { Toaster, toast } from "sonner";
import {
  FileText,
  UploadCloud,
  Trash2,
  Download,
  Loader2,
  X,
  FilePlus,
  FolderOpen,
  Calendar,
  Home,
  ChevronRight
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { selectedWorkspace, workspaces, setSelectedWorkspace, isLoading: isWorkspaceLoading, currentRole } = useWorkspace();
  const isViewer = currentRole === 'viewer';

  // Set the selected workspace based on URL parameter
  useEffect(() => {
    if (workspaceId && workspaces.length > 0 && (!selectedWorkspace || selectedWorkspace._id !== workspaceId)) {
      const workspace = workspaces.find(w => w._id === workspaceId);
      if (workspace) {
        setSelectedWorkspace(workspace);
      }
    }
  }, [workspaceId, workspaces, selectedWorkspace, setSelectedWorkspace]);

  useEffect(() => {
    if (workspaceId) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/documents/${workspaceId}`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to fetch documents.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return false;
    }

    // Validate file type
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.csv', '.png', '.jpg', '.jpeg', '.gif'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Invalid file type. Please upload PDF, DOC, DOCX, TXT, XLS, XLSX, CSV, or image files.");
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setFileToUpload(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setFileToUpload(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("document", fileToUpload);
    formData.append("workspaceId", workspaceId);
    formData.append("type", fileToUpload.type);

    try {
      const response = await apiClient.post("/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setDocuments([...documents, response.data]);
      toast.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document.");
    } finally {
      setIsUploading(false);
      setFileToUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await apiClient.delete(`/documents/${documentToDelete._id}`);
      setDocuments(documents.filter((doc) => doc._id !== documentToDelete._id));
      toast.success("Document deleted successfully!");
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document.");
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleBackToWorkspace = () => {
    router.push(`/pm/workspace/${workspaceId}`);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Return appropriate icon based on file type
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-white" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-white" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileText className="w-5 h-5 text-white" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="w-5 h-5 text-white" />;
      default:
        return <FileText className="w-5 h-5 text-white" />;
    }
  };

  const getFileGradient = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Return different gradients for different file types
    switch (extension) {
      case 'pdf':
        return 'from-red-500 to-red-600';
      case 'doc':
      case 'docx':
        return 'from-blue-500 to-blue-600';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'from-green-500 to-green-600';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <WorkspaceLayout>
      <div className="flex flex-col h-full">
        <Toaster richColors position="top-center" />

        {/* Simple header with document count */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex w-full items-center justify-between gap-2 p-3">
            <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Documents
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{documents.length} {documents.length === 1 ? 'document' : 'documents'}</span>
            </div>
          </div>
        </header>
        {/* Content */}
        <section
          className="flex-1 p-3 overflow-auto relative"
          onDragEnter={!isViewer ? handleDragEnter : undefined}
          onDragLeave={!isViewer ? handleDragLeave : undefined}
          onDragOver={!isViewer ? handleDragOver : undefined}
          onDrop={!isViewer ? handleDrop : undefined}
        >
          {/* Drag Overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-card border-2 border-dashed border-blue-500 rounded-2xl p-12 shadow-2xl"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <UploadCloud className="w-10 h-10 text-white animate-bounce" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        Drop your file here
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Release to upload your document
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-card border rounded-md p-4 min-h-[calc(100vh-120px)]">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif"
            />

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {/* Upload Section - Always show at top */}
                {!isViewer && (
                  <div className="mb-6">
                    <AnimatePresence mode="wait">
                      {fileToUpload ? (
                        /* File upload preview content would go here */
                        <div>File upload preview...</div>
                      ) : (
                        /* Upload area would go here */
                        <div>
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-24 border-dashed border-2 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <UploadCloud className="w-6 h-6 text-muted-foreground" />
                              <span className="text-sm font-medium">Upload Document</span>
                              <span className="text-xs text-muted-foreground">
                                PDF, DOC, DOCX, TXT, XLS, XLSX, CSV, or images
                              </span>
                            </div>
                          </Button>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Documents Grid */}
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No documents yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your first document to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    <AnimatePresence mode="popLayout">
                      {documents.map((doc, index) => (
                        <motion.div
                          key={doc._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.03 }}
                          className="group relative bg-card border rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                        >
                          {/* Document Icon */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getFileGradient(doc.name)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                              {getFileIcon(doc.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-semibold text-foreground truncate mb-1" title={doc.name}>
                                {doc.name}
                              </h3>
                              <div className="flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-7 text-xs hover:bg-blue-50 hover:text-blue-700"
                            >
                              <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3 mr-1.5" />
                                Download
                              </a>
                            </Button>
                            {!isViewer && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleDeleteClick(doc)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-card border-2 border-dashed border-blue-500 rounded-2xl p-12 shadow-2xl"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <UploadCloud className="w-10 h-10 text-white animate-bounce" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Drop your file here
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Release to upload your document
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card border rounded-md p-4 min-h-[calc(100vh-120px)]">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif"
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Upload Section - Always show at top */}
              <div className="mb-6">
                <AnimatePresence mode="wait">
                  {fileToUpload ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="relative"
                    >
                      {/* Selected File Preview */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-4">
                          {/* File Icon */}
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getFileGradient(fileToUpload.name)} flex items-center justify-center shadow-md flex-shrink-0 ring-4 ring-white dark:ring-gray-900`}>
                            {getFileIcon(fileToUpload.name)}
                            <div className="absolute -top-1 -right-1">
                              <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* File Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-foreground mb-1 truncate" title={fileToUpload.name}>
                              {fileToUpload.name}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="font-medium">{formatFileSize(fileToUpload.size)}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                                Ready to upload
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              onClick={handleUpload}
                              disabled={isUploading}
                              size="lg"
                              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <UploadCloud className="h-4 w-4 mr-2" />
                                  Upload Now
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                setFileToUpload(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                              variant="outline"
                              size="lg"
                              className="border-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600"
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="group cursor-pointer"
                    >
                      {/* Upload Dropzone */}
                      <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-8 transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:shadow-lg">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <UploadCloud className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-bold text-foreground mb-2">
                              Upload Documents
                            </h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              Click to browse or drag and drop your files here
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Supports PDF, DOC, DOCX, TXT, XLS, XLSX, CSV, and images • Max 10MB
                            </p>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <FilePlus className="h-4 w-4 mr-2" />
                            Select File
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Documents Grid or Empty Message */}
              {documents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    No documents uploaded yet
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  <AnimatePresence>
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03 }}
                        className="group relative bg-card border rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                      >
                        {/* Document Icon */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getFileGradient(doc.name)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            {getFileIcon(doc.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-semibold text-foreground truncate mb-1" title={doc.name}>
                              {doc.name}
                            </h3>
                            <div className="flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="flex-1 h-7 text-xs hover:bg-blue-50 hover:text-blue-700"
                          >
                            <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3 mr-1.5" />
                              Download
                            </a>
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(doc)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{documentToDelete?.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </WorkspaceLayout>
  );
};

export default DocumentsPage;
