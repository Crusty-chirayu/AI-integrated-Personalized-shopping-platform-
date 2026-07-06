import { Plus } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type ProductRow = {
  id: string;
  title: string;
  sku: string | null;
  category_id?: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number | null;
  status: string | null;
  categories?: { name: string | null }[];
};

export default async function AdminProductsPage() {
  const client = getSupabaseAdmin();
  const { data: productsData } = client
    ? await client
        .from("products")
        .select("id,title,sku,price,sale_price,stock_quantity,status,categories(name)")
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const products: ProductRow[] = productsData ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Products</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Manage inventory</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-black/5">
          <thead className="bg-[#f7f3eb] text-left text-sm text-zinc-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 text-sm text-zinc-700">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-zinc-900">{product.title}</td>
                <td className="px-4 py-3">{product.sku ?? "—"}</td>
                <td className="px-4 py-3">{product.categories?.[0]?.name ?? "Uncategorized"}</td>
                <td className="px-4 py-3">${product.sale_price ?? product.price}</td>
                <td className="px-4 py-3">{product.stock_quantity ?? 0}</td>
                <td className="px-4 py-3">{product.status ?? "draft"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
