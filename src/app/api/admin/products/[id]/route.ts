import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET() {
  return NextResponse.json({
    message: "GET works",
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
    console.log("PUT API HIT");
  try {
    const { id } = await params;

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase admin client is not configured." },
        { status: 500 }
      );
    }

    // Get image URLs before deleting
    const { data: images } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", id);

    // Delete image records
    await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id);

    // Delete product
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Delete image files from Storage
    if (images?.length) {
      const paths = images
        .map((img) => {
          if (!img.image_url) return null;

          const marker = "/products/";
          const index = img.image_url.indexOf(marker);

          if (index === -1) return null;

          return img.image_url.substring(index + marker.length);
        })
        .filter(Boolean) as string[];

      if (paths.length) {
        const { error: storageError } = await supabase.storage
          .from("products")
          .remove(paths);

        if (storageError) {
          console.error(storageError);
        }
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// ================= UPDATE =================

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 500 }
      );
    }

    const {
      title,
      description,
      specifications,
      categoryId,
      imageUrls = [],
      imageUrl,
      price,
      salePrice,
      sku,
      stockQuantity,
      status,
      trackInventory,
      allowBackorders,
    } = body;

    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data, error } = await supabase
      .from("products")
      .update({
        title,
        slug,
        description,
        specifications,
        category_id: categoryId,
        price,
        sale_price: salePrice || null,
        sku,
        stock_quantity: stockQuantity,
        status,
        track_inventory: trackInventory,
        allow_backorders: allowBackorders,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Delete old image records
    await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id);

    // Insert all images again
    const urls =
      imageUrls.length > 0
        ? imageUrls
        : imageUrl
        ? [imageUrl]
        : [];

    if (urls.length) {
      const rows = urls.map(
        (url: string, index: number) => ({
          product_id: id,
          image_url: url,
          alt_text: title,
          sort_order: index + 1,
        })
      );

      const { error: imageError } = await supabase
        .from("product_images")
        .insert(rows);

      if (imageError) {
        console.error(imageError);
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