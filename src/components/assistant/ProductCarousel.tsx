"use client";

import ProductCard from "./ProductCard";

type Props = {
  products: any[];
};

export default function ProductCarousel({
  products,
}: Props) {
  
console.log(
  "FIRST PRODUCT:",
  JSON.stringify(products[0], null, 2)
);
  if (!products?.length) return null;

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