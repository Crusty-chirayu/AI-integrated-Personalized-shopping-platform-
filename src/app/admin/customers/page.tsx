import { getSupabaseAdmin } from "@/lib/supabase-server";

type CustomerRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  created_at: string | null;
};

export default async function AdminCustomersPage() {
  const client = getSupabaseAdmin();
  const { data: customersData } = client
    ? await client
        .from("profiles")
        .select("id,email,full_name,role,created_at")
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const customers: CustomerRow[] = customersData ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Customers</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Customer overview</h1>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-black/5">
          <thead className="bg-[#f7f3eb] text-left text-sm text-zinc-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 text-sm text-zinc-700">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3 font-medium text-zinc-900">{customer.full_name ?? "Customer"}</td>
                <td className="px-4 py-3">{customer.email ?? "—"}</td>
                <td className="px-4 py-3">{customer.role ?? "customer"}</td>
                <td className="px-4 py-3">{customer.created_at ? new Date(customer.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
