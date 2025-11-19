"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail, User, Briefcase, Shield } from "lucide-react";
import apiClient from "@/utils/api.client";
import { useToast } from "@/hooks/use-toast";

interface InvitationDetails {
  email: string;
  role: string;
  workspace: {
    _id: string;
    name: string;
    mainFocus: string;
  };
  inviter: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const invitationId = params.id as string;

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchInvitationDetails();
  }, [invitationId]);

  const fetchInvitationDetails = async () => {
    try {
      const response = await apiClient.get(`/workspaces/invitations/${invitationId}`);
      setInvitation(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to load invitation details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await apiClient.post(`/workspaces/invitations/${invitationId}/accept`);
      setSuccess(true);
      toast({
        title: "Invitation accepted",
        description: "You have successfully joined the workspace",
      });

      // Redirect to workspace after 2 seconds
      setTimeout(() => {
        router.push(`/workspace/${response.data.workspaceId}`);
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Failed to accept invitation",
        description: error.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await apiClient.post(`/workspaces/invitations/${invitationId}/reject`);
      toast({
        title: "Invitation rejected",
        description: "You have declined the workspace invitation",
      });

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Failed to reject invitation",
        description: error.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              Invitation Not Found
            </h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              Invitation Accepted!
            </h1>
            <p className="text-slate-600 mb-4">
              You have successfully joined the workspace. Redirecting...
            </p>
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-semibold text-slate-900">
            Workspace Invitation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            You've been invited to join a workspace
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Workspace Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Workspace</p>
                <p className="font-semibold text-slate-900">{invitation?.workspace.name}</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {invitation?.workspace.mainFocus.replace("-", " ")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Invited by</p>
                <p className="font-semibold text-slate-900">{invitation?.inviter.name}</p>
                <p className="text-xs text-slate-500 mt-1">{invitation?.inviter.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Your role</p>
                <p className="font-semibold text-slate-900 capitalize">{invitation?.role}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {invitation?.role === "admin" && "Can manage members and settings"}
                  {invitation?.role === "editor" && "Can edit content and manage rows"}
                  {invitation?.role === "viewer" && "Can view workspace content"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Invited email</p>
                <p className="font-semibold text-slate-900">{invitation?.email}</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              By accepting this invitation, you will be able to access and collaborate in the{" "}
              <span className="font-semibold">{invitation?.workspace.name}</span> workspace with{" "}
              <span className="font-semibold capitalize">{invitation?.role}</span> permissions.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-200 px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Decline"
            )}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
