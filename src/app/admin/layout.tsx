import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  FileText,
  WandSparkles,
} from "lucide-react";import { AdminAuthGuard } from "@/components/admin-auth-guard";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-black/5 bg-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white">
              <WandSparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">CartIQ Admin</p>
              <p className="text-xs text-zinc-500">Operations</p>
            </div>
          </div>
          <nav className="space-y-1 px-3 pb-6">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-600 transition hover:bg-[#f7f3eb] hover:text-zinc-900">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-6 lg:p-8">
          <AdminAuthGuard>{children}</AdminAuthGuard>
        </main>
      </div>
    </div>
  );
}
