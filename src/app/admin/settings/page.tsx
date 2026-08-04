import { getSupabaseAdmin } from "@/lib/supabase-server";

type SettingsRow = {
  site_name: string | null;
  tagline: string | null;
  currency_code: string | null;
  contact_email: string | null;
};

export default async function AdminSettingsPage() {
  const admin = getSupabaseAdmin();
  const response = admin
    ? await admin.from("site_settings").select("site_name,tagline,currency_code,contact_email").limit(1).single()
    : { data: null };

  const data = response.data;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Site configuration</h1>
      </div>
      <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-zinc-700">Site name</label>
            <input className="mt-2 h-12 w-full rounded-full border border-black/10 bg-[#f7f3eb] px-4 outline-none" defaultValue={data?.site_name ?? "CartIQ"} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Currency</label>
            <input className="mt-2 h-12 w-full rounded-full border border-black/10 bg-[#f7f3eb] px-4 outline-none" defaultValue={data?.currency_code ?? "INR (₹)"} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Tagline</label>
            <input className="mt-2 h-12 w-full rounded-full border border-black/10 bg-[#f7f3eb] px-4 outline-none" defaultValue={
  data?.tagline ??
  "AI-Powered Smart Shopping Platform for Personalized Product Discovery."
} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Contact email</label>
            <input className="mt-2 h-12 w-full rounded-full border border-black/10 bg-[#f7f3eb] px-4 outline-none" defaultValue={
  data?.contact_email ??
  "chirayujaysawal7@gmail.com"
} />
          </div>
        </div>
      </div>
    </div>
  );
}
