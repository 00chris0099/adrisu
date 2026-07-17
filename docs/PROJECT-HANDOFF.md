# Handoff Document - ADRISU KIDS WMS & Tienda Virtual

> **Fecha**: Julio 2026
> **Repositorio**: https://github.com/00chris0099/adrisu
> **Produccion**: https://tiendavirtual-tiendaadrisuk.jpq6em.easypanel.host (Tienda) | https://tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host (WMS)

---

## 1. Descripcion General

Sistema completo de e-commerce para muebles de bebes en Peru, compuesto por:

- **WMS (Warehouse Management System)**: Panel de administracion para gestionar productos, pedidos, inventario, facturacion, clientes, reportes y logistica
- **Tienda Virtual**: Sitio web publico donde los clientes compran productos
- **Paquetes compartidos**: Prisma schemas, componentes UI, utilidades

---

## 2. Stack Tecnologico

| Tecnologia | Uso |
|------------|-----|
| Next.js 14 | Framework web (App Router) |
| TypeScript | Lenguaje principal |
| React 18 | UI library |
| Prisma | ORM para PostgreSQL |
| PostgreSQL 15 | Base de datos principal |
| Redis 7 | Cache y sesiones |
| NextAuth v5 beta | Autenticacion (JWT) |
| Tailwind CSS | Estilos |
| Zustand | State management (carrito) |
| Recharts | Graficos del dashboard |
| MercadoPago | Pasarela de pagos |
| Nubefact | Facturacion electronica SUNAT |
| Resend | Emails transaccionales |
| imgBB | Hosting de imagenes |
| WhatsApp Business API | Chatbot y notificaciones |
| Docker + Nginx | Deploy y reverse proxy |
| Turborepo | Monorepo management |

---

## 3. Arquitectura del Proyecto

```
proyecto-integrador/
├── wms/                    # Panel de administracion (puerto 3000)
├── tienda/                 # Tienda virtual publica (puerto 3001)
├── packages/
│   ├── prisma/             # Schema Prisma para tienda
│   ├── prisma-wms/         # Schema Prisma para WMS (37 modelos)
│   ├── ui/                 # Componentes compartidos
│   └── utils/              # Utilidades compartidas
├── infrastructure/         # Nginx, env files
├── scripts/                # Scripts de inicializacion
├── docker-compose.yml      # Orquestacion de servicios
└── docs/                   # Documentacion
```

---

## 4. WMS - Panel de Administracion

### 4.1 Paginas del Dashboard (32 paginas)

| Ruta | Funcionalidad | Estado |
|------|---------------|--------|
| `/` | Dashboard principal con KPIs y graficos | Funcional |
| `/pedidos` | Lista de pedidos con filtros y busqueda | Funcional |
| `/pedidos/nuevo` | Crear nuevo pedido | Funcional |
| `/pedidos/[id]` | Detalle de pedido con timeline de 9 pasos | Funcional |
| `/pedidos/[id]/picking` | Estacion de picking con escaneo SKU | Funcional |
| `/pedidos/[id]/packing` | Estacion de empaque con impresion etiquetas | Funcional |
| `/inventario` | Lista de productos con edicion inline de stock | Funcional |
| `/inventario/transferencias/nueva` | Transferencia entre almacenes | Funcional |
| `/inventario/series/nueva` | Registro de numeros de serie | Funcional |
| `/inventario/lotes/nuevo` | Creacion de lotes con fechas | Funcional |
| `/catalogo` | CRUD completo de productos con preview | Funcional |
| `/clientes` | Lista y gestion de clientes | Funcional |
| `/clientes/nuevo` | Crear nuevo cliente | Funcional |
| `/clientes/[id]/editar` | Editar cliente | Funcional |
| `/facturacion` | Gestion de facturas, boletas, notas | Funcional |
| `/finanzas` | Resumen financiero con graficos | Funcional |
| `/reportes` | Reportes: general, IGV, proveedores, margenes, inventario | Funcional |
| `/compras` | Gestion de proveedores | Funcional |
| `/logistica` | Gestion de envios | Funcional |
| `/usuarios` | Gestion de usuarios y roles | Funcional |
| `/cupones` | CRUD de cupones de descuento | Funcional |
| `/impuestos` | Configuracion de IGV | Funcional |
| `/comunicaciones` | WhatsApp broadcasts y notificaciones push | Funcional |
| `/analytics` | Dashboard de analytics basico | Funcional |
| `/analytics-avanzado` | CLV, cohortes, tendencias, carrito | Funcional |
| `/blog` | Gestion de articulos del blog | Funcional |
| `/whatsapp` | Configuracion de chatbot WhatsApp | Funcional |
| `/labels` | Impresion de etiquetas ZPL | Funcional |
| `/picking` | Listas de picking batch | Funcional |
| `/packing` | Estaciones de empaque | Funcional |
| `/devoluciones` | Gestion de devoluciones/RMA | Funcional |
| `/calidad` | Control de calidad e inspecciones | Funcional |
| `/auditoria` | Logs de auditoria del sistema | Funcional |

