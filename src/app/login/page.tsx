    "use client";

    import Link from "next/link";
    import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
    

export default function LoginPage() {
  const router = useRouter();

  const { signIn, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/account");
    }
  }, [user, authLoading, router]);

async function handleLogin(e: React.FormEvent) {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    await signIn(email, password);

    setLoading(false);

    router.replace("/account");
  } catch (err: any) {
    setError(err.message || "Login failed.");
    setLoading(false);
  }
}

  return (
        <main className="relative min-h-screen overflow-hidden bg-white text-black">
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

            .cq-font { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }

            .cq-gradient-text {
            background: linear-gradient(90deg, #7C5CFC 0%, #22C7E0 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            }

            .cq-logo-i { color: #7C5CFC; }
            .cq-logo-q { color: #22C7E0; }

            .cq-focus:focus {
            outline: none;
            border-color: #111111;
            box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.18);
            }

            .cq-fab {
            box-shadow: 0 10px 24px rgba(0,0,0,0.14);
            }

            @media (prefers-reduced-motion: no-preference) {
            .cq-rise { animation: cq-rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
            .cq-rise-1 { animation-delay: 0.03s; }
            .cq-rise-2 { animation-delay: 0.1s; }
            .cq-rise-3 { animation-delay: 0.17s; }
            .cq-rise-4 { animation-delay: 0.24s; }
            }
            @keyframes cq-rise {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
            }
        `}</style>

        {/* Ambient gradient wash */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(124,92,252,0.16),transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(34,199,224,0.14),transparent_70%)] blur-2xl" />

        {/* Wordmark */}
        <div className="relative z-10 px-8 pt-8 md:px-16">
            <Link href="/" className="cq-font inline-flex items-baseline text-2xl font-extrabold tracking-tight">
            <span>Cart</span>
            <span className="cq-logo-i">I</span>
            <span className="cq-logo-q">Q</span>
            </Link>
        </div>

        {/* Centered auth card */}
        <div className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
            <div className="cq-rise cq-rise-1 mb-6 flex justify-center">
                <span className="cq-font inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-[#7C5CFC] shadow-sm">
                <span aria-hidden>✨</span>
                SECURE SIGN IN
                </span>
            </div>

            <h1 className="cq-rise cq-rise-2 cq-font text-center text-4xl font-extrabold tracking-tight leading-tight">
                Welcome <span className="cq-gradient-text">back.</span>
            </h1>
            <p className="cq-rise cq-rise-2 cq-font mt-3 text-center text-[15px] text-gray-500">
                Sign in to your CartIQ account to pick up your matches,
                comparisons, and saved finds.
            </p>

            <div className="cq-rise cq-rise-3 relative mt-9 rounded-3xl border border-black/5 bg-white p-8 shadow-[0_20px_50px_rgba(17,17,17,0.08)]">
<form
  onSubmit={handleLogin}
  className="space-y-5"
>                <div>
                    <label className="cq-font mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                    </label>


<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
  required
  className="cq-font cq-focus w-full rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 py-3.5 text-[15px] transition-all"
/>


                </div>
<div>
  <label className="cq-font mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
    Password
  </label>

  <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    required
    className="cq-font cq-focus w-full rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 py-3.5 text-[15px] transition-all"
  />
</div>

{error && (
  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
    {error}
  </div>
)}

<button
  type="submit"
  disabled={loading}
  className="cq-font group flex w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 text-[15px] font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? "Signing in..." : "Sign in"}

  {!loading && (
    <span
      className="transition-transform group-hover:translate-x-0.5"
      aria-hidden
    >
      →
    </span>
  )}
</button>
                </form>

                {/* Floating accent card, echoes the "response time" stat card */}
                <div className="cq-rise cq-rise-4 absolute -right-6 -top-6 hidden rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-[0_12px_28px_rgba(17,17,17,0.12)] sm:block">
                <div className="cq-font text-[10px] uppercase tracking-wide text-gray-400">
                    Encryption
                </div>
                <div className="cq-font text-base font-extrabold">
                    256-<span className="cq-gradient-text">bit</span>
                </div>
                </div>
            </div>

            <p className="cq-rise cq-rise-4 cq-font mt-7 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link href="/register" className="font-semibold text-black underline decoration-[#7C5CFC] decoration-2 underline-offset-4">
                Register
                </Link>
            </p>
            </div>
        </div>
        </main>
    );
    }