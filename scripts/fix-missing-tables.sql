-- ============================================================
-- FIX: Agregar tablas y columnas faltantes al schema de BD
-- Ejecutar contra la base de datos adriskids
-- ============================================================

-- 1. Agregar columnas faltantes a products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "model" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "short_description" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "height" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "width" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "depth" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "materials" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "recommended_age" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "warranty_days" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "origin_country" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight_unit" TEXT DEFAULT 'kg';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "low_stock_alert" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "compare_at_price" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "cost_price" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "discount_percent" DECIMAL(5,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "barcode" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP(3);

-- 2. Crear tabla offers (NO existente)
CREATE TABLE IF NOT EXISTS "offers" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'quantity',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,
    "linked_product_id" UUID,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- 3. Crear tabla suggested_products (NO existente)
CREATE TABLE IF NOT EXISTS "suggested_products" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "compare_at_price" DECIMAL(10,2),
    "discount_percent" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "type" TEXT NOT NULL DEFAULT 'custom',
    "linked_product_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggested_products_pkey" PRIMARY KEY ("id")
);

-- 4. Crear tabla wishlists (NO existente)
CREATE TABLE IF NOT EXISTS "wishlists" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- 5. Crear tabla newsletter_subscribers (NO existente)
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- 6. Crear tabla abandoned_checkouts (NO existente)
CREATE TABLE IF NOT EXISTS "abandoned_checkouts" (
    "id" UUID NOT NULL,
    "session_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shipping_address" JSONB NOT NULL DEFAULT '{}',
    "payment_method" TEXT,
    "status" TEXT NOT NULL DEFAULT 'abandoned',
    "recovered_at" TIMESTAMP(3),
    "converted_at" TIMESTAMP(3),
    "order_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abandoned_checkouts_pkey" PRIMARY KEY ("id")
);

-- 7. Crear tabla tax_configs (NO existente)
CREATE TABLE IF NOT EXISTS "tax_configs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_configs_pkey" PRIMARY KEY ("id")
);

-- 8. Agregar columnas faltantes a customers
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "customer_type" TEXT NOT NULL DEFAULT 'individual';
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "company_name" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "tax_id" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "billing_address" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "shipping_address" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "price_list_id" UUID;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "credit_limit" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "current_balance" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- 9. Agregar columnas faltantes a orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'store';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "billing_address" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "internal_notes" TEXT;

-- 10. Agregar columnas faltantes a order_items
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "product_id" UUID;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- 11. Agregar columnas faltantes a notification_queue
ALTER TABLE "notification_queue" ADD COLUMN IF NOT EXISTS "recipient_id" UUID;
ALTER TABLE "notification_queue" ADD COLUMN IF NOT EXISTS "recipient_email" TEXT;
ALTER TABLE "notification_queue" ADD COLUMN IF NOT EXISTS "channel" TEXT;
ALTER TABLE "notification_queue" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'info';
ALTER TABLE "notification_queue" ADD COLUMN IF NOT EXISTS "is_read" BOOLEAN NOT NULL DEFAULT false;

-- 12. Agregar columnas faltantes a suppliers
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "address" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "payment_terms" TEXT;
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "lead_time_days" INTEGER NOT NULL DEFAULT 7;

-- 13. Agregar columnas faltantes a purchase_orders
CREATE TABLE IF NOT EXISTS "purchase_orders" (
    "id" UUID NOT NULL,
    "po_number" TEXT NOT NULL,
    "supplier_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "ordered_by" UUID,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expected_date" TIMESTAMP(3),
    "received_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "purchase_order_items" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "received_quantity" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "goods_receipts" (
    "id" UUID NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "purchase_order_id" UUID,
    "warehouse_id" UUID NOT NULL,
    "received_by" UUID,
    "supplier_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "goods_receipt_items" (
    "id" UUID NOT NULL,
    "goods_receipt_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "expected_quantity" INTEGER NOT NULL,
    "received_quantity" INTEGER NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'good',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goods_receipt_items_pkey" PRIMARY KEY ("id")
);

-- 14. Tabla price_lists
CREATE TABLE IF NOT EXISTS "price_lists" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "price_list_items" (
    "id" UUID NOT NULL,
    "price_list_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_list_items_pkey" PRIMARY KEY ("id")
);

-- 15. Crear indices
CREATE INDEX IF NOT EXISTS "offers_product_id_idx" ON "offers"("product_id");
CREATE INDEX IF NOT EXISTS "suggested_products_product_id_idx" ON "suggested_products"("product_id");
CREATE INDEX IF NOT EXISTS "wishlists_customer_id_idx" ON "wishlists"("customer_id");
CREATE INDEX IF NOT EXISTS "wishlists_product_id_idx" ON "wishlists"("product_id");

-- Unique indices
CREATE UNIQUE INDEX IF NOT EXISTS "wishlists_customer_id_product_id_key" ON "wishlists"("customer_id", "product_id");
CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "price_lists_code_key" ON "price_lists"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "price_list_items_price_list_id_product_id_min_quantity_key" ON "price_list_items"("price_list_id", "product_id", "min_quantity");
CREATE UNIQUE INDEX IF NOT EXISTS "purchase_orders_po_number_key" ON "purchase_orders"("po_number");
CREATE UNIQUE INDEX IF NOT EXISTS "goods_receipts_receipt_number_key" ON "goods_receipts"("receipt_number");

-- 16. Agregar foreign keys para las tablas nuevas
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "suggested_products" ADD CONSTRAINT "suggested_products_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_customer_id_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey"
    FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_warehouse_id_fkey"
    FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_ordered_by_fkey"
    FOREIGN KEY ("ordered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey"
    FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_purchase_order_id_fkey"
    FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_warehouse_id_fkey"
    FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_received_by_fkey"
    FOREIGN KEY ("received_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_supplier_id_fkey"
    FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_goods_receipt_id_fkey"
    FOREIGN KEY ("goods_receipt_id") REFERENCES "goods_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_price_list_id_fkey"
    FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customers" ADD CONSTRAINT "customers_price_list_id_fkey"
    FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notification_queue" ADD CONSTRAINT "notification_queue_recipient_id_fkey"
    FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
