-- MIGRATION: Eliminate ProductVariant
-- Table names are lowercase (Prisma @@map)

-- Step 1: Add new columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Step 2: Migrate price/cost/barcode from first variant
UPDATE products p SET
  price = COALESCE(
    (SELECT v.price FROM product_variants v WHERE v.product_id = p.id ORDER BY v.created_at ASC LIMIT 1), 0),
  compare_at_price = (SELECT v.compare_at_price FROM product_variants v WHERE v.product_id = p.id ORDER BY v.created_at ASC LIMIT 1),
  cost_price = (SELECT v.cost_price FROM product_variants v WHERE v.product_id = p.id ORDER BY v.created_at ASC LIMIT 1),
  barcode = (SELECT v.barcode FROM product_variants v WHERE v.product_id = p.id ORDER BY v.created_at ASC LIMIT 1)
WHERE EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id);

-- Step 3: Migrate stock from inventory
UPDATE products p SET stock = COALESCE(
  (SELECT SUM(i.quantity) FROM inventory i JOIN product_variants v ON i.variant_id = v.id WHERE v.product_id = p.id), 0)
WHERE EXISTS (SELECT 1 FROM inventory i JOIN product_variants v ON i.variant_id = v.id WHERE v.product_id = p.id);

-- Step 3b: Also from product_variants.stock (tienda)
UPDATE products p SET stock = COALESCE(
  (SELECT SUM(v.stock) FROM product_variants v WHERE v.product_id = p.id), 0)
WHERE EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id) AND p.stock = 0;

-- Step 4: Extract discountPercent from price_config
UPDATE products p SET discount_percent = CAST(p.price_config->>'descuento' AS DECIMAL)
WHERE p.price_config IS NOT NULL
  AND p.price_config->>'descuento' IS NOT NULL
  AND p.price_config->>'descuento' != ''
  AND p.price_config->>'descuento' != '0';

-- Step 5: FIX DOUBLE-DISCOUNT BUG
UPDATE products p SET
  price = CASE
    WHEN p.discount_percent > 0 AND p.discount_percent < 100
    THEN ROUND(CAST(p.price AS DECIMAL) / (1 - p.discount_percent / 100), 2)
    ELSE p.price
  END
WHERE p.discount_percent IS NOT NULL AND p.discount_percent > 0 AND p.discount_percent < 100;

-- Step 6: Update FK references
CREATE TEMPORARY TABLE variant_product_map AS
SELECT id AS "variantId", product_id AS "productId" FROM product_variants;

UPDATE order_items oi SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE oi.variant_id = vpm."variantId" AND oi.variant_id IS NOT NULL;

UPDATE order_items SET variant_name = product_name WHERE variant_name IS NOT NULL AND variant_name != product_name;

UPDATE wishlists w SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE w.variant_id = vpm."variantId";

UPDATE price_list_items pli SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE pli.variant_id = vpm."variantId";

UPDATE purchase_order_items poi SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE poi.variant_id = vpm."variantId";

UPDATE goods_receipt_items gri SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE gri.variant_id = vpm."variantId";

UPDATE pick_list_items pli SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE pli.variant_id = vpm."variantId";

UPDATE return_items ri SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE ri.variant_id = vpm."variantId";

UPDATE cycle_count_items cci SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE cci.variant_id = vpm."variantId";

UPDATE lots l SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE l.variant_id = vpm."variantId";

UPDATE serial_numbers sn SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE sn.variant_id = vpm."variantId";

UPDATE quality_check_items qci SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE qci.variant_id = vpm."variantId";

UPDATE cart_items ci SET product_id = vpm."productId"
FROM variant_product_map vpm WHERE ci.variant_id = vpm."variantId";

UPDATE reviews SET variant_id = NULL WHERE variant_id IS NOT NULL;

-- Step 7: Verify
SELECT 'products' as tbl, COUNT(*) as cnt FROM products
UNION ALL SELECT 'variants', COUNT(*) FROM product_variants
UNION ALL SELECT 'order_items_with_product', COUNT(*) FROM order_items WHERE product_id IS NOT NULL
UNION ALL SELECT 'products_with_price', COUNT(*) FROM products WHERE price > 0;

-- Step 8: Drop old tables
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;

-- Step 9: Drop old columns
ALTER TABLE order_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE order_items DROP COLUMN IF EXISTS variant_name;
ALTER TABLE wishlists DROP COLUMN IF EXISTS variant_id;
ALTER TABLE price_list_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE purchase_order_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE goods_receipt_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE pick_list_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE return_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE cycle_count_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE lots DROP COLUMN IF EXISTS variant_id;
ALTER TABLE serial_numbers DROP COLUMN IF EXISTS variant_id;
ALTER TABLE quality_check_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE cart_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE reviews DROP COLUMN IF EXISTS variant_id;
ALTER TABLE products DROP COLUMN IF EXISTS price_config;
ALTER TABLE products DROP COLUMN IF EXISTS discount_popup;

DROP TABLE IF EXISTS variant_product_map;

SELECT 'Migration complete!' as status;
