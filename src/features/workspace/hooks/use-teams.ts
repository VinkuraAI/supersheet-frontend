import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/api.client";

export const teamKeys = {
    all: ["teams"] as const,
    lists: () => [...teamKeys.all, "list"] as const,
    list: (workspaceId: string) => [...teamKeys.lists(), workspaceId] as const,
};

export function useTeams(workspaceId: string) {
    return useQuery({
        queryKey: teamKeys.list(workspaceId),
        queryFn: async () => {
            if (!workspaceId) return [];
            const response = await apiClient.get(`/${workspaceId}/teams`);
            return response.data;
        },
        enabled: !!workspaceId,
    });
}

export function useAddTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workspaceId, teamData }: { workspaceId: string, teamData: any }) => {
            const response = await apiClient.post(`/${workspaceId}/teams`, teamData);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.workspaceId) });
        },
    });
}

export function useUpdateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workspaceId, teamId, teamData }: { workspaceId: string, teamId: string, teamData: any }) => {
            const response = await apiClient.put(`/${workspaceId}/teams/${teamId}`, teamData);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.workspaceId) });
        },
    });
}

export function useDeleteTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workspaceId, teamId }: { workspaceId: string, teamId: string }) => {
            await apiClient.delete(`/${workspaceId}/teams/${teamId}`);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.workspaceId) });
        },
    });
}
