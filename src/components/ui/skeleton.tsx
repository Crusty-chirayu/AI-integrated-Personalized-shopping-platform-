import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Skeleton
 * `<Skeleton className="h-4 w-32" />` still works exactly as before.
 * `variant` is optional and just changes the base shape/radius.
 * ---------------------------------------------------------------------- */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect" | "card";
}

function Skeleton({ className, variant = "rect", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[--surface-hover]",
        variant === "text" && "h-4 w-full rounded-md",
        variant === "circle" && "aspect-square rounded-full",
        variant === "rect" && "rounded-lg",
        variant === "card" && "rounded-2xl",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 -translate-x-full",
          "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]",
          "animate-[shimmer_1.6s_ease-in-out_infinite]"
        )}
      />
    </div>
  );
}

export { Skeleton };

/* Add to your global stylesheet (e.g. globals.css) once:

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

*/
