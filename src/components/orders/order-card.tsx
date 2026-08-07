"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PackageCheck,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileDown,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

// ─────────────────────────────────────────────────────────────────────────
// DATA CONTRACT — UNCHANGED. Same required props, same status union.
// Everything below `status` is a new, fully optional prop: if the parent
// doesn't pass it, that part of the card simply doesn't render. Nothing
// here invents order data (line items, GST, delivery dates, AI copy).
// ─────────────────────────────────────────────────────────────────────────
type OrderCardProps = {
  orderId: string;
  date: string;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

  // Optional line items — only rendered if provided.
  items?: { title: string; image?: string; quantity: number; price: number }[];

  // Optional invoice breakdown — falls back to just `total` if absent.
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  gst?: number;
  paymentStatus?: "Paid" | "Pending" | "Refunded" | "Failed";

  // Optional AI/logistics copy — never fabricated by this component.
  estimatedDelivery?: string;
  currentLocation?: string;
  aiInsight?: string;
  warrantyReminder?: string;

  // Optional action handlers. Buttons only appear when a handler is
  // passed in, except "View details" / "Track", which reuse the same
  // real `/orders/${orderId}` route the original component already used.
  onDownloadInvoice?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  onReturn?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onContactSupport?: (orderId: string) => void;
};

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"] as const;

const STATUS_STYLES: Record<OrderCardProps["status"], { badge: string; icon: React.ElementType; dot: string }> = {
  Pending: { badge: "bg-amber-50 text-amber-700", icon: Clock, dot: "bg-amber-400" },
  Processing: { badge: "bg-blue-50 text-blue-700", icon: PackageCheck, dot: "bg-blue-400" },
  Shipped: { badge: "bg-violet-50 text-violet-700", icon: Truck, dot: "bg-violet-400" },
  Delivered: { badge: "bg-emerald-50 text-emerald-700", icon: CheckCircle2, dot: "bg-emerald-500" },
  Cancelled: { badge: "bg-red-50 text-red-700", icon: XCircle, dot: "bg-red-500" },
};

