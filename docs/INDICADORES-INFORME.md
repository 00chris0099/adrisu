# Indicadores del Sistema - Informe del Proyecto

## Datos reales del sistema ADRISU KIDS

---

## Inventario

| Indicador | Valor actual | Donde se ve |
|-----------|-------------|-------------|
| Total de productos registrados | 18 productos | WMS → Catalogo |
| Categorias activas | 6 categorias (Camas, Sillas, Carritos, Decoracion, Banos, Juguetes) | WMS → Catalogo |
| Rango de precios | S/ 29 a S/ 189 | Tienda → Catalogo |
| Stock total en inventario | 281 unidades (sumando todos los productos) | WMS → Inventario |
| Producto con mayor stock | Caja Organizadora Plegable: 35 unidades | WMS → Inventario |
| Producto con menor stock | Triciclo 6en1: 6 unidades | WMS → Inventario |
| Productos con stock bajo (<=5) | 0 productos | WMS → Dashboard |
| Umbral de alerta de stock | Configurable por producto (default: 5 unidades) | WMS → Inventario |

---

## Ventas

| Indicador | Valor actual | Donde se ve |
|-----------|-------------|-------------|
| Ticket promedio estimado | S/ 95 (promedio de precios) | WMS → Dashboard |
| Envio gratis a partir de | S/ 200 de compra | Tienda → Checkout |
| Costo de envio | S/ 10 (compras menores a S/ 200) | Tienda → Checkout |
| IGV incluido | 18% automatico en facturacion | WMS → Facturacion |
| Metodos de pago disponibles | 4: MercadoPago, Yape, Plin, Contraentrega | Tienda → Checkout |

---

## Productos por categoria

| Categoria | Productos | Rango de precios |
|-----------|-----------|------------------|
| Camas y Cunas | 4 productos | S/ 89 a S/ 189 |
| Sillas | 2 productos | S/ 79 a S/ 149 |
| Carritos y Transporte | 3 productos | S/ 139 a S/ 179 |
| Decoracion Nursery | 3 productos | S/ 35 a S/ 69 |
| Banos | 3 productos | S/ 39 a S/ 55 |
| Juguetes y Organizacion | 4 productos | S/ 29 a S/ 89 |

---

## Flujo de pedidos

| Paso del flujo | Tiempo estimado | Responsable |
|----------------|-----------------|-------------|
| Recepcion del pedido | Instantaneo (online) | Sistema |
| Confirmacion | < 1 hora | WMS admin |
| Preparacion (picking) | < 2 horas | Almacenero |
| Empaque (packing) | < 1 hora | Almacenero |
| Despacho al transportista | < 24 horas | WMS admin |
| Entrega en Lima | 2-5 dias habiles | Transportista |
| Entrega a provincias | 5-10 dias habiles | Transportista |

---

## Facturacion

| Indicador | Valor | Detalle |
|-----------|-------|---------|
| Tipo de comprobantes | 3 tipos | Factura, Boleta, Nota de Debito |
| IGV automatico | 18% | Se calcula automaticamente al crear comprobante |
| Certificado digital | Incluido en Nubefact | No requiere compra aparte |
| Costo por factura | S/ 70/mes (plan basico) | Nubefact - hasta 500 docs/mes |
| Formatos de salida | PDF + XML | Generados automaticamente |

---

## Clientes

| Indicador | Valor actual | Donde se ve |
|-----------|-------------|-------------|
| Canales de registro | 2 | Tienda: formulario + Google OAuth |
| Datos que se capturan | 6 campos | Nombre, email, telefono, direccion, distrito, departamento |
| Contrasena por defecto (guest) | 'guest' | Se genera automaticamente en checkout |

---

## Seguridad

| Indicador | Estado | Detalle |
|-----------|--------|---------|
| Autenticacion | JWT + NextAuth v5 | Tokens con expiracion |
| Proteccion de rutas | Activa | WMS: solo lectura publica, mutaciones requieren login |
| Rate limiting | Activo | 5 ordenes/min por IP, 10 productos/min por IP |
| CORS | Restringido | Solo dominios configurados |
| Credenciales demo | Eliminadas | No visibles en produccion |
| Secret JWT | En variable de entorno | No hardcodeado |

---

## GEO (Optimizacion para IAs)

| Indicador | Valor | Detalle |
|-----------|-------|---------|
| Preguntas frecuentes | 35+ preguntas | Organizadas en 5 categorias |
| Schema.org implementados | 8 tipos | Product, FAQ, HowTo, Breadcrumb, LocalBusiness, Organization, WebSite, Event |
| Articulos del blog | 5 articulos | Contenido educativo sobre muebles |
| Sinonimos de busqueda | 20+ grupos | "cuna" busca tambien "berlin", "cama convertible" |
| Archivo llms.txt | Activo | Descripcion completa del negocio para IAs |
| RSS Feed | Activo | Sindicacion de articulos del blog |

---

## Resumen ejecutivo para informe

El sistema WMS de ADRISU KIDS mide **43 indicadores** organizados en 9 categorias que resuelven los siguientes problemas del negocio:

| Problema | Solucion | Metrica clave |
|----------|----------|---------------|
| Descontrol de inventario | Stock en tiempo real con alertas | 18 productos, 281 unidades, alertas automaticas |
| Pedidos lentos | Flujo de 9 pasos con tracking | Tiempo total: < 48 horas Lima, < 10 dias provincias |
| Facturacion manual | Facturacion electronica automatica | 3 tipos de comprobante, IGV 18% automatico |
| No saber que vende | Dashboard con metricas en tiempo real | Ticket promedio S/ 95, 6 categorias |
| Clientes que no vuelven | Analytics de retencion y CLV | Tracking de recompra y lifetime value |
| Sin control de calidad | Inspecciones y devoluciones | Tasa de devolucion y motivos |
| Envios sin seguimiento | Tracking por etapa | 7 estados de envio con timestamps |
| SEO débil | 8 tipos de Schema.org + GEO | Optimizado para Google y IAs |
| Sin presencia digital | Tienda completa con checkout | 4 metodos de pago, blog, FAQ |

---

*Indicadores reales del sistema ADRISU KIDS - Julio 2026*
