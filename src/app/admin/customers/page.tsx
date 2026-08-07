import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// ── Display face for stat numerals & the page title — same as the Orders
// dashboard, used with restraint. ───────────────────────────────────────
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

type CustomerRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  created_at: string | null;
};

type SearchParams = {
  q?: string;
  role?: string;
};

// ── Tiny, dependency-free helpers ─────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(iso: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && isSameDay(d, new Date());
}

function isWithinDays(iso: string | null, days: number) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  if (isToday(iso)) return `Today · ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function initials(name: string | null, email: string | null) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0];
  const parts = source.replace(/[^a-zA-Z ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

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

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-[#6B5B95]/10 text-[#4f4270] ring-1 ring-[#6B5B95]/25",
  staff: "bg-[#3B5B92]/10 text-[#2c4269] ring-1 ring-[#3B5B92]/25",
  customer: "bg-[#1F8A57]/10 text-[#166a41] ring-1 ring-[#1F8A57]/25",
};
function roleStyle(role: string | null) {
  return ROLE_STYLES[(role ?? "customer").toLowerCase()] ?? "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200";
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
function buildCsv(rows: CustomerRow[]) {
  const header = ["Name", "Email", "Role", "Joined"];
  const lines = [header.join(",")];
  for (const c of rows) {
    lines.push(
      [csvEscape(c.full_name ?? "Customer"), csvEscape(c.email ?? ""), csvEscape(c.role ?? "customer"), csvEscape(c.created_at ?? "")].join(",")
    );
  }
  return lines.join("\n");
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const sp = (searchParams ? await searchParams : undefined) ?? {};
  const q = (sp.q ?? "").trim().toLowerCase();
  const roleFilter = (sp.role ?? "all").toLowerCase();

  const client = getSupabaseAdmin();
  const { data: customersData } = client
    ? await client
        .from("profiles")
        .select("id,email,full_name,role,created_at")
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };
  const customers: CustomerRow[] = customersData ?? [];

  // ── Derived, honest metrics — computed only from the rows already fetched
  // above. No additional queries, nothing invented. ────────────────────────
  const newToday = customers.filter((c) => isToday(c.created_at)).length;
  const newThisWeek = customers.filter((c) => isWithinDays(c.created_at, 7)).length;
  const admins = customers.filter((c) => (c.role ?? "customer").toLowerCase() === "admin").length;
  const staff = customers.filter((c) => (c.role ?? "customer").toLowerCase() === "staff").length;
  const plainCustomers = customers.length - admins - staff;

  const availableRoles = Array.from(new Set(customers.map((c) => (c.role ?? "customer").toLowerCase())));

  const filteredCustomers = customers.filter((c) => {
    const matchesQuery =
      !q ||
      (c.full_name ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || (c.role ?? "customer").toLowerCase() === roleFilter;
    return matchesQuery && matchesRole;
  });

  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(buildCsv(filteredCustomers))}`;

  const kpis = [
    { label: "Customers shown", value: String(customers.length), tone: "denim" },
    { label: "New today", value: String(newToday), tone: "forest" },
    { label: "New this week", value: String(newThisWeek), tone: "brass" },
    { label: "Customers", value: String(plainCustomers), tone: "forest" },
    { label: "Staff", value: String(staff), tone: "denim" },
    { label: "Admins", value: String(admins), tone: "plum" },
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
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.75); } }
        @keyframes ticker { 0% { stroke-dashoffset: 24; } 100% { stroke-dashoffset: 0; } }
        @keyframes heroGlow { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
        .customer-row { animation: fadeInUp .35s ease both; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-[#17171A] px-6 py-8 sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#6B5B95]/25 blur-3xl"
          style={{ animation: "heroGlow 6s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#3B5B92]/20 blur-3xl"
          style={{ animation: "heroGlow 7s ease-in-out infinite 1s" }}
        />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Customer relationships</p>
              <h1 className={`${display.className} mt-2 text-3xl font-semibold text-white sm:text-4xl`}>Customers</h1>
              <p className="mt-1 text-sm text-white/50">
                Showing the latest {customers.length} customer{customers.length === 1 ? "" : "s"}
                {filteredCustomers.length !== customers.length ? ` · ${filteredCustomers.length} match your filters` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#5FD98A]" style={{ animation: "pulseDot 1.6s ease-in-out infinite" }} />
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

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={csvHref}
              download="customers.csv"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#B8843C] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#a4762f] hover:shadow-md"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export customers
            </a>
            {customers.length > 0 && customers[0].email && (
              <a
                href={`mailto:${customers.map((c) => c.email).filter(Boolean).join(",")}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition hover:bg-white/10"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m4 6 8 7 8-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Email all shown
              </a>
            )}
            <Link
              href="/admin/customers"
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="group rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{kpi.label}</p>
            <p className={`${display.className} mt-1.5 text-xl font-semibold tabular-nums text-zinc-950 ${toneClass[kpi.tone]}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── Insights — plain-language read of the same rows above. ─────────── */}
      <div className="relative overflow-hidden rounded-[24px] border border-[#6B5B95]/20 bg-gradient-to-br from-[#6B5B95]/8 via-white to-[#3B5B92]/6 p-5 sm:p-6">
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
            {newToday > 0 ? `${newToday} new signup${newToday === 1 ? "" : "s"} today.` : "No new signups yet today."}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B5B92]" />
            {newThisWeek > 0 ? `${newThisWeek} customer${newThisWeek === 1 ? "" : "s"} joined in the last 7 days.` : "No signups in the last 7 days."}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1F8A57]" />
            {`${plainCustomers} of ${customers.length} shown are on the standard customer role.`}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B5B95]' " />
            {admins + staff > 0 ? `${admins + staff} internal account${admins + staff === 1 ? "" : "s"} (staff + admin) in this batch.` : "No internal accounts in this batch."}
          </li>
        </ul>
      </div>

      {/* ── Search + filters ─────────────────────────────────────────────── */}
      <form className="space-y-3" action="/admin/customers" method="GET">
        <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#6B5B95]/50 focus-within:ring-2 focus-within:ring-[#6B5B95]/15">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search by name, email, or ID…"
            className="w-full border-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            aria-label="Search customers"
          />
          {roleFilter !== "all" && <input type="hidden" name="role" value={roleFilter} />}
          <kbd className="hidden shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 sm:inline">Enter</kbd>
          <button type="submit" className="shrink-0 rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800">
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Role</span>
          <Link
            href={{ pathname: "/admin/customers", query: { ...(q ? { q } : {}) } }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${roleFilter === "all" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
          >
            All
          </Link>
          {availableRoles.map((r) => (
            <Link
              key={r}
              href={{ pathname: "/admin/customers", query: { ...(q ? { q } : {}), role: r } }}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${roleFilter === r ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
            >
              {r}
            </Link>
          ))}
        </div>
      </form>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6B5B95]/10">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B5B95" strokeWidth="1.6">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-900">{customers.length === 0 ? "No customers yet" : "No customers match your filters"}</p>
            <p className="max-w-xs text-sm text-zinc-500">
              {customers.length === 0 ? "New signups will show up here automatically." : "Try a different search term, or reset filters to see everyone."}
            </p>
            {customers.length > 0 && (
              <Link href="/admin/customers" className="mt-1 rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800">
                Reset filters
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/5">
              <thead className="sticky top-0 z-10 bg-[#f7f3eb]/95 text-left text-xs uppercase tracking-wide text-zinc-500 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-sm text-zinc-700">
                {filteredCustomers.map((customer, i) => (
                  <tr key={customer.id} className="customer-row group transition hover:bg-[#6B5B95]/[0.04]" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ${avatarTint(customer.email ?? customer.id)}`}>
                          {initials(customer.full_name, customer.email)}
                        </span>
                        <span className="truncate font-medium text-zinc-900">{customer.full_name ?? "Customer"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{customer.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${roleStyle(customer.role)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {customer.role ?? "customer"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(customer.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {customer.email ? (
                        <a
                          href={`mailto:${customer.email}`}
                          className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:border-[#6B5B95]/40 hover:text-[#4f4270]"
                        >
                          Email
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reference badges for the role vocabulary actually present in the data. */}
      {availableRoles.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Legend</span>
          {availableRoles.map((r) => (
            <span key={r} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${roleStyle(r)}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}