import Link from "next/link";
import {
  BarChart3,
  Package2,
  ShoppingBag,
  Users2,
  Wallet,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Bell,
  Search,
  Settings,
  ChevronRight,
  Bot,
  Plus,
  FileText,
  Star,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/formatCurrency";
import DashboardCharts, {
  type SalesPoint,
  type OrdersRevenuePoint,
  type CategorySlice,
  type ProductBar,
} from "@/components/admin/DashboardCharts";

/* ------------------------------------------------------------------ */
/*  Existing data helpers — UNCHANGED. Do not touch queries or shape. */
/* ------------------------------------------------------------------ */

function capitalize(value: string | null | undefined) {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Formats an ISO date string into a short day label, e.g. "04 Aug".
 */
function formatDayLabel(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

/**
 * Returns just the YYYY-MM-DD portion of a timestamp, used as a grouping key.
 */
function dayKey(isoDate: string) {
  return new Date(isoDate).toISOString().slice(0, 10);
}

/**
 * Groups paid orders by calendar day and returns two aligned series:
 * a simple revenue-only series (for the Sales Overview chart) and a
 * combined revenue+order-count series (for the Orders vs Revenue chart).
 */
function buildDailySeries(
  orders: { total: number | null; created_at: string | null }[]
): { sales: SalesPoint[]; ordersVsRevenue: OrdersRevenuePoint[] } {
  const map = new Map<string, { revenue: number; orders: number }>();

  for (const order of orders) {
    if (!order.created_at) continue;
    const key = dayKey(order.created_at);
    const existing = map.get(key) ?? { revenue: 0, orders: 0 };
    existing.revenue += Number(order.total ?? 0);
    existing.orders += 1;
    map.set(key, existing);
  }

  const sortedKeys = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));

  const sales: SalesPoint[] = sortedKeys.map((key) => ({
    date: formatDayLabel(key),
    revenue: map.get(key)!.revenue,
  }));

  const ordersVsRevenue: OrdersRevenuePoint[] = sortedKeys.map((key) => ({
    date: formatDayLabel(key),
    revenue: map.get(key)!.revenue,
    orders: map.get(key)!.orders,
  }));

  return { sales, ordersVsRevenue };
}

/**
 * Shape returned by the order_items join query. Adjust field names here
 * if your schema differs.
 */
type OrderItemRow = {
  quantity: number | null;
  price: number | null;
  product_id: string | null;
  products: {
    title: string | null;
    category_id: string | null;
    categories: { name: string | null } | null;
  } | null;
};

/**
 * Aggregates order_items into a category revenue breakdown (with percentage
 * share of total revenue) and a top-selling-products breakdown (by units sold).
 */
function buildProductAndCategorySeries(items: OrderItemRow[]): {
  categoryData: CategorySlice[];
  topProductsData: ProductBar[];
} {
  const categoryMap = new Map<string, number>();
  const productMap = new Map<string, { title: string; units: number }>();

  for (const item of items) {
    const quantity = Number(item.quantity ?? 0);
    const price = Number(item.price ?? 0);
    const lineRevenue = quantity * price;

    const categoryName = item.products?.categories?.name
      ? capitalize(item.products.categories.name)
      : "Uncategorized";
    categoryMap.set(categoryName, (categoryMap.get(categoryName) ?? 0) + lineRevenue);

    const productId = item.product_id ?? "unknown";
    const productTitle = item.products?.title ?? "Unknown product";
    const existing = productMap.get(productId) ?? { title: productTitle, units: 0 };
    existing.units += quantity;
    productMap.set(productId, existing);
  }

  const totalCategoryRevenue = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);

  const categoryData: CategorySlice[] = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalCategoryRevenue > 0 ? (value / totalCategoryRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const topProductsData: ProductBar[] = Array.from(productMap.values())
    .map((p) => ({ name: p.title, units: p.units }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);

  return { categoryData, topProductsData };
}

/* ------------------------------------------------------------------ */
/*  NEW: pure, read-only helpers for the redesigned UI.               */
/*  These only reshape data that is already fetched above — no new    */
/*  queries, no API calls, no backend logic changed.                  */
/* ------------------------------------------------------------------ */

type Trend = { percent: number; direction: "up" | "down" | "flat" };

/** Splits a series in half and compares the two halves to get a simple, honest trend. */
function computeTrend(values: number[]): Trend {
  if (values.length < 2) return { percent: 0, direction: "flat" };
  const midpoint = Math.ceil(values.length / 2);
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(midpoint);
  const firstSum = firstHalf.reduce((a, b) => a + b, 0);
  const secondSum = secondHalf.reduce((a, b) => a + b, 0);

  if (firstSum === 0 && secondSum === 0) return { percent: 0, direction: "flat" };
  if (firstSum === 0) return { percent: 100, direction: "up" };

  const percent = ((secondSum - firstSum) / firstSum) * 100;
  return {
    percent,
    direction: percent > 1 ? "up" : percent < -1 ? "down" : "flat",
  };
}

/** Builds a normalized SVG path for a lightweight inline sparkline. */
function buildSparklinePath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function getGreeting(hour: number) {
  if (hour < 5) return "Working late, admin?";
  if (hour < 12) return "Good morning, admin.";
  if (hour < 17) return "Good afternoon, admin.";
  if (hour < 21) return "Good evening, admin.";
  return "Burning the midnight oil, admin?";
}

/** Deterministic, transparent health score from real signals — not a fabricated number. */
function computeStoreHealth({
  lowStockCount,
  revenueDirection,
  ordersDirection,
}: {
  lowStockCount: number;
  revenueDirection: Trend["direction"];
  ordersDirection: Trend["direction"];
}) {
  let score = 75;
  score -= Math.min(lowStockCount * 4, 30);
  score += revenueDirection === "up" ? 12 : revenueDirection === "down" ? -12 : 0;
  score += ordersDirection === "up" ? 8 : ordersDirection === "down" ? -8 : 0;
  score = Math.max(5, Math.min(99, Math.round(score)));

  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Healthy" : score >= 40 ? "Needs attention" : "At risk";
  const tone: "emerald" | "sky" | "amber" | "rose" =
    score >= 80 ? "emerald" : score >= 60 ? "sky" : score >= 40 ? "amber" : "rose";

  return { score, label, tone };
}

const TONE_HEX: Record<"emerald" | "sky" | "amber" | "rose", string> = {
  emerald: "#10b981",
  sky: "#0ea5e9",
  amber: "#f59e0b",
  rose: "#f43f5e",
};

/** Rule-based insight sentences generated from real, already-fetched data. */
function buildInsights({
  revenueTrend,
  ordersTrend,
  topCategory,
  topProductName,
  lowStockCount,
  projectedWeeklyRevenue,
}: {
  revenueTrend: Trend;
  ordersTrend: Trend;
  topCategory?: { name: string; percentage: number };
  topProductName?: string;
  lowStockCount: number;
  projectedWeeklyRevenue: number;
}) {
  const insights: string[] = [];

  if (revenueTrend.direction === "up") {
    insights.push(`Revenue climbed ${revenueTrend.percent.toFixed(1)}% across the most recent period.`);
  } else if (revenueTrend.direction === "down") {
    insights.push(`Revenue dipped ${Math.abs(revenueTrend.percent).toFixed(1)}% — worth a closer look.`);
  } else {
    insights.push("Revenue has held steady across the recent period.");
  }

  if (topCategory) {
    insights.push(`${topCategory.name} leads all categories, driving ${topCategory.percentage.toFixed(0)}% of revenue.`);
  }

  if (topProductName) {
    insights.push(`${topProductName} is the top seller by units this period.`);
  }

  if (lowStockCount > 0) {
    insights.push(`${lowStockCount} product${lowStockCount === 1 ? " is" : "s are"} running low — consider restocking soon.`);
  } else {
    insights.push("No products are currently low on stock.");
  }

  if (ordersTrend.direction === "up") {
    insights.push(`Order volume is trending up ${ordersTrend.percent.toFixed(1)}%, a sign of growing demand.`);
  }

  insights.push(`At the current pace, projected revenue for the next 7 days is ${formatCurrency(projectedWeeklyRevenue)}.`);

  return insights.slice(0, 5);
}

/**
 * Independent aggregation for the new "Top selling products" table.
 * Built purely from the already-fetched order_items — does not touch or
 * rename buildProductAndCategorySeries / topProductsData used by the charts.
 */
function computeTopProductsDetailed(
  items: OrderItemRow[],
  lowStockProducts: { id: string; title: string; stock_quantity: number | null }[]
) {
  const map = new Map<string, { title: string; units: number; revenue: number }>();

  for (const item of items) {
    const quantity = Number(item.quantity ?? 0);
    const price = Number(item.price ?? 0);
    const productId = item.product_id ?? "unknown";
    const title = item.products?.title ?? "Unknown product";
    const existing = map.get(productId) ?? { title, units: 0, revenue: 0 };
    existing.units += quantity;
    existing.revenue += quantity * price;
    map.set(productId, existing);
  }

  const totalUnits = Array.from(map.values()).reduce((a, p) => a + p.units, 0) || 1;
  const totalRevenue = Array.from(map.values()).reduce((a, p) => a + p.revenue, 0) || 1;
  const lowStockById = new Map(lowStockProducts.map((p) => [p.id, p.stock_quantity]));

  return Array.from(map.entries())
    .map(([id, p]) => {
      const unitShare = p.units / totalUnits;
      const revenueShare = p.revenue / totalRevenue;
      return {
        id,
        title: p.title,
        units: p.units,
        revenue: p.revenue,
        revenueSharePercent: revenueShare * 100,
        popularityScore: Math.round((unitShare * 0.5 + revenueShare * 0.5) * 100),
        stockQuantity: lowStockById.get(id) ?? null,
      };
    })
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 6);
}

/* ------------------------------------------------------------------ */
/*  NEW: small presentational building blocks (server-safe, no hooks) */
/* ------------------------------------------------------------------ */

function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  return (
    <svg viewBox="0 0 100 32" className={className} preserveAspectRatio="none">
      <path
        d={buildSparklinePath(values, 100, 32)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendBadge({ trend }: { trend?: Trend }) {
  if (!trend) return null;
  return (
    <div className="mt-3 flex items-center gap-1.5 text-xs">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
          trend.direction === "up"
            ? "bg-emerald-50 text-emerald-600"
            : trend.direction === "down"
            ? "bg-rose-50 text-rose-600"
            : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {trend.direction === "up" ? (
          <TrendingUp className="h-3 w-3" />
        ) : trend.direction === "down" ? (
          <TrendingDown className="h-3 w-3" />
        ) : null}
        {trend.direction === "flat" ? "Flat" : `${trend.percent > 0 ? "+" : ""}${trend.percent.toFixed(1)}%`}
      </span>
      <span className="text-zinc-400">vs. earlier in period</span>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  accent,
  trend,
  sparkline,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  trend?: Trend;
  sparkline?: number[];
  delay?: number;
}) {
  return (
    <div
      className="cartiq-rise group relative overflow-hidden rounded-[24px] border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30`}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{label}</p>
        <div
          className={`rounded-full bg-gradient-to-br ${accent} p-2 text-white shadow-sm transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
        {sparkline && sparkline.length > 1 && (
          <Sparkline values={sparkline} className="h-8 w-20 shrink-0 text-zinc-300 transition-colors duration-300 group-hover:text-zinc-400" />
        )}
      </div>
      <TrendBadge trend={trend} />
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon,
  accent,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm transition-transform duration-300 group-hover:scale-105`}
      >
        {icon}
      </span>
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <ChevronRight className="ml-auto h-4 w-4 text-zinc-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-zinc-500" />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function AdminHomePage() {
  const supabase = getSupabaseAdmin();

  const [ordersResult, profilesCountResult, recentOrdersResult, lowStockResult, orderItemsResult] =
    supabase
      ? await Promise.all([
          supabase
            .from("orders")
            .select("total, created_at")
            .eq("payment_status", "paid"),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase
            .from("orders")
            .select("order_number, payment_status, fulfillment_status, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("products")
            .select("id, title, stock_quantity")
            .lte("stock_quantity", 5)
            .order("stock_quantity", { ascending: true }),
          supabase
            .from("order_items")
            .select(
              "quantity, price, product_id, products(title, category_id, categories(name)), orders!inner(payment_status)"
            )
            .eq("orders.payment_status", "paid"),
        ])
      : [
          { data: [], error: null },
          { count: 0, error: null },
          { data: [], error: null },
          { data: [], error: null },
          { data: [], error: null },
        ];

  const orders = ordersResult.data ?? [];
  const orderCount = orders.length;
  const revenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const customerCount = profilesCountResult.count ?? 0;
  const averageOrder = orderCount > 0 ? revenue / orderCount : 0;

  const recentOrders = recentOrdersResult.data ?? [];
  const lowStockProducts = lowStockResult.data ?? [];
  const orderItems = (orderItemsResult.data ?? []) as unknown as OrderItemRow[];

  const { sales: salesData, ordersVsRevenue: ordersRevenueData } = buildDailySeries(orders);
  const { categoryData, topProductsData } = buildProductAndCategorySeries(orderItems);

  // ---- Derived, UI-only intelligence — computed entirely from the data above ----
  const revenueTrend = computeTrend(salesData.map((d) => d.revenue));
  const ordersTrend = computeTrend(ordersRevenueData.map((d) => d.orders));
  const topCategory = categoryData[0];
  const topProductSimple = topProductsData[0];
  const avgDailyRevenue =
    salesData.length > 0 ? salesData.reduce((sum, d) => sum + d.revenue, 0) / salesData.length : 0;
  const projectedWeeklyRevenue = avgDailyRevenue * 7;

  const storeHealth = computeStoreHealth({
    lowStockCount: lowStockProducts.length,
    revenueDirection: revenueTrend.direction,
    ordersDirection: ordersTrend.direction,
  });

  const insights = buildInsights({
    revenueTrend,
    ordersTrend,
    topCategory,
    topProductName: topProductSimple?.name,
    lowStockCount: lowStockProducts.length,
    projectedWeeklyRevenue,
  });

  const topProductsDetailed = computeTopProductsDetailed(orderItems, lowStockProducts);

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const dateLabel = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeLabel = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const kpiCards: {
    label: string;
    value: string;
    icon: React.ReactNode;
    accent: string;
    trend?: Trend;
    sparkline?: number[];
  }[] = [
    {
      label: "Revenue",
      value: formatCurrency(revenue),
      icon: <BarChart3 className="h-4 w-4" />,
      accent: "from-emerald-400 to-teal-500",
      trend: revenueTrend,
      sparkline: salesData.map((d) => d.revenue),
    },
    {
      label: "Orders",
      value: orderCount.toLocaleString("en-IN"),
      icon: <ShoppingBag className="h-4 w-4" />,
      accent: "from-sky-400 to-indigo-500",
      trend: ordersTrend,
      sparkline: ordersRevenueData.map((d) => d.orders),
    },
    {
      label: "Customers",
      value: customerCount.toLocaleString("en-IN"),
      icon: <Users2 className="h-4 w-4" />,
      accent: "from-violet-400 to-fuchsia-500",
    },
    {
      label: "Avg. order",
      value: formatCurrency(averageOrder),
      icon: <Wallet className="h-4 w-4" />,
      accent: "from-amber-400 to-orange-500",
    },
    {
      label: "Low stock",
      value: lowStockProducts.length.toLocaleString("en-IN"),
      icon: <AlertTriangle className="h-4 w-4" />,
      accent:
        lowStockProducts.length > 0 ? "from-rose-400 to-red-500" : "from-zinc-300 to-zinc-400",
    },
  ];

  return (
    <div className="relative space-y-8">
      {/* Scoped animation keyframes — CSS-only so this stays a server component. */}
      <style>{`
        @keyframes cartiq-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -24px) scale(1.06); }
        }
        @keyframes cartiq-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cartiq-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.35); }
          100% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        }
        @keyframes cartiq-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .cartiq-rise { animation: cartiq-rise 0.6s ease both; }
        .cartiq-float { animation: cartiq-float 11s ease-in-out infinite; }
        .cartiq-pulse-dot { animation: cartiq-pulse-ring 1.8s ease-out infinite; }
        .cartiq-shimmer-text {
          background: linear-gradient(90deg, #a1a1aa 0%, #52525b 40%, #a1a1aa 80%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: cartiq-shimmer 3.5s linear infinite;
        }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .cartiq-rise, .cartiq-float, .cartiq-pulse-dot, .cartiq-shimmer-text { animation: none; }
        }
      `}</style>

      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="cartiq-float absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div
          className="cartiq-float absolute -right-16 top-10 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="cartiq-float absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* ---------------- Hero header ---------------- */}
      <div className="cartiq-rise relative overflow-hidden rounded-[28px] border border-black/5 bg-gradient-to-br from-white via-[#f7f3eb] to-[#f0ead9] p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-lg font-semibold text-white shadow-md">
              A
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Overview</p>
              <h1 className="mt-1 text-2xl font-semibold text-zinc-950 md:text-3xl">{greeting}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
                <span>{dateLabel}</span>
                <span className="text-zinc-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {timeLabel}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-0.5 font-medium text-zinc-600 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="cartiq-pulse-dot absolute inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  System live
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium shadow-sm ${
                    storeHealth.tone === "emerald"
                      ? "bg-emerald-50 text-emerald-700"
                      : storeHealth.tone === "sky"
                      ? "bg-sky-50 text-sky-700"
                      : storeHealth.tone === "amber"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Store health: {storeHealth.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative hidden items-center md:flex">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-400" />
              <input
                type="search"
                placeholder="Quick search…"
                className="w-56 rounded-full border border-black/5 bg-white/80 py-2 pl-9 pr-4 text-sm text-zinc-700 shadow-sm outline-none transition focus:w-64 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-200"
              />
            </label>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white/80 text-zinc-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
            >
              <Bell className="h-4 w-4" />
              {lowStockProducts.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>

            <details className="relative">
              <summary className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-white/80 text-zinc-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300">
                <Settings className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-black/5 bg-white p-2 shadow-lg">
                <Link href="/admin/settings" className="block rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                  Store settings
                </Link>
                <Link href="/admin/profile" className="block rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                  Admin profile
                </Link>
                <Link href="/admin/team" className="block rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                  Team access
                </Link>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* ---------------- KPI grid ---------------- */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((card, i) => (
          <KpiCard key={card.label} delay={i * 80} {...card} />
        ))}
      </div>

      {/* ---------------- AI insights + quick actions ---------------- */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="cartiq-rise relative overflow-hidden rounded-[28px] border border-black/5 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 text-white shadow-sm md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <p className="cartiq-shimmer-text text-sm font-medium uppercase tracking-[0.2em]">
                  AI business insights
                </p>
              </div>
              <p className="mt-2 max-w-md text-sm text-white/60">
                Automatically generated from this store&apos;s live orders, categories, and inventory —
                refreshed on every visit.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${TONE_HEX[storeHealth.tone]} ${storeHealth.score * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
                }}
              >
                <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-zinc-950">
                  <span className="text-xl font-semibold">{storeHealth.score}</span>
                  <span className="text-[9px] uppercase tracking-wide text-white/50">Health</span>
                </div>
              </div>
            </div>
          </div>

          <ul className="relative mt-6 space-y-2.5">
            {insights.map((insight, i) => (
              <li
                key={i}
                className="cartiq-rise flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/85 backdrop-blur-sm"
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="cartiq-rise rounded-[28px] border border-black/5 bg-white p-6 shadow-sm" style={{ animationDelay: "120ms" }}>
          <h2 className="text-lg font-semibold text-zinc-950">Quick actions</h2>
          <div className="mt-5 grid gap-3">
            <QuickAction href="/admin/products/new" label="Add product" icon={<Plus className="h-4 w-4" />} accent="from-emerald-400 to-teal-500" />
            <QuickAction href="/admin/reports" label="Generate report" icon={<FileText className="h-4 w-4" />} accent="from-sky-400 to-indigo-500" />
            <QuickAction href="/admin/orders" label="View orders" icon={<ShoppingBag className="h-4 w-4" />} accent="from-amber-400 to-orange-500" />
            <QuickAction href="/admin/customers" label="Customers" icon={<Users2 className="h-4 w-4" />} accent="from-violet-400 to-fuchsia-500" />
            <QuickAction href="/admin/products" label="Inventory" icon={<Package2 className="h-4 w-4" />} accent="from-rose-400 to-red-500" />
            <QuickAction href="/admin/ai-assistant" label="AI assistant" icon={<Bot className="h-4 w-4" />} accent="from-zinc-700 to-zinc-950" />
            <QuickAction href="/admin/settings" label="Settings" icon={<Settings className="h-4 w-4" />} accent="from-zinc-400 to-zinc-600" />
          </div>
        </div>
      </div>

      {/* ---------------- Existing analytics charts — untouched contract ---------------- */}
      <div className="cartiq-rise space-y-2" style={{ animationDelay: "160ms" }}>
        <h2 className="text-lg font-semibold text-zinc-950">Analytics</h2>
        <p className="text-sm text-zinc-500">Revenue, orders, and category performance over time.</p>
      </div>
      <DashboardCharts
        salesData={salesData}
        ordersRevenueData={ordersRevenueData}
        categoryData={categoryData}
        topProductsData={topProductsData}
        lowStockSlot={
          <div className="cartiq-rise rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h2 className="text-lg font-semibold text-zinc-950">Low stock alerts</h2>
            </div>
            <div className="mt-6 space-y-3">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => {
                  const urgent = (product.stock_quantity ?? 0) <= 2;
                  return (
                    <div
                      key={product.id}
                      className="group rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{product.title}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            urgent ? "bg-red-600 text-white" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {urgent ? "Critical" : "Low"} · {product.stock_quantity} left
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-red-100">
                        <div
                          className={`h-full rounded-full ${urgent ? "bg-red-600" : "bg-red-400"}`}
                          style={{ width: `${Math.min(100, ((product.stock_quantity ?? 0) / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  No low stock products.
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* ---------------- Top selling products (new, from existing order_items data) ---------------- */}
      <div className="cartiq-rise rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Top selling products</h2>
            <p className="text-sm text-zinc-500">Ranked by a blended score of units sold and revenue share.</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium">Units sold</th>
                <th className="px-4 py-2 font-medium">Revenue</th>
                <th className="px-4 py-2 font-medium">Revenue share</th>
                <th className="px-4 py-2 font-medium">Stock</th>
                <th className="px-4 py-2 font-medium">Popularity</th>
              </tr>
            </thead>
            <tbody>
              {topProductsDetailed.length > 0 ? (
                topProductsDetailed.map((product, i) => (
                  <tr
                    key={product.id}
                    className="group rounded-2xl bg-[#f7f3eb] text-zinc-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <td className="rounded-l-2xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-950 text-xs font-semibold text-white">
                          {product.title.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium text-zinc-900">{product.title}</p>
                          <p className="text-xs text-zinc-400">Rank #{i + 1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.units.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">{formatCurrency(product.revenue)}</td>
                    <td className="px-4 py-3">{product.revenueSharePercent.toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      {product.stockQuantity !== null ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          {product.stockQuantity} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          In stock
                        </span>
                      )}
                    </td>
                    <td className="rounded-r-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                            style={{ width: `${product.popularityScore}%` }}
                          />
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
                          <Star className="h-3 w-3 text-amber-400" /> {product.popularityScore}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="rounded-2xl bg-[#f7f3eb] px-4 py-4 text-center text-zinc-500">
                    No sales data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- Recent orders — restyled as a timeline ---------------- */}
      <div className="cartiq-rise rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Recent orders</h2>
        <div className="mt-6 space-y-1">
          {recentOrders.length > 0 ? (
            recentOrders.map((order, i) => (
              <div key={order.order_number} className="relative flex items-start gap-4 pb-5 pl-2 last:pb-0">
                {i !== recentOrders.length - 1 && (
                  <span className="absolute left-[19px] top-8 h-full w-px bg-zinc-200" aria-hidden="true" />
                )}
                <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 text-xs font-semibold text-white shadow-sm">
                  {order.order_number?.slice(-2) ?? "—"}
                </span>
                <div className="flex flex-1 flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#f7f3eb] px-4 py-3 text-sm text-zinc-600 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                  <div>
                    <p className="font-medium text-zinc-900">{order.order_number}</p>
                    {order.created_at && (
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {new Date(order.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.payment_status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {capitalize(order.payment_status)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.fulfillment_status === "fulfilled" || order.fulfillment_status === "delivered"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {capitalize(order.fulfillment_status)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-[#f7f3eb] px-4 py-3 text-sm text-zinc-600">No recent orders.</div>
          )}
        </div>
      </div>

      {/* ---------------- Floating AI assistant widget (CSS-only, no client JS needed) ---------------- */}
      <details className="group fixed bottom-6 right-6 z-50">
        <summary className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-white shadow-lg transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 group-open:scale-95">
          <Bot className="h-6 w-6" />
        </summary>
        <div className="absolute bottom-16 right-0 w-80 rounded-[24px] border border-black/5 bg-white p-5 shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-semibold text-zinc-950">CartIQ AI Assistant</p>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Store summary based on live data</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-[#f7f3eb] px-3 py-2">
              <p className="text-base font-semibold text-zinc-950">{formatCurrency(revenue)}</p>
              <p className="text-[11px] text-zinc-500">Revenue</p>
            </div>
            <div className="rounded-xl bg-[#f7f3eb] px-3 py-2">
              <p className="text-base font-semibold text-zinc-950">{orderCount.toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-zinc-500">Orders</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Next best action</p>
            <p className="rounded-xl bg-zinc-950 px-3 py-2.5 text-xs text-white">
              {lowStockProducts.length > 0
                ? `Restock ${lowStockProducts[0].title} — only ${lowStockProducts[0].stock_quantity} left.`
                : "Inventory looks healthy — no urgent action needed right now."}
            </p>
          </div>

          <Link
            href="/admin/ai-assistant"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Open full assistant <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </details>
    </div>
  );
}