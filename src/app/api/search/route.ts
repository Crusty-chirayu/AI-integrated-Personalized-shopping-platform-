import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const searchTerm = request.nextUrl.searchParams.get("q")?.trim();

  if (!searchTerm || searchTerm.length < 2) {
    return NextResponse.json([]);
  }

  // Search 1: Products by title/description/tags
  const { data: productResults, error: productError } = await supabase
    .from("products")
    .select(`
      id,
      title,
      slug,
      description,
      price,
      stock_quantity,
      status,
      category_id,
      product_images(image_url)
    `)
    .eq("status", "active")
.or(
  `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
)

  if (productError) {
    console.error(productError);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  // Search 2: Find matching categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", `%${searchTerm}%`);

  let categoryProducts: any[] = [];

  if (categories && categories.length > 0) {
    const categoryIds = categories.map((c) => c.id);

    const { data } = await supabase
      .from("products")
      .select(`
        id,
        title,
        slug,
        description,
        price,
        stock_quantity,
        status,
        category_id,
        product_images(image_url)
      `)
      .eq("status", "active")
      .in("category_id", categoryIds);

    categoryProducts = data ?? [];
  }

  // Merge and remove duplicates
  const merged = [...(productResults ?? []), ...categoryProducts];

  const unique = Array.from(
    new Map(merged.map((item) => [item.id, item])).values()
  );

  unique.sort(
    (a, b) => (b.stock_quantity ?? 0) - (a.stock_quantity ?? 0)
  );

  return NextResponse.json(unique.slice(0, 12));
}