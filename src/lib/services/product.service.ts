export type CreateProductInput = {
  title: string;
  description: string;

  // NEW
  imageUrls?: string[];

  // Temporary backward compatibility
  imageUrl?: string;

  categoryId: string;
  price: number;
  salePrice?: number;
  sku: string;
  stockQuantity: number;
  status: string;
  trackInventory: boolean;
  allowBackorders: boolean;
};

export async function createProduct(
  product: CreateProductInput
) {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Unable to create product."
    );
  }

  return result;
}

export async function updateProduct(
  id: string,
  product: CreateProductInput
) {
  const response = await fetch(
    `/api/admin/products/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Unable to update product."
    );
  }

  return result;
}