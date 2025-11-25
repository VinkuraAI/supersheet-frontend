"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Role, canManageWorkspace, canDeleteWorkspace, canManageMembers, canEditContent } from '@/utils/permissions';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { Workspace } from '@/features/workspace/services/workspace-service';
import { useUser } from '@/lib/user-context';

interface WorkspaceContextType {
  workspaces: Workspace[];
  ownedWorkspaces: Workspace[];
  sharedWorkspaces: Workspace[];
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>; // Kept for compatibility, but effectively no-op
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
  refreshLocalWorkspaces: () => void; // Deprecated, kept for compatibility
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isUserLoading } = useUser();
  const { data, isLoading: isWorkspaceLoading } = useWorkspaces({ enabled: !!user });
  const [selectedWorkspace, setSelectedWorkspaceState] = useState<Workspace | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const ownedWorkspaces = useMemo(() => data?.ownedWorkspaces || [], [data]);
  const sharedWorkspaces = useMemo(() => data?.sharedWorkspaces || [], [data]);
  const workspaces = useMemo(() => [...ownedWorkspaces, ...sharedWorkspaces], [ownedWorkspaces, sharedWorkspaces]);

  // Role calculation effect
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

  // URL Sync and Redirect Effect
  useEffect(() => {
    if (isWorkspaceLoading || isUserLoading) return;

    const pathSegments = pathname.split('/');
    const workspaceIdFromUrl = pathSegments.length > 2 && pathSegments[1] === 'workspace' ? pathSegments[2] : null;

    if (workspaceIdFromUrl) {
      const found = workspaces.find(w => w._id === workspaceIdFromUrl);
      if (found && found._id !== selectedWorkspace?._id) {
        setSelectedWorkspaceState(found);
      }
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

      const isPMSetupPage = pathname === '/pm/setup';

      if (!isAuthPage && !isWelcomePage && !isWorkspaceSetupPage && !isPMSetupPage && !isDashboardPage && !isRootPage && !isReportsPage && !isWorkspaceReportsPage && !isAcceptInvitationPage && !isCandidateFormPage) {
        // Only redirect to welcome if user has NO workspaces (neither owned nor shared)
        if (workspaces.length === 0) {
          // Avoid infinite redirect if already on welcome
          if (pathname !== '/welcome') {
            router.push('/welcome');
          }
        } else if (workspaces.length > 0) {
          // If on root, go to dashboard
          if (pathname === '/') {
            router.push('/dashboard');
          }
        }
      }
    }
  }, [pathname, workspaces, isWorkspaceLoading, isUserLoading, router, selectedWorkspace]);

  const setSelectedWorkspace = (workspace: Workspace | null) => {
    setSelectedWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem("selectedWorkspaceId", workspace._id);
    } else {
      localStorage.removeItem("selectedWorkspaceId");
    }
  };

  const maxWorkspaces = 2;
  const workspaceCount = ownedWorkspaces.length;
  const canCreateWorkspace = workspaceCount < maxWorkspaces;

  // No-op setter for compatibility
  const setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>> = () => {
    console.warn("setWorkspaces is deprecated in favor of React Query");
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      ownedWorkspaces,
      sharedWorkspaces,
      setWorkspaces,
      selectedWorkspace,
      setSelectedWorkspace,
      isLoading: isWorkspaceLoading || isUserLoading,
      canCreateWorkspace,
      workspaceCount,
      maxWorkspaces,
      currentRole,
      permissions,
      refreshLocalWorkspaces: () => {
        // No-op as we don't use local workspaces anymore
        console.warn("refreshLocalWorkspaces is deprecated");
      }
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
