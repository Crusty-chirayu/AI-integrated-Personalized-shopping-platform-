"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Drawer
 * Built on Radix Dialog (same accessible focus-trap/escape behavior as
 * Dialog) but slides from an edge and supports drag-to-dismiss. API
 * mirrors Dialog's: Drawer/DrawerTrigger/DrawerContent/Header/Footer/
 * Title/Description, plus an optional `side` prop (default "right").
 * ---------------------------------------------------------------------- */

const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerClose = DialogPrimitive.Close;
const DrawerPortal = DialogPrimitive.Portal;

type Side = "left" | "right" | "top" | "bottom";

const sideStyles: Record<Side, string> = {
  right: "right-0 top-0 h-full w-full max-w-sm border-l",
  left: "left-0 top-0 h-full w-full max-w-sm border-r",
  top: "top-0 left-0 w-full max-h-[85vh] border-b rounded-b-2xl",
  bottom: "bottom-0 left-0 w-full max-h-[85vh] border-t rounded-t-2xl",
};

const offscreen: Record<Side, { x?: number | string; y?: number | string }> = {
  right: { x: "100%" },
  left: { x: "-100%" },
  top: { y: "-100%" },
  bottom: { y: "100%" },
};

const dragAxis: Record<Side, "x" | "y"> = {
  right: "x",
  left: "x",
  top: "y",
  bottom: "y",
};

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: Side;
}

const DrawerContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DrawerContentProps>(
  ({ className, children, side = "right", ...props }, ref) => {
    const [closing, setClosing] = React.useState(false);

    const handleDragEnd = (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
      close: () => void
    ) => {
      const threshold = 100;
      const offset = dragAxis[side] === "x" ? info.offset.x : info.offset.y;
      const positive = side === "right" || side === "bottom";
      if ((positive && offset > threshold) || (!positive && offset < -threshold)) {
        setClosing(true);
        close();
      }
    };

    return (
      <DrawerPortal forceMount>
        <AnimatePresence>
          <DialogPrimitive.Overlay forceMount asChild>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </DialogPrimitive.Overlay>

          <DialogPrimitive.Content ref={ref} forceMount asChild {...props}>
            <motion.div
              drag={dragAxis[side]}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={{ top: side === "top" ? 0.2 : 0, bottom: side === "bottom" ? 0.2 : 0, left: side === "left" ? 0.2 : 0, right: side === "right" ? 0.2 : 0 }}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, () => {
                  (document.activeElement as HTMLElement)?.blur();
                })
              }
              className={cn(
                "fixed z-50 flex flex-col border-[--border] bg-[--surface-elevated] p-6",
                "shadow-[0_32px_80px_-24px_rgba(0,0,0,0.5)] focus:outline-none",
                sideStyles[side],
                className
              )}
              initial={offscreen[side]}
              animate={{ x: 0, y: 0 }}
              exit={offscreen[side]}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div
                className={cn(
                  "mx-auto mb-4 shrink-0 rounded-full bg-[--border-strong]",
                  side === "top" || side === "bottom" ? "h-1.5 w-12" : "hidden"
                )}
              />
              {children}
            </motion.div>
          </DialogPrimitive.Content>
        </AnimatePresence>
      </DrawerPortal>
    );
  }
);
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-2 pt-4", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight text-[--fg]", className)}
    {...props}
  />
));
DrawerTitle.displayName = DialogPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-[--fg-subtle]", className)} {...props} />
));
DrawerDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerClose,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
