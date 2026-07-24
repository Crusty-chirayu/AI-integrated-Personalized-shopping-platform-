import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import ProductForm from "@/components/admin/ProductForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    notFound();
  }

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      product_images(image_url)
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Products
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Edit Product
        </h1>

        <p className="mt-2 text-zinc-600">
          Update this product.
        </p>
      </div>

      <ProductForm
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          categoryId: product.category_id,
          price: product.price,
          salePrice: product.sale_price,
          sku: product.sku,
          stockQuantity: product.stock_quantity,
          status: product.status,
          trackInventory: product.track_inventory,
          allowBackorders: product.allow_backorders,
          imageUrl:
            product.product_images?.[0]?.image_url ?? "",
        }}
      />
    </div>
  );
}