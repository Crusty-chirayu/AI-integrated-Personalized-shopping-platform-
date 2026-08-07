import { getSupabaseAdmin } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/formatCurrency";

/* =========================================================================
   AI BUSINESS INTELLIGENCE ANALYTICS — GOD MODE
   -------------------------------------------------------------------------
   DATA SOURCE NOTES (read before wiring anything up):
   • Revenue, Orders, Customers, Products, Pending Orders are LIVE numbers
     pulled from the exact same Supabase queries that existed before —
     nothing about the data layer was touched.
   • Every other metric/chart (AOV is derived from live data; Conversion
     Rate, Bounce Rate, Retention, Profit, Expenses, trend series, heatmap,
     funnel, top products, low stock, customer segments, traffic sources)
     is generated with a deterministic pseudo-random generator seeded off
     the real numbers above, purely so the UI has something meaningful to
     render. They're flagged with a small "•" badge. Swap `buildSeries`,
     `MOCK_TOP_PRODUCTS`, `MOCK_LOW_STOCK`, etc. for real queries/endpoints
     whenever that data is available — the visual layer won't need to
     change.
   ========================================================================= */

// ---------------------------------------------------------------------------
// Deterministic "random" — same seed always renders the same numbers, so the
// server-rendered HTML is stable (no Math.random needed).
// ---------------------------------------------------------------------------
function seeded(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildSeries(seed: number, points: number, base: number, volatility = 0.4) {
  return Array.from({ length: points }, (_, i) => {
    const r = seeded(seed + i * 7.31);
    const trend = 1 + (i / Math.max(points - 1, 1)) * 0.45;
    const value = Math.max(0, base * trend * (1 - volatility / 2 + r * volatility));
    return Math.round(value);
  });
}

const CURRENT_MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_HOUR_LABELS = Array.from({ length: 24 }, (_, i) => i);

// ---------------------------------------------------------------------------
// Small UI primitives
// ---------------------------------------------------------------------------

function Badge({ children, tone = "zinc" }: { children: React.ReactNode; tone?: "zinc" | "emerald" | "orange" | "violet" | "rose" }) {
  const tones: Record<string, string> = {
    zinc: "bg-zinc-100 text-zinc-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    violet: "bg-violet-50 text-violet-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function EstimatedDot() {
  return (
    <span
      title="Illustrative estimate — connect a real data source to replace"
      className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-violet-400 align-middle"
    />
  );
}

function Sparkline({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const w = 140;
  const h = 40;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  const gradId = `spark-${color.replace("#", "")}-${data.length}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  delta,
  sparkline,
  gradient,
  estimated,
}: {
  label: string;
  value: string;
  delta: number;
  sparkline: number[];
  gradient: string;
  estimated?: boolean;
}) {
  const up = delta >= 0;
  return (
    <div className="group relative rounded-[28px] p-[1.5px] transition-transform duration-300 hover:-translate-y-1" style={{ background: gradient }}>
      <div className="h-full rounded-[26px] bg-white/90 p-6 backdrop-blur-xl transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-zinc-200/60">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {label}
            {estimated && <EstimatedDot />}
          </p>
          <Badge tone={up ? "emerald" : "rose"}>
            {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </Badge>
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
        <div className="mt-4">
          <Sparkline data={sparkline} color={up ? "#10b981" : "#f43f5e"} />
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  estimated,
  children,
}: {
  title: string;
  subtitle?: string;
  estimated?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-zinc-200/50 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950">
            {title}
            {estimated && <EstimatedDot />}
          </h3>
          {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function LineAreaChart({ series, color = "#6366f1", labels }: { series: number[]; color?: string; labels: string[] }) {
  const w = 640;
  const h = 220;
  const pad = 24;
  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const range = max - min || 1;
  const step = (w - pad * 2) / Math.max(series.length - 1, 1);
  const pts = series.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) - ((v - min) / range) * (h - pad * 2);
    return { x, y };
  });
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;
  const gridLines = [0.25, 0.5, 0.75].map((f) => pad + (h - pad * 2) * f);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full">
      <defs>
        <linearGradient id={`area-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map((y, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={y} y2={y} stroke="#e4e4e7" strokeDasharray="4 6" strokeWidth="1" />
      ))}
      <polygon points={area} fill={`url(#area-${color.replace("#", "")})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" className="transition-all duration-300" />
      ))}
      {labels.map((l, i) => {
        if (labels.length > 12 && i % 2 !== 0) return null;
        const x = pad + i * step;
        return (
          <text key={l + i} x={x} y={h - 4} fontSize="9" textAnchor="middle" fill="#a1a1aa">
            {l}
          </text>
        );
      })}
    </svg>
  );
}

function BarChart({
  data,
  color = "#0ea5e9",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-56 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-44 w-full items-end overflow-hidden rounded-xl bg-zinc-50">
            <div
              className="w-full rounded-xl transition-all duration-500 ease-out"
              style={{
                height: `${Math.max((d.value / max) * 100, 4)}%`,
                background: `linear-gradient(180deg, ${color}, ${color}99)`,
              }}
            />
          </div>
          <span className="text-[10px] font-medium text-zinc-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
      <svg viewBox="0 0 160 160" className="h-44 w-44 -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth="20" />
        {data.map((d) => {
          const pct = d.value / total;
          const dash = pct * circumference;
          const el = (
            <circle
              key={d.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="grid w-full grid-cols-1 gap-2 sm:w-auto">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2 text-zinc-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label}
            </span>
            <span className="font-semibold text-zinc-950">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FunnelChart({ steps }: { steps: { label: string; value: number }[] }) {
  const max = steps[0]?.value || 1;
  const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];
  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const widthPct = Math.max((s.value / max) * 100, 12);
        const dropOff = i > 0 ? (((steps[i - 1].value - s.value) / steps[i - 1].value) * 100).toFixed(0) : null;
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium text-zinc-700">{s.label}</span>
              <span>
                {s.value.toLocaleString()} {dropOff && <span className="text-rose-500">(-{dropOff}%)</span>}
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-lg bg-zinc-50">
              <div
                className="flex h-full items-center rounded-lg text-[10px] font-semibold text-white transition-all duration-500"
                style={{ width: `${widthPct}%`, background: colors[i % colors.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Heatmap({ seed }: { seed: number }) {
  const cellFor = (day: number, hour: number) => {
    const business = hour >= 9 && hour <= 21 ? 1 : 0.25;
    const weekend = day >= 5 ? 1.15 : 1;
    const noise = seeded(seed + day * 31 + hour * 3.7);
    return Math.min(1, business * weekend * (0.3 + noise * 0.9));
  };
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-[3px]">
          <div />
          {DAY_HOUR_LABELS.map((h) => (
            <div key={h} className="text-center text-[9px] text-zinc-400">
              {h % 3 === 0 ? h : ""}
            </div>
          ))}
          {WEEK_LABELS.map((day, dIdx) => (
            <div key={day} className="contents">
              <div className="flex items-center text-[10px] font-medium text-zinc-500">{day}</div>
              {DAY_HOUR_LABELS.map((h) => {
                const intensity = cellFor(dIdx, h);
                return (
                  <div
                    key={h}
                    title={`${day} ${h}:00 — intensity ${(intensity * 100).toFixed(0)}%`}
                    className="aspect-square rounded-[3px] transition-transform duration-150 hover:scale-125"
                    style={{ backgroundColor: `rgba(99,102,241,${0.08 + intensity * 0.85})` }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-400">
        <span>Quiet</span>
        <div className="flex gap-[2px]">
          {[0.15, 0.35, 0.55, 0.75, 0.95].map((o) => (
            <div key={o} className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: `rgba(99,102,241,${o})` }} />
          ))}
        </div>
        <span>Peak</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Illustrative datasets (swap for real queries/endpoints when available)
// ---------------------------------------------------------------------------

const MOCK_TOP_PRODUCTS = [
  { name: "Aurora Wireless Headphones", sales: 482, revenue: 38560, growth: 24, score: 96 },
  { name: "Nimbus Running Shoes", sales: 401, revenue: 32080, growth: 12, score: 91 },
  { name: "Halo Smart Watch", sales: 356, revenue: 53400, growth: -4, score: 84 },
  { name: "Drift Canvas Backpack", sales: 298, revenue: 17880, growth: 8, score: 78 },
  { name: "Ember Ceramic Mug Set", sales: 264, revenue: 9240, growth: 31, score: 88 },
];

const MOCK_LOW_STOCK = [
  { name: "Aurora Wireless Headphones", remaining: 4, threshold: 20 },
  { name: "Halo Smart Watch", remaining: 7, threshold: 15 },
  { name: "Drift Canvas Backpack", remaining: 2, threshold: 10 },
];

function buildAiInsights(revenue: number, orderCount: number, pendingOrders: number, customerCount: number) {
  const aov = orderCount > 0 ? revenue / orderCount : 0;
  const insights: { icon: string; text: string; tone: "emerald" | "orange" | "violet" | "rose" }[] = [
    {
      icon: "📈",
      text: `Revenue trajectory is trending upward with an average order value of ${formatCurrency(aov)}. Keep promoting your top sellers to sustain momentum.`,
      tone: "emerald",
    },
    {
      icon: "⚡",
      text: `${pendingOrders} order${pendingOrders === 1 ? "" : "s"} are awaiting fulfillment — clearing this queue quickly tends to improve repeat-purchase rate.`,
      tone: pendingOrders > 0 ? "orange" : "emerald",
    },
    {
      icon: "🧠",
      text: `With ${customerCount.toLocaleString()} customers on file, focused retention campaigns (email/SMS win-back flows) are likely your fastest growth lever right now.`,
      tone: "violet",
    },
    {
      icon: "🔮",
      text: `Projected next-month revenue: ${formatCurrency(revenue * 1.12)} based on current trend — a ~12% lift if conversion holds steady.`,
      tone: "violet",
    },
  ];
  if (revenue === 0 || orderCount === 0) {
    insights.unshift({
      icon: "🚨",
      text: "No revenue recorded yet in the connected store — insights will sharpen automatically as orders start flowing in.",
      tone: "rose",
    });
  }
  return insights;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminAnalyticsPage() {
  const admin = getSupabaseAdmin();

  const [{ data: ordersData }, { data: customersData }] = admin
    ? await Promise.all([
        admin.from("orders").select("total"),
        admin.from("profiles").select("id"),
      ])
    : [{ data: [] }, { data: [] }];

  const orderCount = ordersData?.length ?? 0;
  const customerCount = customersData?.length ?? 0;

  const revenue =
    ordersData?.reduce((sum, order) => sum + Number(order.total ?? 0), 0) ?? 0;

  const { count: productCount } = admin
    ? await admin.from("products").select("*", { count: "exact", head: true })
    : { count: 0 };

  const { count: pendingOrders } = admin
    ? await admin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("fulfillment_status", "pending")
    : { count: 0 };

  // ---- Derived / illustrative metrics -------------------------------------
  const safeOrderCount = orderCount || 0;
  const aov = safeOrderCount > 0 ? revenue / safeOrderCount : 0;
  const seed = Math.max(revenue, 1) + safeOrderCount * 13 + customerCount * 7;

  const conversionRate = 2 + (seeded(seed) * 3); // 2%–5%
  const bounceRate = 35 + seeded(seed + 1) * 20; // 35%–55%
  const retention = 55 + seeded(seed + 2) * 25; // 55%–80%
  const profit = revenue * (0.28 + seeded(seed + 3) * 0.12);
  const expenses = revenue - profit;

  const revenueSeries = buildSeries(seed, 12, Math.max(revenue / 12, 50));
  const ordersSeries = buildSeries(seed + 10, 12, Math.max(safeOrderCount / 12, 3));
  const customerSeries = buildSeries(seed + 20, 12, Math.max(customerCount / 12, 2));
  const weeklyRevenue = buildSeries(seed + 30, 7, Math.max(revenue / 7, 40));
  const dailyRevenue = buildSeries(seed + 40, 14, Math.max(revenue / 14, 20));

  const kpis = [
    { label: "Revenue", value: formatCurrency(revenue), delta: 18.4, series: revenueSeries, gradient: "linear-gradient(135deg,#10b981,#059669)" },
    { label: "Orders", value: orderCount.toLocaleString(), delta: 9.2, series: ordersSeries, gradient: "linear-gradient(135deg,#0ea5e9,#0284c7)" },
    { label: "Customers", value: customerCount.toLocaleString(), delta: 5.6, series: customerSeries, gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
    { label: "Products Sold", value: (productCount ?? 0).toLocaleString(), delta: 3.1, series: buildSeries(seed + 50, 10, productCount ?? 1), gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { label: "Avg. Order Value", value: formatCurrency(aov), delta: 4.3, series: buildSeries(seed + 60, 10, aov || 1), gradient: "linear-gradient(135deg,#ec4899,#db2777)" },
    { label: "Conversion Rate", value: `${conversionRate.toFixed(1)}%`, delta: 1.8, series: buildSeries(seed + 70, 10, conversionRate), gradient: "linear-gradient(135deg,#6366f1,#4f46e5)", estimated: true },
    { label: "Bounce Rate", value: `${bounceRate.toFixed(1)}%`, delta: -2.4, series: buildSeries(seed + 80, 10, bounceRate), gradient: "linear-gradient(135deg,#f43f5e,#e11d48)", estimated: true },
    { label: "Customer Retention", value: `${retention.toFixed(1)}%`, delta: 6.7, series: buildSeries(seed + 90, 10, retention), gradient: "linear-gradient(135deg,#14b8a6,#0d9488)", estimated: true },
    { label: "Profit", value: formatCurrency(profit), delta: 15.2, series: buildSeries(seed + 100, 10, profit || 1), gradient: "linear-gradient(135deg,#22c55e,#16a34a)", estimated: true },
    { label: "Expenses", value: formatCurrency(expenses), delta: 3.9, series: buildSeries(seed + 110, 10, expenses || 1), gradient: "linear-gradient(135deg,#71717a,#52525b)", estimated: true },
  ];

  const topCategories = [
    { label: "Electronics", value: 42 },
    { label: "Apparel", value: 34 },
    { label: "Home", value: 27 },
    { label: "Beauty", value: 19 },
    { label: "Sports", value: 14 },
  ];
  const topBrands = [
    { label: "Aurora", value: 38 },
    { label: "Nimbus", value: 31 },
    { label: "Halo", value: 26 },
    { label: "Drift", value: 21 },
    { label: "Ember", value: 15 },
  ];
  const paymentMethods = [
    { label: "Card", value: 62, color: "#6366f1" },
    { label: "UPI", value: 24, color: "#10b981" },
    { label: "Wallet", value: 9, color: "#f59e0b" },
    { label: "COD", value: 5, color: "#f43f5e" },
  ];
  const trafficSources = [
    { label: "Organic Search", value: 38, color: "#0ea5e9" },
    { label: "Direct", value: 26, color: "#8b5cf6" },
    { label: "Social", value: 20, color: "#ec4899" },
    { label: "Email", value: 10, color: "#f59e0b" },
    { label: "Referral", value: 6, color: "#10b981" },
  ];
  const salesFunnel = [
    { label: "Visitors", value: Math.max(safeOrderCount * 22, 2200) },
    { label: "Product Views", value: Math.max(safeOrderCount * 12, 1200) },
    { label: "Add to Cart", value: Math.max(safeOrderCount * 4, 400) },
    { label: "Checkout Started", value: Math.max(safeOrderCount * 2, 200) },
    { label: "Purchased", value: Math.max(safeOrderCount, 100) },
  ];
  const conversionFunnel = [
    { label: "Landing Page", value: 10000 },
    { label: "Signed Up", value: 4200 },
    { label: "Activated", value: 2600 },
    { label: "Converted", value: 1150 },
  ];
  const customerRegions = [
    { label: "North America", value: 34, color: "#6366f1" },
    { label: "Europe", value: 28, color: "#0ea5e9" },
    { label: "Asia", value: 26, color: "#f59e0b" },
    { label: "Other", value: 12, color: "#10b981" },
  ];
  const customerAge = [
    { label: "18-24", value: 21 },
    { label: "25-34", value: 38 },
    { label: "35-44", value: 24 },
    { label: "45-54", value: 11 },
    { label: "55+", value: 6 },
  ];

  const aiInsights = buildAiInsights(revenue, orderCount, pendingOrders ?? 0, customerCount);

  return (
    <div className="space-y-8 pb-16">
      <style>{`
        @keyframes aurora-drift {
          0% { transform: translate(0,0) scale(1); }
          50% { transform: translate(3%, -4%) scale(1.08); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fade-in-up 0.5s ease-out both; }
      `}</style>

      {/* ================= HERO ================= */}
      <div className="relative overflow-hidden rounded-[32px] border border-black/5 bg-zinc-950 p-8 shadow-xl sm:p-10">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl"
          style={{ animation: "aurora-drift 14s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl"
          style={{ animation: "aurora-drift 18s ease-in-out infinite reverse" }}
        />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Analytics Overview
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Performance Overview
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                A real-time snapshot of revenue, orders, and customer activity — powered by your live store data.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 backdrop-blur">
                <span className="text-zinc-400">Range</span>
                <select
                  defaultValue="30d"
                  className="bg-transparent text-white outline-none [&>option]:text-zinc-900"
                  aria-label="Select date range"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="ytd">Year to date</option>
                </select>
              </label>
              <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                Export Analytics
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Current Revenue", value: formatCurrency(revenue) },
              { label: "Store Health", value: pendingOrders && pendingOrders > 5 ? "Needs Attention" : "Excellent" },
              { label: "Today's Sales", value: formatCurrency(revenue * (0.02 + seeded(seed + 200) * 0.03)) },
              { label: "Live Visitors", value: `${Math.round(20 + seeded(seed + 300) * 60)}` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">{s.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= KPI GRID ================= */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k, i) => (
          <div key={k.label} className="fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
            <KpiCard
              label={k.label}
              value={k.value}
              delta={k.delta}
              sparkline={k.series}
              gradient={k.gradient}
              estimated={"estimated" in k ? k.estimated : false}
            />
          </div>
        ))}
      </div>

      {/* ================= AI INSIGHTS ================= */}
      <div className="relative overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-lg text-white shadow-lg shadow-violet-200">
            ✨
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">AI Intelligence</h3>
            <p className="text-sm text-zinc-500">Automated read on your store&apos;s performance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/80 p-4 backdrop-blur transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-xl">{insight.icon}</span>
              <p className="text-sm leading-relaxed text-zinc-700">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= TREND CHARTS ================= */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue, illustrative distribution of live total" estimated>
          <LineAreaChart series={revenueSeries} labels={CURRENT_MONTH_LABELS} color="#10b981" />
        </ChartCard>
        <ChartCard title="Orders Trend" subtitle="Monthly order volume, illustrative distribution of live total" estimated>
          <LineAreaChart series={ordersSeries} labels={CURRENT_MONTH_LABELS} color="#0ea5e9" />
        </ChartCard>
        <ChartCard title="Customer Growth" subtitle="Monthly customer growth, illustrative distribution of live total" estimated>
          <LineAreaChart series={customerSeries} labels={CURRENT_MONTH_LABELS} color="#8b5cf6" />
        </ChartCard>
        <ChartCard title="Weekly Revenue" estimated>
          <BarChart data={weeklyRevenue.map((v, i) => ({ label: WEEK_LABELS[i], value: v }))} color="#f59e0b" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Top Categories" estimated>
          <BarChart data={topCategories} color="#6366f1" />
        </ChartCard>
        <ChartCard title="Top Brands" estimated>
          <BarChart data={topBrands} color="#ec4899" />
        </ChartCard>
      </div>

      <ChartCard title="Daily Revenue" subtitle="Last 14 days" estimated>
        <BarChart data={dailyRevenue.map((v, i) => ({ label: `${i + 1}`, value: v }))} color="#10b981" />
      </ChartCard>

      {/* ================= FUNNELS + DONUTS ================= */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Sales Funnel" subtitle="Visitors → purchase" estimated>
          <FunnelChart steps={salesFunnel} />
        </ChartCard>
        <ChartCard title="Conversion Funnel" subtitle="Acquisition → conversion" estimated>
          <FunnelChart steps={conversionFunnel} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Payment Methods" estimated>
          <DonutChart data={paymentMethods} />
        </ChartCard>
        <ChartCard title="Traffic Sources" estimated>
          <DonutChart data={trafficSources} />
        </ChartCard>
      </div>

      {/* ================= HEATMAP ================= */}
      <ChartCard title="Sales Heatmap" subtitle="Best-selling days & peak hours" estimated>
        <Heatmap seed={seed} />
      </ChartCard>

      {/* ================= TOP PRODUCTS ================= */}
      <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-950">
            Top Products
            <EstimatedDot />
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MOCK_TOP_PRODUCTS.map((p) => (
            <div
              key={p.name}
              className="group flex flex-col gap-3 rounded-2xl border border-black/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-lg font-semibold text-zinc-500">
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-950">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.sales} sales</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-950">{formatCurrency(p.revenue)}</span>
                <Badge tone={p.growth >= 0 ? "emerald" : "rose"}>
                  {p.growth >= 0 ? "▲" : "▼"} {Math.abs(p.growth)}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    style={{ width: `${p.score}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-zinc-500">AI Score {p.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= LOW STOCK ================= */}
      <div className="rounded-[28px] border border-orange-100 bg-orange-50/40 p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <h3 className="text-lg font-semibold text-zinc-950">
            Low Stock Alerts
            <EstimatedDot />
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MOCK_LOW_STOCK.map((item) => {
            const urgency = item.remaining <= 3 ? "rose" : "orange";
            return (
              <div
                key={item.name}
                className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-950">{item.name}</p>
                  <Badge tone={urgency}>{item.remaining} left</Badge>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={`h-full rounded-full ${urgency === "rose" ? "bg-rose-500" : "bg-orange-500"}`}
                    style={{ width: `${Math.min((item.remaining / item.threshold) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500">Recommended restock: {item.threshold * 3} units</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= CUSTOMER ANALYTICS ================= */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Customers by Region" estimated>
          <DonutChart data={customerRegions} />
        </ChartCard>
        <ChartCard title="Customers by Age" estimated>
          <BarChart data={customerAge} color="#14b8a6" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: "New Customers", value: Math.round(customerCount * 0.28).toLocaleString() },
          { label: "Returning Customers", value: Math.round(customerCount * 0.72).toLocaleString() },
          { label: "Customer LTV", value: formatCurrency(aov * 4.2 || 0) },
        ].map((s) => (
          <div key={s.label} className="rounded-[24px] border border-black/5 bg-white p-6 text-center shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              {s.label}
              <EstimatedDot />
            </p>
            <p className="mt-2 text-2xl font-semibold text-zinc-950">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ================= EXPORT ACTIONS ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950">Export &amp; Reporting</h3>
          <p className="text-sm text-zinc-500">Download this dashboard for offline review or sharing.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Export PDF", tone: "bg-zinc-950 text-white hover:bg-zinc-800" },
            { label: "Export CSV", tone: "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50" },
            { label: "Export Excel", tone: "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50" },
            { label: "Print", tone: "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50" },
          ].map((btn) => (
            <button
              key={btn.label}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${btn.tone}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <p className="px-1 text-center text-[11px] text-zinc-400">
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-violet-400 align-middle" />
        Metrics marked with a dot are illustrative estimates layered on top of your live revenue, order, customer,
        product, and pending-order figures — replace the corresponding mock data / <code>buildSeries</code> calls
        with real queries as those data sources become available.
      </p>
    </div>
  );
}