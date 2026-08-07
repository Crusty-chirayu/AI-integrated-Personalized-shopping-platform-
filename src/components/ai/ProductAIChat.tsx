"use client";

import {
  X,
  Bot,
  Send,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { Product } from "@/lib/storefront-data";

type Props = {
  open: boolean;
  onClose: () => void;
  product: Product;
};
type AIResponse = {
  title: string;
  summary: string;
  highlights: string[];
  recommendation: string;
};

function getSuggestedQuestions(product: Product) {
  const category = product.category.toLowerCase();

  if (category.includes("electronics")) {
    return [
      "Is this worth buying?",
      "Compare with similar products",
      "Performance?",
      "Warranty?",
      "Battery backup?",
      "Is this future-proof?",
    ];
  }

  if (category.includes("fashion")) {
    return [
      "Which size should I buy?",
      "Is the material comfortable?",
      "How should I wash it?",
      "Is it suitable for daily wear?",
      "What outfits go with this?",
      "Is it worth the price?",
    ];
  }

  if (category.includes("furniture")) {
    return [
      "Is it durable?",
      "What material is used?",
      "How much weight can it hold?",
      "Is assembly required?",
      "How do I clean it?",
      "Is it worth buying?",
    ];
  }

  return [
    "Tell me about this product",
    "Who is this product for?",
    "What are the advantages?",
    "Is it worth buying?",
    "Compare with similar products",
    "What should I know before buying?",
  ];
}

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  const dotTransition = (delay: number) => ({
    duration: 0.6,
    repeat: Infinity,
    repeatType: "loop" as const,
    ease: [0.42, 0, 0.58, 1] as const,
    delay,
  });

  return (
    <div
      className="flex max-w-[92%] items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3"
      role="status"
      aria-live="polite"
      aria-label="CartIQ AI is thinking"
    >
      <span className="text-sm text-zinc-500">CartIQ AI is thinking</span>
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-zinc-500"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={dotTransition(i * 0.15)}
          />
        ))}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

// Layout constants — presentational only. Change these to tweak the
// panel's footprint without touching any logic below.
const PANEL_MAX_HEIGHT = 560; // px — panel never grows taller than this
const PANEL_WIDTH = 400; // px — compact, contextual width (not a full ChatGPT window)

export default function ProductAIChat({ open, onClose, product }: Props) {
  const [input, setInput] = useState("");
  const [showQuestions, setShowQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<
    {
      role: "assistant" | "user";
      content: string | AIResponse;
    }[]
  >([
    {
      role: "assistant",
      content: `👋 Hi! I'm CartIQ AI.

Ask me anything about ${product.title}.`,
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  // ESC key closes the drawer. Only registered while the drawer is open,
  // and always cleaned up on unmount / close.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // NOTE: all hooks above run unconditionally on every render.
  // We no longer early-return `null` from the middle of the function body —
  // instead we gate the JSX itself via AnimatePresence below. This avoids
  // the "Expected static flag was missing" Turbopack/Fast-Refresh issue
  // that shows up when a component's rendered output flips between `null`
  // and a large tree via an early `return` statement, and it lets the
  // drawer play its closing animation instead of vanishing instantly.

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const question = input;
    setInput("");
    await askQuestion(question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const askQuestion = useCallback(
    async (question: string) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: question,
        },
      ]);

      setLoading(true);

      try {
        const res = await fetch("/api/ai/product-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: question,
            product,
            history: messages,
          }),
        });

        const data: AIResponse = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, CartIQ AI couldn't answer right now.",
          },
        ]);
      }

      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, messages]
  );

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handlePanelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const suggestedQuestions = useMemo(
    () => getSuggestedQuestions(product),
    [product]
  );

  const toggleQuestions = useCallback(() => {
    setShowQuestions((prev) => !prev);
  }, []);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Suggestions are only meaningful before the conversation has started —
  // once the shopper has sent a message, hide the toggle entirely so the
  // compact panel stays focused on the conversation rather than growing.
  const isFreshConversation = messages.length === 1;

  useEffect(() => {
    if (!isFreshConversation && showQuestions) {
      setShowQuestions(false);
    }
  }, [isFreshConversation, showQuestions]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Invisible click-catcher — closes the panel on outside click
              without dimming the page. This keeps the assistant feeling
              like a contextual widget rather than a full-screen modal. */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`CartIQ AI Product Assistant for ${product.title}`}
            className="fixed bottom-6 right-6 z-50 flex w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-2xl"
            style={{
              maxHeight: PANEL_MAX_HEIGHT,
              height: PANEL_MAX_HEIGHT,
              width: PANEL_WIDTH,
              maxWidth: "calc(100vw - 3rem)",
            }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={handlePanelClick}
          >
            {/* Header (fixed, non-scrolling) */}
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  aria-label="Go back to product page"
                  className="rounded-lg p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
                  <Bot className="h-4.5 w-4.5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold leading-tight">
                    CartIQ AI
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Product Assistant
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close AI assistant"
                className="rounded-lg p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Chat Area (the ONLY scrollable region — panel itself never grows) */}
            <div className="flex-1 overflow-y-auto scroll-smooth px-4 py-4">
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => {
                    const isAssistant = message.role === "assistant";

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className={`max-w-[92%] rounded-2xl p-3.5 text-sm ${
                          isAssistant
                            ? "bg-zinc-100"
                            : "ml-auto bg-zinc-900 text-white"
                        }`}
                      >
                        {typeof message.content === "string" ? (
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-[15px] font-semibold">
                                🧠 {message.content.title}
                              </h3>

                              <p className="mt-1.5 text-sm text-zinc-700">
                                {message.content.summary}
                              </p>
                            </div>

                            {message.content.highlights.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                  Highlights
                                </h4>

                                <ul className="mt-1.5 space-y-1.5 text-sm">
                                  {message.content.highlights.map(
                                    (item, i) => (
                                      <li key={i}>✅ {item}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {message.content.recommendation && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25, delay: 0.08 }}
                                className="rounded-xl bg-white p-3.5"
                              >
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                  💡 Recommendation
                                </h4>

                                <p className="mt-1.5 text-sm">
                                  {message.content.recommendation}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {loading && <TypingIndicator />}

                <div ref={bottomRef} />
              </div>
            </div>

            {/* Suggested Questions — only shown before the first user message,
                so the compact panel stays focused once a conversation starts. */}
            <AnimatePresence initial={false}>
              {isFreshConversation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="shrink-0 overflow-hidden border-t border-zinc-200"
                >
                  <div className="p-3.5">
                    <button
                      onClick={toggleQuestions}
                      aria-expanded={showQuestions}
                      className="flex w-full items-center justify-between text-xs font-medium text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                      <span>Suggested questions</span>
                      {showQuestions ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {showQuestions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2.5 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto pr-0.5">
                            {suggestedQuestions.map((question) => (
                              <motion.button
                                key={question}
                                onClick={() => askQuestion(question)}
                                disabled={loading}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-sm transition-shadow duration-150 hover:bg-zinc-50 hover:shadow-md disabled:opacity-50"
                              >
                                {question}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar (fixed, non-scrolling) */}
            <div className="shrink-0 border-t border-zinc-200 bg-white p-3.5">
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1.5 shadow-sm transition-shadow duration-150 focus-within:border-zinc-400 focus-within:shadow-md focus-within:ring-2 focus-within:ring-zinc-200">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Ask anything about this product..."
                  disabled={loading}
                  aria-label="Ask CartIQ AI about this product"
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm outline-none disabled:opacity-50"
                />

                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}