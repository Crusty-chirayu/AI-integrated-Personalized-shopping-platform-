"use client";

import Image from "next/image";
import ProductTag from "./ProductTag";
import { AddToCart } from "@/components/add-to-cart";
import ConfidenceBadge from "./ConfidenceBadge";
import Link from "next/link";
import RecommendationBadge from "./RecommendationBadge";
import { AddToWishlist } from "@/components/add-to-wishlist";


type Props = {
  product: any;
};

export default function ProductCard({
  product,
}: Props) {
  const image =
    product.product_images?.[0]?.image_url ??
    "/placeholder.png";

  const price =
    product.sale_price ?? product.price;

  return (
<div className="w-56 rounded-xl border bg-white shadow-sm hover:shadow-md">
      <Image
        src={image}
        alt={product.title}
        width={300}
        height={220}
        className="h-52 w-full rounded-t-2xl object-cover"
      />

      <div className="space-y-3 p-4">

        <h3 className="line-clamp-2 font-semibold">
          {product.title}
        </h3>

<RecommendationBadge
    text={product.badge}
/>

<ConfidenceBadge
  value={product.confidence}
/>

<p className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">

  {product.reason}

</p>

<div className="mt-3 flex flex-wrap gap-2">

  {product.tags?.map((tag: string) => (

    <ProductTag
      key={tag}
      text={tag}
    />

  ))}

</div>

        <div className="flex items-center justify-between">

          <span className="text-xl font-bold">
            ₹{price}
          </span>

          <span className="text-sm text-zinc-500">
            ⭐ {product.rating ?? 4.5}
          </span>

        </div>

<div className="grid grid-cols-2 gap-2">

<AddToCart
  product={product}
  compact
/>


<AddToWishlist
  product={product}
  compact
/>



<Link
  href={`/products/${product.slug}`}
  className="col-span-2 rounded-lg border px-4 py-2 text-center text-sm transition hover:bg-zinc-100"
>
  👁 View
</Link>

</div>

      </div>

    </div>
  );
}