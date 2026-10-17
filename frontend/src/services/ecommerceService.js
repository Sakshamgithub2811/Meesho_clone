// frontend/src/services/ecommerceService.js

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

export function getCustomerId() {
  try {
    const storedUser = localStorage.getItem('mshoppy_customer_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.id) return parsed.id;
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
    if (params.limit) query.set('limit', params.limit);

    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error('Failed to fetch products from database:', error);
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
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return { items: [], totalItems: 0, subtotal: 0 };
  }
}

export async function addToCart(productId, quantity = 1, size = 'Free Size') {
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity, size }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to add to cart:', error);
    throw error;
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
    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    return [];
  }
}

export async function toggleWishlist(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to toggle wishlist:', error);
    throw error;
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

export async function createOrder({ items, shippingAddress, paymentMethod, totalAmount }) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items, shippingAddress, paymentMethod, totalAmount }),
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



// ── Addresses API ─────────────────────────────────────────────
export async function getAddresses() {
  try {
    const res = await fetch(`${API_BASE_URL}/addresses`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
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
    return await res.json();
  } catch (error) {
    console.error('Failed to save address:', error);
    throw error;
  }
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


