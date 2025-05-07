"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, LogOut, UserCircle, ShieldCheck, Users, LayoutDashboard } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const { currentUser, role, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between p-4">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <BookOpenCheck className="mr-2 h-8 w-8" />
            UniConsult
          </Link>
          <div className="h-8 w-24 animate-pulse rounded bg-primary/70"></div>
        </div>
      </header>
    );
  }

  const navLinkClasses = (path: string) => 
    `hover:text-accent-foreground/80 transition-colors ${pathname === path ? 'font-semibold text-accent-foreground underline' : ''}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <BookOpenCheck className="mr-2 h-8 w-8" />
          UniConsult
        </Link>
        <nav className="flex items-center space-x-4 md:space-x-6">
          {currentUser ? (
            <>
              <Link href="/dashboard" className={navLinkClasses('/dashboard')}>
                <LayoutDashboard className="mr-1 inline-block h-4 w-4" />Dashboard
              </Link>
              {role === 'student' && (
                <>
                  <Link href="/student/book-consultation" className={navLinkClasses('/student/book-consultation')}>Book</Link>
                  <Link href="/student/my-consultations" className={navLinkClasses('/student/my-consultations')}>My Bookings</Link>
                </>
              )}
              {role === 'faculty' && (
                <>
                  <Link href="/faculty/manage-status" className={navLinkClasses('/faculty/manage-status')}>My Status</Link>
                  <Link href="/faculty/my-consultations" className={navLinkClasses('/faculty/my-consultations')}>My Schedule</Link>
                </>
              )}
              {role === 'admin' && (
                <>
                  <Link href="/admin/manage-faculty" className={navLinkClasses('/admin/manage-faculty')}>
                    <Users className="mr-1 inline-block h-4 w-4" />Faculty
                  </Link>
                  <Link href="/admin/reports" className={navLinkClasses('/admin/reports')}>
                    <ShieldCheck className="mr-1 inline-block h-4 w-4" />Reports
                  </Link>
                </>
              )}
              <span className="hidden md:inline text-sm opacity-80">|</span>
              <span className="hidden md:inline items-center text-sm">
                <UserCircle className="mr-1 inline-block h-4 w-4" /> {currentUser.name} ({currentUser.role})
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-primary/80">
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClasses('/login')}>Login</Link>
              <Link href="/register" className={navLinkClasses('/register')}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
