import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware that checks for the next-auth session token cookie
// This avoids importing Prisma (which uses Node.js modules not available in Edge Runtime)
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicPaths = ['/', '/api/auth', '/_next', '/favicon.ico'];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  // Protected routes
  const protectedPaths = ['/dashboard', '/settings'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // API routes that need auth (excluding auth itself)
  const protectedApis = ['/api/projects', '/api/sessions', '/api/github'];
  const isProtectedApi = protectedApis.some((p) => pathname.startsWith(p));

  // Check for session token cookie
  const sessionToken = req.cookies.get('next-auth.session-token')?.value ||
                        req.cookies.get('__Secure-next-auth.session-token')?.value;
  const isLoggedIn = !!sessionToken;

  if (isPublic) return NextResponse.next();
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
  if (isProtectedApi && !isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
