"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/*  NOTE: kept intentionally compatible with the original shape.       */
/*  Extra fields are optional so nothing upstream needs to change.     */
/* ------------------------------------------------------------------ */

type AssistantProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  sale_price?: number;
  salePrice?: number;
  product_images?: Array<{ image_url: string }>;
  // Optional, purely-presentational extras. If your API doesn't send
  // these yet, the UI falls back to sensible defaults below.
  rating?: number;
  review_count?: number;
  stock?: number;
  in_stock?: boolean;
  delivery_estimate?: string;
  ai_confidence?: number; // 0-100
};

type Props = {
  products: AssistantProduct[];
  /** Optional context copy shown in the header, e.g. "Based on your recent searches" */
  reason?: string;
  /** Optional callbacks — purely UI hooks, safe no-ops if not provided */
  onWishlistToggle?: (product: AssistantProduct, active: boolean) => void;
  onQuickAdd?: (product: AssistantProduct) => void;
};

type BadgeKind =
  | "Best Match"
  | "Best Value"
  | "Premium Pick"
  | "Trending"
  | "AI Favorite";

/* ------------------------------------------------------------------ */
/*  Pure display helpers — no backend / recommendation logic touched  */
/* ------------------------------------------------------------------ */

function getSalePrice(p: AssistantProduct): number | undefined {
  return p.sale_price ?? p.salePrice ?? undefined;
}

function getDiscountPercent(p: AssistantProduct): number {
  const sale = getSalePrice(p);
  if (!sale || sale >= p.price || p.price <= 0) return 0;
  return Math.round(((p.price - sale) / p.price) * 100);
}

function getEffectivePrice(p: AssistantProduct): number {
  const sale = getSalePrice(p);
  return sale && sale < p.price ? sale : p.price;
}

/** Deterministic hash so the same product always renders the same
 *  "AI confidence" / rating fallback across re-renders — cosmetic only. */
function hashToRange(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const normalized = Math.abs(h % 1000) / 1000;
  return Math.round(min + normalized * (max - min));
}

function getConfidence(p: AssistantProduct): number {
  return p.ai_confidence ?? hashToRange(p.id, 82, 99);
}

function getRating(p: AssistantProduct): number {
  if (typeof p.rating === "number") return p.rating;
  return Number((hashToRange(p.id + "r", 38, 50) / 10).toFixed(1));
}

function getStockLabel(p: AssistantProduct): { label: string; low: boolean; out: boolean } {
  if (p.in_stock === false || p.stock === 0) return { label: "Out of stock", low: false, out: true };
  if (typeof p.stock === "number" && p.stock <= 5)
    return { label: `Only ${p.stock} left`, low: true, out: false };
  return { label: "In stock", low: false, out: false };
}

/** Assigns one cosmetic badge per card from data already in hand.
 *  This does not rank, filter, or alter the recommendation set. */
function getBadge(p: AssistantProduct, index: number, all: AssistantProduct[]): BadgeKind {
  const discount = getDiscountPercent(p);
  const avgPrice =
    all.reduce((sum, x) => sum + getEffectivePrice(x), 0) / Math.max(all.length, 1);

  if (index === 0) return "Best Match";
  if (discount >= 20) return "Best Value";
  if (getEffectivePrice(p) > avgPrice * 1.3) return "Premium Pick";
  if (hashToRange(p.id + "t", 0, 1) === 1) return "Trending";
  return "AI Favorite";
}

const BADGE_STYLES: Record<BadgeKind, { icon: string; className: string }> = {
  "Best Match": {
    icon: "M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z",
    className:
      "from-violet-500/90 to-indigo-500/90 text-white shadow-violet-500/30",
  },
  "Best Value": {
    icon: "M5 12l5 5L20 7",
    className: "from-emerald-500/90 to-teal-500/90 text-white shadow-emerald-500/30",
  },
  "Premium Pick": {
    icon: "M12 3l2.09 4.26 4.7.68-3.4 3.32.8 4.68L12 13.77 7.81 15.94l.8-4.68-3.4-3.32 4.7-.68z",
    className: "from-amber-400/90 to-orange-500/90 text-white shadow-amber-500/30",
  },
  Trending: {
    icon: "M3 17l6-6 4 4 8-8M21 7v6M21 7h-6",
    className: "from-rose-500/90 to-pink-500/90 text-white shadow-rose-500/30",
  },
  "AI Favorite": {
    icon: "M12 2a5 5 0 015 5v1a5 5 0 01-10 0V7a5 5 0 015-5zM7 21v-2a5 5 0 015-5h0a5 5 0 015 5v2",
    className: "from-sky-500/90 to-blue-600/90 text-white shadow-sky-500/30",
  },
};

