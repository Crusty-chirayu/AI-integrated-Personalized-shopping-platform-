import { BarChart3, Package2, ShoppingBag, Users2 } from "lucide-react";

const stats = [
  { label: "Revenue", value: "$84.2K", change: "+12.4%" },
  { label: "Orders", value: "1,248", change: "+8.1%" },
  { label: "Customers", value: "632", change: "+4.6%" },
  { label: "Avg. order", value: "$67.5", change: "+2.3%" },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Welcome back, admin.</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">{stat.label}</p>
              <div className="rounded-full bg-[#f5f2ea] p-2 text-zinc-700">
                {stat.label === "Revenue" ? <BarChart3 className="h-4 w-4" /> : stat.label === "Orders" ? <ShoppingBag className="h-4 w-4" /> : stat.label === "Customers" ? <Users2 className="h-4 w-4" /> : <Package2 className="h-4 w-4" />}
              </div>
            </div>
            <p className="mt-5 text-3xl font-semibold text-zinc-950">{stat.value}</p>
            <p className="mt-2 text-sm text-emerald-600">{stat.change}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Recent orders</h2>
          <div className="mt-6 space-y-3">
            {["ORD-1024", "ORD-1023", "ORD-1022"].map((order) => (
              <div key={order} className="flex items-center justify-between rounded-2xl bg-[#f7f3eb] px-4 py-3 text-sm text-zinc-600">
                <span>{order}</span>
                <span>Paid · Shipped</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Low stock alerts</h2>
          <div className="mt-6 space-y-3">
            {['Contour Tote', 'Aero Chair'].map((item) => (
              <div key={item} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{item} · 4 left</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
