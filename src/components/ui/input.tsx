"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Input
 * Backward compatible with a plain <input>: every native prop still
 * works, and rendering <Input placeholder="Email" /> with no label is
 * still valid (the placeholder is used as a static label in that case).
 * New, optional props: label (floating), error, success, hint, icon.
 * ---------------------------------------------------------------------- */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  variant?: "default" | "glass";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      success,
      hint,
      icon,
      variant = "default",
      id,
      onFocus,
      onBlur,
      onChange,
      value,
      defaultValue,
      placeholder,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(
      Boolean(value ?? defaultValue ?? "")
    );

    React.useEffect(() => {
      if (value !== undefined) setHasValue(Boolean(value));
    }, [value]);

    const floated = focused || hasValue || Boolean(placeholder && !label);
    const showFloatingLabel = Boolean(label);

    return (
      <div className="w-full">
        <div
          className={cn(
            "group relative rounded-xl transition-all duration-200",
            variant === "glass"
              ? "border border-white/10 bg-white/[0.05] backdrop-blur-xl"
              : "border border-[--border] bg-[--surface]",
            focused && !error && "border-[--accent] shadow-[0_0_0_4px_rgba(109,93,252,0.15)]",
            error && "border-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.12)]",
            success && !error && "border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
          )}
        >
          <div className="flex items-center gap-2 px-3.5">
            {icon && <span className="shrink-0 text-[--fg-subtle]">{icon}</span>}

            <div className="relative flex-1 min-w-0">
              {showFloatingLabel && (
                <motion.label
                  htmlFor={inputId}
                  className={cn(
                    "pointer-events-none absolute left-0 origin-left text-[--fg-subtle]",
                    "top-1/2"
                  )}
                  animate={
                    floated
                      ? { y: "-14px", scale: 0.78, translateY: "-50%" }
                      : { y: "0px", scale: 1, translateY: "-50%" }
                  }
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  style={{ transformOrigin: "left center" }}
                >
                  {label}
                </motion.label>
              )}
              <input
                id={inputId}
                ref={ref}
                type={type}
                value={value}
                defaultValue={defaultValue}
                placeholder={showFloatingLabel ? (focused ? placeholder : "") : placeholder}
                className={cn(
                  "peer w-full bg-transparent py-3.5 text-sm text-[--fg] outline-none",
                  "placeholder:text-[--fg-subtle]",
                  showFloatingLabel && "pt-[22px] pb-[6px]",
                  className
                )}
                onFocus={(e) => {
                  setFocused(true);
                  onFocus?.(e);
                }}
                onBlur={(e) => {
                  setFocused(false);
                  onBlur?.(e);
                }}
                onChange={(e) => {
                  setHasValue(Boolean(e.target.value));
                  onChange?.(e);
                }}
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                {...props}
              />
            </div>

            <AnimatePresence>
              {(error || success) && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="shrink-0"
                >
                  {error ? (
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {error ? (
            <motion.p
              id={`${inputId}-error`}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 6 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="px-1 text-xs text-rose-500"
              role="alert"
            >
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              id={`${inputId}-hint`}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 6 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="px-1 text-xs text-[--fg-subtle]"
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
