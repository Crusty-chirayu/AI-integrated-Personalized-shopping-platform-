export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="max-w-md rounded-3xl border border-red-200 bg-white p-10 text-center shadow-xl">
        <h1 className="text-3xl font-bold text-red-600">
          Authentication Failed
        </h1>

        <p className="mt-4 text-zinc-600">
          We couldn't sign you in.
          Please try again or choose another login method.
        </p>

        <a
          href="/login"
          className="mt-8 inline-flex rounded-xl bg-black px-6 py-3 text-white transition hover:bg-zinc-800"
        >
          Back to Login
        </a>
      </div>
    </main>
  );
}