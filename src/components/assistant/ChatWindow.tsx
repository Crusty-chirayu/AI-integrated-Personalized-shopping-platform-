"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import ComparisonCard from "./ComparisonCard";
import ConversationSidebar from "./ConversationSidebar";
import VoiceButton from "./VoiceButton";
import VoiceVisualizer from "./VoiceVisualizer";
import ProductCarousel from "./ProductCarousel";
import { extractPreference } from "@/lib/ai/memory-extractor";
import { savePreference } from "@/lib/ai/memory-service";
import AIMessage from "./AIMessage";
import {
  createConversation,
  saveMessage,
  getLatestConversation,
  getMessages,
  getConversations,
  updateConversationTitle,
  deleteConversation,
} from "@/lib/ai/conversation-service";
import Message from "./Message";
import { getCurrentUser } from "@/lib/auth";
import TypingIndicator from "./TypingIndicator";

type AssistantProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  sale_price?: number;
  salePrice?: number;
  description?: string;
  product_images?: Array<{ image_url: string }>;
  badge?: string;
  tags?: string[];
  reason?: string;
  confidence?: number;
  rating?: number;
};

type ChatMessage = {
  id: string;
  streaming?: boolean;
  role: "user" | "assistant";
  type: "text" | "chat" | "products" | "comparison" | "order";
  content: string;
  products?: AssistantProduct[];
  comparison?: AssistantProduct[];
};

type Conversation = {
  id: string;
  title: string;
};

interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  onsoundstart: (() => void) | null;
  onsoundend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionResult {
  transcript: string;
}

