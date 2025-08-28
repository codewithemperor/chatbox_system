import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Skip login page and API routes
  if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For client-side admin pages, let the client handle authentication
  // The admin layout component will check localStorage and redirect if needed
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};