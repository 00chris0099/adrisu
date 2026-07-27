import { NextRequest } from 'next/server';
import { prisma } from '@repo/prisma';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';

interface Props {
  params: { id: string };
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const existing = await prisma.suggestedProduct.findUnique({ where: { id: params.id } });
    if (!existing) return apiError('Suggested product not found', 404);

    await prisma.suggestedProduct.delete({ where: { id: params.id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error, 'suggested-products-delete');
  }
}
