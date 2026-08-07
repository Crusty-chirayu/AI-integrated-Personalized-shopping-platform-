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
  const data = response.data as SettingsRow | null;

  const isConnected = Boolean(admin);
  const siteName = data?.site_name ?? "CartIQ";
  const currency = data?.currency_code ?? "INR (₹)";
  const tagline =
    data?.tagline ?? "AI-Powered Smart Shopping Platform for Personalized Product Discovery.";
  const contactEmail = data?.contact_email ?? "chirayujaysawal7@gmail.com";

  return (
    <div className="relative pb-28">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#f0b84e]/20 blur-3xl" />
        <div className="absolute top-40 -right-40 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      {/* ================= HERO ================= */}
      <div className="relative overflow-hidden rounded-[32px] border border-black/5 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-8 shadow-xl md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,184,78,0.18),transparent_60%)]" />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-semibold text-white ring-1 ring-white/15 backdrop-blur">
              {siteName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">Settings</p>
              <h1 className="mt-1 text-3xl font-semibold text-white">{siteName}</h1>
              <p className="mt-1 max-w-md text-sm text-white/60">{tagline}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Store health", value: "Excellent", dot: "bg-emerald-400" },
              { label: "Theme", value: "Aurora Gold", dot: "bg-[#f0b84e]" },
              { label: "Currency", value: currency, dot: "bg-sky-400" },
              {
                label: "Status",
                value: isConnected ? "Live" : "Offline",
                dot: isConnected ? "bg-emerald-400" : "bg-rose-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur transition hover:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                  <p className="text-[11px] uppercase tracking-wide text-white/50">{item.label}</p>
                </div>
                <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= CSS-ONLY TABS ================= */}
      <div className="relative mt-8">
        <input type="radio" id="tab-general" name="settings-tab" className="peer/general hidden" defaultChecked />
        <input type="radio" id="tab-branding" name="settings-tab" className="peer/branding hidden" />
        <input type="radio" id="tab-ai" name="settings-tab" className="peer/ai hidden" />
        <input type="radio" id="tab-payments" name="settings-tab" className="peer/payments hidden" />
        <input type="radio" id="tab-email" name="settings-tab" className="peer/email hidden" />
        <input type="radio" id="tab-security" name="settings-tab" className="peer/security hidden" />
        <input type="radio" id="tab-system" name="settings-tab" className="peer/system hidden" />

        <nav className="sticky top-4 z-10 mb-8 flex flex-wrap gap-2 rounded-full border border-black/5 bg-white/70 p-2 shadow-sm backdrop-blur-md">
          {[
            { id: "tab-general", label: "General" },
            { id: "tab-branding", label: "Branding" },
            { id: "tab-ai", label: "AI" },
            { id: "tab-payments", label: "Payments" },
            { id: "tab-email", label: "Email" },
            { id: "tab-security", label: "Security" },
            { id: "tab-system", label: "System" },
          ].map((t) => (
            <label
              key={t.id}
              htmlFor={t.id}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-zinc-500 transition-all hover:text-zinc-900
                peer-checked/general:[&:has(~)]:text-zinc-900
                [&:has(input:checked)]:bg-zinc-950`}
            >
              {t.label}
            </label>
          ))}
        </nav>

        <style>{`
          label[for="tab-general"]{}
          #tab-general:checked ~ nav label[for="tab-general"],
          #tab-branding:checked ~ nav label[for="tab-branding"],
          #tab-ai:checked ~ nav label[for="tab-ai"],
          #tab-payments:checked ~ nav label[for="tab-payments"],
          #tab-email:checked ~ nav label[for="tab-email"],
          #tab-security:checked ~ nav label[for="tab-security"],
          #tab-system:checked ~ nav label[for="tab-system"] {
            background: #09090b;
            color: #fff;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
          }
        `}</style>

        {/* ---------------- GENERAL ---------------- */}
        <section className="hidden animate-[fadeIn_.35s_ease] space-y-6 peer-checked/general:block">
          <Card title="Store identity" subtitle="Core information shown across your storefront">
            <Grid>
              <Field label="Site name" defaultValue={siteName} />
              <Field label="Currency" defaultValue={currency} />
              <Field label="Tagline" defaultValue={tagline} span2 />
              <Field label="Contact email" type="email" defaultValue={contactEmail} />
              <Field label="Support email" type="email" placeholder="support@yourstore.com" />
              <Field label="Phone" placeholder="+91 90000 00000" />
              <Field label="Address" placeholder="Bengaluru, Karnataka, India" span2 />
              <Field label="Timezone" placeholder="Asia/Kolkata (GMT +5:30)" />
              <Field label="Country" placeholder="India" />
              <Field label="Language" placeholder="English (en-IN)" />
              <Field label="Tax percentage" placeholder="18%" />
              <Field label="Shipping cost" placeholder="₹49" />
              <Field label="Delivery time" placeholder="2–4 business days" />
            </Grid>
          </Card>
        </section>

        {/* ---------------- BRANDING ---------------- */}
        <section className="hidden animate-[fadeIn_.35s_ease] space-y-6 peer-checked/branding:block">
          <Card title="Brand assets" subtitle="Logo, favicon and banner used across the platform">
            <div className="grid gap-6 md:grid-cols-3">
              <UploadTile label="Logo" hint="PNG · 512×512" />
              <UploadTile label="Favicon" hint="ICO/PNG · 64×64" />
              <UploadTile label="Banner" hint="JPG/PNG · 1600×400" />
            </div>
          </Card>

          <Card title="Theme" subtitle="Colors and typography that define your look">
            <Grid>
              <ColorField label="Theme color" defaultValue="#f0b84e" />
              <ColorField label="Accent color" defaultValue="#18181b" />
              <Field label="Heading font" placeholder="Inter" />
              <Field label="Body font" placeholder="Inter" />
            </Grid>
            <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-[#f7f3eb] p-6">
              <p className="mb-3 text-xs uppercase tracking-wide text-zinc-500">Live preview</p>
              <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-[#f0b84e]" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{siteName}</p>
                  <p className="text-xs text-zinc-500">{tagline}</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ---------------- AI ---------------- */}
        <section className="hidden animate-[fadeIn_.35s_ease] space-y-6 peer-checked/ai:block">
          <Card title="AI configuration" subtitle="Control how AI powers discovery and personalization">
            <div className="grid gap-4 sm:grid-cols-2">
              <Toggle label="Enable AI features" defaultChecked />
              <Toggle label="Smart search" defaultChecked />
              <Toggle label="Chat personalization" defaultChecked />
              <Toggle label="Voice assistant" />
              <Toggle label="AI analytics" defaultChecked />
              <Toggle label="Recommendation engine" defaultChecked />
            </div>
            <Grid className="mt-6">
              <Field label="Default AI model" placeholder="claude-sonnet-4-6" />
              <Field label="Temperature" placeholder="0.7" />
              <Field label="Recommendation mode" placeholder="Hybrid (collaborative + content)" />
            </Grid>
          </Card>
        </section>

        {/* ---------------- PAYMENTS ---------------- */}
        <section className="hidden animate-[fadeIn_.35s_ease] space-y-6 peer-checked/payments:block">
          <Card title="Payment methods" subtitle="Enable and configure how customers pay">
            <div className="grid gap-4 sm:grid-cols-2">
              <Toggle label="Razorpay" defaultChecked />
              <Toggle label="Stripe" />
              <Toggle label="UPI" defaultChecked />
              <Toggle label="Cash on delivery" defaultChecked />
            </div>
            <Grid className="mt-6">
              <Field label="GST number" placeholder="29ABCDE1234F1Z5" />
              <Field label="Tax rate" placeholder="18%" />
            </Grid>
          </Card>
        </section>

        {/* ---------------- EMAIL ---------------- */}
        <section className="hidden animate-[fadeIn_.35s_ease] space-y-6 peer-checked/email:block">
          <Card title="Email & notifications" subtitle="Transactional and marketing email configuration">
            <Grid>
              <Field label="SMTP host" placeholder="smtp.resend.com" />
              <Field label="SMTP port" placeholder="587" />
              <Field label="Order notifications" type="email" placeholder="orders@yourstore.com" />
              <Field label="Newsletter sender" type="email" placeholder="news@yourstore.com" />
              <Field label="Customer support" type="email" defaultValue={contactEmail} />
            </Grid>
          </Card>
        </section>

        {/* ---------------- SECURITY ---------------- */}
        <section className="hidden animate-[fadeIn_.35s_ease] space-y-6 peer-checked/security:block">
          <Card title="Security" subtitle="Protect admin access and customer data">
            <div className="grid gap-4 sm:grid-cols-2">
              <Toggle label="Two-factor authentication" defaultChecked />
              <Toggle label="Restrict admin access by IP" />
            </div>
            <Grid className="mt-6">
              <Field label="Session timeout" placeholder="30 minutes" />
              <Field label="Password policy" placeholder="Min 8 chars, 1 symbol, 1 number" span2 />
              <Field label="API keys" placeholder="•••• •••• •••• 8f2a" />
            </Grid>
          </Card>
        </section>

        {/* ---------------- SYSTEM ---------------- */}
        <section className="hidden animate-[fadeIn_.35s_ease] space-y-6 peer-checked/system:block">
          <Card title="System status" subtitle="Real-time health of connected services">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Status label="Database" ok={isConnected} />
              <Status label="Supabase" ok={isConnected} />
              <Status label="Storage" ok />
              <Status label="Email" ok />
              <Status label="AI" ok />
              <Status label="Payments" ok />
            </div>
          </Card>
        </section>
      </div>

      {/* ================= FLOATING SAVE BAR ================= */}
      <div className="fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
        <div className="flex w-full max-w-xl items-center justify-between gap-4 rounded-full border border-black/5 bg-white/90 px-5 py-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            All changes saved
          </div>
          <button
            type="submit"
            className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Save changes
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ============== Presentational helpers (server-safe, no client state) ============== */

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/90 p-8 shadow-sm backdrop-blur transition-shadow hover:shadow-md">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function Grid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid gap-6 md:grid-cols-2 ${className}`}>{children}</div>;
}

function Field({
  label,
  defaultValue,
  placeholder,
  type = "text",
  span2 = false,
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "md:col-span-2" : ""}>
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-full border border-black/10 bg-[#f7f3eb] px-4 outline-none transition focus:border-[#f0b84e] focus:ring-2 focus:ring-[#f0b84e]/30"
      />
    </div>
  );
}

function ColorField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <div className="mt-2 flex h-12 items-center gap-3 rounded-full border border-black/10 bg-[#f7f3eb] px-3">
        <input
          type="color"
          defaultValue={defaultValue}
          className="h-8 w-8 cursor-pointer rounded-full border-none bg-transparent p-0"
        />
        <span className="text-sm text-zinc-600">{defaultValue}</span>
      </div>
    </div>
  );
}

function UploadTile({ label, hint }: { label: string; hint: string }) {
  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/15 bg-[#f7f3eb] p-8 text-center transition hover:border-[#f0b84e] hover:bg-[#f0b84e]/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-400 shadow-sm transition group-hover:text-[#f0b84e]">
        +
      </div>
      <p className="text-sm font-medium text-zinc-700">{label}</p>
      <p className="text-xs text-zinc-400">{hint}</p>
      <input type="file" className="hidden" />
    </label>
  );
}

function Toggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-black/5 bg-[#f7f3eb] px-5 py-4 transition hover:border-black/10">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <span className="relative inline-flex h-6 w-11 items-center">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-zinc-300 transition peer-checked:bg-zinc-950" />
        <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function Status({ label, ok = false }: { label: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-[#f7f3eb] px-5 py-4">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <span
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
          ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-rose-500"}`} />
        {ok ? "Operational" : "Down"}
      </span>
    </div>
  );
}