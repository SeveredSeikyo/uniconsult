
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, LogOut, UserCircle, ShieldCheck, Users, LayoutDashboard, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Header() {
  const { currentUser, role, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  const navLinkClasses = (path: string, isMobile: boolean = false) => 
    cn(
      "transition-colors",
      isMobile 
        ? `block py-3 px-4 text-lg hover:bg-primary/90 rounded-md ${pathname === path ? 'bg-primary/80 font-semibold' : ''}`
        : `hover:text-accent-foreground/80 ${pathname === path ? 'font-semibold text-accent-foreground underline' : ''}`
    );
  
  const AccountInfoPopoverContent = () => {
    if (!currentUser) return null;
    return (
        <Card className="w-80 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Account Information</CardTitle>
            <CardDescription>Your UniConsult profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground/90">
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> <span className="capitalize">{currentUser.role}</span></p>
            {currentUser.student_id && <p><strong>Student ID:</strong> {currentUser.student_id}</p>}
            {currentUser.faculty_id && <p><strong>Faculty ID:</strong> {currentUser.faculty_id}</p>}
            {currentUser.department && <p><strong>Department:</strong> {currentUser.department}</p>}
          </CardContent>
        </Card>
    );
  };


  const navLinks = (
    <>
      <Link href="/dashboard" className={navLinkClasses('/dashboard', isMobileMenuOpen)}>
        <span className="flex items-center">
          <LayoutDashboard className="mr-2 h-5 w-5" />Dashboard
        </span>
      </Link>
      {role === 'student' && (
        <>
          <Link href="/student/book-consultation" className={navLinkClasses('/student/book-consultation', isMobileMenuOpen)}>
             <span className="flex items-center">
                <BookOpenCheck className="mr-2 h-5 w-5" />Book
             </span>
          </Link>
          <Link href="/student/my-consultations" className={navLinkClasses('/student/my-consultations', isMobileMenuOpen)}>
            <span className="flex items-center">
                <Users className="mr-2 h-5 w-5" />My Bookings
            </span>
          </Link>
        </>
      )}
      {role === 'faculty' && (
        <>
          <Link href="/faculty/manage-status" className={navLinkClasses('/faculty/manage-status', isMobileMenuOpen)}>
             <span className="flex items-center">
                <UserCircle className="mr-2 h-5 w-5" />My Status
            </span>
          </Link>
          <Link href="/faculty/my-consultations" className={navLinkClasses('/faculty/my-consultations', isMobileMenuOpen)}>
             <span className="flex items-center">
                <LayoutDashboard className="mr-2 h-5 w-5" />My Schedule
            </span>
          </Link>
        </>
      )}
      {role === 'admin' && (
        <>
          <Link href="/admin/manage-faculty" className={navLinkClasses('/admin/manage-faculty', isMobileMenuOpen)}>
            <span className="flex items-center">
              <Users className="mr-2 h-5 w-5" />Faculty
            </span>
          </Link>
          <Link href="/admin/reports" className={navLinkClasses('/admin/reports', isMobileMenuOpen)}>
            <span className="flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5" />Reports
            </span>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <BookOpenCheck className="mr-2 h-8 w-8" />
          UniConsult
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4 md:space-x-6">
          {currentUser ? (
            <>
              {navLinks}
              <span className="hidden md:inline text-sm opacity-80">|</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center text-sm hover:bg-primary/80">
                    <UserCircle className="mr-1 inline-block h-4 w-4" /> {currentUser.name} ({currentUser.role})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 border-0 shadow-none bg-transparent" sideOffset={10}>
                  <AccountInfoPopoverContent />
                </PopoverContent>
              </Popover>
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

        {/* Mobile Navigation Trigger */}
        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary/80">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-primary text-primary-foreground p-6">
              <div className="flex justify-between items-center mb-8">
                 <Link href="/" className="text-xl font-bold flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                    <BookOpenCheck className="mr-2 h-7 w-7" />
                    UniConsult
                 </Link>
                <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-primary/80">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col space-y-3">
                {currentUser ? (
                  <>
                    {navLinks}
                    <div className="border-t border-primary-foreground/20 my-4"></div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="flex items-center text-lg mb-3 px-4 py-3 hover:bg-primary/90 w-full justify-start">
                          <UserCircle className="mr-2 h-5 w-5" /> {currentUser.name} ({currentUser.role})
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 border-0 shadow-none bg-transparent" sideOffset={10} side="bottom" align="start">
                        <AccountInfoPopoverContent />
                      </PopoverContent>
                    </Popover>
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-lg py-3 hover:bg-primary/90">
                      <LogOut className="mr-2 h-5 w-5" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={navLinkClasses('/login', true)}>Login</Link>
                    <Link href="/register" className={navLinkClasses('/register', true)}>Register</Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
