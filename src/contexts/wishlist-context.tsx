"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Product } from "@/lib/storefront-data";
import { getCurrentUser } from "@/lib/auth";
import {
  getWishlist,
  saveWishlist,
} from "@/lib/services/wishlist.service";

type WishlistContextValue = {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
};

const WishlistContext =
  createContext<WishlistContextValue | undefined>(
    undefined
  );

function loadWishlist(): Product[] {
  if (typeof window === "undefined") return [];

  try {
    const saved =
      localStorage.getItem("cartiq-wishlist");

    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  async function init() {
    const user = await getCurrentUser();

    if (!user) {
      setItems(loadWishlist());
      return;
    }

    setUserId(user.id);

    const { data } = await getWishlist(user.id);

    if (data && data.length > 0) {
      setItems(
        data.map((item: any) => item.products)
      );
    } else {
      setItems(loadWishlist());
    }
  }

  init();
}, []);




useEffect(() => {
  localStorage.setItem(
    "cartiq-wishlist",
    JSON.stringify(items)
  );

  if (!userId) return;

  saveWishlist(
    userId,
    items.map((item) => item.id)
  );
}, [items, userId]);




  const addItem = (product: Product) => {
    setItems((prev) => {
      if (
        prev.some(
          (item) => item.id === product.id
        )
      ) {
        return prev;
      }

      return [...prev, product];
    });
  };

  const removeItem = (
    productId: string
  ) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.id !== productId
      )
    );
  };

  const toggleItem = (
    product: Product
  ) => {
    setItems((prev) => {
      const exists = prev.some(
        (item) => item.id === product.id
      );

      if (exists) {
        return prev.filter(
          (item) => item.id !== product.id
        );
      }

      return [...prev, product];
    });
  };

  const isWishlisted = (
    productId: string
  ) =>
    items.some(
      (item) => item.id === productId
    );

  const clearWishlist = () =>
    setItems([]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      toggleItem,
      isWishlisted,
      clearWishlist,
      itemCount: items.length,
    }),
    [items]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context =
    useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}