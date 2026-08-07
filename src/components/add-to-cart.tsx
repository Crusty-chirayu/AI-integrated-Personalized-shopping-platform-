"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Check,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import type { Product } from "@/lib/storefront-data";
import { div } from "framer-motion/client";

interface AddToCartProps {
  product: Product;
  compact?: boolean;
}

/**
 * Some storefronts extend Product with merchandising metadata (stock counts,
 * AI-recommendation flags). These are read defensively so this component
 * works identically whether or not those fields exist — no cart, inventory,
 * pricing, or checkout logic is touched here.
 */
type MerchandisedProduct = Product & {
  stock?: number;
  aiRecommended?: boolean;
};

const HOLD_DELAY = 380;
const HOLD_INTERVAL = 110;
const SUCCESS_DURATION = 900;

export function AddToCart({ product, compact = false }: AddToCartProps) {
  const { addItem, removeItem, isInCart } = useCart();
  const added = isInCart(product.id);

  const meta = product as MerchandisedProduct;
  const stock = typeof meta.stock === "number" ? meta.stock : undefined;
  const isOutOfStock = stock === 0;
  const isLimitedStock = typeof stock === "number" && stock > 0 && stock <= 5;
  const isAiRecommended = Boolean(meta.aiRecommended);

  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const rippleId = useRef(0);
  const holdTimeout = useRef<number | null>(null);
  const holdInterval = useRef<number | null>(null);
  const celebrateTimeout = useRef<number | null>(null);
  const uid = useId();

  const maxQuantity = typeof stock === "number" ? Math.max(1, stock) : 99;

  useEffect(() => {
    if (added) setQuantity(1);
  }, [added]);

  useEffect(() => {
    return () => {
      if (holdTimeout.current) window.clearTimeout(holdTimeout.current);
      if (holdInterval.current) window.clearInterval(holdInterval.current);
      if (celebrateTimeout.current) window.clearTimeout(celebrateTimeout.current);
    };
  }, []);

  const clampQuantity = useCallback(
    (value: number) => Math.min(maxQuantity, Math.max(1, value)),
    [maxQuantity]
  );

  const stepQuantity = useCallback(
    (delta: number) => setQuantity((q) => clampQuantity(q + delta)),
    [clampQuantity]
  );

  const startHold = useCallback(
    (delta: number) => {
      stepQuantity(delta);
      holdTimeout.current = window.setTimeout(() => {
        holdInterval.current = window.setInterval(() => stepQuantity(delta), HOLD_INTERVAL);
      }, HOLD_DELAY);
    },
    [stepQuantity]
  );

  const stopHold = useCallback(() => {
    if (holdTimeout.current) {
      window.clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    if (holdInterval.current) {
      window.clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
  }, []);

  const handleRemove = useCallback(() => {
    removeItem(product.id);
    toast.info(`${product.title} removed from cart`);
  }, [removeItem, product]);

  const handleAdd = useCallback(() => {
    if (isOutOfStock || isProcessing) return;
    setIsProcessing(true);
    window.setTimeout(() => {
      for (let i = 0; i < quantity; i += 1) {
        addItem(product);
      }
      setIsProcessing(false);
      setCelebrate(true);
      celebrateTimeout.current = window.setTimeout(() => setCelebrate(false), SUCCESS_DURATION);
      toast.success(
        quantity > 1
          ? `${quantity} × ${product.title} added to cart`
          : `${product.title} added to cart`
      );
    }, 420);
  }, [isOutOfStock, isProcessing, quantity, addItem, product]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const bounds = e.currentTarget.getBoundingClientRect();
      const id = rippleId.current++;
      setRipples((prev) => [
        ...prev,
        { id, x: e.clientX - bounds.left, y: e.clientY - bounds.top },
      ]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);

      if (added) handleRemove();
      else handleAdd();
    },
    [added, handleAdd, handleRemove]
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 34 + Math.random() * 26;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          hue: [270, 200, 340, 40][i % 4],
        };
      }),
    [celebrate]
  );

  const disabled = isOutOfStock || isProcessing;

  // ---------------------------------------------------------------------
  // Compact mode — same toggle behavior, smaller premium pill, no stepper.
  // ---------------------------------------------------------------------
  if (compact) {
    return (
      <motion.button
        type="button"
        whileTap={disabled ? undefined : { scale: 0.94 }}
        whileHover={disabled ? undefined : { scale: 1.03, y: -1 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={added}
        aria-disabled={disabled}
        aria-label={isOutOfStock ? "Out of stock" : added ? "Remove from cart" : "Add to cart"}
        className={`relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_8px_24px_-10px_rgba(0,0,0,0.35)] ring-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
          isOutOfStock
            ? "cursor-not-allowed bg-zinc-100 text-zinc-400 ring-zinc-200"
            : added
            ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white ring-white/10 hover:from-indigo-500 hover:to-violet-500"
            : "border border-zinc-200 bg-white/80 text-zinc-900 backdrop-blur-sm ring-zinc-200 hover:border-indigo-400 hover:text-indigo-600"
        }`}
      >
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ opacity: 0.45, scale: 0 }}
            animate={{ opacity: 0, scale: 2.6 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{ left: r.x, top: r.y }}
            className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current/40"
          />
        ))}
        <AnimatePresence mode="wait" initial={false}>
          {isOutOfStock ? (
            <motion.span key="oos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Out of stock
            </motion.span>
          ) : isProcessing ? (
            <motion.span
              key="processing"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding
            </motion.span>
          ) : added ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              In Cart
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Add
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // ---------------------------------------------------------------------
  // Full premium experience.
  // ---------------------------------------------------------------------
  return (
    <div className="flex w-full flex-col gap-2.5">
      {isAiRecommended && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-200 bg-gradient-to-r from-violet-50 to-cyan-50 px-2.5 py-1 text-[11px] font-medium text-violet-700"
        >
          <Sparkles className="h-3 w-3" />
          AI Recommended for you
        </motion.div>
      )}

      <div className="flex items-stretch gap-2.5">
        {!isOutOfStock && (
          <div
            role="group"
            aria-label="Quantity"
            className="flex items-center rounded-full border border-zinc-200 bg-white/80 px-1 shadow-sm backdrop-blur-sm"
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onPointerDown={() => startHold(-1)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <div className="w-7 overflow-hidden text-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={quantity}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="block text-sm font-semibold tabular-nums text-zinc-900"
                >
                  {quantity}
                </motion.span>
              </AnimatePresence>
            </div>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= maxQuantity}
              onPointerDown={() => startHold(1)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <motion.button
          type="button"
          id={`add-to-cart-${uid}`}
          whileTap={disabled ? undefined : { scale: 0.96 }}
          whileHover={disabled ? undefined : { scale: 1.015, y: -1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          onClick={handleClick}
          disabled={disabled}
          aria-pressed={added}
          aria-disabled={disabled}
          aria-label={isOutOfStock ? "Out of stock" : added ? "Remove from cart" : "Add to cart"}
          className={`relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-semibold shadow-[0_20px_45px_-18px_rgba(79,70,229,0.55)] ring-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
            isOutOfStock
              ? "cursor-not-allowed bg-zinc-100 text-zinc-400 shadow-none ring-zinc-200"
              : added
              ? "bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_100%] text-white ring-white/10 hover:bg-right"
              : "bg-gradient-to-br from-zinc-900 to-zinc-700 text-white ring-white/10 hover:from-indigo-600 hover:to-violet-600"
          }`}
        >
          {/* Animated gradient border sheen */}
          {!isOutOfStock && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.35) 40%, transparent 60%)",
                backgroundSize: "200% 100%",
              }}
              animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
            />
          )}

          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 0.4, scale: 0 }}
              animate={{ opacity: 0, scale: 3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ left: r.x, top: r.y }}
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50"
            />
          ))}

          {/* Confetti / particle burst on success */}
          <AnimatePresence>
            {celebrate && (
              <span className="pointer-events-none absolute left-1/2 top-1/2 z-10">
                {particles.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: `hsl(${p.hue} 85% 65%)` }}
                  />
                ))}
              </span>
            )}
          </AnimatePresence>

          {/* Product "flying" toward the cart */}
          <AnimatePresence>
            {celebrate && (
              <motion.span
                initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                animate={{ opacity: 0, scale: 0.4, x: 46, y: -46, rotate: 18 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute right-4 top-1/2 z-10 -translate-y-1/2 text-white"
              >
                <ShoppingBag className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            {isOutOfStock ? (
              <motion.span key="oos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Out of stock
              </motion.span>
            ) : isProcessing ? (
              <motion.span
                key="processing"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding…
              </motion.span>
            ) : added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                >
                  <Check className="h-4 w-4" />
                </motion.span>
                In Cart
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div aria-live="polite" className="min-h-[1rem] text-xs">
        {isOutOfStock ? (
          <span className="font-medium text-red-500">Currently unavailable</span>
        ) : isLimitedStock ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-medium text-amber-600"
          >
            Only {stock} left — order soon
          </motion.span>
        ) : null}
      </div>

      {!isOutOfStock && (
        <button
          type="button"
          onClick={() =>
            toast.info("AI Suggestion", {
              description: `Customers who bought ${product.title} also loved similar picks.`,
            })
          }
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-transparent px-1 text-xs font-medium text-zinc-500 transition-colors duration-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <Users className="h-3.5 w-3.5" />
          Frequently bought together
        </button>
      )}
    </div>
  );
}