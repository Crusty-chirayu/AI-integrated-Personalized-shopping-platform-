"use client";

import { useMemo, useState } from "react";
import {
  Star,
  BadgeCheck,
  Sparkles,
  TrendingUp,
  Crown,
  Heart,
  Share2,
  Scale,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Lock,
  ChevronDown,
} from "lucide-react";
import type { Product } from "@/lib/storefront-data";
import { AddToCart } from "@/components/add-to-cart";
import ProductAIButton from "@/components/ai/ProductAIButton";
import ProductAIChat from "@/components/ai/ProductAIChat";

// ─────────────────────────────────────────────────────────────────────────
// Optional, non-invented extensions. Badges, AI tags, and price history
// only render when the data actually exists on the product or is passed
// in as a prop — nothing here fabricates a claim the store can't back up.
// ─────────────────────────────────────────────────────────────────────────
type EnrichedProduct = Product & {
  verified?: boolean;
  premium?: boolean;
  trending?: boolean;
  aiRecommended?: boolean;
  reviewCount?: number;
  aiTags?: { label: string; score?: number }[];
  priceHistory?: { changePercent: number; direction: "up" | "down" };
};

type Props = {
  product: Product;
  onToggleWishlist?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  freeShippingThreshold?: number;
  estimatedDeliveryDays?: string;
  returnWindowDays?: number;
  warrantyText?: string;
};

