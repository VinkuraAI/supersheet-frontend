"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Share2, Loader2, UserPlus, Info, Copy, Check, AlertCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/api.client";

interface ShareWorkspaceDialogProps {
  workspaceId: string;
  workspaceName: string;
}

const roleDescriptions = {
  owner: "Full control over workspace including deletion",
  admin: "Can manage members and all workspace settings",
  editor: "Can edit content and manage rows",
  viewer: "Can only view workspace content",
};

type ResponseType = "success" | "already_invited" | "user_not_found" | "already_member" | "error";

export function ShareWorkspaceDialog({
  workspaceId,
  workspaceName,
}: ShareWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "admin" | "editor" | "viewer">("viewer");
  const [isLoading, setIsLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<ResponseType | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setInvitationLink(null);
    setResponseMessage(null);
    setResponseType(null);

    try {
      const response = await apiClient.post(`/workspaces/${workspaceId}/invitations`, {
        email,
        role,
      });

      const data = response.data;

      // Show success message and invitation link
      setResponseMessage(data.message || "Invitation created successfully");
      setInvitationLink(data.invitationLink);
      setResponseType(data.type);
      
      // Show different toast colors based on response type
      if (data.type === "success") {
        toast({
          title: "Invitation created",
          description: data.message || "Invitation link has been generated",
          className: "bg-green-50 border-green-200 text-green-900",
        });
      } else if (data.type === "already_invited") {
        toast({
          title: "Invitation already exists",
          description: data.message || "An invitation was already sent to this user",
          className: "bg-amber-50 border-amber-200 text-amber-900",
        });
      }
    } catch (error: any) {
      // Handle error response
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || error.message || "An error occurred";
      setResponseMessage(errorMessage);
      setResponseType(errorData?.type || "error");
      
      // Show different toast colors based on error type
      if (errorData?.type === "user_not_found") {
        toast({
          title: "User not found",
          description: errorMessage,
          className: "bg-orange-50 border-orange-200 text-orange-900",
        });
      } else if (errorData?.type === "already_member") {
        toast({
          title: "Already a member",
          description: errorMessage,
          className: "bg-blue-50 border-blue-200 text-blue-900",
        });
      } else {
        toast({
          title: "Failed to send invitation",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Invitation link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setRole("viewer");
    setInvitationLink(null);
    setResponseMessage(null);
    setResponseType(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          <Share2 className="mr-1.5 h-3 w-3" />
          Share Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Share workspace</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Invite a team member to <span className="font-medium text-slate-900">{workspaceName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-10"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-slate-700">
              Role
            </label>
            <Select
              value={role}
              onValueChange={(value: any) => setRole(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="role" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Viewer</span>
                    <span className="text-xs text-slate-500">Can view workspace content</span>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Editor</span>
                    <span className="text-xs text-slate-500">Can edit content and manage rows</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-slate-500">Can manage members and settings</span>
                  </div>
                </SelectItem>
                <SelectItem value="owner">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Owner</span>
                    <span className="text-xs text-slate-500">Full control including deletion</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Role Description Info */}
            <div className="flex gap-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
              <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-600 leading-relaxed">
                {roleDescriptions[role]}
              </p>
            </div>
          </div>

          {/* Response Message */}
          {responseMessage && (
            <div className={`flex gap-2 px-3 py-2 rounded-md border ${
              responseType === "success" || responseType === "already_invited"
                ? "bg-green-50 border-green-200" 
                : responseType === "user_not_found"
                ? "bg-orange-50 border-orange-200"
                : responseType === "already_member"
                ? "bg-blue-50 border-blue-200"
                : "bg-red-50 border-red-200"
            }`}>
              {responseType === "success" || responseType === "already_invited" ? (
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : responseType === "user_not_found" || responseType === "already_member" ? (
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-xs leading-relaxed ${
                responseType === "success" || responseType === "already_invited"
                  ? "text-green-700"
                  : responseType === "user_not_found"
                  ? "text-orange-700"
                  : responseType === "already_member"
                  ? "text-blue-700"
                  : "text-red-700"
              }`}>
                {responseMessage}
              </p>
            </div>
          )}

          {/* Invitation Link */}
          {invitationLink && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Invitation link
              </label>
              <div className="flex gap-2">
                <Input
                  value={invitationLink}
                  readOnly
                  className="h-10 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="h-10 w-10 flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Share this link with the invitee to join the workspace
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {invitationLink ? (
            <Button onClick={handleClose}>
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating invitation...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Send invitation
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
