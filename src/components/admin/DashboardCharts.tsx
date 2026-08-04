"use client";

import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/formatCurrency";

export type SalesPoint = { date: string; revenue: number };
export type OrdersRevenuePoint = { date: string; revenue: number; orders: number };
export type CategorySlice = { name: string; value: number; percentage: number };
export type ProductBar = { name: string; units: number };

const CATEGORY_COLORS = ["#111827", "#d4a373", "#a3b18a", "#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#6d597a"];

const AXIS_STYLE = { fontSize: 12, fill: "#71717a" };

function CardShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function CurrencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-black/5 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-zinc-700">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="text-zinc-600">
          {entry.name}:{" "}
          {entry.name.toLowerCase().includes("order") && !entry.name.toLowerCase().includes("revenue")
            ? entry.value.toLocaleString("en-IN")
            : formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

function SalesOverviewChart({ data }: { data: SalesPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">No sales data yet.</p>;
  }
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#111827" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#111827" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede4" />
          <XAxis dataKey="date" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => formatCurrency(value)}
            width={80}
          />
          <Tooltip content={<CurrencyTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#111827"
            strokeWidth={2.5}
            fill="url(#salesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function OrdersVsRevenueChart({ data }: { data: OrdersRevenuePoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">No order data yet.</p>;
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede4" />
          <XAxis dataKey="date" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={60} />
          <Tooltip content={<CurrencyTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="revenue" name="Revenue" fill="#111827" radius={[6, 6, 0, 0]} />
          <Bar dataKey="orders" name="Orders" fill="#d4a373" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: CategorySlice }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const slice = payload[0].payload;
  return (
    <div className="rounded-xl border border-black/5 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-zinc-700">{slice.name}</p>
      <p className="text-zinc-600">
        {formatCurrency(slice.value)} · {slice.percentage.toFixed(1)}%
      </p>
    </div>
  );
}

function CategoryDistributionChart({ data }: { data: CategorySlice[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">No category sales yet.</p>;
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CategoryTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function UnitsTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ProductBar }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const bar = payload[0].payload;
  return (
    <div className="rounded-xl border border-black/5 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-zinc-700">{bar.name}</p>
      <p className="text-zinc-600">{bar.units.toLocaleString("en-IN")} units sold</p>
    </div>
  );
}

function TopProductsChart({ data }: { data: ProductBar[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">No product sales yet.</p>;
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0ede4" />
          <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip content={<UnitsTooltip />} />
          <Bar dataKey="units" name="Units sold" fill="#111827" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardCharts({
  salesData,
  ordersRevenueData,
  categoryData,
  topProductsData,
  lowStockSlot,
}: {
  salesData: SalesPoint[];
  ordersRevenueData: OrdersRevenuePoint[];
  categoryData: CategorySlice[];
  topProductsData: ProductBar[];
  lowStockSlot: ReactNode;
}) {
  return (
    <>
      <CardShell title="Sales overview">
        <SalesOverviewChart data={salesData} />
      </CardShell>

      <div className="grid gap-6 xl:grid-cols-2">
        <CardShell title="Orders vs revenue">
          <OrdersVsRevenueChart data={ordersRevenueData} />
        </CardShell>
        <CardShell title="Category distribution">
          <CategoryDistributionChart data={categoryData} />
        </CardShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CardShell title="Top selling products">
          <TopProductsChart data={topProductsData} />
        </CardShell>
        {lowStockSlot}
      </div>
    </>
  );
}