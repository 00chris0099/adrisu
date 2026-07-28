import { NextRequest } from 'next/server';
import { prisma } from '@repo/prisma';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';
import { invalidateCache } from '@/lib/cache';

function computeTier(deliveredCount: number, cancelledCount: number, returnedCount: number, totalSpent: number): string {
  if (cancelledCount > 0 && deliveredCount === 0) return 'problematico';
  if (deliveredCount === 0) return 'nuevo';
  if (deliveredCount >= 5 || totalSpent >= 2000) return 'vip';
  if (deliveredCount >= 1) return 'frecuente';
  return 'normal';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customerId } = body;

    // Single customer
    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) return apiError('Customer not found', 404);

      const orders = await prisma.order.findMany({
        where: { customerId },
        select: { status: true, total: true },
      });

      const deliveredCount = orders.filter(o => o.status === 'delivered').length;
      const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
      const returnedCount = orders.filter(o => o.status === 'returned').length;
      const totalSpent = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total), 0);

      const tier = computeTier(deliveredCount, cancelledCount, returnedCount, totalSpent);

      await prisma.customer.update({ where: { id: customerId }, data: { customerTier: tier } });
      await invalidateCache('customers:*');

      return apiSuccess({
        updated: 1,
        customers: [{ id: customer.id, fullName: customer.fullName, customerTier: tier }],
      });
    }

    // All active customers
    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true, customerTier: true },
    });

    let updatedCount = 0;
    const results: { id: string; fullName: string; customerTier: string }[] = [];

    for (const customer of customers) {
      const orders = await prisma.order.findMany({
        where: { customerId: customer.id },
        select: { status: true, total: true },
      });

      const deliveredCount = orders.filter(o => o.status === 'delivered').length;
      const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
      const returnedCount = orders.filter(o => o.status === 'returned').length;
      const totalSpent = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total), 0);

      const tier = computeTier(deliveredCount, cancelledCount, returnedCount, totalSpent);

      // Only update if tier changed
      if ((customer as any).customerTier !== tier) {
        await prisma.customer.update({ where: { id: customer.id }, data: { customerTier: tier } });
        updatedCount++;
      }

      results.push({ id: customer.id, fullName: customer.fullName, customerTier: tier });
    }

    await invalidateCache('customers:*');

    return apiSuccess({ updated: updatedCount, total: customers.length, customers: results });
  } catch (error) {
    return handleApiError(error, 'customers-compute-tiers');
  }
}
