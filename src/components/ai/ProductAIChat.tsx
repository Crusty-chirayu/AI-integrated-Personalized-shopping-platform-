"use client";

import {
  X,
  Bot,
  Send,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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

export default function ProductAIChat({
  open,
  onClose,
  product,
}: Props) {

  const [input, setInput] = useState("");
  const [showQuestions, setShowQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    });
  }, [messages, loading]);

  // NOTE: all hooks above run unconditionally on every render.
  // We no longer early-return `null` from the middle of the function body —
  // instead we gate the JSX itself below. This avoids the
  // "Expected static flag was missing" Turbopack/Fast-Refresh issue that
  // shows up when a component's rendered output flips between `null`
  // and a large tree via an early `return` statement.

  async function sendMessage() {
    if (!input.trim()) return;

    const question = input;

    setInput("");

    await askQuestion(question);
  }

  async function askQuestion(question: string) {
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
          content:
            "Sorry, CartIQ AI couldn't answer right now.",
        },
      ]);
    }

    setLoading(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">

      <div className="absolute right-0 top-0 flex h-full w-[430px] flex-col bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
              <Bot className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-lg">
                CartIQ AI
              </h2>

              <p className="text-sm text-zinc-500">
                Product Assistant
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-zinc-100"
          >
            <X />
          </button>

        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5">

          <div className="space-y-4">

            {messages.map((message, index) => {

              const isAssistant = message.role === "assistant";

              return (
                <div
                  key={index}
                  className={`max-w-[92%] rounded-2xl p-4 ${
                    isAssistant
                      ? "bg-zinc-100"
                      : "ml-auto bg-zinc-900 text-white"
                  }`}
                >

                  {typeof message.content === "string" ? (

                    <p className="whitespace-pre-wrap">
                      {message.content}
                    </p>

                  ) : (

                    <div className="space-y-4">

                      <div>

                        <h3 className="text-lg font-semibold">
                          🧠 {message.content.title}
                        </h3>

                        <p className="mt-2 text-sm text-zinc-700">
                          {message.content.summary}
                        </p>

                      </div>

                      {message.content.highlights.length > 0 && (

                        <div>

                          <h4 className="font-medium">
                            Highlights
                          </h4>

                          <ul className="mt-2 space-y-2">

                            {message.content.highlights.map((item, i) => (

                              <li key={i}>
                                ✅ {item}
                              </li>

                            ))}

                          </ul>

                        </div>

                      )}

                      {message.content.recommendation && (

                        <div className="rounded-xl bg-white p-4">

                          <h4 className="font-semibold">
                            💡 Recommendation
                          </h4>

                          <p className="mt-2 text-sm">
                            {message.content.recommendation}
                          </p>

                        </div>

                      )}

                    </div>

                  )}

                </div>
              );

            })}

            <div ref={bottomRef} />

          </div>

        </div>

        {/* Suggested Questions */}
        <div className="border-t p-4">

          <button
            onClick={() => setShowQuestions((prev) => !prev)}
            className="flex w-full items-center justify-between text-sm font-medium text-zinc-600"
          >
            <span>Suggested questions</span>
            {showQuestions ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {showQuestions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {getSuggestedQuestions(product).map((question) => (
                <button
                  key={question}
                  onClick={() => askQuestion(question)}
                  disabled={loading}
                  className="rounded-full border px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 border-t p-4">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask about this product..."
            disabled={loading}
            className="flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:border-zinc-400 disabled:opacity-50"
          />

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>

        </div>

      </div>

    </div>
  );
}