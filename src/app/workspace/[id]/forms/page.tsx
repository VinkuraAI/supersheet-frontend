'use client'

import { useState, useEffect } from "react"
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FileUp, GripVertical, Check, X, Loader2, Link as LinkIcon, Mail, Phone, CheckCircle } from "lucide-react"
import { TopBar } from "@/components/service-desk/topbar"
import { SideNav } from "@/components/service-desk/sidenav"
import { RightPanel } from "@/components/service-desk/right-panel"
import { AiChatWidget } from "@/components/service-desk/ai-chat-widget"
import apiClient from "@/utils/api.client";

type FieldType = "text" | "multiple-choice"

interface FormField {
  id: string
  type: FieldType
  question: string
  placeholder?: string
  options?: string[]
}

interface Submission {
  _id: string
  candidateData: Record<string, string>
  resumeUrl: string;
  createdAt: string;
  extractedData?: {
    Name: string;
    Email: string;
    Phone: string;
    Skills: string;
    Experience: number;
    Education: string;
  }
}

const formatExperience = (yearsDecimal: number) => {
  if (!yearsDecimal || yearsDecimal <= 0) return "No experience listed";
  const totalMonths = Math.round(yearsDecimal * 12);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  let result = '';
  if (years > 0) result += `${years} year${years > 1 ? 's' : ''} `;
  if (months > 0) result += `${months} month${months > 1 ? 's' : ''}`;
  return result.trim() || "Less than a month";
};

