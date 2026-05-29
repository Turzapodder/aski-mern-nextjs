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

// Helper to decode Base64Url
const base64UrlDecode = (str: string) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
};

// Helper to convert base64url to Uint8Array
const base64UrlToUint8Array = (str: string) => {
  const decoded = base64UrlDecode(str);
  const arr = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    arr[i] = decoded.charCodeAt(i);
  }
  return arr;
};

// Verify HMAC-SHA256 signature using native Web Crypto API
const verifyHs256Signature = async (token: string, secretStr: string): Promise<boolean> => {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [headerStr, payloadStr, signatureStr] = parts;
  const data = new TextEncoder().encode(`${headerStr}.${payloadStr}`);

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secretStr),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64UrlToUint8Array(signatureStr);

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      data
    );
  } catch (err) {
    console.error('JWT Web Crypto verification failed:', err);
    return false;
  }
};

// Cryptographically verify and decode JWT tokens
const verifyAndDecodeJwt = async (token?: string, isRefreshToken = false) => {
  if (!token) return null;
  const secretKey = isRefreshToken
    ? process.env.JWT_REFRESH_TOKEN_SECRET_KEY
    : process.env.JWT_ACCESS_TOKEN_SECRET_KEY;

  if (!secretKey) {
    console.error(`JWT secret key for ${isRefreshToken ? 'refresh' : 'access'} token is missing in environment variables`);
    return null;
  }

  // Cryptographically check the signature
  const isValid = await verifyHs256Signature(token, secretKey);
  if (!isValid) {
    console.warn(`JWT signature validation failed for ${isRefreshToken ? 'refresh' : 'access'} token`);
    return null;
  }

  try {
    const payloadSegment = token.split('.')[1];
    const payloadJson = base64UrlDecode(payloadSegment);
    const payload = JSON.parse(payloadJson);

    // Verify expiration time
    if (typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        console.warn(`${isRefreshToken ? 'Refresh' : 'Access'} token has expired`);
        return null;
      }
    }

    return payload;
  } catch {
    return null;
  }
};

const getUserRoles = async (request: NextRequest) => {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // 1. Try to verify access token first
  let payload = await verifyAndDecodeJwt(accessToken, false);

  // 2. If access token is invalid/expired, try verifying the refresh token as fallback
  if (!payload && refreshToken) {
    payload = await verifyAndDecodeJwt(refreshToken, true);
  }

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

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Derive auth state from httpOnly token cookies (tamper-proof)
  const hasAccessToken = !!request.cookies.get('accessToken')?.value;
  const hasRefreshToken = !!request.cookies.get('refreshToken')?.value;
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  const roles = await getUserRoles(request);
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

  // Enforce Tutor-Only Routes (e.g. tutor profile and calendar tools)
  const isTutor = roles.includes('tutor');
  const TUTOR_ONLY_PATHS = ['/user/tutor-profile'];
  if (TUTOR_ONLY_PATHS.some((tutorPath) => path.startsWith(tutorPath)) && !isTutor) {
    console.warn(`[Middleware] Non-tutor user blocked from tutor-only path: ${path}`);
    return NextResponse.redirect(new URL('/user/dashboard', request.url));
  }


  if (path === '/account/login') {
    // Let OAuth callback through so the client-side syncOAuthSession logic can run.
    const oauthParam = request.nextUrl.searchParams.get('oauth');
    if (oauthParam === 'success') {
      return NextResponse.next();
    }

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
