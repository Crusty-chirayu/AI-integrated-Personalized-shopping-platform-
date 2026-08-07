"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import FloatingDock from "@/components/FloatingDock";
import { AnimatePresence, motion, useReducedMotion, easeInOut } from "framer-motion";
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
  Send,
  ShoppingBag,
  Sparkles,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  { href: "/help-centre", label: "Help Center" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];

/** Mobile bottom nav reuses the exact same routes already defined above —
 *  no new routes are introduced anywhere in this file. */
const mobileBottomNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Shop", icon: Package },
  { href: "/assistant", label: "AI", icon: Sparkles },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
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
  const prefersReducedMotion = useReducedMotion();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);

  const [authUser, setAuthUser] = useState<any>(null);
  const [role, setRole] = useState<ProfileRole>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Newsletter — UI-only local state. No submission endpoint exists in this
  // codebase yet, so this intentionally does not call any API; wire
  // `handleNewsletterSubmit` up to your real endpoint when one exists.
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const lastScrollY = useRef(0);

  // True when we are on the AI assistant page — FloatingDock must be hidden
  // there because it overlays the chat input bar.
  const isAssistantPage = pathname === "/assistant";

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 8);

      // Hide on scroll down, reveal on scroll up. Ignore tiny jitters and
      // never hide near the very top of the page.
      const delta = y - lastScrollY.current;
      if (y < 80) {
        setHeaderHidden(false);
      } else if (delta > 4) {
        setHeaderHidden(true);
        setProfileOpen(false);
      } else if (delta < -4) {
        setHeaderHidden(false);
      }
      lastScrollY.current = y;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
    setTimeout(() => setNewsletterSubmitted(false), 3200);
    setNewsletterEmail("");
  };

  const userInitial = useMemo(() => {
    const source = authUser?.email as string | undefined;
    return source ? source.charAt(0).toUpperCase() : null;
  }, [authUser]);

  return (
    <div className="relative min-h-screen bg-[#faf7f0] text-zinc-900">
      {/* ==================================================================
          AMBIENT BACKGROUND — animated gradients, floating blurred lights,
          noise texture. Sits behind everything, purely decorative.
         ================================================================== */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 35% at 8% 0%, rgba(79,70,229,0.05), transparent 60%), radial-gradient(40% 35% at 95% 8%, rgba(20,184,166,0.05), transparent 60%), radial-gradient(35% 35% at 50% 100%, rgba(217,70,239,0.035), transparent 60%)",
          }}
        />
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute left-[8%] top-[10%] h-72 w-72 rounded-full bg-indigo-200/25 blur-3xl"
              animate={{ x: [0, 24, -10, 0], y: [0, -16, 12, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: easeInOut }}
              style={{ willChange: "transform" }}
            />
            <motion.div
              className="absolute right-[6%] top-[26%] h-80 w-80 rounded-full bg-teal-200/20 blur-3xl"
              animate={{ x: [0, -20, 14, 0], y: [0, 14, -10, 0] }}
              transition={{ duration: 24, repeat: Infinity, ease: easeInOut, delay: 1.5 }}
              style={{ willChange: "transform" }}
            />
          </>
        )}
        <svg className="absolute inset-0 h-full w-full opacity-[0.025] mix-blend-multiply">
          <filter id="cartiq-shell-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#cartiq-shell-noise)" />
        </svg>
      </div>

      {/* ==================================================================
          HEADER — floating glass nav, scroll-aware hide/reveal
         ================================================================== */}
      <motion.header
        animate={{ y: headerHidden ? "-100%" : "0%" }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        className={`sticky top-0 z-40 border-b bg-white/70 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled
            ? "border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            : "border-black/0 shadow-none"
        }`}
      >
        {/* Animated gradient border along the bottom edge */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="group flex items-center">
            <motion.div
              whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="relative"
            >
              <span className="pointer-events-none absolute -inset-3 -z-10 rounded-full bg-gradient-to-r from-indigo-400/0 via-indigo-400/20 to-teal-400/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              <Image
                src="/logo.svg"
                alt="CartIQ"
                width={210}
                height={60}
                priority
                className="h-12 w-auto object-contain"
              />
            </motion.div>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium text-zinc-600 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative px-4 py-2 transition hover:text-zinc-950"
                >
                  <span className={active ? "text-zinc-950" : ""}>
                    {link.label}
                  </span>

                  {/* Hover glow underline (non-active links) */}
                  {!active && (
                    <span className="pointer-events-none absolute inset-x-3 -bottom-[1px] h-[2px] scale-x-0 rounded-full bg-gradient-to-r from-indigo-300 to-teal-300 transition-transform duration-300 group-hover:scale-x-100" />
                  )}

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
            <Link href="/assistant" className="hidden sm:block">
              <motion.span
                whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                className="relative flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)] hover:brightness-105"
              >
                {!prefersReducedMotion && (
                  <motion.span
                    className="pointer-events-none absolute inset-0 bg-white/25"
                    initial={{ x: "-120%" }}
                    animate={{ x: "220%" }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: easeInOut, repeatDelay: 1.5 }}
                    style={{ skewX: -20 }}
                  />
                )}
                <Sparkles className="relative h-3.5 w-3.5" />
                <span className="relative">Ask AI</span>
              </motion.span>
            </Link>

            <motion.button
              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="rounded-full border border-black/10 p-2.5 text-zinc-700 outline-none transition hover:border-indigo-200 hover:bg-white hover:shadow-[0_0_0_4px_rgba(79,70,229,0.08)] focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Search className="h-4 w-4" />
            </motion.button>

            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistItems.length} items)`}
              className="group relative rounded-full border border-black/10 bg-white p-2.5 shadow-sm outline-none transition hover:border-indigo-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Heart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />

              <AnimatePresence>
                {wishlistItems.length > 0 && (
                  <motion.span
                    key={wishlistItems.length}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm"
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <Link
              href="/cart"
              aria-label={`Cart (${itemCount} items)`}
              className="group relative rounded-full border border-black/10 bg-white p-2.5 shadow-sm outline-none transition hover:border-indigo-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />

              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 text-[10px] font-bold text-white shadow-sm"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <div className="relative hidden md:block">
              <motion.button
                whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Open profile menu"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm outline-none transition hover:border-indigo-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {userInitial ? (
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 text-sm font-semibold text-white">
                    {userInitial}
                  </span>
                ) : (
                  <User className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                )}
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div
                      onClick={() => setProfileOpen(false)}
                      className="fixed inset-0 z-40"
                    />

                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-2xl border border-black/5 bg-white/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl"
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
                          <Link
                            href="/wishlist"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-[#f7f3eb] hover:text-zinc-950"
                          >
                            <Heart className="h-4 w-4 text-zinc-400" />
                            Wishlist
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

            <motion.button
              whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-full border border-black/10 p-2.5 text-zinc-700 outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="pb-16 md:pb-0"
      >
        {children}
      </motion.main>

      {/* FloatingDock is hidden on /assistant to prevent it overlaying the
          chat input bar. It remains visible on all other pages. */}
      {!isAssistantPage && <FloatingDock />}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ==================================================================
          MOBILE BOTTOM NAVIGATION — premium glass bar, mobile only
         ================================================================== */}
      <nav
        aria-label="Primary mobile navigation"
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-[24px] border border-black/5 bg-white/85 px-2 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl md:hidden"
      >
        {mobileBottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const badgeCount =
            item.href === "/cart"
              ? itemCount
              : item.href === "/wishlist"
              ? wishlistItems.length
              : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[10px] font-medium transition"
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-50 to-teal-50"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">
                <Icon
                  className={`h-5 w-5 ${
                    active ? "text-indigo-600" : "text-zinc-400"
                  }`}
                />
                {badgeCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </span>
              <span className={`relative ${active ? "text-zinc-950" : "text-zinc-500"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

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
              className="fixed inset-y-3 right-3 z-50 w-[85%] max-w-sm overflow-y-auto rounded-[28px] border border-black/5 bg-white/95 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl md:hidden"
            >
              <div className="flex items-center justify-between px-2 pb-4">
                <Image
                  src="/logo.svg"
                  alt="CartIQ"
                  width={180}
                  height={55}
                  className="h-10 w-auto"
                />

                <motion.button
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full border border-black/10 p-2 text-zinc-600 outline-none transition hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <X className="h-4 w-4" />
                </motion.button>
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
          {/* AI section band */}
          <div className="mb-14 flex flex-col items-start justify-between gap-6 rounded-[28px] border border-black/5 bg-gradient-to-br from-indigo-50 to-teal-50 p-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 shadow-[0_8px_24px_rgba(79,70,229,0.35)]">
                <Sparkles className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  Shop smarter with CartIQ AI
                </p>
                <p className="text-xs text-zinc-500">
                  Conversational search, comparisons &amp; recommendations
                </p>
              </div>
            </div>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
            >
              Ask CartIQ AI
              <Sparkles className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Link href="/" className="group inline-block">
                <Image
                  src="/logo.svg"
                  alt="CartIQ"
                  width={190}
                  height={60}
                  className="h-11 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </Link>

              <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-600">
                CartIQ is India&apos;s next-generation AI-powered e-commerce
                platform, combining intelligent product discovery,
                conversational shopping, personalized recommendations and
                secure online purchasing into one seamless experience.
              </p>

              {/* Newsletter */}
              <form onSubmit={handleNewsletterSubmit} className="mt-6 max-w-xs">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-900">
                  Newsletter
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-label="Email address for newsletter"
                    className="w-full rounded-full border border-black/10 bg-[#faf7f0] px-4 py-2.5 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-indigo-300 focus:bg-white focus-visible:ring-2 focus-visible:ring-indigo-400"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <AnimatePresence>
                  {newsletterSubmitted && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-2 text-xs font-medium text-emerald-600"
                    >
                      You&apos;re subscribed — thank you!
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
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
              © 2026 CartIQ Technologies. Designed &amp; Developed by Chirayu
              Babu Jaysawal &amp; Team. All Rights Reserved.
            </p>

            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-zinc-400">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
              <span>Powered by CartIQ AI • &amp; DeepSeek • OpenRouter</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}