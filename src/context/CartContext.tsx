"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  selectedUnit?: string;
  variant_id?: string;
  color?: string;
  storage?: string;
  ram?: string;
  rom?: string;
  sku?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, selectedUnit?: string, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, selectedUnit?: string, variantId?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  cartToastItem: CartItem | null;
  clearCartToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartToastItem, setCartToastItem] = useState<CartItem | null>(null);

  const clearCartToast = () => setCartToastItem(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("madur_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("madur_cart", JSON.stringify(cart));
  }, [cart]);

  const isMatch = (a: CartItem, id: string, selectedUnit?: string, variantId?: string) => {
    if (a.id !== id) return false;
    if (variantId && a.variant_id) return a.variant_id === variantId;
    return a.selectedUnit === selectedUnit;
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) =>
        isMatch(i, item.id, item.selectedUnit, item.variant_id)
      );
      if (existing) {
        return prev.map((i) =>
          isMatch(i, item.id, item.selectedUnit, item.variant_id)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    // Trigger the top alert toast
    setCartToastItem({ ...item });
  };

  const removeFromCart = (id: string, selectedUnit?: string, variantId?: string) => {
    setCart((prev) => prev.filter((i) => !isMatch(i, id, selectedUnit, variantId)));
  };

  const updateQuantity = (id: string, quantity: number, selectedUnit?: string, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, selectedUnit, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (isMatch(i, id, selectedUnit, variantId) ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        cartToastItem,
        clearCartToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
