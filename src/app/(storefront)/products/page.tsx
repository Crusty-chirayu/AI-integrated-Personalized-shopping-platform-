import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/supabase-data";
import { ArrowLeft, PackageSearch, Sparkles } from "lucide-react";

const CATEGORY_EMOJI: Record<string, string> = {
  electronics: "💻",
  fashion: "👗",
  grocery: "🛒",
  home: "🛋️",
  sports: "🏋️",
};

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const allProducts = await getProducts();

  const normalizedCategory = category?.trim().toLowerCase();

  const products = normalizedCategory
    ? allProducts.filter(
        (product) =>
          product.category?.toLowerCase() === normalizedCategory
      )
    : allProducts;

  const categoryLabel = normalizedCategory
    ? toTitleCase(normalizedCategory)
    : null;

  const heading = categoryLabel
    ? `${categoryLabel} Collection`
    : "Curated pieces for modern living.";

  const subtitle = categoryLabel
    ? `Discover the latest ${categoryLabel} products powered by AI recommendations.`
    : "Discover thousands of products powered by AI recommendations.";

  const categories = Object.keys(CATEGORY_EMOJI);

  return (
    <div className="relative">
      {/* Local keyframes — no client boundary needed, so async data fetching above stays untouched */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-2%, 3%) scale(1.05); }
        }
        .anim-fade-up {
          opacity: 0;
          animation: fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-fade-in {
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
        }
        .anim-orb {
          animation: floatOrb 14s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-fade-up, .anim-fade-in, .anim-orb {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Hero / header */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div
          className="pointer-events-none absolute inset-0 anim-orb"
          style={{
            background:
              "radial-gradient(55% 50% at 10% 0%, rgba(79,70,229,0.10), transparent 60%), radial-gradient(45% 45% at 90% 10%, rgba(20,184,166,0.10), transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="anim-fade-up" style={{ animationDelay: "0ms" }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-indigo-700 shadow-sm backdrop-blur-md">
                🛍 Products
              </div>

              {categoryLabel && (
                <Link
                  href="/products"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to All Products
                  <span className="mx-1 h-1 w-1 rounded-full bg-zinc-300" />
                  <span className="inline-flex items-center gap-1 text-zinc-950">
                    {CATEGORY_EMOJI[normalizedCategory ?? ""] ?? "🛒"}
                    {categoryLabel}
                  </span>
                </Link>
              )}

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-5xl lg:text-6xl">
                {heading}
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
                {subtitle}
              </p>
            </div>

            <div
              className="anim-fade-up inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur-md"
              style={{ animationDelay: "120ms" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
              </span>
              Showing {products.length} product{products.length === 1 ? "" : "s"}
            </div>
          </div>

          {/* Category chips */}
          <div
            className="anim-fade-up mt-10 flex flex-wrap items-center gap-2.5"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              href="/products"
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                !normalizedCategory
                  ? "border-transparent bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-[0_4px_20px_rgba(79,70,229,0.3)]"
                  : "border-black/10 bg-white/70 text-zinc-600 hover:border-indigo-200 hover:text-indigo-700"
              }`}
            >
              ✨ All
            </Link>

            {categories.map((cat) => {
              const active = normalizedCategory === cat;

              return (
                <Link
                  key={cat}
                  href={`/products?category=${cat}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    active
                      ? "border-transparent bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-[0_4px_20px_rgba(79,70,229,0.3)]"
                      : "border-black/10 bg-white/70 text-zinc-600 hover:border-indigo-200 hover:text-indigo-700"
                  }`}
                >
                  {CATEGORY_EMOJI[cat]} {toTitleCase(cat)}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sticky filter / status bar */}
      <div className="sticky top-[72px] z-20 border-b border-black/5 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-10">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-zinc-950">AI Suggests</span>
            <span className="hidden text-zinc-400 sm:inline">
              — popular in your interests
            </span>
          </div>

          <div className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-zinc-400 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {categoryLabel ?? "All Categories"}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        {products.length === 0 ? (
          <div className="anim-fade-in flex flex-col items-center justify-center rounded-[32px] border border-dashed border-black/10 bg-gradient-to-b from-white to-zinc-50 px-6 py-24 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <PackageSearch className="h-7 w-7 text-zinc-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold tracking-tight text-zinc-950">
              No products found
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              {categoryLabel
                ? `No products in ${categoryLabel} yet — check back soon.`
                : "Try another search or check back soon — new products are added regularly."}
            </p>
            {categoryLabel && (
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(79,70,229,0.45)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Browse All Products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="anim-fade-up transition-transform duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${Math.min(index, 12) * 45}ms`,
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}