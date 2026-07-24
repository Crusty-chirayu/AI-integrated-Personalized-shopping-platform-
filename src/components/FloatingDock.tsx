"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";

export default function FloatingDock() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">

      <Link
        href="/assistant"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl hover:scale-110 transition"
      >
        <Sparkles className="h-6 w-6" />
      </Link>

      <Link
        href="/cart"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-xl hover:scale-110 transition"
      >
        <ShoppingBag className="h-6 w-6" />
      </Link>

      <Link
        href="/wishlist"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-xl hover:scale-110 transition"
      >
        <Heart className="h-6 w-6" />
      </Link>

    </div>
  );
}