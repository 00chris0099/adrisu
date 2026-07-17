# Indicadores del Sistema - Informe del Proyecto

> Tabla de indicadores que mide el WMS y la Tienda, organizada por problema de negocio que resuelve.

---

## 1. Gestion de Inventario

| # | Indicador | Que problema resuelve | Como se mide | Donde se ve |
|---|-----------|----------------------|--------------|-------------|
| 1 | Nivel de stock actual | Saber cuantos productos hay disponibles para vender | Stock por producto en cada almacén | WMS → Inventario |
| 2 | Productos con stock bajo | Evitar quedarse sin productos para vender | Productos donde stock ≤ umbral de alerta | WMS → Dashboard (alerta) |
| 3 | Productos agotados | Detectar qué productos no se pueden vender | Productos con stock = 0 | WMS → Inventario |
| 4 | Rotación de inventario | Saber qué tan rápido se vende el stock (no tener dinero atado en bodega) | Costo de mercadería vendida / Inventario promedio | WMS → Reportes → Inventario |
| 5 | Valorización de stock | Saber cuánto dinero hay invertido en productos sin vender | Suma de (stock × costo unitario) por producto | WMS → Reportes → Inventario |
| 6 | Productos obsoletos | Detectar productos que llevan mucho tiempo sin venderse | Productos sin movimiento de stock por más de 90 días | WMS → Reportes → Inventario |
| 7 | Precisión de inventario | Evitar diferencias entre lo que dice el sistema y lo que hay en bodega | (Productos con stock correcto / Total) × 100 | WMS → Conteo Cíclico |

---

## 2. Gestion de Pedidos

| # | Indicador | Que problema resuelve | Como se mide | Donde se ve |
|---|-----------|----------------------|--------------|-------------|
| 8 | Volumen de pedidos diario | Saber cuántos pedidos llegan al día para dimensionar personal | Total de pedidos por día | WMS → Dashboard / Reportes |
| 9 | Ticket promedio | Saber cuánto gasta cada cliente en promedio | Total de ingresos / Número de pedidos | WMS → Dashboard |
| 10 | Tiempo de preparación del pedido | Medir qué tan rápido se procesa un pedido desde que llega hasta que sale | Tiempo entre confirmación y envío | WMS → Reportes / Pedido detail |
| 11 | Tasa de cancelación de pedidos | Detectar problemas con los pedidos (malos datos, arrepentimiento) | Pedidos cancelados / Total × 100 | WMS → Reportes |
| 12 | Pedidos por estado | Saber cuántos pedidos están en cada etapa del flujo | Conteo agrupado por status | WMS → Dashboard |
| 13 | Eficiencia de picking | Medir qué tan bien preparan los pedidos los almaceneros | Items correctamente escaneados / Total × 100 | WMS → Picking |

---

## 3. Ventas e Ingresos

| # | Indicador | Que problema resuelve | Como se mide | Donde se ve |
|---|-----------|----------------------|--------------|-------------|
| 14 | Ingresos brutos mensuales | Saber cuánto dinero entra al negocio cada mes | Suma de totales de pedidos pagados | WMS → Reportes → General |
| 15 | Ingresos por categoría | Saber qué tipo de muebles vende más (camas, sillas, carritos) | Ingresos agrupados por categoría | WMS → Reportes → General |
| 16 | Ingresos por canal de pago | Saber si los clientes pagan más con tarjeta, Yape o contraentrega | Ingresos agrupados por método de pago | WMS → Reportes → General |
| 17 | Tasa de conversión del checkout | Saber de los que entran a la tienda, cuántos compran | Completaron pago / Iniciaron checkout × 100 | Tienda → Analytics |
| 18 | Checkouts abandonados | Detectar por qué los clientes se van sin comprar | Checkouts iniciados no completados / Total × 100 | Tienda → Analytics |
| 19 | Productos más vendidos | Saber qué productos tienen mayor demanda | Ranking por unidades vendidas | WMS → Reportes → General |

---

## 4. Clientes

| # | Indicador | Que problema resuelve | Como se mide | Donde se ve |
|---|-----------|----------------------|--------------|-------------|
| 20 | Total de clientes | Saber cuántos clientes tiene el negocio | Conteo de registros en customers | WMS → Dashboard |
| 21 | Clientes nuevos por mes | Medir el crecimiento de la base de clientes | Clientes creados en el mes | WMS → Dashboard |
| 22 | Valor de vida del cliente (LTV) | Saber cuánto vale un cliente a lo largo del tiempo | Total gastado × frecuencia de compra | WMS → Analytics Avanzado |
| 23 | Tasa de recurrencia | Saber si los clientes vuelven a comprar | Clientes con 2+ pedidos / Total × 100 | WMS → Analytics Avanzado |
| 24 | Retención a 90 días | Saber si los clientes siguen activos después de 3 meses | Clientes que compraron en últimos 90 días / Total × 100 | WMS → Analytics Avanzado |
| 25 | Cohortes de clientes | Comparar el comportamiento de clientes que llegaron en diferentes meses | Retención por mes de registro | WMS → Analytics Avanzado |

