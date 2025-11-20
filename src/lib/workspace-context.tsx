"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/utils/api.client';
import { Role, canManageWorkspace, canDeleteWorkspace, canManageMembers, canEditContent } from '@/utils/permissions';

interface Workspace {
  _id: string;
  name: string;
  userId: string;
  members?: {
    user: string | { _id: string; name: string; email: string };
    role: Role;
  }[];
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  ownedWorkspaces: Workspace[];
  sharedWorkspaces: Workspace[];
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
  isLoading: boolean;
  canCreateWorkspace: boolean;
  workspaceCount: number;
  maxWorkspaces: number;
  currentRole: Role | null;
  permissions: {
    canManageWorkspace: boolean;
    canDeleteWorkspace: boolean;
    canManageMembers: boolean;
    canEditContent: boolean;
  };
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [ownedWorkspaces, setOwnedWorkspaces] = useState<Workspace[]>([]);
  const [sharedWorkspaces, setSharedWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (selectedWorkspace) {
      const storedUserStr = localStorage.getItem("user");
      if (storedUserStr) {
        try {
          const user = JSON.parse(storedUserStr);
          // Find member
          const member = selectedWorkspace.members?.find(m => {
            const memberId = typeof m.user === 'string' ? m.user : m.user._id;
            return memberId === user.id;
          });

          // If not found in members, check if owner (userId field)
          let role: Role | null = member?.role || null;

          if (!role && selectedWorkspace.userId === user.id) {
            role = 'owner';
          }

          setCurrentRole(role);
        } catch (e) {
          console.error("Error parsing user for role calculation", e);
          setCurrentRole(null);
        }
      }
    } else {
      setCurrentRole(null);
    }
  }, [selectedWorkspace]);

  const permissions = {
    canManageWorkspace: canManageWorkspace(currentRole || undefined),
    canDeleteWorkspace: canDeleteWorkspace(currentRole || undefined),
    canManageMembers: canManageMembers(currentRole || undefined),
    canEditContent: canEditContent(currentRole || undefined),
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated first
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          // No user logged in, don't make API calls
          setIsLoading(false);
          return;
        }

        const response = await apiClient.get<{ ownedWorkspaces: Workspace[], sharedWorkspaces: Workspace[] }>("/workspaces");
        const { ownedWorkspaces: owned, sharedWorkspaces: shared } = response.data;

        setOwnedWorkspaces(owned);
        setSharedWorkspaces(shared);

        // Combine both for the workspaces array (for backward compatibility)
        const allWorkspaces = [...owned, ...shared];
        setWorkspaces(allWorkspaces);

        const pathSegments = pathname.split('/');
        const workspaceIdFromUrl = pathSegments.length > 2 && pathSegments[1] === 'workspace' ? pathSegments[2] : null;

        if (workspaceIdFromUrl) {
          const found = allWorkspaces.find(w => w._id === workspaceIdFromUrl);
          setSelectedWorkspaceState(found || null);
        } else {
          const isAuthPage = pathname.startsWith('/auth');
          const isWelcomePage = pathname === '/welcome';
          const isWorkspaceSetupPage = pathname === '/workspace-setup';
          const isDashboardPage = pathname === '/dashboard';
          const isRootPage = pathname === '/';
          const isReportsPage = pathname === '/reports';
          const isWorkspaceReportsPage = pathname === '/workspace/reports';
          const isAcceptInvitationPage = pathname.startsWith('/accept-invitation');
          const isCandidateFormPage = pathname.startsWith('/candidateForm');

          if (!isAuthPage && !isWelcomePage && !isWorkspaceSetupPage && !isDashboardPage && !isRootPage && !isReportsPage && !isWorkspaceReportsPage && !isAcceptInvitationPage && !isCandidateFormPage) {
            // Only redirect to welcome if user has NO workspaces (neither owned nor shared)
            if (owned.length === 0 && shared.length === 0) {
              router.push('/welcome');
            } else if (allWorkspaces.length > 0) {
              router.push('/dashboard');
            }
          }
        }
      } catch (error: unknown) {
        // Handle 401 Unauthorized or 403 Forbidden - user needs to log in
        // 403 is often returned when the session cookie is invalid or missing
        const isAuthError = error && typeof error === 'object' && 'response' in error &&
          (error as any).response && typeof (error as any).response === 'object' && 'status' in (error as any).response &&
          ((error as any).response.status === 401 || (error as any).response.status === 403);

        if (isAuthError) {
          // User is not authenticated, silently handle it
          localStorage.removeItem("user");
          setWorkspaces([]);
          setOwnedWorkspaces([]);
          setSharedWorkspaces([]);
          setSelectedWorkspaceState(null);
          // Only log in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log("User not authenticated, clearing workspace data");
          }
        } else {
          // Log other errors
          console.error("Failed to fetch workspaces:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [pathname, router]);

  const setSelectedWorkspace = (workspace: Workspace | null) => {
    setSelectedWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem("selectedWorkspaceId", workspace._id);
    } else {
      localStorage.removeItem("selectedWorkspaceId");
    }
  };

  const maxWorkspaces = 2;
  const workspaceCount = ownedWorkspaces.length; // Only count owned workspaces for creation limit
  const canCreateWorkspace = workspaceCount < maxWorkspaces;

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      ownedWorkspaces,
      sharedWorkspaces,
      setWorkspaces,
      selectedWorkspace,
      setSelectedWorkspace: setSelectedWorkspaceState,
      isLoading,
      canCreateWorkspace,
      workspaceCount,
      maxWorkspaces,
      currentRole,
      permissions
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
