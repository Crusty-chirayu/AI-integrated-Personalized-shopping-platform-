import { getSupabaseAdmin } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/formatCurrency";
import OrderFulfillmentCell from "./OrderFulfillmentCell";

type OrderRow = {
  id: string;
  order_number: string | null;
  email: string | null;
  total: number | null;
  payment_status: string | null;
  fulfillment_status: string | null;
  created_at: string | null;
};

export default async function AdminOrdersPage() {
  const client = getSupabaseAdmin();
  const { data: ordersData } = client
    ? await client
        .from("orders")
        .select("id,order_number,email,total,payment_status,fulfillment_status,created_at")
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const orders: OrderRow[] = ordersData ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Orders</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Order management</h1>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-black/5">
          <thead className="bg-[#f7f3eb] text-left text-sm text-zinc-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Fulfillment</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 text-sm text-zinc-700">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium text-zinc-900">{order.order_number ?? order.id}</td>
                <td className="px-4 py-3">{order.email ?? "Guest"}</td>
                <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                <td className="px-4 py-3">{order.payment_status ?? "pending"}</td>
                <OrderFulfillmentCell
                  orderId={order.id}
                  initialStatus={order.fulfillment_status}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}