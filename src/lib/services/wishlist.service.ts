import { supabase } from "@/lib/supabase";

export async function getWishlist(userId: string) {
  return supabase
    .from("wishlist")
    .select(
      `
      product_id,
      products(*)
      `
    )
    .eq("user_id", userId);
}

export async function saveWishlist(
  userId: string,
  productIds: string[]
) {
  await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", userId);

  if (productIds.length === 0) return;

  return supabase.from("wishlist").insert(
    productIds.map((id) => ({
      user_id: userId,
      product_id: id,
    }))
  );
}

export async function removeFromWishlist(
  userId: string,
  productId: string
) {
  return supabase
    .from("wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
}

export async function clearWishlist(userId: string) {
  return supabase
    .from("wishlist")
    .delete()
    .eq("user_id", userId);
}