import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Only handle subdomain 'auth.'
  if (host.startsWith('auth.')) {
    // Allow only /login and /register and static assets
    if (
      url.pathname === '/login' ||
      url.pathname === '/register' ||
      url.pathname.startsWith('/_next') ||
      url.pathname === '/favicon.ico'
    ) {
      return NextResponse.next();
    }
    // Redirect any other path to /login
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // For all other domains/subdomains, allow normal routing
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
