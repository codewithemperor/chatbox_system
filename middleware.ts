import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export function middleware(request: NextRequest) {
  // Only protect admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Skip login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for token in Authorization header
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Add admin info to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-admin-id', payload.id);
  requestHeaders.set('x-admin-email', payload.email);
  requestHeaders.set('x-admin-name', payload.name);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};