> **[CAPTURA]**: Tomar screenshot del dashboard principal con KPIs visibles

### 4.2 Gestion de Productos (Catalogo)

El formulario de productos tiene 5 pestanas:

1. **Informacion**: Nombre, SKU, descripcion, categoria, marca, dimensiones, peso, color, materiales, edad recomendada, garantia, pais de origen
2. **Precios**: Precio principal, precio especial, descuento porcentaje, precio mayorista, configuracion de tipos de precio
3. **Variantes**: Agregar/editar variantes (talla, color, etc.) con precio y stock individual
4. **Ofertas**: Productos sugeridos (cross-sell), configuracion de popup de descuento
5. **Landing Page**: Editor de bloques para pagina de aterrizaje del producto (hero, texto, imagen, galeria, features, testimonials, FAQ, countdown, CTA, video)

> **[CAPTURA]**: Tomar screenshot del formulario de producto con las 5 pestanas visibles
> **[CAPTURA]**: Tomar screenshot del editor de landing page con bloques

### 4.3 Flujo de Pedidos

El flujo completo de un pedido es:

```
Pendiente → Confirmado → Procesando → Picking → Packing → Listo para Enviar → Enviado → En Transito → Entregado
```

Cada estado tiene transiciones validas configuradas en `wms/src/lib/orders.ts`.

El timeline de 9 pasos se muestra en la vista de detalle del pedido.

> **[CAPTURA]**: Tomar screenshot de la vista de detalle de pedido con timeline visible
> **[CAPTURA]**: Tomar screenshot de la estacion de picking con escaneo SKU

### 4.4 Facturacion Electronica (Nubefact)

El WMS esta integrado con Nubefact para facturacion electronica SUNAT:

- **Documentos soportados**: Factura electronica, Boleta de venta, Nota de credito, Nota de debito
- **Calculo automatico de IGV**: 18% sobre el subtotal
- **Generacion de PDF**: Con diseno profesional y logo de empresa
- **Envio a SUNAT**: Via API de Nubefact
- **Consulta de estado**: Verificacion de aceptacion/rechazo

Variables de entorno requeridas:
```
NUBEFACT_TOKEN=tu_token
NUBEFACT_URL=https://demo.nubefact.com/api/v1
```

> **[CAPTURA]**: Tomar screenshot de la pagina de facturacion con lista de comprobantes
> **[CAPTURA]**: Tomar screenshot del modal de nuevo comprobante con calculo de IGV

### 4.5 Reportes

5 tipos de reportes disponibles:

1. **General**: KPIs, productos, pedidos, revenue, tasa de conversion
2. **IGV**: Desglose mensual de IGV cobrado, base imponible
3. **Proveedores**: Compras por proveedor, ranking, dias promedio de entrega
4. **Margenes**: Top 10 productos mas rentables, margen bruto %
5. **Inventario**: Valorizacion de stock, rotacion, productos obsoletos

