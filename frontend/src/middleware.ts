import { NextResponse } from 'next/server'

// Array of paths to check against
const authPaths = ['/account/login', '/account/register'];

export async function middleware(request: any) {
  try {
    const isAuthenticated = request.cookies.get('is_auth')?.value
    const path = request.nextUrl.pathname;

    if (isAuthenticated==='true') {
      if (authPaths.includes(path)) {
        return NextResponse.redirect(new URL('/user/profile', request.url));
      }
    }

    if (isAuthenticated==='false' && !authPaths.includes(path)) {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
    return NextResponse.next()
  } catch (error) {
    console.error('Error occurred while checking authentication:', error);
    // Handle the error, maybe return a response with 500 status code
    return NextResponse.error();
  }
}

export const config = {
  matcher: ['/user/:path*', '/account/login', '/account/register']
}