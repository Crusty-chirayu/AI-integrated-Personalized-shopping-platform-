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
export async function signInWithProvider(
  provider: "google" | "github"
) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}