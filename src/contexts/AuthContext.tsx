"use client";

import type { User, UserRole } from '@/lib/definitions';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setRole: (role: UserRole) => void; // For initial role simulation without full login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setLocalRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      setCurrentUser(parsedUser);
      setLocalRole(parsedUser.role);
    }
    setIsLoading(false);
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    setLocalRole(user.role);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    setLocalRole(null);
    sessionStorage.removeItem('currentUser');
  };
  
  // Used for quick role switching in demo if full login isn't implemented for all paths yet
  const setRole = (newRole: UserRole) => {
    setLocalRole(newRole);
    if (currentUser) {
        const updatedUser = {...currentUser, role: newRole };
        setCurrentUser(updatedUser);
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } else {
        // If no current user, create a mock one for role simulation
        const mockUser: User = {id: 0, name: `${newRole} User`, email: `${newRole}@example.com`, role: newRole};
        setCurrentUser(mockUser);
        sessionStorage.setItem('currentUser', JSON.stringify(mockUser));
    }

  }

  return (
    <AuthContext.Provider value={{ currentUser, role, isLoading, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
