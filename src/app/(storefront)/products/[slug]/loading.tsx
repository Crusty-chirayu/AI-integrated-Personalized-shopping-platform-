export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">

      {/* Back link */}
      <div className="h-4 w-32 animate-pulse rounded-lg bg-zinc-200" />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">

        {/* Gallery */}
        <div>
          {/* Main image */}
          <div className="aspect-square w-full animate-pulse rounded-[28px] bg-zinc-200" />

          {/* Thumbnails */}
          <div className="mt-4 grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-zinc-200"
              />
            ))}
          </div>
        </div>

        {/* Info column */}
        <div>
          {/* Category */}
          <div className="h-3 w-20 animate-pulse rounded-md bg-zinc-200" />

          {/* Title */}
          <div className="mt-3 h-8 w-full animate-pulse rounded-xl bg-zinc-200" />
          <div className="mt-2 h-8 w-2/3 animate-pulse rounded-xl bg-zinc-200" />

          {/* Rating */}
          <div className="mt-4 h-4 w-40 animate-pulse rounded-lg bg-zinc-200" />

          {/* Price */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-5 w-16 animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-6 w-14 animate-pulse rounded-full bg-zinc-200" />
          </div>

          {/* Availability */}
          <div className="mt-4 h-4 w-28 animate-pulse rounded-lg bg-zinc-200" />

          {/* Description */}
          <div className="mt-6 space-y-2.5">
            <div className="h-3.5 w-full animate-pulse rounded-md bg-zinc-200" />
            <div className="h-3.5 w-full animate-pulse rounded-md bg-zinc-200" />
            <div className="h-3.5 w-4/5 animate-pulse rounded-md bg-zinc-200" />
          </div>

          {/* Quantity selector */}
          <div className="mt-7 h-12 w-32 animate-pulse rounded-full bg-zinc-200" />

          {/* Add to Cart + Wishlist */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-14 flex-1 animate-pulse rounded-full bg-zinc-200" />
            <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-200" />
          </div>

          {/* Highlights */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-2xl bg-zinc-200"
              />
            ))}
          </div>

          {/* Specifications */}
          <div className="mt-8">
            <div className="h-4 w-32 animate-pulse rounded-lg bg-zinc-200" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-xl bg-zinc-200"
                />
              ))}
            </div>
          </div>

          {/* AI recommendation card */}
          <div className="mt-6 h-32 animate-pulse rounded-[24px] bg-zinc-200" />
        </div>
      </div>

      {/* Related products */}
      <div className="mt-20">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-zinc-200" />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[28px] border border-black/5 bg-white p-3"
            >
              <div className="aspect-[4/5] w-full animate-pulse rounded-[22px] bg-zinc-200" />
              <div className="px-2 pb-2 pt-4">
                <div className="h-3 w-16 animate-pulse rounded-md bg-zinc-200" />
                <div className="mt-2 h-4 w-full animate-pulse rounded-md bg-zinc-200" />
                <div className="mt-3 h-5 w-20 animate-pulse rounded-md bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}