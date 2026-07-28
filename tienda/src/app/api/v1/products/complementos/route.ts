import { NextRequest } from 'next/server';

const WMS_URL = process.env.WMS_INTERNAL_URL || process.env.NEXT_PUBLIC_WMS_URL || 'https://tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host';
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://adrisukids.com';

function formatProduct(p: any) {
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
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const productoId = searchParams.get('producto_id') || '';

    if (!q && !productoId) {
      return Response.json({
        success: false,
        error: 'Envia "q" (nombre del producto) o "producto_id" (id del producto)',
      });
    }

    let productId = productoId;
    let productInfo: any = null;

    // If no ID provided, search by name to find the product
    if (!productId && q) {
      const searchRes = await fetch(`${WMS_URL}/api/v1/products?q=${encodeURIComponent(q)}&limit=5&status=active`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        productInfo = (searchData.data || []).find((p: any) => p.status === 'active');
        if (productInfo) {
          productId = productInfo.id;
        }
      }
    }

    if (!productId) {
      return Response.json({
        success: false,
        error: `No se encontro el producto: "${q}"`,
      });
    }

    // 1. Get suggested products (cross-sell configured in WMS)
    let complementos: any[] = [];
    const suggestedRes = await fetch(`${WMS_URL}/api/v1/suggested-products?product_id=${productId}`);
    if (suggestedRes.ok) {
      const suggestedData = await suggestedRes.json();
      const suggestions = suggestedData.data || [];
      complementos = suggestions
        .filter((s: any) => s.isActive)
        .map((s: any) => {
          const price = Number(s.price) || 0;
          const comparePrice = s.compareAtPrice ? Number(s.compareAtPrice) : null;
          const hasDiscount = comparePrice && comparePrice > price;

          return {
            Producto: s.name,
            Tipo: s.type === 'existing' ? 'Producto de la tienda' : 'Complemento',
            Precio: `S/ ${price.toFixed(2)}`,
            ...(hasDiscount ? { PrecioOriginal: `S/ ${comparePrice.toFixed(2)}` } : {}),
            'Link de compra': s.linkedProductId
              ? `${STORE_URL}/producto/${s.linkedProductId}`
              : s.imageUrl || '#',
            'Link de foto': s.imageUrl || 'Sin imagen',
          };
        });
    }

    // 2. Get products from the same category
    let productosMismaCategoria: any[] = [];
    if (productInfo?.categoryId) {
      const catRes = await fetch(`${WMS_URL}/api/v1/products?limit=10&status=active&category=${productInfo.categoryId}`);
      if (catRes.ok) {
        const catData = await catRes.json();
        productosMismaCategoria = (catData.data || [])
          .filter((p: any) => p.status === 'active' && p.id !== productId)
          .slice(0, 5)
          .map(formatProduct);
      }
    }

    // 3. Get best sellers (highest stock products)
    let masVendidos: any[] = [];
    try {
      const bestRes = await fetch(`${WMS_URL}/api/v1/products?limit=10&status=active`);
      if (bestRes.ok) {
        const bestData = await bestRes.json();
        masVendidos = (bestData.data || [])
          .filter((p: any) => p.status === 'active' && p.id !== productId)
          .sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0))
          .slice(0, 3)
          .map(formatProduct);
      }
    } catch {}

    return Response.json({
      success: true,
      producto_original: productInfo ? {
        nombre: productInfo.name,
        precio: `S/ ${Number(productInfo.price).toFixed(2)}`,
      } : null,
      complementos,
      productos_misma_categoria: productosMismaCategoria,
      mas_vendidos: masVendidos,
      total_complementos: complementos.length + productosMismaCategoria.length + masVendidos.length,
      nota: 'El agente debe ofrecer primero los complementos directos, luego productos de la misma categoria, y finalmente los mas vendidos.',
    });
  } catch (error) {
    console.error('[Complementos] Error:', error);
    return Response.json({ success: true, complementos: [], total_complementos: 0 });
  }
}
