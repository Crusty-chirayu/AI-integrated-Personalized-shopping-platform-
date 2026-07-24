"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import OrderCard from "@/components/orders/order-card";

export default function OrdersPage() {
  const router = useRouter();
const { user, loading } = useAuth();

const [orders, setOrders] = useState<any[]>([]);
const [loadingOrders, setLoadingOrders] = useState(true);


useEffect(() => {
  if (loading) return;

  if (!user) {
    router.replace("/login");
    return;
  }

  const fetchOrders = async () => {
    setLoadingOrders(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setOrders(data ?? []);
    }

    setLoadingOrders(false);
  };

  fetchOrders();
}, [loading, user, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <p className="text-lg text-zinc-600">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Orders
          </p>

          <h1 className="mt-3 text-4xl font-bold text-zinc-900">
            My Orders
          </h1>

          <p className="mt-3 text-zinc-600">
            Track your purchases and view previous orders.
          </p>
        </div>

<Link
  href="/products"
  className="rounded-full bg-zinc-950 px-6 py-3 text-white hover:bg-zinc-800 transition-colors"
>
  Continue Shopping
</Link>
      </div>



<div className="mt-12 grid gap-6">

  {loadingOrders ? (
    <div className="rounded-3xl border border-zinc-200 p-10 text-center">
      <p className="text-zinc-500">Loading orders...</p>
    </div>
  ) : orders.length === 0 ? (
    <div className="rounded-3xl border border-zinc-200 p-10 text-center">
      <h2 className="text-xl font-semibold text-zinc-900">
        No orders yet
      </h2>

      <p className="mt-3 text-zinc-500">
        You haven't placed any orders yet.
      </p>
    </div>
  ) : (
    orders.map((order) => (
      <OrderCard
        key={order.id}
        orderId={order.order_number}
        date={new Date(order.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        total={order.total}
        status={
          order.fulfillment_status === "delivered"
            ? "Delivered"
            : order.fulfillment_status === "processing"
            ? "Processing"
            : order.fulfillment_status === "cancelled"
            ? "Cancelled"
            : "Pending"
        }
      />
    ))
  )}

</div>





    </div>
  );
}