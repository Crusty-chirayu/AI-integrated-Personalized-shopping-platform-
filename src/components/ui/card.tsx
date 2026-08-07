"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Card
 * Sub-component API (Card / CardHeader / CardTitle / CardDescription /
 * CardContent / CardFooter) is unchanged from a standard shadcn card, so
 * existing usage keeps compiling. New optional props: variant, interactive.
 * ---------------------------------------------------------------------- */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient-border";
  /** Adds hover-lift + shadow bloom, for cards that act like buttons/links. */
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", interactive = false, children, ...props }, ref) => {
    if (variant === "gradient-border") {
      return (
        <div
          ref={ref}
          className={cn(
            "group relative rounded-2xl p-[1px]",
            "bg-[linear-gradient(135deg,rgba(109,93,252,0.55),rgba(255,255,255,0.06)_40%,rgba(139,124,255,0.4))]",
            interactive &&
              "transition-transform duration-300 ease-out hover:-translate-y-1",
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full w-full rounded-[calc(1rem-1px)] bg-[--surface] p-6",
              "shadow-[0_20px_50px_-24px_rgba(0,0,0,0.55)]",
              interactive &&
                "transition-shadow duration-300 ease-out group-hover:shadow-[0_28px_64px_-20px_rgba(109,93,252,0.35)]"
            )}
          >
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-300 ease-out",
          variant === "glass"
            ? "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_20px_50px_-24px_rgba(0,0,0,0.55)]"
            : "border border-[--border] bg-[--surface] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-28px_rgba(0,0,0,0.35)]",
          interactive &&
            "hover:-translate-y-1 hover:shadow-[0_24px_56px_-20px_rgba(0,0,0,0.45)] cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 pb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight text-[--fg]", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-[--fg-subtle]", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("text-sm", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
