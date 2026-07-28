import { NextRequest } from 'next/server';

const WMS_URL = process.env.WMS_INTERNAL_URL || process.env.NEXT_PUBLIC_WMS_URL || 'https://tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host';
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://adrisukids.com';
const WOO_CONFIGURED = !!(process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET && process.env.NEXT_PUBLIC_WORDPRESS_URL);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || searchParams.get('search') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20);

    if (!q || q.trim().length < 2) {
      return Response.json({
        success: true,
        data: [],
        message: 'Envia al menos 2 caracteres para buscar',
      });
    }

    // WooCommerce path
    if (WOO_CONFIGURED) {
      const { getProducts } = await import('@/lib/woocommerce-server');
      const result = await getProducts({ search: q, perPage: limit });
      const wooProducts = result.products || [];
      const results = wooProducts.map((p: any) => ({
        name: p.name,
        price: p.price || 0,
        originalPrice: p.compareAtPrice || null,
        discount: p.discountPercent || 0,
        image: p.images?.[0] || null,
        link: `${STORE_URL}/producto/${p.slug}`,
        slug: p.slug,
        stock: p.stock || 0,
      }));
      return Response.json({ success: true, data: results, total: results.length });
    }

    // WMS fallback
    const res = await fetch(`${WMS_URL}/api/v1/products?q=${encodeURIComponent(q)}&limit=${limit}&status=active`);
    if (!res.ok) {
      return Response.json({ success: true, data: [], total: 0 });
    }

    const data = await res.json();
    const products = data.data || [];

    const results = products
      .filter((p: any) => p.status === 'active')
      .map((p: any) => {
        const basePrice = Number(p.price) || 0;
        const discount = p.discountPercent ? Number(p.discountPercent) : 0;
        const finalPrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100) * 100) / 100 : basePrice;

        return {
          name: p.name,
          price: finalPrice,
          originalPrice: discount > 0 ? basePrice : null,
          discount: discount || null,
          image: p.images?.[0] || null,
          link: `${STORE_URL}/producto/${p.slug}`,
          slug: p.slug,
          stock: p.stock || 0,
        };
      });

    return Response.json({ success: true, data: results, total: results.length });
  } catch (error) {
    console.error('[Product Search] Error:', error);
    return Response.json({ success: true, data: [], total: 0 });
  }
}
