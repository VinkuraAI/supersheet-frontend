"use client";

import { useState, useEffect } from "react";
import apiClient from "@/utils/api.client";
import { format } from "date-fns";
import { useWorkspace } from "@/lib/workspace-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Issue {
  _id: string;
  title: string;
  description: string;
  creatorId: { name: string };
  status: "SOLVED" | "ARCHIVED" | "NOT_FOUND" | "UNDER_PROGRESS";
  createdAt: string;
}

export function IssueList({ isArchived = false, onCreate }: { isArchived?: boolean; onCreate?: () => void }) {
  const { selectedWorkspace } = useWorkspace();
  const [issues, setIssues] = useState<Issue[]>([]);
  const { toast } = useToast();

  const fetchIssues = async () => {
    if (!selectedWorkspace?._id) return;
    try {
      const endpoint = `/workspaces/${selectedWorkspace._id}/issues`;
      const res = await apiClient.get(endpoint);
      if (isArchived) {
        setIssues(res.data.filter((i: Issue) => i.status === "ARCHIVED"));
      } else {
        setIssues(res.data.filter((i: Issue) => i.status !== "ARCHIVED"));
      }
    } catch (error) {
      console.error("Failed to fetch issues", error);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [selectedWorkspace, isArchived]);

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      await apiClient.put(`/issues/${issueId}/status`, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Issue status changed to ${newStatus}.`,
      });
      fetchIssues();
    } catch (error) {
      console.error("Failed to update status", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "You might not have permission.",
      });
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
      {!isArchived && (
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-medium text-slate-800">Issues</h3>
             {onCreate && (
              <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                Report Issue
              </Button>
            )}
        </div>
      )}
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Creator</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
            {!isArchived && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {issues.map((issue) => (
            <tr key={issue._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{issue.creatorId?.name || "Unknown"}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{issue.title}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{issue.description}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{format(new Date(issue.createdAt), "PPP")}</td>
              <td className="px-6 py-4">
                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${issue.status === "SOLVED" ? "bg-green-100 text-green-800" :
                    issue.status === "UNDER_PROGRESS" ? "bg-blue-100 text-blue-800" :
                    issue.status === "NOT_FOUND" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"}`}
                >
                  {issue.status.replace("_", " ")}
                </span>
              </td>
              {!isArchived && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                   <select
                    className="text-xs border-slate-200 rounded-sm p-1"
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                  >
                    <option value="UNDER_PROGRESS">In Progress</option>
                    <option value="SOLVED">Solved</option>
                    <option value="NOT_FOUND">Not Found</option>
                    <option value="ARCHIVED">Archive</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
          {issues.length === 0 && (
             <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                No {isArchived ? "archived " : ""}issues found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
