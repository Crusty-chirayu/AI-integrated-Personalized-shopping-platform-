export default function CartLoading() {
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
          {/* Badge */}
          <div className="h-7 w-32 animate-pulse rounded-full bg-zinc-200" />

          {/* Heading */}
          <div className="mt-5 h-10 w-80 animate-pulse rounded-xl bg-zinc-200" />

          {/* Subtitle */}
          <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded-lg bg-zinc-200" />

          {/* Item count */}
          <div className="mt-3 h-4 w-28 animate-pulse rounded-lg bg-zinc-200" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">

          {/* Cart items */}
          <div>
            {/* Continue shopping link */}
            <div className="h-4 w-36 animate-pulse rounded-lg bg-zinc-200" />

            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-white p-4 sm:flex-row sm:items-center"
                >
                  {/* Product image */}
                  <div className="h-28 w-28 shrink-0 animate-pulse rounded-[18px] bg-zinc-200" />

                  {/* Product info */}
                  <div className="flex-1 space-y-2.5">
                    <div className="h-3 w-16 animate-pulse rounded-md bg-zinc-200" />
                    <div className="h-4 w-3/4 animate-pulse rounded-md bg-zinc-200" />
                    <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-200" />
                  </div>

                  {/* Quantity + remove */}
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-3">
                    <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-200" />
                    <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-200" />
                  </div>
                </div>
              ))}
            </div>

            {/* AI suggestions strip */}
            <div className="mt-14 h-32 animate-pulse rounded-[28px] bg-zinc-200" />
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[32px] border border-black/5 bg-white p-8">
              <div className="h-3 w-28 animate-pulse rounded-md bg-zinc-200" />

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-200" />
                  <div className="h-4 w-12 animate-pulse rounded-md bg-zinc-200" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-200" />
                  <div className="h-4 w-12 animate-pulse rounded-md bg-zinc-200" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-200" />
                  <div className="h-4 w-12 animate-pulse rounded-md bg-zinc-200" />
                </div>
                <div className="flex justify-between border-t border-black/5 pt-4">
                  <div className="h-5 w-20 animate-pulse rounded-md bg-zinc-200" />
                  <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-200" />
                </div>
              </div>

              {/* Checkout button */}
              <div className="mt-8 h-14 w-full animate-pulse rounded-full bg-zinc-200" />
            </div>

            {/* Trust section */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-2xl bg-zinc-200"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}