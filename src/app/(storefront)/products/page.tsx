import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/supabase-data";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Collection</p>
          <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Curated pieces for modern living.</h1>
        </div>
        <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-zinc-600">4 products</div>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