Todos exportables a Excel via `/api/v1/reports/export`.

> **[CAPTURA]**: Tomar screenshot de cada tipo de reporte

### 4.6 Notificaciones

El WMS tiene un sistema de notificaciones en tiempo real:

- **Campana de notificaciones** en el header del dashboard
- **Polling** cada 30 segundos
- **Marcado como leido** individual y masivo
- **Tipos**: Pedidos, estado, stock, informacion

Las notificaciones se crean automaticamente cuando:
- Se crea un pedido
- Cambia el estado de un pedido
- Stock esta bajo el umbral

> **[CAPTURA]**: Tomar screenshot de la campana de notificaciones con el dropdown abierto

---

## 5. Tienda Virtual

### 5.1 Paginas Publicas (15 paginas)

| Ruta | Funcionalidad | Estado |
|------|---------------|--------|
| `/` | Landing page con productos destacados | Funcional |
| `/tienda` | Catalogo con busqueda, filtros, ordenamiento | Funcional |
| `/producto/[slug]` | Detalle de producto con variantes, landing page | Funcional |
| `/carrito` | Carrito de compras con drawer slide-in | Funcional |
| `/checkout` | Checkout 4 pasos: carrito, info, pago, confirmacion | Funcional |
| `/pago` | Pagina de pago MercadoPago | Funcional |
| `/pedido` | Seguimiento de pedido por numero | Funcional |
| `/faq` | 35+ preguntas frecuentes con Schema.org | Funcional |
| `/blog` | Listado de articulos del blog | Funcional |
| `/blog/[slug]` | Detalle de articulo con HTML sanitizado | Funcional |
| `/login` | Inicio de sesion (credenciales + Google) | Funcional |
| `/registro` | Registro de clientes | Funcional |
| `/favoritos` | Lista de deseos | Funcional |
| `/mis-pedidos` | Historial de pedidos del cliente | Funcional |
| `/perfil` | Perfil del cliente | Funcional |

> **[CAPTURA]**: Tomar screenshot de la landing page
> **[CAPTURA]**: Tomar screenshot del catalogo con productos y filtros
> **[CAPTURA]**: Tomar screenshot del detalle de producto con variantes y precio
> **[CAPTURA]**: Tomar screenshot del carrito de compras
> **[CAPTURA]**: Tomar screenshot del checkout (paso de informacion)
> **[CAPTURA]**: Tomar screenshot del seguimiento de pedido

### 5.2 Carrito de Compras

- **State management**: Zustand con persistencia en localStorage
- **Funcionalidades**: Agregar, eliminar, actualizar cantidad, calcular total
- **Validacion**: Stock disponible, precio actualizado
- **Drawer**: Se abre desde cualquier pagina como overlay

> **[CAPTURA]**: Tomar screenshot del drawer del carrito con productos

### 5.3 Checkout

Flujo de 4 pasos:

1. **Carrito**: Resumen de productos
2. **Informacion**: Datos del cliente y direccion de envio (con UBIGEO)
3. **Pago**: Opciones: MercadoPago (tarjetas), Yape, Plin, Contraentrega
4. **Confirmacion**: Resumen del pedido y numero de orden

Integraciones:
- **MercadoPago**: Checkout redirige a MP para tarjetas
- **Yape/Plin**: Muestra QR para pago manual
- **Contraentrega**: Pago en efectivo al momento de la entrega (solo Lima)

> **[CAPTURA]**: Tomar screenshot del paso de pago con opciones de MercadoPago/Yape/Plin

### 5.4 SEO y GEO

El sitio esta optimizado para buscadores y motores de IA:

- **Schema.org**: Product, FAQ, HowTo, BreadcrumbList, LocalBusiness, Organization, WebSite, Event, Video, Speakable
- **Meta tags**: OpenGraph, Twitter Cards, metadata dinamica por pagina
- **Sitemap**: Dinamico con productos y blog
- **llms.txt**: Archivo para que las IAs entiendan el sitio
- **RSS Feed**: `/feed.xml` con articulos del blog
- **Canonical URLs**: En todas las paginas

