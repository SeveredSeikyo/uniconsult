"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, ShieldCheck, Users, LayoutDashboard, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet'; 
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Header() {
  const { currentUser, role, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDetailsOpenMobile, setIsAccountDetailsOpenMobile] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsAccountDetailsOpenMobile(false);
    router.push('/login');
  };

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
    setIsAccountDetailsOpenMobile(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#2C3136] text-white shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between p-4">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <img src="https://i.ibb.co/bg6QDCWL/plmun-logo-1.png" alt="PLMUN Logo" className="h-8 w-auto mr-2" />
          </Link>
          <div className="h-8 w-24 animate-pulse rounded bg-[#84878B]/70"></div>
        </div>
      </header>
    );
  }

  const navLinkClasses = (path: string, isMobile: boolean = false) => 
    cn(
      "transition-colors",
      isMobile 
        ? `block py-3 px-4 text-lg hover:bg-[#27691F]/90 rounded-md ${pathname === path ? 'bg-[#27691F]/80 font-semibold text-white' : 'text-[#84878B]'}`
        : `hover:text-[#27691F] ${pathname === path ? 'font-semibold text-[#27691F] underline' : 'text-[#84878B]'}`
    );
  
  const AccountInfoPopoverContent = () => {
    if (!currentUser) return null;
    return (
        <Card className="w-80 shadow-lg bg-[#2C3136] text-white">
          <CardHeader>
            <CardTitle className="text-xl text-[#27691F]">Account Information</CardTitle>
            <CardDescription className="text-[#84878B]">Your PLMUN Portal profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#84878B]">
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

  const navLinks = (isMobile: boolean) => (
    <>
      <Link href="/dashboard" className={navLinkClasses('/dashboard', isMobile)}>
        <span className="flex items-center">
          <LayoutDashboard className="mr-2 h-5 w-5" />Dashboard
        </span>
      </Link>
      {role === 'student' && (
        <>
          <Link href="/student/book-consultation" className={navLinkClasses('/student/book-consultation', isMobile)}>
             <span className="flex items-center">
                <LayoutDashboard className="mr-2 h-5 w-5" />Book
             </span>
          </Link>
          <Link href="/student/my-consultations" className={navLinkClasses('/student/my-consultations', isMobile)}>
            <span className="flex items-center">
                <Users className="mr-2 h-5 w-5" />My Bookings
            </span>
          </Link>
        </>
      )}
      {role === 'faculty' && (
        <>
          <Link href="/faculty/manage-status" className={navLinkClasses('/faculty/manage-status', isMobile)}>
             <span className="flex items-center">
                <UserCircle className="mr-2 h-5 w-5" />My Status
            </span>
          </Link>
          <Link href="/faculty/my-consultations" className={navLinkClasses('/faculty/my-consultations', isMobile)}>
             <span className="flex items-center">
                <LayoutDashboard className="mr-2 h-5 w-5" />My Schedule
            </span>
          </Link>
        </>
      )}
      {role === 'admin' && (
        <>
          <Link href="/admin/manage-faculty" className={navLinkClasses('/admin/manage-faculty', isMobile)}>
            <span className="flex items-center">
              <Users className="mr-2 h-5 w-5" />Faculty
            </span>
          </Link>
          <Link href="/admin/reports" className={navLinkClasses('/admin/reports', isMobile)}>
            <span className="flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5" />Reports
            </span>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#2C3136] text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold flex items-center text-white">
          <img src="https://i.ibb.co/bg6QDCWL/plmun-logo-1.png" alt="PLMUN Logo" className="h-8 w-auto mr-2" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4 md:space-x-6">
          {currentUser ? (
            <>
              {navLinks(false)}
              <span className="hidden md:inline text-sm text-[#84878B] opacity-80">|</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center text-sm text-[#84878B] hover:bg-[#27691F]/90">
                    <UserCircle className="mr-1 inline-block h-4 w-4" /> {currentUser.name} ({currentUser.role})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 border-0 shadow-none bg-transparent" sideOffset={10}>
                  <AccountInfoPopoverContent />
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[#84878B] hover:bg-[#27691F]/90 hover:text-white">
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
              <Button variant="ghost" size="icon" className="text-[#84878B] hover:bg-[#27691F]/90">
                <Menu className="h-12 w-12"/> 
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-[#2C3136] text-white p-6">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle> 
              
              <div className="flex justify-between items-center mb-8">
                 <Link href="/" className="text-xl font-bold flex items-center text-white" onClick={() => setIsMobileMenuOpen(false)}>
                    <img src="https://i.ibb.co/bg6QDCWL/plmun-logo-1.png" alt="PLMUN Logo" className="h-7 w-auto mr-2" />
                 </Link>
                <SheetClose className="ring-offset-transparent focus:ring-transparent focus:outline-none text-[#84878B] hover:text-[#27691F]">
                  <X className="h-7 w-7" />
                  <span className="sr-only">Close menu</span>
                </SheetClose>
              </div>
              <nav className="flex flex-col space-y-1">
                {currentUser ? (
                  <>
                    {navLinks(true)}
                    <div className="border-t border-[#84878B]/20 my-3"></div>
                    
                    <Button 
                      variant="ghost" 
                      className="flex items-center text-lg mb-1 px-4 py-3 text-[#84878B] hover:bg-[#27691F]/90 hover:text-white w-full justify-between"
                      onClick={() => setIsAccountDetailsOpenMobile(!isAccountDetailsOpenMobile)}
                    >
                      <span className="flex items-center">
                        <UserCircle className="mr-2 h-5 w-5" /> {currentUser.name} ({currentUser.role})
                      </span>
                      {isAccountDetailsOpenMobile ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>

                    {isAccountDetailsOpenMobile && (
                      <div className="pl-8 pr-4 pb-3 text-sm space-y-1 bg-[#2C3136]/90 rounded-md text-[#84878B]">
                        <p className="pt-2"><strong>Email:</strong> {currentUser.email}</p>
                        {currentUser.student_id && <p><strong>Student ID:</strong> {currentUser.student_id}</p>}
                        {currentUser.faculty_id && <p><strong>Faculty ID:</strong> {currentUser.faculty_id}</p>}
                        {currentUser.department && <p><strong>Department:</strong> {currentUser.department}</p>}
                      </div>
                    )}
                    
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-lg py-3 text-[#84878B] hover:bg-[#27691F]/90 hover:text-white mt-1">
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