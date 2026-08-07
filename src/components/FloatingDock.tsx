"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Heart,
  LifeBuoy,
  Package,
  Sparkles,
  ShoppingBag,
  User,
} from "lucide-react";

/**
 * FloatingDock
 * -------------------------------------------------------------------------
 * A premium, glass "control island" for the storefront — macOS Dock meets
 * Apple Vision Pro, tuned for an AI-powered ecommerce experience.
 *
 * Every original destination (AI Assistant, Cart, Wishlist) is preserved
 * and working exactly as before. Orders, Profile and Support have been
 * added as first-class dock buttons per the design brief. No backend,
 * routing, or AI logic is touched — this file is UI/UX only.
 *
 * The dock is automatically hidden on /assistant so it does not overlap
 * the chat input bar.
 * -------------------------------------------------------------------------
 */

// Routes where the FloatingDock should not be rendered.
const HIDDEN_ON_ROUTES = ["/assistant"];

type DockItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  accent: string; // tailwind gradient classes for the icon surface
  glow: string; // hover glow color
};

interface FloatingDockProps {
  /** Live cart item count. Defaults to 0 (badge hides automatically). */
  cartCount?: number;
  /** Live wishlist item count. Defaults to 0 (badge hides automatically). */
  wishlistCount?: number;
  /** Live account notification count (order updates, etc). Defaults to 0. */
  notificationsCount?: number;
}

const MAGNIFY_SPRING = { stiffness: 320, damping: 22, mass: 0.6 } as const;

export default function FloatingDock({
  cartCount = 0,
  wishlistCount = 0,
  notificationsCount = 0,
}: FloatingDockProps) {
  const pathname = usePathname();

  // Tracks pointer X across the whole dock so every icon can react to
  // proximity, macOS-dock style.
  const mouseX = useMotionValue<number>(Infinity);

  const items: DockItem[] = useMemo(
    () => [
      {
        key: "wishlist",
        label: "Wishlist",
        href: "/wishlist",
        icon: Heart,
        badge: wishlistCount,
        accent: "from-rose-500 to-pink-500",
        glow: "rgba(244,63,94,0.55)",
      },
      {
        key: "orders",
        label: "Orders",
        href: "/orders",
        icon: Package,
        accent: "from-amber-400 to-orange-500",
        glow: "rgba(245,158,11,0.5)",
      },
      {
        key: "assistant",
        label: "AI Assistant",
        href: "/assistant",
        icon: Sparkles,
        accent: "from-violet-500 via-fuchsia-500 to-cyan-400",
        glow: "rgba(139,92,246,0.65)",
      },
      {
        key: "cart",
        label: "Cart",
        href: "/cart",
        icon: ShoppingBag,
        badge: cartCount,
        accent: "from-neutral-800 to-neutral-950",
        glow: "rgba(255,255,255,0.35)",
      },
      {
        key: "profile",
        label: "Profile",
        href:"/account",
        icon: User,
        badge: notificationsCount,
        accent: "from-sky-500 to-indigo-500",
        glow: "rgba(56,189,248,0.5)",
      },
      {
        key: "support",
        label: "Support",
        href: "/contact",
        icon: LifeBuoy,
        accent: "from-emerald-400 to-teal-500",
        glow: "rgba(16,185,129,0.5)",
      },
    ],
    [cartCount, wishlistCount, notificationsCount]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mouseX.set(e.clientX);
    },
    [mouseX]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(Infinity);
  }, [mouseX]);

  // Hide the dock entirely on routes where it would overlap page UI
  // (e.g. the /assistant chat input bar).
  if (HIDDEN_ON_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <nav
      aria-label="Primary shortcuts"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3 sm:bottom-6"
    >
      {/* Gradient border shell — the "floating glass" frame */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.08 }}
        className="pointer-events-auto relative rounded-[28px] p-[1.5px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)]"
        style={{
          background:
            "conic-gradient(from 180deg, rgba(139,92,246,0.7), rgba(56,189,248,0.6), rgba(244,63,94,0.55), rgba(245,158,11,0.55), rgba(139,92,246,0.7))",
        }}
      >
        {/* Ambient glow behind the whole dock */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-gradient-to-r from-violet-500/20 via-cyan-400/15 to-rose-500/20 blur-2xl"
        />

        {/* Glass surface */}
        <div className="flex items-end gap-1.5 rounded-[26px] border border-white/10 bg-white/[0.06] px-2.5 py-2 backdrop-blur-2xl backdrop-saturate-150 sm:gap-2.5 sm:px-4 sm:py-2.5">
          {items.map((item) => (
            <DockButton
              key={item.key}
              item={item}
              mouseX={mouseX}
              isAI={item.key === "assistant"}
            />
          ))}
        </div>
      </motion.div>
    </nav>
  );
}

