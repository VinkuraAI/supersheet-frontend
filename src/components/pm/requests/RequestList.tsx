"use client";

import { useState, useEffect } from "react";
import apiClient from "@/utils/api.client";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/lib/workspace-context";

interface Request {
  _id: string;
  title: string;
  description: string;
  requesterId: { _id: string; name: string; email: string };
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export function RequestList({ onCreate }: { onCreate?: () => void }) {
  const { selectedWorkspace } = useWorkspace();
  const [requests, setRequests] = useState<Request[]>([]);
  const { toast } = useToast();

  const fetchRequests = async () => {
    if (!selectedWorkspace?._id) return;
    try {
      const res = await apiClient.get(`/workspaces/${selectedWorkspace._id}/requests`);
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedWorkspace]);

  const handleStatusUpdate = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await apiClient.put(`/requests/${requestId}/status`, { status });
      toast({
        title: `Request ${status === "APPROVED" ? "Approved" : "Rejected"}`,
        description: "The request status has been updated.",
      });
      fetchRequests();
    } catch (error) {
      console.error("Failed to update status", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "You might not have permission to perform this action.",
      });
    }
  };

  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const paginatedRequests = requests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-medium text-slate-800">Requests</h3>
        {onCreate && (
          <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
            Create Request
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requester</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {paginatedRequests.map((req) => (
              <tr key={req._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {req.requesterId?.name || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{req.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(req.createdAt), "PPP")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${req.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      req.status === "REJECTED" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"}`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {req.status === "PENDING" && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleStatusUpdate(req._id, "APPROVED")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleStatusUpdate(req._id, "REJECTED")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
