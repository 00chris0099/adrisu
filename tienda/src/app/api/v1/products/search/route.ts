import { NextRequest } from 'next/server';

const WMS_URL = process.env.WMS_INTERNAL_URL || process.env.NEXT_PUBLIC_WMS_URL || 'https://tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host';
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://adrisukids.com';
const WOO_CONFIGURED = !!(process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET && process.env.NEXT_PUBLIC_WORDPRESS_URL);

function formatProduct(p: any) {
  const basePrice = Number(p.price) || 0;
  const discount = Number(p.discountPercent) || 0;
  const finalPrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100) * 100) / 100 : basePrice;
  const stock = p.stock || 0;
  const image = p.images?.[0] || null;

  return {
    Producto: p.name,
    Descripcion: p.shortDescription || p.description || '',
    Categoria: p.category?.name || p.categoryName || '',
    Precio: `S/ ${finalPrice.toFixed(2)}`,
    'Stock Disponible': stock > 0 ? `${stock} unidades` : 'Agotado',
    'Link de compra': `${STORE_URL}/producto/${p.slug}`,
    'Link de foto': image || 'Sin imagen',
  };
}

async function fetchFromWMS(params: string): Promise<any[]> {
  let all: any[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore && all.length < 200) {
    const res = await fetch(`${WMS_URL}/api/v1/products?${params}&page=${page}`);
    if (!res.ok) break;
    const data = await res.json();
    const active = (data.data || []).filter((p: any) => p.status === 'active');
    all.push(...active);
    hasMore = data.pagination?.hasNext || false;
    page++;
  }
  return all;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    if (q.trim().length >= 2) {
      let searchResults: any[] = [];

      if (WOO_CONFIGURED) {
        const { getProducts } = await import('@/lib/woocommerce-server');
        const result = await getProducts({ search: q, perPage: limit });
        searchResults = (result.products || []).filter((p: any) => p.status === 'publish');
      } else {
        searchResults = await fetchFromWMS(`q=${encodeURIComponent(q)}&limit=${limit}&status=active`);
      }

      if (searchResults.length > 0) {
        return Response.json({
          success: true,
          busqueda: q,
          encontrado: true,
          resultados: searchResults.map(formatProduct),
          total: searchResults.length,
        });
      }

      let allProducts: any[] = [];
      if (WOO_CONFIGURED) {
        const { getProducts } = await import('@/lib/woocommerce-server');
        const result = await getProducts({ perPage: 100 });
        allProducts = (result.products || []).filter((p: any) => p.status === 'publish');
      } else {
        allProducts = await fetchFromWMS(`limit=100&status=active`);
      }

      return Response.json({
        success: true,
        busqueda: q,
        encontrado: false,
        resultados: allProducts.map(formatProduct),
        total: allProducts.length,
        nota: `No se encontro "${q}". Estos son todos los productos disponibles. La IA debe sugerir los mas parecidos.`,
      });
    }

    let allProducts: any[] = [];
    if (WOO_CONFIGURED) {
      const { getProducts } = await import('@/lib/woocommerce-server');
      const result = await getProducts({ perPage: 100 });
      allProducts = (result.products || []).filter((p: any) => p.status === 'publish');
    } else {
      allProducts = await fetchFromWMS(`limit=100&status=active`);
    }

    return Response.json({
      success: true,
      resultados: allProducts.map(formatProduct),
      total: allProducts.length,
    });
  } catch (error) {
    console.error('[Product Search Smart] Error:', error);
    return Response.json({ success: true, resultados: [], total: 0 });
  }
}
