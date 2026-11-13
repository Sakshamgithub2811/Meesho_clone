// frontend/src/services/ecommerceService.js
import { API_V1_BASE } from '../config/apiConfig';

const API_BASE_URL = API_V1_BASE;

export function getCustomerId() {
  try {
    // 1. Prioritize real authenticated user IDs (non-dummy, non-affiliate_ prefix)
    for (const key of ['mshoppy_customer_user', 'mshoppy_reseller_user', 'user', 'mshoppy_affiliate_user']) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        const candidate = parsed?.id || parsed?.uid;
        if (candidate && !String(candidate).startsWith('affiliate_') && !String(candidate).startsWith('guest_')) {
          return candidate;
        }
      }
    }
    // 2. Fallback to any user key if only prefixed is available
    for (const key of ['mshoppy_customer_user', 'mshoppy_affiliate_user', 'mshoppy_reseller_user', 'user']) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) return parsed.id;
        if (parsed?.uid) return parsed.uid;
      }
    }
  } catch (e) {}

  let guestId = localStorage.getItem('mshoppy_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('mshoppy_guest_id', guestId);
  }
  return guestId;
}

export function getAuthHeaders() {
  const token = localStorage.getItem('mshoppy_customer_token');
  const userId = getCustomerId();
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const rawUser = localStorage.getItem('mshoppy_customer_user') || localStorage.getItem('user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u?.email && !u.email.endsWith('@customer.meesho')) {
        headers['x-user-email'] = u.email;
      }
    }
  } catch (e) {}
  return headers;
}

// ── Products API ──────────────────────────────────────────────
export async function getProducts(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.minPrice) query.set('minPrice', params.minPrice);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', params.page);
    if (params.all) {
      query.set('all', 'true');
    } else if (params.limit) {
      query.set('limit', params.limit);
    } else {
      query.set('limit', '24');
    }

    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
    const json = await res.json();

    if (params.withMeta) {
      return {
        products: json?.data || [],
        total: json?.total || 0,
        page: json?.page || Number(params.page || 1),
        totalPages: json?.totalPages || 1,
        hasMore: json?.hasMore ?? ((json?.data?.length || 0) === Number(params.limit || 24))
      };
    }

    return json?.data || [];
  } catch (error) {
    console.error('Failed to fetch products from database:', error);
    if (params.withMeta) {
      return { products: [], total: 0, page: 1, totalPages: 0, hasMore: false };
    }
    return [];
  }
}

export async function getProductById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null;
  }
}

export async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function getCategoryBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/${slug}`);
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch category ${slug}:`, error);
    return null;
  }
}

export async function getBanners() {
  try {
    const res = await fetch(`${API_BASE_URL}/banners/active`);
    if (res.ok) {
      const data = await res.json();
      if (data?.data && data.data.length > 0) return data.data;
    }
    const fallbackRes = await fetch(`${API_BASE_URL}/banners`);
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      return fallbackData?.data || [];
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch banners:', error);
    return [];
  }
}

export async function createProduct(productData) {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      return {
        success: false,
        message: `Server returned status ${res.status}: ${text.slice(0, 120)}`
      };
    }
    return data;
  } catch (error) {
    console.error('Failed to create product:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteProduct(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { success: false, message: error.message };
  }
}


// ── Cart Local Cache & Fallback Helpers ─────────────────────────
export function getLocalCart() {
  try {
    const raw = localStorage.getItem('mshoppy_local_cart');
    if (raw) {
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        const totalItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
        const subtotal = items.reduce(
          (sum, item) => sum + (Number(item.product?.price || item.price || 0) * (Number(item.quantity) || 1)),
          0
        );
        const originalSubtotal = items.reduce(
          (sum, item) =>
            sum +
            (Number(item.product?.originalPrice || item.originalPrice || item.product?.price || item.price || 0) *
              (Number(item.quantity) || 1)),
          0
        );
        return {
          items,
          totalItems,
          subtotal,
          originalSubtotal,
          totalDiscount: Math.max(0, originalSubtotal - subtotal),
          deliveryFee: 0,
        };
      }
    }
  } catch (e) {}
  return { items: [], totalItems: 0, subtotal: 0, originalSubtotal: 0, totalDiscount: 0, deliveryFee: 0 };
}

export function saveLocalCart(items, notify = true) {
  try {
    const list = Array.isArray(items) ? items : (items?.items || []);
    localStorage.setItem('mshoppy_local_cart', JSON.stringify(list));
    if (notify && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mshoppy-cart-changed'));
    }
  } catch (e) {}
}

// ── Cart API (Hybrid PostgreSQL with Resilient Local Fallback) ───
export async function getCart() {
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        saveLocalCart(data.items, false);
        return data;
      }
    }
  } catch (error) {
    console.warn('API getCart unreachable, using local storage fallback:', error);
  }
  return getLocalCart();
}

