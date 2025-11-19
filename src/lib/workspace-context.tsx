"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/utils/api.client';

interface Workspace {
  _id: string;
  name: string;
  userId: string;
  members?: {
    user: string;
    role: "owner" | "admin" | "editor" | "viewer";
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
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [ownedWorkspaces, setOwnedWorkspaces] = useState<Workspace[]>([]);
  const [sharedWorkspaces, setSharedWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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

          if (!isAuthPage && !isWelcomePage && !isWorkspaceSetupPage && !isDashboardPage && !isRootPage && !isReportsPage && !isWorkspaceReportsPage) {
            // Only redirect to welcome if user has NO workspaces (neither owned nor shared)
            if (owned.length === 0 && shared.length === 0) {
              router.push('/welcome');
            } else if (allWorkspaces.length > 0) {
              router.push('/dashboard');
            }
          }
        }
      } catch (error: unknown) {
        // Handle 401 Unauthorized - user needs to log in
        const isAuthError = error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'status' in error.response && 
          error.response.status === 401;
        
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
      setSelectedWorkspace, 
      isLoading,
      canCreateWorkspace,
      workspaceCount,
      maxWorkspaces
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
