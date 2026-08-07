import { Plus, Pencil, Package, ImageOff } from "lucide-react";
import Link from "next/link";

import { getSupabaseAdmin } from "@/lib/supabase-server";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

type ProductRow = {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number | null;
  status: string | null;
  categories?: {
    name: string | null;
  }[];
};

/* ------------------------------------------------------------------ */
/*  Pure display helpers — presentational only, no data/logic change   */
/* ------------------------------------------------------------------ */

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getStatusStyle(status: string | null) {
  const normalized = (status ?? "draft").toLowerCase();
  switch (normalized) {
    case "published":
    case "active":
      return {
        label: status ?? "Published",
        className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
        dot: "bg-emerald-500",
      };
    case "archived":
      return {
        label: status ?? "Archived",
        className: "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-500/20",
        dot: "bg-zinc-400",
      };
    default:
      return {
        label: status ?? "Draft",
        className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
        dot: "bg-amber-500",
      };
  }
}

function getStockStyle(stock: number | null) {
  const qty = stock ?? 0;
  if (qty <= 0) return { label: "Out of stock", className: "text-rose-600" };
  if (qty <= 5) return { label: `${qty} left`, className: "text-amber-600" };
  return { label: `${qty} in stock`, className: "text-zinc-700" };
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default async function AdminProductsPage() {
  const client = getSupabaseAdmin();

  const { data: productsData } = client
    ? await client
        .from("products")
        .select(
          `
          id,
          title,
          sku,
          price,
          sale_price,
          stock_quantity,
          status,
          categories(name)
        `
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(500)
    : { data: [] };

  const products: ProductRow[] = productsData ?? [];

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Products
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Manage Inventory
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 shadow-sm sm:inline-flex">
            {products.length} {products.length === 1 ? "product" : "products"}
          </span>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* content */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-black/10 bg-white/60 px-6 py-20 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7f3eb] text-zinc-400">
            <ImageOff className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-zinc-700">No products yet</p>
          <p className="max-w-xs text-xs text-zinc-500">
            Products you add will show up here, ready to manage and publish.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add your first product
          </Link>
        </div>
      ) : (
        <>
          {/* desktop / tablet table */}
          <div className="hidden overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm md:block">
            <table className="min-w-full divide-y divide-black/5">
              <thead className="bg-[#f7f3eb] text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5 text-sm text-zinc-700">
                {products.map((product) => {
                  const status = getStatusStyle(product.status);
                  const stock = getStockStyle(product.stock_quantity);
                  const hasSale =
                    product.sale_price !== null &&
                    product.sale_price < product.price;

                  return (
                    <tr
                      key={product.id}
                      className="group transition-colors duration-150 hover:bg-[#faf8f3]"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        {product.title}
                      </td>

                      <td className="px-6 py-4 text-zinc-500">
                        {product.sku ? (
                          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
                            {product.sku}
                          </code>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                          {product.categories?.[0]?.name ?? "Uncategorized"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {hasSale ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-zinc-400 line-through">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="font-semibold text-zinc-900">
                              {formatCurrency(product.sale_price as number)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-zinc-900">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </td>

                      <td className={`px-6 py-4 font-medium ${stock.className}`}>
                        {stock.label}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${status.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-80 transition-opacity duration-150 group-hover:opacity-100">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-lg bg-blue-50 p-2 text-blue-700 transition-colors duration-150 hover:bg-blue-100"
                            title="Edit Product"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          <DeleteProductButton id={product.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* mobile card list */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {products.map((product) => {
              const status = getStatusStyle(product.status);
              const stock = getStockStyle(product.stock_quantity);
              const hasSale =
                product.sale_price !== null && product.sale_price < product.price;

              return (
                <div
                  key={product.id}
                  className="rounded-[22px] border border-black/5 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">
                        {product.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {product.sku ? (
                          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600">
                            {product.sku}
                          </code>
                        ) : (
                          "No SKU"
                        )}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${status.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                      {product.categories?.[0]?.name ?? "Uncategorized"}
                    </span>

                    <span className={`text-xs font-medium ${stock.className}`}>
                      {stock.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                    <div>
                      {hasSale ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-zinc-400 line-through">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="font-semibold text-zinc-900">
                            {formatCurrency(product.sale_price as number)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-zinc-900">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg bg-blue-50 p-2 text-blue-700 transition-colors duration-150 hover:bg-blue-100"
                        title="Edit Product"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <DeleteProductButton id={product.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}