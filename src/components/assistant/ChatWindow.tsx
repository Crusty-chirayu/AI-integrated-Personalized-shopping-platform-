"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
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

type ChatMessage = {
  id: string;
  streaming?: boolean;
  role: "user" | "assistant";
  type: "text" | "products" | "comparison" | "order";
  content: any;
  products?: any[];
  comparison?: any[];
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      type: "text",
      content: "👋 Hello! I'm CartIQ AI.\n\nHow can I help you shop today?",
      streaming: false,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  const sessionId = useRef(crypto.randomUUID());
  const conversationId = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      setConversations(allConversations);

      const conversation = await getLatestConversation(user.id);
      if (!conversation) return;

      conversationId.current = conversation.id;
      setSelectedConversation(conversation.id);

      const history = await getMessages(conversation.id);

      setMessages(
        history.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          type: msg.type ?? "text",
          content: msg.content,
          products: msg.metadata?.products ?? [],
          comparison: msg.metadata?.comparison ?? [],
          streaming: false,
        }))
      );
    }

    loadConversation();
  }, []);

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition isn't supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    recognition.start();

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);

      // Give React time to update the input
      setTimeout(async () => {
        const user = await getCurrentUser();
        if (!user) return;

        if (!conversationId.current) {
          const conversation = await createConversation(user.id);
          conversationId.current = conversation.id;
        }

        await sendVoiceMessage(transcript);
      }, 100);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
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

  return (
    <div className="flex h-screen">
      <ConversationSidebar
        conversations={conversations}
        selectedId={selectedConversation}
        onSelect={async (id) => {
          setSelectedConversation(id);
          conversationId.current = id;

          const history = await getMessages(id);

          setMessages(
            history.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              type: msg.type ?? "text",
              content: msg.content,
              products: msg.metadata?.products ?? [],
              comparison: msg.metadata?.comparison ?? [],
              streaming: false,
            }))
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
              content:
                "👋 Hello! I'm CartIQ AI.\n\nHow can I help you shop today?",
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
                content:
                  "👋 Hello! I'm CartIQ AI.\n\nHow can I help you shop today?",
                streaming: false,
              },
            ]);
          }
        }}
      />

      <div className="flex flex-1 flex-col">
        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto p-8">
          {messages.map((message) => (
            <Message key={message.id} role={message.role}>
              {message.role === "assistant" ? (
                <AIMessage
                  message={message.content}
                  streaming={message.streaming ?? false}
                />
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}

              {message.type === "products" && (
                <ProductCarousel products={message.products ?? []} />
              )}

              {message.type === "comparison" &&
                message.comparison &&
                message.comparison.length >= 2 && (
                  <ComparisonCard
                    left={message.comparison[0]}
                    right={message.comparison[1]}
                  />
                )}
            </Message>
          ))}

          {loading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-white p-6">
          <div className="mx-auto flex max-w-4xl gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Ask CartIQ AI anything..."
              className="flex-1 rounded-xl border border-zinc-300 px-5 py-4 outline-none focus:border-black"
            />

            <div className="flex items-end gap-3">
              <div className="flex flex-col items-center">
                <VoiceButton listening={listening} onClick={startListening} />
                <VoiceVisualizer listening={listening} />
              </div>



<button
  type="button"
  onClick={sendMessage}
  disabled={loading || !input.trim()}
  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading ? (
    <Loader2 className="h-5 w-5 animate-spin" />
  ) : (
    <ArrowUp className="h-5 w-5" />
  )}
</button>



            </div>
          </div>
        </div>
      </div>
    </div>
  );
}