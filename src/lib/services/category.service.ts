import { getSupabaseClient } from "@/lib/supabase";

export type Category = {
  id: string;
  name: string;
};

export async function getCategories(): Promise<Category[]> {
  const client = getSupabaseClient();

  if (!client) {
    console.log("No Supabase client");
    return [];
  }

  const { data, error } = await client
    .from("categories")
  .select("id,name")
.order("name")

  console.log("Categories:", data);
  console.log("Error:", error);

  if (error) return [];

  return data ?? [];
}