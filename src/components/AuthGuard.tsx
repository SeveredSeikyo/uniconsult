"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { UserRole } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[]; // If not provided, just checks for authentication
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { currentUser, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    if (!currentUser) {
      // Redirect to login if not authenticated
      if (pathname !== '/login') { // Avoid redirect loop
        router.push(`/login?redirect=${pathname}`);
      }
      return;
    }

    // Check role if allowedRoles are specified
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      // Redirect to an unauthorized page or dashboard if role not allowed
      router.push('/dashboard?error=unauthorized');
    }
  }, [currentUser, role, isLoading, router, allowedRoles, pathname]);

  if (isLoading || (!currentUser && pathname !== '/login')) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (allowedRoles && currentUser && role && !allowedRoles.includes(role)) {
     // Still show loader while redirecting to avoid flashing content
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Redirecting...</p>
      </div>
    );
  }
  
  return <>{children}</>;
}
