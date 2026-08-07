import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Loaders
 * Three flavors used across CartIQ: a plain ring Spinner (default, most
 * places), a three-Dots loader (compact/inline), and an AILoader
 * (gradient conic ring) for AI-generated content / recommendations.
 * ---------------------------------------------------------------------- */

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

function Spinner({ className, size = 20, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

function Dots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
          style={{
            animation: "cartiq-bounce 1s ease-in-out infinite",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes cartiq-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

function AILoader({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Generating"
      className={cn("relative inline-block animate-spin rounded-full", className)}
      style={{
        width: size,
        height: size,
        background:
          "conic-gradient(from 0deg, transparent, #6D5DFC, #8B7CFF, transparent 70%)",
        WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
        mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
      }}
    />
  );
}

export { Spinner, Dots, AILoader };
