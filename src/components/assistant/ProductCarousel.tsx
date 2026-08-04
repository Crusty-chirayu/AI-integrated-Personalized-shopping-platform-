"use client";

import ProductCard from "./ProductCard";

type AssistantProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  sale_price?: number;
  salePrice?: number;
  product_images?: Array<{ image_url: string }>;
};

type Props = {
  products: AssistantProduct[];
};

export default function ProductCarousel({
  products,
}: Props) {
  if (!products || products.length === 0) {
    return null;
  }

  return (

<div className="mt-5 flex gap-6 overflow-x-auto pb-3">
    
      {products.map((product) => (

        <div
          key={product.id}
          className="min-w-[270px]"
        >

<ProductCard
    product={product}
/>
        </div>

      ))}

    </div>

  );

}