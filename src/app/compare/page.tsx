"use client";

import Image from "next/image";

import { useCompare } from "@/contexts/compare-context";

export default function ComparePage() {
  const { items, clearCompare } = useCompare();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl py-20 text-center">
        <h1 className="text-4xl font-bold">Compare Products</h1>

        <p className="mt-5 text-zinc-600">
          No products selected for comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Compare Products
        </h1>

        <button
          onClick={clearCompare}
          className="rounded-lg bg-red-500 px-5 py-2 text-white"
        >
          Clear
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {items.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl border p-6"
          >
            <Image
              src={product.image}
              alt={product.title}
              width={600}
              height={288}
              className="h-72 w-full rounded-xl object-cover"
            />

            <h2 className="mt-5 text-2xl font-semibold">
              {product.title}
            </h2>

            <p className="mt-3 text-zinc-600">
              {product.description}
            </p>

            <div className="mt-5 text-xl font-bold">
              ₹{product.salePrice ?? product.price}
            </div>

            <div className="mt-3">
              ⭐ {product.rating}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}