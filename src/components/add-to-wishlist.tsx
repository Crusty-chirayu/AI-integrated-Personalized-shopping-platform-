"use client";

import { useState, useId, memo } from "react";
import { Heart, Loader2, Bell, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useWishlist } from "@/contexts/wishlist-context";

type Props = {
  product: any;
  compact?: boolean;
  disabled?: boolean;
  // Optional, additive AI affordances — only render if the caller passes
  // real data/handlers. Nothing here is invented when they're absent.
  aiFavorite?: boolean;
  recommendedForLater?: boolean;
  priceDropWatch?: boolean;
  onNotifyMe?: (product: any) => void;
};

const springy = { type: "spring", stiffness: 420, damping: 22 } as const;

function AddToWishlistImpl({
  product,
  compact = false,
  disabled = false,
  aiFavorite,
  recommendedForLater,
  priceDropWatch,
  onNotifyMe,
}: Props) {
  // ───────────────────────────────────────────────────────────────────────
  // WISHLIST LOGIC — UNCHANGED. Same hook, same toggle call, same
  // success-message decision (based on `active` read before the toggle).
  // ───────────────────────────────────────────────────────────────────────
  const { toggleItem, isWishlisted } = useWishlist();
  const active = isWishlisted(product.id);

  // ───────────────────────────────────────────────────────────────────────
  // UI-ONLY STATE — loading/burst/error presentation around that same call.
  // toggleItem is invoked exactly once per click, exactly as before; the
  // await simply lets us show a spinner if the context happens to return
  // a promise, and surface a real error instead of hiding it.
  // ───────────────────────────────────────────────────────────────────────
  const [pending, setPending] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const uid = useId();

  const handleClick = async () => {
    if (disabled || pending) return;
    const wasActive = active;
    setPending(true);
    try {
      await Promise.resolve(toggleItem(product));
      if (wasActive) {
        toast.success("Removed from wishlist");
      } else {
        toast.success("Added to wishlist ❤️");
        setBurstKey((k) => k + 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (/auth|login|sign.?in/i.test(msg)) {
        toast.error("Sign in to save items to your wishlist");
      } else {
        toast.error(msg || "Couldn't update your wishlist");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={compact ? "w-full" : "inline-block"}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .cqw-reduce-motion * { animation: none !important; transition: none !important; }
        }
        .cqw-glow { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        .cqw-glow-active { box-shadow: 0 8px 24px -6px rgba(239,68,68,0.45); }
        .cqw-gradient-border { position: relative; }
        .cqw-gradient-border::before {
          content: ""; position: absolute; inset: 0; padding: 1px; border-radius: inherit;
          background: linear-gradient(135deg, rgba(139,108,255,0.45), rgba(34,199,224,0.18) 60%, rgba(255,255,255,0.3));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
        }
      `}</style>

      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled || pending}
        aria-pressed={active}
        aria-busy={pending}
        aria-label={active ? `Remove ${product.title ?? "item"} from wishlist` : `Add ${product.title ?? "item"} to wishlist`}
        whileTap={disabled || pending ? undefined : { scale: 0.92 }}
        whileHover={disabled || pending ? undefined : { scale: 1.03, y: -1 }}
        transition={springy}
        className={`cqw-gradient-border relative flex items-center justify-center gap-2 overflow-visible rounded-full border px-4 py-2.5 text-sm font-medium backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF]/50 ${
          active
            ? "cqw-glow-active border-red-500/60 bg-red-500 text-white"
            : "border-black/10 bg-white/70 text-zinc-700 hover:bg-white"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${compact ? "w-full" : ""}`}
      >
        {/* Burst particles on activation */}
        <AnimatePresence>
          {burstKey > 0 && (
            <span key={burstKey} aria-hidden className="pointer-events-none absolute inset-0">
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                return (
                  <motion.span
                    key={i}
                    className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-red-400"
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{
                      opacity: 0,
                      x: Math.cos(angle) * 26,
                      y: Math.sin(angle) * 26,
                      scale: 0.4,
                    }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  />
                );
              })}
            </span>
          )}
        </AnimatePresence>

        {/* Floating heart-pop confirmation */}
        <AnimatePresence>
          {burstKey > 0 && (
            <motion.span
              key={`float-${burstKey}`}
              aria-hidden
              className="pointer-events-none absolute -top-1 left-1/2"
              initial={{ opacity: 1, y: 0, x: "-50%", scale: 0.6 }}
              animate={{ opacity: 0, y: -22, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            </motion.span>
          )}
        </AnimatePresence>

        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <motion.span
            key={active ? "filled" : "outline"}
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={springy}
          >
            <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
          </motion.span>
        )}

        <span>{pending ? "Saving..." : active ? "Saved" : "Wishlist"}</span>

        {aiFavorite && !compact && (
          <span className="ml-0.5 inline-flex items-center gap-1 rounded-full bg-[#8B6CFF]/15 px-2 py-0.5 text-[10px] font-semibold text-[#7C5CFC]">
            <Sparkles className="h-2.5 w-2.5" /> AI pick
          </span>
        )}
      </motion.button>

      {(recommendedForLater || priceDropWatch) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-zinc-500">
          {recommendedForLater && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1">
              <Sparkles className="h-3 w-3 text-[#8B6CFF]" /> Recommended for later
            </span>
          )}
          {priceDropWatch && (
            <button
              type="button"
              onClick={() => onNotifyMe?.(product)}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 transition-colors hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF]/50"
            >
              <Bell className="h-3 w-3" /> Notify me on price drop
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const AddToWishlist = memo(AddToWishlistImpl);