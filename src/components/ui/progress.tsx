"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Progress
 * <Progress value={n} /> keeps working exactly as a standard shadcn
 * progress bar (linear, gradient fill, animated). `variant="circular"`
 * is additive and renders an SVG ring instead.
 * ---------------------------------------------------------------------- */

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  variant?: "linear" | "circular";
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  (
    { className, value = 0, variant = "linear", size = 64, strokeWidth = 6, showLabel = false, ...props },
    ref
  ) => {
    if (variant === "circular") {
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

      return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              className="fill-none stroke-[--surface-hover]"
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="fill-none"
              stroke="url(#progress-gradient)"
              strokeDasharray={circumference}
              initial={false}
              animate={{ strokeDashoffset: offset }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6D5DFC" />
                <stop offset="100%" stopColor="#8B7CFF" />
              </linearGradient>
            </defs>
          </svg>
          {showLabel && (
            <span className="absolute text-sm font-semibold text-[--fg]">{Math.round(value)}%</span>
          )}
        </div>
      );
    }

    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={value}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-[--surface-hover]", className)}
        {...props}
      >
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,#6D5DFC,#8B7CFF)]"
          initial={false}
          animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </ProgressPrimitive.Root>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
