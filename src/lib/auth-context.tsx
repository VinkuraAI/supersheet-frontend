"use client";

import React, { createContext,useEffect, useContext, useState } from 'react';
import apiClient from '@/utils/api.client';
import { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, mobile?: string) => Promise<{ message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/users/login", { email, password });
      if (response.data && response.data.user) {
        const backendUser = response.data.user;
        const appUser: User = {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.name,
        };
        localStorage.setItem("user", JSON.stringify(appUser));
        setUser(appUser);
      } else {
        throw new Error("Login failed: Invalid user data received.");
      }
    } catch (err) {
        // Re-throw the error to be caught in the form
        if (err instanceof AxiosError && err.response) {
            // Check for both 'error' and 'message' fields in response
            const errorMessage = err.response.data.error || err.response.data.message || "An unknown error occurred";
            throw new Error(errorMessage);
        }
        throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, mobile?: string) => {
    setIsLoading(true);
    try {
      // Mock signup - replace with real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        message: "Account created successfully! Please check your email for verification."
      };
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}