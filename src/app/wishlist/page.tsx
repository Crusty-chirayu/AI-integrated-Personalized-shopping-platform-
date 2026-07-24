"use client";

import Link from "next/link";
import { Heart, Sparkles, Trash2 } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import { ProductCard } from "@/components/product-card";

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-teal-50">
          <Heart className="h-11 w-11 text-indigo-400" />
        </div>

        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.02em] text-zinc-950">
          Your Wishlist is Empty
        </h1>

        <p className="mt-4 max-w-md text-base leading-7 text-zinc-600">
          Save products you love and they&apos;ll appear here.
        </p>

        <Link
          href="/products"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-7 py-3.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)] hover:brightness-105"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 50% at 10% 0%, rgba(79,70,229,0.08), transparent 60%), radial-gradient(45% 45% at 90% 10%, rgba(20,184,166,0.08), transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-indigo-700 shadow-sm">
                ❤️ My Wishlist
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.02em] text-zinc-950">
                Keep track of products you love.
              </h1>

              <p className="mt-3 max-w-lg text-base leading-7 text-zinc-600">
                Save them now, purchase them later.
              </p>

              <p className="mt-3 text-sm font-medium text-zinc-500">
                {items.length} saved product{items.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              onClick={clearWishlist}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-500 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
              Clear Wishlist
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* AI suggestions — UI only, no recommendation data available here */}
        <div className="mt-20 rounded-[28px] border border-black/5 bg-gradient-to-br from-indigo-50 to-teal-50 p-10 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-zinc-950">You may also like</h2>
          <p className="mt-2 text-sm text-zinc-600">Based on your wishlist.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Browse more products
          </Link>
        </div>
      </div>
    </div>
  );
}