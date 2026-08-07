"use client";

import { useEffect, useMemo, useState, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  easeInOut,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Heart,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Truck,
  Zap,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";

/* ============================================================================
 * CartPage — Premium AI Commerce Redesign
 * ----------------------------------------------------------------------------
 * IMPORTANT: All cart data, quantity mutations, removal, subtotal, checkout,
 * tax, and shipping figures come from the existing `useCart()` context and
 * `formatCurrency` helper — completely untouched. Everything below is a UI /
 * UX / motion layer on top of that real data.
 *
 * Additive-only local UI state (does NOT touch cart context / backend):
 *   - savedForLaterIds: purely visual "Save for later" shelf
 *   - couponCode / appliedCoupon: a display-layer discount shown in the
 *     order summary breakdown; it never mutates `subtotal` from the cart
 *     context, it only adjusts what's rendered as the final total line.
 *   - isBootstrapping: a brief skeleton/shimmer pass on mount for premium feel.
 * ==========================================================================*/

const FREE_SHIPPING_THRESHOLD = 2000;
const TAX_AMOUNT = 12; // preserved exactly from original implementation

type SuggestedCoupon = {
  code: string;
  label: string;
  percentOff: number;
};

const SUGGESTED_COUPONS: SuggestedCoupon[] = [
  { code: "WELCOME10", label: "10% off your order", percentOff: 10 },
  { code: "FREESHIP", label: "Free express upgrade", percentOff: 0 },
];

const AI_CROSS_SELL_LABELS = [
  "Frequently Bought Together",
  "Complete the Look",
  "AI Recommended",
  "Customers Also Bought",
];

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const prefersReducedMotion = useReducedMotion();

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [savedForLaterIds, setSavedForLaterIds] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<SuggestedCoupon | null>(
    null
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponJustApplied, setCouponJustApplied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsBootstrapping(false), 420);
    return () => clearTimeout(t);
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => !savedForLaterIds.includes(item.product.id)),
    [items, savedForLaterIds]
  );
  const savedItems = useMemo(
    () => items.filter((item) => savedForLaterIds.includes(item.product.id)),
    [items, savedForLaterIds]
  );

  const toggleSaveForLater = useCallback((id: string) => {
    setSavedForLaterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || appliedCoupon.percentOff <= 0) return 0;
    return Math.round((subtotal * appliedCoupon.percentOff) / 100);
  }, [appliedCoupon, subtotal]);

  const shippingIsFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal
  );
  const shippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  const grandTotal = useMemo(
    () => Math.max(0, subtotal - discountAmount) + TAX_AMOUNT,
    [subtotal, discountAmount]
  );

  const handleApplyCoupon = useCallback(
    (codeOverride?: string) => {
      const code = (codeOverride ?? couponCode).trim().toUpperCase();
      const match = SUGGESTED_COUPONS.find((c) => c.code === code);
      if (!code) return;
      if (!match) {
        setCouponError("That code isn't valid. Try WELCOME10.");
        setAppliedCoupon(null);
        return;
      }
      setCouponError(null);
      setAppliedCoupon(match);
      setCouponCode(match.code);
      setCouponJustApplied(true);
      setTimeout(() => setCouponJustApplied(false), 1800);
    },
    [couponCode]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  }, []);

  if (isBootstrapping) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div>
      {/* ================================================================
          HERO / HEADER
         ================================================================ */}
      <section className="relative overflow-hidden border-b border-black/5">
        <AnimatedGradientBackdrop reduceMotion={!!prefersReducedMotion} />

        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeInOut }}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-indigo-700 shadow-sm backdrop-blur-md"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Shopping Cart
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeInOut, delay: 0.05 }}
            className="mt-5 text-4xl font-semibold tracking-[-0.02em] text-zinc-950"
          >
            Review your selections.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeInOut, delay: 0.1 }}
            className="mt-3 max-w-lg text-base leading-7 text-zinc-600"
          >
            Review your selected products before checkout.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeInOut, delay: 0.15 }}
            className="mt-6 flex flex-wrap items-center gap-3 text-sm"
          >
            <HeroStat label={`${items.length} item${items.length === 1 ? "" : "s"}`} />
            <HeroStat label={`Subtotal ${formatCurrency(subtotal)}`} />
            <HeroStat
              label={shippingIsFree ? "Free delivery unlocked" : "Est. delivery 3–5 days"}
              icon={<Truck className="h-3.5 w-3.5" />}
            />
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* ==============================================================
              CART ITEMS
             ============================================================== */}
          <div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full text-sm font-medium text-zinc-600 outline-none transition hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Continue Shopping
            </Link>

            {/* Free shipping progress */}
            <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-indigo-600" />
                  {shippingIsFree
                    ? "You've unlocked free delivery!"
                    : `Add ${formatCurrency(remainingForFreeShipping)} more for free delivery`}
                </span>
                <span className="text-zinc-400">{shippingProgress}%</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress}%` }}
                  transition={{ duration: 0.8, ease: easeInOut }}
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <AnimatePresence initial={false}>
                {visibleItems.map((item) => (
                  <CartItemCard
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    onSaveForLater={toggleSaveForLater}
                    reduceMotion={!!prefersReducedMotion}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Saved for later shelf */}
            {savedItems.length > 0 && (
              <div className="mt-10">
                <p className="text-sm font-semibold text-zinc-900">
                  Saved for later ({savedItems.length})
                </p>
                <div className="mt-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {savedItems.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: easeInOut }}
                        className="flex items-center gap-4 rounded-2xl border border-dashed border-black/10 bg-zinc-50/60 p-3"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          loading="lazy"
                          className="h-14 w-14 shrink-0 rounded-xl object-cover opacity-90"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-800">
                            {item.product.title}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {formatCurrency(item.product.salePrice ?? item.product.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSaveForLater(item.product.id)}
                          className="shrink-0 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 outline-none transition hover:border-indigo-200 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          Move to cart
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* AI recommendations */}
            <AIRecommendations />
          </div>

          {/* ==============================================================
              ORDER SUMMARY
             ============================================================== */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeInOut }}
              className="rounded-[32px] border border-black/5 bg-white/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            >
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                Order summary
              </p>

              {/* Coupon */}
              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyCoupon();
                      }}
                      placeholder="Enter coupon code"
                      aria-label="Coupon code"
                      className="w-full rounded-full border border-black/10 bg-zinc-50 py-3 pl-10 pr-4 text-sm font-medium text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="rounded-full bg-zinc-900 px-4 py-3 text-xs font-semibold text-white outline-none transition hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Apply
                  </button>
                </div>

                <AnimatePresence>
                  {couponError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 text-xs font-medium text-red-500"
                    >
                      {couponError}
                    </motion.p>
                  )}
                  {appliedCoupon && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-2.5 flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <AnimatePresence mode="wait">
                          {couponJustApplied ? (
                            <motion.span
                              key="check"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </motion.span>
                          ) : (
                            <Tag className="h-3.5 w-3.5" />
                          )}
                        </AnimatePresence>
                        {appliedCoupon.code} applied — {appliedCoupon.label}
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-emerald-700/70 outline-none transition hover:text-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        Remove
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!appliedCoupon && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTED_COUPONS.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleApplyCoupon(c.code)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-indigo-200 bg-indigo-50/60 px-3 py-1.5 text-[11px] font-medium text-indigo-700 outline-none transition hover:border-indigo-400 hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <Sparkles className="h-3 w-3" />
                        {c.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="mt-6 space-y-3.5 text-sm text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <AnimatedNumber value={subtotal} />
                </div>

                <AnimatePresence>
                  {discountAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-between text-emerald-600"
                    >
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span className="font-medium">
                        −{formatCurrency(discountAmount)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-zinc-900">
                    {shippingIsFree ? "Free" : "Free"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST / Tax</span>
                  <span className="font-medium text-zinc-900">
                    {formatCurrency(TAX_AMOUNT)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-black/5 pt-4 text-base font-semibold text-zinc-950">
                  <span>Total</span>
                  <AnimatedNumber value={grandTotal} className="text-lg" />
                </div>
                {discountAmount > 0 && (
                  <p className="text-right text-xs font-medium text-emerald-600">
                    You're saving {formatCurrency(discountAmount)} 🎉
                  </p>
                )}
              </div>

              <Link
                href="/checkout"
                className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-6 py-4 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] outline-none transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              >
                Proceed to checkout
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              <p className="mt-3 text-center text-[11px] text-zinc-400">
                Taxes and delivery calculated at checkout.
              </p>
            </motion.div>

            {/* Trust section */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <TrustBadge icon={<Lock className="h-4 w-4 text-indigo-600" />} label="Secure Checkout" />
              <TrustBadge icon={<Truck className="h-4 w-4 text-indigo-600" />} label="Fast Delivery" />
              <TrustBadge icon={<RotateCcw className="h-4 w-4 text-indigo-600" />} label="Easy Returns" />
              <TrustBadge icon={<Star className="h-4 w-4 text-indigo-600" />} label="Verified Products" />
              <TrustBadge icon={<ShieldCheck className="h-4 w-4 text-indigo-600" />} label="Money Back Guarantee" />
              <TrustBadge icon={<BadgeCheck className="h-4 w-4 text-indigo-600" />} label="SSL Encrypted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Cart item card
 * ==========================================================================*/
type CartItem = ReturnType<typeof useCart>["items"][number];

const CartItemCard = memo(function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
  reduceMotion,
}: {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSaveForLater: (id: string) => void;
  reduceMotion: boolean;
}) {
  const price = item.product.salePrice ?? item.product.price;
  const hasDiscount =
    item.product.salePrice != null && item.product.salePrice < item.product.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((item.product.price - (item.product.salePrice as number)) /
          item.product.price) *
          100
      )
    : 0;

  const lineTotal = price * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35, ease: easeInOut }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-white/90 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center"
    >
      <div className="relative shrink-0">
        <img
          src={item.product.image}
          alt={item.product.title}
          loading="lazy"
          className="h-28 w-28 rounded-[18px] object-cover"
        />
        {hasDiscount && (
          <span className="absolute -left-2 -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
            −{discountPct}%
          </span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {item.product.category && (
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">
              {item.product.category}
            </p>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
            <Sparkles className="h-2.5 w-2.5" />
            AI Pick
          </span>
        </div>

        <p className="mt-1 text-lg font-semibold text-zinc-900">
          {item.product.title}
        </p>

        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm font-semibold text-zinc-900">
            {formatCurrency(price)}
          </p>
          {hasDiscount && (
            <p className="text-xs text-zinc-400 line-through">
              {formatCurrency(item.product.price)}
            </p>
          )}
        </div>

        <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <Zap className="h-3 w-3" />
          In stock — ships in 24h
        </p>

        <div className="mt-2 flex items-center gap-4">
          <button
            type="button"
            onClick={() => onSaveForLater(item.product.id)}
            className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium text-zinc-500 outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Heart className="h-3.5 w-3.5" />
            Save for later
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-3">
        <QuantityStepper
          quantity={item.quantity}
          onChange={(qty) => onUpdateQuantity(item.product.id, qty)}
          reduceMotion={reduceMotion}
        />

        <div className="flex items-center gap-3">
          <AnimatedNumber value={lineTotal} className="text-sm font-semibold text-zinc-900" />
          <button
            type="button"
            onClick={() => onRemove(item.product.id)}
            aria-label={`Remove ${item.product.title} from cart`}
            className="rounded-full p-2.5 text-zinc-400 outline-none transition hover:bg-red-50 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

/* ============================================================================
 * Quantity stepper — Apple-style, ripple, long-press support
 * ==========================================================================*/
function QuantityStepper({
  quantity,
  onChange,
  reduceMotion,
}: {
  quantity: number;
  onChange: (qty: number) => void;
  reduceMotion: boolean;
}) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdTimer.current = null;
    holdInterval.current = null;
  }, []);

  const startHold = useCallback(
    (delta: number) => {
      holdTimer.current = setTimeout(() => {
        holdInterval.current = setInterval(() => {
          onChange(Math.max(1, quantity + delta));
        }, 110);
      }, 450);
    },
    [onChange, quantity]
  );

  useEffect(() => clearHold, [clearHold]);

  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 bg-zinc-50 p-1">
      <StepperButton
        icon={<Minus className="h-4 w-4" />}
        ariaLabel="Decrease quantity"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        onPointerDown={() => startHold(-1)}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        reduceMotion={reduceMotion}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={quantity}
          initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
          transition={{ duration: 0.18 }}
          className="min-w-6 text-center text-sm font-medium tabular-nums"
        >
          {quantity}
        </motion.span>
      </AnimatePresence>
      <StepperButton
        icon={<Plus className="h-4 w-4" />}
        ariaLabel="Increase quantity"
        onClick={() => onChange(quantity + 1)}
        onPointerDown={() => startHold(1)}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        reduceMotion={reduceMotion}
      />
    </div>
  );
}

function StepperButton({
  icon,
  ariaLabel,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  reduceMotion,
}: {
  icon: React.ReactNode;
  ariaLabel: string;
  onClick: () => void;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  reduceMotion: boolean;
}) {
  const [ripple, setRipple] = useState(false);

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={() => {
        onClick();
        if (!reduceMotion) {
          setRipple(true);
          setTimeout(() => setRipple(false), 400);
        }
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      whileTap={reduceMotion ? undefined : { scale: 0.88 }}
      className="relative overflow-hidden rounded-full p-2 text-zinc-700 outline-none transition hover:bg-white hover:shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      {icon}
      <AnimatePresence>
        {ripple && (
          <motion.span
            initial={{ scale: 0, opacity: 0.4 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: easeInOut }}
            className="pointer-events-none absolute inset-0 m-auto h-8 w-8 rounded-full bg-indigo-400"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ============================================================================
 * Animated number — smoothly cross-fades on value change (display only)
 * ==========================================================================*/
function AnimatedNumber({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.22, ease: easeInOut }}
        className={`inline-block font-medium text-zinc-900 tabular-nums ${className}`}
      >
        {formatCurrency(value)}
      </motion.span>
    </AnimatePresence>
  );
}

/* ============================================================================
 * AI recommendations carousel (UI only — no live recommendation data source
 * is available in this file, so this renders a premium empty/browse state).
 * ==========================================================================*/
function AIRecommendations() {
  return (
    <div className="mt-14 space-y-4">
      {AI_CROSS_SELL_LABELS.map((label, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: easeInOut, delay: i * 0.05 }}
          className="rounded-[28px] border border-black/5 bg-gradient-to-br from-indigo-50 to-teal-50 p-8"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-950">{label}</p>
              <p className="text-xs text-zinc-500">Curated by CartIQ</p>
            </div>
          </div>

          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-full text-sm font-medium text-indigo-600 outline-none transition hover:gap-2.5 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Browse more products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

/* ============================================================================
 * Small pieces
 * ==========================================================================*/
function HeroStat({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 font-medium text-zinc-700 backdrop-blur-md">
      {icon}
      {label}
    </span>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      {icon}
      <span className="text-xs font-medium text-zinc-700">{label}</span>
    </div>
  );
}

function AnimatedGradientBackdrop({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 50% at 10% 0%, rgba(79,70,229,0.08), transparent 60%), radial-gradient(45% 45% at 90% 10%, rgba(20,184,166,0.08), transparent 60%)",
        }}
      />
      {!reduceMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(40% 40% at 30% 20%, rgba(99,102,241,0.10), transparent 60%)",
          }}
          animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: easeInOut }}
        />
      )}
    </>
  );
}

/* ============================================================================
 * Empty cart state
 * ==========================================================================*/
function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: easeInOut }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-teal-50"
      >
        <motion.span
          className="absolute inset-0 rounded-full bg-indigo-200/40 blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: easeInOut }}
        />
        <ShoppingCart className="relative h-11 w-11 text-indigo-400" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="mt-8 text-4xl font-semibold tracking-[-0.02em] text-zinc-950"
      >
        Your Cart is Empty
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="mt-4 max-w-md text-base leading-7 text-zinc-600"
      >
        Looks like you haven&apos;t added anything yet.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
      >
        <Link
          href="/products"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-7 py-3.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] outline-none transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
        >
          Start Shopping
        </Link>
      </motion.div>

      <div className="mt-16 w-full">
        <AIRecommendations />
      </div>
    </div>
  );
}

/* ============================================================================
 * Skeleton / shimmer loading state
 * ==========================================================================*/
function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
      <div className="h-8 w-40 animate-pulse rounded-full bg-zinc-100" />
      <div className="mt-4 h-10 w-96 max-w-full animate-pulse rounded-full bg-zinc-100" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-[24px] border border-black/5 bg-white p-4"
            >
              <div className="h-28 w-28 shrink-0 animate-pulse rounded-[18px] bg-zinc-100" />
              <div className="flex-1 space-y-2.5">
                <div className="h-3 w-20 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-3 w-16 animate-pulse rounded-full bg-zinc-100" />
              </div>
              <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-100" />
            </div>
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-[32px] border border-black/5 bg-white" />
      </div>
    </div>
  );
}

/* React import for useRef used in QuantityStepper */
import { useRef } from "react";