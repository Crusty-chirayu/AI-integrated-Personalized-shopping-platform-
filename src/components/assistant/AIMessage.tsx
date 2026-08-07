"use client";

import { useEffect, useMemo, useState, useCallback, useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Gauge,
  BadgeCheck,
  BrainCircuit,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

type BadgeType =
  | "recommendation"
  | "confidence"
  | "reasoning-complete"
  | "verified-product";

type AIBadge = {
  type: BadgeType;
  label?: string;
  value?: string | number;
};

type Props = {
  message: string;
  streaming?: boolean;
  /** Optional, purely presentational — all default to safe no-ops/omitted */
  avatarUrl?: string;
  timestamp?: string | Date;
  badges?: AIBadge[];
  onCopy?: (message: string) => void;
  onShare?: (message: string) => void;
  onRegenerate?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  /** Slot for anything already rendered alongside this message elsewhere
   *  (e.g. ProductCard / ComparisonCard) — passed through untouched. */
  children?: React.ReactNode;
  className?: string;
};

// ============================================================================
// Badge config
// ============================================================================

const BADGE_CONFIG: Record<
  BadgeType,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  recommendation: {
    label: "Recommendation",
    icon: <Sparkles className="h-3 w-3" aria-hidden="true" />,
    classes: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  },
  confidence: {
    label: "AI Confidence",
    icon: <Gauge className="h-3 w-3" aria-hidden="true" />,
    classes: "bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-200",
  },
  "reasoning-complete": {
    label: "Reasoning Complete",
    icon: <BrainCircuit className="h-3 w-3" aria-hidden="true" />,
    classes: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  },
  "verified-product": {
    label: "Verified Product",
    icon: <ShieldCheck className="h-3 w-3" aria-hidden="true" />,
    classes: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  },
};

// ============================================================================
// Code block — copy button + language badge (no new syntax-highlighting dep)
// ============================================================================

