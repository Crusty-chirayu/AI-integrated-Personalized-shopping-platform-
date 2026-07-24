import { getSupabaseClient } from "@/lib/supabase";

export async function uploadProductImage(file: File) {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase client not found.");
  }

  const extension = file.name.split(".").pop();

  const fileName = `${crypto.randomUUID()}.${extension}`;

  const filePath = `products/${fileName}`;

  const { error } = await client.storage
    .from("products")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = client.storage
    .from("products")
    .getPublicUrl(filePath);

  return data.publicUrl;
}