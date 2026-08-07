"use client";

import { useMemo, useState, useCallback, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Heart,
  Share2,
  RefreshCw,
  ExternalLink,
  Check,
  X,
  Star,
  Trophy,
  Zap,
  Package,
  ShieldCheck,
  BadgeCheck,
  Gauge,
  Battery,
  MonitorSmartphone,
  Camera,
  Hammer,
  Coins,
} from "lucide-react";
import { getComparisonVerdict } from "@/lib/ai/comparison-verdict";

// ============================================================================
// Types
// ============================================================================

type Props = {
  left: any;
  right: any;
  /** Optional hooks — purely presentational, safe no-ops if not provided */
  onAddToCart?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  onCompareAgain?: () => void;
  onShare?: (payload: { left: any; right: any }) => void;
};

type SpecRow = {
  key: string;
  label: string;
  icon: React.ReactNode;
  leftValue: string;
  rightValue: string;
  winner: "left" | "right" | "tie" | null;
};

type Badge = {
  key: string;
  label: string;
  icon: React.ReactNode;
  side: "left" | "right";
};

// ============================================================================
// Formatting helpers (pure UI utilities — no AI / business logic)
// ============================================================================

const formatCurrency = (value: unknown) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
};

const getImage = (product: any) =>
  product?.image ??
  product?.thumbnail ??
  product?.images?.[0] ??
  product?.imageUrl ??
  null;

const getPrice = (product: any) => product?.sale_price ?? product?.price;

const getDiscountPercent = (product: any) => {
  if (typeof product?.discount === "number") return product.discount;
  const price = Number(product?.price);
  const sale = Number(product?.sale_price);
  if (Number.isFinite(price) && Number.isFinite(sale) && price > sale && price > 0) {
    return Math.round(((price - sale) / price) * 100);
  }
  return null;
};

const isInStock = (product: any) => {
  if (typeof product?.stock === "number") return product.stock > 0;
  if (typeof product?.stock === "boolean") return product.stock;
  if (typeof product?.inStock === "boolean") return product.inStock;
  return null; // unknown — omit rather than guess
};

const getAiMatchScore = (product: any) =>
  product?.aiMatchScore ?? product?.matchScore ?? product?.ai_match_score ?? null;

// ============================================================================
// Component
// ============================================================================

