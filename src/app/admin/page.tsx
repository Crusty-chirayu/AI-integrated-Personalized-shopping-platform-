import { BarChart3, Package2, ShoppingBag, Users2 } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/formatCurrency";

function capitalize(value: string | null | undefined) {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function AdminHomePage() {
  const supabase = getSupabaseAdmin();

  const [ordersResult, profilesCountResult, recentOrdersResult, lowStockResult] = supabase
    ? await Promise.all([
supabase
  .from("orders")
  .select("total")
  .eq("payment_status", "paid"),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("order_number, payment_status, fulfillment_status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("products")
          .select("id, title, stock_quantity")
.lte("stock_quantity", 5)
          .order("stock_quantity", { ascending: true }),
      ])
    : [
        { data: [], error: null },
        { count: 0, error: null },
        { data: [], error: null },
        { data: [], error: null },
      ];

  const orders = ordersResult.data ?? [];
  const orderCount = orders.length;
  const revenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const customerCount = profilesCountResult.count ?? 0;
  const averageOrder = orderCount > 0 ? revenue / orderCount : 0;

  const recentOrders = recentOrdersResult.data ?? [];
  const lowStockProducts = lowStockResult.data ?? [];

  const stats = [
    { label: "Revenue", value: formatCurrency(revenue) },
    { label: "Orders", value: orderCount.toLocaleString("en-IN") },
    { label: "Customers", value: customerCount.toLocaleString("en-IN") },
    { label: "Avg. order", value: formatCurrency(averageOrder) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Welcome back, admin.</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">{stat.label}</p>
              <div className="rounded-full bg-[#f5f2ea] p-2 text-zinc-700">
                {stat.label === "Revenue" ? <BarChart3 className="h-4 w-4" /> : stat.label === "Orders" ? <ShoppingBag className="h-4 w-4" /> : stat.label === "Customers" ? <Users2 className="h-4 w-4" /> : <Package2 className="h-4 w-4" />}
              </div>
            </div>
            <p className="mt-5 text-3xl font-semibold text-zinc-950">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Recent orders</h2>
          <div className="mt-6 space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.order_number} className="flex items-center justify-between rounded-2xl bg-[#f7f3eb] px-4 py-3 text-sm text-zinc-600">
                  <span>{order.order_number}</span>
                  <span>
                    {capitalize(order.payment_status)} · {capitalize(order.fulfillment_status)}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-[#f7f3eb] px-4 py-3 text-sm text-zinc-600">
                No recent orders.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Low stock alerts</h2>
          <div className="mt-6 space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {product.title} · {product.stock_quantity} left
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                No low stock products.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}