function DockButton({
  item,
  mouseX,
  isAI,
}: {
  item: DockItem;
  mouseX: MotionValue<number>;
  isAI: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);
  const tooltipId = `dock-tip-${useId()}`;

  const baseSize = isAI ? 60 : 52;
  const maxSize = isAI ? 86 : 72;

  // Distance between the pointer and this icon's center, in pixels.
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Number.POSITIVE_INFINITY;
    return val - (bounds.x + bounds.width / 2);
  });

  const widthSync = useTransform(distance, [-140, 0, 140], [baseSize, maxSize, baseSize]);
  const width = useSpring(widthSync, MAGNIFY_SPRING);

  const liftSync = useTransform(distance, [-140, 0, 140], [0, isAI ? -12 : -8, 0]);
  const lift = useSpring(liftSync, MAGNIFY_SPRING);

  const Icon = item.icon;

  const triggerRipple = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const id = rippleId.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            role="tooltip"
            id={tooltipId}
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.92 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="pointer-events-none absolute -top-11 z-10 whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/95 px-2.5 py-1 text-[11px] font-medium text-white shadow-lg"
          >
            {item.label}
            {typeof item.badge === "number" && item.badge > 0 && (
              <span className="ml-1 text-white/50">· {item.badge}</span>
            )}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        style={{ width, height: width, y: lift }}
        className="relative flex items-center justify-center"
      >
        {/* Rotating gradient halo — reserved for the AI centerpiece */}
        {isAI && (
          <motion.span
            aria-hidden
            className="absolute inset-[-6px] rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #8b5cf6, #22d3ee, #f43f5e, #f59e0b, #8b5cf6)",
              filter: "blur(10px)",
            }}
            animate={{ rotate: 360, opacity: [0.55, 0.9, 0.55] }}
            transition={{
              rotate: { duration: 6, repeat: Infinity, ease: "linear" },
              opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        )}

        {/* Ambient AI pulse — the "thinking" breathing ring */}
        {isAI && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/40 to-cyan-400/40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Hover glow */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          animate={
            hovered
              ? { boxShadow: `0 10px 32px ${item.glow}` }
              : { boxShadow: "0 2px 10px transparent" }
          }
          transition={{ duration: 0.25 }}
        />

        <Link
          ref={ref}
          href={item.href}
          aria-label={`${item.label}${
            typeof item.badge === "number" && item.badge > 0 ? `, ${item.badge} items` : ""
          }`}
          aria-describedby={hovered ? tooltipId : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          onClick={triggerRipple}
          className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${item.accent} text-white shadow-lg ring-1 ring-white/15 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40`}
        >
          {/* Ripple layer */}
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 0.5, scale: 0 }}
              animate={{ opacity: 0, scale: 3.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ left: r.x, top: r.y }}
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60"
            />
          ))}

          <motion.span
            animate={hovered ? { scale: 1.12 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center justify-center"
          >
            <Icon
              className={isAI ? "h-6 w-6 sm:h-7 sm:w-7" : "h-5 w-5 sm:h-6 sm:w-6"}
              strokeWidth={isAI ? 2.25 : 2}
            />
          </motion.span>

          {/* Voice / activity indicator, unique to the AI orb */}
          {isAI && (
            <span
              aria-hidden
              className="absolute bottom-1.5 flex items-end gap-[2px]"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-[2.5px] rounded-full bg-white/85"
                  animate={{ height: hovered ? [4, 13, 6, 11, 4] : [3, 5, 3] }}
                  transition={{
                    duration: hovered ? 0.9 : 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.12,
                  }}
                />
              ))}
            </span>
          )}
        </Link>

        {/* Animated count badge */}
        <AnimatePresence>
          {typeof item.badge === "number" && item.badge > 0 && (
            <motion.span
              key={item.badge}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-black/70 bg-gradient-to-br from-red-500 to-rose-600 px-1 text-[10px] font-bold text-white shadow-md"
            >
              {item.badge > 99 ? "99+" : item.badge}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}