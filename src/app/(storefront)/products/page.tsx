import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/supabase-data";
import { PackageSearch, Sparkles } from "lucide-react";

export default async function ProductsPage() {
  const products = await getProducts();

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

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-5xl">
                Curated pieces for modern living.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600">
                Discover thousands of products powered by AI recommendations.
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
              Try another search or check back soon — new products are added regularly.
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