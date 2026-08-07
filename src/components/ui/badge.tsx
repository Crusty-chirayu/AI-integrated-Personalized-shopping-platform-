import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Sparkles, Crown, TrendingUp, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Badge
 * `variant="default" | "secondary" | "outline" | "destructive"` behaves
 * exactly like a standard shadcn badge. Additional semantic variants
 * (ai/premium/trending/new/sale/verified) are additive.
 * ---------------------------------------------------------------------- */

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[--accent] text-white",
        secondary: "border-transparent bg-[--surface-hover] text-[--fg]",
        outline: "border-[--border-strong] text-[--fg]",
        destructive: "border-transparent bg-rose-500 text-white",
        ai: "border-transparent text-white bg-[linear-gradient(135deg,#6D5DFC,#8B7CFF)] shadow-[0_4px_14px_-4px_rgba(109,93,252,0.6)] animate-[pulse_2.5s_ease-in-out_infinite]",
        premium: "border-amber-400/30 text-amber-300 bg-amber-400/10",
        trending: "border-transparent text-white bg-[linear-gradient(135deg,#F97316,#F43F5E)]",
        new: "border-transparent text-white bg-emerald-500",
        sale: "border-transparent text-white bg-rose-500",
        verified: "border-transparent text-white bg-[--accent]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const icons: Partial<Record<NonNullable<VariantProps<typeof badgeVariants>["variant"]>, React.ElementType>> = {
  ai: Sparkles,
  premium: Crown,
  trending: TrendingUp,
  verified: BadgeCheck,
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Set false to hide the automatic leading icon on semantic variants. */
  icon?: boolean;
}

function Badge({ className, variant, icon = true, children, ...props }: BadgeProps) {
  const Icon = variant ? icons[variant] : undefined;
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {icon && Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
