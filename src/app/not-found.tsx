import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">404</p>
      <h1 className="mt-3 text-4xl font-semibold text-zinc-950">The page you’re looking for isn’t here.</h1>
      <p className="mt-4 text-lg leading-8 text-zinc-600">It may have moved or been removed, but the collection is still waiting.</p>
      <Link href="/" className="mt-8 rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white">
        Return home
      </Link>
    </div>
  );
}
