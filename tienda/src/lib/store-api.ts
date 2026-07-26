// ============================================================
// WooCommerce Store API Client (Client-side safe)
// Use in: React components, client-side cart/checkout
// No API credentials needed - uses nonce-based sessions
// ============================================================

import type { WooStoreCart, WooStoreCartItem } from './woo-types';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-store.com';
const STORE_API_URL = `${WORDPRESS_URL}/wp-json/wc/store/v1`;

// Nonce management - cart session tracking
let currentNonce: string | null = null;

function getNonce(): string | null {
  if (typeof window !== 'undefined') {
    return currentNonce || localStorage.getItem('wc-store-nonce');
  }
  return currentNonce;
}

function setNonce(nonce: string) {
  currentNonce = nonce;
  if (typeof window !== 'undefined') {
    localStorage.setItem('wc-store-nonce', nonce);
  }
}

/** Generic Store API fetch with nonce management */
async function storeApiFetch<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const nonce = getNonce();

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(nonce ? { Nonce: nonce } : {}),
      ...headers,
    },
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${STORE_API_URL}${endpoint}`, config);

  // Store the nonce from every response
  const responseNonce = response.headers.get('Nonce');
  if (responseNonce) {
    setNonce(responseNonce);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Store API error: ${response.status}` }));
    throw new Error(error.message || `Store API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================
// Cart Operations
// ============================================================

/** Get the current cart */
export async function getCart(): Promise<WooStoreCart> {
  return storeApiFetch<WooStoreCart>('/cart');
}

/** Add an item to the cart */
export async function addToCart(
  productId: number,
  quantity: number = 1
): Promise<WooStoreCart> {
  return storeApiFetch<WooStoreCart>('/cart/add-item', {
    method: 'POST',
    body: {
      id: productId,
      quantity,
    },
  });
}

/** Update cart item quantity */
export async function updateCartItem(
  key: string,
  quantity: number
): Promise<WooStoreCart> {
  return storeApiFetch<WooStoreCart>('/cart/update-item', {
    method: 'POST',
    body: {
      key,
      quantity,
    },
  });
}

/** Remove an item from the cart */
export async function removeCartItem(key: string): Promise<WooStoreCart> {
  return storeApiFetch<WooStoreCart>('/cart/remove-item', {
    method: 'POST',
    body: { key },
  });
}

/** Clear the entire cart */
export async function clearCart(): Promise<WooStoreCart> {
  return storeApiFetch<WooStoreCart>('/cart/clear', {
    method: 'POST',
  });
}

/** Apply a coupon to the cart */
export async function applyCoupon(code: string): Promise<WooStoreCart> {
  return storeApiFetch<WooStoreCart>('/cart/coupons', {
    method: 'POST',
    body: { code },
  });
}

/** Remove a coupon from the cart */
export async function removeCoupon(code: string): Promise<WooStoreCart> {
  return storeApiFetch<WooStoreCart>(`/cart/coupons/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  });
}

// ============================================================
// Checkout
// ============================================================

/** Process checkout and create an order */
export async function processCheckout(checkoutData: {
  billing_address: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
    email: string;
  };
  shipping_address?: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
  };
  payment_method?: string;
  shipping_method?: string[];
  customer_note?: string;
}): Promise<{ redirect: string; orderId?: number }> {
  const result = await storeApiFetch<{ redirect: string; status: string }>(
    '/checkout',
    {
      method: 'POST',
      body: checkoutData,
    }
  );

  return {
    redirect: result.redirect,
  };
}

// ============================================================
// Utility
// ============================================================

/** Check if the Store API is available */
export async function checkStoreApiHealth(): Promise<boolean> {
  try {
    await storeApiFetch('/cart');
    return true;
  } catch {
    return false;
  }
}
