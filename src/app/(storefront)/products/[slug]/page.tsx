import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import ProductGallery from "@/components/product-gallery";
import ProductInfo from "@/components/product-info";

import {
  getProductBySlug,
  getProducts,
} from "@/lib/supabase-data";

export async function generateStaticParams() {
  const products = await getProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">

      <Link
        href="/products"
        className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to collection
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">

        {/* LEFT SIDE */}
        <ProductGallery
          images={product.images}
        />

        {/* RIGHT SIDE */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductInfo
            product={product}
          />

          {/* AI Recommendation card — UI only, no backend logic */}
          <div className="mt-6 rounded-[24px] border border-black/5 bg-gradient-to-br from-indigo-50 to-teal-50 p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-950">CartIQ AI</p>
                <p className="text-xs text-zinc-500">Recommended for you</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Great value
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Best seller
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Popular with similar shoppers
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}