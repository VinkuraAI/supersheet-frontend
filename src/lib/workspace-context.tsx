"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/utils/api.client';

interface Workspace {
  _id: string;
  name: string;
  userId: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
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

        const response = await apiClient.get<Workspace[]>("/workspaces");
        const fetchedWorkspaces = response.data;
        setWorkspaces(fetchedWorkspaces);

        const pathSegments = pathname.split('/');
        const workspaceIdFromUrl = pathSegments.length > 2 && pathSegments[1] === 'workspace' ? pathSegments[2] : null;

        if (workspaceIdFromUrl) {
          const found = fetchedWorkspaces.find(w => w._id === workspaceIdFromUrl);
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
            if (fetchedWorkspaces.length > 0) {
              router.push('/dashboard');
            } else {
              router.push('/welcome');
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
  const workspaceCount = workspaces.length;
  const canCreateWorkspace = workspaceCount < maxWorkspaces;

  return (
    <WorkspaceContext.Provider value={{ 
      workspaces, 
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
