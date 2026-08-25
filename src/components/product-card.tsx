"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Heart, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { AddToCart } from "./add-to-cart";
import { useWishlist } from "@/contexts/wishlist-context";
import type { Product } from "@/lib/storefront-data";

// Deterministic, presentational-only "AI match" score derived from the
// product id. This is NOT a real model confidence value — there's no
// recommendation-confidence field in the current data model. It's a stable
// per-product number so the badge doesn't flicker between renders. Swap
// this out for a real field (e.g. product.aiMatchScore) once one exists.
function aiMatchScore(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return 90 + (Math.abs(hash) % 9); // stable value between 90–98
}

export function ProductCard({ product }: { product: Product }) {
  const { toggleItem, isWishlisted } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);

  const wished = isWishlisted(product.id);

  const hasDiscount = !!product.salePrice && product.salePrice < product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  // These fields aren't part of the current Product type — read them
  // defensively (same pattern as reviewCount below) so the card still
  // works whether or not the data source ever adds them, without
  // requiring a type change elsewhere or fabricating fake values.
  const reviewCount = (product as { reviewCount?: number }).reviewCount;
  const brand = (product as { brand?: string }).brand;
  const inStock = (product as { inStock?: boolean }).inStock;
  const stockCount = (product as { stockCount?: number }).stockCount;

  const matchScore = aiMatchScore(product.id);

  const outOfStock = inStock === false;
  const lowStock =
    !outOfStock && typeof stockCount === "number" && stockCount > 0 && stockCount <= 5;

  /* ---------------- 3D tilt on hover ---------------- */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 300,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 300,
    damping: 25,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.article
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 will-change-transform hover:shadow-[0_30px_80px_rgba(0,0,0,0.14)] focus-within:shadow-[0_30px_80px_rgba(0,0,0,0.14)]"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#f5f2ea]">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200" />
        )}

        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onLoad={() => setImageLoaded(true)}
          className={`object-cover transition-all duration-700 ease-out group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Gradient overlay for legibility / depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white shadow-md">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              AI Pick · {matchScore}% match
            </motion.span>
          </div>

          {hasDiscount && (
            <div className="rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-md">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* Wishlist button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85, rotate: wished ? 0 : -12 }}
          onClick={() => toggleItem(product)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-md backdrop-blur transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            wished
              ? "border-red-500 bg-red-500 text-white"
              : "border-white/40 bg-white/90 text-zinc-700 hover:bg-white"
          }`}
        >
          <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
        </motion.button>

        {/* Hover-reveal quick action: View Details */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center justify-center gap-1.5 rounded-full bg-white/95 px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-2 pb-2 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            {product.category}
          </p>

          {brand && (
            <p className="truncate text-[11px] font-medium text-zinc-400">{brand}</p>
          )}
        </div>

        <h3 className="mt-1.5 line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-zinc-900">
          {product.title}
        </h3>

        {/* Rating + stock */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {product.rating ? (
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
              <span className="font-medium text-zinc-800">{product.rating}</span>
              <span className="text-zinc-400">
                {reviewCount ? `(${reviewCount} reviews)` : "(No reviews yet)"}
              </span>
            </div>
          ) : (
            <span className="text-zinc-400">No ratings yet</span>
          )}

          {outOfStock ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Out of stock
            </span>
          ) : lowStock ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Only {stockCount} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              In stock
            </span>
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
            <span className="text-lg font-bold text-zinc-950">₹{product.price}</span>
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
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:gap-2.5 focus:outline-none focus-visible:underline"
          >
            View product
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}