"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase";

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const client = getSupabaseClient();

    if (!client) {
      setStatus("Supabase credentials are not configured yet");
      return;
    }

    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.replace("/login");
  };

  const initials =
    user?.email
      ?.split("@")[0]
      ?.slice(0, 2)
      ?.toUpperCase() ?? "—";

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24 lg:px-10">
        <div className="animate-pulse space-y-8">
          <div className="h-40 rounded-[28px] bg-zinc-100" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-28 rounded-2xl bg-zinc-100" />
            <div className="h-28 rounded-2xl bg-zinc-100" />
            <div className="h-28 rounded-2xl bg-zinc-100" />
            <div className="h-28 rounded-2xl bg-zinc-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
        {/* ---------------------------------------------------- */}
        {/* HERO */}
        {/* ---------------------------------------------------- */}
        <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-[#14171A] px-8 py-14 sm:px-12 sm:py-16">
          {/* ambient gradient mesh */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(560px circle at 12% 18%, rgba(47,111,94,0.55), transparent 60%), radial-gradient(480px circle at 88% 82%, rgba(217,142,74,0.35), transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          <div className="relative flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.28em] text-white/50"
                style={{ fontFamily: "var(--font-mono, ui-monospace)" }}
              >
                Account
              </p>

              {user ? (
                <>
                  <h1
                    className="mt-4 text-4xl font-medium text-white sm:text-5xl"
                    style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
                  >
                    Welcome back
                  </h1>
                  <p className="mt-4 max-w-md text-[15px] leading-7 text-white/60">
                    Signed in as{" "}
                    <span className="font-medium text-white/90">
                      {user.email}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <h1
                    className="mt-4 text-4xl font-medium text-white sm:text-5xl"
                    style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
                  >
                    Redirecting…
                  </h1>
                  <p className="mt-4 max-w-md text-[15px] leading-7 text-white/60">
                    Taking you to sign in.
                  </p>
                </>
              )}
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg font-medium text-white backdrop-blur-md">
                  {initials}
                </div>
                <div
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-white/70 backdrop-blur-md"
                  style={{ fontFamily: "var(--font-mono, ui-monospace)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                  Active session
                </div>
              </div>
            )}
          </div>

          {status && (
            <p className="relative mt-8 rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              {status}
            </p>
          )}
        </section>

        {/* ---------------------------------------------------- */}
        {/* BODY */}
        {/* ---------------------------------------------------- */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Navigation tiles */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: "📦",
                title: "Orders",
                copy: "Track orders and view your purchase history.",
              },
              {
                icon: "❤️",
                title: "Wishlist",
                copy: "Products you've saved for later.",
              },
              {
                icon: "📍",
                title: "Addresses",
                copy: "Manage your shipping addresses.",
              },
              {
                icon: "⚙️",
                title: "Settings",
                copy: "Update your account preferences.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-black/[0.06] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-black/10 hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.18)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F2EF] text-lg">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-[15px] font-medium text-zinc-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>

          {/* Account card */}
          <div className="rounded-[28px] border border-black/[0.06] bg-white p-7 sm:p-8">
            <h2
              className="text-xl font-medium text-zinc-900"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
            >
              My account
            </h2>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-[#F6F7F5] px-4 py-3.5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                  Email
                </p>
                <p className="mt-1 text-[15px] font-medium text-zinc-900">
                  {user?.email ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F6F7F5] px-4 py-3.5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                  Account status
                </p>
                <p className="mt-1 flex items-center gap-2 text-[15px] font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Logged in
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="mt-7 w-full rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}