import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const currentUserCookie = request.cookies.get('currentUser');
  const { pathname } = request.nextUrl;

  const isAuthenticated = !!currentUserCookie;

  // Define protected routes that require authentication
  const protectedRoutePatterns = [
    '/dashboard',
    '/student', // Matches /student/*
    '/faculty', // Matches /faculty/*
    '/admin',   // Matches /admin/*
  ];

  // Define public routes that authenticated users should be redirected from
  const publicAuthPages = ['/login', '/register'];

  const isAccessingProtectedRoute = protectedRoutePatterns.some(pattern => pathname.startsWith(pattern));
  const isAccessingPublicAuthPage = publicAuthPages.includes(pathname);
  const isHomePage = pathname === '/';

  // If trying to access a protected route and not authenticated, redirect to login
  if (isAccessingProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Keep original intended path
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login/register page, or homepage, redirect to dashboard
  if (isAuthenticated && (isAccessingPublicAuthPage || isHomePage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow the request to proceed if none of the above conditions are met
  return NextResponse.next();
}

// Configure the matcher to apply middleware to relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any files with an extension (e.g., .png, .jpg, .css)
     * - assets (if you have a public/assets folder for static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets/|.*\\..*).*)',
  ],
};
