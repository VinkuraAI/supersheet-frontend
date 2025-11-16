'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Plus, Trash2, FileUp, GripVertical, Check, X, Loader2, Link as LinkIcon, Mail, Phone, CheckCircle, Home, ChevronRight, FileText } from "lucide-react"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { useWorkspace } from "@/lib/workspace-context"
import { Skeleton } from "@/components/ui/skeleton"
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
  const router = useRouter();
  const workspaceId = params.id as string;
  const { selectedWorkspace, workspaces, setSelectedWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();

  // Set the selected workspace based on URL parameter
  useEffect(() => {
    if (workspaceId && workspaces.length > 0 && (!selectedWorkspace || selectedWorkspace._id !== workspaceId)) {
      const workspace = workspaces.find(w => w._id === workspaceId);
      if (workspace) {
        setSelectedWorkspace(workspace);
      }
    }
  }, [workspaceId, workspaces, selectedWorkspace, setSelectedWorkspace]);

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

  const handleBackToWorkspace = () => {
    router.push(`/workspace/${workspaceId}`);
  };

  useEffect(() => {
    const fetchFormData = async () => {
      if (!workspaceId) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/forms/workspace/${workspaceId}`);
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
      workspaceId: workspaceId,
    };

    try {
      const response = await apiClient.post("/forms", form);
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
      await apiClient.post(`/submissions/${submissionId}/approve`, { workspaceId });
      setSubmissions(submissions.filter(s => s._id !== submissionId));
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Failed to approve submission:", error);
    }
  };

  const handleDeny = async (submissionId: string) => {
    try {
      await apiClient.delete(`/submissions/${submissionId}/deny`);
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
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    if (formCreationSuccess) {
        return (
            <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                <div className="text-center max-w-xl">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold mb-1.5">Form Created Successfully!</h1>
                    <p className="text-muted-foreground mb-4 text-xs">Your form is now live and ready to be shared with candidates.</p>
                    <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
                        <LinkIcon className="h-4 w-4 text-gray-500" />
                        <input type="text" readOnly value={getShareableLink()} className="bg-transparent outline-none w-full text-gray-800 text-xs" />
                        <Button onClick={() => navigator.clipboard.writeText(getShareableLink())} className="h-7 px-2 text-xs">Copy Link</Button>
                    </div>
                     <Button variant="outline" className="mt-6 h-7 px-2 text-xs" onClick={() => setFormCreationSuccess(false)}>View Submissions</Button>
                </div>
            </div>
        )
    }

    if (!formExists) {
      return (
        <div className="min-h-screen bg-background p-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4">
              <Button onClick={handleCreateForm} className="bg-primary hover:bg-primary/90 h-7 px-2 text-xs">
                <Plus className="mr-1.5 h-3 w-3" />
                Create Form
              </Button>
            </div>
            <Card className="border-2 border-dashed">
              <CardContent className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">You haven&apos;t created a form for this workspace yet.</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
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
        <div className="min-h-screen bg-background p-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-lg font-bold">Build Your Job Application Form</h1>
              <Button onClick={handleConfirmForm} className="bg-primary hover:bg-primary/90 h-7 px-2 text-xs">
                Confirm Form
              </Button>
            </div>

            <div className="space-y-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground">Form Title</Label>
                      <Input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="mt-0.5 font-medium text-sm"
                        placeholder="Enter form title"
                      />
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground">Form Description</Label>
                      <Input
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="mt-0.5 text-xs"
                        placeholder="Enter form description"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {fields.map((field) => (
                <Card key={field.id} className="relative">
                  <CardContent className="pt-4">
                    <div className="mb-3 flex items-start gap-3">
                      <GripVertical className="mt-1.5 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-[0.65rem] text-muted-foreground">Question</Label>
                          <Input
                            value={field.question}
                            onChange={(e) => handleUpdateField(field.id, { question: e.target.value })}
                            className="mt-0.5 font-medium text-xs"
                            placeholder="Enter your question"
                          />
                        </div>

                        {field.type === "text" && (
                          <div>
                            <Label className="text-[0.65rem] text-muted-foreground">Placeholder</Label>
                            <Input
                              value={field.placeholder || ""}
                              onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                              className="mt-0.5 text-xs"
                              placeholder="Enter placeholder text"
                            />
                          </div>
                        )}

                        {field.type === "multiple-choice" && (
                          <div>
                            <Label className="text-[0.65rem] text-muted-foreground">Options</Label>
                            <RadioGroup className="mt-1.5 space-y-1.5">
                              {field.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-1.5">
                                  <RadioGroupItem value={option} disabled className="h-3 w-3" />
                                  <Input
                                    value={option}
                                    onChange={(e) => handleUpdateOption(field.id, optionIndex, e.target.value)}
                                    className="flex-1 text-xs h-7"
                                  />
                                  {field.options && field.options.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteOption(field.id, optionIndex)}
                                      className="h-7 w-7"
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </RadioGroup>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddOption(field.id)}
                              className="mt-1.5 h-7 px-2 text-xs"
                            >
                              <Plus className="mr-1.5 h-3 w-3" />
                              Add Option
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteField(field.id)}
                        className="text-destructive hover:text-destructive h-7 w-7"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <FileUp className="mt-1.5 h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <Label className="font-medium text-xs">Resume Upload (Required)</Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        This field is mandatory and cannot be removed. Candidates will upload their resume here.
                      </p>
                    </div>
                    <Badge variant="secondary">Fixed</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-1.5">
                <Button variant="outline" onClick={() => handleAddField("text")} className="flex-1 h-7 px-2 text-xs">
                  <Plus className="mr-1.5 h-3 w-3" />
                  Add Text Field
                </Button>
                <Button variant="outline" onClick={() => handleAddField("multiple-choice")} className="flex-1 h-7 px-2 text-xs">
                  <Plus className="mr-1.5 h-3 w-3" />
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
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{formTitle}</h1>
              <p className="text-xs text-muted-foreground">{formDescription}</p>
            </div>
            <Button variant="outline" className="h-7 px-2 text-xs" onClick={() => {
              const link = getShareableLink();
              if (link) {
                navigator.clipboard.writeText(link);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }
            }}>
              {isCopied ? (
                <><Check className="mr-1.5 h-3 w-3" />Copied!</>
              ) : (
                <><LinkIcon className="mr-1.5 h-3 w-3" />Copy Link</>
              )}
            </Button>
          </div>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Candidate Submissions</CardTitle>
              <CardDescription className="text-xs">Click on a submission to view details</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                {submissions.length > 0 ? (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="text-xs">Candidate</TableHead>
                            <TableHead className="text-xs">Submitted At</TableHead>
                            <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {submissions.map((submission) => (
                            <TableRow
                            key={submission._id}
                            className="cursor-pointer hover:bg-muted/50 text-xs"
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
                                className="h-6 px-2 text-xs"
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
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">No submissions yet.</p>
                        <p className="mt-1.5 text-xs text-muted-foreground">Share the form link to start receiving applications.</p>
                    </div>
                )}
            </CardContent>
          </Card>

          <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-sm">Submission Details</DialogTitle>
                <DialogDescription className="text-xs">Review the candidate&apos;s application</DialogDescription>
              </DialogHeader>
              {selectedSubmission && (
                <div className="space-y-4 pt-3">
                  {selectedSubmission.extractedData ? (
                    <>
                      <div>
                        <h2 className="text-lg font-bold text-primary">{selectedSubmission.extractedData.Name}</h2>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1.5">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${selectedSubmission.extractedData.Email}`} className="hover:underline">{selectedSubmission.extractedData.Email}</a>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{selectedSubmission.extractedData.Phone}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 text-xs">Skills</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSubmission.extractedData.Skills.split(',').map((skill) => (
                            <Badge key={skill.trim()} variant="secondary" className="font-normal text-[0.65rem]"> {skill.trim()}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5">
                        <div>
                          <h3 className="font-semibold mb-1.5 text-xs">Experience</h3>
                          <p className="text-xs text-muted-foreground">
                            {formatExperience(selectedSubmission.extractedData.Experience)}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1.5 text-xs">Education</h3>
                          <p className="text-xs text-muted-foreground">
                            {selectedSubmission.extractedData.Education}
                          </p>
                        </div>
                      </div>

                      <details className="pt-1.5">
                        <summary className="cursor-pointer text-xs font-medium">View Original Form Answers</summary>
                        <div className="space-y-3 mt-3">
                          {Object.entries(selectedSubmission.candidateData).map(([fieldId, answer]) => (
                            <div key={fieldId} className="rounded-lg border bg-muted/50 p-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                {fields.find((f) => f.id === fieldId)?.question || "Question"}
                              </p>
                              <p className="mt-0.5 text-xs">{answer as string}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground text-xs">No AI-extracted data available for this submission.</p>
                    </div>
                  )}
                  {selectedSubmission.resumeUrl && (
                     <div className="flex justify-end pt-3">
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs" asChild>
                          <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${selectedSubmission.resumeUrl}`} target="_blank" rel="noopener noreferrer">
                            <FileUp className="mr-1.5 h-3 w-3" />
                            View Original Resume
                          </a>
                        </Button>
                      </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" className="h-7 px-2 text-xs" onClick={() => handleDeny(selectedSubmission._id)}>Deny</Button>
                    <Button className="h-7 px-2 text-xs" onClick={() => handleApprove(selectedSubmission._id)}>Approve</Button>
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
    <WorkspaceLayout>
      <div className="flex flex-col h-full">
        {/* Simple header with submission count */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex w-full items-center justify-between gap-2 p-3">
            <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Forms
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col gap-2 p-3 overflow-hidden w-full">
          {pageContent()}
        </div>
      </div>
    </WorkspaceLayout>
  )
}