export async function addToCart(productId, quantity = 1, size = 'Free Size', productData = null) {
  let apiSuccess = false;
  let apiResult = null;

  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity, size }),
    });
    if (res.ok) {
      apiResult = await res.json();
      if (apiResult?.success) {
        apiSuccess = true;
      }
    }
  } catch (error) {
    console.warn('API addToCart network issue, persisting in local cart:', error);
  }

  // Always update local cart state so UI is instantly responsive & offline-safe
  const local = getLocalCart();
  const items = [...local.items];
  const existingIdx = items.findIndex(
    (i) => (i.productId === productId || i.id === productId || i.product?.id === productId) && (i.size === size || !size)
  );

  let fullProduct = productData;
  if (!fullProduct) {
    try {
      const cached = JSON.parse(localStorage.getItem('mshoppy_cached_catalog_prods') || '[]');
      fullProduct = cached.find((p) => p.id === productId) || null;
    } catch (e) {}
  }

  if (existingIdx > -1) {
    items[existingIdx].quantity = (Number(items[existingIdx].quantity) || 1) + Number(quantity);
    if (fullProduct && !items[existingIdx].product) {
      items[existingIdx].product = fullProduct;
    }
  } else {
    items.unshift({
      id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      productId,
      quantity: Number(quantity) || 1,
      size: size || 'Free Size',
      product: fullProduct || { id: productId, title: 'Item in Cart', price: 0 },
      createdAt: new Date().toISOString(),
    });
  }

  saveLocalCart(items);

  if (apiSuccess && apiResult) {
    return apiResult;
  }

  return {
    success: true,
    message: 'Product added to cart',
    isLocal: true,
    items,
    totalItems: items.reduce((s, i) => s + (Number(i.quantity) || 1), 0),
  };
}

export async function updateCartItem(itemId, quantity, size) {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity, size }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success) {
        const local = getLocalCart();
        const items = local.items.map((i) =>
          i.id === itemId || i.productId === itemId ? { ...i, quantity, size: size || i.size } : i
        );
        saveLocalCart(items);
        return data;
      }
    }
  } catch (error) {
    console.warn('API updateCartItem fallback to local:', error);
  }

  const local = getLocalCart();
  const items = local.items.map((i) =>
    i.id === itemId || i.productId === itemId ? { ...i, quantity, size: size || i.size } : i
  );
  saveLocalCart(items);
  return { success: true, message: 'Cart updated' };
}

export async function removeFromCart(itemId) {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      const local = getLocalCart();
      const items = local.items.filter((i) => i.id !== itemId && i.productId !== itemId);
      saveLocalCart(items);
      return data;
    }
  } catch (error) {
    console.warn('API removeFromCart fallback to local:', error);
  }

  const local = getLocalCart();
  const items = local.items.filter((i) => i.id !== itemId && i.productId !== itemId);
  saveLocalCart(items);
  return { success: true, message: 'Item removed from cart' };
}

export async function clearCart() {
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    saveLocalCart([]);
    if (res.ok) return await res.json();
  } catch (error) {
    console.warn('API clearCart fallback to local:', error);
  }
  saveLocalCart([]);
  return { success: true, message: 'Cart cleared' };
}

// ── Wishlist Local Cache & Fallback Helpers ──────────────────────
export function getLocalWishlist() {
  try {
    const raw = localStorage.getItem('mshoppy_wishlist');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveLocalWishlist(items, notify = true) {
  try {
    const list = Array.isArray(items) ? items : [];
    localStorage.setItem('mshoppy_wishlist', JSON.stringify(list));
    if (notify && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mshoppy-wishlist-changed'));
    }
  } catch (e) {}
}

// ── Wishlist API (Hybrid PostgreSQL with Resilient Sync) ─────────
export async function getWishlist() {
  try {
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        const local = getLocalWishlist();
        const mergedMap = new Map();
        data.data.forEach((item) => mergedMap.set(item.productId || item.id, item));
        local.forEach((item) => {
          const key = item.productId || item.id;
          if (!mergedMap.has(key)) mergedMap.set(key, item);
        });
        const merged = Array.from(mergedMap.values());
        saveLocalWishlist(merged, false);
        return merged;
      }
    }
  } catch (error) {
    console.warn('API getWishlist unreachable, using local wishlist:', error);
  }
  return getLocalWishlist();
}

export async function toggleWishlist(productId, productData = null) {
  // 1. Optimistic update in local cache
  const local = getLocalWishlist();
  const existingIdx = local.findIndex(
    (item) => item.productId === productId || item.id === productId || item.product?.id === productId
  );

  let action = 'added';
  if (existingIdx > -1) {
    local.splice(existingIdx, 1);
    action = 'removed';
  } else {
    let fullProd = productData;
    if (!fullProd) {
      try {
        const cached = JSON.parse(localStorage.getItem('mshoppy_cached_catalog_prods') || '[]');
        fullProd = cached.find((p) => p.id === productId) || null;
      } catch (e) {}
    }
    local.unshift({
      id: 'wish_' + productId,
      productId,
      product: fullProd || { id: productId, title: 'Saved Item' },
      createdAt: new Date().toISOString(),
    });
    action = 'added';
  }

  saveLocalWishlist(local);

  // 2. Synchronize to Database
  try {
    const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.warn('API toggleWishlist fallback to local:', error);
  }

  return {
    success: true,
    action,
    message: action === 'added' ? 'Added to wishlist' : 'Removed from wishlist',
    isLocal: true,
  };
}

