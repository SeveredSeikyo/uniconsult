"use client";

import type { User, UserRole } from '@/lib/definitions';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setRole: (role: UserRole) => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_OPTIONS = { expires: 7, path: '/' }; // Store cookies for 7 days

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setLocalRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from cookies
    const storedUserCookie = Cookies.get('currentUser');
    if (storedUserCookie) {
      try {
        const parsedUser = JSON.parse(storedUserCookie) as User;
        setCurrentUser(parsedUser);
        setLocalRole(parsedUser.role);
      } catch (error) {
        console.error("Failed to parse user from cookie:", error);
        Cookies.remove('currentUser'); // Clear corrupted cookie
        Cookies.remove('userRole');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    setLocalRole(user.role);
    Cookies.set('currentUser', JSON.stringify(user), COOKIE_OPTIONS);
    Cookies.set('userRole', user.role, COOKIE_OPTIONS);
  };

  const logout = () => {
    setCurrentUser(null);
    setLocalRole(null);
    Cookies.remove('currentUser');
    Cookies.remove('userRole');
    // Also clear session storage if it was used as a fallback or by older versions
    sessionStorage.removeItem('currentUser'); 
  };
  
  const setRole = (newRole: UserRole) => {
    setLocalRole(newRole);
    let userToStore: User | null = null;

    if (currentUser) {
        const updatedUser = {...currentUser, role: newRole };
        setCurrentUser(updatedUser);
        userToStore = updatedUser;
    } else {
        // If no current user, create a mock one for role simulation
        // This case might be less relevant if middleware always ensures a user for protected contexts
        const mockUser: User = {id: 0, name: `${newRole} User`, email: `${newRole}@example.com`, role: newRole};
        setCurrentUser(mockUser);
        userToStore = mockUser;
    }

    if (userToStore) {
        Cookies.set('currentUser', JSON.stringify(userToStore), COOKIE_OPTIONS);
        Cookies.set('userRole', newRole, COOKIE_OPTIONS);
    } else {
        // This case should ideally not be hit if a user is being assigned a role
        Cookies.remove('currentUser');
        Cookies.remove('userRole');
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
