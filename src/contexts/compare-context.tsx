"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Product } from "@/lib/storefront-data";

type CompareContextValue = {
  items: Product[];
  toggleItem: (product: Product) => void;
  isCompared: (id: string) => boolean;
  clearCompare: () => void;
};

const CompareContext =
  createContext<CompareContextValue | undefined>(
    undefined
  );

function loadCompare(): Product[] {
  if (typeof window === "undefined") return [];

  try {
    const saved =
      localStorage.getItem("cartiq-compare");

    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    setItems(loadCompare());
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "cartiq-compare",
      JSON.stringify(items)
    );
  }, [items]);

  const toggleItem = (product: Product) => {
    setItems((prev) => {
      const exists = prev.some(
        (p) => p.id === product.id
      );

      if (exists) {
        return prev.filter(
          (p) => p.id !== product.id
        );
      }

      if (prev.length >= 2) {
        alert("You can compare only 2 products.");
        return prev;
      }

      return [...prev, product];
    });
  };

  const isCompared = (id: string) =>
    items.some((p) => p.id === id);

  const clearCompare = () =>
    setItems([]);

  const value = useMemo(
    () => ({
      items,
      toggleItem,
      isCompared,
      clearCompare,
    }),
    [items]
  );

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context =
    useContext(CompareContext);

  if (!context) {
    throw new Error(
      "useCompare must be used inside CompareProvider"
    );
  }

  return context;
}