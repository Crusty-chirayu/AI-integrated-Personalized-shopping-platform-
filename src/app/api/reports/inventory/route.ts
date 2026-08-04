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
    .from("products")
    .select(
      "id,title,sku,price,sale_price,stock_quantity,status,created_at,categories(name)"
    )
    .order("stock_quantity", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
