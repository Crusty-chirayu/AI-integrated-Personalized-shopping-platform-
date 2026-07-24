"use client";

import { Mic } from "lucide-react";

type Props = {
  listening: boolean;
  onClick: () => void;
};

export default function VoiceButton({
  listening,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl p-3 transition ${
        listening
          ? "bg-red-500 text-white"
          : "bg-zinc-200 hover:bg-zinc-300"
      }`}
    >


<Mic className="h-5 w-5" />


    </button>
  );
}