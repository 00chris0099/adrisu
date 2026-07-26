// ============================================================
// WooCommerce REST API Types
// Docs: https://woocommerce.github.io/woocommerce-rest-api-docs/
// ============================================================

/** WooCommerce Product (from REST API v3) */
export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  status: 'publish' | 'pending' | 'private' | 'draft';
  featured: boolean;
  catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden';
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  stock_quantity: number | null;
  manage_stock: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  backorders: 'no' | 'notify' | 'yes';
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  images: WooProductImage[];
  categories: WooProductCategory[];
  tags: { id: number; name: string; slug: string }[];
  attributes: WooProductAttribute[];
  variations: number[];
  meta_data: { key: string; value: any }[];
}

/** WooCommerce Product Image */
export interface WooProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
  position: number;
}

/** WooCommerce Product Category */
export interface WooProductCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: 'default' | 'products' | 'subcategories' | 'both';
  image: {
    id: number;
    src: string;
    alt: string;
  } | null;
  count: number;
}

/** WooCommerce Product Attribute */
export interface WooProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

/** WooCommerce Product Variation */
export interface WooProductVariation {
  id: number;
  date_created: string;
  date_modified: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  status: 'publish' | 'pending' | 'private' | 'draft';
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  image: WooProductImage;
  attributes: {
    id: number;
    name: string;
    option: string;
  }[];
}

// ============================================================
// WooCommerce Store API Types (for client-side cart/checkout)
// Docs: https://github.com/woocommerce/woocommerce/tree/trunk/plugins/woocommerce/src/StoreApi
// ============================================================

/** Store API Cart Item */
export interface WooStoreCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  low_stock_remaining: number | null;
  is_in_stock: boolean;
  backorders_allowed: boolean;
  show_backorder_badge: boolean;
  links: {
    self: { href: string };
    collection: { href: string };
  };
  images: WooStoreItemImage[];
  prices: WooStoreItemPrices;
  totals: {
    line_subtotal: string;
    line_subtotal_tax: string;
    line_total: string;
    line_total_tax: string;
  };
}

/** Store API Cart Item Prices */
export interface WooStoreItemPrices {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
  raw_prices: {
    precision: number;
    price: string;
    regular_price: string;
    sale_price: string;
    currency_minor_unit: number;
  };
  extended_totals: {
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
  };
}

/** Store API Image */
export interface WooStoreItemImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

/** Store API Cart */
export interface WooStoreCart {
  currency: WooStoreCurrency;
  items: WooStoreCartItem[];
  items_count: number;
  items_weight: number;
  needs_payment: boolean;
  needs_shipping: boolean;
  shipping_address: WooStoreAddress;
  billing_address: WooStoreAddress;
  totals: {
    total_items: string;
    total_items_tax: string;
    total_fees: string;
    total_fees_tax: string;
    total_discount: string;
    total_discount_tax: string;
    total_shipping: string;
    total_shipping_tax: string;
    total_tax: string;
    total_price: string;
    tax_lines: any[];
  };
  coupons: any[];
  cross_sells: any[];
}

/** Store API Currency */
export interface WooStoreCurrency {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
}

/** Store API Address */
export interface WooStoreAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
}

/** Store API Checkout Response */
export interface WooStoreCheckout {
  order_id: number;
  status: string;
  order_key: string;
  redirect: string;
}

// ============================================================
// Transformed types (our internal format used by the tienda)
// ============================================================

/** Product in the format the tienda pages expect */
export interface TiendaProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  brand: string;
  status: string;
  tags: string[];
  images: string[];
  height: number | null;
  width: number | null;
  depth: number | null;
  color: string;
  materials: string[];
  recommendedAge: string;
  warrantyDays: number | null;
  originCountry: string;
  weight: number | null;
  weightUnit: string;
  lowStockAlert: number | null;
  price: number;
  compareAtPrice: number | null;
  finalPrice: number;
  discountPercent: number;
  stock: number;
  barcode: string;
  category: { name: string; slug: string } | null;
  categoryId: string | null;
  model: string;
  createdAt: string;
  updatedAt: string;
}

/** Category in the format the tienda pages expect */
export interface TiendaCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
  children?: TiendaCategory[];
}
