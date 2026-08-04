import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  const client = getSupabaseAdmin();

  if (!client) {
    return NextResponse.json(
      { error: "Supabase admin client unavailable" },
      { status: 500 }
    );
  }

  const [{ data: profilesData, error: profilesError }, { data: ordersData, error: ordersError }] =
    await Promise.all([
      client
        .from("profiles")
        .select("id,email,full_name,role,created_at")
        .order("created_at", { ascending: false }),
      client
        .from("orders")
        .select("email,total,created_at,order_number")
        .order("created_at", { ascending: false }),
    ]);

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const customersMap = new Map<string, any>();

  for (const profile of profilesData ?? []) {
    const email = typeof profile.email === "string" ? profile.email.toLowerCase() : "";

    customersMap.set(email || profile.id, {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name ?? "Customer",
      role: profile.role ?? "customer",
      created_at: profile.created_at,
      orders_count: 0,
      total_spent: 0,
      last_order_date: null,
      last_order_number: null,
    });
  }

  for (const order of ordersData ?? []) {
    const email = typeof order.email === "string" ? order.email.toLowerCase() : "";
    const key = email || `order-${order.order_number}`;
    const existing = customersMap.get(key);

    const orderTotal = Number(order.total || 0);
    const orderDate = order.created_at;

    if (existing) {
      existing.orders_count += 1;
      existing.total_spent += orderTotal;
      if (!existing.last_order_date || orderDate > existing.last_order_date) {
        existing.last_order_date = orderDate;
        existing.last_order_number = order.order_number;
      }
    } else {
      customersMap.set(key, {
        id: order.order_number,
        email: order.email,
        full_name: order.email ? order.email.split("@")[0] : "Customer",
        role: "customer",
        created_at: orderDate,
        orders_count: 1,
        total_spent: orderTotal,
        last_order_date: orderDate,
        last_order_number: order.order_number,
      });
    }
  }

  return NextResponse.json(Array.from(customersMap.values()));
}
