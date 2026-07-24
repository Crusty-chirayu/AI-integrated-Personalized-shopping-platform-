import { Product } from "@/lib/storefront-data";

export function buildProductContext(
  products: any[]
) {
  if (!products.length)
    return "No matching products found.";

  return products
    .map((p) => {
      return `
Title: ${p.title}
Price: ₹${p.sale_price}
Description: ${p.description}
Specifications:
${JSON.stringify(
  p.specifications,
  null,
  2
)}
`;
    })
    .join("\n-----------------\n");
}