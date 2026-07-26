import { getCategories } from '@/lib/woocommerce-server';
import { prisma } from '@repo/prisma';
import { apiSuccess, handleApiError } from '@/lib/api';

const WOO_CONFIGURED = !!(process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET && process.env.NEXT_PUBLIC_WORDPRESS_URL);

export async function GET() {
  try {
    // ============================================================
    // WooCommerce path
    // ============================================================
    if (WOO_CONFIGURED) {
      const categories = await getCategories();
      return apiSuccess(categories);
    }

    // ============================================================
    // Fallback: local Prisma
    // ============================================================
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: { _count: { select: { products: true } }, children: { where: { isActive: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return apiSuccess(categories);
  } catch (error) {
    return handleApiError(error, 'store-categories');
  }
}
