"use client";

import { useState } from "react";
import { ArrowRight, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/storefront-data";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-black/10 bg-white p-1">
          <button
            type="button"
            className="rounded-full p-2 text-zinc-700"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[2rem] text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            className="rounded-full p-2 text-zinc-700"
            onClick={() => setQuantity((value) => value + 1)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            for (let i = 0; i < quantity; i += 1) {
              addItem(product);
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Add to cart
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
