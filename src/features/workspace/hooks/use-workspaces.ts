import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService, Workspace } from "../services/workspace-service";
import { Role } from "@/utils/permissions";

export const workspaceKeys = {
  all: ["workspaces"] as const,
  lists: () => [...workspaceKeys.all, "list"] as const,
  detail: (id: string) => [...workspaceKeys.all, "detail", id] as const,
  members: (id: string) => [...workspaceKeys.detail(id), "members"] as const,
  forms: (id: string) => [...workspaceKeys.detail(id), "forms"] as const,
};

export function useWorkspaces(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: workspaceService.getWorkspaces,
    enabled: options?.enabled,
  });
}

export function useWorkspace(id: string | null) {
  return useQuery({
    queryKey: workspaceKeys.detail(id!),
    queryFn: () => workspaceService.getWorkspace(id!),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workspace> }) =>
      workspaceService.updateWorkspace(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(variables.id) });
    },
  });
}

export function useWorkspaceMembers(id: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.members(id!),
    queryFn: () => workspaceService.getWorkspaceMembers(id!),
    enabled: !!id,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email, role, origin }: { id: string; email: string; role: Role; origin: string }) =>
      workspaceService.inviteMember(id, email, role, origin),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(variables.id) });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspaceService.removeMember(workspaceId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(variables.workspaceId) });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, userId, role }: { workspaceId: string; userId: string; role: Role }) =>
      workspaceService.updateMemberRole(workspaceId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(variables.workspaceId) });
    },
  });
}

export function useWorkspaceForms(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: workspaceKeys.forms(id!),
    queryFn: () => workspaceService.getWorkspaceForms(id!),
    enabled: !!id && enabled,
  });
}

export function useWorkspaceDetails(id: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.detail(id!),
    queryFn: () => workspaceService.getWorkspaceDetails(id!),
    enabled: !!id,
  });
}

export function useSendRowMail() {
  return useMutation({
    mutationFn: ({ workspaceId, rowId }: { workspaceId: string; rowId: string }) =>
      workspaceService.sendRowMail(workspaceId, rowId),
  });
}

export function useSyncWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, changes, columns }: { workspaceId: string; changes: any; columns?: any[] }) =>
      workspaceService.syncWorkspace(workspaceId, changes, columns),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(variables.workspaceId) });
    },
  });
}
