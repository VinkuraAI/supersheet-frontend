import apiClient from "@/utils/api.client";
import { Role } from "@/utils/permissions";

export interface Member {
    user: {
        _id: string;
        name: string;
        email: string;
    };
    role: Role;
}

export interface Workspace {
    _id: string;
    name: string;
    userId: string;
    members?: Member[];
    mainFocus?: string;
    role?: Role;
    permissions?: {
        canManageTasks?: boolean;
        canManageWorkspace?: boolean;
        [key: string]: any;
    };
}

export interface WorkspaceDetails extends Workspace {
    table: {
        rows: any[];
        schema: any[];
    };
    jd: string;
}

export interface WorkspacesResponse {
    ownedWorkspaces: Workspace[];
    sharedWorkspaces: Workspace[];
}

export const workspaceService = {
    getWorkspaces: async (): Promise<WorkspacesResponse> => {
        try {
            const response = await apiClient.get<WorkspacesResponse>("/workspaces");
            return response.data;
        } catch (error) {
            // Suppress console error and return empty lists as fallback
            return { ownedWorkspaces: [], sharedWorkspaces: [] };
        }
    },

    getWorkspace: async (id: string): Promise<Workspace> => {
        const response = await apiClient.get<Workspace>(`/workspaces/${id}`);
        return response.data;
    },

    createWorkspace: async (name: string): Promise<Workspace> => {
        const response = await apiClient.post<Workspace>("/workspaces", { name });
        return response.data;
    },

    deleteWorkspace: async (id: string): Promise<void> => {
        await apiClient.delete(`/workspaces/${id}`);
    },

    updateWorkspace: async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
        const response = await apiClient.put<Workspace>(`/workspaces/${id}`, data);
        return response.data;
    },

    getWorkspaceMembers: async (id: string): Promise<Member[]> => {
        const response = await apiClient.get<Member[]>(`/workspaces/${id}/members`);
        return response.data;
    },

    inviteMember: async (id: string, email: string, role: Role, origin: string): Promise<any> => {
        const response = await apiClient.post(`/workspaces/${id}/invite`, { email, role, origin });
        return response.data;
    },

    removeMember: async (workspaceId: string, userId: string): Promise<void> => {
        await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
    },

    updateMemberRole: async (workspaceId: string, userId: string, role: Role): Promise<void> => {
        await apiClient.put(`/workspaces/${workspaceId}/members/${userId}`, { role });
    },

    getWorkspaceForms: async (id: string): Promise<any[]> => {
        const response = await apiClient.get(`/workspaces/${id}/forms`);
        return response.data;
    },

    getWorkspaceDetails: async (id: string): Promise<WorkspaceDetails> => {
        const response = await apiClient.get<WorkspaceDetails>(`/workspaces/${id}`);
        return response.data;
    },

    sendRowMail: async (workspaceId: string, rowId: string): Promise<void> => {
        await apiClient.post(`/workspaces/${workspaceId}/rows/${rowId}/send-mail`, {});
    },

    syncWorkspace: async (workspaceId: string, changes: { added: any[], updated: any[], deleted: any[] }, columns?: any[]): Promise<void> => {
        const payload: any = { ...changes };
        if (columns) {
            payload.columns = columns;
        }
        await apiClient.post(`/workspaces/${workspaceId}/sync`, payload);
    }
};
