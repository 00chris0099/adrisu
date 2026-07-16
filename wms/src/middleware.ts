import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://adriskids.com',
  'https://tiendavirtual-tiendaadrisuk.jpq6em.easypanel.host',
  'http://localhost:3001',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Only truly public routes (read-only, no sensitive data)
  const publicRoutes = ['/login', '/api/auth', '/api/v1/health'];
  const readOnlyPublicRoutes = ['/api/v1/products', '/api/v1/categories', '/api/v1/landings'];

  const isFullyPublic = publicRoutes.some((r) => pathname.startsWith(r));
  const isReadOnlyPublic = readOnlyPublicRoutes.some((r) => pathname.startsWith(r));

  if (isFullyPublic) {
    if (session && pathname === '/login') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Read-only routes: allow GET without auth, but require auth for mutations
  if (isReadOnlyPublic && req.method === 'GET') {
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
