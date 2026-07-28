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
        resultados: [],
        mensaje: 'Envia al menos 2 caracteres para buscar',
      });
    }

    let rawProducts: any[] = [];

    if (WOO_CONFIGURED) {
      const { getProducts } = await import('@/lib/woocommerce-server');
      const result = await getProducts({ search: q, perPage: limit });
      rawProducts = result.products || [];
    } else {
      const res = await fetch(`${WMS_URL}/api/v1/products?q=${encodeURIComponent(q)}&limit=${limit}&status=active`);
      if (res.ok) {
        const data = await res.json();
        rawProducts = (data.data || []).filter((p: any) => p.status === 'active');
      }
    }

    const resultados = rawProducts.map((p: any) => {
      const basePrice = Number(p.price) || 0;
      const discount = Number(p.discountPercent) || 0;
      const finalPrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100) * 100) / 100 : basePrice;
      const stock = p.stock || 0;
      const image = p.images?.[0] || null;

      return {
        Producto: p.name,
        Precio: `S/ ${finalPrice.toFixed(2)}`,
        'Stock Disponible': stock > 0 ? `${stock} unidades` : 'Agotado',
        'Link de compra': `${STORE_URL}/producto/${p.slug}`,
        'Link de foto': image || 'Sin imagen',
      };
    });

    return Response.json({ success: true, resultados, total: resultados.length });
  } catch (error) {
    console.error('[Product Search] Error:', error);
    return Response.json({ success: true, resultados: [], total: 0 });
  }
}
