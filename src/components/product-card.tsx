"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/storefront-data";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.04)]"
    >
      <div className="overflow-hidden rounded-[22px] bg-[#f5f2ea]">
        <img
          src={product.image}
          alt={product.title}
          className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{product.category}</p>
          <h3 className="mt-2 text-xl font-semibold text-zinc-900">{product.title}</h3>
        </div>
        {product.badge ? (
          <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            {product.badge}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{product.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-700">
          <Star className="h-4 w-4 fill-current text-amber-500" />
          <span>{product.rating}</span>
        </div>
        <div className="text-right">
          {product.salePrice ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 line-through">${product.price}</span>
              <span className="font-semibold text-zinc-900">${product.salePrice}</span>
            </div>
          ) : (
            <span className="font-semibold text-zinc-900">${product.price}</span>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <Link
          href={`/products/${product.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:gap-3"
        >
          View product <ArrowRight className="h-4 w-4" />
        </Link>
        <button onClick={() => addItem(product)} className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800">
          Add
        </button>
      </div>
    </motion.article>
  );
}
