import { supabase } from "@/lib/supabase";

export async function savePreference(
  userId: string,
  updates: {
    favorite_brand?: string;
    favorite_category?: string;
    preferred_budget?: number;
  }
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: userId,
        ...updates,
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) throw error;
}

export async function getPreference(
  userId: string
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}