---

## 5. Facturacion e Impuestos

| # | Indicador | Que problema resuelve | Como se mide | Donde se ve |
|---|-----------|----------------------|--------------|-------------|
| 26 | IGV recaudado | Cumplir con la obligación tributaria de cobrar 18% de IGV | IGV cobrado en facturas emitidas | WMS → Reportes → IGV |
| 27 | Base imponible | Saber sobre cuánto se cobra el IGV | Subtotal de ventas gravadas | WMS → Reportes → IGV |
| 28 | Facturas emitidas | Controlar cuántos comprobantes se han enviado a SUNAT | Conteo de facturas por estado | WMS → Facturación |
| 29 | Margen bruto por producto | Saber qué productos son más rentables | (Precio venta - Costo) / Precio venta × 100 | WMS → Reportes → Márgenes |

---

## 6. Proveedores y Compras

| # | Indicador | Que problema resuelve | Como se mide | Donde se ve |
|---|-----------|----------------------|--------------|-------------|
| 30 | Compras por proveedor | Saber de qué proveedor se compra más | Monto total de compras por proveedor | WMS → Reportes → Proveedores |
| 31 | Tiempo promedio de entrega de proveedores | Medir la confiabilidad de los proveedores | Días entre orden y recepción | WMS → Reportes → Proveedores |
| 32 | Ranking de proveedores | Clasificar proveedores por volumen y confiabilidad | Score combinado de monto + tiempo | WMS → Reportes → Proveedores |

---

## 7. Envíos y Logística

| # | Indicador | Que problema resuelve | Como se mide | Donde se ve |
|---|-----------|----------------------|--------------|-------------|
| 33 | Tiempo de entrega al cliente | Medir cuánto tarda un pedido en llegar al cliente | Días desde envío hasta entrega | WMS → Logística |
| 34 | Tasa de cumplimiento a tiempo | Saber si los pedidos llegan cuando se prometió | Entregados a tiempo / Total × 100 | WMS → Logística |
| 35 | Costo de envío promedio | Controlar cuánto se gasta en envíos | Suma de costos / Total de envíos | WMS → Logística |

---

## 8. Marketing y Comunicaciones

| # | Indicador | Que problema resuelve | Como se mide | Donde se ve |
|---|-----------|----------------------|--------------|-------------|
| 36 | Cupones usados | Medir si las promociones generan ventas | Cupones aplicados en pedidos | WMS → Cupones |
| 37 | Impacto de descuentos en ingresos | Saber cuánto se pierde en descuentos | Descuentos aplicados / Ingresos × 100 | WMS → Reportes |
| 38 | Suscriptores al newsletter | Medir el interés de los clientes en recibir información | Total de suscriptores activos | WMS → Comunicaciones |
| 39 | Productos favoritos | Saber qué productos llaman la atención aunque no se compren | Conteo de veces agregados a favoritos | Tienda → Favoritos |

---

## 9. Calidad y Devoluciones

| # | Indicador | Que problema resuelve | Como se mide | Donde se ve |
|---|-----------|----------------------|--------------|-------------|
| 40 | Tasa de devolución | Detectar problemas de calidad o expectativas | Devoluciones / Entregados × 100 | WMS → Devoluciones |
| 41 | Motivos de devolución | Entender por qué los clientes devuelven productos | Conteo por motivo | WMS → Devoluciones |
| 42 | Inspecciones de calidad | Asegurar que los productos cumplen estándares antes de enviar | Conteo de inspecciones aprobadas/rechazadas | WMS → Calidad |
| 43 | Tasa de aprobación en QC | Medir la calidad de los productos que llegan | Aprobados / Total inspeccionados × 100 | WMS → Calidad |

---

## Resumen: Que resuelve el sistema

| Problema de la empresa | Solucion del WMS | Indicadores clave |
|------------------------|------------------|-------------------|
| No sé cuánto stock tengo | Inventario en tiempo real | 1, 2, 3, 5 |
| Se me quedan productos sin vender | Alertas de stock bajo y obsoletos | 2, 6, 7 |
| No sé cuánto vendo al mes | Dashboard con ingresos y pedidos | 8, 14, 15 |
| No sé qué productos son rentables | Reporte de márgenes por producto | 29, 19 |
| Los pedidos se tardan mucho en llegar | Tracking de tiempo de preparación y envío | 10, 33, 34 |
| No sé cuántos clientes tengo ni si vuelven | Analytics de clientes y retención | 20, 23, 24, 25 |
| No sé si estoy pagando bien los impuestos | Reporte de IGV y facturación electrónica | 26, 27, 28 |
| No sé qué proveedor es mejor | Ranking de proveedores por confiabilidad | 30, 31, 32 |
| Los clientes no completan el checkout | Análisis de conversión y abandono | 17, 18 |
| No sé si los descuentos me convienen | Impacto de cupones en ingresos | 36, 37 |
| Los productos llegan dañados o malos | Control de calidad y devoluciones | 40, 41, 42, 43 |

---

*Tabla de indicadores para informe del proyecto ADRISU KIDS*