export default function HRFormsPage() {
  const params = useParams();
  const workspaceId = params.id as string; // This is the workspace ID, but we need the form ID.

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1272) {
        setLeftSidebarOpen(false)
        setRightSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [formId, setFormId] = useState<string | null>(null); // To store the ID of the created/fetched form
  const [formExists, setFormExists] = useState(false)
  const [isFormLocked, setIsFormLocked] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [fields, setFields] = useState<FormField[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [formTitle, setFormTitle] = useState("Job Application Form")
  const [formDescription, setFormDescription] = useState("Please fill out the form below to apply for the job.")
  const [isLoading, setIsLoading] = useState(true);
  const [formCreationSuccess, setFormCreationSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!workspaceId) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/api/workspaces/${workspaceId}/forms`);
        const forms = response.data;
        if (forms && forms.length > 0) {
          const formData = forms[0]; // Use the first form found
          setFormId(formData._id);
          setFormTitle(formData.title);
          setFormDescription(formData.description || "");
          setFields(formData.fields);
          // Assuming submissions are populated or fetched separately if needed
          // For now, let's check if submissions exist on the formData object
          setSubmissions(formData.submissions || []); 
          setFormExists(true);
          setIsFormLocked(true);
        } else {
          setFormExists(false);
        }
      } catch (error) {
        console.log("No form found for this workspace, allowing creation.", error);
        setFormExists(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();

  }, [workspaceId]);

  const handleCreateForm = () => {
    setIsBuilding(true)
    setFormExists(true)
    setFields([
      {
        id: `field-${Date.now()}`,
        type: "text",
        question: "Full Name",
        placeholder: "Enter your full name",
      },
    ])
  }

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      question: "Untitled Question",
      placeholder: type === "text" ? "Your answer" : undefined,
      options: type === "multiple-choice" ? ["Option 1"] : undefined,
    }
    setFields([...fields, newField])
  }

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  const handleDeleteField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const handleAddOption = (fieldId: string) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId && field.options) {
          return {
            ...field,
            options: [...field.options, `Option ${field.options.length + 1}`],
          }
        }
        return field
      }),
    )
  }

  const handleUpdateOption = (fieldId: string, optionIndex: number, newValue: string) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId && field.options) {
          const newOptions = [...field.options]
          newOptions[optionIndex] = newValue
          return { ...field, options: newOptions }
        }
        return field
      }),
    )
  }

  const handleDeleteOption = (fieldId: string, optionIndex: number) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId && field.options && field.options.length > 1) {
          return {
            ...field,
            options: field.options.filter((_, index) => index !== optionIndex),
          }
        }
        return field
      }),
    )
  }

  const handleConfirmForm = () => {
    setShowConfirmDialog(true)
  }

  const handleFinalizeForm = async () => {
    const form = {
      title: formTitle,
      description: formDescription,
      fields: fields,
    };

    try {
      const response = await apiClient.post("/api/forms", form);
      setFormId(response.data._id); // Save the new form ID
      setIsFormLocked(true)
      setIsBuilding(false)
      setShowConfirmDialog(false)
      setFormCreationSuccess(true); // Show success UI
    } catch (error) {
      console.error("Failed to save form:", error);
    }
  }

  const handleApprove = async (submissionId: string) => {
    if (!workspaceId) return;
    try {
      await apiClient.post(`/api/submissions/${submissionId}/approve`, { workspaceId });
      setSubmissions(submissions.filter(s => s._id !== submissionId));
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Failed to approve submission:", error);
    }
  };

  const handleDeny = async (submissionId: string) => {
    try {
      await apiClient.delete(`/api/submissions/${submissionId}/deny`);
      setSubmissions(submissions.filter(s => s._id !== submissionId));
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Failed to deny submission:", error);
    }
  };

  const getShareableLink = () => {
      if(!formId) return "";
      return `${window.location.origin}/candidateForm/${formId}`;
  }

  const pageContent = () => {
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (formCreationSuccess) {
        return (
            <div className="min-h-screen bg-background p-8 flex items-center justify-center">
                <div className="text-center max-w-2xl">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Form Created Successfully!</h1>
                    <p className="text-muted-foreground mb-6">Your form is now live and ready to be shared with candidates.</p>
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-4">
                        <LinkIcon className="h-5 w-5 text-gray-500" />
                        <input type="text" readOnly value={getShareableLink()} className="bg-transparent outline-none w-full text-gray-800" />
                        <Button onClick={() => navigator.clipboard.writeText(getShareableLink())}>Copy Link</Button>
                    </div>
                     <Button variant="outline" className="mt-8" onClick={() => setFormCreationSuccess(false)}>View Submissions</Button>
                </div>
            </div>
        )
    }

    if (!formExists) {
      return (
        <div className="min-h-screen bg-background p-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <Button onClick={handleCreateForm} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Form
              </Button>
            </div>
            <Card className="border-2 border-dashed">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <p className="text-lg text-muted-foreground">You haven&apos;t created a form for this workspace yet.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click the &quot;Create Form&quot; button above to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    if (isBuilding) {
      return (
        <div className="min-h-screen bg-background p-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Build Your Job Application Form</h1>
              <Button onClick={handleConfirmForm} className="bg-primary hover:bg-primary/90">
                Confirm Form
              </Button>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Form Title</Label>
                      <Input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="mt-1 font-medium text-lg"
                        placeholder="Enter form title"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Form Description</Label>
                      <Input
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="mt-1"
                        placeholder="Enter form description"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {fields.map((field) => (
                <Card key={field.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-start gap-4">
                      <GripVertical className="mt-2 h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Question</Label>
                          <Input
                            value={field.question}
                            onChange={(e) => handleUpdateField(field.id, { question: e.target.value })}
                            className="mt-1 font-medium"
                            placeholder="Enter your question"
                          />
                        </div>

                        {field.type === "text" && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Placeholder</Label>
                            <Input
                              value={field.placeholder || ""}
                              onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                              className="mt-1"
                              placeholder="Enter placeholder text"
                            />
                          </div>
                        )}

                        {field.type === "multiple-choice" && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Options</Label>
                            <RadioGroup className="mt-2 space-y-2">
                              {field.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <RadioGroupItem value={option} disabled />
                                  <Input
                                    value={option}
                                    onChange={(e) => handleUpdateOption(field.id, optionIndex, e.target.value)}
                                    className="flex-1"
                                  />
                                  {field.options && field.options.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteOption(field.id, optionIndex)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </RadioGroup>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddOption(field.id)}
                              className="mt-2"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Option
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteField(field.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <FileUp className="mt-2 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <Label className="font-medium">Resume Upload (Required)</Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        This field is mandatory and cannot be removed. Candidates will upload their resume here.
                      </p>
                    </div>
                    <Badge variant="secondary">Fixed</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleAddField("text")} className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Text Field
                </Button>
                <Button variant="outline" onClick={() => handleAddField("multiple-choice")} className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Multiple Choice
                </Button>
              </div>
            </div>
          </div>

          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Form Submission</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to confirm? In the free plan, you cannot edit this form after submission.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleFinalizeForm}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{formTitle}</h1>
              <p className="text-sm text-muted-foreground">{formDescription}</p>
            </div>
            <Button variant="outline" onClick={() => {
              const link = getShareableLink();
              if (link) {
                navigator.clipboard.writeText(link);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }
            }}>
              {isCopied ? (
                <><Check className="mr-2 h-4 w-4" />Copied!</>
              ) : (
                <><LinkIcon className="mr-2 h-4 w-4" />Copy Link</>
              )}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Candidate Submissions</CardTitle>
              <CardDescription>Click on a submission to view details</CardDescription>
            </CardHeader>
            <CardContent>
                {submissions.length > 0 ? (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {submissions.map((submission) => (
                            <TableRow
                            key={submission._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedSubmission(submission)}
                            >
                            <TableCell className="font-medium">
                              {submission.extractedData ? (submission.extractedData.Name ? submission.extractedData.Name : 'Anonymous') : 'Anonymous'}
                            </TableCell>
                            <TableCell>{new Date(submission.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                                <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedSubmission(submission)
                                }}
                                >
                                View Details
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground">No submissions yet.</p>
                        <p className="mt-2 text-sm text-muted-foreground">Share the form link to start receiving applications.</p>
                    </div>
                )}
            </CardContent>
          </Card>

          <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submission Details</DialogTitle>
                <DialogDescription>Review the candidate&apos;s application</DialogDescription>
              </DialogHeader>
              {selectedSubmission && (
                <div className="space-y-6 pt-4">
                  {selectedSubmission.extractedData ? (
                    <>
                      <div>
                        <h2 className="text-2xl font-bold text-primary">{selectedSubmission.extractedData.Name}</h2>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4" />
                            <a href={`mailto:${selectedSubmission.extractedData.Email}`} className="hover:underline">{selectedSubmission.extractedData.Email}</a>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4" />
                            <span>{selectedSubmission.extractedData.Phone}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSubmission.extractedData.Skills.split(',').map((skill) => (
                            <Badge key={skill.trim()} variant="secondary" className="font-normal">{skill.trim()}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div>
                          <h3 className="font-semibold mb-2">Experience</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatExperience(selectedSubmission.extractedData.Experience)}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Education</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedSubmission.extractedData.Education}
                          </p>
                        </div>
                      </div>

                      <details className="pt-2">
                        <summary className="cursor-pointer text-sm font-medium">View Original Form Answers</summary>
                        <div className="space-y-4 mt-4">
                          {Object.entries(selectedSubmission.candidateData).map(([fieldId, answer]) => (
                            <div key={fieldId} className="rounded-lg border bg-muted/50 p-3">
                              <p className="text-sm font-medium text-muted-foreground">
                                {fields.find((f) => f.id === fieldId)?.question || "Question"}
                              </p>
                              <p className="mt-1">{answer as string}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No AI-extracted data available for this submission.</p>
                    </div>
                  )}
                  
                  {selectedSubmission.resumeUrl && (
                     <div className="flex justify-end pt-4">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`http://localhost:5000/${selectedSubmission.resumeUrl}`} target="_blank" rel="noopener noreferrer">
                            <FileUp className="mr-2 h-4 w-4" />
                            View Original Resume
                          </a>
                        </Button>
                      </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleDeny(selectedSubmission._id)}>Deny</Button>
                    <Button onClick={() => handleApprove(selectedSubmission._id)}>Approve</Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b bg-card flex-shrink-0">
        <TopBar
          onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
          onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
          rightSidebarOpen={rightSidebarOpen}
        />
      </header>

      <section className="flex flex-1 overflow-hidden relative">
        <aside
          className={`
            fixed left-0 top-[57px] bottom-0 z-30 w-[260px] 
            bg-card border-r transition-transform duration-300
            overflow-y-auto scrollbar-hide
            ${leftSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          aria-label="Project navigation"
        >
          <div className="p-2">
            <SideNav />
          </div>
        </aside>

        <div
          className={`
            flex-1 flex flex-col transition-all duration-300 pb-24 w-fulln
            ${leftSidebarOpen ? "ml-[260px]" : "ml-0"}
            ${rightSidebarOpen ? "mr-[320px]" : "mr-0"}
          `}
        >
          <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden w-full ">
            {pageContent()}
          </div>
        </div>

        <aside
          className={`
            fixed right-0 top-[57px] bottom-0 z-30 w-[320px]
            bg-card border-l transition-transform duration-300
            overflow-y-auto scrollbar-hide
            ${rightSidebarOpen ? "translate-x-0" : "translate-x-full"}
          `}
          aria-label="Project info"
        >
          <div className="p-3">
            <RightPanel />
          </div>
        </aside>
      </section>

      <AiChatWidget />
    </main>
  )
}