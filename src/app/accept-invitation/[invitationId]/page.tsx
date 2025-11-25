"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { workspaceKeys } from "@/features/workspace/hooks/use-workspaces";
import apiClient from "@/utils/api.client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface InvitationDetails {
  _id: string;
  workspace: {
    _id: string;
    name: string;
    mainFocus: string;
  };
  inviter: {
    name: string;
    email: string;
  };
  role: string;
  status: 'pending' | 'accepted' | 'expired';
}

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const invitationId = params.invitationId as string;

  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await apiClient.get(`/workspaces/invitations/${invitationId}`);
        setDetails(response.data);
      } catch (err: any) {
        console.error("Failed to fetch invitation:", err);
        setError(err.response?.data?.error || "Failed to load invitation details. It may be invalid or expired.");
      } finally {
        setIsLoading(false);
      }
    };

    if (invitationId) {
      fetchDetails();
    }
  }, [invitationId]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await apiClient.post(`/workspaces/invitations/${invitationId}/accept`);
      toast.success("Invitation accepted!");
      
      // Refresh the workspaces list so the new workspace appears in the sidebar
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });

      // Redirect to the workspace using the ID from the loaded details
      if (details?.workspace?._id) {
        const isPM = details.workspace.mainFocus === 'product-management' || details.workspace.mainFocus === 'project-management';
        router.push(`/${isPM ? 'pm' : 'hr'}/workspace/${details.workspace._id}`);
      }
    } catch (err: any) {
      console.error("Failed to accept invitation:", err);
      toast.error(err.response?.data?.error || "Failed to accept invitation");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to decline this invitation?")) return;
    try {
      await apiClient.post(`/workspaces/invitations/${invitationId}/reject`);
      toast.success("Invitation declined");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Failed to decline invitation");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4 bg-white">
        <Card className="w-full max-w-md border-red-100 shadow-xl shadow-red-500/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-red-600 text-xl">Invalid Invitation</CardTitle>
            <CardDescription className="text-slate-500 mt-2">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pt-6">
            <Button onClick={() => router.push("/dashboard")} variant="outline" className="border-slate-200 hover:bg-slate-50">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="flex h-screen items-center justify-center bg-white p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <Card className="w-full max-w-md shadow-2xl shadow-blue-500/10 border-slate-100 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 border-4 border-white shadow-lg ring-1 ring-blue-100">
            <CheckCircle2 className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">You&apos;ve been invited!</CardTitle>
          <CardDescription className="text-slate-500 text-base mt-2">
            <span className="font-semibold text-slate-800">{details.inviter.name}</span> has invited you to join the workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="flex flex-col items-center space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center transition-all hover:bg-slate-50 hover:border-blue-100 hover:shadow-sm">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${details.workspace.name}`} />
              <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                {details.workspace.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{details.workspace.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide">
                  {details.role}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8 px-8">
          <Button
            className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 rounded-xl"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Joining Workspace...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full h-11 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl"
            onClick={handleReject}
            disabled={isAccepting}
          >
            Decline Invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
