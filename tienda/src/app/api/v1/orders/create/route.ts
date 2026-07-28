import { NextRequest } from 'next/server';

const WMS_URL = process.env.WMS_INTERNAL_URL || process.env.NEXT_PUBLIC_WMS_URL || 'https://tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host';
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://adrisukids.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cliente_nombre, cliente_telefono, cliente_email, items, notas } = body;

    if (!cliente_nombre || !cliente_nombre.trim()) {
      return Response.json({
        success: false,
        error: 'Falta el nombre del cliente',
      }, { status: 400 });
    }

    if (!items || !items.length) {
      return Response.json({
        success: false,
        error: 'Falta el producto. Indica al menos un producto con cantidad.',
      }, { status: 400 });
    }

    // Resolve each item: search by product name to get id, price, sku
    const resolvedItems: any[] = [];
    for (const item of items) {
      const productName = item.producto || item.name || '';
      const quantity = parseInt(item.cantidad || item.quantity || '1');

      if (!productName) continue;

      // Search for the product
      const searchRes = await fetch(`${WMS_URL}/api/v1/products?q=${encodeURIComponent(productName)}&limit=5&status=active`);
      if (!searchRes.ok) continue;

      const searchData = await searchRes.json();
      const found = (searchData.data || []).find((p: any) => p.status === 'active');

      if (!found) {
        return Response.json({
          success: false,
          error: `No se encontro el producto: "${productName}"`,
          productos_disponibles_sugerencia: true,
        }, { status: 404 });
      }

      const basePrice = Number(found.price) || 0;
      const discount = Number(found.discountPercent) || 0;
      const finalPrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100) * 100) / 100 : basePrice;

      resolvedItems.push({
        productId: found.id,
        productName: found.name,
        sku: found.sku,
        quantity: quantity,
        unitPrice: finalPrice,
        discountPercent: discount || 0,
        discountAmount: discount > 0 ? Math.round((basePrice - finalPrice) * 100) / 100 : 0,
      });
    }

    if (resolvedItems.length === 0) {
      return Response.json({
        success: false,
        error: 'No se pudieron resolver los productos',
      }, { status: 400 });
    }

    // Create order in WMS
    const orderRes = await fetch(`${WMS_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: null,
        source: 'n8n-agent',
        items: resolvedItems,
        notes: notas || `Pedido creado por agente IA. Cliente: ${cliente_nombre}`,
        internalNotes: `Telefono: ${cliente_telefono || 'N/A'} | Email: ${cliente_email || 'N/A'}`,
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.success) {
      return Response.json({
        success: false,
        error: orderData.error || 'Error al crear el pedido',
      }, { status: 500 });
    }

    const order = orderData.data;
    const subtotal = resolvedItems.reduce((sum: number, item: any) => sum + item.unitPrice * item.quantity, 0);
    const shipping = subtotal >= 150 ? 0 : 10;
    const total = subtotal + shipping;

    const itemsList = resolvedItems.map((item: any) =>
      `- ${item.productName} x${item.quantity} = S/ ${(item.unitPrice * item.quantity).toFixed(2)}`
    ).join('\n');

    return Response.json({
      success: true,
      pedido: {
        numero: order.orderNumber,
        estado: 'Confirmado',
        cliente: cliente_nombre,
        telefono: cliente_telefono || 'N/A',
        email: cliente_email || 'N/A',
        productos: resolvedItems.map((item: any) => ({
          producto: item.productName,
          cantidad: item.quantity,
          precio_unitario: `S/ ${item.unitPrice.toFixed(2)}`,
          subtotal: `S/ ${(item.unitPrice * item.quantity).toFixed(2)}`,
        })),
        envio: shipping === 0 ? 'Gratis' : `S/ ${shipping.toFixed(2)}`,
        total: `S/ ${total.toFixed(2)}`,
        resumen_texto: `Pedido ${order.orderNumber} confirmado!\n\nCliente: ${cliente_nombre}\nTelefono: ${cliente_telefono || 'N/A'}\n\nProductos:\n${itemsList}\n\nEnvio: ${shipping === 0 ? 'Gratis' : `S/ ${shipping.toFixed(2)}`}\nTotal: S/ ${total.toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error('[Order Create] Error:', error);
    return Response.json({
      success: false,
      error: 'Error interno al crear el pedido',
    }, { status: 500 });
  }
}
