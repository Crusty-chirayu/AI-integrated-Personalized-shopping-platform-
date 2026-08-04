import { BarChart3, Package2, ShoppingBag, Users2 } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/formatCurrency";
import DashboardCharts, {
  type SalesPoint,
  type OrdersRevenuePoint,
  type CategorySlice,
  type ProductBar,
} from "@/components/admin/DashboardCharts";

function capitalize(value: string | null | undefined) {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Formats an ISO date string into a short day label, e.g. "04 Aug".
 */
function formatDayLabel(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

/**
 * Returns just the YYYY-MM-DD portion of a timestamp, used as a grouping key.
 */
function dayKey(isoDate: string) {
  return new Date(isoDate).toISOString().slice(0, 10);
}

/**
 * Groups paid orders by calendar day and returns two aligned series:
 * a simple revenue-only series (for the Sales Overview chart) and a
 * combined revenue+order-count series (for the Orders vs Revenue chart).
 */
function buildDailySeries(
  orders: { total: number | null; created_at: string | null }[]
): { sales: SalesPoint[]; ordersVsRevenue: OrdersRevenuePoint[] } {
  const map = new Map<string, { revenue: number; orders: number }>();

  for (const order of orders) {
    if (!order.created_at) continue;
    const key = dayKey(order.created_at);
    const existing = map.get(key) ?? { revenue: 0, orders: 0 };
    existing.revenue += Number(order.total ?? 0);
    existing.orders += 1;
    map.set(key, existing);
  }

  const sortedKeys = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));

  const sales: SalesPoint[] = sortedKeys.map((key) => ({
    date: formatDayLabel(key),
    revenue: map.get(key)!.revenue,
  }));

  const ordersVsRevenue: OrdersRevenuePoint[] = sortedKeys.map((key) => ({
    date: formatDayLabel(key),
    revenue: map.get(key)!.revenue,
    orders: map.get(key)!.orders,
  }));

  return { sales, ordersVsRevenue };
}

/**
 * Shape returned by the order_items join query. Adjust field names here
 * if your schema differs.
 */
type OrderItemRow = {
  quantity: number | null;
  price: number | null;
  product_id: string | null;
  products: {
    title: string | null;
    category_id: string | null;
    categories: { name: string | null } | null;
  } | null;
};

/**
 * Aggregates order_items into a category revenue breakdown (with percentage
 * share of total revenue) and a top-selling-products breakdown (by units sold).
 */
function buildProductAndCategorySeries(items: OrderItemRow[]): {
  categoryData: CategorySlice[];
  topProductsData: ProductBar[];
} {
  const categoryMap = new Map<string, number>();
  const productMap = new Map<string, { title: string; units: number }>();

  for (const item of items) {
    const quantity = Number(item.quantity ?? 0);
    const price = Number(item.price ?? 0);
    const lineRevenue = quantity * price;

    const categoryName = item.products?.categories?.name
      ? capitalize(item.products.categories.name)
      : "Uncategorized";
    categoryMap.set(categoryName, (categoryMap.get(categoryName) ?? 0) + lineRevenue);

    const productId = item.product_id ?? "unknown";
    const productTitle = item.products?.title ?? "Unknown product";
    const existing = productMap.get(productId) ?? { title: productTitle, units: 0 };
    existing.units += quantity;
    productMap.set(productId, existing);
  }

  const totalCategoryRevenue = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);

  const categoryData: CategorySlice[] = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalCategoryRevenue > 0 ? (value / totalCategoryRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const topProductsData: ProductBar[] = Array.from(productMap.values())
    .map((p) => ({ name: p.title, units: p.units }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);

  return { categoryData, topProductsData };
}

export default async function AdminHomePage() {
  const supabase = getSupabaseAdmin();

  const [ordersResult, profilesCountResult, recentOrdersResult, lowStockResult, orderItemsResult] =
    supabase
      ? await Promise.all([
          supabase
            .from("orders")
            .select("total, created_at")
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
          supabase
            .from("order_items")
            .select(
              "quantity, price, product_id, products(title, category_id, categories(name)), orders!inner(payment_status)"
            )
            .eq("orders.payment_status", "paid"),
        ])
      : [
          { data: [], error: null },
          { count: 0, error: null },
          { data: [], error: null },
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
  const orderItems = (orderItemsResult.data ?? []) as unknown as OrderItemRow[];

  const stats = [
    { label: "Revenue", value: formatCurrency(revenue) },
    { label: "Orders", value: orderCount.toLocaleString("en-IN") },
    { label: "Customers", value: customerCount.toLocaleString("en-IN") },
    { label: "Avg. order", value: formatCurrency(averageOrder) },
  ];

  const { sales: salesData, ordersVsRevenue: ordersRevenueData } = buildDailySeries(orders);
  const { categoryData, topProductsData } = buildProductAndCategorySeries(orderItems);

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
                {stat.label === "Revenue" ? (
                  <BarChart3 className="h-4 w-4" />
                ) : stat.label === "Orders" ? (
                  <ShoppingBag className="h-4 w-4" />
                ) : stat.label === "Customers" ? (
                  <Users2 className="h-4 w-4" />
                ) : (
                  <Package2 className="h-4 w-4" />
                )}
              </div>
            </div>
            <p className="mt-5 text-3xl font-semibold text-zinc-950">{stat.value}</p>
          </div>
        ))}
      </div>

      <DashboardCharts
        salesData={salesData}
        ordersRevenueData={ordersRevenueData}
        categoryData={categoryData}
        topProductsData={topProductsData}
        lowStockSlot={
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Low stock alerts</h2>
            <div className="mt-6 space-y-3">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
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
        }
      />

      <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Recent orders</h2>
        <div className="mt-6 space-y-3">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div
                key={order.order_number}
                className="flex items-center justify-between rounded-2xl bg-[#f7f3eb] px-4 py-3 text-sm text-zinc-600"
              >
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
    </div>
  );
}