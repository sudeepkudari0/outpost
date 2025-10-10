import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from './lib/auth/auth.config';

const { auth } = NextAuth(authConfig);

export default auth(async req => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthRoute =
    nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/auth') ||
    nextUrl.pathname.startsWith('/set-password');

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isRootRoute = nextUrl.pathname === '/';
  const isPublicRoute = isAuthRoute || isApiAuthRoute;

  // Handle root route
  if (isRootRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/assistant', nextUrl));
    } else {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
  }

  // Allow API auth routes and auth pages
  if (isApiAuthRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/assistant', nextUrl));
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
