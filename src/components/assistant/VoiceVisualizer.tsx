"use client";

type Props = {
  listening: boolean;
};

export default function VoiceVisualizer({
  listening,
}: Props) {
if (!listening) return null;

return (    <div className="mt-2 flex h-8 items-end justify-center gap-[3px]">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className={`
            w-[3px] rounded-full transition-all duration-300
            ${
              listening
                ? "bg-blue-500 animate-wave"
                : "h-1 bg-zinc-400"
            }
          `}
          style={{
            height: listening
              ? `${12 + (i % 3) * 8}px`
              : "4px",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}