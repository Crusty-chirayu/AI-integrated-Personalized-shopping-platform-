export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">About CartIQ</p>
      <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Crafted to bring calm to daily living.</h1>
      <p className="mt-6 text-lg leading-8 text-zinc-600">
        CartIQ is a modern commerce destination built around considered product curation, smart service, and seamless checkout.
      </p>
      <div className="mt-10 rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
        <p className="text-base leading-8 text-zinc-600">
          We believe beautiful objects should feel effortless to use and enduring in character. Every collection is curated with restraint, performance, and warmth in mind.
        </p>
      </div>
    </div>
  );
}
