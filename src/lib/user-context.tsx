"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/utils/api.client';

interface User {
  fullName: string;
  email: string;
  avatar: string | null;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refetch: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      // Check if user is authenticated first
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        // No user logged in, don't make API calls
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get('/users/me');
      setUser(response.data);
    } catch (error: any) {
      // Suppress console error for expected auth failures
      // console.error('Failed to fetch user data', error);
      
      // Handle 401/403/404 - clear stored user data and redirect
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
        localStorage.removeItem("user");
        setUser(null);
        // Redirect to auth if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
           window.location.href = '/auth';
        }
      } else {
        // For other errors (500, network), try to use stored user data as fallback
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser({
              fullName: parsedUser.name || parsedUser.fullName || 'User',
              email: parsedUser.email || '',
              avatar: null
            });
          } catch (parseError) {
            // console.error('Failed to parse stored user data', parseError);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
