"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Toast primitives (Radix). Pair with use-toast.ts + toaster.tsx for the
 * full imperative `toast({ title, description })` API. Export surface
 * matches a standard shadcn toast.tsx.
 * ---------------------------------------------------------------------- */

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2.5 p-4 sm:max-w-sm",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border p-4 pr-8 backdrop-blur-xl shadow-[0_24px_56px_-20px_rgba(0,0,0,0.5)]",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-[--surface-elevated]/90 text-[--fg]",
        success: "border-emerald-500/25 bg-emerald-500/10 text-[--fg]",
        error: "border-rose-500/25 bg-rose-500/10 text-[--fg]",
        warning: "border-amber-500/25 bg-amber-500/10 text-[--fg]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const iconMap: Record<string, React.ElementType> = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
};

const iconColor: Record<string, string> = {
  default: "text-[--accent]",
  success: "text-emerald-400",
  error: "text-rose-400",
  warning: "text-amber-400",
};

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  /** Duration in ms used to animate the bottom progress bar. Falls back to the Root's `duration`. */
  progressDuration?: number;
}

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
  ({ className, variant = "default", progressDuration, duration, children, ...props }, ref) => {
    const Icon = iconMap[variant ?? "default"];
    const barDuration = (progressDuration ?? duration ?? 5000) / 1000;

    return (
      <ToastPrimitives.Root
        ref={ref}
        duration={duration}
        asChild
        {...props}
      >
        <motion.li
          className={cn(toastVariants({ variant }), className)}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        >
          <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColor[variant ?? "default"])} />
          <div className="flex-1 space-y-1">{children}</div>

          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-black/10">
            <motion.div
              className="h-full bg-current opacity-40"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              style={{ transformOrigin: "left" }}
              transition={{ duration: barDuration, ease: "linear" }}
            />
          </div>
        </motion.li>
      </ToastPrimitives.Root>
    );
  }
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "shrink-0 rounded-lg border border-[--border-strong] bg-transparent px-2.5 py-1 text-xs font-medium text-[--fg] transition-colors hover:bg-[--surface-hover]",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-[--fg-subtle] opacity-0 transition-opacity hover:text-[--fg] group-hover:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm text-[--fg-subtle]", className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toastVariants,
};