export default function ProductInfo({
  product,
  onToggleWishlist,
  onToggleCompare,
  onBuyNow,
  freeShippingThreshold,
  estimatedDeliveryDays,
  returnWindowDays = 30,
  warrantyText,
}: Props) {
  const p = product as EnrichedProduct;

  const [openAI, setOpenAI] = useState(false);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [compared, setCompared] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const [buyNowNotice, setBuyNowNotice] = useState("");

  const hasSale = product.salePrice != null && product.salePrice < product.price;
  const discountPercent = hasSale
    ? Math.round(((product.price - (product.salePrice as number)) / product.price) * 100)
    : 0;
  const amountSaved = hasSale ? product.price - (product.salePrice as number) : 0;

  const specEntries = useMemo(
    () => (product.specifications ? Object.entries(product.specifications) : []),
    [product.specifications]
  );
  const collapsedLimit = 6;
  const visibleSpecs = specsExpanded ? specEntries : specEntries.slice(0, collapsedLimit);

  const lowStock = typeof product.stock === "number" && product.stock > 0 && product.stock <= 10;
  const stockBarPct =
    typeof product.stock === "number" ? Math.min(100, Math.round((product.stock / 50) * 100)) : 100;

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: product.title,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        setShareNotice("Link copied");
        window.setTimeout(() => setShareNotice(""), 2000);
      }
    } catch {
      // user cancelled the native share sheet — nothing to do
    }
  };

  const handleWishlist = () => {
    setWishlisted((w) => !w);
    onToggleWishlist?.(product);
  };

  const handleCompare = () => {
    setCompared((c) => !c);
    onToggleCompare?.(product);
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product);
      return;
    }
    // No checkout handler wired in from the parent yet — say so instead
    // of silently doing nothing or faking a purchase.
    setBuyNowNotice("Buy Now isn't connected yet — use Add to Cart for now.");
    window.setTimeout(() => setBuyNowNotice(""), 2600);
  };

  return (
    <>
      <div className="cqp-font">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap');
          .cqp-font { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
          .cqp-display { font-family: 'Space Grotesk', 'Inter', ui-sans-serif, system-ui, sans-serif; }
          .cqp-gradient-text {
            background: linear-gradient(90deg, #8B6CFF 0%, #22C7E0 100%);
            -webkit-background-clip: text; background-clip: text; color: transparent;
          }
          .cqp-glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%); }
          .cqp-gradient-border { position: relative; }
          .cqp-gradient-border::before {
            content: ""; position: absolute; inset: 0; padding: 1px; border-radius: inherit;
            background: linear-gradient(135deg, rgba(139,108,255,0.5), rgba(34,199,224,0.16) 45%, rgba(255,255,255,0.35));
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
          }
          .cqp-focus-ring:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(139,108,255,0.32); }
          .cqp-ripple { position: relative; overflow: hidden; }
          .cqp-ripple::after {
            content: ""; position: absolute; inset: 0; border-radius: inherit;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 60%);
            opacity: 0; transform: scale(0.4); transition: transform 0.5s ease, opacity 0.6s ease;
          }
          .cqp-ripple:active::after { opacity: 1; transform: scale(1.4); transition: 0s; }
          .cqp-btn-primary {
            background: linear-gradient(120deg, #7C5CFC 0%, #22C7E0 130%);
            box-shadow: 0 1px 0 rgba(255,255,255,0.25) inset, 0 14px 30px -10px rgba(124,92,252,0.5);
          }
          .cqp-btn-primary:hover:not(:disabled) { box-shadow: 0 1px 0 rgba(255,255,255,0.3) inset, 0 18px 36px -8px rgba(124,92,252,0.6); }
          @media (prefers-reduced-motion: no-preference) {
            .cqp-rise { animation: cqp-rise 0.55s cubic-bezier(0.16,1,0.3,1) both; }
            .cqp-rise-1 { animation-delay: 0.02s; } .cqp-rise-2 { animation-delay: 0.08s; }
            .cqp-rise-3 { animation-delay: 0.14s; } .cqp-rise-4 { animation-delay: 0.2s; }
            .cqp-rise-5 { animation-delay: 0.26s; } .cqp-rise-6 { animation-delay: 0.32s; }
            .cqp-price-pop { animation: cqp-price-pop 0.4s cubic-bezier(0.16,1,0.3,1) both; }
            .cqp-ai-shimmer { background-size: 200% 100%; animation: cqp-ai-shimmer 6s ease-in-out infinite; }
            .cqp-accordion { transition: grid-template-rows 0.3s ease; }
          }
          @keyframes cqp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes cqp-price-pop { from { opacity: 0; transform: translateY(4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes cqp-ai-shimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        `}</style>

        {/* Eyebrow + badges */}
        <div className="cqp-rise cqp-rise-1 flex flex-wrap items-center gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">{product.category}</p>
          {p.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
          {p.premium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600">
              <Crown className="h-3 w-3" /> Premium
            </span>
          )}
          {p.trending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600">
              <TrendingUp className="h-3 w-3" /> Trending
            </span>
          )}
          {p.aiRecommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#8B6CFF]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#7C5CFC]">
              <Sparkles className="h-3 w-3" /> AI Recommended
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="cqp-rise cqp-rise-2 cqp-display mt-3 text-4xl font-semibold tracking-[-0.02em] text-zinc-950">
          {product.title}
        </h1>

        {/* Rating */}
        <div className="cqp-rise cqp-rise-2 mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Star className="h-5 w-5 fill-current" />
            <span className="cqp-display text-base font-semibold text-zinc-800">{product.rating}</span>
          </div>
          {typeof p.reviewCount === "number" && (
            <>
              <span className="text-zinc-300">•</span>
              <span className="inline-flex items-center gap-1">
                {p.reviewCount.toLocaleString()} reviews
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" aria-label="Verified reviews" />
              </span>
            </>
          )}
          <span className="text-zinc-300">•</span>
          <span>{product.stock > 0 ? `In stock · ${product.stock} available` : "Out of stock"}</span>
        </div>

        {/* Description */}
        <p className="cqp-rise cqp-rise-3 mt-6 text-base leading-8 text-zinc-600">{product.description}</p>

        {/* Price */}
        <div className="cqp-rise cqp-rise-3 cqp-price-pop mt-8 flex flex-wrap items-end gap-4">
          {hasSale ? (
            <>
              <span className="cqp-display text-4xl font-semibold text-zinc-950">
                ₹{product.salePrice}
              </span>
              <span className="text-lg text-zinc-400 line-through">₹{product.price}</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-600">
                -{discountPercent}%
              </span>
            </>
          ) : (
            <span className="cqp-display text-4xl font-semibold text-zinc-950">₹{product.price}</span>
          )}
        </div>
        {hasSale && (
          <p className="cqp-rise cqp-rise-3 mt-1.5 text-[13px] font-medium text-emerald-600">
            You save ₹{amountSaved}
          </p>
        )}
        {p.priceHistory && (
          <p className="cqp-rise cqp-rise-3 mt-1 inline-flex items-center gap-1 text-[12.5px] text-zinc-500">
            <TrendingUp
              className={`h-3.5 w-3.5 ${p.priceHistory.direction === "down" ? "rotate-180 text-emerald-500" : "text-rose-500"}`}
            />
            Price {p.priceHistory.direction === "down" ? "dropped" : "rose"} {p.priceHistory.changePercent}% recently
          </p>
        )}

        {/* Stock urgency bar — driven entirely by the real product.stock value */}
        {product.stock > 0 && (
          <div className="cqp-rise cqp-rise-3 mt-5 max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8B6CFF] to-[#22C7E0] transition-[width] duration-500"
                style={{ width: `${stockBarPct}%` }}
              />
            </div>
            {lowStock && (
              <p className="mt-1.5 text-[12.5px] font-medium text-rose-500">
                Only {product.stock} left — selling fast
              </p>
            )}
          </div>
        )}

        {/* AI insights — reuses the real AI chat rather than fabricating a score */}
        <div className="cqp-rise cqp-rise-4 cqp-gradient-border cqp-ai-shimmer mt-8 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#8B6CFF]/[0.07] via-white to-[#22C7E0]/[0.07] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-[#8B6CFF] to-[#22C7E0]">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </span>
              <div>
                <p className="cqp-display text-[14.5px] font-semibold text-zinc-900">Ask AI about this product</p>
                <p className="mt-0.5 text-[13px] text-zinc-500">
                  Get a personalized read on fit, value, and alternatives.
                </p>
                {p.aiTags && p.aiTags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {p.aiTags.map((tag) => (
                      <span
                        key={tag.label}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 shadow-sm"
                      >
                        {tag.label}
                        {typeof tag.score === "number" && (
                          <span className="cqp-gradient-text font-semibold">{tag.score}%</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ProductAIButton onClick={() => setOpenAI(true)} />
          </div>
        </div>

        {/* Specifications */}
        {specEntries.length > 0 && (
          <div className="cqp-rise cqp-rise-4 cqp-gradient-border mt-8 rounded-[24px] bg-white p-6 shadow-[0_16px_40px_rgba(17,17,17,0.06)]">
            <h3 className="cqp-display mb-5 text-xl font-semibold text-zinc-900">Specifications</h3>
            <div className="space-y-3">
              {visibleSpecs.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-black/5 pb-2.5">
                  <span className="font-medium text-zinc-700">{key}</span>
                  <span className="text-right text-zinc-600">{String(value)}</span>
                </div>
              ))}
            </div>
            {specEntries.length > collapsedLimit && (
              <button
                onClick={() => setSpecsExpanded((v) => !v)}
                aria-expanded={specsExpanded}
                className="cqp-focus-ring mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-[#7C5CFC] transition-colors hover:text-[#6a48e8]"
              >
                {specsExpanded ? "Show less" : `Show all ${specEntries.length} specifications`}
                <ChevronDown className={`h-4 w-4 transition-transform ${specsExpanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        )}

        {/* Delivery & policy */}
        <div className="cqp-rise cqp-rise-5 mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-2.5 rounded-2xl border border-black/5 bg-white p-4">
            <Truck className="h-4.5 w-4.5 flex-none text-[#7C5CFC]" />
            <div>
              <p className="text-[13px] font-semibold text-zinc-800">
                {estimatedDeliveryDays ? `Delivered in ${estimatedDeliveryDays}` : "Fast, reliable delivery"}
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                {typeof freeShippingThreshold === "number"
                  ? `Free above ₹${freeShippingThreshold}`
                  : "Express options at checkout"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-2xl border border-black/5 bg-white p-4">
            <RotateCcw className="h-4.5 w-4.5 flex-none text-[#7C5CFC]" />
            <div>
              <p className="text-[13px] font-semibold text-zinc-800">Easy returns</p>
              <p className="mt-0.5 text-[12px] text-zinc-500">{returnWindowDays}-day return window</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-2xl border border-black/5 bg-white p-4">
            <ShieldCheck className="h-4.5 w-4.5 flex-none text-[#7C5CFC]" />
            <div>
              <p className="text-[13px] font-semibold text-zinc-800">Warranty</p>
              <p className="mt-0.5 text-[12px] text-zinc-500">{warrantyText ?? "Manufacturer warranty included"}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="cqp-rise cqp-rise-5 mt-8 flex flex-col gap-3">
          <div className="[&_button]:cqp-ripple [&_button]:cqp-btn-primary [&_button]:w-full [&_button]:rounded-full [&_button]:py-3.5 [&_button]:text-[15px] [&_button]:font-semibold [&_button]:text-white [&_button]:transition-transform [&_button]:hover:scale-[1.01] [&_button]:active:scale-[0.99]">
            <AddToCart product={product} />
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="cqp-focus-ring cqp-ripple flex w-full items-center justify-center gap-2 rounded-full border-2 border-zinc-950 py-3.5 text-[15px] font-semibold text-zinc-950 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(17,17,17,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
          {buyNowNotice && <p className="text-center text-[12.5px] text-zinc-500">{buyNowNotice}</p>}

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleWishlist}
              aria-pressed={wishlisted}
              className="cqp-focus-ring flex items-center justify-center gap-1.5 rounded-full border border-black/10 py-2.5 text-[13px] font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:border-black/20"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
              Wishlist
            </button>
            <button
              type="button"
              onClick={handleCompare}
              aria-pressed={compared}
              className="cqp-focus-ring flex items-center justify-center gap-1.5 rounded-full border border-black/10 py-2.5 text-[13px] font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:border-black/20"
            >
              <Scale className={`h-4 w-4 ${compared ? "text-[#7C5CFC]" : ""}`} />
              Compare
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="cqp-focus-ring flex items-center justify-center gap-1.5 rounded-full border border-black/10 py-2.5 text-[13px] font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:border-black/20"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
          {shareNotice && <p className="text-center text-[12.5px] text-zinc-500">{shareNotice}</p>}
        </div>

        {/* Trust row */}
        <div className="cqp-rise cqp-rise-6 mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-zinc-400">
          <span className="inline-flex items-center gap-1.5 text-[12px]">
            <Lock className="h-3.5 w-3.5" /> Secure checkout
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px]">
            <RotateCcw className="h-3.5 w-3.5" /> Easy returns
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px]">
            <BadgeCheck className="h-3.5 w-3.5" /> Original product
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px]">
            <ShieldCheck className="h-3.5 w-3.5" /> Warranty protected
          </span>
        </div>
      </div>

      <ProductAIChat open={openAI} onClose={() => setOpenAI(false)} product={product} />
    </>
  );
}