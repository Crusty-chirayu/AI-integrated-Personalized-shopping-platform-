"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

type UserProfile = {
  id: string;
  email?: string | null;
  role?: string | null;
};

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadUserProfile(client: ReturnType<typeof getSupabaseClient>, user: { id: string; email?: string | null }) {
  if (!client) {
    return {
      id: user.id,
      email: user.email,
      role: null,
    };
  }

  const { data } = await client.from("profiles").select("role").eq("id", user.id).single();
  return {
    id: user.id,
    email: user.email,
    role: data?.role ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    client.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const profile = await loadUserProfile(client, sessionUser);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser) {
        const profile = await loadUserProfile(client, sessionUser);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);





const signIn = async (email: string, password: string) => {
  console.log("Starting login...");

  const client = getSupabaseClient();

  if (!client) {
    console.log("Supabase client is NULL");
    throw new Error("Supabase client not available.");
  }

  console.log("Calling Supabase...");

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  console.log("Supabase response:", data, error);

  if (error) {
    throw error;
  }
};

const signUp = async (email: string, password: string) => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not available.");

  const { error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }
};

const signInWithGoogle = async () => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not available.");

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
  });

  if (error) {
    throw error;
  }
};

const signOut = async () => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not available.");

  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
};

  const value = useMemo(
    () => ({ user, loading, isAdmin: Boolean(user?.role === "admin"), signIn, signUp, signInWithGoogle, signOut }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
