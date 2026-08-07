"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-[7px] border border-[--border-strong] bg-[--surface] transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 focus-visible:ring-offset-[--ring-offset-bg]",
      "data-[state=checked]:border-transparent data-[state=checked]:bg-[linear-gradient(135deg,#6D5DFC,#8B7CFF)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator forceMount asChild>
      <motion.span
        className="flex items-center justify-center text-white"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={
          props.checked || props.checked === "indeterminate"
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.4 }
        }
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </motion.span>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
