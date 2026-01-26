import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Array of paths that don't require authentication
const publicPaths = ['/', '/account/login', '/account/register', '/account/reset-password-link', '/account/verify-email'];

// Array of paths that require authentication
const protectedPaths = ['/user', '/assignment', '/admin'];

const decodeJwtPayload = (token?: string) => {
  if (!token) return null;
  const segments = token.split('.');
  if (segments.length < 2) return null;

  const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

  try {
    const buffer = (globalThis as any)?.Buffer;
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : buffer
        ? buffer.from(padded, 'base64').toString('utf-8')
        : '';
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
};

const getUserRoles = (request: NextRequest) => {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const payload = decodeJwtPayload(accessToken || refreshToken);
  return Array.isArray(payload?.roles) ? payload.roles : [];
};

export async function middleware(request: NextRequest) {
  try {
    const isAuth = request.cookies.get('is_auth')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const path = request.nextUrl.pathname;

    // Check if user is authenticated (has both refreshToken and is_auth = true)
    const isAuthenticated = refreshToken && isAuth === 'true';
    const roles = getUserRoles(request);
    const isAdmin = roles.includes('admin');
    const defaultAuthedPath = isAdmin ? '/admin' : '/user/dashboard';

    console.log('Middleware check:', { path, isAuthenticated, hasRefreshToken: !!refreshToken, isAuth });

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && publicPaths.includes(path)) {
      return NextResponse.redirect(new URL(defaultAuthedPath, request.url));
    }

    if (isAuthenticated && isAdmin && path === '/user/dashboard') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // If user is not authenticated
    if (!isAuthenticated) {
      // Allow access to public paths
      if (publicPaths.includes(path)) {
        return NextResponse.next();
      }

      // Check if trying to access protected routes
      const isProtectedRoute = protectedPaths.some(protectedPath => 
        path.startsWith(protectedPath)
      );

      if (isProtectedRoute) {
        // Redirect to login if trying to access protected routes
        return NextResponse.redirect(new URL('/', request.url));
      }

      // For any other route (like root '/'), redirect to home page
      if (path === '/') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // If user is authenticated, allow access to all routes
    if (isAuthenticated) {
      // If accessing root, redirect to dashboard
      if (path === '/') {
        return NextResponse.redirect(new URL(defaultAuthedPath, request.url));
      }
      
      return NextResponse.next();
    }

    // Default: allow the request to continue
    return NextResponse.next();

  } catch (error) {
    console.error('Error occurred while checking authentication:', error);
    
    // On error, redirect to login page for safety
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ]
}


//
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// // Array of paths that don't require authentication
// const authPaths = ['/account/login', '/account/register'];
// const publicPaths = ['/', '/account/reset-password-link', '/account/verify-email'];

// export async function middleware(request: NextRequest) {
//   try {
//     const isAuth = request.cookies.get('is_auth')?.value;
//     const refreshToken = request.cookies.get('refreshToken')?.value;
//     const path = request.nextUrl.pathname;

//     // Check if user is authenticated
//     const isAuthenticated = isAuth === 'true' && refreshToken;

//     // If user is authenticated and trying to access auth pages, redirect to profile
//     if (isAuthenticated && authPaths.includes(path)) {
//       return NextResponse.redirect(new URL('/user/dashboard', request.url));
//     }

//     // If user is not authenticated
//     if (!isAuthenticated) {
//       // Allow access to public paths and auth paths
//       if (publicPaths.includes(path) || authPaths.includes(path)) {
//         return NextResponse.next();
//       }
      
//       // If trying to access protected routes, redirect to home page
//       if (path.startsWith('/user/') || path.startsWith('/assignment/')) {
//         return NextResponse.redirect(new URL('/', request.url));
//       }
//     }

//     // If authenticated and accessing protected routes, allow
//     if (isAuthenticated && (path.startsWith('/user/') || path.startsWith('/assignment/'))) {
//       return NextResponse.next();
//     }

//     return NextResponse.next();
//   } catch (error) {
//     console.error('Error occurred in middleware:', error);
    
//     // In case of error, redirect to home page for safety
//     return NextResponse.redirect(new URL('/', request.url));
//   }
// }

// export const config = {
//   matcher: [
//     // Match all routes except static files and API routes
//     '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//     // Specifically match protected routes
//     '/user/:path*',
//     '/assignment/:path*',
//     // Auth routes
//     '/account/:path*'
//   ]
// }
