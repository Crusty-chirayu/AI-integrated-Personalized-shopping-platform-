"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Tooltip
 * Same Provider/Root/Trigger/Content API as a standard shadcn tooltip.
 * ---------------------------------------------------------------------- */

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, children, ...props }, ref) => (
  <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} asChild {...props}>
    <motion.div
      className={cn(
        "z-50 overflow-hidden rounded-lg border border-white/10 bg-black/80 backdrop-blur-md",
        "px-2.5 py-1.5 text-xs text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,0.6)]",
        className
      )}
      initial={{ opacity: 0, scale: 0.92, y: 2 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 2 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  </TooltipPrimitive.Content>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
