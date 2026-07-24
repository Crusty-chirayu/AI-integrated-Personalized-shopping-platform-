import Link from "next/link";
import { Home, Search, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6">
      {/* Decorative gradient blobs */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 40% at 12% 15%, rgba(79,70,229,0.12), transparent 60%), radial-gradient(40% 40% at 88% 20%, rgba(20,184,166,0.12), transparent 60%), radial-gradient(35% 35% at 50% 100%, rgba(79,70,229,0.06), transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-lg rounded-[36px] border border-black/5 bg-white/70 p-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-14">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 shadow-md">
          <Search className="h-6 w-6 text-white" />
        </div>

        <p className="mt-8 bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-7xl font-bold tracking-[-0.03em] text-transparent sm:text-8xl">
          404
        </p>

        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.01em] text-zinc-950 sm:text-3xl">
          Page Not Found
        </h1>

        <p className="mt-4 text-base leading-7 text-zinc-600">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-6 py-3.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)] hover:brightness-105"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-medium text-zinc-800 transition hover:border-indigo-200 hover:bg-zinc-50"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}