// ── Orders API ────────────────────────────────────────────────
export async function getOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
}

export async function getOrderById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch order ${id}:`, error);
    return null;
  }
}

export async function createOrder({ items, shippingAddress, paymentMethod, totalAmount, couponCode, referralCode, customerEmail }) {
  try {
    const savedRef = referralCode || (typeof window !== 'undefined' ? localStorage.getItem('mshoppy_referral_code') : undefined) || undefined;
    let emailToSend = customerEmail;
    if (!emailToSend && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('mshoppy_customer_user') || localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.email && !u.email.endsWith('@customer.meesho')) emailToSend = u.email;
        }
      } catch (e) {}
    }
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        items,
        shippingAddress,
        paymentMethod,
        totalAmount,
        couponCode,
        referralCode: savedRef,
        customerEmail: emailToSend
      }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}

export async function cancelOrder(orderId, reason = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Failed to cancel order ${orderId}:`, error);
    throw error;
  }
}

export async function submitReturnRequest(payload) {
  try {
    // Ensure images are formatted cleanly as string URLs/names
    const formattedPayload = {
      ...payload,
      images: Array.isArray(payload.images)
        ? payload.images.map((img) => (typeof img === 'string' ? img : img?.url || img?.name || '')).filter(Boolean)
        : []
    };

    const res = await fetch(`${API_BASE_URL}/returns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formattedPayload),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to submit return request:', error);
    return { success: false, message: error.message };
  }
}




// ── Addresses API (100% PostgreSQL Database Driven) ─────────────
export async function getAddresses() {
  try {
    const res = await fetch(`${API_BASE_URL}/addresses`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data?.data || [];
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch addresses from database:', error);
    return [];
  }
}

export async function saveAddress(addressData) {
  try {
    const res = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });
    const data = await res.json();
    if (!res.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to save address to database');
    }
    return data;
  } catch (error) {
    console.error('saveAddress server error:', error);
    throw error;
  }
}

export async function deleteAddress(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to delete address from database');
    }
    return data;
  } catch (error) {
    console.error(`Failed to delete address ${id}:`, error);
    throw error;
  }
}

// ── Reviews API ───────────────────────────────────────────────
export async function getProductReviews(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch reviews for product ${productId}:`, error);
    return null;
  }
}

export async function checkCanReview(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/can-review/${productId}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data?.data || { canReview: false, hasDeliveredOrder: false, hasReviewed: false };
  } catch (error) {
    console.error(`Failed to check review eligibility for ${productId}:`, error);
    return { canReview: false, hasDeliveredOrder: false, hasReviewed: false };
  }
}

export async function submitReview({ productId, rating, title, comment, images }) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, rating, title, comment, images }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to submit review:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (error) {
    console.error(`Failed to update status for order ${orderId}:`, error);
    throw error;
  }
}

// ── Coupons API ────────────────────────────────────────────────
export async function getActiveCoupons() {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons`);
    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return [];
  }
}

export async function validateCoupon(code, cartTotal) {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartTotal }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to validate coupon:', error);
    return {
      success: false,
      valid: false,
      message: error.message || 'Network error validating coupon'
    };
  }
}

export async function generateNewCoupon(payload = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to generate coupon:', error);
    return {
      success: false,
      message: error.message || 'Network error generating coupon'
    };
  }
}

// ── Review Helpful API ────────────────────────────────────────
export async function toggleReviewHelpful(reviewId) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error(`Failed to vote helpful on review ${reviewId}:`, error);
    throw error;
  }
}

// ── Flash Sale Active Configuration API ───────────────────────
export async function getFlashSaleConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/flash-sale/active`);
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error('Failed to fetch flash sale config from backend:', error);
    return null;
  }
}

// ── Razorpay Payment Gateway API ──────────────────────────────
export async function getRazorpayConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/payment/razorpay/config`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to get Razorpay config:', error);
    return { success: false, isConfigured: false };
  }
}

export async function createRazorpayOrder({ amount, currency = 'INR', receipt, notes }) {
  try {
    const res = await fetch(`${API_BASE_URL}/payment/razorpay/create-order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, currency, receipt, notes }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    return { success: false, message: error.message };
  }
}

export async function verifyRazorpayPayment(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/payment/razorpay/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to verify Razorpay payment:', error);
    return { success: false, message: error.message };
  }
}

// ── Real PostgreSQL Wallet & Payout API ───────────────────────────
export async function getWalletDetails() {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error('Failed to fetch wallet:', error);
    return null;
  }
}

export async function requestWalletWithdrawal({ amount, method, destination }) {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, method, destination }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to request withdrawal:', error);
    return { success: false, message: error.message };
  }
}

