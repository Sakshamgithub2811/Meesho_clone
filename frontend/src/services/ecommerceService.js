// frontend/src/services/ecommerceService.js

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

export function getCustomerId() {
  try {
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


// ── Cart API ──────────────────────────────────────────────────
export async function getCart() {
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.items) {
        try {
          localStorage.setItem('mshoppy_local_cart', JSON.stringify(data.items));
        } catch (e) {}
      }
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch cart:', error);
  }

  // Resilient fallback to local cart cache
  try {
    const localItems = JSON.parse(localStorage.getItem('mshoppy_local_cart') || '[]');
    const totalItems = localItems.reduce((s, i) => s + (i.quantity || 1), 0);
    const subtotal = localItems.reduce((s, i) => s + ((i.product?.price || 0) * (i.quantity || 1)), 0);
    return {
      items: localItems,
      totalItems,
      subtotal,
      deliveryFee: 0,
      isLocalCache: true
    };
  } catch (e) {
    return { items: [], totalItems: 0, subtotal: 0, deliveryFee: 0 };
  }
}

export async function addToCart(productId, quantity = 1, size = 'Free Size') {
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity, size }),
    });
    const data = await res.json();
    if (data?.item) {
      try {
        const local = JSON.parse(localStorage.getItem('mshoppy_local_cart') || '[]');
        const idx = local.findIndex(i => i.productId === productId && i.size === size);
        if (idx >= 0) local[idx] = data.item;
        else local.unshift(data.item);
        localStorage.setItem('mshoppy_local_cart', JSON.stringify(local));
      } catch (e) {}
    }
    return data;
  } catch (error) {
    console.warn('API addToCart offline/fallback, updating local cache:', error);
    try {
      const local = JSON.parse(localStorage.getItem('mshoppy_local_cart') || '[]');
      const idx = local.findIndex(i => i.productId === productId && i.size === size);
      if (idx >= 0) {
        local[idx].quantity += quantity;
      } else {
        local.unshift({
          id: 'cart_loc_' + Date.now(),
          productId,
          quantity,
          size,
          product: { id: productId, price: 0 }
        });
      }
      localStorage.setItem('mshoppy_local_cart', JSON.stringify(local));
    } catch (e) {}
    return { success: true, isLocal: true };
  }
}

export async function updateCartItem(itemId, quantity, size) {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity, size }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to update cart item:', error);
    throw error;
  }
}

export async function removeFromCart(itemId) {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    throw error;
  }
}

export async function clearCart() {
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to clear cart:', error);
    throw error;
  }
}

// ── Wishlist API ──────────────────────────────────────────────
export async function getWishlist() {
  try {
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      const items = data?.data || [];
      try {
        localStorage.setItem('mshoppy_wishlist', JSON.stringify(items.map(i => i.productId || i.id)));
      } catch (e) {}
      return items;
    }
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
  }

  // Graceful local cache fallback
  try {
    const storedIds = JSON.parse(localStorage.getItem('mshoppy_wishlist') || '[]');
    return storedIds.map(id => ({ productId: id, id }));
  } catch (e) {
    return [];
  }
}

export async function toggleWishlist(productId) {
  // Optimistically toggle in localStorage
  let isAdded = false;
  try {
    const storedIds = JSON.parse(localStorage.getItem('mshoppy_wishlist') || '[]');
    const idx = storedIds.indexOf(productId);
    if (idx >= 0) {
      storedIds.splice(idx, 1);
      isAdded = false;
    } else {
      storedIds.push(productId);
      isAdded = true;
    }
    localStorage.setItem('mshoppy_wishlist', JSON.stringify(storedIds));
  } catch (e) {}

  try {
    const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('API toggleWishlist fallback:', error);
    return { success: true, action: isAdded ? 'added' : 'removed', isLocal: true };
  }
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

export async function createOrder({ items, shippingAddress, paymentMethod, totalAmount, couponCode, referralCode }) {
  try {
    const savedRef = referralCode || (typeof window !== 'undefined' ? localStorage.getItem('mshoppy_referral_code') : undefined) || undefined;
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items, shippingAddress, paymentMethod, totalAmount, couponCode, referralCode: savedRef }),
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




// ── Addresses API ─────────────────────────────────────────────
export async function getAddresses() {
  let serverAddrs = [];
  try {
    const res = await fetch(`${API_BASE_URL}/addresses`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      serverAddrs = data?.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
  }

  let localAddrs = [];
  try {
    localAddrs = JSON.parse(localStorage.getItem('mshoppy_saved_addresses') || '[]');
  } catch (e) {}

  const merged = [...serverAddrs];
  for (const loc of localAddrs) {
    if (!merged.some(m => m.id === loc.id || (m.fullName === loc.fullName && m.pincode === loc.pincode))) {
      merged.push(loc);
    }
  }

  try {
    localStorage.setItem('mshoppy_saved_addresses', JSON.stringify(merged));
  } catch (e) {}

  return merged;
}

export async function saveAddress(addressData) {
  try {
    const res = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data) {
        try {
          const stored = JSON.parse(localStorage.getItem('mshoppy_saved_addresses') || '[]');
          localStorage.setItem('mshoppy_saved_addresses', JSON.stringify([data.data, ...stored.filter(a => a.id !== data.data.id)]));
        } catch (e) {}
        return data;
      }
    }
  } catch (error) {
    console.warn('saveAddress server error, saving locally:', error);
  }

  // Resilient fallback local save
  const localRecord = {
    ...addressData,
    id: 'addr_loc_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  try {
    const stored = JSON.parse(localStorage.getItem('mshoppy_saved_addresses') || '[]');
    localStorage.setItem('mshoppy_saved_addresses', JSON.stringify([localRecord, ...stored]));
  } catch (e) {}

  return {
    success: true,
    message: 'Address saved locally',
    data: localRecord,
    isLocal: true
  };
}

export async function deleteAddress(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
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

