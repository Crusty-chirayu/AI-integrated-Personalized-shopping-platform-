import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST() {
  const client = getSupabaseClient();

  if (!client) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 400 });
  }

  const { data: existing } = await client.from("products").select("id").limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ message: "Products already seeded" });
  }

  const seedProducts = [
    {
      title: "Contour Tote",
      slug: "contour-tote",
      description: "Sculpted carryall with a refined matte finish.",
      price: 148,
      sale_price: 128,
      stock_quantity: 12,
      status: "active",
      tags: ["new"],
    },
    {
      title: "Aero Chair",
      slug: "aero-chair",
      description: "Balanced comfort with a sculptural silhouette.",
      price: 320,
      stock_quantity: 7,
      status: "active",
      tags: ["bestseller"],
    },
  ];

  const { error } = await client.from("products").insert(seedProducts);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Seeded products" });
}
