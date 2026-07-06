import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/supabase-data";
import { AddToCart } from "@/components/add-to-cart";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600">
        <ArrowLeft className="h-4 w-4" /> Back to collection
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white p-3 shadow-sm">
          <img src={product.image} alt={product.title} className="h-[560px] w-full rounded-[24px] object-cover" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">{product.category}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-zinc-950">{product.title}</h1>
          <div className="mt-5 flex items-center gap-3 text-sm text-zinc-600">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-medium text-zinc-700">{product.rating}</span>
            </div>
            <span>•</span>
            <span>In stock · {product.stock} available</span>
          </div>
          <p className="mt-6 text-base leading-8 text-zinc-600">{product.description}</p>
          <div className="mt-8 flex items-end gap-4">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-semibold text-zinc-950">${product.salePrice}</span>
                <span className="text-lg text-zinc-400 line-through">${product.price}</span>
              </>
            ) : (
              <span className="text-3xl font-semibold text-zinc-950">${product.price}</span>
            )}
          </div>
          <AddToCart product={product} />
          <div className="mt-10 rounded-[24px] border border-black/5 bg-[#f7f3eb] p-6 text-sm leading-7 text-zinc-600">
            Designed for daily rituals with premium materials, sculptural forms, and lasting quality.
          </div>
        </div>
      </div>
    </div>
  );
}
