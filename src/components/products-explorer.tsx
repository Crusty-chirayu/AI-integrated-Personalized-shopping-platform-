"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  PackageSearch,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/storefront-data";

type CategoryChip = {
  slug: string;
  label: string;
  emoji: string;
  href: string;
  active: boolean;
};

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating-desc" | "name-asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "name-asc", label: "Name: A to Z" },
];

function effectivePrice(product: Product) {
  const withSale = product as { salePrice?: number };
  return withSale.salePrice && withSale.salePrice < product.price
    ? withSale.salePrice
    : product.price;
}

/* ------------------------------------------------------------------ */
/*  Skeleton grid (shimmer)                                           */
/* ------------------------------------------------------------------ */

function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-zinc-100 ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <ShimmerBlock className="aspect-[4/5] rounded-[22px]" />
      <div className="space-y-2.5 px-2 pb-2 pt-4">
        <ShimmerBlock className="h-3 w-1/3 rounded-full" />
        <ShimmerBlock className="h-4 w-4/5 rounded-full" />
        <ShimmerBlock className="h-4 w-1/2 rounded-full" />
        <ShimmerBlock className="mt-3 h-9 w-full rounded-full" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main explorer                                                     */
/* ------------------------------------------------------------------ */

export function ProductsExplorer({
  products,
  categoryChips,
  categoryLabel,
}: {
  products: Product[];
  categoryChips: CategoryChip[];
  categoryLabel: string | null;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Brief, honest "refining" shimmer whenever search/sort changes — this is
  // a UX transition, not a real network fetch (data is already on the
  // client), so it's kept short.
  useEffect(() => {
    setIsRefining(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setIsRefining(false), 260);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, sort]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? products.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        )
      : products;

    const sorted = [...base];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case "rating-desc":
        sorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, query, sort]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.title.toLowerCase().includes(q))
      .slice(0, 5);
  }, [products, query]);

  const recommendedCount = useMemo(
    () => filtered.filter((p) => (Number(p.rating) || 0) >= 4.5).length,
    [filtered]
  );

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Relevance";

  return (
    <>
      {/* Sticky glass filter bar */}
      <div className="sticky top-[72px] z-30 border-b border-black/5 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Category chips */}
            <div
              className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0"
              role="tablist"
              aria-label="Filter by category"
            >
              <Link
                href="/products"
                role="tab"
                aria-selected={!categoryLabel}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  !categoryLabel
                    ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-[0_6px_20px_rgba(79,70,229,0.35)]"
                    : "border border-black/10 bg-white text-zinc-600 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-sm"
                }`}
              >
                All
              </Link>

              {categoryChips.map((chip) => (
                <Link
                  key={chip.slug}
                  href={chip.href}
                  role="tab"
                  aria-selected={chip.active}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    chip.active
                      ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-[0_6px_20px_rgba(79,70,229,0.35)]"
                      : "border border-black/10 bg-white text-zinc-600 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-sm"
                  }`}
                >
                  <span className="mr-1.5">{chip.emoji}</span>
                  {chip.label}
                </Link>
              ))}
            </div>

            {/* Search + sort */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="relative flex items-center">
                  <Search
                    className={`pointer-events-none absolute left-4 h-4 w-4 transition-colors ${
                      query ? "text-indigo-600" : "text-zinc-400"
                    }`}
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setSuggestionsOpen(true)}
                    onBlur={() => setTimeout(() => setSuggestionsOpen(false), 120)}
                    placeholder="Ask AI or search products…"
                    aria-label="Search products"
                    className="w-56 rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-9 text-sm text-zinc-800 shadow-sm outline-none transition-all duration-200 placeholder:text-zinc-400 focus:w-72 focus:border-indigo-300 focus:shadow-[0_0_0_4px_rgba(79,70,229,0.12)] sm:w-64 sm:focus:w-80"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-3 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {suggestionsOpen && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                    >
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          onMouseDown={() => setQuery(s.title)}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-[#f7f3eb]"
                        >
                          <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          <span className="truncate">{s.title}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{activeSortLabel}</span>
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setSortOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        role="listbox"
                        className="absolute right-0 top-[calc(100%+8px)] z-40 w-52 overflow-hidden rounded-2xl border border-black/5 bg-white p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            role="option"
                            aria-selected={sort === option.value}
                            onClick={() => {
                              setSort(option.value);
                              setSortOpen(false);
                            }}
                            className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                              sort === option.value
                                ? "bg-gradient-to-r from-indigo-50 to-teal-50 text-zinc-950"
                                : "text-zinc-600 hover:bg-zinc-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        {/* AI suggests strip */}
        <div className="mb-10 flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-600">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-zinc-950">AI Suggests</span>
          <span className="text-zinc-400">— popular in your interests</span>
          {recommendedCount > 0 && (
            <span className="ml-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              {recommendedCount} highly rated pick{recommendedCount === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {isRefining ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: Math.min(Math.max(filtered.length, 4), 8) }).map(
              (_, i) => (
                <SkeletonCard key={i} />
              )
            )}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-black/10 bg-zinc-50 px-6 py-24 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <PackageSearch className="h-7 w-7 text-zinc-400" />
            </motion.div>

            <h2 className="mt-6 text-xl font-semibold text-zinc-950">
              No products found
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              {query
                ? `Nothing matches "${query}" ${categoryLabel ? `in ${categoryLabel}` : ""}. Try a different search.`
                : categoryLabel
                  ? `No products in ${categoryLabel} yet — check back soon.`
                  : "Try another search or check back soon — new products are added regularly."}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  Clear search
                </button>
              )}
              <Link
                href="/products"
                className="rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)]"
              >
                Browse all products
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.35) }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </>
  );
}