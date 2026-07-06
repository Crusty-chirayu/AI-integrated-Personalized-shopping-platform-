export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Policies</p>
      <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Shipping, returns, and support.</h1>
      <div className="mt-8 space-y-6 rounded-[32px] border border-black/5 bg-white p-8 shadow-sm text-base leading-8 text-zinc-600">
        <p>We ship all orders within 24 hours using premium packaging and insured delivery.</p>
        <p>Returns are accepted within 14 days for unused items in original condition.</p>
        <p>For support requests, contact support@cartiq.example and we will reply within one business day.</p>
      </div>
    </div>
  );
}
