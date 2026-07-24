export default function AssistantLoading() {
  return (
    <div className="flex h-screen bg-white">

      {/* Sidebar */}
      <div className="hidden w-72 shrink-0 flex-col border-r border-black/5 bg-zinc-50 p-4 md:flex">
        {/* New chat button */}
        <div className="h-11 w-full animate-pulse rounded-2xl bg-zinc-200" />

        {/* Conversation cards */}
        <div className="mt-6 space-y-2.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-black/5 bg-white p-3.5"
            >
              <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-zinc-200" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded-md bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">

        {/* AI banner */}
        <div className="border-b border-black/5 p-6">
          <div className="mx-auto max-w-3xl rounded-[24px] bg-gradient-to-br from-indigo-50 to-teal-50 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200" />
              <div className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded-md bg-zinc-200" />
                <div className="h-3 w-56 animate-pulse rounded-md bg-zinc-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Chat bubbles */}
        <div className="flex-1 space-y-5 overflow-y-auto p-8">
          <div className="mx-auto max-w-3xl space-y-5">

            {/* Assistant bubble */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-zinc-200" />
              <div className="space-y-2">
                <div className="h-4 w-72 animate-pulse rounded-2xl bg-zinc-200" />
                <div className="h-4 w-52 animate-pulse rounded-2xl bg-zinc-200" />
              </div>
            </div>

            {/* User bubble */}
            <div className="ml-auto flex w-fit items-start justify-end gap-3">
              <div className="h-10 w-48 animate-pulse rounded-2xl bg-zinc-200" />
            </div>

            {/* Assistant bubble with product-card-like block */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-zinc-200" />
              <div className="w-full max-w-md space-y-3">
                <div className="h-4 w-64 animate-pulse rounded-2xl bg-zinc-200" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
                  <div className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
                </div>
              </div>
            </div>

            {/* Suggested prompts */}
            <div className="flex flex-wrap gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-32 animate-pulse rounded-full bg-zinc-200"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Input box */}
        <div className="border-t border-black/5 bg-white p-6">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="h-14 flex-1 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-14 w-20 animate-pulse rounded-2xl bg-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}