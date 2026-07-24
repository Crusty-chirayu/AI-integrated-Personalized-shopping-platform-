"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import type { Product } from "@/lib/storefront-data";

import { AddToCart } from "@/components/add-to-cart";
import ProductAIButton from "@/components/ai/ProductAIButton";
import ProductAIChat from "@/components/ai/ProductAIChat";

type Props = {
  product: Product;
};

export default function ProductInfo({ product }: Props) {
    console.log("ProductInfo rendered");
  const [openAI, setOpenAI] = useState(false);

  return (
    <>
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          {product.category}
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-zinc-950">
          {product.title}
        </h1>

        <div className="mt-5 flex items-center gap-3 text-sm text-zinc-600">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />

            <span className="font-medium text-zinc-700">
              {product.rating}
            </span>
          </div>

          <span>•</span>

          <span>
            In stock · {product.stock} available
          </span>
        </div>

        <p className="mt-6 text-base leading-8 text-zinc-600">
          {product.description}
        </p>

        <div className="mt-8 flex items-end gap-4">
          {product.salePrice &&
          product.salePrice < product.price ? (
            <>
              <span className="text-3xl font-semibold text-zinc-950">
                ₹{product.salePrice}
              </span>

              <span className="text-lg text-zinc-400 line-through">
                ₹{product.price}
              </span>
            </>
          ) : (
            <span className="text-3xl font-semibold text-zinc-950">
              ₹{product.price}
            </span>
          )}
        </div>

        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <div className="mt-8 rounded-[24px] border border-black/5 bg-[#f7f3eb] p-6">
              <h3 className="mb-5 text-xl font-semibold text-zinc-900">
                Specifications
              </h3>

              <div className="space-y-3">
                {Object.entries(product.specifications).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-black/5 pb-2"
                    >
                      <span className="font-medium text-zinc-700">
                        {key}
                      </span>

                      <span className="text-zinc-600">
                        {String(value)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        <div className="mt-8">
          <AddToCart product={product} />
        </div>

        <div className="mt-6">

<ProductAIButton
  onClick={() => {
    setOpenAI(true);
  }}
/>

        </div>
      </div>

<ProductAIChat
  open={openAI}
  onClose={() => setOpenAI(false)}
  product={product}
/>
    </>
  );
}