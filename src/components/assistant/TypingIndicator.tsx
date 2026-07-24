"use client";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">

      <div className="rounded-2xl bg-zinc-100 px-5 py-4">

        <div className="flex items-center gap-2">

          <div className="h-2 w-2 animate-bounce rounded-full bg-black"></div>

          <div
            className="h-2 w-2 animate-bounce rounded-full bg-black"
            style={{ animationDelay: "150ms" }}
          ></div>

          <div
            className="h-2 w-2 animate-bounce rounded-full bg-black"
            style={{ animationDelay: "300ms" }}
          ></div>

        </div>

      </div>

    </div>
  );
}