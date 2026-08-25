"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  slug: string;
  name: string;
  image: string;
  price: number | null;
};

interface RecentlyViewedProps {
  currentProduct: Product;
}

export default function RecentlyViewed({
  currentProduct,
}: RecentlyViewedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const key = "cartiq_recently_viewed";

      const raw = localStorage.getItem(key);
      let list: Product[] = raw ? JSON.parse(raw) : [];

      // Remove current product if it already exists
      list = list.filter(
        (item) => item.slug !== currentProduct.slug
      );

      // Add current product to the beginning
      list.unshift(currentProduct);

      // Keep only the latest 10 products
      list = list.slice(0, 10);

      localStorage.setItem(key, JSON.stringify(list));

      // Display all except the current product
      setProducts(
        list.filter(
          (item) => item.slug !== currentProduct.slug
        )
      );
    } catch (err) {
      console.error("Recently Viewed:", err);
    } finally {
      setMounted(true);
    }
  }, [currentProduct]);

  // Don't render anything until client-side initialization is complete
  if (!mounted) return null;

  // Hide the section if there are no previously viewed products
  if (products.length === 0) return null;

  return (
    <section className="mt-20">
      <h2 className="mb-6 text-3xl font-bold text-zinc-900">
        Recently Viewed
      </h2>

      <div className="pdp-scroll flex gap-5 overflow-x-auto pb-4">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="group w-56 shrink-0 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="224px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>

            <h3 className="mt-4 line-clamp-2 text-sm font-semibold text-zinc-900">
              {product.name}
            </h3>

            {product.price !== null && (
              <p className="mt-2 text-lg font-bold text-indigo-600">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}