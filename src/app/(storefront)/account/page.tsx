"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase";

export default function AccountPage() {
const {
  user,
  loading,
  signOut,
} = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState("");



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

if (loading) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 text-center">
      <p className="text-zinc-600 text-lg">
        Loading your account...
      </p>
    </div>
  );
}



const handleSignOut = async () => {
  await signOut();
  router.replace("/login");
};

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>


<p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
  Account
</p>


{user ? (
  <>
    <h1 className="mt-3 text-4xl font-semibold text-zinc-950">
      Welcome back! 👋
    </h1>

    <p className="mt-5 text-lg leading-8 text-zinc-600">
      You're signed in as{" "}
      <span className="font-semibold text-zinc-900">
        {user.email}
      </span>
      .
    </p>

    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-black/10 p-5">
        <h3 className="font-semibold text-zinc-900">📦 Orders</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Track your orders and purchase history.
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 p-5">
        <h3 className="font-semibold text-zinc-900">❤️ Wishlist</h3>
        <p className="mt-2 text-sm text-zinc-600">
          View products you've saved for later.
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 p-5">
        <h3 className="font-semibold text-zinc-900">📍 Addresses</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Manage your shipping addresses.
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 p-5">
        <h3 className="font-semibold text-zinc-900">⚙️ Settings</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Update your account preferences.
        </p>
      </div>
    </div>
  </>
) : (
  <>
    <h1 className="mt-3 text-4xl font-semibold text-zinc-950">
      Redirecting to login...
    </h1>

    <p className="mt-5 text-lg leading-8 text-zinc-600">
      Please wait while we redirect you to the sign-in page.
    </p>
  </>
)}





</div>

      <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
  <h2 className="text-2xl font-semibold text-zinc-900">
    My Account
  </h2>






  <div className="mt-6 space-y-4">
    <div className="rounded-2xl bg-zinc-50 p-4">
      <p className="text-sm text-zinc-500">Email</p>
      <p className="font-medium">{user?.email}</p>
    </div>

    <div className="rounded-2xl bg-zinc-50 p-4">
      <p className="text-sm text-zinc-500">Account Status</p>
      <p className="font-medium text-green-600">
        Logged In
      </p>
    </div>

    <button
onClick={handleSignOut}


      className="mt-6 w-full rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
    >
      Sign Out
    </button>
  </div>
  </div>
</div>
</div>
);
}
