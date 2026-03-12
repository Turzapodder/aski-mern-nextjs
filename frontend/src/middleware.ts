import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PAGES = [
  '/account/login',
  '/account/register',
  '/account/reset-password-link',
  '/account/reset-password-confirm',
  '/account/verify-email',
];

const PUBLIC_PREFIXES = ['/public'];
const PROTECTED_PREFIXES = ['/user', '/admin', '/assignment'];

const decodeJwtPayload = (token?: string) => {
  if (!token) return null;
  const segments = token.split('.');
  if (segments.length < 2) return null;

  const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

  try {
    const raw = atob(padded);
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getUserRoles = (request: NextRequest) => {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const payload = decodeJwtPayload(accessToken || refreshToken);
  if (Array.isArray(payload?.roles)) {
    return payload.roles;
  }
  return [];
};

const isPublicPath = (path: string) => {
  if (path === '/') return true;
  if (AUTH_PAGES.includes(path)) return true;
  if (path.startsWith('/account/reset-password-confirm/')) return true;
  return PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const isProtectedPath = (path: string) =>
  PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));

const redirectToLogin = (request: NextRequest, role: 'user' | 'admin', nextPath?: string) => {
  const url = new URL('/account/login', request.url);
  url.searchParams.set('role', role);
  if (nextPath) {
    url.searchParams.set('next', nextPath);
  }
  return NextResponse.redirect(url);
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Derive auth state from httpOnly token cookies (tamper-proof)
  const hasAccessToken = !!request.cookies.get('accessToken')?.value;
  const hasRefreshToken = !!request.cookies.get('refreshToken')?.value;
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  const roles = getUserRoles(request);
  const isAdmin = roles.includes('admin');
  const defaultAuthedPath = isAdmin ? '/admin' : '/user/dashboard';

  if (!isAuthenticated) {
    if (isPublicPath(path)) {
      return NextResponse.next();
    }

    if (path.startsWith('/admin')) {
      return redirectToLogin(request, 'admin', path);
    }

    if (isProtectedPath(path)) {
      return redirectToLogin(request, 'user', path);
    }

    return NextResponse.next();
  }

  if (path.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/user/dashboard', request.url));
  }

  if (path.startsWith('/user') && isAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (path === '/account/login') {
    const requestedRole = request.nextUrl.searchParams.get('role')?.trim().toLowerCase() || null;
    const normalizedRole =
      requestedRole === 'admin'
        ? 'admin'
        : requestedRole === 'tutor'
          ? 'tutor'
          : requestedRole === 'user' || requestedRole === 'student'
            ? 'user'
            : null;
    if (normalizedRole === 'admin' && !isAdmin) {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
    if (normalizedRole && normalizedRole !== 'admin' && isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL(defaultAuthedPath, request.url));
  }

  if (AUTH_PAGES.includes(path) || path === '/') {
    return NextResponse.redirect(new URL(defaultAuthedPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
