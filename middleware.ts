import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Retrieve the session token from cookies
  const sessionToken = request.cookies.get('medcore_session')?.value;

  // Block database mutations for the demo admin account
  if (sessionToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    try {
      const parts = sessionToken.split('.');
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        if (payload.email === 'demoadmin@medcore.com') {
          return new NextResponse(
            JSON.stringify({ error: 'Write operations are disabled for the demo admin account.' }),
            { status: 403, headers: { 'content-type': 'application/json' } }
          );
        }
      }
    } catch (e) {
      // Ignore token decoding error and let authentication endpoint handle it
    }
  }

  // Paths that do NOT require authentication
  const isPublicAsset = 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.') || 
    pathname === '/favicon.ico';

  // Explicit check for public pages
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';

  // 1. If trying to access /login and already logged in, redirect to dashboard
  if (isLoginPage && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If trying to access protected paths and NOT logged in, redirect to login
  const isPublicRoute = isLoginPage || isLandingPage || isPublicAsset;
  if (!isPublicRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    // Store the destination page in query params to redirect back after login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Limit the middleware to match administrative app pages
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
