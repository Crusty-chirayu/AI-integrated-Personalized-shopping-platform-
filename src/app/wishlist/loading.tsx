export default function WishlistLoading() {
  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 50% at 10% 0%, rgba(79,70,229,0.08), transparent 60%), radial-gradient(45% 45% at 90% 10%, rgba(20,184,166,0.08), transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {/* Badge */}
              <div className="h-7 w-32 animate-pulse rounded-full bg-zinc-200" />

              {/* Heading */}
              <div className="mt-5 h-10 w-80 animate-pulse rounded-xl bg-zinc-200" />

              {/* Subtitle */}
              <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded-lg bg-zinc-200" />

              {/* Saved count */}
              <div className="mt-3 h-4 w-32 animate-pulse rounded-lg bg-zinc-200" />
            </div>

            {/* Clear wishlist button */}
            <div className="h-10 w-40 animate-pulse rounded-full bg-zinc-200" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        {/* Product grid — 8 cards */}
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

        {/* AI recommendation strip */}
        <div className="mt-20 h-52 animate-pulse rounded-[28px] bg-zinc-200" />
      </div>
    </div>
  );
}