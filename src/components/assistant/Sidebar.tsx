"use client";

import { MessageSquarePlus, History, Sparkles } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r bg-white">

      <div className="border-b p-6">

        <h1 className="text-2xl font-bold">
          CartIQ AI
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Your AI Shopping Assistant
        </p>

      </div>

      <div className="p-4">

        <button className="flex w-full items-center gap-3 rounded-xl bg-black px-4 py-3 text-white transition hover:bg-zinc-800">

          <MessageSquarePlus className="h-5 w-5" />

          New Chat

        </button>

      </div>

      <div className="px-4">

        <p className="mb-3 text-xs font-semibold uppercase text-zinc-400">
          Recent Chats
        </p>

        <div className="space-y-2">

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-zinc-100">

            <History className="h-4 w-4" />

            Laptop under ₹70000

          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-zinc-100">

            <History className="h-4 w-4" />

            Compare iPhone

          </button>

        </div>

      </div>

      <div className="mt-auto border-t p-5">

        <div className="flex items-center gap-2">

          <Sparkles className="h-5 w-5 text-amber-500" />

          <span className="text-sm font-medium">
            CartIQ AI Beta
          </span>

        </div>

      </div>

    </aside>
  );
}