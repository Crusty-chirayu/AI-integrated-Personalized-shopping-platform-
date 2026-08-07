"use client";

import { Suspense } from "react";
import { motion, useReducedMotion, easeInOut } from "framer-motion";
import ChatWindow from "@/components/assistant/ChatWindow";
import AssistantLoading from "./loading";

/* ============================================================================
 * AssistantPage
 * ----------------------------------------------------------------------------
 * IMPORTANT: This route intentionally stays a thin shell. `ChatWindow` owns
 * all real functionality — voice mode, image upload, product recommendations,
 * comparisons, chat history, markdown rendering, AI orchestration, prompts,
 * OpenRouter/DeepSeek calls — none of that lives here and none of it is
 * touched. `ChatWindow` already renders the full app shell (sidebar + chat +
 * input), matching the structure of `loading.tsx`, so this file does not
 * duplicate layout chrome around it — that would double up the UI.
 *
 * What this file adds, purely at the page level:
 *   - A premium ambient background (glass + soft animated gradient glow)
 *     that sits *behind* ChatWindow, visible through any transparent/blur
 *     surfaces ChatWindow itself uses.
 *   - A subtle fade/scale entrance transition on first mount so the page
 *     feels alive the instant it loads, honoring reduced-motion preference.
 *   - A Suspense boundary using the existing `loading.tsx` skeleton as a
 *     fallback, so any internal async boundaries in ChatWindow get the
 *     premium loading state automatically.
 * ==========================================================================*/
export default function AssistantPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      {/* Ambient premium backdrop — purely decorative, sits behind ChatWindow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 45% at 8% 0%, rgba(79,70,229,0.07), transparent 60%), radial-gradient(40% 40% at 95% 12%, rgba(20,184,166,0.07), transparent 60%), radial-gradient(35% 35% at 50% 100%, rgba(217,70,239,0.05), transparent 60%)",
          }}
        />
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(30% 30% at 20% 30%, rgba(99,102,241,0.08), transparent 60%)",
            }}
            animate={{ x: [0, 24, 0], y: [0, 14, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: easeInOut }}
          />
        )}
      </div>

      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.995 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: easeInOut }}
        className="relative h-full w-full"
      >
        <Suspense fallback={<AssistantLoading />}>
          <ChatWindow />
        </Suspense>
      </motion.div>
    </div>
  );
}