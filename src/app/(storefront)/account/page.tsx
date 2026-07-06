"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase";

export default function AccountPage() {
  const { user, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setStatus("Supabase credentials are not configured yet.");
    }
  }, []);

  const submit = async () => {
    try {
      if (mode === "sign-in") {
        await signIn(email, password);
        setStatus("Signed in successfully.");
      } else {
        await signUp(email, password);
        setStatus("Account created. Check your email for confirmation.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Account</p>
          <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Sign in to save your orders and preferences.</h1>
          <p className="mt-5 text-lg leading-8 text-zinc-600">
            Use email and password auth for now, with Supabase ready for Google OAuth when enabled.
          </p>
        </div>
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          {user ? (
            <div>
              <p className="text-sm font-medium text-zinc-600">Signed in as {user.email}</p>
              <button onClick={() => signOut()} className="mt-6 rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white">
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex rounded-full border border-black/10 bg-[#f7f3eb] p-1">
                <button onClick={() => setMode("sign-in")} className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === "sign-in" ? "bg-white text-zinc-950" : "text-zinc-600"}`}>
                  Sign in
                </button>
                <button onClick={() => setMode("sign-up")} className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === "sign-up" ? "bg-white text-zinc-950" : "text-zinc-600"}`}>
                  Sign up
                </button>
              </div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-full border border-black/10 bg-[#f7f3eb] px-4 outline-none" placeholder="Email" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-full border border-black/10 bg-[#f7f3eb] px-4 outline-none" placeholder="Password" />
              <button onClick={submit} className="w-full rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white">
                {mode === "sign-in" ? "Sign in" : "Create account"}
              </button>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="mt-4 w-full rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-zinc-950"
              >
                Continue with Google
              </button>
              {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
