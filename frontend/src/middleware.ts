import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for route protection
 * Validates session/JWT before allowing access to protected routes
 */
export function middleware(request: NextRequest) {
  // TODO: Implement session validation
  // TODO: Check for JWT in HttpOnly cookies
  // TODO: Redirect to login if not authenticated

  const protectedPaths = ['/dashboard', '/checkout', '/cart'];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtectedRoute) {
    // TODO: Validate authentication token
    // const token = request.cookies.get('token');
    // if (!token) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/checkout/:path*', '/cart/:path*'],
};