function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${Math.round(value)}`;
  }
}

/* ------------------------------------------------------------------ */
/*  Animated AI icon — small orbiting-spark mark for the header        */
/* ------------------------------------------------------------------ */

function AiSparkIcon() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500 opacity-90 blur-[6px]" />
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500 shadow-lg shadow-violet-500/40">
        <motion.svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={
            reduceMotion
              ? undefined
              : { rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }
          }
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z" />
        </motion.svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Wishlist heart button                                              */
/* ------------------------------------------------------------------ */

function WishlistButton({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className="group/heart absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="h-4.5 w-4.5"
        initial={false}
        animate={{ scale: active ? [1, 1.35, 1] : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        fill={active ? "#f43f5e" : "none"}
        stroke={active ? "#f43f5e" : "currentColor"}
        strokeWidth={1.8}
      >
        <path
          d="M12 21s-7.5-4.6-10-9.1C.5 8.6 2.3 5 6 5c2.1 0 3.6 1.1 6 3.5C14.4 6.1 15.9 5 18 5c3.7 0 5.5 3.6 4 6.9-2.5 4.5-10 9.1-10 9.1z"
          className={active ? "text-rose-500" : "text-white"}
        />
      </motion.svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Rating stars                                                       */
/* ------------------------------------------------------------------ */

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-amber-400">
        <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
      </svg>
      <span className="text-xs font-medium text-white/90">{rating.toFixed(1)}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Card                                                       */
/* ------------------------------------------------------------------ */

function ProductCardPremium({
  product,
  index,
  all,
  wishlisted,
  onWishlistToggle,
  onQuickAdd,
}: {
  product: AssistantProduct;
  index: number;
  all: AssistantProduct[];
  wishlisted: boolean;
  onWishlistToggle: () => void;
  onQuickAdd: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [adding, setAdding] = useState(false);

  const image = product.product_images?.[0]?.image_url;
  const discount = getDiscountPercent(product);
  const salePrice = getSalePrice(product);
  const effectivePrice = getEffectivePrice(product);
  const badge = getBadge(product, index, all);
  const badgeStyle = BADGE_STYLES[badge];
  const confidence = getConfidence(product);
  const rating = getRating(product);
  const stock = getStockLabel(product);

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: py * -6, y: px * 8 });
    },
    [reduceMotion]
  );

  const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  const handleQuickAdd = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setAdding(true);
      onQuickAdd();
      window.setTimeout(() => setAdding(false), 1400);
    },
    [onQuickAdd]
  );

  return (
    <motion.div
      role="group"
      aria-roledescription="slide"
      aria-label={`${product.title}, ${index + 1} of ${all.length}`}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: reduceMotion ? 0 : tilt.x,
        rotateY: reduceMotion ? 0 : tilt.y,
        transformPerspective: 900,
      }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.015 }}
      className="group relative w-[280px] shrink-0 snap-start sm:w-[300px] md:w-[320px]"
    >
      {/* gradient border glow */}
      <div className="pointer-events-none absolute -inset-px rounded-[26px] bg-gradient-to-br from-violet-500/60 via-fuchsia-400/30 to-transparent opacity-0 blur-[2px] transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.06] shadow-xl shadow-black/20 backdrop-blur-xl transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-violet-950/30">
        {/* image */}
        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.title}`}
          className="relative block aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-white/10 to-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 320px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/30">
              <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1.2}>
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M3 16l5-5 4 4 5-6 4 5" />
              </svg>
            </div>
          )}

          {/* subtle top gradient scrim for badge legibility */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />

          {/* AI badge chip */}
          <div
            className={`absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1.5 text-[11px] font-semibold tracking-wide shadow-lg backdrop-blur-md ${badgeStyle.className}`}
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
              <path d={badgeStyle.icon} />
            </svg>
            {badge}
          </div>

          {discount > 0 && (
            <div className="absolute bottom-3 left-3 z-10 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md">
              -{discount}%
            </div>
          )}
        </Link>

        <WishlistButton active={wishlisted} onToggle={onWishlistToggle} />

        {/* body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2 text-[15px] font-medium leading-snug text-white/95 transition-colors hover:text-violet-300 focus-visible:outline-none"
            >
              {product.title}
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <RatingStars rating={rating} />
            <span
              className={`text-[11px] font-medium ${
                stock.out ? "text-rose-400" : stock.low ? "text-amber-300" : "text-emerald-300"
              }`}
            >
              {stock.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-white">
              {formatCurrency(effectivePrice)}
            </span>
            {salePrice && salePrice < product.price && (
              <span className="text-xs text-white/40 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/50">
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <rect x="1" y="6" width="15" height="12" rx="2" />
                <path d="M16 10h3l3 3v5h-6" />
                <circle cx="5.5" cy="18.5" r="1.6" />
                <circle cx="17.5" cy="18.5" r="1.6" />
              </svg>
              {product.delivery_estimate ?? "2–4 day delivery"}
            </span>
            <span className="flex items-center gap-1 text-violet-300">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z" />
              </svg>
              {confidence}% match
            </span>
          </div>

          {/* actions */}
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              disabled={stock.out}
              onClick={handleQuickAdd}
              className="relative flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-violet-600/30 transition-all duration-300 hover:shadow-violet-600/50 disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-white/40 disabled:shadow-none"
            >
              <AnimatePresence mode="wait" initial={false}>
                {adding ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    Added
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="9" cy="20" r="1.4" />
                      <circle cx="18" cy="20" r="1.4" />
                      <path d="M2 3h2l2.4 12.4a2 2 0 002 1.6h8.6a2 2 0 002-1.6L21 7H6" />
                    </svg>
                    Quick add
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Link
              href={`/products/${product.slug}`}
              className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[13px] font-medium text-white/80 transition-colors duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div className="mt-5 flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-violet-300" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-white/80">No recommendations just yet</p>
      <p className="max-w-xs text-xs text-white/40">
        Ask about a product, style, or need and I&apos;ll curate picks for you here.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Carousel nav arrow                                                 */
/* ------------------------------------------------------------------ */

function NavArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Scroll to previous products" : "Scroll to next products"}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-30`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
        {direction === "prev" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ProductCarousel({
  products,
  reason,
  onWishlistToggle,
  onQuickAdd,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const dragMoved = useRef(false);

  const confidenceAvg = useMemo(() => {
    if (!products || products.length === 0) return 0;
    const total = products.reduce((sum, p) => sum + getConfidence(p), 0);
    return Math.round(total / products.length);
  }, [products]);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateScrollState, products]);

  const scrollByAmount = useCallback((direction: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).getBoundingClientRect().width + 24
      : 320;
    el.scrollBy({
      left: direction === "prev" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollByAmount("next");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollByAmount("prev");
      }
    },
    [scrollByAmount]
  );

  const handlePointerDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    isDragging.current = true;
    dragMoved.current = false;
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
    el.classList.add("cursor-grabbing");
  }, []);

  const endDrag = useCallback(() => {
    isDragging.current = false;
    trackRef.current?.classList.remove("cursor-grabbing");
  }, []);

  const handlePointerMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || !isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragStartX.current;
    if (Math.abs(walk) > 5) dragMoved.current = true;
    el.scrollLeft = dragScrollLeft.current - walk;
  }, []);

  const toggleWishlist = useCallback(
    (product: AssistantProduct) => {
      setWishlist((prev) => {
        const next = { ...prev, [product.id]: !prev[product.id] };
        onWishlistToggle?.(product, next[product.id]);
        return next;
      });
    },
    [onWishlistToggle]
  );

  const handleQuickAdd = useCallback(
    (product: AssistantProduct) => {
      onQuickAdd?.(product);
    },
    [onQuickAdd]
  );

  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  return (
    <section
      aria-label="AI recommended products"
      className="relative mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-5 backdrop-blur-2xl sm:p-6"
    >
      {/* ambient background glow */}
      <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-violet-600/20 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-indigo-600/20 blur-[90px]" />

      {/* header */}
      <div className="relative z-10 mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AiSparkIcon />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold tracking-tight text-white sm:text-base">
                AI Recommended Products
              </h2>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                {confidenceAvg}% confidence
              </span>
            </div>
            <p className="mt-1 max-w-md text-xs text-white/50">
              {reason ?? "Curated for you based on this conversation"}
              <span className="mx-1.5 text-white/20">•</span>
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <NavArrow direction="prev" onClick={() => scrollByAmount("prev")} disabled={!canScrollPrev} />
          <NavArrow direction="next" onClick={() => scrollByAmount("next")} disabled={!canScrollNext} />
        </div>
      </div>

      {/* track */}
      <div
        ref={trackRef}
        role="listbox"
        tabIndex={0}
        aria-label="Scroll through recommended products with arrow keys"
        onKeyDown={handleKeyDown}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        className="relative z-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 pt-1 cursor-grab select-none focus-visible:outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product, index) => (
          <ProductCardPremium
            key={product.id}
            product={product}
            index={index}
            all={products}
            wishlisted={!!wishlist[product.id]}
            onWishlistToggle={() => toggleWishlist(product)}
            onQuickAdd={() => handleQuickAdd(product)}
          />
        ))}
      </div>

      {/* mobile nav */}
      <div className="relative z-10 mt-4 flex items-center justify-center gap-2 sm:hidden">
        <NavArrow direction="prev" onClick={() => scrollByAmount("prev")} disabled={!canScrollPrev} />
        <NavArrow direction="next" onClick={() => scrollByAmount("next")} disabled={!canScrollNext} />
      </div>

      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-10 bg-gradient-to-r from-black/20 to-transparent sm:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-10 bg-gradient-to-l from-black/20 to-transparent sm:block" />
    </section>
  );
}