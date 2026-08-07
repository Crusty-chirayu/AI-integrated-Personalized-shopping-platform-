"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  memo,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Sparkles,
  ShoppingBag,
  ArrowUpDown,
  CalendarRange,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import OrderCard from "@/components/orders/order-card";

/* ------------------------------------------------------------------ */
/*  Status helpers (same mapping as before, just factored out so the   */
/*  header stats, filters and card all agree on one source of truth)   */
/* ------------------------------------------------------------------ */

type StatusLabel = "Delivered" | "Processing" | "Cancelled" | "Pending";

function getStatusLabel(order: any): StatusLabel {
  if (order.fulfillment_status === "delivered") return "Delivered";
  if (order.fulfillment_status === "processing") return "Processing";
  if (order.fulfillment_status === "cancelled") return "Cancelled";
  return "Pending";
}

const STATUS_FILTERS: Array<"All" | StatusLabel> = [
  "All",
  "Pending",
  "Processing",
  "Delivered",
  "Cancelled",
];

const STATUS_ICON: Record<StatusLabel, ReactNode> = {
  Pending: <Clock className="h-3.5 w-3.5" />,
  Processing: <Package className="h-3.5 w-3.5" />,
  Delivered: <CheckCircle2 className="h-3.5 w-3.5" />,
  Cancelled: <XCircle className="h-3.5 w-3.5" />,
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/* ------------------------------------------------------------------ */
/*  Count-up hook for animated stat numbers                            */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, active: boolean, durationMs = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let start: number | null = null;
    const from = 0;

    function step(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);

  return value;
}

/* ------------------------------------------------------------------ */
/*  Ripple interaction (used on primary buttons / links)               */
/* ------------------------------------------------------------------ */

