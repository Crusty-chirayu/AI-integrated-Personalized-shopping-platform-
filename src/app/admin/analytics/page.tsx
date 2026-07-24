import { getSupabaseAdmin } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/formatCurrency";

export default async function AdminAnalyticsPage() {
  const admin = getSupabaseAdmin();

  const [{ data: ordersData }, { data: customersData }] = admin
    ? await Promise.all([
        admin.from("orders").select("total"),
        admin.from("profiles").select("id"),
      ])
    : [{ data: [] }, { data: [] }];

  const orderCount = ordersData?.length ?? 0;
  const customerCount = customersData?.length ?? 0;

  const revenue =
    ordersData?.reduce(
      (sum, order) => sum + Number(order.total ?? 0),
      0
    ) ?? 0;

  const { count: productCount } = admin
    ? await admin
        .from("products")
        .select("*", { count: "exact", head: true })
    : { count: 0 };

  const { count: pendingOrders } = admin
    ? await admin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("fulfillment_status", "pending")
    : { count: 0 };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Analytics
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Performance Overview
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {/* Revenue */}
        <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Revenue
          </p>
          <p className="mt-4 text-4xl font-semibold text-zinc-950">
            {formatCurrency(revenue)}
          </p>
        </div>

        {/* Orders */}
        <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Orders
          </p>
          <p className="mt-4 text-4xl font-semibold text-zinc-950">
            {orderCount}
          </p>
        </div>

        {/* Customers */}
        <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Customers
          </p>
          <p className="mt-4 text-4xl font-semibold text-zinc-950">
            {customerCount}
          </p>
        </div>

        {/* Products */}
        <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Products
          </p>
          <p className="mt-4 text-4xl font-semibold text-zinc-950">
            {productCount ?? 0}
          </p>
        </div>

        {/* Pending Orders */}
        <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Pending Orders
          </p>
          <p className="mt-4 text-4xl font-semibold text-orange-600">
            {pendingOrders ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}