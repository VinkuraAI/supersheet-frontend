"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
      const response = await apiClient.post(`/workspaces/invitations/${invitationId}/accept`);
      toast.success("Invitation accepted!");
      // Redirect to the workspace
      const workspaceId = response.data.workspaceId || details?.workspace._id;
      router.push(`/workspace/${workspaceId}`);
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>You've been invited!</CardTitle>
          <CardDescription>
            <span className="font-medium text-foreground">{details.inviter.name}</span> has invited you to join the workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-4 text-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${details.workspace.name}`} />
              <AvatarFallback>WS</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">{details.workspace.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">Role: {details.role}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" size="lg" onClick={handleAccept} disabled={isAccepting}>
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleReject} disabled={isAccepting}>
            Decline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