> **[CAPTURA]**: Tomar screenshot de Google Search Console mostrando rich results

### 5.5 Blog

- **Gestion**: CRUD completo desde el WMS
- **Contenido**: Articulos educativos sobre muebles para bebes
- **SEO**: Metadata dinamica, OpenGraph, Schema Article
- **Sanitizacion**: HTML sanitizado con DOMPurify

> **[CAPTURA]**: Tomar screenshot de un articulo del blog

---

## 6. Base de Datos (37 Modelos Prisma)

### Principales modelos:

**IAM**: User, Session
**Catalogo**: Category, Product, ProductVariant
**Inventario**: Warehouse, Inventory, InventoryMovement, AuditTrail
**Precios**: PriceList, PriceListItem
**Ventas/CRM**: Order, OrderItem, OrderStatusHistory, Customer, Shipment
**Facturacion**: Invoice, InvoiceItem
**Compras**: Supplier, PurchaseOrder, PurchaseOrderItem, GoodsReceipt
**Logistica**: Shipment
**Picking**: PickList, PickListItem
**Devoluciones**: Return, ReturnItem
**Conteo Ciclico**: CycleCount, CycleCountItem
**Lotes**: Lot, LotMovement
**Series**: SerialNumber
**Calidad**: QualityCheck, QualityCheckItem
**Blog**: BlogPost
**Notificaciones**: NotificationQueue
**E-commerce**: Wishlist, Review, SuggestedProduct, Coupon, NewsletterSubscriber, TaxConfig

> **[CAPTURA]**: Tomar screenshot de Prisma Studio mostrando los modelos

---

## 7. Infraestructura

### 7.1 Docker Compose

5 servicios:

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| postgres | 5432 | PostgreSQL 15 Alpine |
| redis | 6379 | Redis 7 Alpine |
| wms | 3000 | Next.js WMS (standalone) |
| tienda | 3001 | Next.js Tienda (standalone) |
| nginx | 80/443 | Reverse proxy con HTTPS |

### 7.2 Deploy en EasyPanel

Los servicios estan configurados por separado en EasyPanel (no via docker-compose):

- **WMS**: `tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host`
- **Tienda**: `tiendavirtual-tiendaadrisuk.jpq6em.easypanel.host`

Variables de entorno requeridas en EasyPanel:

**WMS:**
```
DATABASE_URL=postgres://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=adriskids-wms-secret-2024
NEXTAUTH_URL=https://tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host
AUTH_TRUST_HOST=true
MERCADOPAGO_ACCESS_TOKEN=...
MERCADOPAGO_PUBLIC_KEY=...
IMGBB_API_KEY=...
RESEND_API_KEY=...
NUBEFACT_TOKEN=...
NUBEFACT_URL=https://demo.nubefact.com/api/v1
```

**Tienda:**
```
DATABASE_URL=postgres://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=adriskids-wms-secret-2024
NEXTAUTH_URL=https://tiendavirtual-tiendaadrisuk.jpq6em.easypanel.host
AUTH_TRUST_HOST=true
WMS_INTERNAL_URL=https://tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host
MERCADOPAGO_ACCESS_TOKEN=...
MERCADOPAGO_PUBLIC_KEY=...
IMGBB_API_KEY=...
RESEND_API_KEY=...
```

> **[CAPTURA]**: Tomar screenshot del docker-compose.yml
> **[CAPTURA]**: Tomar screenshot de EasyPanel con los servicios configurados

---

## 8. Seguridad

### Implementada:
- Autenticacion JWT con NextAuth
- Middleware protection en WMS (solo lectura publica)
- CORS restringido por dominio
- Rate limiting en endpoints criticos
- Input validation en APIs
- SQL injection prevention via Prisma
- XSS prevention via React + DOMPurify
- Secrets en variables de entorno (no hardcodeados)

