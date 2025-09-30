"use client";

import React, { createContext, useContext, useState } from 'react';

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
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login with specific credentials
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check mock credentials
      if (email === 'user123' && password === 'user123') {
        // Mock user data
        setUser({
          id: '1',
          email,
          name: 'John Doe'
        });
      } else {
        throw new Error('Invalid credentials. Use user123/user123 to login.');
      }
    } catch (error) {
      throw error;
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