function useRipple() {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number; size: number }>
  >([]);
  const idRef = useRef(0);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = idRef.current++;
    setRipples((prev) => [...prev, { id, x, y, size }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  const rippleLayer = (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute rounded-full bg-white"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </span>
  );

  return { onPointerDown, rippleLayer };
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  isCurrency?: boolean;
  active: boolean;
  accent: string;
  delay?: number;
};

const StatCard = memo(function StatCard({
  label,
  value,
  icon,
  isCurrency,
  active,
  accent,
  delay = 0,
}: StatCardProps) {
  const animated = useCountUp(value, active);
  const display = isCurrency ? currencyFormatter.format(animated) : animated.toLocaleString("en-IN");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl"
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full blur-2xl ${accent}`}
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-2 text-white/70">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
          {icon}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="relative mt-3 text-2xl font-bold tabular-nums text-white sm:text-3xl">
        {display}
      </p>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/*  Filter chip                                                        */
/* ------------------------------------------------------------------ */

const FilterChip = memo(function FilterChip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900/40 ${
        active ? "text-white" : "text-zinc-600 hover:text-zinc-900"
      }`}
    >
      {active && (
        <motion.span
          layoutId="statusChipHighlight"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="absolute inset-0 rounded-full bg-zinc-950"
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </button>
  );
});

/* ------------------------------------------------------------------ */
/*  Skeleton loading card                                              */
/* ------------------------------------------------------------------ */

function SkeletonOrderCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-100/80 to-transparent"
        animate={{ translateX: ["-100%", "160%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay }}
      />
      <div className="relative flex gap-4">
        <div className="h-24 w-24 shrink-0 rounded-2xl bg-zinc-100 sm:h-28 sm:w-28" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-3 w-1/3 rounded-full bg-zinc-100" />
          <div className="h-4 w-2/3 rounded-full bg-zinc-100" />
          <div className="h-3 w-1/4 rounded-full bg-zinc-100" />
        </div>
        <div className="hidden w-28 shrink-0 space-y-2 sm:block">
          <div className="h-8 w-full rounded-xl bg-zinc-100" />
          <div className="h-8 w-full rounded-xl bg-zinc-100" />
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty states                                                       */
/* ------------------------------------------------------------------ */

function NoOrdersYet() {
  const { onPointerDown, rippleLayer } = useRipple();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 20 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950/5"
      >
        <ShoppingBag className="h-7 w-7 text-zinc-400" strokeWidth={1.5} />
      </motion.div>
      <h2 className="mt-5 text-xl font-semibold text-zinc-900">No orders yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
        You haven&apos;t placed any orders yet. Once you do, you&apos;ll be able to track
        delivery, download invoices and reorder favorites right from here.
      </p>
      <Link
        href="/products"
        onPointerDown={onPointerDown}
        className="relative mt-6 inline-flex items-center justify-center overflow-hidden rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {rippleLayer}
        Start Shopping
      </Link>
    </motion.div>
  );
}

function NoFilterMatches({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/60 px-6 py-14 text-center"
    >
      <Search className="mx-auto h-6 w-6 text-zinc-400" />
      <h3 className="mt-4 text-base font-semibold text-zinc-900">No matching orders</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Try adjusting your search or filters.
      </p>
      <button
        onClick={onClear}
        className="mt-4 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30"
      >
        Clear filters
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI insights card                                                   */
/* ------------------------------------------------------------------ */

function AiInsightsCard({
  totalOrders,
  pendingCount,
  totalSpent,
}: {
  totalOrders: number;
  pendingCount: number;
  totalSpent: number;
}) {
  const insights: string[] = [];

  if (pendingCount > 0) {
    insights.push(
      `You have ${pendingCount} order${pendingCount > 1 ? "s" : ""} currently on the way.`
    );
  }
  if (totalOrders >= 3) {
    insights.push(`You've placed ${totalOrders} orders with us so far — thank you for shopping with us.`);
  }
  if (totalSpent > 0) {
    insights.push(`You've invested ${currencyFormatter.format(totalSpent)} in total across your orders.`);
  }
  if (insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="relative flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-200">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">Insights for you</p>
          <ul className="mt-2 space-y-1.5">
            {insights.map((text, i) => (
              <li key={i} className="text-[13px] leading-relaxed text-zinc-600">
                {text}
              </li>
            ))}
          </ul>
          <Link
            href="/products"
            className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-violet-700 hover:text-violet-900"
          >
            Browse recommendations →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | StatusLabel>("All");
  const [dateFilter, setDateFilter] = useState<"all" | "30d" | "3m" | "year">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "high" | "low">("newest");

  const continueShoppingRipple = useRipple();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    const fetchOrders = async () => {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setOrders(data ?? []);
      }
      setLoadingOrders(false);
    };

    fetchOrders();
  }, [loading, user, router]);

  /* ---- Derived stats (from the full order set, not the filtered one) ---- */
  const stats = useMemo(() => {
    let pending = 0;
    let delivered = 0;
    let cancelled = 0;
    let spent = 0;

    for (const order of orders) {
      const label = getStatusLabel(order);
      if (label === "Delivered") delivered++;
      else if (label === "Cancelled") cancelled++;
      else pending++; // Pending + Processing bucketed together, matching available data
      spent += Number(order.total) || 0;
    }

    return { total: orders.length, pending, delivered, cancelled, spent };
  }, [orders]);

  /* ---- Search / filter / sort (entirely client-side, no query changes) ---- */
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== "All") {
      list = list.filter((o) => getStatusLabel(o) === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => String(o.order_number ?? "").toLowerCase().includes(q));
    }

    if (dateFilter !== "all") {
      const now = Date.now();
      const cutoff =
        dateFilter === "30d"
          ? now - 30 * 86400000
          : dateFilter === "3m"
          ? now - 90 * 86400000
          : new Date(new Date().getFullYear(), 0, 1).getTime();
      list = list.filter((o) => new Date(o.created_at).getTime() >= cutoff);
    }

    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "high") return (Number(b.total) || 0) - (Number(a.total) || 0);
      return (Number(a.total) || 0) - (Number(b.total) || 0);
    });

    return list;
  }, [orders, statusFilter, search, dateFilter, sortBy]);

  const hasActiveFilters = statusFilter !== "All" || search.trim().length > 0 || dateFilter !== "all";

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("all");
  }, []);

  /* ---- Auth-loading gate (unchanged behavior, nicer visuals) ---- */
  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-32 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-zinc-200 border-t-zinc-900"
          role="status"
          aria-label="Loading"
        />
        <p className="mt-4 text-sm text-zinc-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* ---------------- Hero ---------------- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">Orders</p>
              <h1 className="mt-3 text-4xl font-bold text-white">My Orders</h1>
              <p className="mt-3 max-w-md text-white/60">
                Track your purchases, manage deliveries and revisit past orders.
              </p>
            </div>

            <Link
              href="/products"
              onPointerDown={continueShoppingRipple.onPointerDown}
              className="relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {continueShoppingRipple.rippleLayer}
              Continue Shopping
            </Link>
          </motion.div>

          {/* Stat cards */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Total Orders"
              value={stats.total}
              icon={<Package className="h-3.5 w-3.5" />}
              accent="bg-white/20"
              active={!loadingOrders}
              delay={0}
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={<Clock className="h-3.5 w-3.5" />}
              accent="bg-amber-400/30"
              active={!loadingOrders}
              delay={0.05}
            />
            <StatCard
              label="Delivered"
              value={stats.delivered}
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              accent="bg-emerald-400/30"
              active={!loadingOrders}
              delay={0.1}
            />
            <StatCard
              label="Cancelled"
              value={stats.cancelled}
              icon={<XCircle className="h-3.5 w-3.5" />}
              accent="bg-red-400/30"
              active={!loadingOrders}
              delay={0.15}
            />
            <StatCard
              label="Money Spent"
              value={stats.spent}
              isCurrency
              icon={<IndianRupee className="h-3.5 w-3.5" />}
              accent="bg-cyan-400/30"
              active={!loadingOrders}
              delay={0.2}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        {/* ---------------- Search & filters ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="-mt-6 rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm backdrop-blur-xl sm:p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 lg:max-w-xs lg:flex-1">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search by order number"
                aria-label="Search orders"
                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="rounded-md p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-zinc-500">
              <CalendarRange className="h-3.5 w-3.5 shrink-0" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                aria-label="Filter by date range"
                className="rounded-xl border border-zinc-200 bg-white px-2.5 py-2 text-[13px] text-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
              >
                <option value="all">All time</option>
                <option value="30d">Last 30 days</option>
                <option value="3m">Last 3 months</option>
                <option value="year">This year</option>
              </select>

              <ArrowUpDown className="ml-1 h-3.5 w-3.5 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                aria-label="Sort orders"
                className="rounded-xl border border-zinc-200 bg-white px-2.5 py-2 text-[13px] text-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="high">Amount: high to low</option>
                <option value="low">Amount: low to high</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            {STATUS_FILTERS.map((s) => (
              <FilterChip
                key={s}
                label={s}
                icon={s !== "All" ? STATUS_ICON[s] : undefined}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-1 shrink-0 text-[12.5px] font-medium text-zinc-400 underline-offset-2 hover:text-zinc-700 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </motion.div>

        {/* ---------------- AI insights ---------------- */}
        {!loadingOrders && orders.length > 0 && (
          <div className="mt-6">
            <AiInsightsCard
              totalOrders={stats.total}
              pendingCount={stats.pending}
              totalSpent={stats.spent}
            />
          </div>
        )}

        {/* ---------------- Order list ---------------- */}
        <div className="mt-6 grid gap-4">
          {loadingOrders ? (
            <div className="grid gap-4" role="status" aria-label="Loading orders">
              <SkeletonOrderCard delay={0} />
              <SkeletonOrderCard delay={0.1} />
              <SkeletonOrderCard delay={0.2} />
            </div>
          ) : orders.length === 0 ? (
            <NoOrdersYet />
          ) : filteredOrders.length === 0 ? (
            <NoFilterMatches onClear={clearFilters} />
          ) : (
            <motion.div layout className="grid gap-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index * 0.04, 0.3),
                    }}
                    whileHover={{ y: -4 }}
                  >
                    <OrderCard
                      orderId={order.order_number}
                      date={new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      total={order.total}
                      status={getStatusLabel(order)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}