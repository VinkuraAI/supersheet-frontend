"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<Workspace[]>("/api/workspaces/");
        setWorkspaces(response.data);
        const lastSelectedId = localStorage.getItem("selectedWorkspaceId");
        if (lastSelectedId) {
          const found = response.data.find(w => w._id === lastSelectedId);
          setSelectedWorkspaceState(found || (response.data.length > 0 ? response.data[0] : null));
        } else if (response.data.length > 0) {
          setSelectedWorkspaceState(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const setSelectedWorkspace = (workspace: Workspace | null) => {
    setSelectedWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem("selectedWorkspaceId", workspace._id);
    } else {
      localStorage.removeItem("selectedWorkspaceId");
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
