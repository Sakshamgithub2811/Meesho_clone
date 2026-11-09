import { useState, useEffect, useCallback } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
} from '../services/ecommerceService';

// Global in-memory cache and subscriber listeners for cross-component reactivity
let cachedCart = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  originalSubtotal: 0,
  totalDiscount: 0,
  deliveryFee: 0,
};
let isInitialFetched = false;
let isFetchingGlobal = false;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener({ ...cachedCart });
    } catch (e) {
      console.warn('Cart subscriber error:', e);
    }
  });
};

/**
 * Reset in-memory cart cache when user logs out or switches accounts
 */
export function resetCartCache() {
  cachedCart = {
    items: [],
    totalItems: 0,
    subtotal: 0,
    originalSubtotal: 0,
    totalDiscount: 0,
    deliveryFee: 0,
  };
  isInitialFetched = false;
  isFetchingGlobal = false;
  notifyListeners();
}

/**
 * Custom React Hook: useCart
 * Provides unified, reactive cart state management across all Customer & Reseller screens.
 */
export function useCart() {
  const [cart, setCart] = useState(cachedCart);
  const [loading, setLoading] = useState(!isInitialFetched);

  const fetchCart = useCallback(async (force = false) => {
    if (isFetchingGlobal && !force) return;
    isFetchingGlobal = true;
    try {
      const data = await getCart();
      if (data && typeof data === 'object') {
        cachedCart = {
          items: data.items || [],
          totalItems: data.totalItems ?? (data.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0),
          subtotal: data.subtotal || 0,
          originalSubtotal: data.originalSubtotal || 0,
          totalDiscount: data.totalDiscount || 0,
          deliveryFee: data.deliveryFee ?? 0,
        };
        isInitialFetched = true;
        notifyListeners();
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      isFetchingGlobal = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Register listener for cross-screen updates
    const handleChange = (updatedCart) => {
      setCart(updatedCart);
      setLoading(false);
    };

    listeners.add(handleChange);

    const handleLocalCartChanged = () => {
      fetchCart(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('mshoppy-cart-changed', handleLocalCartChanged);
    }

    if (!isInitialFetched) {
      fetchCart();
    } else {
      setCart(cachedCart);
      setLoading(false);
    }

    return () => {
      listeners.delete(handleChange);
      if (typeof window !== 'undefined') {
        window.removeEventListener('mshoppy-cart-changed', handleLocalCartChanged);
      }
    };
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1, size = 'Free Size', productData = null) => {
    try {
      setLoading(true);
      const res = await apiAddToCart(productId, quantity, size, productData);
      await fetchCart(true);
      return res;
    } catch (error) {
      console.warn('useCart: addItem fallback:', error);
      await fetchCart(true);
      return { success: true, isLocal: true };
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId, quantity, size) => {
    try {
      setLoading(true);
      const res = await apiUpdateCartItem(itemId, quantity, size);
      await fetchCart(true);
      return res;
    } catch (error) {
      console.error('useCart: updateItem failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      const res = await apiRemoveFromCart(itemId);
      await fetchCart(true);
      return res;
    } catch (error) {
      console.error('useCart: removeItem failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    try {
      setLoading(true);
      const res = await apiClearCart();
      cachedCart = {
        items: [],
        totalItems: 0,
        subtotal: 0,
        originalSubtotal: 0,
        totalDiscount: 0,
        deliveryFee: 0,
      };
      notifyListeners();
      return res;
    } catch (error) {
      console.error('useCart: clear failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    cartItems: cart.items || [],
    cartCount: cart.totalItems || 0,
    subtotal: cart.subtotal || 0,
    totalDiscount: cart.totalDiscount || 0,
    loading,
    refreshCart: () => fetchCart(true),
    addItem,
    updateItem,
    removeItem,
    clear,
  };
}

export default useCart;
