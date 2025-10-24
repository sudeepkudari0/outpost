import NextAuth from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import authConfig from './lib/auth/auth.config';

const { auth } = NextAuth(authConfig);

export default auth(async req => {
  const { nextUrl } = req;

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  const isLoggedIn = !!token;

  const isAuthRoute =
    nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/auth') ||
    nextUrl.pathname.startsWith('/set-password');

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isRootRoute = nextUrl.pathname === '/';
  const isPublicRoute =
    isAuthRoute ||
    isApiAuthRoute ||
    isRootRoute ||
    nextUrl.pathname.startsWith('/privacy-policy') ||
    nextUrl.pathname.startsWith('/terms-of-use') ||
    nextUrl.pathname.startsWith('/data-deletion-policy');

  // Root and public informational pages are accessible regardless of auth state

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Allow API auth routes and auth pages
  if (isApiAuthRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Redirect non-logged-in users to login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
