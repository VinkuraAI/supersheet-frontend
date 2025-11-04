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
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateData: {
    name: string;
    email: string;
  };
  onEmailSent: () => void;
}

export function EmailComposerDialog({
  open,
  onOpenChange,
  candidateData,
  onEmailSent,
}: EmailComposerDialogProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    candidateName: candidateData.name || "",
    candidateEmail: candidateData.email || "",
    hrName: "",
    companyName: "",
    meetingLink: "",
    subject: "Congratulations! You've been shortlisted",
  });

  // Update form when candidateData changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      candidateName: candidateData.name || "",
      candidateEmail: candidateData.email || "",
    }));
  }, [candidateData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async () => {
    // Validation
    if (!formData.candidateEmail || !formData.candidateName || !formData.hrName || 
        !formData.companyName || !formData.meetingLink || !formData.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.candidateEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Validate meeting link format
    if (!formData.meetingLink.startsWith('http://') && !formData.meetingLink.startsWith('https://')) {
      toast({
        title: "Invalid Meeting Link",
        description: "Meeting link must start with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      // Remove trailing slash from API URL to avoid double slashes
      let apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash if present
      
      const response = await fetch(
        `${apiUrl}/api/send-status-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Backend returned HTML or non-JSON response
        const textResponse = await response.text();
        console.error("Non-JSON response from server:", textResponse);
        throw new Error(
          `Backend API error: The server returned an HTML page instead of JSON. ` +
          `Please ensure the backend is running at ${apiUrl} and the endpoint /api/send-status-email exists.`
        );
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Email Sent Successfully",
          description: `Email sent to ${formData.candidateName}`,
        });
        onEmailSent();
        onOpenChange(false);
      } else {
        throw new Error(data.error || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Email send error:", error);
      
      // Provide more helpful error messages
      let errorMessage = error.message || "An error occurred while sending the email";
      
      if (error.message && error.message.includes("fetch")) {
        errorMessage = "Cannot connect to backend server. Please ensure the backend is running.";
      } else if (error.message && error.message.includes("NetworkError")) {
        errorMessage = "Network error. Please check your internet connection and backend server.";
      }
      
      toast({
        title: "Failed to Send Email",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Generate email preview HTML
  const generateEmailPreview = () => {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">Supersheet</h1>
        </div>
        
        <!-- Main Content -->
        <div style="background-color: white; padding: 40px 32px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Hello ${formData.candidateName || '[Candidate Name]'},</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            Congratulations! We are pleased to inform you that you have been shortlisted for the position at ${formData.companyName || '[Company Name]'}.
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            We were impressed with your application and would like to invite you to the next stage of our hiring process.
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            <strong style="color: #1f2937;">Meeting Link:</strong><br/>
            <a href="${formData.meetingLink || '#'}" style="color: #3b82f6; text-decoration: none; display: inline-block; margin-top: 8px; padding: 12px 24px; background-color: #eff6ff; border-radius: 6px; font-weight: 500;">
              Join your meeting here →
            </a>
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 24px 0;">
            <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.5;">
              <strong>💡 Tip:</strong> Please join the meeting 5 minutes early to ensure everything is working properly.
            </p>
          </div>
        </div>
        
        <!-- Signature -->
        <div style="background-color: white; padding: 32px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 8px;">
            Thank you for your time and interest in ${formData.companyName || '[Company Name]'}.
          </p>
          <p style="color: #6b7280; font-size: 15px; margin-bottom: 16px;">Best regards,</p>
          <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0;">${formData.hrName || '[HR Manager Name]'}</p>
          <p style="color: #6b7280; font-size: 14px; font-style: italic; margin: 4px 0;">Hiring Manager</p>
          <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 4px 0;">${formData.companyName || '[Company Name]'}</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
            &copy; 2025 Supersheet. All rights reserved.
          </p>
          <a href="https://supersheet.in" style="color: #3b82f6; text-decoration: none; font-size: 13px; font-weight: 500;">
            Supersheet.in
          </a>
        </div>
      </div>
    `;
  };

  return (
    <CustomEmailDialog open={open} onOpenChange={onOpenChange}>
      {/* Header */}
      <CustomEmailDialogHeader onClose={() => onOpenChange(false)}>
        Compose Email
      </CustomEmailDialogHeader>

      {/* Main Content - Split View */}
      <CustomEmailDialogBody>
        <div className="flex h-full overflow-hidden">
          {/* Left Side - Form Inputs */}
          <div className="w-1/2 border-r overflow-y-auto p-6">
            <div className="space-y-5 max-w-xl">
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

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Email Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Congratulations! You've been shortlisted"
                  disabled={sending}
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="meetingLink" className="text-sm font-medium">
                  Meeting Link <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="meetingLink"
                  value={formData.meetingLink}
                  onChange={(e) => handleInputChange("meetingLink", e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  disabled={sending}
                />
                <p className="text-xs text-muted-foreground">
                  Google Meet, Zoom, or any video call link
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
                      Send Email
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
            
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div
                className="email-preview"
                dangerouslySetInnerHTML={{ __html: generateEmailPreview() }}
              />
            </div>
          </div>
        </div>
      </CustomEmailDialogBody>
    </CustomEmailDialog>
  );
}
