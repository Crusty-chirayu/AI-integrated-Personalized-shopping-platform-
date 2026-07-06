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
    const client = getSupabaseClient();
    if (!client) return;
    await client.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string) => {
    const client = getSupabaseClient();
    if (!client) return;
    await client.auth.signUp({ email, password });
  };

  const signInWithGoogle = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    await client.auth.signInWithOAuth({ provider: "google" });
  };

  const signOut = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    await client.auth.signOut();
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