function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const language = /language-(\w+)/.exec(className ?? "")?.[1];
  const codeText = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }, [codeText]);

  return (
    <div className="group relative my-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-lg">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex items-center gap-1 text-emerald-400"
              >
                <Check className="h-3 w-3" aria-hidden="true" />
                Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" aria-hidden="true" />
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[13px] leading-relaxed text-zinc-100">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

// ============================================================================
// Loading skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="flex items-center gap-1.5 py-1" role="status" aria-label="AI is thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-zinc-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function AIMessage({
  message,
  streaming = false,
  avatarUrl,
  timestamp,
  badges,
  onCopy,
  onShare,
  onRegenerate,
  onThumbsUp,
  onThumbsDown,
  children,
  className,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const headingId = useId();

  // --- Core streaming logic — unchanged behavior --------------------------
  const [displayed, setDisplayed] = useState(streaming ? "" : message);

  useEffect(() => {
    if (!streaming) {
      setDisplayed(message);
      return;
    }
    setDisplayed("");
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayed(message.slice(0, index));
      if (index >= message.length) {
        clearInterval(interval);
      }
    }, 10);
    return () => clearInterval(interval);
  }, [message, streaming]);
  // --------------------------------------------------------------------------

  const isStillTyping = streaming && displayed.length < message.length;
  const showSkeleton = streaming && displayed.length === 0;

  // Client-only timestamp to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const formattedTime = useMemo(() => {
    if (!mounted) return "";
    const d = timestamp ? new Date(timestamp) : new Date();
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }, [timestamp, mounted]);

  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const handleCopyMessage = useCallback(async () => {
    onCopy?.(message);
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 1600);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }, [message, onCopy]);

  const handleThumbsUp = useCallback(() => {
    setFeedback((f) => (f === "up" ? null : "up"));
    onThumbsUp?.();
  }, [onThumbsUp]);

  const handleThumbsDown = useCallback(() => {
    setFeedback((f) => (f === "down" ? null : "down"));
    onThumbsDown?.();
  }, [onThumbsDown]);

  const fadeUp = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      role="article"
      aria-labelledby={headingId}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className={`relative rounded-[28px] bg-gradient-to-br from-indigo-500/40 via-fuchsia-500/30 to-amber-400/40 p-[1.5px] shadow-[0_16px_50px_-18px_rgba(79,70,229,0.35)] ${className ?? ""}`}
    >
      <div className="relative overflow-hidden rounded-[26.5px] bg-white/90 backdrop-blur-xl">
        {/* ================= HEADER ================= */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3.5 sm:px-6"
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : { boxShadow: ["0 0 0 0 rgba(99,102,241,0.35)", "0 0 0 6px rgba(99,102,241,0)"] }
              }
              transition={{ duration: 1.8, repeat: showSkeleton ? Infinity : 0, ease: "easeOut" }}
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="AI assistant" className="h-full w-full object-cover" />
              ) : (
                <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
              )}
            </motion.div>
            <div>
              <p id={headingId} className="text-sm font-semibold leading-none text-zinc-900">
                AI Assistant
              </p>
              {formattedTime && (
                <p className="mt-1 text-[11px] leading-none text-zinc-400">{formattedTime}</p>
              )}
            </div>
          </div>

          {badges && badges.length > 0 && (
            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
              className="hidden flex-wrap items-center gap-1.5 sm:flex"
            >
              {badges.map((b, i) => {
                const cfg = BADGE_CONFIG[b.type];
                if (!cfg) return null;
                return (
                  <motion.span
                    key={`${b.type}-${i}`}
                    variants={fadeUp}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${cfg.classes}`}
                  >
                    {cfg.icon}
                    {b.label ?? cfg.label}
                    {b.value != null && <span className="font-semibold">{b.value}</span>}
                  </motion.span>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Mobile badges row */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-zinc-100 px-5 py-2.5 sm:hidden">
            {badges.map((b, i) => {
              const cfg = BADGE_CONFIG[b.type];
              if (!cfg) return null;
              return (
                <span
                  key={`${b.type}-mobile-${i}`}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${cfg.classes}`}
                >
                  {cfg.icon}
                  {b.label ?? cfg.label}
                  {b.value != null && <span className="font-semibold">{b.value}</span>}
                </span>
              );
            })}
          </div>
        )}

        {/* ================= BODY / MARKDOWN ================= */}
        <motion.div variants={fadeUp} className="px-5 py-5 sm:px-6">
          {showSkeleton ? (
            <LoadingSkeleton />
          ) : (
            <div
              className="prose prose-zinc max-w-none text-[15px] leading-relaxed
                prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-zinc-900
                prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                prose-p:my-2.5 prose-p:text-zinc-700
                prose-strong:text-zinc-900 prose-strong:font-semibold
                prose-a:text-indigo-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-2 prose-blockquote:border-indigo-300 prose-blockquote:bg-indigo-50/50 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-zinc-700
                prose-ul:my-2.5 prose-ol:my-2.5 prose-li:my-1
                prose-hr:border-zinc-200
                prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[13px] prose-code:font-medium prose-code:text-indigo-700 prose-code:before:content-none prose-code:after:content-none"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className: codeClassName, children: codeChildren, ...rest }: any) {
                    const isBlock = /language-(\w+)/.test(codeClassName ?? "") || String(codeChildren).includes("\n");
                    if (!isBlock) {
                      return (
                        <code className={codeClassName} {...rest}>
                          {codeChildren}
                        </code>
                      );
                    }
                    return <CodeBlock className={codeClassName}>{codeChildren}</CodeBlock>;
                  },
                  pre({ children: preChildren }: any) {
                    // CodeBlock already renders its own <pre>; avoid double-wrapping
                    return <>{preChildren}</>;
                  },
                  table({ children: tableChildren }: any) {
                    return (
                      <div className="my-4 overflow-x-auto rounded-2xl border border-zinc-200 shadow-sm">
                        <table className="w-full border-collapse text-sm">{tableChildren}</table>
                      </div>
                    );
                  },
                  thead({ children: theadChildren }: any) {
                    return (
                      <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                        {theadChildren}
                      </thead>
                    );
                  },
                  tr({ children: trChildren }: any) {
                    return (
                      <tr className="border-t border-zinc-100 transition-colors even:bg-zinc-50/40 hover:bg-indigo-50/40">
                        {trChildren}
                      </tr>
                    );
                  },
                  th({ children: thChildren }: any) {
                    return <th className="px-4 py-2.5 font-medium">{thChildren}</th>;
                  },
                  td({ children: tdChildren }: any) {
                    return <td className="px-4 py-2.5 text-zinc-700">{tdChildren}</td>;
                  },
                  a({ children: aChildren, href }: any) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {aChildren}
                      </a>
                    );
                  },
                }}
              >
                {displayed}
              </ReactMarkdown>

              {isStillTyping && (
                <motion.span
                  aria-hidden="true"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                  className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-indigo-500 align-middle"
                />
              )}
            </div>
          )}

          {/* Slot for existing ProductCard / ComparisonCard usage, untouched */}
          {children && (
            <motion.div variants={fadeUp} className="mt-4">
              {children}
            </motion.div>
          )}
        </motion.div>

        {/* ================= TOOLBAR ================= */}
        {!showSkeleton && (
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-1 border-t border-zinc-100 px-4 py-2.5 sm:px-5"
          >
            <ToolbarButton
              label={copiedMessage ? "Copied" : "Copy"}
              icon={copiedMessage ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={handleCopyMessage}
            />
            <ToolbarButton
              label="Share"
              icon={<Share2 className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => onShare?.(message)}
            />
            <ToolbarButton
              label="Regenerate"
              icon={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => onRegenerate?.()}
            />
            <span className="mx-1 h-4 w-px bg-zinc-200" aria-hidden="true" />
            <ToolbarButton
              label="Good response"
              icon={
                <ThumbsUp
                  className={`h-3.5 w-3.5 ${feedback === "up" ? "fill-indigo-500 text-indigo-500" : ""}`}
                  aria-hidden="true"
                />
              }
              onClick={handleThumbsUp}
              pressed={feedback === "up"}
            />
            <ToolbarButton
              label="Bad response"
              icon={
                <ThumbsDown
                  className={`h-3.5 w-3.5 ${feedback === "down" ? "fill-red-500 text-red-500" : ""}`}
                  aria-hidden="true"
                />
              }
              onClick={handleThumbsDown}
              pressed={feedback === "down"}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Toolbar button
// ============================================================================

function ToolbarButton({
  label,
  icon,
  onClick,
  pressed,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.92 }}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
        pressed ? "bg-indigo-50 text-indigo-700" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
      }`}
      title={label}
    >
      {icon}
    </motion.button>
  );
}