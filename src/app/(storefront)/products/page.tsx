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

  return (
    <div>
      {/* Hero / header */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 50% at 10% 0%, rgba(79,70,229,0.08), transparent 60%), radial-gradient(45% 45% at 90% 10%, rgba(20,184,166,0.08), transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-indigo-700 shadow-sm">
                🛍 Products
              </div>

              {categoryLabel && (
                <Link
                  href="/products"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
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

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-5xl">
                {heading}
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600">
                {subtitle}
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              Showing {products.length} products
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        {/* AI suggests strip — UI only, no recommendation logic */}
        <div className="mb-10 flex items-center gap-2 text-sm font-medium text-zinc-600">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-zinc-950">AI Suggests</span>
          <span className="text-zinc-400">— popular in your interests</span>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-black/10 bg-zinc-50 px-6 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <PackageSearch className="h-7 w-7 text-zinc-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-zinc-950">No products found</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              {categoryLabel
                ? `No products in ${categoryLabel} yet — check back soon.`
                : "Try another search or check back soon — new products are added regularly."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}