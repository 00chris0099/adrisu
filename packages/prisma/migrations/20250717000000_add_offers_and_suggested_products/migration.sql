-- Create offers table (was never migrated)
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

-- Create suggested_products table
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

-- CreateIndex for offers
CREATE INDEX IF NOT EXISTS "offers_product_id_idx" ON "offers"("product_id");

-- CreateIndex for suggested_products
CREATE INDEX IF NOT EXISTS "suggested_products_product_id_idx" ON "suggested_products"("product_id");

-- AddForeignKey for offers
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for suggested_products
ALTER TABLE "suggested_products" ADD CONSTRAINT "suggested_products_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
