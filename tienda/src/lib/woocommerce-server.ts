// ============================================================
// WooCommerce REST API Client (Server-side only)
// Use in: API routes, Server Components, getServerSideProps
// NEVER import in client components (exposes API credentials)
// ============================================================

import type {
  WooProduct,
  WooProductCategory,
  WooProductVariation,
  TiendaProduct,
  TiendaCategory,
} from './woo-types';

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-store.com';
const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

const WC_BASE = `${WP_URL}/wp-json/wc/v3`;

/** Build auth params for WooCommerce REST API */
function authParams(): string {
  const params = new URLSearchParams();
  params.set('consumer_key', WC_KEY);
  params.set('consumer_secret', WC_SECRET);
  return params.toString();
}

/** Generic fetch wrapper with auth + error handling */
async function wcFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  revalidate: number = 60
): Promise<T> {
  const url = new URL(`${WC_BASE}${endpoint}`);
  // Append auth as query params (WooCommerce supports this for read operations)
  for (const [k, v] of new URLSearchParams(authParams())) {
    url.searchParams.set(k, v);
  }

  // Merge any existing search params from the endpoint
  // (endpoint might already contain query params)

  const res = await fetch(url.toString(), {
    ...options,
    next: { revalidate },
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WooCommerce API ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/** Get pagination headers from a WooCommerce response */
function getPaginationHeaders(res: Response) {
  return {
    total: parseInt(res.headers.get('X-WP-Total') || '0', 10),
    totalPages: parseInt(res.headers.get('X-WP-TotalPages') || '0', 10),
  };
}

// ============================================================
// Product Functions
// ============================================================

/** Fetch products with filtering/pagination */
export async function getProducts(params: {
  search?: string;
  category?: string;
  perPage?: number;
  page?: number;
  orderby?: string;
  order?: string;
  status?: string;
} = {}): Promise<{ products: TiendaProduct[]; total: number; totalPages: number }> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.category) {
    // WooCommerce expects category ID, not slug
    // We'll resolve the category slug to ID first if needed
    searchParams.set('category', params.category);
  }
  searchParams.set('per_page', String(params.perPage || 50));
  searchParams.set('page', String(params.page || 1));
  searchParams.set('orderby', params.orderby || 'date');
  searchParams.set('order', params.order || 'desc');
  if (params.status) searchParams.set('status', params.status);
  else searchParams.set('status', 'publish'); // Only published products

  const url = `/products?${searchParams.toString()}`;

  // We need to get the raw response to read headers
  const fullUrl = new URL(`${WC_BASE}${url}`);
  for (const [k, v] of new URLSearchParams(authParams())) {
    fullUrl.searchParams.set(k, v);
  }

  const res = await fetch(fullUrl.toString(), {
    next: { revalidate: 60 },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    return { products: [], total: 0, totalPages: 0 };
  }

  const data: WooProduct[] = await res.json();
  const { total, totalPages } = getPaginationHeaders(res);

  return {
    products: data.map(transformProduct),
    total,
    totalPages,
  };
}

/** Fetch a single product by slug */
export async function getProductBySlug(slug: string): Promise<TiendaProduct | null> {
  try {
    const products = await wcFetch<WooProduct[]>(
      `/products?slug=${encodeURIComponent(slug)}&status=publish&per_page=1`
    );
    if (!products.length) return null;
    return transformProduct(products[0]);
  } catch {
    return null;
  }
}

/** Fetch a single product by ID */
export async function getProductById(id: number): Promise<TiendaProduct | null> {
  try {
    const product = await wcFetch<WooProduct>(`/products/${id}`);
    return transformProduct(product);
  } catch {
    return null;
  }
}

/** Fetch product variations */
export async function getProductVariations(productId: number): Promise<WooProductVariation[]> {
  try {
    return await wcFetch<WooProductVariation[]>(
      `/products/${productId}/variations?per_page=100`
    );
  } catch {
    return [];
  }
}

// ============================================================
// Category Functions
// ============================================================

/** Fetch all product categories */
export async function getCategories(): Promise<TiendaCategory[]> {
  try {
    const categories = await wcFetch<WooProductCategory[]>(
      '/products/categories?per_page=100&hide_empty=false'
    );

    // Transform and build tree
    const flat = categories.map(transformCategory);
    return buildCategoryTree(flat);
  } catch {
    return [];
  }
}

/** Fetch a single category by slug */
export async function getCategoryBySlug(slug: string): Promise<TiendaCategory | null> {
  try {
    const categories = await wcFetch<WooProductCategory[]>(
      `/products/categories?slug=${encodeURIComponent(slug)}&per_page=1`
    );
    if (!categories.length) return null;
    return transformCategory(categories[0]);
  } catch {
    return null;
  }
}

// ============================================================
// Transform functions: WooCommerce → our internal format
// ============================================================

/** Transform a WooCommerce product to TiendaProduct */
function transformProduct(p: WooProduct): TiendaProduct {
  // Extract custom meta fields (brand, color, materials, etc.)
  const meta = p.meta_data || [];
  const getMeta = (key: string) => meta.find((m) => m.key === key)?.value;

  // Calculate discount and final price
  const basePrice = parseFloat(p.regular_price) || parseFloat(p.price) || 0;
  const salePrice = parseFloat(p.sale_price) || 0;
  const compareAtPrice = p.on_sale && basePrice > salePrice ? basePrice : null;
  const finalPrice = p.on_sale && salePrice > 0 ? salePrice : basePrice;
  const discountPercent = compareAtPrice
    ? Math.round((1 - finalPrice / compareAtPrice) * 100)
    : 0;

  return {
    id: String(p.id),
    sku: p.sku || '',
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    shortDescription: p.short_description || '',
    brand: getMeta('_brand') || getMeta('brand') || '',
    status: p.status,
    tags: (p.tags || []).map((t) => t.name),
    images: (p.images || [])
      .sort((a, b) => a.position - b.position)
      .map((img) => img.src),
    height: p.dimensions?.height ? parseFloat(p.dimensions.height) : null,
    width: p.dimensions?.width ? parseFloat(p.dimensions.width) : null,
    depth: p.dimensions?.length ? parseFloat(p.dimensions.length) : null,
    color: getMeta('_color') || getMeta('color') || '',
    materials: getMeta('_materials')
      ? (Array.isArray(getMeta('_materials')) ? getMeta('_materials') : [getMeta('_materials')])
      : [],
    recommendedAge: getMeta('_recommended_age') || getMeta('recommended_age') || '',
    warrantyDays: getMeta('_warranty_days') ? Number(getMeta('_warranty_days')) : null,
    originCountry: getMeta('_origin_country') || getMeta('origin_country') || '',
    weight: p.weight ? parseFloat(p.weight) : null,
    weightUnit: 'kg',
    lowStockAlert: getMeta('_low_stock_alert') ? Number(getMeta('_low_stock_alert')) : null,
    price: basePrice,
    compareAtPrice,
    finalPrice,
    discountPercent,
    stock: p.manage_stock ? (p.stock_quantity || 0) : (p.stock_status === 'instock' ? 999 : 0),
    barcode: p.sku || getMeta('_barcode') || '',
    category: p.categories?.length
      ? { name: p.categories[0].name, slug: p.categories[0].slug }
      : null,
    categoryId: p.categories?.length ? String(p.categories[0].id) : null,
    model: getMeta('_model') || getMeta('model') || '',
    createdAt: p.date_created,
    updatedAt: p.date_modified,
  };
}

/** Transform a WooCommerce category to TiendaCategory */
function transformCategory(c: WooProductCategory): TiendaCategory {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    imageUrl: c.image?.src || null,
    parentId: c.parent ? String(c.parent) : null,
    sortOrder: c.count || 0,
    isActive: true,
    _count: { products: c.count || 0 },
    children: [],
  };
}

/** Build a category tree from a flat array */
function buildCategoryTree(flat: TiendaCategory[]): TiendaCategory[] {
  const map = new Map<string, TiendaCategory>();
  const roots: TiendaCategory[] = [];

  // Create map
  for (const cat of flat) {
    map.set(cat.id, { ...cat, children: [] });
  }

  // Build tree
  for (const cat of flat) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ============================================================
// Helper: resolve category slug to WooCommerce category ID
// (WooCommerce REST API filters by category ID, not slug)
// ============================================================

/** Resolve a category slug to its WooCommerce numeric ID */
export async function resolveCategoryId(slug: string): Promise<string | null> {
  try {
    const categories = await wcFetch<WooProductCategory[]>(
      `/products/categories?slug=${encodeURIComponent(slug)}&per_page=1`
    );
    if (categories.length) return String(categories[0].id);
    return null;
  } catch {
    return null;
  }
}

export { authParams, WC_BASE, WP_URL };
