"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Search, ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { SearchModal } from "@/components/search-modal";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/admin", label: "Admin" },
];

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf7f0] text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#faf7f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-[0.2em] uppercase">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
              <Sparkles className="h-4 w-4" />
            CartIQ
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-700 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition ${pathname === link.href ? "text-zinc-950" : "hover:text-zinc-950"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} className="rounded-full border border-black/10 p-2.5 text-zinc-700 transition hover:bg-white">
              <Search className="h-4 w-4" />
            </button>
            <Link href="/cart" className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:shadow-md">
              <ShoppingBag className="h-4 w-4" />
              Cart ({itemCount})
            </Link>
            <button className="rounded-full border border-black/10 p-2.5 text-zinc-700 transition hover:bg-white md:hidden">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        {children}
      </motion.main>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <footer className="border-t border-black/5 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-3 lg:px-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">CartIQ</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-600">
              Elevated objects for everyday life, shipped with care and crafted to last.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Explore</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-600">
              <Link href="/products">Shop</Link>
              <Link href="/about">About</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/policies">Policies</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Visit</p>
            <p className="mt-4 text-sm leading-7 text-zinc-600">support@cartiq.example<br />18 Commerce Street, New York</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
