"use client";

import { Bot } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function ProductAIButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-full bg-zinc-950 px-5 py-3 text-white shadow-lg transition hover:scale-[1.02] hover:bg-zinc-800"
    >
      <Bot className="h-5 w-5" />

      <span className="font-medium">
        Ask CartIQ AI
      </span>
    </button>
  );
}