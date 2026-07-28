import { NextRequest } from 'next/server';

const WMS_URL = process.env.WMS_INTERNAL_URL || process.env.NEXT_PUBLIC_WMS_URL || 'https://tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host';
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://adrisukids.com';
const MAX_RESULTS = 5;

function parsePrice(p: any): number {
  const base = Number(p.price) || 0;
  const disc = Number(p.discountPercent) || 0;
  return disc > 0 ? Math.round(base * (1 - disc / 100) * 100) / 100 : base;
}

function score(candidate: any, original: any, context: string): number {
  let s = 0;
  const cPrice = parsePrice(candidate);
  const oPrice = original ? parsePrice(original) : 0;

  if (context === 'suggested') s += 50;
  else if (context === 'same_category') s += 25;
  else s += 10;

  if (candidate.stock > 0) s += 10;
  else s -= 30;

  if (oPrice > 0 && cPrice > 0) {
    const ratio = cPrice / oPrice;
    if (ratio >= 0.3 && ratio <= 1.5) s += 15;
    else if (ratio >= 0.1 && ratio <= 3) s += 5;
    else s -= 10;
  }

  if (candidate.discountPercent > 0) s += 5;

  const name = (candidate.name || '').toLowerCase();
  const tags = (candidate.tags || []).join(' ').toLowerCase();
  if (name.includes('beb') || name.includes('infantil') || tags.includes('bebe')) s += 3;
  if (candidate.images?.length > 0) s += 2;

  return s;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const productoId = searchParams.get('producto_id') || '';
    const max = Math.min(parseInt(searchParams.get('max') || String(MAX_RESULTS)), 8);

    if (!q && !productoId) {
      return Response.json({
        success: false,
        error: 'Envia "q" (nombre del producto) o "producto_id" (id del producto)',
      });
    }

    let productId = productoId;
    let productInfo: any = null;

    if (!productId && q) {
      const searchRes = await fetch(`${WMS_URL}/api/v1/products?q=${encodeURIComponent(q)}&limit=5&status=active`);
      if (searchRes.ok) {
        const data = await searchRes.json();
        productInfo = (data.data || []).find((p: any) => p.status === 'active');
        if (productInfo) productId = productInfo.id;
      }
    }

    if (!productId) {
      return Response.json({
        success: true,
        recomendaciones: [],
        total: 0,
        nota: `No se encontro "${q}". Pregunta al usuario que tipo de producto busca.`,
      });
    }

    const candidates: { product: any; score: number; context: string }[] = [];
    const seen = new Set<string>();
    seen.add(productId);

    // 1. Suggested products (cross-sell from WMS) — highest score
    try {
      const sugRes = await fetch(`${WMS_URL}/api/v1/suggested-products?product_id=${productId}`);
      if (sugRes.ok) {
        const sugData = await sugRes.json();
        for (const s of (sugData.data || [])) {
          if (!s.isActive) continue;
          if (s.linkedProductId && seen.has(s.linkedProductId)) continue;

          const product = {
            name: s.name,
            price: Number(s.price) || 0,
            discountPercent: 0,
            stock: 100,
            images: s.imageUrl ? [s.imageUrl] : [],
            slug: s.linkedProductId || '',
            tags: [],
            compareAtPrice: s.compareAtPrice ? Number(s.compareAtPrice) : null,
          };

          if (s.linkedProductId) seen.add(s.linkedProductId);
          candidates.push({ product, score: score(product, productInfo, 'suggested'), context: 'suggested' });
        }
      }
    } catch {}

    // 2. Same category products — medium score
    if (productInfo?.categoryId) {
      try {
        const catRes = await fetch(`${WMS_URL}/api/v1/products?limit=20&status=active&category=${productInfo.categoryId}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          for (const p of (catData.data || [])) {
            if (p.status !== 'active' || seen.has(p.id)) continue;
            seen.add(p.id);
            candidates.push({ product: p, score: score(p, productInfo, 'same_category'), context: 'same_category' });
          }
        }
      } catch {}
    }

    // 3. Other active products (fallback) — low score
    if (candidates.length < max) {
      try {
        const allRes = await fetch(`${WMS_URL}/api/v1/products?limit=30&status=active`);
        if (allRes.ok) {
          const allData = await allRes.json();
          for (const p of (allData.data || [])) {
            if (p.status !== 'active' || seen.has(p.id)) continue;
            seen.add(p.id);
            candidates.push({ product: p, score: score(p, productInfo, 'other'), context: 'other' });
          }
        }
      } catch {}
    }

    // Sort by score descending, take top N
    candidates.sort((a, b) => b.score - a.score);
    const top = candidates.slice(0, max);

    const recomendaciones = top.map(({ product: p, context }) => {
      const price = parsePrice(p);
      const image = p.images?.[0] || null;
      const stock = p.stock || 0;

      return {
        Producto: p.name,
        Precio: `S/ ${price.toFixed(2)}`,
        Stock: stock > 0 ? `${stock} uds` : 'Agotado',
        Link: `${STORE_URL}/producto/${p.slug}`,
        Foto: image || null,
        Tipo: context === 'suggested' ? 'Complemento recomendado' :
              context === 'same_category' ? 'Misma categoria' : 'Opcion similar',
      };
    });

    return Response.json({
      success: true,
      producto_original: productInfo ? productInfo.name : q,
      recomendaciones,
      total: recomendaciones.length,
    });
  } catch (error) {
    console.error('[Complementos] Error:', error);
    return Response.json({ success: true, recomendaciones: [], total: 0 });
  }
}
