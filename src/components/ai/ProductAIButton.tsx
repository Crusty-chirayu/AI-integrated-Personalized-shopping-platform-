"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  onClick: () => void;
};

export default function ProductAIButton({ onClick }: Props) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - bounds.left, y: e.clientY - bounds.top },
    ]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      aria-label="Ask CartIQ AI about this product"
      className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-5 py-3 text-white shadow-[0_18px_45px_-16px_rgba(99,102,241,0.6)] ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-[0_20px_55px_-14px_rgba(99,102,241,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
    >
      {/* Rotating gradient halo */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-full opacity-70"
        style={{
          background:
            "conic-gradient(from 0deg, #8b5cf6, #22d3ee, #f43f5e, #f59e0b, #8b5cf6)",
          filter: "blur(8px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <span className="pointer-events-none absolute inset-[1.5px] rounded-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Ambient pulse */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/25 to-cyan-400/25"
        animate={{ opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Click ripple */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ opacity: 0.4, scale: 0 }}
          animate={{ opacity: 0, scale: 3.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ left: r.x, top: r.y }}
          className="pointer-events-none absolute z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
        />
      ))}

      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Bot className="h-4 w-4" />
        <motion.span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 text-white"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-2 w-2" />
        </motion.span>
      </span>

      <span className="relative z-10 font-medium tracking-tight">Ask CartIQ AI</span>
    </motion.button>
  );
}