### Pendiente:
- 2FA no implementado (solo estructura base)
- Audit trail completo para todas las mutaciones

---

## 9. GEO (Generative Engine Optimization)

Optimizado para que las IAs (ChatGPT, Perplexity, Gemini) entiendan y recomienden la tienda:

- **Schema.org**: Product, FAQ (35+ preguntas), HowTo, BreadcrumbList, LocalBusiness, Organization, WebSite, Event, Video, Speakable
- **llms.txt**: Archivo en la raiz del sitio con descripcion del negocio, productos, precios, politicas
- **RSS Feed**: `/feed.xml` para sindicacion de contenido
- **Blog educativo**: 5 articulos optimizados para GEO
- **Contenido semántico**: Descripciones ricas de productos
- **Sinónimos de búsqueda**: Búsqueda expandida con sinónimos

> **[CAPTURA]**: Tomar screenshot de la pagina /faq con las 35+ preguntas
> **[CAPTURA]**: Tomar screenshot del archivo llms.txt

---

## 10. Funcionalidades Clave

### 10.1 Impresion de Etiquetas (ZPL)
- Etiquetas de producto (50x30mm, 100x50mm)
- Etiquetas de envio (100x100mm, 100x150mm)
- Guia de remision
- Generador de codigo ZPL en `wms/src/lib/printing/zpl.ts`

### 10.2 WhatsApp Business Chatbot
- Flujos predefinidos: bienvenida, estado de pedido, catalogo, devoluciones, soporte
- Webhook handler en `/api/v1/whatsapp`
- Configuracion desde el WMS

### 10.3 Escaneo de Codigos de Barras
- Componente `BarcodeScanner` usando html5-qrcode
- Compatible con camara del celular
- Uso en: picking, packing, inventario

### 10.4 PWA (Progressive Web App)
- Manifest.json configurado
- Service Worker para offline
- Instalable en dispositivos moviles

### 10.5 Analytics
- **Basico**: Dashboard con KPIs, productos top, revenue
- **Avanzado**: CLV (Customer Lifetime Value), cohortes, tendencias estacionales, analisis de carrito

> **[CAPTURA]**: Tomar screenshot del escanner de codigos de barras en accion
> **[CAPTURA]**: Tomar screenshot del dashboard de analytics avanzado

---

## 11. Servicios Externos

| Servicio | Estado | Uso |
|----------|--------|-----|
| MercadoPago | Configurado (sandbox) | Pagos con tarjeta |
| Nubefact | Configurado (demo) | Facturacion electronica SUNAT |
| Resend | Configurado | Emails transaccionales |
| imgBB | Configurado | Hosting de imagenes |
| SUNAT RUC | Configurado | Consulta de RUCs |
| WhatsApp Business | Pendiente de API key | Chatbot y notificaciones |
| Google Analytics | Pendiente | Tracking de trafico |
| Meta Pixel | Pendiente | Retargeting |

---

## 12. Comandos Utiles

```bash
# Instalar dependencias
pnpm install

# Desarrollo local
pnpm --filter @repo/wms dev      # WMS en puerto 3000
pnpm --filter @repo/tienda dev   # Tienda en puerto 3001

# Build
pnpm --filter @repo/wms build
pnpm --filter @repo/tienda build

# Base de datos
pnpm --filter @repo/prisma-wms db:generate   # Generar Prisma Client
pnpm --filter @repo/prisma-wms db:push        # Push schema a DB
pnpm --filter @repo/prisma-wms db:seed        # Seed datos iniciales
pnpm --filter @repo/prisma-wms db:studio      # Abrir Prisma Studio

# Docker
docker-compose up -d    # Levantar todos los servicios
docker-compose down     # Detener todos los servicios
```

---

## 13. Estructura de Directorios WMS

