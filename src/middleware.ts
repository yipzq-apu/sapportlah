import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function verifyToken(token: string): { role: string } {
  // Add your token verification logic here
  // This is a placeholder implementation
  throw new Error('Token verification not implemented');
}

export function middleware(request: NextRequest) {
  const adminRoutes = ['/admin'];
  const creatorRoutes = ['/dashboard'];
  const protectedRoutes = [...adminRoutes, ...creatorRoutes, '/profile'];

  const token = request.cookies.get('token')?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If accessing a protected route
  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decoded = verifyToken(token);

      // Check admin routes
      if (
        adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
      ) {
        if (decoded.role !== 'admin') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      // Check creator routes
      if (
        creatorRoutes.some((route) =>
          request.nextUrl.pathname.startsWith(route)
        )
      ) {
        if (decoded.role !== 'creator' && decoded.role !== 'admin') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      // If token is valid, allow access
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If not a protected route, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match protected routes
    '/dashboard/:path*',
    // Exclude API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
