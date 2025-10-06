"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload, FileText, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { useWorkspace } from "@/lib/workspace-context"
import apiClient from "@/utils/api.client"
import { toast } from "sonner"

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { setWorkspaces, setSelectedWorkspace } = useWorkspace()
  
  const [step, setStep] = useState<'name' | 'description'>('name')
  const [workspaceName, setWorkspaceName] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleNext = () => {
    if (workspaceName.trim() && workspaceName.length >= 3) {
      setStep('description')
    } else {
      toast.error("Workspace name must be at least 3 characters long")
    }
  }

  const handleBack = () => {
    setStep('name')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'text/plain' || file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        setUploadedFile(file)
        if (file.type === 'text/plain') {
          const reader = new FileReader()
          reader.onload = (e) => {
            setJobDescription(e.target?.result as string)
          }
          reader.readAsText(file)
        }
      } else {
        toast.error("Please upload a text, PDF, or DOCX file")
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadedFile(file)
      if (file.type === 'text/plain') {
        const reader = new FileReader()
        reader.onload = (e) => {
          setJobDescription(e.target?.result as string)
        }
        reader.readAsText(file)
      }
    }
  }

  const handleCreate = async () => {
    if (!user) {
      toast.error("Please log in to create a workspace")
      return
    }

    if (!jobDescription.trim()) {
      toast.error("Please provide a job description")
      return
    }

    setIsCreating(true)

    const payload = {
      name: workspaceName,
      userId: user.id,
      mainFocus: "human-resources", // Default value
      primaryHRNeed: "Hiring", // Default value
      jd: jobDescription,
      requirements: [],
      table: {},
    }

    try {
      const response = await apiClient.post('/workspaces', payload)
      const newWorkspace = response.data
      
      // Update workspace context
      setWorkspaces(prev => [...prev, newWorkspace])
      setSelectedWorkspace(newWorkspace)
      
      toast.success(`Workspace "${workspaceName}" created successfully!`)
      
      // Reset form
      setWorkspaceName("")
      setJobDescription("")
      setUploadedFile(null)
      setStep('name')
      onOpenChange(false)
      
      // Navigate to the new workspace
      router.push(`/workspace/${newWorkspace._id}`)
    } catch (error: any) {
      console.error('Error creating workspace:', error)
      toast.error(error.response?.data?.message || "Failed to create workspace")
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setWorkspaceName("")
    setJobDescription("")
    setUploadedFile(null)
    setStep('name')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            {step === 'name' ? 'Create New Workspace' : 'Add Job Description'}
          </DialogTitle>
          <DialogDescription>
            {step === 'name' 
              ? 'Give your workspace a name to get started' 
              : 'Provide a job description to help us understand your needs'}
          </DialogDescription>
        </DialogHeader>

        {step === 'name' ? (
          <div className="space-y-6 py-4 flex-shrink-0">
            <div className="space-y-3">
              <Label htmlFor="workspace-name" className="text-sm font-semibold">
                Workspace Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="workspace-name"
                placeholder="e.g., Engineering Team, Sales Department"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNext()
                  }
                }}
                className="h-12 text-base"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Minimum 3 characters required
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4 overflow-y-auto flex-1 min-h-0 scrollbar-hide">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Job Description <span className="text-red-500">*</span>
              </Label>
              
              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 transition-all
                  ${dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className={`h-10 w-10 mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {uploadedFile ? uploadedFile.name : 'Drop your file here or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: TXT, PDF, DOCX
                  </p>
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                </div>
              </div>

              {/* Text Area */}
              <Textarea
                placeholder="Paste your job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] max-h-[400px] text-sm resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 flex-shrink-0 border-t pt-4 mt-4">
          {step === 'description' && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'name' ? (
            <Button 
              onClick={handleNext}
              disabled={!workspaceName.trim() || workspaceName.length < 3}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleCreate}
              disabled={!jobDescription.trim() || isCreating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workspace
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
