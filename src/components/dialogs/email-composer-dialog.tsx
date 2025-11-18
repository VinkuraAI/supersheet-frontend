"use client";

import React, { useState, useEffect } from "react";
import {
  CustomEmailDialog,
  CustomEmailDialogHeader,
  CustomEmailDialogBody,
} from "@/components/dialogs/custom-email-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/user-context";
import { useWorkspace } from "@/lib/workspace-context";
import apiClient from "@/utils/api.client";

interface EmailComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateData: {
    name: string;
    email: string;
  };
  status: "Shortlisted" | "Interviewed" | "Rejected" | "Hired" | "Archived";
  onEmailSent: () => void;
}

export function EmailComposerDialog({
  open,
  onOpenChange,
  candidateData,
  status,
  onEmailSent,
}: EmailComposerDialogProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const { selectedWorkspace } = useWorkspace();
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Get default subject based on status
  const getDefaultSubject = (status: string) => {
    switch (status) {
      case "Shortlisted":
        return "Congratulations! You've been shortlisted";
      case "Interviewed":
        return "Thank you for your interview";
      case "Rejected":
        return "Update on your application";
      case "Hired":
        return "Congratulations! Job Offer";
      case "Archived":
        return "Your application status";
      default:
        return "Application Update";
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    candidateName: candidateData.name || "",
    candidateEmail: candidateData.email || "",
    hrName: user?.fullName || "",
    companyName: selectedWorkspace?.name || "",
    meetingLink: "",
    subject: getDefaultSubject(status),
    status: status,
    additionalInfo: "",
  });

  // Update form when candidateData, user, or workspace changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      candidateName: candidateData.name || "",
      candidateEmail: candidateData.email || "",
      hrName: user?.fullName || prev.hrName,
      companyName: selectedWorkspace?.name || prev.companyName,
      status: status,
      subject: getDefaultSubject(status),
    }));
  }, [candidateData, user, selectedWorkspace, status]);

  // Fetch email preview whenever form data changes
  useEffect(() => {
    const fetchPreview = async () => {
      setLoadingPreview(true);
      try {
        // Backend only requires status, all other fields are optional with defaults
        const response = await apiClient.post('/mail/preview', {
          status: formData.status,
          ...(formData.candidateName && { candidateName: formData.candidateName }),
          ...(formData.hrName && { hrName: formData.hrName }),
          ...(formData.companyName && { companyName: formData.companyName }),
          ...(formData.meetingLink && { meetingLink: formData.meetingLink }),
          ...(formData.additionalInfo && { additionalInfo: formData.additionalInfo }),
        });
        
        // Backend returns HTML directly
        setPreviewHtml(response.data);
      } catch (error) {
        console.error('Failed to fetch email preview:', error);
        setPreviewHtml('<div style="padding:40px;text-align:center;color:#666;font-family:Arial,sans-serif;"><p style="font-size:16px;margin-bottom:8px;">📧 Email Preview</p><p style="font-size:14px;color:#999;">Preview will appear here as you fill in the form</p></div>');
      } finally {
        setLoadingPreview(false);
      }
    };

    // Debounce the preview fetch
    const timeoutId = setTimeout(() => {
      fetchPreview();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async () => {
    // Validation
    const requiredFields = ["candidateEmail", "candidateName", "hrName", "companyName", "subject"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "⚠️ Missing Information",
        description: "Please fill in all required fields before sending the email.",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.candidateEmail)) {
      toast({
        variant: "destructive",
        title: "❌ Invalid Email",
        description: "Please enter a valid email address for the candidate.",
      });
      return;
    }

    // Validate meeting link format only if provided and status is Shortlisted
    if (formData.status === "Shortlisted" && formData.meetingLink && 
        !formData.meetingLink.startsWith('http://') && !formData.meetingLink.startsWith('https://')) {
      toast({
        variant: "destructive",
        title: "🔗 Invalid Meeting Link",
        description: "Meeting link must start with http:// or https://",
      });
      return;
    }

    setSending(true);

    try {
      // Prepare payload - backend expects these exact fields
      const payload = {
        candidateEmail: formData.candidateEmail,
        candidateName: formData.candidateName,
        hrName: formData.hrName,
        companyName: formData.companyName,
        subject: formData.subject,
        status: formData.status,
        ...(formData.meetingLink && { meetingLink: formData.meetingLink }),
        ...(formData.additionalInfo && { additionalInfo: formData.additionalInfo }),
      };

      console.log('Sending email with payload:', payload);

      // Call backend API to send email
      const response = await apiClient.post('/mail/send', payload);

      console.log('Email send response:', response.data);

      if (response.data) {
        toast({
          title: "✅ Email Sent Successfully!",
          description: `Your email has been sent to ${formData.candidateName} at ${formData.candidateEmail}`,
        });
        onEmailSent();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Email send error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Extract detailed error message from backend
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.response?.data?.details ||
        error.message || 
        "An error occurred while sending the email";
      
      toast({
        variant: "destructive",
        title: "❌ Failed to Send Email",
        description: errorMessage,
      });
    } finally {
      setSending(false);
    }
  };

  // Generate status-specific helper text
  const getStatusHelp = () => {
    switch (status) {
      case "Shortlisted":
        return "🎉 Congratulations message with optional interview meeting link";
      case "Interviewed":
        return "Thank you message with next steps information";
      case "Rejected":
        return "Professional rejection with encouragement for future opportunities";
      case "Hired":
        return "🎊 Job offer congratulations with welcome message";
      case "Archived":
        return "📌 Keep in talent pool for future opportunities";
      default:
        return "";
    }
  };

  return (
    <CustomEmailDialog open={open} onOpenChange={onOpenChange}>
      {/* Header */}
      <CustomEmailDialogHeader onClose={() => onOpenChange(false)}>
        Send {status} Email
      </CustomEmailDialogHeader>

      {/* Main Content */}
      <CustomEmailDialogBody>
        <div className="flex h-full overflow-hidden">
          {/* Left Side - Form Inputs */}
          <div className="w-1/2 border-r overflow-y-auto p-6">
            <div className="space-y-5 max-w-xl">
              {/* Status Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Status:</strong> {status}
                </p>
                <p className="text-xs text-blue-600 mt-1">{getStatusHelp()}</p>
              </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="candidateName" className="text-sm font-medium">
                  Candidate Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="candidateName"
                  value={formData.candidateName}
                  onChange={(e) => handleInputChange("candidateName", e.target.value)}
                  placeholder="John Doe"
                  disabled={sending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="candidateEmail" className="text-sm font-medium">
                  Candidate Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="candidateEmail"
                  type="email"
                  value={formData.candidateEmail}
                  onChange={(e) => handleInputChange("candidateEmail", e.target.value)}
                  placeholder="john.doe@example.com"
                  disabled={sending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                Email Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Email subject"
                disabled={sending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hrName" className="text-sm font-medium">
                  Your Name (HR Manager) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hrName"
                  value={formData.hrName}
                  onChange={(e) => handleInputChange("hrName", e.target.value)}
                  placeholder="Jane Smith"
                  disabled={sending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="Tech Corp"
                  disabled={sending}
                />
              </div>
            </div>

            {/* Meeting Link - Only for Shortlisted */}
            {status === "Shortlisted" && (
              <div className="space-y-2">
                <Label htmlFor="meetingLink" className="text-sm font-medium">
                  Meeting Link <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="meetingLink"
                  value={formData.meetingLink}
                  onChange={(e) => handleInputChange("meetingLink", e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  disabled={sending}
                />
                <p className="text-xs text-muted-foreground">
                  📅 Google Meet, Zoom, or any video call link
                </p>
              </div>
            )}

            {/* Additional Info - Optional for all statuses */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo" className="text-sm font-medium">
                Additional Message <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                placeholder="Add any custom message or additional information..."
                rows={4}
                disabled={sending}
              />
              <p className="text-xs text-muted-foreground">
                This will be included in the email template
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSendEmail}
                disabled={sending}
                className="w-full"
                size="lg"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send {status} Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Email Preview */}
        <div className="w-1/2 bg-slate-50 overflow-y-auto p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Email Preview</h3>
            <p className="text-xs text-slate-500">This is how the email will look to the candidate</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border">
            {loadingPreview ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-slate-600">Loading preview...</span>
              </div>
            ) : (
              <div
                className="email-preview overflow-auto"
                style={{ 
                  minHeight: '400px',
                  maxHeight: '600px'
                }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>
          
          <style jsx global>{`
            .email-preview {
              font-family: Arial, sans-serif;
            }
            .email-preview img {
              max-width: 100%;
              height: auto;
            }
            .email-preview table {
              border-collapse: collapse;
            }
          `}</style>
        </div>
      </div>
      </CustomEmailDialogBody>
    </CustomEmailDialog>
  );
}