interface SpeechRecognitionEvent {
  results: ArrayLike<ArrayLike<SpeechRecognitionResult>>;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type WindowWithSpeechRecognition = Window & {
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  SpeechRecognition?: SpeechRecognitionConstructor;
};

const SUGGESTIONS = [
  "Recommend a gaming laptop",
  "Compare phones under ₹30,000",
  "Best headphones under ₹5,000",
  "What's trending right now?",
];

const GREETING =
  "👋 Hello! I'm CartIQ AI.\n\nHow can I help you shop today?";

const MAX_CHARS = 2000;

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      type: "text",
      content: GREETING,
      streaming: false,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const sessionId = useRef(crypto.randomUUID());
  const conversationId = useRef<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!showJumpToLatest) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, showJumpToLatest]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
    };
  }, []);

  // Auto-expand textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  useEffect(() => {
    async function loadConversation() {
      let user;

      try {
        user = await getCurrentUser();
      } catch (err) {
        console.error("getCurrentUser failed:", err);
        alert(String(err));
        return;
      }

      if (!user) return;

      const allConversations = await getConversations(user.id);
      setConversations(allConversations as Conversation[]);

      const conversation = await getLatestConversation(user.id);
      if (!conversation) return;

      conversationId.current = conversation.id;
      setSelectedConversation(conversation.id);

      const history = await getMessages(conversation.id);

      setMessages(
        history.map(
          (msg: {
            id: string;
            role: "user" | "assistant";
            type?: string;
            content: string;
            metadata?: {
              products?: unknown[];
              comparison?: unknown[];
            };
          }) => {
            const messageType = msg.type as ChatMessage["type"] | undefined;
            const type =
              messageType === "products" ||
              messageType === "comparison" ||
              messageType === "order"
                ? messageType
                : "text";

            const products = Array.isArray(msg.metadata?.products)
              ? (msg.metadata.products as AssistantProduct[])
              : undefined;
            const comparison = Array.isArray(msg.metadata?.comparison)
              ? (msg.metadata.comparison as AssistantProduct[])
              : undefined;

            return {
              id: msg.id,
              role: msg.role,
              type,
              content: msg.content,
              products,
              comparison,
              streaming: false,
            };
          }
        )
      );
    }

    loadConversation();
  }, []);

  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowJumpToLatest(distanceFromBottom > 200);
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowJumpToLatest(false);
  }

  async function copyMessage(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1800);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  async function startListening() {
    if (listening) {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
      setListening(false);
      return;
    }

    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognition =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition isn't supported in this browser.");
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (error) {
      console.error("Microphone permission denied:", error);
      alert("Please allow microphone access to use voice input.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onspeechstart = () => {
      console.log("Speech detected");
    };

    recognition.onspeechend = () => {
      console.log("Speech ended");
    };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript?.trim() ?? "";

      if (!transcript) {
        setListening(false);
        return;
      }

      setInput(transcript);
      setListening(false);
      recognitionRef.current = null;
      await sendVoiceMessage(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Recognition Error:", event.error);
      alert(event.error || "Voice recognition failed.");
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onaudiostart = () => {
      console.log("Audio started");
    };

    recognition.onaudioend = () => {
      console.log("Audio ended");
    };

    recognition.onsoundstart = () => {
      console.log("Sound started");
    };

    recognition.onsoundend = () => {
      console.log("Sound ended");
    };

    recognition.start();
  }

  async function sendVoiceMessage(transcript: string) {
    if (!transcript.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        type: "text",
        content: transcript,
      },
    ]);

    await saveMessage(conversationId.current!, "user", transcript);

    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionId.current,
          message: transcript,
        }),
      });

      const data = await res.json();
      console.log("========== AI RESPONSE ==========");
      console.log(data);
      console.log("TYPE:", data.type);
      console.log("PRODUCTS:", data.products);
      console.log("=================================");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          type: data.type ?? "text",
          content: data.message,
          products: data.products,
          comparison: data.comparison,
          streaming: true,
        },
      ]);

      await saveMessage(
        conversationId.current!,
        "assistant",
        data.message,
        data.type ?? "text",
        {
          products: data.products ?? [],
          comparison: data.comparison ?? [],
        }
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    console.log("SEND BUTTON CLICKED");

    const user = await getCurrentUser();

    if (!user) {
      alert("Please log in to use CartIQ AI.");
      return;
    }

    if (!conversationId.current) {
      const conversation = await createConversation(user.id);
      conversationId.current = conversation.id;
      setSelectedConversation(conversation.id);

      const updated = await getConversations(user.id);
      setConversations(updated);
    }

    if (!input.trim()) return;

    const userMessage = input;
    const memory = extractPreference(userMessage);

    if (memory.favorite_brand || memory.preferred_budget) {
      await savePreference(user.id, memory);
    }

    await saveMessage(conversationId.current!, "user", userMessage);

    if (conversationId.current) {
      const title =
        userMessage.length > 40
          ? userMessage.substring(0, 40) + "..."
          : userMessage;

      await updateConversationTitle(conversationId.current, title);

      const updated = await getConversations(user.id);
      setConversations(updated);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        type: "text",
        content: userMessage,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionId.current,
          message: userMessage,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          type: data.type ?? "text",
          content: data.message,
          products: data.products,
          comparison: data.comparison,
          streaming: true,
        },
      ]);

      await saveMessage(
        conversationId.current!,
        "assistant",
        data.message,
        data.type ?? "text",
        {
          products: data.products ?? [],
          comparison: data.comparison ?? [],
        }
      );
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: "Sorry, CartIQ AI is unavailable right now.",
        },
      ]);
    }

    setLoading(false);
  }

  // Presentational-only helper: re-asks the AI using the last user message.
  // Does not alter the API contract, prompts, or orchestration in any way.
  async function regenerateResponse(assistantMessageId: string) {
    const idx = messages.findIndex((m) => m.id === assistantMessageId);
    if (idx === -1) return;

    let lastUserMessage: string | null = null;
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessage = messages[i].content;
        break;
      }
    }
    if (!lastUserMessage) return;

    setRegeneratingId(assistantMessageId);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          message: lastUserMessage,
        }),
      });

      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                type: data.type ?? "text",
                content: data.message,
                products: data.products,
                comparison: data.comparison,
                streaming: true,
              }
            : m
        )
      );

      if (conversationId.current) {
        await saveMessage(
          conversationId.current,
          "assistant",
          data.message,
          data.type ?? "text",
          {
            products: data.products ?? [],
            comparison: data.comparison ?? [],
          }
        );
      }
    } catch (err) {
      console.error("Regenerate failed:", err);
    } finally {
      setLoading(false);
      setRegeneratingId(null);
    }
  }

  function handleSuggestionClick(text: string) {
    setInput(text);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  const isFreshConversation =
    messages.length === 1 && messages[0].role === "assistant";

  return (
    <div className="flex h-screen bg-[#FAFAF9]">
      <ConversationSidebar
        conversations={conversations}
        selectedId={selectedConversation}
        onSelect={async (id) => {
          setSelectedConversation(id);
          conversationId.current = id;

          const history = await getMessages(id);

          setMessages(
            history.map(
              (msg: {
                id: string;
                role: "user" | "assistant";
                type?: string;
                content: string;
                metadata?: {
                  products?: unknown[];
                  comparison?: unknown[];
                };
              }) => {
                const messageType = msg.type as ChatMessage["type"] | undefined;
                const type =
                  messageType === "products" ||
                  messageType === "comparison" ||
                  messageType === "order"
                    ? messageType
                    : "text";

                const products = Array.isArray(msg.metadata?.products)
                  ? (msg.metadata.products as AssistantProduct[])
                  : undefined;
                const comparison = Array.isArray(msg.metadata?.comparison)
                  ? (msg.metadata.comparison as AssistantProduct[])
                  : undefined;

                return {
                  id: msg.id,
                  role: msg.role,
                  type,
                  content: msg.content,
                  products,
                  comparison,
                  streaming: false,
                };
              }
            )
          );
        }}
        onNewChat={() => {
          conversationId.current = null;
          setSelectedConversation(null);
          setMessages([
            {
              id: crypto.randomUUID(),
              role: "assistant",
              type: "text",
              content: GREETING,
              streaming: false,
            },
          ]);
        }}
        onDelete={async (id) => {
          if (!confirm("Delete this conversation?")) {
            return;
          }

          await deleteConversation(id);

          const user = await getCurrentUser();
          if (!user) return;

          const updated = await getConversations(user.id);
          setConversations(updated);

          if (selectedConversation === id) {
            conversationId.current = null;
            setSelectedConversation(null);
            setMessages([
              {
                id: crypto.randomUUID(),
                role: "assistant",
                type: "text",
                content: GREETING,
                streaming: false,
              },
            ]);
          }
        }}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-black/5 bg-white/80 px-8 py-4 backdrop-blur-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">CartIQ AI</p>
            <p className="text-xs text-zinc-400">
              {loading ? "Thinking…" : "Your personal shopping assistant"}
            </p>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-8 sm:px-8"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <AnimatePresence initial={false}>
              {messages.map((message, i) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(i * 0.02, 0.15),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group"
                >
                  <Message role={message.role}>
                    {message.role === "assistant" ? (
                      <AIMessage
                        message={message.content}
                        streaming={message.streaming ?? false}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}

                    {message.products && message.products.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                      >
                        <ProductCarousel products={message.products} />
                      </motion.div>
                    )}

                    {message.type === "comparison" &&
                      message.comparison &&
                      message.comparison.length >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.3 }}
                        >
                          <ComparisonCard
                            left={message.comparison[0]}
                            right={message.comparison[1]}
                          />
                        </motion.div>
                      )}
                  </Message>

                  {/* Message actions (assistant only) */}
                  {message.role === "assistant" && (
                    <div className="mt-1.5 flex items-center gap-1 pl-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => copyMessage(message.id, message.content)}
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700"
                        aria-label="Copy response"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => regenerateResponse(message.id)}
                        disabled={regeneratingId === message.id || loading}
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700 disabled:opacity-50"
                        aria-label="Regenerate response"
                      >
                        <RotateCcw
                          className={`h-3.5 w-3.5 ${
                            regeneratingId === message.id ? "animate-spin" : ""
                          }`}
                        />
                        Regenerate
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && !regeneratingId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <TypingIndicator />
              </motion.div>
            )}

            {/* Suggestion chips — only on a fresh conversation */}
            {isFreshConversation && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="flex flex-wrap gap-2 pl-1 pt-2"
              >
                {SUGGESTIONS.map((s, idx) => (
                  <motion.button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + idx * 0.05, duration: 0.25 }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    {s}
                  </motion.button>
                ))}
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Jump to latest */}
        <AnimatePresence>
          {showJumpToLatest && (
            <motion.button
              type="button"
              onClick={scrollToBottom}
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 10, x: "-50%" }}
              className="absolute bottom-28 left-1/2 flex items-center gap-1.5 rounded-full border border-black/10 bg-white/95 px-4 py-2 text-xs font-medium text-zinc-600 shadow-md backdrop-blur-md"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Jump to latest
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="border-t border-black/5 bg-white/80 px-4 py-5 backdrop-blur-md sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div
              className={`flex items-end gap-3 rounded-3xl border bg-white px-4 py-3 transition-colors ${
                inputFocused
                  ? "border-zinc-400"
                  : "border-black/10"
              }`}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask CartIQ AI anything… try “compare two phones”"
                className="max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-400"
              />

              <div className="flex items-center gap-2 pb-0.5">
                <div className="flex flex-col items-center">
                  <VoiceButton listening={listening} onClick={startListening} />
                  <VoiceVisualizer listening={listening} />
                </div>

                <motion.button
                  type="button"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: loading || !input.trim() ? 1 : 1.05 }}
                  whileTap={{ scale: loading || !input.trim() ? 1 : 0.95 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors duration-200 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowUp className="h-5 w-5" />
                  )}
                </motion.button>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between px-2">
              <p className="text-[11px] text-zinc-400">
                <kbd className="rounded border border-black/10 bg-zinc-50 px-1 py-0.5 font-sans">
                  Enter
                </kbd>{" "}
                to send ·{" "}
                <kbd className="rounded border border-black/10 bg-zinc-50 px-1 py-0.5 font-sans">
                  Shift + Enter
                </kbd>{" "}
                for a new line
              </p>
              <p
                className={`text-[11px] tabular-nums ${
                  input.length > MAX_CHARS - 100
                    ? "text-amber-600"
                    : "text-zinc-300"
                }`}
              >
                {input.length}/{MAX_CHARS}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}