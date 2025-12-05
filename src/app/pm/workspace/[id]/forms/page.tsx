'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Check, Link as LinkIcon, FileText, Loader2 } from "lucide-react"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { useWorkspace } from "@/lib/workspace-context"
import apiClient from "@/utils/api.client";
import { FormBuilder } from "@/components/forms/form-builder"
import { FormSubmissionsList } from "@/components/forms/form-submissions-list"
import { SubmissionDetailsDialog } from "@/components/forms/submission-details-dialog"
import { FormEmptyState } from "@/components/forms/form-empty-state"
import { FormSuccessState } from "@/components/forms/form-success-state"
import { Submission, FormField } from "@/components/forms/types"

export default function HRFormsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { selectedWorkspace, workspaces, setSelectedWorkspace, currentRole } = useWorkspace();

  // Set the selected workspace based on URL parameter
  useEffect(() => {
    if (workspaceId && workspaces.length > 0 && (!selectedWorkspace || selectedWorkspace._id !== workspaceId)) {
      const workspace = workspaces.find(w => w._id === workspaceId);
      if (workspace) {
        setSelectedWorkspace(workspace);
      }
    }
  }, [workspaceId, workspaces, selectedWorkspace, setSelectedWorkspace]);

  const [formId, setFormId] = useState<string | null>(null);
  const [formExists, setFormExists] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)
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
        // Step 1: Get forms for this workspace
        const response = await apiClient.get(`/workspaces/${workspaceId}/forms`);
        const forms = response.data;

        if (forms && forms.length > 0) {
          const formData = forms[0]; // Use the first form found
          setFormId(formData._id);
          setFormTitle(formData.title);
          setFormDescription(formData.description || "");
          setFields(formData.fields);
          setFormExists(true);

          // Step 2: Fetch submissions for this form
          try {
            const submissionsResponse = await apiClient.get(`/forms/${formData._id}/submissions`);
            setSubmissions(submissionsResponse.data.submissions || []);
          } catch (submissionError) {
            console.log("No submissions found for this form.", submissionError);
            setSubmissions([]);
          }
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
  }

  const handleSaveForm = async (formData: { title: string; description: string; fields: FormField[] }) => {
    const form = {
      workspaceId: workspaceId,
      title: formData.title,
      description: formData.description,
      fields: formData.fields,
    };

    try {
      const response = await apiClient.post(`/workspaces/${workspaceId}/forms`, form);
      setFormId(response.data._id);
      setFormTitle(formData.title);
      setFormDescription(formData.description);
      setFields(formData.fields);
      setIsBuilding(false)
      setFormCreationSuccess(true);
    } catch (error) {
      console.error("Failed to save form:", error);
    }
  }

  const handleApprove = async (submissionId: string) => {
    if (!workspaceId || !formId) return;
    try {
      await apiClient.post(`/forms/${formId}/submissions/${submissionId}/add-to-workspace`, {
        source: "Form"
      });

      setSubmissions(prev => prev.map(s =>
        s._id === submissionId ? { ...s, status: 'Approved' } : s
      ));

      if (selectedSubmission?._id === submissionId) {
        setSelectedSubmission(prev => prev ? { ...prev, status: 'Approved' } : null);
      }
    } catch (error) {
      console.error("Failed to approve submission:", error);
    }
  };

  const handleDeny = async (submissionId: string) => {
    if (!formId) return;
    try {
      await apiClient.post(`/forms/${formId}/submissions/${submissionId}/deny`);

      setSubmissions(prev => prev.map(s =>
        s._id === submissionId ? { ...s, status: 'Denied' } : s
      ));

      if (selectedSubmission?._id === submissionId) {
        setSelectedSubmission(prev => prev ? { ...prev, status: 'Denied' } : null);
      }
    } catch (error) {
      console.error("Failed to deny submission:", error);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!formId) return;
    if (!confirm("Are you sure you want to permanently delete this submission?")) {
      return;
    }

    try {
      await apiClient.delete(`/forms/${formId}/submissions/${submissionId}`);
      setSubmissions(submissions.filter(s => s._id !== submissionId));
      if (selectedSubmission?._id === submissionId) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Failed to delete submission:", error);
    }
  };

  const getShareableLink = () => {
    if (!formId) return "";
    return `${window.location.origin}/candidateForm/${formId}`;
  }

  const isViewer = currentRole === 'viewer';

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
        <FormSuccessState
          shareableLink={getShareableLink()}
          onViewSubmissions={() => setFormCreationSuccess(false)}
        />
      )
    }

    if (!formExists) {
      return <FormEmptyState onCreateForm={handleCreateForm} isViewer={isViewer} />
    }

    if (isBuilding) {
      return (
        <FormBuilder
          onSave={handleSaveForm}
          initialTitle={formTitle}
          initialDescription={formDescription}
          initialFields={fields}
        />
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
            {!isViewer && (
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
            )}
          </div>

          <FormSubmissionsList
            submissions={submissions}
            onSelectSubmission={setSelectedSubmission}
            onDeleteSubmission={handleDeleteSubmission}
            isViewer={isViewer}
          />

          <SubmissionDetailsDialog
            submission={selectedSubmission}
            isOpen={!!selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            fields={fields}
            onApprove={handleApprove}
            onDeny={handleDeny}
            isViewer={isViewer}
          />
        </div>
      </div>
    )
  }

  return (
    <WorkspaceLayout>
      <div className="flex flex-col h-full">
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