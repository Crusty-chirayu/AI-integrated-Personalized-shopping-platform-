"use client";

import { useEffect, useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  easeInOut,
} from "framer-motion";

/* ============================================================================
 * VoiceVisualizer — Premium AI Voice UI
 * ----------------------------------------------------------------------------
 * Design language: Apple Intelligence / Siri glow, ChatGPT Voice orb,
 * Gemini Live gradient motion, Nothing OS minimalism.
 *
 * BACKWARD COMPATIBLE API
 *   <VoiceVisualizer listening={boolean} />   <-- still works exactly as before
 *
 * OPTIONAL EXTENDED API (all optional, safe defaults, nothing removed)
 *   status?: "idle" | "listening" | "thinking" | "speaking"
 *   audioLevel?: number (0..1)
 *   compact?: boolean
 *   onMicPress?: () => void
 *   className?: string
 *
 * SPACE FIX (this revision)
 * ----------------------------------------------------------------------------
 * Previously the "idle" state rendered the same large orb block as the
 * active states (just dimmer), which meant the visualizer permanently
 * occupied a huge fixed area of the chat panel and pushed the conversation
 * out of view — exactly the bug reported.
 *
 * Fixed by:
 *   1. Idle now renders a small, self-contained pill (~52px tall) instead
 *      of the full orb block — matching the original brief's "IDLE STATE:
 *      small breathing animation, minimal, elegant".
 *   2. Only "listening" / "thinking" / "speaking" expand to the full
 *      orb + waveform experience — and even then it's height-capped
 *      (max-h-[300px]) and width-capped (max-w-sm, centered) so it can
 *      never blow out its parent container again.
 *   3. The container no longer stretches with `w-full` + unconstrained
 *      flex growth — it's `shrink-0` with a bounded, animated height so
 *      layout above/below it (chat history, input box) stays visible.
 *   4. The idle <-> active transition is height-animated with Framer
 *      Motion `layout`, so it grows/shrinks smoothly instead of jumping.
 * ==========================================================================*/

type VoiceStatus = "idle" | "listening" | "thinking" | "speaking";

type Props = {
  /** Original prop — preserved exactly. Controls whether the visualizer is active. */
  listening: boolean;
  /** Optional explicit status for richer states. Falls back to `listening`. */
  status?: VoiceStatus;
  /** Optional 0..1 audio amplitude for real audio-reactive bars/orb. */
  audioLevel?: number;
  /** Optional compact inline mode (slim waveform only, no orb/mic/status). */
  compact?: boolean;
  /** Optional mic button press handler (additive, does not touch recognition logic). */
  onMicPress?: () => void;
  /** Optional className passthrough for layout control by parent. */
  className?: string;
};

const BAR_COUNT = 7;
const PARTICLE_COUNT = 10;

const STATUS_COPY: Record<VoiceStatus, string> = {
  idle: "Idle",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};

const STATUS_GRADIENT: Record<VoiceStatus, string> = {
  idle: "from-zinc-400/40 via-zinc-300/30 to-zinc-400/40",
  listening: "from-blue-500 via-cyan-400 to-indigo-500",
  thinking: "from-fuchsia-500 via-violet-500 to-blue-500",
  speaking: "from-sky-400 via-blue-500 to-purple-500",
};

/** Small deterministic pseudo-random helper so bars/particles look organic
 *  but remain stable across renders (no Math.random jitter per render). */