export default function ComparisonCard({
  left,
  right,
  onAddToCart,
  onAddToWishlist,
  onCompareAgain,
  onShare,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const headingId = useId();
  const [shared, setShared] = useState(false);

  // --- Core AI logic — untouched, exactly as before -----------------------
  const leftPrice = getPrice(left);
  const rightPrice = getPrice(right);
  const result = useMemo(() => getComparisonVerdict(left, right), [left, right]);
  // --------------------------------------------------------------------------

  if (!left || !right) {
    return (
      <div
        role="status"
        className="rounded-[28px] border border-zinc-200 bg-white/70 p-10 text-center text-sm text-zinc-500 shadow-sm"
      >
        Select two products to see an AI comparison.
      </div>
    );
  }

  const winnerIsLeft = result?.winner?.title === left?.title;
  const winnerIsRight = !winnerIsLeft && result?.winner?.title === right?.title;


  // --- Derived, purely-presentational comparison rows ----------------------
  const specRows: SpecRow[] = useMemo(() => {
    const rows: SpecRow[] = [];

    rows.push({
      key: "price",
      label: "Price",
      icon: <Coins className="h-4 w-4" aria-hidden="true" />,
      leftValue: formatCurrency(leftPrice),
      rightValue: formatCurrency(rightPrice),
      winner:
        Number.isFinite(Number(leftPrice)) && Number.isFinite(Number(rightPrice))
          ? Number(leftPrice) === Number(rightPrice)
            ? "tie"
            : Number(leftPrice) < Number(rightPrice)
            ? "left"
            : "right"
          : null,
    });

    rows.push({
      key: "rating",
      label: "Rating",
      icon: <Star className="h-4 w-4" aria-hidden="true" />,
      leftValue: left?.rating != null ? `${left.rating}` : "—",
      rightValue: right?.rating != null ? `${right.rating}` : "—",
      winner:
        left?.rating != null && right?.rating != null
          ? Number(left.rating) === Number(right.rating)
            ? "tie"
            : Number(left.rating) > Number(right.rating)
            ? "left"
            : "right"
          : null,
    });

    rows.push({
      key: "brand",
      label: "Brand",
      icon: <BadgeCheck className="h-4 w-4" aria-hidden="true" />,
      leftValue: left?.brand ?? "—",
      rightValue: right?.brand ?? "—",
      winner: null,
    });

    if (left?.category || right?.category) {
      rows.push({
        key: "category",
        label: "Category",
        icon: <Package className="h-4 w-4" aria-hidden="true" />,
        leftValue: left?.category ?? "—",
        rightValue: right?.category ?? "—",
        winner: null,
      });
    }

    const leftDiscount = getDiscountPercent(left);
    const rightDiscount = getDiscountPercent(right);
    if (leftDiscount != null || rightDiscount != null) {
      rows.push({
        key: "discount",
        label: "Discount",
        icon: <TrendingUp className="h-4 w-4" aria-hidden="true" />,
        leftValue: leftDiscount != null ? `${leftDiscount}% off` : "—",
        rightValue: rightDiscount != null ? `${rightDiscount}% off` : "—",
        winner:
          leftDiscount != null && rightDiscount != null
            ? leftDiscount === rightDiscount
              ? "tie"
              : leftDiscount > rightDiscount
              ? "left"
              : "right"
            : null,
      });
    }

    const leftStock = isInStock(left);
    const rightStock = isInStock(right);
    if (leftStock != null || rightStock != null) {
      rows.push({
        key: "stock",
        label: "Availability",
        icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
        leftValue: leftStock == null ? "—" : leftStock ? "In stock" : "Out of stock",
        rightValue: rightStock == null ? "—" : rightStock ? "In stock" : "Out of stock",
        winner:
          leftStock != null && rightStock != null
            ? leftStock === rightStock
              ? "tie"
              : leftStock
              ? "left"
              : "right"
            : null,
      });
    }

    const leftMatch = getAiMatchScore(left);
    const rightMatch = getAiMatchScore(right);
    if (leftMatch != null || rightMatch != null) {
      rows.push({
        key: "aiMatch",
        label: "AI Match Score",
        icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
        leftValue: leftMatch != null ? `${leftMatch}%` : "—",
        rightValue: rightMatch != null ? `${rightMatch}%` : "—",
        winner:
          leftMatch != null && rightMatch != null
            ? leftMatch === rightMatch
              ? "tie"
              : leftMatch > rightMatch
              ? "left"
              : "right"
            : null,
      });
    }

    return rows;
  }, [left, right, leftPrice, rightPrice]);

  // --- Optional spec-based winner badges (only shown if data exists) ------
  const badges: Badge[] = useMemo(() => {
    const out: Badge[] = [];

    const specDefs: Array<{
      key: string;
      label: string;
      icon: React.ReactNode;
      get: (p: any) => number | null | undefined;
    }> = [
      { key: "performance", label: "Best Performance", icon: <Gauge className="h-3.5 w-3.5" aria-hidden="true" />, get: (p) => p?.performanceScore ?? p?.specs?.performance },
      { key: "battery", label: "Best Battery", icon: <Battery className="h-3.5 w-3.5" aria-hidden="true" />, get: (p) => p?.batteryScore ?? p?.specs?.battery },
      { key: "display", label: "Best Display", icon: <MonitorSmartphone className="h-3.5 w-3.5" aria-hidden="true" />, get: (p) => p?.displayScore ?? p?.specs?.display },
      { key: "camera", label: "Best Camera", icon: <Camera className="h-3.5 w-3.5" aria-hidden="true" />, get: (p) => p?.cameraScore ?? p?.specs?.camera },
      { key: "build", label: "Best Build", icon: <Hammer className="h-3.5 w-3.5" aria-hidden="true" />, get: (p) => p?.buildScore ?? p?.specs?.build },
    ];

    specDefs.forEach(({ key, label, icon, get }) => {
      const l = get(left);
      const r = get(right);
      if (typeof l === "number" && typeof r === "number" && l !== r) {
        out.push({ key, label, icon, side: l > r ? "left" : "right" });
      }
    });

    // Best Value: better rating-per-rupee, computed purely for display
    const lp = Number(leftPrice);
    const rp = Number(rightPrice);
    if (Number.isFinite(lp) && Number.isFinite(rp) && lp > 0 && rp > 0 && left?.rating != null && right?.rating != null) {
      const lv = Number(left.rating) / lp;
      const rv = Number(right.rating) / rp;
      if (lv !== rv) {
        out.push({
          key: "value",
          label: "Best Value",
          icon: <Coins className="h-3.5 w-3.5" aria-hidden="true" />,
          side: lv > rv ? "left" : "right",
        });
      }
    }

    return out;
  }, [left, right, leftPrice, rightPrice]);

  // --- Pros / Cons — sourced from data when present, else derived from --
  // --- the same numeric comparisons already shown in the table -----------
  const buildProsCons = useCallback(
    (side: "left" | "right") => {
      const product = side === "left" ? left : right;
      if (Array.isArray(product?.pros) || Array.isArray(product?.cons)) {
        return {
          pros: product?.pros ?? [],
          cons: product?.cons ?? [],
        };
      }
      const pros: string[] = [];
      const cons: string[] = [];
      specRows.forEach((row) => {
        if (row.winner === side) pros.push(`Better ${row.label.toLowerCase()}`);
        if (row.winner && row.winner !== side && row.winner !== "tie") {
          cons.push(`Lower ${row.label.toLowerCase()}`);
        }
      });
      return { pros, cons };
    },
    [left, right, specRows]
  );

  const leftProsCons = buildProsCons("left");
  const rightProsCons = buildProsCons("right");

  // --- Actions ---------------------------------------------------------
  const handleShare = useCallback(async () => {
    onShare?.({ left, right });
    try {
      const shareData = {
        title: "Product Comparison",
        text: `Comparing ${left?.title} vs ${right?.title}`,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      };
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(shareData);
      } else if (typeof navigator !== "undefined" && navigator.clipboard && shareData.url) {
        await navigator.clipboard.writeText(shareData.url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // user cancelled share sheet — no-op
    }
  }, [left, right, onShare]);

  const fadeUp = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      aria-labelledby={headingId}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="relative rounded-[28px] bg-gradient-to-br from-indigo-500/70 via-fuchsia-500/60 to-amber-400/70 p-[1.5px] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.35)]"
    >
      <div className="relative overflow-hidden rounded-[26.5px] bg-white/85 backdrop-blur-2xl">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl"
        />

        {/* ================= HEADER ================= */}
        <motion.header
          variants={fadeUp}
          className="relative flex flex-col gap-4 border-b border-zinc-200/70 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : { rotate: [0, 10, -10, 0], scale: [1, 1.08, 1] }
              }
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30"
            >
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            </motion.div>
            <div>
              <h2 id={headingId} className="text-lg font-semibold tracking-tight sm:text-xl">
                Product Comparison
              </h2>
              <p className="text-xs text-zinc-400">AI-powered shopping insight</p>
            </div>
          </div>


        </motion.header>

        {/* ================= PRODUCT PANELS ================= */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 divide-y divide-zinc-200/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0"
        >
          {[
            { product: left, isWinner: winnerIsLeft, side: "left" as const },
            { product: right, isWinner: winnerIsRight, side: "right" as const },
          ].map(({ product, isWinner, side }) => {
            const price = side === "left" ? leftPrice : rightPrice;
            const discount = getDiscountPercent(product);
            const stock = isInStock(product);
            const matchScore = getAiMatchScore(product);
            const image = getImage(product);
            const sideBadges = badges.filter((b) => b.side === side);

            return (
              <motion.article
                key={product?.id ?? side}
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="relative flex flex-col gap-4 px-6 py-7 sm:px-8"
              >
                {isWinner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
                    animate={{ opacity: 1, scale: 1, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 }}
                    className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-[11px] font-semibold text-amber-950 shadow-md shadow-amber-500/30"
                  >
                    <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                    AI Pick
                  </motion.div>
                )}

                <div className="flex items-center justify-center rounded-2xl bg-zinc-50 p-4">
                  {image ? (
                    <img
                      src={image}
                      alt={product?.title ?? "Product image"}
                      loading="lazy"
                      decoding="async"
                      className="h-40 w-full max-w-[220px] object-contain"
                    />
                  ) : (
                    <div className="flex h-40 w-full max-w-[220px] items-center justify-center text-zinc-300">
                      <Package className="h-14 w-14" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div>
                  {product?.brand && (
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
                      {product.brand}
                    </p>
                  )}
                  <h3 className="mt-0.5 line-clamp-2 text-base font-semibold text-zinc-900 sm:text-lg">
                    {product?.title}
                  </h3>
                  {product?.category && (
                    <p className="mt-0.5 text-xs text-zinc-500">{product.category}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xl font-bold text-zinc-900">{formatCurrency(price)}</span>
                  {product?.price != null && product?.sale_price != null && product.price !== product.sale_price && (
                    <span className="text-sm text-zinc-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                  {discount != null && discount > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {discount}% off
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {product?.rating != null && (
                    <span className="flex items-center gap-1 font-medium text-zinc-700">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                      {product.rating}
                    </span>
                  )}
                  {stock != null && (
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        stock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${stock ? "bg-emerald-500" : "bg-red-500"}`}
                        aria-hidden="true"
                      />
                      {stock ? "In stock" : "Out of stock"}
                    </span>
                  )}
                </div>

                {matchScore != null && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-medium text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-fuchsia-500" aria-hidden="true" />
                        AI Match Score
                      </span>
                      <span>{matchScore}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, matchScore))}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                      />
                    </div>
                  </div>
                )}

                {sideBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sideBadges.map((b) => (
                      <span
                        key={b.key}
                        className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700"
                      >
                        {b.icon}
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-1 flex flex-wrap gap-2">
                  {product?.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      View Product
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onAddToCart?.(product)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToWishlist?.(product)}
                    aria-label={`Add ${product?.title ?? "product"} to wishlist`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* ================= COMPARISON TABLE ================= */}
        <motion.div variants={fadeUp} className="border-t border-zinc-200/70 px-4 py-6 sm:px-8">
          <h3 className="mb-3 px-2 text-sm font-semibold text-zinc-900">Specification Comparison</h3>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200/70">
            <table className="w-full min-w-[420px] table-fixed border-collapse text-sm">
              <caption className="sr-only">
                Comparison of {left?.title} and {right?.title}
              </caption>
              <thead>
                <tr className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th scope="col" className="w-1/3 px-4 py-3 font-medium">
                    Spec
                  </th>
                  <th scope="col" className="w-1/3 px-4 py-3 font-medium">
                    {left?.title}
                  </th>
                  <th scope="col" className="w-1/3 px-4 py-3 font-medium">
                    {right?.title}
                  </th>
                </tr>
              </thead>
              <tbody>
                {specRows.map((row, idx) => (
                  <tr
                    key={row.key}
                    className={`border-t border-zinc-100 ${idx % 2 === 1 ? "bg-zinc-50/50" : "bg-white"}`}
                  >
                    <th
                      scope="row"
                      className="flex items-center gap-2 px-4 py-3 text-left font-medium text-zinc-600"
                    >
                      {row.icon}
                      {row.label}
                    </th>
                    <td
                      className={`px-4 py-3 ${
                        row.winner === "left" ? "font-semibold text-emerald-700" : "text-zinc-700"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {row.winner === "left" && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                        )}
                        {row.leftValue}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        row.winner === "right" ? "font-semibold text-emerald-700" : "text-zinc-700"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {row.winner === "right" && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                        )}
                        {row.rightValue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ================= AI SUMMARY ================= */}
        <motion.div variants={fadeUp} className="px-4 pb-2 sm:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 p-6">
            <motion.div
              aria-hidden="true"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
              }
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-[linear-gradient(120deg,#eef2ff,#fdf4ff,#fffbeb,#eef2ff)] bg-[length:300%_300%] opacity-90"
            />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                  <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold text-zinc-900">AI Winner</h3>
              </div>
              <p className="text-lg font-semibold text-zinc-900">{result?.winner?.title}</p>

              <div className="flex items-center gap-2 pt-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                  <Zap className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold text-zinc-900">AI Verdict</h3>
              </div>
              <p className="text-sm leading-relaxed text-zinc-700">{result?.verdict}</p>

            </div>
          </div>
        </motion.div>

        {/* ================= PROS & CONS ================= */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 sm:px-8"
        >
          {[
            { title: left?.title, data: leftProsCons },
            { title: right?.title, data: rightProsCons },
          ].map(({ title, data }, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/70 bg-white/60 p-5 shadow-sm"
            >
              <h4 className="mb-3 truncate text-sm font-semibold text-zinc-900">{title}</h4>

              {data.pros.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {data.pros.map((p: string, i: number) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {data.cons.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.cons.map((c: string, i: number) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {data.pros.length === 0 && data.cons.length === 0 && (
                <p className="text-xs text-zinc-400">No additional insight available.</p>
              )}
            </div>
          ))}
        </motion.div>

        {/* ================= GLOBAL ACTIONS ================= */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200/70 bg-zinc-50/60 px-4 py-4 sm:px-8"
        >
          <button
            type="button"
            onClick={() => onCompareAgain?.()}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Compare Again
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={shared ? "copied" : "share"}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
              >
                {shared ? "Copied!" : "Share Comparison"}
              </motion.span>
            </AnimatePresence>
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}