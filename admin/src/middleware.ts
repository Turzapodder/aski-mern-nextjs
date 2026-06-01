import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

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

  const isValid = await verifyHs256Signature(token, secretKey);
  if (!isValid) {
    console.warn(`JWT signature validation failed for ${isRefreshToken ? 'refresh' : 'access'} token`);
    return null;
  }

  try {
    const payloadSegment = token.split('.')[1];
    const payloadJson = base64UrlDecode(payloadSegment);
    const payload = JSON.parse(payloadJson);

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

  let payload = await verifyAndDecodeJwt(accessToken, false);

  if (!payload && refreshToken) {
    payload = await verifyAndDecodeJwt(refreshToken, true);
  }

  if (Array.isArray(payload?.roles)) {
    return payload.roles;
  }
  return [];
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const hasAccessToken = !!request.cookies.get('accessToken')?.value;
  const hasRefreshToken = !!request.cookies.get('refreshToken')?.value;
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  // Public paths (login) — allow if not authenticated, redirect to dashboard if authenticated
  if (PUBLIC_PATHS.includes(path)) {
    if (isAuthenticated) {
      const roles = await getUserRoles(request);
      const isAdmin = roles.includes('admin');
      if (isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // All other paths require admin authentication
  if (!isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Verify admin role
  const roles = await getUserRoles(request);
  const isAdmin = roles.includes('admin');

  if (!isAdmin) {
    // Clear cookies and redirect to login — non-admin users can't access this app
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
