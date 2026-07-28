import { NextRequest } from 'next/server';
import { prisma } from '@repo/prisma';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';
import { invalidateCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filter, dryRun } = body;

    // filter can be: 'noOrders' | 'pendingOrders' | 'unpaidOrders' | 'inactive' | 'tiers' | 'all'
    // tiers: string[] — filter by specific tiers
    if (!filter) return apiError('Filter is required', 400);

    let where: any = { isActive: true };

    switch (filter) {
      case 'noOrders': {
        // Customers with 0 orders at all
        const customersWithOrders = await prisma.order.findMany({
          select: { customerId: true },
          distinct: ['customerId'],
        });
        const idsWithOrders = customersWithOrders.map(c => c.customerId);
        where.id = idsWithOrders.length > 0 ? { notIn: idsWithOrders } : { in: [] };
        break;
      }
      case 'pendingOrders': {
        // Customers with orders in pending/confirmed/processing/alistado status
        const pendingOrders = await prisma.order.findMany({
          where: { status: { in: ['pending', 'confirmed', 'processing', 'alistado'] } },
          select: { customerId: true },
          distinct: ['customerId'],
        });
        const pendingIds = pendingOrders.map(o => o.customerId);
        if (pendingIds.length === 0) return apiSuccess({ count: 0, customers: [] });
        where.id = { in: pendingIds };
        break;
      }
      case 'unpaidOrders': {
        // Customers with orders that have paymentStatus != paid
        const unpaidOrders = await prisma.order.findMany({
          where: { paymentStatus: { not: 'paid' } },
          select: { customerId: true },
          distinct: ['customerId'],
        });
        const unpaidIds = unpaidOrders.map(o => o.customerId);
        if (unpaidIds.length === 0) return apiSuccess({ count: 0, customers: [] });
        where.id = { in: unpaidIds };
        break;
      }
      case 'inactive': {
        where.isActive = false;
        break;
      }
      case 'tiers': {
        const { tiers } = body;
        if (!Array.isArray(tiers) || tiers.length === 0) return apiError('tiers array is required', 400);
        where.customerTier = { in: tiers };
        break;
      }
      case 'all': {
        // All active customers — dangerous, require confirmation
        break;
      }
      default:
        return apiError('Invalid filter. Use: noOrders, pendingOrders, unpaidOrders, inactive, tiers, all', 400);
    }

    const customers = await prisma.customer.findMany({
      where,
      select: { id: true, fullName: true, email: true, customerTier: true },
      orderBy: { createdAt: 'desc' },
    });

    if (customers.length === 0) return apiSuccess({ count: 0, customers: [] });

    if (dryRun) {
      return apiSuccess({ count: customers.length, customers, dryRun: true });
    }

    // Soft-delete: set isActive = false
    const ids = customers.map(c => c.id);
    await prisma.customer.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    });

    await invalidateCache('customers:*');

    return apiSuccess({
      count: ids.length,
      customers: customers.map(c => ({ id: c.id, fullName: c.fullName })),
    });
  } catch (error) {
    return handleApiError(error, 'customers-bulk-delete');
  }
}