```
wms/src/
├── app/
│   ├── (auth)/login/           # Pagina de login
│   ├── (dashboard)/            # 32 paginas del dashboard
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── pedidos/            # Gestion de pedidos
│   │   ├── inventario/         # Gestion de inventario
│   │   ├── catalogo/           # Gestion de productos
│   │   ├── clientes/           # Gestion de clientes
│   │   ├── accounting/         # Facturacion
│   │   ├── finanzas/           # Finanzas
│   │   ├── reportes/           # Reportes
│   │   ├── compras/            # Proveedores
│   │   ├── logistica/          # Envios
│   │   ├── usuarios/           # Usuarios
│   │   ├── cupones/            # Cupones
│   │   ├── comunicaciones/     # WhatsApp + Push
│   │   ├── analytics/          # Analytics basico
│   │   ├── analytics-avanzado/ # CLV, cohortes, etc.
│   │   ├── blog/               # Blog
│   │   ├── devoluciones/       # RMA
│   │   ├── calidad/            # Control de calidad
│   │   └── auditoria/          # Logs
│   └── api/v1/                 # 75 endpoints API
├── components/
│   ├── catalogo/               # ProductForm, tabs, previews
│   ├── ui/                     # Componentes compartidos
│   └── notifications/          # NotificationBell
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── billing/                # Nubefact, IGV, PDF
│   ├── orders.ts               # Transiciones de estado
│   └── ...                     # Otras utilidades
└── middleware.ts                # Auth + CORS
```

---

## 14. Estructura de Directorios Tienda

```
tienda/src/
├── app/
│   ├── (public)/               # Paginas publicas
│   │   ├── tienda/             # Catalogo
│   │   ├── producto/[slug]/    # Detalle producto
│   │   ├── carrito/            # Carrito
│   │   ├── checkout/           # Checkout
│   │   ├── pedido/             # Seguimiento
│   │   ├── faq/                # Preguntas frecuentes
│   │   ├── blog/               # Blog
│   │   └── login/registro/     # Auth
│   ├── api/v1/                 # 15 endpoints API
│   ├── sitemap.ts              # Sitemap dinamico
│   ├── robots.ts               # Reglas de crawlers
│   └── feed.xml/               # RSS feed
├── components/
│   ├── checkout/               # CheckoutModal, MercadoPago
│   ├── geo/                    # Schema.org components
│   ├── layout/                 # Navbar, Footer
│   └── ui/                     # Componentes compartidos
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── search-synonyms.ts      # Sinonimos de busqueda
│   └── geo/                    # Knowledge graph, guides
└── middleware.ts                # Auth
```

---

## 15. Notas para el Desarrollador

### Importante:
1. El WMS y Tienda comparten la misma base de datos pero tienen schemas de Prisma diferentes
2. La tienda obtiene productos del WMS via API interna (no directo a la DB)
3. Los archivos de landing page se guardan en disco (`public/landings/`), no en la DB
4. El deploy en EasyPanel usa Dockerfiles separados, no docker-compose
5. El WMS usa `output: 'standalone'` en Next.js, el CMD debe ser `node .next/standalone/server.js`

### Bugs conocidos:
1. Picking/packing no persisten progreso al recargar (estado en React)
2. Las imagenes usan `<img>` en vez de `<Image>` de Next.js
3. Hay console.log en produccion que deberian eliminarse
4. El componente `CrossSellProductItem` en OffersTab.tsx es dead code

### Proximo paso sugerido:
1. Configurar WhatsApp Business API para chatbot real
2. Integrar Google Analytics 4 y Meta Pixel
3. Persistir progreso de picking/packing via API
4. Agregar tests unitarios (cobertura actual ~30%)
5. Configurar HTTPS con Let's Encrypt en Nginx

---

## 16. Contactos

- **Desarrollador**: Chris (00chris0099)
- **Repositorio**: https://github.com/00chris0099/adrisu
- **Produccion WMS**: https://tiendavirtual-adrisuestesiwms.jpq6em.easypanel.host
- **Produccion Tienda**: https://tiendavirtual-tiendaadrisuk.jpq6em.easypanel.host

---

*Documento generado automaticamente como parte del handoff del proyecto ADRISU KIDS.*
