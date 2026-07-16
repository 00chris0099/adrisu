import { NextRequest } from 'next/server';
import { prisma } from '@repo/prisma';
import { apiSuccess, apiError, apiPaginated, parsePagination, handleApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const productId = searchParams.get('product_id');

    const where: any = {};
    if (productId) {
      where.productId = productId;
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: offset,
        take: limit,
      }),
      prisma.offer.count({ where }),
    ]);

    return apiPaginated(offers, total, page, limit);
  } catch (error) {
    return handleApiError(error, 'offers-list');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, name, price, type, description, quantity, linkedProductId, imageUrl, sortOrder, isActive } = body;

    if (!productId) return apiError('productId is required', 400);
    if (!name) return apiError('name is required', 400);
    if (price === undefined || price === null) return apiError('price is required', 400);
    if (!type) return apiError('type is required', 400);

    const offer = await prisma.offer.create({
      data: {
        productId,
        name,
        price,
        type,
        description: description || null,
        quantity: quantity || 1,
        linkedProductId: linkedProductId || null,
        imageUrl: imageUrl || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return apiSuccess(offer, 201);
  } catch (error) {
    return handleApiError(error, 'offers-create');
  }
}