function seeded(i: number, salt = 0) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export default function VoiceVisualizer({
  listening,
  status,
  audioLevel,
  compact = false,
  onMicPress,
  className = "",
}: Props) {
  const prefersReducedMotion = useReducedMotion();

  // Derive effective status without breaking the original boolean-only API.
  const effectiveStatus: VoiceStatus =
    status ?? (listening ? "listening" : "idle");

  const isActive = effectiveStatus !== "idle";

  // Simulated amplitude so the visualizer feels alive even with no real
  // audioLevel wired up. Real audioLevel (if provided) always wins.
  const [simLevel, setSimLevel] = useState(0.4);
  useEffect(() => {
    if (audioLevel !== undefined) return;
    if (effectiveStatus === "idle") {
      setSimLevel(0.15);
      return;
    }
    let raf: number;
    let t = 0;
    const tick = () => {
      t += 0.06;
      const base =
        effectiveStatus === "speaking"
          ? 0.55
          : effectiveStatus === "listening"
          ? 0.45
          : 0.3;
      setSimLevel(
        Math.max(
          0.12,
          Math.min(1, base + Math.sin(t) * 0.25 + Math.sin(t * 2.3) * 0.12)
        )
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // NOTE: dependency array is intentionally always exactly these two
    // values — do not add a third derived value (e.g. an `isActive`
    // boolean) here. Introducing/removing entries changes the array's
    // *length* across a Fast Refresh boundary, which React detects as
    // "The final argument passed to useEffect changed size between
    // renders" during dev-time hot reloads.
  }, [audioLevel, effectiveStatus]);

  const level = audioLevel !== undefined ? audioLevel : simLevel;

  // ---------------------------------------------------------------------
  // COMPACT MODE — unchanged behavior: nothing renders when !listening,
  // matching the original component's guard exactly.
  // ---------------------------------------------------------------------
  if (compact) {
    return (
      <CompactWaveform
        listening={listening}
        level={level}
        status={effectiveStatus}
        prefersReducedMotion={!!prefersReducedMotion}
        className={className}
      />
    );
  }

  return (
    <motion.div
      layout
      role="status"
      aria-live="polite"
      aria-label={STATUS_COPY[effectiveStatus]}
      transition={{ layout: { duration: 0.35, ease: easeInOut } }}
      className={`relative mx-auto flex w-full max-w-sm shrink-0 flex-col items-center justify-center overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: easeInOut }}
            className="relative flex max-h-[300px] w-full flex-col items-center justify-center gap-4 rounded-[2rem] px-4 py-5"
          >
            {/* Background: glassmorphism + soft ambient gradient + particles */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${STATUS_GRADIENT[effectiveStatus]} opacity-[0.08] blur-3xl transition-opacity duration-700`}
              />
              <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl dark:bg-zinc-950/40" />
              {!prefersReducedMotion && (
                <FloatingParticles status={effectiveStatus} />
              )}
            </div>

            {/* ORB — pulsing / thinking / speaking states */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32">
              <Orb
                status={effectiveStatus}
                level={level}
                prefersReducedMotion={!!prefersReducedMotion}
              />
            </div>

            {/* WAVEFORM BARS — audio reactive */}
            <div
              className="flex h-8 items-end justify-center gap-[4px]"
              aria-hidden="true"
            >
              {Array.from({ length: BAR_COUNT }).map((_, i) => {
                const jitter = seeded(i, 1);
                const heightBase = 8 + jitter * 8;
                const heightPeak = heightBase + level * (18 + jitter * 10);
                return (
                  <motion.div
                    key={i}
                    className={`w-[3px] rounded-full bg-gradient-to-t ${STATUS_GRADIENT[effectiveStatus]}`}
                    initial={false}
                    animate={
                      prefersReducedMotion
                        ? { height: heightBase }
                        : { height: [heightBase, heightPeak, heightBase] }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.2 }
                        : {
                            duration: 0.55 + jitter * 0.5,
                            repeat: Infinity,
                            ease: easeInOut,
                            delay: i * 0.06,
                          }
                    }
                    style={{ willChange: "height" }}
                  />
                );
              })}
            </div>

            {/* STATUS TEXT */}
            <AnimatePresence mode="wait">
              <motion.p
                key={effectiveStatus}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: easeInOut }}
                className="select-none text-xs font-medium tracking-wide text-zinc-600 dark:text-zinc-300"
              >
                {STATUS_COPY[effectiveStatus]}
              </motion.p>
            </AnimatePresence>

            {/* MIC BUTTON */}
            {onMicPress && (
              <MicButton
                listening={listening}
                status={effectiveStatus}
                onPress={onMicPress}
                prefersReducedMotion={!!prefersReducedMotion}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: easeInOut }}
            className="flex w-full items-center justify-center"
          >
            <IdlePill
              onMicPress={onMicPress}
              prefersReducedMotion={!!prefersReducedMotion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================================================================
 * Idle state — small, minimal, elegant. This is the key fix: idle no longer
 * reserves the same footprint as the active orb, so it never blocks the
 * conversation view.
 * ==========================================================================*/
function IdlePill({
  onMicPress,
  prefersReducedMotion,
}: {
  onMicPress?: () => void;
  prefersReducedMotion: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-black/5 bg-white/60 px-4 py-2.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40">
      <div className="relative h-3 w-3 shrink-0">
        <motion.span
          className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-300"
          animate={
            prefersReducedMotion
              ? { opacity: 0.7 }
              : { opacity: [0.5, 0.9, 0.5], scale: [0.85, 1.1, 0.85] }
          }
          transition={{ duration: 2.6, repeat: Infinity, ease: easeInOut }}
        />
      </div>
      <span className="select-none text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
        Idle
      </span>
      {onMicPress && (
        <button
          type="button"
          onClick={onMicPress}
          aria-label="Start listening"
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white outline-none transition hover:scale-105 hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-zinc-900"
        >
          <MicIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ============================================================================
 * Orb
 * ==========================================================================*/
function Orb({
  status,
  level,
  prefersReducedMotion,
}: {
  status: VoiceStatus;
  level: number;
  prefersReducedMotion: boolean;
}) {
  const scaleTarget = 1 + level * 0.12;

  return (
    <>
      {/* Outer glow halo */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${STATUS_GRADIENT[status]} blur-2xl`}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: 0.35 }
            : status === "thinking"
            ? { opacity: [0.3, 0.55, 0.3], scale: [0.96, 1.08, 0.96] }
            : { opacity: [0.35, 0.6, 0.35], scale: [1, scaleTarget + 0.08, 1] }
        }
        transition={{
          duration: status === "thinking" ? 2.2 : 1.1,
          repeat: Infinity,
          ease: easeInOut,
        }}
        style={{ willChange: "opacity, transform" }}
      />

      {/* Rotating conic gradient ring (thinking state signature) */}
      {status === "thinking" && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-1 rounded-full opacity-70"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(217,70,239,0.6), rgba(99,102,241,0.6), rgba(59,130,246,0.6), rgba(217,70,239,0.6))",
            filter: "blur(6px)",
            willChange: "transform",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Glass core */}
      <motion.div
        className="absolute inset-3 rounded-full border border-white/50 bg-white/30 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
        initial={false}
        animate={
          prefersReducedMotion
            ? { scale: 1 }
            : status === "speaking" || status === "listening"
            ? { scale: [1, scaleTarget, 1] }
            : { scale: [1, 1.02, 1] }
        }
        transition={{
          duration: status === "thinking" ? 2 : 0.9,
          repeat: Infinity,
          ease: easeInOut,
        }}
        style={{ willChange: "transform" }}
      />

      {/* Inner gradient sphere */}
      <motion.div
        className={`absolute inset-6 rounded-full bg-gradient-to-br ${STATUS_GRADIENT[status]} shadow-inner`}
        initial={false}
        animate={
          prefersReducedMotion
            ? { scale: 1, opacity: 0.9 }
            : { scale: [1, scaleTarget + 0.05, 1], opacity: [0.85, 1, 0.85] }
        }
        transition={{
          duration: status === "thinking" ? 1.8 : 0.7,
          repeat: Infinity,
          ease: easeInOut,
        }}
        style={{ willChange: "transform, opacity" }}
      />

      {/* Specular highlight for glass/luxury feel */}
      <div className="pointer-events-none absolute inset-6 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-60 mix-blend-overlay" />
    </>
  );
}

/* ============================================================================
 * Floating ambient particles
 * ==========================================================================*/
function FloatingParticles({ status }: { status: VoiceStatus }) {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
        id: i,
        x: seeded(i, 3) * 100,
        y: seeded(i, 7) * 100,
        size: 2 + seeded(i, 11) * 3,
        duration: 4 + seeded(i, 13) * 5,
        delay: seeded(i, 17) * 3,
      })),
    []
  );

  return (
    <div className="absolute inset-0">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute rounded-full bg-gradient-to-tr ${STATUS_GRADIENT[status]} opacity-40`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            willChange: "transform, opacity",
          }}
          animate={{
            y: [0, -12, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: easeInOut,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================================
 * Premium Mic Button (optional, additive — does not touch recognition logic)
 * ==========================================================================*/
function MicButton({
  listening,
  status,
  onPress,
  prefersReducedMotion,
}: {
  listening: boolean;
  status: VoiceStatus;
  onPress: () => void;
  prefersReducedMotion: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : "Start listening"}
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${STATUS_GRADIENT[status]} text-white shadow-[0_10px_30px_rgba(59,130,246,0.35)] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500`}
      whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.05 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
    >
      {/* Ripple */}
      {listening && !prefersReducedMotion && (
        <motion.span
          className="absolute inset-0 rounded-full bg-white/40"
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: easeInOut }}
        />
      )}

      {/* Recording indicator */}
      {listening && (
        <motion.span
          className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_0_2px_rgba(255,255,255,0.9)]"
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: easeInOut }}
        />
      )}

      <MicIcon className="relative h-5 w-5" />
    </motion.button>
  );
}

function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 19v3" />
      <path d="M8 22h8" />
    </svg>
  );
}

/* ============================================================================
 * Compact mode — closest to the original slim waveform, restyled premium.
 * Preserves the exact original guard: renders nothing when !listening,
 * matching legacy behavior for any callers relying on that.
 * ==========================================================================*/
function CompactWaveform({
  listening,
  level,
  status,
  prefersReducedMotion,
  className,
}: {
  listening: boolean;
  level: number;
  status: VoiceStatus;
  prefersReducedMotion: boolean;
  className: string;
}) {
  if (!listening) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={STATUS_COPY[status]}
      className={`mt-2 flex h-8 items-end justify-center gap-[3px] ${className}`}
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const jitter = seeded(i, 5);
        const base = 12 + (i % 3) * 8;
        const peak = base + level * 14;
        return (
          <motion.div
            key={i}
            className={`w-[3px] rounded-full bg-gradient-to-t ${STATUS_GRADIENT[status]}`}
            initial={false}
            animate={
              prefersReducedMotion ? { height: base } : { height: [base, peak, base] }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.2 }
                : {
                    duration: 0.5 + jitter * 0.4,
                    repeat: Infinity,
                    ease: easeInOut,
                    delay: i * 0.12,
                  }
            }
            style={{ willChange: "height" }}
          />
        );
      })}
    </div>
  );
}