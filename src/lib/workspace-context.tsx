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
        const response = await apiClient.get<Workspace[]>("/api/workspaces/");
        setWorkspaces(response.data);

        const pathSegments = pathname.split('/');
        const workspaceIdFromUrl = pathSegments.length > 2 ? pathSegments[2] : null;

        if (workspaceIdFromUrl) {
          const found = response.data.find(w => w._id === workspaceIdFromUrl);
          setSelectedWorkspaceState(found || null);
        } else {
          const lastSelectedId = localStorage.getItem("selectedWorkspaceId");
          if (lastSelectedId) {
            const found = response.data.find(w => w._id === lastSelectedId);
            if (found) {
              router.push(`/workspace/${found._id}`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
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
      router.push(`/workspace/${workspace._id}`);
    } else {
      localStorage.removeItem("selectedWorkspaceId");
      router.push('/workspace');
    }
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, setWorkspaces, selectedWorkspace, setSelectedWorkspace, isLoading }}>
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
