import { NextResponse, type NextRequest } from 'next/server';

import {
  decodeSessionToken,
  getDefaultRouteForRole,
  isAdminRole,
  isClientRole,
  SESSION_COOKIE_NAME,
} from '@/lib/auth/session';

const ADMIN_PATHS = ['/dashboard', '/clients', '/google-ads'];
const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const session = decodeSessionToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (PUBLIC_PATHS.includes(pathname)) {
    if (!session) {
      return NextResponse.next();
    }

    const destination = getDefaultRouteForRole(session.role);
    return destination
      ? NextResponse.redirect(new URL(destination, request.url))
      : forbidden();
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/') {
    const destination = getDefaultRouteForRole(session.role);
    return destination
      ? NextResponse.redirect(new URL(destination, request.url))
      : forbidden();
  }

  if (pathname.startsWith('/client')) {
    return isClientRole(session.role) ? NextResponse.next() : forbidden();
  }

  if (ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return isAdminRole(session.role) ? NextResponse.next() : forbidden();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

function forbidden() {
  return new NextResponse('403 Forbidden', {
    status: 403,
  });
}

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  );
}
