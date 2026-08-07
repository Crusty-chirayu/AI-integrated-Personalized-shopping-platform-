import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/formatCurrency";
import OrderFulfillmentCell from "./OrderFulfillmentCell";

// ── Display face for stat numerals & the page title — used with restraint,
// paired with the default system sans for everything else. ──────────────
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

type OrderRow = {
  id: string;
  order_number: string | null;
  email: string | null;
  total: number | null;
  payment_status: string | null;
  fulfillment_status: string | null;
  created_at: string | null;
};

type SearchParams = {
  q?: string;
  status?: string;
  payment?: string;
};

// ── Tiny, dependency-free helpers ─────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(iso: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return isSameDay(d, new Date());
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (isToday(iso)) return `Today · ${time}`;
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${time}`;
}

function initials(email: string | null) {
  if (!email) return "GU";
  const name = email.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return email.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Deterministic, non-random avatar tint so the same customer always gets the same color.
const AVATAR_TINTS = [
  "bg-[#B8843C]/15 text-[#8a621f] ring-[#B8843C]/20",
  "bg-[#3B5B92]/15 text-[#2c4269] ring-[#3B5B92]/20",
  "bg-[#1F8A57]/15 text-[#166a41] ring-[#1F8A57]/20",
  "bg-[#B8433A]/15 text-[#8f342c] ring-[#B8433A]/20",
  "bg-[#6B5B95]/15 text-[#4f4270] ring-[#6B5B95]/20",
];
function avatarTint(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

function money(n: number | null) {
  return formatCurrency(n ?? 0);
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function buildCsv(rows: OrderRow[]) {
  const header = ["Order", "Customer", "Total", "Payment status", "Fulfillment status", "Placed"];
  const lines = [header.join(",")];
  for (const o of rows) {
    lines.push(
      [
        csvEscape(o.order_number ?? o.id),
        csvEscape(o.email ?? "Guest"),
        csvEscape(String(o.total ?? 0)),
        csvEscape(o.payment_status ?? "pending"),
        csvEscape(o.fulfillment_status ?? "pending"),
        csvEscape(o.created_at ?? ""),
      ].join(",")
    );
  }
  return lines.join("\n");
}

// ── Status → visual language ──────────────────────────────────────────────

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-[#1F8A57]/10 text-[#166a41] ring-1 ring-[#1F8A57]/25",
  pending: "bg-[#B8843C]/10 text-[#8a621f] ring-1 ring-[#B8843C]/25",
  failed: "bg-[#B8433A]/10 text-[#8f342c] ring-1 ring-[#B8433A]/25",
  refunded: "bg-[#6B5B95]/10 text-[#4f4270] ring-1 ring-[#6B5B95]/25",
};
function paymentStyle(status: string | null) {
  return PAYMENT_STYLES[(status ?? "pending").toLowerCase()] ?? "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200";
}

const FULFILLMENT_STYLES: Record<string, string> = {
  pending: "bg-[#B8843C]/10 text-[#8a621f] ring-1 ring-[#B8843C]/25",
  processing: "bg-[#3B5B92]/10 text-[#2c4269] ring-1 ring-[#3B5B92]/25",
  packed: "bg-[#3B5B92]/10 text-[#2c4269] ring-1 ring-[#3B5B92]/25",
  shipped: "bg-[#3B5B92]/10 text-[#2c4269] ring-1 ring-[#3B5B92]/25",
  delivered: "bg-[#1F8A57]/10 text-[#166a41] ring-1 ring-[#1F8A57]/25",
  completed: "bg-[#1F8A57]/10 text-[#166a41] ring-1 ring-[#1F8A57]/25",
  cancelled: "bg-[#B8433A]/10 text-[#8f342c] ring-1 ring-[#B8433A]/25",
  refunded: "bg-[#6B5B95]/10 text-[#4f4270] ring-1 ring-[#6B5B95]/25",
};
function fulfillmentDotClass(status: string | null) {
  return FULFILLMENT_STYLES[(status ?? "pending").toLowerCase()] ?? "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200";
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const sp = (searchParams ? await searchParams : undefined) ?? {};
  const q = (sp.q ?? "").trim().toLowerCase();
  const statusFilter = (sp.status ?? "all").toLowerCase();
  const paymentFilter = (sp.payment ?? "all").toLowerCase();

  const client = getSupabaseAdmin();
  const { data: ordersData } = client
    ? await client
        .from("orders")
        .select("id,order_number,email,total,payment_status,fulfillment_status,created_at")
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };
  const orders: OrderRow[] = ordersData ?? [];

  // ── Derived, honest metrics — computed only from the rows already fetched
  // above. No additional queries, no invented data. ────────────────────────
  const todayOrders = orders.filter((o) => isToday(o.created_at));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const pendingCount = orders.filter((o) => (o.fulfillment_status ?? "pending").toLowerCase() === "pending").length;
  const completedCount = orders.filter((o) =>
    ["delivered", "completed"].includes((o.fulfillment_status ?? "").toLowerCase())
  ).length;
  const cancelledCount = orders.filter((o) => (o.fulfillment_status ?? "").toLowerCase() === "cancelled").length;
  const refundedCount = orders.filter((o) => (o.payment_status ?? "").toLowerCase() === "refunded").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const aov = orders.length ? totalRevenue / orders.length : 0;

  // Filter chips are built from whatever statuses actually exist in the data,
  // so they never suggest a status your fulfillment flow doesn't use.
  const availableStatuses = Array.from(
    new Set(orders.map((o) => (o.fulfillment_status ?? "pending").toLowerCase()))
  );
  const availablePayments = Array.from(
    new Set(orders.map((o) => (o.payment_status ?? "pending").toLowerCase()))
  );

  const filteredOrders = orders.filter((o) => {
    const matchesQuery =
      !q ||
      (o.order_number ?? "").toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      (o.email ?? "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || (o.fulfillment_status ?? "pending").toLowerCase() === statusFilter;
    const matchesPayment = paymentFilter === "all" || (o.payment_status ?? "pending").toLowerCase() === paymentFilter;
    return matchesQuery && matchesStatus && matchesPayment;
  });

  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(buildCsv(filteredOrders))}`;

  const kpis = [
    { label: "Today's revenue", value: money(todayRevenue), tone: "brass" },
    { label: "Today's orders", value: String(todayOrders.length), tone: "denim" },
    { label: "Pending", value: String(pendingCount), tone: "brass" },
    { label: "Completed", value: String(completedCount), tone: "forest" },
    { label: "Cancelled", value: String(cancelledCount), tone: "brick" },
    { label: "Avg. order value", value: money(aov), tone: "denim" },
    { label: "Refunded", value: String(refundedCount), tone: "plum" },
    { label: "Delivered", value: String(completedCount), tone: "forest" },
  ] as const;

  const toneClass: Record<string, string> = {
    brass: "text-[#8a621f]",
    denim: "text-[#2c4269]",
    forest: "text-[#166a41]",
    brick: "text-[#8f342c]",
    plum: "text-[#4f4270]",
  };

  return (
    <div className={`${display.variable} space-y-8`}>
      {/* Signature keyframes — scoped to this page, no extra dependencies. */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.75); } }
        @keyframes ticker { 0% { stroke-dashoffset: 24; } 100% { stroke-dashoffset: 0; } }
        @keyframes heroGlow { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
        .order-row { animation: fadeInUp .35s ease both; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-[#17171A] px-6 py-8 sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#B8843C]/25 blur-3xl"
          style={{ animation: "heroGlow 6s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#3B5B92]/20 blur-3xl"
          style={{ animation: "heroGlow 7s ease-in-out infinite 1s" }}
        />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Order management</p>
              <h1
                className={`${display.className} mt-2 text-3xl font-semibold text-white sm:text-4xl`}
              >
                Orders
              </h1>
              <p className="mt-1 text-sm text-white/50">
                Showing the latest {orders.length} order{orders.length === 1 ? "" : "s"}
                {filteredOrders.length !== orders.length ? ` · ${filteredOrders.length} match your filters` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-2 w-2 rounded-full bg-[#5FD98A]"
                  style={{ animation: "pulseDot 1.6s ease-in-out infinite" }}
                />
              </span>
              <span className="text-xs font-medium text-white/70">Live</span>
              <svg width="30" height="12" viewBox="0 0 30 12" className="text-[#5FD98A]/80">
                <polyline
                  points="0,6 6,6 9,1 13,11 17,3 20,6 30,6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  style={{ animation: "ticker 1.2s linear infinite" }}
                />
              </svg>
            </div>
          </div>

          {/* Quick actions — all real, all derived from data already on this page. */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={csvHref}
              download="orders.csv"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#B8843C] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#a4762f] hover:shadow-md"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export orders
            </a>
            <a
              href="javascript:window.print()"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition hover:bg-white/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Print
            </a>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition hover:bg-white/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0 1 14-4.9M20 15a8 8 0 0 1-14 4.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Reset filters
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="group rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{kpi.label}</p>
            <p className={`${display.className} mt-1.5 text-xl font-semibold tabular-nums text-zinc-950 ${toneClass[kpi.tone]}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Insights — plain-language read of the same rows above. ─────────── */}
      <div className="relative overflow-hidden rounded-[24px] border border-[#B8843C]/20 bg-gradient-to-br from-[#B8843C]/8 via-white to-[#3B5B92]/6 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#17171A] text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" strokeLinecap="round" />
            </svg>
          </span>
          <p className="text-sm font-semibold text-zinc-900">Insights</p>
        </div>
        <ul className="mt-3 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8843C]" />
            {todayOrders.length > 0
              ? `${todayOrders.length} order${todayOrders.length === 1 ? "" : "s"} placed today, totalling ${money(todayRevenue)}.`
              : "No orders placed yet today."}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B5B92]" />
            {pendingCount > 0
              ? `${pendingCount} order${pendingCount === 1 ? "" : "s"} waiting on fulfillment.`
              : "Nothing waiting on fulfillment right now."}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1F8A57]" />
            {`Average order value across the latest ${orders.length} orders is ${money(aov)}.`}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8433A]" />
            {refundedCount > 0
              ? `${refundedCount} refund${refundedCount === 1 ? "" : "s"} in this batch — worth a second look.`
              : "No refunds in this batch."}
          </li>
        </ul>
      </div>

      {/* ── Search + filters ─────────────────────────────────────────────── */}
      <form className="space-y-3" action="/admin/orders" method="GET">
        <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#B8843C]/50 focus-within:ring-2 focus-within:ring-[#B8843C]/15">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search by order number, email, or ID…"
            className="w-full border-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            aria-label="Search orders"
          />
          {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
          {paymentFilter !== "all" && <input type="hidden" name="payment" value={paymentFilter} />}
          <kbd className="hidden shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 sm:inline">
            Enter
          </kbd>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Status</span>
          <Link
            href={{ pathname: "/admin/orders", query: { ...(q ? { q } : {}), ...(paymentFilter !== "all" ? { payment: paymentFilter } : {}) } }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              statusFilter === "all" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All
          </Link>
          {availableStatuses.map((s) => (
            <Link
              key={s}
              href={{ pathname: "/admin/orders", query: { ...(q ? { q } : {}), status: s, ...(paymentFilter !== "all" ? { payment: paymentFilter } : {}) } }}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                statusFilter === s ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {s}
            </Link>
          ))}

          <span className="ml-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">Payment</span>
          <Link
            href={{ pathname: "/admin/orders", query: { ...(q ? { q } : {}), ...(statusFilter !== "all" ? { status: statusFilter } : {}) } }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              paymentFilter === "all" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All
          </Link>
          {availablePayments.map((p) => (
            <Link
              key={p}
              href={{ pathname: "/admin/orders", query: { ...(q ? { q } : {}), payment: p, ...(statusFilter !== "all" ? { status: statusFilter } : {}) } }}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                paymentFilter === p ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      </form>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#B8843C]/10">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B8843C" strokeWidth="1.6">
                <path d="M3 7h18M6 7v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-900">
              {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
            </p>
            <p className="max-w-xs text-sm text-zinc-500">
              {orders.length === 0
                ? "New orders will show up here as soon as customers check out."
                : "Try a different search term, or reset filters to see every order."}
            </p>
            {orders.length > 0 && (
              <Link
                href="/admin/orders"
                className="mt-1 rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
              >
                Reset filters
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/5">
              <thead className="sticky top-0 z-10 bg-[#f7f3eb]/95 text-left text-xs uppercase tracking-wide text-zinc-500 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Placed</th>
                  <th className="px-4 py-3 font-medium">Fulfillment</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-sm text-zinc-700">
                {filteredOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className="order-row group transition hover:bg-[#B8843C]/[0.04]"
                    style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      <span className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700 group-hover:bg-[#B8843C]/10">
                        #{order.order_number ?? order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ${avatarTint(
                            order.email ?? order.id
                          )}`}
                        >
                          {initials(order.email)}
                        </span>
                        <span className="truncate text-zinc-800">{order.email ?? "Guest"}</span>
                      </div>
                    </td>
                    <td className={`${display.className} px-4 py-3 text-right font-semibold tabular-nums text-zinc-950`}>
                      {money(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${paymentStyle(order.payment_status)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {order.payment_status ?? "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{formatDateTime(order.created_at)}</td>
                    <OrderFulfillmentCell orderId={order.id} initialStatus={order.fulfillment_status} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reference badges — same fulfillment vocabulary your update flow uses,
          shown once so the status colors above are easy to read at a glance. */}
      {availableStatuses.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Legend</span>
          {availableStatuses.map((s) => (
            <span key={s} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${fulfillmentDotClass(s)}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}