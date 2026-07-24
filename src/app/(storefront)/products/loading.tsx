export default function ProductsLoading() {
  return (
    <div>
      {/* Hero / header */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 50% at 10% 0%, rgba(79,70,229,0.08), transparent 60%), radial-gradient(45% 45% at 90% 10%, rgba(20,184,166,0.08), transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {/* Hero badge */}
              <div className="h-7 w-28 animate-pulse rounded-full bg-zinc-200" />

              {/* Hero title */}
              <div className="mt-5 h-10 w-72 animate-pulse rounded-xl bg-zinc-200 sm:w-96" />
              <div className="mt-3 h-10 w-56 animate-pulse rounded-xl bg-zinc-200 sm:w-80" />

              {/* Hero subtitle */}
              <div className="mt-5 h-4 w-full max-w-xl animate-pulse rounded-lg bg-zinc-200" />
              <div className="mt-2 h-4 w-2/3 max-w-md animate-pulse rounded-lg bg-zinc-200" />
            </div>

            {/* Product count badge */}
            <div className="h-10 w-44 animate-pulse rounded-full bg-zinc-200" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        {/* AI Suggests strip */}
        <div className="mb-10 flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-full bg-zinc-200" />
          <div className="h-4 w-24 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-4 w-40 animate-pulse rounded-lg bg-zinc-200" />
        </div>

        {/* Product grid — 8 cards, same layout as the real grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[28px] border border-black/5 bg-white p-3"
            >
              {/* Image */}
              <div className="aspect-[4/5] w-full animate-pulse rounded-[22px] bg-zinc-200" />

              <div className="px-2 pb-2 pt-4">
                {/* Category */}
                <div className="h-3 w-16 animate-pulse rounded-md bg-zinc-200" />

                {/* Title */}
                <div className="mt-2 h-4 w-full animate-pulse rounded-md bg-zinc-200" />
                <div className="mt-1.5 h-4 w-2/3 animate-pulse rounded-md bg-zinc-200" />

                {/* Rating */}
                <div className="mt-3 h-3.5 w-24 animate-pulse rounded-md bg-zinc-200" />

                {/* Price */}
                <div className="mt-3 h-5 w-20 animate-pulse rounded-md bg-zinc-200" />

                {/* Actions */}
                <div className="mt-4 h-11 w-full animate-pulse rounded-full bg-zinc-200" />
                <div className="mt-2.5 h-3.5 w-24 animate-pulse rounded-md bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}