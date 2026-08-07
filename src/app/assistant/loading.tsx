"use client";

import { motion, useReducedMotion, easeInOut } from "framer-motion";

/* ============================================================================
 * AssistantLoading — Premium skeleton for the CartIQ AI Shopping Assistant
 * ----------------------------------------------------------------------------
 * Pure presentation, no data/logic. Mirrors the real layout structure
 * (sidebar / hero / chat stream / input, plus an AI insights rail) so the
 * transition into the loaded ChatWindow feels seamless rather than jarring.
 * Every "loading" surface uses a soft shimmer sweep instead of a flat pulse,
 * and honors prefers-reduced-motion by falling back to a static pulse.
 * ==========================================================================*/
export default function AssistantLoading() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* ================================================================
          LEFT SIDEBAR
         ================================================================ */}
      <div className="hidden w-72 shrink-0 flex-col border-r border-black/5 bg-zinc-50/70 p-4 backdrop-blur-xl md:flex">
        {/* New chat button */}
        <Shimmer className="h-11 w-full rounded-2xl" reduceMotion={!!prefersReducedMotion} />

        {/* Search */}
        <Shimmer
          className="mt-3 h-10 w-full rounded-full"
          reduceMotion={!!prefersReducedMotion}
        />

        {/* Pinned section */}
        <div className="mt-6">
          <Shimmer className="h-3 w-16 rounded-md" reduceMotion={!!prefersReducedMotion} />
          <div className="mt-3 space-y-2.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <ConversationCardSkeleton key={`pinned-${i}`} reduceMotion={!!prefersReducedMotion} pinned />
            ))}
          </div>
        </div>

        {/* Recent section */}
        <div className="mt-6">
          <Shimmer className="h-3 w-20 rounded-md" reduceMotion={!!prefersReducedMotion} />
          <div className="mt-3 space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ConversationCardSkeleton key={`recent-${i}`} reduceMotion={!!prefersReducedMotion} />
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================
          CENTER — CHAT AREA
         ================================================================ */}
      <div className="flex flex-1 flex-col">
        {/* Hero / AI banner */}
        <div className="border-b border-black/5 p-6">
          <div className="mx-auto max-w-3xl rounded-[24px] bg-gradient-to-br from-indigo-50 to-teal-50 p-6">
            <div className="flex items-center gap-4">
              <OrbSkeleton reduceMotion={!!prefersReducedMotion} />
              <div className="flex-1 space-y-2.5">
                <Shimmer className="h-4 w-40 rounded-md" reduceMotion={!!prefersReducedMotion} />
                <Shimmer className="h-3 w-56 rounded-md" reduceMotion={!!prefersReducedMotion} />
              </div>
              <div className="hidden flex-col items-end gap-1.5 sm:flex">
                <Shimmer className="h-3 w-20 rounded-md" reduceMotion={!!prefersReducedMotion} />
                <Shimmer className="h-3 w-14 rounded-md" reduceMotion={!!prefersReducedMotion} />
              </div>
            </div>
          </div>
        </div>

        {/* Chat bubbles */}
        <div className="flex-1 space-y-5 overflow-y-auto p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Assistant bubble */}
            <div className="flex items-start gap-3">
              <AvatarDotSkeleton reduceMotion={!!prefersReducedMotion} />
              <div className="space-y-2">
                <Shimmer className="h-4 w-72 rounded-2xl" reduceMotion={!!prefersReducedMotion} />
                <Shimmer className="h-4 w-52 rounded-2xl" reduceMotion={!!prefersReducedMotion} />
              </div>
            </div>

            {/* User bubble */}
            <div className="ml-auto flex w-fit items-start justify-end gap-3">
              <Shimmer className="h-10 w-48 rounded-2xl" reduceMotion={!!prefersReducedMotion} />
            </div>

            {/* Assistant bubble with product-card block */}
            <div className="flex items-start gap-3">
              <AvatarDotSkeleton reduceMotion={!!prefersReducedMotion} />
              <div className="w-full max-w-md space-y-3">
                <Shimmer className="h-4 w-64 rounded-2xl" reduceMotion={!!prefersReducedMotion} />
                <div className="grid grid-cols-2 gap-3">
                  <ProductCardSkeleton reduceMotion={!!prefersReducedMotion} />
                  <ProductCardSkeleton reduceMotion={!!prefersReducedMotion} />
                </div>
              </div>
            </div>

            {/* AI thinking indicator */}
            <ThinkingIndicatorSkeleton reduceMotion={!!prefersReducedMotion} />

            {/* Suggested prompts */}
            <div className="flex flex-wrap gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Shimmer
                  key={i}
                  className="h-8 w-32 rounded-full"
                  reduceMotion={!!prefersReducedMotion}
                  delay={i * 0.08}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Input box */}
        <div className="border-t border-black/5 bg-white/80 p-6 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <Shimmer className="h-14 flex-1 rounded-2xl" reduceMotion={!!prefersReducedMotion} />
            <Shimmer className="h-14 w-14 rounded-2xl" reduceMotion={!!prefersReducedMotion} />
            <Shimmer className="h-14 w-14 rounded-2xl" reduceMotion={!!prefersReducedMotion} />
            <Shimmer className="h-14 w-20 rounded-2xl" reduceMotion={!!prefersReducedMotion} />
          </div>
        </div>
      </div>

      {/* ================================================================
          RIGHT PANEL — AI SHOPPING INSIGHTS
         ================================================================ */}
      <div className="hidden w-80 shrink-0 flex-col gap-6 overflow-y-auto border-l border-black/5 bg-zinc-50/70 p-5 backdrop-blur-xl xl:flex">
        <InsightSectionSkeleton title="Recently Viewed" rows={2} reduceMotion={!!prefersReducedMotion} />
        <InsightSectionSkeleton title="Recommended" rows={3} reduceMotion={!!prefersReducedMotion} />
        <InsightSectionSkeleton title="Price Drops" rows={2} reduceMotion={!!prefersReducedMotion} />
      </div>
    </div>
  );
}

