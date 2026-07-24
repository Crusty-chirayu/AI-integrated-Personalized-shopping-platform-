"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { AddToCart } from "./add-to-cart";
import { useWishlist } from "@/contexts/wishlist-context";
import type { Product } from "@/lib/storefront-data";

export function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { toggleItem, isWishlisted } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);

  const wished = isWishlisted(product.id);

  const hasDiscount =
    !!product.salePrice && product.salePrice < product.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.price - product.salePrice!) / product.price) * 100
      )
    : 0;

  // `reviewCount` isn't part of the original Product type used by this
  // component — read it defensively so the card still works if it's
  // missing, without requiring a type change elsewhere.
  const reviewCount = (product as { reviewCount?: number }).reviewCount;

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#f5f2ea]">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200" />
        )}

        <img
          src={product.image}
          alt={product.title}
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Subtle gradient overlay for legibility / depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* AI badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white shadow-md">
          <Sparkles className="h-3 w-3" />
          AI Pick
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute left-3 top-11 rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-md">
            -{discountPercent}%
          </div>
        )}

        {/* Wishlist button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => toggleItem(product)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-md backdrop-blur transition-colors ${
            wished
              ? "border-red-500 bg-red-500 text-white"
              : "border-white/40 bg-white/90 text-zinc-700 hover:bg-white"
          }`}
        >
          <Heart
            className="h-4 w-4"
            fill={wished ? "currentColor" : "none"}
          />
        </motion.button>
      </div>

      {/* Content */}
      <div className="px-2 pb-2 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          {product.category}
        </p>

        <h3 className="mt-1.5 line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-zinc-900">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5 text-sm">
          {product.rating ? (
            <>
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
              <span className="font-medium text-zinc-800">{product.rating}</span>
              <span className="text-zinc-400">
                {reviewCount ? `(${reviewCount} reviews)` : "(No reviews yet)"}
              </span>
            </>
          ) : (
            <span className="text-zinc-400">No ratings yet</span>
          )}
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-zinc-950">
                ₹{product.salePrice}
              </span>
              <span className="text-sm text-zinc-400 line-through">
                ₹{product.price}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-zinc-950">
              ₹{product.price}
            </span>
          )}

          {product.badge && (
            <span className="ml-auto rounded-full border border-black/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              {product.badge}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2.5">
          <AddToCart product={product} compact={true} />

          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:gap-2.5"
          >
            View product
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}