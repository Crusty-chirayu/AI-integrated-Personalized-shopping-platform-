"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/storefront-data";
import { getCurrentUser } from "@/lib/auth";
import { getCart, saveCart } from "@/lib/services/cart.service";

type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInCart: (productId: string) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem("cartiq-cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);





useEffect(() => {
  async function init() {
    const user = await getCurrentUser();

    if (!user) {
      setItems(loadCart());
      return;
    }

    setUserId(user.id);

    const { data } = await getCart(user.id);

    if (data && data.length > 0) {
      const cloudItems = data.map((item: any) => ({
        product: item.products,
        quantity: item.quantity,
      }));

      setItems(cloudItems);
    } else {
      setItems(loadCart());
    }
  }

  init();
}, []);


useEffect(() => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      "cartiq-cart",
      JSON.stringify(items)
    );
  }

  if (!userId) return;

  saveCart(
    userId,
    items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }))
  );
}, [items, userId]);




  const addItem = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const isInCart = (productId: string) => {
  return items.some((item) => item.product.id === productId);
};

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => {
      const unitPrice = item.product.salePrice ?? item.product.price;
      return sum + unitPrice * item.quantity;
    }, 0);

return {
  items,
  addItem,
  removeItem,
  isInCart,
  updateQuantity,
  clearCart,
  itemCount,
  subtotal,
};
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
