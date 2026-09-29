"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image?: string;
  image_url?: string;
  category?: string;
  category_name?: string;
  sub_category?: string;
  rating?: number;
  cashback_amount?: number;
  is_available?: boolean;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("my_shop_wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveToStorage = (items: WishlistItem[]) => {
    try {
      localStorage.setItem("my_shop_wishlist", JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.some((i) => String(i.id) === String(item.id))) return prev;
      const updated = [item, ...prev];
      saveToStorage(updated);
      return updated;
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => {
      const updated = prev.filter((i) => String(i.id) !== String(id));
      saveToStorage(updated);
      return updated;
    });
  };

  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((i) => String(i.id) === String(id));
  };

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem("my_shop_wishlist");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