/* ============================================================================
 * Shimmer primitive — animated gradient sweep, falls back to a static pulse
 * for prefers-reduced-motion.
 * ==========================================================================*/
function Shimmer({
  className = "",
  reduceMotion,
  delay = 0,
}: {
  className?: string;
  reduceMotion: boolean;
  delay?: number;
}) {
  if (reduceMotion) {
    return <div className={`animate-pulse bg-zinc-200 ${className}`} />;
  }
  return (
    <motion.div
      className={className}
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(228,228,231,0.9) 25%, rgba(244,244,245,1) 50%, rgba(228,228,231,0.9) 75%)",
        backgroundSize: "200% 100%",
      }}
      animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
      transition={{
        duration: 1.6,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    />
  );
}

/* ============================================================================
 * Composite skeleton pieces
 * ==========================================================================*/
function ConversationCardSkeleton({
  reduceMotion,
  pinned = false,
}: {
  reduceMotion: boolean;
  pinned?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-3.5">
      <div className="flex items-center gap-2">
        {pinned && <Shimmer className="h-2.5 w-2.5 shrink-0 rounded-full" reduceMotion={reduceMotion} />}
        <Shimmer className="h-3.5 w-3/4 rounded-md" reduceMotion={reduceMotion} />
      </div>
      <Shimmer className="mt-2 h-3 w-1/2 rounded-md" reduceMotion={reduceMotion} />
    </div>
  );
}

function OrbSkeleton({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="relative h-10 w-10 shrink-0">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-teal-400 opacity-70 blur-md"
        animate={
          reduceMotion
            ? { opacity: 0.5 }
            : { opacity: [0.4, 0.75, 0.4], scale: [0.9, 1.05, 0.9] }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: easeInOut }}
      />
      <div className="absolute inset-1 rounded-full border border-white/60 bg-white/40 backdrop-blur-md" />
    </div>
  );
}

function AvatarDotSkeleton({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-300 via-fuchsia-300 to-teal-300"
      animate={reduceMotion ? { opacity: 0.7 } : { opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: easeInOut }}
    />
  );
}

function ProductCardSkeleton({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="space-y-2 rounded-2xl border border-black/5 bg-white p-2.5">
      <Shimmer className="h-20 w-full rounded-xl" reduceMotion={reduceMotion} />
      <Shimmer className="h-3 w-4/5 rounded-md" reduceMotion={reduceMotion} />
      <Shimmer className="h-3 w-1/2 rounded-md" reduceMotion={reduceMotion} />
    </div>
  );
}

function ThinkingIndicatorSkeleton({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="flex items-center gap-3 pl-11">
      <div className="flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3.5 py-2 shadow-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500"
            animate={
              reduceMotion
                ? { opacity: 0.6 }
                : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }
            }
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: easeInOut,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-zinc-400">AI is thinking…</span>
    </div>
  );
}

function InsightSectionSkeleton({
  title,
  rows,
  reduceMotion,
}: {
  title: string;
  rows: number;
  reduceMotion: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {title}
      </p>
      <div className="mt-3 space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-2.5"
          >
            <Shimmer className="h-12 w-12 shrink-0 rounded-xl" reduceMotion={reduceMotion} />
            <div className="flex-1 space-y-1.5">
              <Shimmer className="h-3 w-full rounded-md" reduceMotion={reduceMotion} />
              <Shimmer className="h-3 w-2/3 rounded-md" reduceMotion={reduceMotion} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}