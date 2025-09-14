import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  // Add response time header for monitoring
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`);

  // Log slow requests in development
  if (process.env.NODE_ENV === 'development') {
    const duration = Date.now() - start;
    if (duration > 1000) {
      // Log requests taking longer than 1 second
      console.warn(
        `Slow request detected: ${request.method} ${request.url} took ${duration}ms`
      );
    }
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
