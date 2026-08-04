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

  const { data, error } = await client
    .from("orders")
    .select(
      "order_number,email,total,payment_status,fulfillment_status,created_at,subtotal,tax_amount,shipping_cost"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
