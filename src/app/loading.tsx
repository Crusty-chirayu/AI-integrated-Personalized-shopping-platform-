"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, easeInOut } from "framer-motion";

/* ============================================================================
 * Global Loading Screen — CartIQ
 * ----------------------------------------------------------------------------
 * Next.js root `loading.tsx`: automatically used as the Suspense boundary
 * fallback for the entire app during route/data loading. Pure presentation —
 * no data fetching, no routing logic, fully compatible with React Suspense.
 *
 * Design language: Apple Intelligence "booting up" — a luminous AI orb,
 * mesh gradient backdrop, floating particles, soft noise texture, and a
 * calm indeterminate progress indicator (there's no real progress value
 * available at this layer, so it's an honest, elegant simulated sweep
 * rather than a fake percentage).
 * ==========================================================================*/

const PARTICLE_COUNT = 16;
const LOADING_MESSAGES = [
  "Waking up CartIQ…",
  "Preparing your experience…",
  "Loading intelligence…",
];

/** Deterministic pseudo-random helper — stable across renders, no jitter. */
function seeded(i: number, salt = 0) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export default function Loading() {
  const prefersReducedMotion = useReducedMotion();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
        id: i,
        x: seeded(i, 3) * 100,
        y: seeded(i, 7) * 100,
        size: 2 + seeded(i, 11) * 3,
        duration: 5 + seeded(i, 13) * 6,
        delay: seeded(i, 17) * 4,
      })),
    []
  );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="CartIQ is loading"
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-white"
    >
      {/* ==================================================================
          BACKGROUND — mesh gradient, blurred blobs, noise texture
         ================================================================== */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Mesh gradient wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 12% 8%, rgba(79,70,229,0.10), transparent 60%), radial-gradient(45% 40% at 90% 15%, rgba(20,184,166,0.10), transparent 60%), radial-gradient(45% 45% at 50% 100%, rgba(217,70,239,0.08), transparent 60%), radial-gradient(35% 35% at 5% 90%, rgba(59,130,246,0.07), transparent 60%)",
          }}
        />

        {/* Blurred drifting blobs */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute left-[10%] top-[12%] h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl"
              animate={{
                x: [0, 30, -10, 0],
                y: [0, -20, 15, 0],
                scale: [1, 1.08, 0.96, 1],
              }}
              transition={{ duration: 16, repeat: Infinity, ease: easeInOut }}
              style={{ willChange: "transform" }}
            />
            <motion.div
              className="absolute right-[8%] top-[30%] h-96 w-96 rounded-full bg-teal-300/20 blur-3xl"
              animate={{
                x: [0, -24, 16, 0],
                y: [0, 18, -12, 0],
                scale: [1, 0.95, 1.06, 1],
              }}
              transition={{ duration: 19, repeat: Infinity, ease: easeInOut, delay: 1 }}
              style={{ willChange: "transform" }}
            />
            <motion.div
              className="absolute bottom-[8%] left-[30%] h-80 w-80 rounded-full bg-fuchsia-300/15 blur-3xl"
              animate={{
                x: [0, 20, -18, 0],
                y: [0, -14, 10, 0],
                scale: [1, 1.05, 0.97, 1],
              }}
              transition={{ duration: 22, repeat: Infinity, ease: easeInOut, delay: 2 }}
              style={{ willChange: "transform" }}
            />
          </>
        )}

        {/* Floating particles */}
        {!prefersReducedMotion &&
          particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full bg-gradient-to-tr from-indigo-400 via-fuchsia-400 to-teal-400 opacity-30"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                willChange: "transform, opacity",
              }}
              animate={{ y: [0, -16, 0], opacity: [0.15, 0.5, 0.15] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: easeInOut,
              }}
            />
          ))}

        {/* Noise texture */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-multiply">
          <filter id="cartiq-loading-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#cartiq-loading-noise)" />
        </svg>
      </div>

      {/* ==================================================================
          CENTER — AI orb, logo, loading text, progress
         ================================================================== */}
      <div className="relative flex flex-col items-center gap-7 px-6 text-center">
        {/* AI ORB */}
        <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
          {/* Outer glow halo — slow breathing */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-teal-400 blur-2xl"
            animate={
              prefersReducedMotion
                ? { opacity: 0.4 }
                : { opacity: [0.35, 0.6, 0.35], scale: [0.92, 1.05, 0.92] }
            }
            transition={{ duration: 3, repeat: Infinity, ease: easeInOut }}
            style={{ willChange: "opacity, transform" }}
          />

          {/* Rotating conic gradient ring — AI thinking signature */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-2 rounded-full opacity-70"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(99,102,241,0.65), rgba(217,70,239,0.65), rgba(20,184,166,0.65), rgba(99,102,241,0.65))",
                filter: "blur(8px)",
                willChange: "transform",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Glass core */}
          <motion.div
            className="absolute inset-4 rounded-full border border-white/50 bg-white/30 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl"
            animate={
              prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.04, 1] }
            }
            transition={{ duration: 3, repeat: Infinity, ease: easeInOut }}
            style={{ willChange: "transform" }}
          />

          {/* Inner gradient sphere */}
          <motion.div
            className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-teal-400 shadow-inner"
            animate={
              prefersReducedMotion
                ? { scale: 1, opacity: 0.9 }
                : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }
            }
            transition={{ duration: 2.6, repeat: Infinity, ease: easeInOut }}
            style={{ willChange: "transform, opacity" }}
          />

          {/* Specular highlight */}
          <div className="pointer-events-none absolute inset-8 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-60 mix-blend-overlay" />

          {/* CartIQ mark */}
          <span className="relative select-none text-lg font-semibold tracking-tight text-white drop-shadow-sm">
            IQ
          </span>
        </div>

        {/* LOGO / WORDMARK */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeInOut, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <span className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">
            CartIQ
          </span>
          <span className="rounded-full border border-black/10 bg-white/70 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-indigo-700 backdrop-blur-md">
            AI
          </span>
        </motion.div>

        {/* LOADING TEXT — rotating messages */}
        <div className="h-5">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: easeInOut }}
            className="select-none text-sm font-medium text-zinc-500"
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </div>

        {/* PROGRESS INDICATOR — indeterminate shimmer sweep, honest about
            not having a real progress value at this layer */}
        <div className="h-1.5 w-56 overflow-hidden rounded-full bg-zinc-100 sm:w-64">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-teal-400"
            animate={
              prefersReducedMotion
                ? { opacity: 0.7 }
                : { x: ["-120%", "220%"] }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.2 }
                : { duration: 1.4, repeat: Infinity, ease: easeInOut }
            }
            style={{ willChange: "transform" }}
          />
        </div>

        {/* AI thinking dots */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500"
              animate={
                prefersReducedMotion
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
      </div>
    </div>
  );
}