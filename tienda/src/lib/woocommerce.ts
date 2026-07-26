// ============================================================
// WooCommerce Integration - Barrel Export
// ============================================================

// Types
export type {
  WooProduct,
  WooProductImage,
  WooProductCategory,
  WooProductAttribute,
  WooProductVariation,
  WooStoreCartItem,
  WooStoreItemPrices,
  WooStoreItemImage,
  WooStoreCart,
  WooStoreCurrency,
  WooStoreAddress,
  WooStoreCheckout,
  TiendaProduct,
  TiendaCategory,
} from './woo-types';

// Server-side client (REST API with auth)
export {
  getProducts,
  getProductBySlug,
  getProductById,
  getProductVariations,
  getCategories,
  getCategoryBySlug,
  resolveCategoryId,
} from './woocommerce-server';

// Client-side client (Store API with nonce)
export {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  processCheckout,
} from './store-api';
