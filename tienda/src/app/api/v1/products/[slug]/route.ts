import { NextRequest } from 'next/server';
import { getProductBySlug } from '@/lib/woocommerce-server';

const WMS_URL = process.env.WMS_INTERNAL_URL || process.env.NEXT_PUBLIC_WMS_URL || 'https://tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host';
const WOO_CONFIGURED = !!(process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET && process.env.NEXT_PUBLIC_WORDPRESS_URL);

interface Props { params: { slug: string } }

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    // ============================================================
    // WooCommerce path
    // ============================================================
    if (WOO_CONFIGURED) {
      const product = await getProductBySlug(params.slug);

      if (!product || product.status !== 'publish') {
        return Response.json({ error: 'Product not found' }, { status: 404 });
      }

      return Response.json({ data: product });
    }

    // ============================================================
    // Fallback: legacy WMS backend
    // ============================================================
    const res = await fetch(`${WMS_URL}/api/v1/products/${params.slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const data = await res.json();
    const p = data.data;

    if (!p || p.status !== 'active') {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const basePrice = Number(p.price) || 0;
    const discount = p.discountPercent ? Number(p.discountPercent) : 0;
    const finalPrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100) * 100) / 100 : basePrice;

    const productLegacy = {
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      model: p.model || '',
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      brand: p.brand || '',
      status: p.status,
      tags: p.tags || [],
      images: p.images || [],
      height: p.height,
      width: p.width,
      depth: p.depth,
      color: p.color || '',
      materials: p.materials || [],
      recommendedAge: p.recommendedAge || '',
      warrantyDays: p.warrantyDays,
      originCountry: p.originCountry || '',
      weight: p.weight,
      weightUnit: p.weightUnit || 'kg',
      lowStockAlert: p.lowStockAlert,
      price: basePrice,
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      finalPrice,
      discountPercent: discount,
      stock: p.stock || 0,
      barcode: p.barcode,
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      categoryId: p.categoryId,
      discountPopup: p.discountPopup || null,
      promotionBar: p.promotionBar || null,
      socialProof: p.socialProof || null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };

    return Response.json({ data: productLegacy });
  } catch (error) {
    console.error('[Tienda Product Detail] Error:', error);
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }
}
