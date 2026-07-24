import { supabase } from "@/lib/supabase";

export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // No active session is normal.
  // Return null instead of throwing.
  if (error) {
    if (error.name === "AuthSessionMissingError") {
      return null;
    }

    console.error(error);
    return null;
  }

  return user;
}