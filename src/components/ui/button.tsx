"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Button
 * A single primitive that covers every button treatment in CartIQ:
 * solid gradient, outline, ghost, glass, and destructive — each with
 * ripple + hover-lift + optional glow, plus async loading/success states.
 * 100% backward compatible: existing `variant`/`size`/`asChild`/`onClick`
 * usage keeps working unchanged. New props are additive and optional.
 * ---------------------------------------------------------------------- */

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "rounded-xl text-sm font-medium tracking-tight",
    "transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 focus-visible:ring-offset-[--ring-offset-bg]",
    "active:scale-[0.98]",
    "overflow-hidden isolate",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "text-white shadow-[0_1px_1px_rgba(0,0,0,0.1),0_8px_20px_-8px_rgba(109,93,252,0.55)]",
          "bg-[linear-gradient(135deg,#6D5DFC_0%,#8B7CFF_55%,#A78BFA_100%)]",
          "hover:shadow-[0_1px_1px_rgba(0,0,0,0.1),0_12px_28px_-8px_rgba(109,93,252,0.7)] hover:-translate-y-[1px]",
        ].join(" "),
        outline: [
          "border border-[--border-strong] bg-transparent text-[--fg]",
          "hover:bg-[--surface-hover] hover:-translate-y-[1px] hover:border-[--border-hover]",
        ].join(" "),
        ghost: [
          "bg-transparent text-[--fg-muted]",
          "hover:bg-[--surface-hover] hover:text-[--fg]",
        ].join(" "),
        glass: [
          "text-[--fg] border border-white/10 bg-white/[0.06] backdrop-blur-xl",
          "shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_24px_-12px_rgba(0,0,0,0.5)]",
          "hover:bg-white/[0.1] hover:-translate-y-[1px]",
        ].join(" "),
        destructive: [
          "text-white bg-[linear-gradient(135deg,#F43F5E_0%,#FB7185_100%)]",
          "shadow-[0_8px_20px_-8px_rgba(244,63,94,0.55)] hover:-translate-y-[1px]",
        ].join(" "),
        link: "bg-transparent text-[--accent] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-base rounded-2xl",
        icon: "h-10 w-10 p-0 rounded-xl",
      },
      glow: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        glow: true,
        class:
          "after:content-[''] after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-[inherit] after:blur-xl after:opacity-60 after:scale-105",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
    },
  }
);

type Ripple = { id: number; x: number; y: number; size: number };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
  /** Briefly shows a success check (e.g. after an async action resolves). Consumer controls timing. */
  success?: boolean;
  /** Disable the built-in click ripple. Default: enabled. */
  disableRipple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      glow,
      asChild = false,
      loading = false,
      success = false,
      disableRipple = false,
      children,
      onMouseDown,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const [ripples, setRipples] = React.useState<Ripple[]>([]);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableRipple && !disabled && !loading) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const id = Date.now();
        setRipples((prev) => [
          ...prev,
          { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size },
        ]);
        window.setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 650);
      }
      onMouseDown?.(e);
    };

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, glow, className }))}
        disabled={disabled || loading}
        onMouseDown={handleMouseDown}
        aria-busy={loading || undefined}
        {...props}
      >
        {!disableRipple && !asChild && (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  className="absolute rounded-full bg-white/35"
                  style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
                  initial={{ opacity: 0.5, scale: 0 }}
                  animate={{ opacity: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
          </span>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span
              key="loading"
              className="inline-flex items-center gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{children}</span>
            </motion.span>
          ) : success ? (
            <motion.span
              key="success"
              className="inline-flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "backOut" }}
            >
              <Check className="h-4 w-4" />
              <span>{children}</span>
            </motion.span>
          ) : (
            <motion.span
              key="content"
              className="inline-flex items-center gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