function OrderCardImpl({
  orderId,
  date,
  total,
  status,
  items,
  subtotal,
  shippingFee,
  discount,
  gst,
  paymentStatus,
  estimatedDelivery,
  currentLocation,
  aiInsight,
  warrantyReminder,
  onDownloadInvoice,
  onReorder,
  onReturn,
  onCancel,
  onContactSupport,
}: OrderCardProps) {
  const StatusIcon = STATUS_STYLES[status].icon;
  const isCancelled = status === "Cancelled";
  const activeStepIndex = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);

  const hasBreakdown =
    subtotal != null || shippingFee != null || discount != null || gst != null;

  const canCancel = (status === "Pending" || status === "Processing") && !!onCancel;
  const canReturn = status === "Delivered" && !!onReturn;
  const canReorder = (status === "Delivered" || status === "Cancelled") && !!onReorder;

  const detailHref = useMemo(() => `/orders/${orderId}`, [orderId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="cqo-font cqo-gradient-border relative overflow-hidden rounded-[28px] border border-black/5 bg-white/90 p-6 shadow-[0_1px_2px_rgba(17,17,17,0.04)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_24px_48px_-16px_rgba(17,17,17,0.14)] sm:p-7"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
        .cqo-font { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cqo-display { font-family: 'Space Grotesk', 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cqo-gradient-border { position: relative; }
        .cqo-gradient-border::before {
          content: ""; position: absolute; inset: 0; padding: 1px; border-radius: inherit;
          background: linear-gradient(135deg, rgba(139,108,255,0.28), rgba(34,199,224,0.12) 55%, rgba(0,0,0,0.04));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
        }
        .cqo-focus-ring:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(139,108,255,0.32); }
        .cqo-ripple { position: relative; overflow: hidden; }
        .cqo-ripple::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit;
          background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 60%);
          opacity: 0; transform: scale(0.4); transition: transform 0.5s ease, opacity 0.6s ease;
        }
        .cqo-ripple:active::after { opacity: 1; transform: scale(1.4); transition: 0s; }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12.5px] uppercase tracking-[0.16em] text-zinc-400">Order ID</p>
          <h3 className="cqo-display mt-1 text-lg font-semibold text-zinc-950">#{orderId}</h3>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${STATUS_STYLES[status].badge}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status}
        </span>
      </div>

      {/* Animated status timeline — derived only from the real `status` prop */}
      {!isCancelled ? (
        <div className="mt-6" role="list" aria-label="Order progress">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-[7px] h-[2px] bg-zinc-100" aria-hidden />
            <motion.div
              className="absolute left-0 top-[7px] h-[2px] bg-gradient-to-r from-[#8B6CFF] to-[#22C7E0]"
              initial={{ width: 0 }}
              whileInView={{ width: `${(activeStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              aria-hidden
            />
            {STATUS_STEPS.map((step, i) => {
              const reached = i <= activeStepIndex;
              return (
                <div key={step} role="listitem" className="relative z-10 flex flex-col items-center gap-2">
                  <span
                    className={`h-[15px] w-[15px] rounded-full border-2 transition-colors duration-300 ${
                      reached ? "border-[#8B6CFF] bg-[#8B6CFF]" : "border-zinc-200 bg-white"
                    }`}
                    aria-current={i === activeStepIndex ? "step" : undefined}
                  />
                  <span className={`text-[11px] font-medium ${reached ? "text-zinc-700" : "text-zinc-400"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {(estimatedDelivery || currentLocation) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-zinc-500">
              {estimatedDelivery && (
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-[#7C5CFC]" /> Est. delivery {estimatedDelivery}
                </span>
              )}
              {currentLocation && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {currentLocation}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-red-50/60 px-4 py-3 text-[13px] text-red-700">
          <XCircle className="h-4 w-4 flex-none" />
          This order was cancelled.
        </div>
      )}

      {/* Line items — only if the parent supplies real order items */}
      {items && items.length > 0 && (
        <div className="mt-6 space-y-2.5 border-t border-black/5 pt-5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.image ? (
                <img src={item.image} alt="" loading="lazy" className="h-12 w-12 flex-none rounded-xl object-cover" />
              ) : (
                <div className="h-12 w-12 flex-none rounded-xl bg-zinc-100" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-zinc-800">{item.title}</p>
                <p className="text-[12px] text-zinc-500">Qty {item.quantity}</p>
              </div>
              <span className="text-[13.5px] font-semibold text-zinc-800">{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Date / Total (+ optional breakdown) */}
      <div className="mt-6 grid grid-cols-2 gap-6 border-t border-black/5 pt-5">
        <div>
          <p className="text-[12.5px] text-zinc-500">Order date</p>
          <p className="mt-0.5 font-medium text-zinc-800">{date}</p>
        </div>
        <div>
          <p className="text-[12.5px] text-zinc-500">Total amount</p>
          <p className="cqo-display mt-0.5 text-lg font-semibold text-zinc-950">{formatCurrency(total)}</p>
          {paymentStatus && (
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                paymentStatus === "Paid"
                  ? "bg-emerald-50 text-emerald-700"
                  : paymentStatus === "Refunded"
                  ? "bg-sky-50 text-sky-700"
                  : paymentStatus === "Failed"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {paymentStatus}
            </span>
          )}
        </div>
      </div>

      {hasBreakdown && (
        <div className="mt-4 space-y-1.5 rounded-2xl bg-zinc-50 p-4 text-[13px]">
          {subtotal != null && (
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          )}
          {discount != null && discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          {shippingFee != null && (
            <div className="flex justify-between text-zinc-500">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}</span>
            </div>
          )}
          {gst != null && (
            <div className="flex justify-between text-zinc-500">
              <span>GST</span>
              <span>{formatCurrency(gst)}</span>
            </div>
          )}
        </div>
      )}

      {/* AI insight / warranty — only if supplied */}
      {(aiInsight || warrantyReminder) && (
        <div className="mt-4 space-y-2">
          {aiInsight && (
            <div className="flex items-start gap-2 rounded-2xl bg-gradient-to-br from-[#8B6CFF]/[0.07] to-[#22C7E0]/[0.07] px-4 py-3">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-none text-[#7C5CFC]" />
              <p className="text-[12.5px] text-zinc-600">{aiInsight}</p>
            </div>
          )}
          {warrantyReminder && (
            <div className="flex items-start gap-2 rounded-2xl bg-amber-50/60 px-4 py-3">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-amber-600" />
              <p className="text-[12.5px] text-amber-700">{warrantyReminder}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <Link
          href={detailHref}
          className="cqo-focus-ring cqo-ripple inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-5 py-2.5 text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-zinc-800"
        >
          View details
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>

        {!isCancelled && status !== "Delivered" && (
          <Link
            href={detailHref}
            className="cqo-focus-ring inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2.5 text-[13.5px] font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:border-black/20"
          >
            <Truck className="h-3.5 w-3.5" /> Track order
          </Link>
        )}

        {onDownloadInvoice && (
          <button
            type="button"
            onClick={() => onDownloadInvoice(orderId)}
            className="cqo-focus-ring inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2.5 text-[13.5px] font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:border-black/20"
          >
            <FileDown className="h-3.5 w-3.5" /> Invoice
          </button>
        )}

        {canReorder && (
          <button
            type="button"
            onClick={() => onReorder!(orderId)}
            className="cqo-focus-ring cqo-ripple inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7C5CFC] to-[#22C7E0] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reorder
          </button>
        )}

        {canReturn && (
          <button
            type="button"
            onClick={() => onReturn!(orderId)}
            className="cqo-focus-ring inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2.5 text-[13.5px] font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:border-black/20"
          >
            Return
          </button>
        )}

        {canCancel && (
          <button
            type="button"
            onClick={() => onCancel!(orderId)}
            className="cqo-focus-ring inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2.5 text-[13.5px] font-medium text-red-600 transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50"
          >
            Cancel order
          </button>
        )}

        {onContactSupport && (
          <button
            type="button"
            onClick={() => onContactSupport(orderId)}
            className="cqo-focus-ring ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13.5px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Support
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default memo(OrderCardImpl);