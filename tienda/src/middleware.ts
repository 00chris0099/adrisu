import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://adriskids.com',
  'https://tiendavirtual-tiendaadrisuk.jpq6em.easypanel.host',
  'http://localhost:3000',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public page routes
  const publicPageRoutes = [
    '/', '/tienda', '/producto', '/carrito', '/checkout', '/pedido', '/pago',
    '/login', '/registro', '/faq', '/blog',
  ];

  // Public API routes (read-only safe)
  const publicApiRoutes = [
    '/api/v1/products', '/api/v1/categories', '/api/v1/offers',
    '/api/v1/landings', '/api/v1/suggested-products', '/api/auth',
  ];

  // Mutations that need auth
  const protectedApiRoutes = [
    '/api/v1/orders', '/api/v1/payments', '/api/v1/wishlists',
    '/api/v1/newsletter', '/api/v1/auth/register',
  ];

  const isPublicPage = publicPageRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'));
  const isPublicApi = publicApiRoutes.some((r) => pathname.startsWith(r));
  const isProtectedApi = protectedApiRoutes.some((r) => pathname.startsWith(r));

  // Public pages - always accessible
  if (isPublicPage) {
    return NextResponse.next();
  }

  // Public API - allow GET without auth
  if (isPublicApi && req.method === 'GET') {
    return NextResponse.next();
  }

  // Protected API - POST/PUT/DELETE need auth
  if (isPublicApi && req.method !== 'GET' && !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Other protected routes
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
