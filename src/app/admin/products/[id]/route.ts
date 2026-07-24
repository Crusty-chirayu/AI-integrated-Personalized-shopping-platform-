import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// ================= DELETE =================

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase admin client is not configured." },
        { status: 500 }
      );
    }

    const { data: images } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", id);

    await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id);

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
        await supabase.storage
          .from("products")
          .remove(paths);
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
      categoryId,
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

    if (imageUrl) {
      const { data: existing } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", id)
        .limit(1);

      if (existing?.length) {
        await supabase
          .from("product_images")
          .update({
            image_url: imageUrl,
            alt_text: title,
          })
          .eq("product_id", id);
      } else {
        await supabase
          .from("product_images")
          .insert({
            product_id: id,
            image_url: imageUrl,
            alt_text: title,
            sort_order: 1,
          });
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