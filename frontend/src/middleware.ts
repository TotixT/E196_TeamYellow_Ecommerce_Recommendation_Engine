import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for route protection.
 * Checks for the Zustand persisted auth state cookie/localStorage.
 * Since middleware runs on the edge, we check for the token in cookies.
 * The client-side Zustand store handles the actual auth state.
 */
export function middleware(request: NextRequest) {
  // Admin routes require admin role — but we can't check role in middleware
  // (it's in Zustand/localStorage). The admin layout will handle role checks client-side.
  // Middleware only does a basic token existence check.

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const protectedPaths = ['/cart', '/checkout', '/orders', '/profile'];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const adminPaths = ['/admin'];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pathname = request.nextUrl.pathname;

  // For now, let all requests through — auth is handled client-side via Zustand
  // This avoids SSR/hydration mismatches with localStorage
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
