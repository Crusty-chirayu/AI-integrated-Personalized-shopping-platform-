import { supabase } from "@/lib/supabase";

export async function getCart(userId: string) {
  return supabase
    .from("cart_items")
    .select(
      `
      quantity,
      products(*)
      `
    )
    .eq("user_id", userId);
}

export async function saveCart(
  userId: string,
  items: {
    product_id: string;
    quantity: number;
  }[]
) {
  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (items.length === 0) return;

  return supabase.from("cart_items").insert(
    items.map((item) => ({
      user_id: userId,
      product_id: item.product_id,
      quantity: item.quantity,
    }))
  );
}

export async function removeFromCart(
  userId: string,
  productId: string
) {
  return supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
}

export async function clearCart(userId: string) {
  return supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);
}