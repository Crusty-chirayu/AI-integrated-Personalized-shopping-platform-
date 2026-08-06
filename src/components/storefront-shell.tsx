"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import FloatingDock from "@/components/FloatingDock";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  Github,
  Heart,
  Home,
  Info,
  LayoutDashboard,
  LayoutGrid,
  Linkedin,
  LogOut,
  Mail,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  UserCircle,
  X,
}
from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { SearchModal } from "@/components/search-modal";
import { supabase } from "@/lib/supabase";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

const footerQuickLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart", label: "Cart" },
];

const footerSupportLinks = [
  { href:"/help-centre", label: "Help Center" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];

const CONTACT_EMAIL = "chirayujaysawal7@gmail.com";
const GITHUB_URL = "https://github.com/Crusty-chirayu";
const LINKEDIN_URL = "https://www.linkedin.com/in/chirayu-jayaswal";

type ProfileRole = "admin" | "customer" | null;

export function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [authUser, setAuthUser] = useState<any>(null);
  const [role, setRole] = useState<ProfileRole>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthUser(null);
        setRole(null);
        return;
      }

      setAuthUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole((profile?.role as ProfileRole) ?? "customer");
    }

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setRole(null);
    setProfileOpen(false);
    setMobileOpen(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#faf7f0] text-zinc-900">
      <header
        className={`sticky top-0 z-40 border-b bg-white/70 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled
            ? "border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            : "border-black/0 shadow-none"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-950">
                CartIQ
              </h1>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                AI Shopping Assistant
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium text-zinc-600 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 transition hover:text-zinc-950"
                >
                  <span className={active ? "text-zinc-950" : ""}>
                    {link.label}
                  </span>

                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-gradient-to-r from-indigo-600 to-teal-500"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/assistant"
              className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)] hover:brightness-105 sm:flex"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI
            </Link>

            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-full border border-black/10 p-2.5 text-zinc-700 transition hover:border-indigo-200 hover:bg-white hover:shadow-[0_0_0_4px_rgba(79,70,229,0.08)]"
            >
              <Search className="h-4 w-4" />
            </button>

            <Link
              href="/wishlist"
              className="group relative rounded-full border border-black/10 bg-white p-2.5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <Heart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />

              {wishlistItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="group relative rounded-full border border-black/10 bg-white p-2.5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />

              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 text-[10px] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="group relative rounded-full border border-black/10 bg-white p-2.5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <User className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div
                      onClick={() => setProfileOpen(false)}
                      className="fixed inset-0 z-40"
                    />

                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                    >
                      {!authUser ? (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-[#f7f3eb] hover:text-zinc-950"
                          >
                            <User className="h-4 w-4 text-zinc-400" />
                            Login
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-[#f7f3eb] hover:text-zinc-950"
                          >
                            <UserCircle className="h-4 w-4 text-zinc-400" />
                            Register
                          </Link>
                        </>
                      ) : role === "admin" ? (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-[#f7f3eb] hover:text-zinc-950"
                          >
                            <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                            Admin Dashboard
                          </Link>
                          <Link
                            href="/account"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-[#f7f3eb] hover:text-zinc-950"
                          >
                            <UserCircle className="h-4 w-4 text-zinc-400" />
                            Account
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/account"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-[#f7f3eb] hover:text-zinc-950"
                          >
                            <UserCircle className="h-4 w-4 text-zinc-400" />
                            Account
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-[#f7f3eb] hover:text-zinc-950"
                          >
                            <ClipboardList className="h-4 w-4 text-zinc-400" />
                            My Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-full border border-black/10 p-2.5 text-zinc-700 transition hover:bg-white md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>



<motion.main
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45 }}
>
  {children}
</motion.main>

<FloatingDock />



      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-3 right-3 z-50 w-[85%] max-w-sm rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] md:hidden"
            >
              <div className="flex items-center justify-between px-2 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-base font-bold text-zinc-950">CartIQ</span>
                </div>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-black/10 p-2 text-zinc-600 transition hover:bg-zinc-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition ${
                        active
                          ? "bg-gradient-to-r from-indigo-50 to-teal-50 text-zinc-950"
                          : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${active ? "text-indigo-600" : "text-zinc-400"}`} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 border-t border-black/5 pt-4">
                <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
                  Account
                </p>

                <nav className="flex flex-col gap-1">
                  {!authUser ? (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-zinc-600 transition hover:bg-zinc-50"
                      >
                        <User className="h-4.5 w-4.5 text-zinc-400" />
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-zinc-600 transition hover:bg-zinc-50"
                      >
                        <UserCircle className="h-4.5 w-4.5 text-zinc-400" />
                        Register
                      </Link>
                    </>
                  ) : role === "admin" ? (
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-zinc-600 transition hover:bg-zinc-50"
                      >
                        <LayoutDashboard className="h-4.5 w-4.5 text-zinc-400" />
                        Admin Dashboard
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-zinc-600 transition hover:bg-zinc-50"
                      >
                        <UserCircle className="h-4.5 w-4.5 text-zinc-400" />
                        Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4.5 w-4.5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-zinc-600 transition hover:bg-zinc-50"
                      >
                        <UserCircle className="h-4.5 w-4.5 text-zinc-400" />
                        Account
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-zinc-600 transition hover:bg-zinc-50"
                      >
                        <ClipboardList className="h-4.5 w-4.5 text-zinc-400" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4.5 w-4.5" />
                        Logout
                      </button>
                    </>
                  )}
                </nav>
              </div>

              <Link
                href="/assistant"
                className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-3.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ask AI
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= FOOTER ================= */}
      <footer className="relative overflow-hidden border-t border-black/5 bg-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 40% at 8% 0%, rgba(79,70,229,0.05), transparent 60%), radial-gradient(40% 35% at 95% 10%, rgba(20,184,166,0.05), transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-10">
          <div className="grid gap-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-base font-bold tracking-tight text-zinc-950">
                  CartIQ
                </span>
              </Link>

              <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-600">
                CartIQ is an AI-powered shopping assistant that helps
                customers discover the right products through personalized
                recommendations, intelligent search and conversational AI.
              </p>
            </div>

            {/* Quick Links */}
            <nav aria-label="Quick links">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-900">
                Quick Links
              </p>

              <ul className="mt-5 flex flex-col gap-3.5 text-sm text-zinc-600">
                {footerQuickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block rounded-sm transition-colors duration-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Support */}
            <nav aria-label="Support links">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-900">
                Support
              </p>

              <ul className="mt-5 flex flex-col gap-3.5 text-sm text-zinc-600">
                {footerSupportLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block rounded-sm transition-colors duration-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Connect */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-900">
                Connect
              </p>

              <div className="mt-5 flex items-center gap-3">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CartIQ on GitHub (opens in a new tab)"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-zinc-600 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CartIQ on LinkedIn (opens in a new tab)"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-zinc-600 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  aria-label={`Email CartIQ at ${CONTACT_EMAIL}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-zinc-600 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-4 inline-block break-all text-sm text-zinc-500 transition-colors duration-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="mt-14 flex flex-col-reverse items-center justify-between gap-4 border-t border-black/5 pt-8 sm:flex-row">
            <p className="text-center text-sm text-zinc-500 sm:text-left">
              © 2026 CartIQ. Developed by Chirayu Babu Jaysawal & Team.   |   All Rights
              Reserved.
            </p>

            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-zinc-400">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
              <span>Powered by DeepSeek AI &amp; CartIQ Intelligence</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}