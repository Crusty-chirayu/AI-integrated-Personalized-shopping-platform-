import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      specifications,
      imageUrls = [],
      imageUrl,
      categoryId,
      price,
      salePrice,
      sku,
      stockQuantity,
      status,
      trackInventory,
      allowBackorders,
    } = body;

    console.log("SPECIFICATIONS RECEIVED:", specifications);
console.log("FULL BODY:", body);

    if (!title) {
      return NextResponse.json(
        { error: "Product title is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase admin client is not configured." },
        { status: 500 }
      );
    }

    const slug = slugify(title);

    console.log("INSERTING SPECIFICATIONS:", specifications);

    const { data, error } = await supabase
      .from("products")
      .insert({
        title,
        slug,
        description,
        specifications,
        category_id: categoryId,
        price,
        sale_price: salePrice || null,
        sku,
        stock_quantity: stockQuantity,
        track_inventory: trackInventory,
        allow_backorders: allowBackorders,
        status,
      })

      
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    console.log("IMAGE URLS RECEIVED:", imageUrls);
console.log("IMAGE URL RECEIVED:", imageUrl);

    // Save ALL uploaded images
    const urls =
      imageUrls.length > 0
        ? imageUrls
        : imageUrl
        ? [imageUrl]
        : [];

    if (urls.length) {
      const rows = urls.map(
        (url: string, index: number) => ({
          product_id: data.id,
          image_url: url,
          sort_order: index + 1,
          alt_text: title,
        })
      );

const { data: insertedImages, error: imageError } = await supabase
  .from("product_images")
  .insert(rows)
  .select();

console.log("ROWS TO INSERT:", rows);
console.log("INSERTED IMAGES:", insertedImages);

if (imageError) {
  console.error("IMAGE INSERT ERROR:", imageError);
}
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}