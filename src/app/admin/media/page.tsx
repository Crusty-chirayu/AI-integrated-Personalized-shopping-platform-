import Image from "next/image";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type MediaItem = {
  id: string;
  url: string;
  filename: string | null;
};

export default async function AdminMediaPage() {
  const admin = getSupabaseAdmin();
  const response = admin
    ? await admin.from("media").select("id,url,filename").order("created_at", { ascending: false }).limit(12)
    : { data: [] };

  const media = response.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Media</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Asset library</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {media.map((item) => (
          <div key={item.id} className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
            <Image
              src={item.url}
              alt={item.filename ?? "Media asset"}
              width={400}
              height={128}
              className="h-32 w-full rounded-[20px] object-cover"
            />
            <p className="mt-4 text-sm font-medium text-zinc-900">{item.filename ?? "Uploaded asset"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}