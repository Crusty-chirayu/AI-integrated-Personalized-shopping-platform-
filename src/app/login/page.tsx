"use client";

import Link from "next/link";
import { LoginButtons } from "@/components/login-buttons";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();

  // ─────────────────────────────────────────────────────────────────
  // AUTH LOGIC — UNCHANGED. Do not modify signIn / useAuth wiring.
  // ─────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────
  // UI-ONLY STATE — purely presentational, never touches auth flow.
  // ─────────────────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Lightweight count-up for the stat row (cosmetic only).
  const [scanCount, setScanCount] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const target = 42;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setScanCount(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // TODO(auth): wire real OAuth handlers (Google / Microsoft / GitHub)
  // through useAuth once those providers are available. This is a
  // presentational stub only — it intentionally does not claim to sign
  // the user in.


  return (
    <main className="cq-shell cq-font relative min-h-screen overflow-hidden bg-[#07070B] lg:bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap');

        .cq-font { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cq-display { font-family: 'Space Grotesk', 'Inter', ui-sans-serif, system-ui, sans-serif; }

        .cq-gradient-text {
          background: linear-gradient(90deg, #8B6CFF 0%, #22C7E0 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .cq-logo-i { color: #8B6CFF; }
        .cq-logo-q { color: #22C7E0; }

        .cq-focus:focus {
          outline: none;
          border-color: #8B6CFF;
          box-shadow: 0 0 0 4px rgba(139, 108, 255, 0.16);
        }
        .cq-focus-dark:focus {
          outline: none;
          border-color: rgba(139, 108, 255, 0.6);
          box-shadow: 0 0 0 4px rgba(139, 108, 255, 0.22);
        }

        /* Noise texture overlay, used at low opacity for tactility */
        .cq-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
        }

        .cq-glass {
          background: rgba(255, 255, 255, 0.66);
          backdrop-filter: blur(22px) saturate(160%);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
        }
        .cq-glass-dark {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(18px) saturate(140%);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
        }

        .cq-gradient-border {
          position: relative;
        }
        .cq-gradient-border::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(139,108,255,0.55), rgba(34,199,224,0.15) 40%, rgba(255,255,255,0.35));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .cq-btn-primary {
          background: linear-gradient(120deg, #7C5CFC 0%, #22C7E0 130%);
          box-shadow: 0 1px 0 rgba(255,255,255,0.25) inset, 0 14px 30px -10px rgba(124, 92, 252, 0.55);
        }
        .cq-btn-primary:hover:not(:disabled) {
          box-shadow: 0 1px 0 rgba(255,255,255,0.3) inset, 0 18px 36px -8px rgba(124, 92, 252, 0.65);
        }

        /* Ripple */
        .cq-ripple { position: relative; overflow: hidden; }
        .cq-ripple::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 60%);
          opacity: 0;
          transform: scale(0.4);
          transition: transform 0.5s ease, opacity 0.6s ease;
        }
        .cq-ripple:active::after {
          opacity: 1;
          transform: scale(1.4);
          transition: 0s;
        }

        .cq-orbit-core {
          filter: drop-shadow(0 0 18px rgba(139, 108, 255, 0.55));
        }

        @media (prefers-reduced-motion: no-preference) {
          .cq-rise { animation: cq-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
          .cq-rise-1 { animation-delay: 0.02s; }
          .cq-rise-2 { animation-delay: 0.09s; }
          .cq-rise-3 { animation-delay: 0.16s; }
          .cq-rise-4 { animation-delay: 0.23s; }
          .cq-rise-5 { animation-delay: 0.30s; }

          .cq-drift-a { animation: cq-drift-a 16s ease-in-out infinite; }
          .cq-drift-b { animation: cq-drift-b 20s ease-in-out infinite; }
          .cq-spin-slow { animation: cq-spin 26s linear infinite; }
          .cq-spin-slow-rev { animation: cq-spin-rev 34s linear infinite; }
          .cq-pulse-soft { animation: cq-pulse-soft 3.2s ease-in-out infinite; }
        }

        @keyframes cq-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cq-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.06); }
        }
        @keyframes cq-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-24px, 26px) scale(1.08); }
        }
        @keyframes cq-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes cq-spin-rev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes cq-pulse-soft {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>

      <div className="relative flex min-h-screen w-full">
        {/* ═══════════════════════════ LEFT PANEL ═══════════════════════════ */}
        <section className="relative hidden w-[46%] flex-col justify-between overflow-hidden px-14 py-12 text-white lg:flex xl:w-[42%]">
          {/* Ambient gradient wash + noise */}
          <div className="absolute inset-0 bg-[#07070B]" />
          <div className="cq-drift-a pointer-events-none absolute -top-32 -left-24 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(124,92,252,0.35),transparent_70%)] blur-3xl" />
          <div className="cq-drift-b pointer-events-none absolute bottom-0 -right-20 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(34,199,224,0.28),transparent_70%)] blur-3xl" />
          <div className="cq-noise pointer-events-none absolute inset-0 opacity-[0.05]" />

          {/* Logo */}
          <Link href="/" className="cq-rise cq-rise-1 relative z-10 inline-flex w-fit items-baseline text-2xl font-extrabold tracking-tight">
            <span>Cart</span>
            <span className="cq-logo-i">I</span>
            <span className="cq-logo-q">Q</span>
          </Link>

          {/* Signature element: AI Match Radar */}
          <div className="cq-rise cq-rise-2 relative z-10 flex flex-1 flex-col justify-center">
            <div className="relative mx-auto mb-10 flex h-64 w-64 items-center justify-center">
              <div className="cq-spin-slow absolute inset-0 rounded-full border border-dashed border-white/15" />
              <div className="cq-spin-slow-rev absolute inset-6 rounded-full border border-white/10" />

              {/* orbiting product nodes */}
              <div className="cq-spin-slow absolute inset-0">
                <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-[#22C7E0] shadow-[0_0_14px_rgba(34,199,224,0.8)]" />
              </div>
              <div className="cq-spin-slow-rev absolute inset-0">
                <span className="absolute bottom-2 left-4 h-2.5 w-2.5 rounded-full bg-[#8B6CFF] shadow-[0_0_14px_rgba(139,108,255,0.8)]" />
              </div>
              <div className="cq-spin-slow absolute inset-0" style={{ animationDelay: "-8s" }}>
                <span className="absolute bottom-6 right-2 h-2 w-2 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
              </div>

              {/* core */}
              <div className="cq-orbit-core cq-pulse-soft relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#8B6CFF] to-[#22C7E0]">
                <span className="cq-display text-sm font-semibold text-white">AI</span>
              </div>
            </div>

            <h1 className="cq-display text-center text-[2.35rem] font-semibold leading-[1.08] tracking-tight">
              Every product,
              <br />
              <span className="cq-gradient-text">weighed and matched.</span>
            </h1>
            <p className="cq-font mx-auto mt-4 max-w-sm text-center text-[15px] leading-relaxed text-white/55">
              CartIQ's engine cross-checks price, quality, and reviews in real
              time, so the comparison is already done before you open the tab.
            </p>

            {/* Feature highlights */}
            <ul className="mx-auto mt-9 flex max-w-sm flex-col gap-4">
              {[
                { label: "Live price tracking", detail: "Alerts the moment a saved item drops." },
                { label: "Verified review scoring", detail: "Filters out noise, surfaces what matters." },
                { label: "One-tap comparisons", detail: "Line up alternatives without new tabs." },
              ].map((f) => (
                <li key={f.label} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C7E0]" />
                  </span>
                  <div>
                    <p className="cq-font text-[14px] font-semibold text-white/90">{f.label}</p>
                    <p className="cq-font text-[13px] text-white/45">{f.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Stat row + testimonial */}
          <div className="cq-rise cq-rise-3 relative z-10 space-y-6">
            <div className="flex items-center gap-8 border-t border-white/10 pt-6">
              <div>
                <div className="cq-display text-2xl font-semibold">{scanCount}M+</div>
                <div className="cq-font text-[12px] text-white/45">price points scanned daily</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="cq-display text-2xl font-semibold">256-bit</div>
                <div className="cq-font text-[12px] text-white/45">end-to-end encryption</div>
              </div>
            </div>

            {/* Testimonial — replace with a real customer quote before shipping */}
            <blockquote className="cq-glass-dark cq-gradient-border rounded-2xl p-5">
              <p className="cq-font text-[13.5px] leading-relaxed text-white/75">
                "I stopped opening six tabs to compare a single purchase.
                CartIQ just hands me the answer."
              </p>
              <footer className="cq-font mt-3 text-[12px] text-white/40">
                — Verified CartIQ shopper
              </footer>
            </blockquote>
          </div>
        </section>

        {/* ═══════════════════════════ RIGHT PANEL ═══════════════════════════ */}
        <section className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-white px-6 py-12">
          <div className="pointer-events-none absolute -top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(124,92,252,0.14),transparent_70%)] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(34,199,224,0.12),transparent_70%)] blur-2xl" />

          {/* Mobile-only wordmark */}
          <Link href="/" className="cq-font absolute left-6 top-6 inline-flex items-baseline text-xl font-extrabold tracking-tight lg:hidden">
            <span>Cart</span>
            <span className="cq-logo-i">I</span>
            <span className="cq-logo-q">Q</span>
          </Link>

          <div className="relative z-10 w-full max-w-md">
            <div className="cq-rise cq-rise-1 mb-6 flex justify-center">
              <span className="cq-font inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-[#7C5CFC] shadow-sm">
                <span aria-hidden>✨</span>
                SECURE SIGN IN
              </span>
            </div>

            <h1 className="cq-rise cq-rise-2 cq-display text-center text-[2.15rem] font-semibold tracking-tight leading-tight text-black">
              Welcome <span className="cq-gradient-text">back.</span>
            </h1>
            <p className="cq-rise cq-rise-2 cq-font mt-3 text-center text-[15px] text-gray-500">
              Sign in to your CartIQ account to pick up your matches,
              comparisons, and saved finds.
            </p>

            <div className="cq-rise cq-rise-3 cq-gradient-border relative mt-9 rounded-[32px] bg-white/80 p-8 shadow-[0_24px_60px_rgba(17,17,17,0.10)] cq-glass">
              <form onSubmit={handleLogin} noValidate className="space-y-5">
                {/* Email — floating label */}
                <div className="relative">
                  <input
                    id="cq-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder=" "
                    required
                    aria-invalid={emailTouched && !emailValid}
                    aria-describedby="cq-email-hint"
                    className="cq-font cq-focus peer w-full rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 pb-2.5 pt-5 text-[15px] transition-all"
                  />
                  <label
                    htmlFor="cq-email"
                    className="cq-font pointer-events-none absolute left-4 top-4 text-[15px] text-gray-400 transition-all peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-[#7C5CFC] peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-semibold peer-[&:not(:placeholder-shown)]:text-gray-500"
                  >
                    Email
                  </label>
                  {emailTouched && email.length > 0 && !emailValid && (
                    <p id="cq-email-hint" className="cq-font mt-1.5 pl-1 text-[12px] text-red-500">
                      Enter a valid email address.
                    </p>
                  )}
                </div>

                {/* Password — floating label + visibility toggle */}
                <div>
                  <div className="relative">
                    <input
                      id="cq-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" "
                      required
                      className="cq-font cq-focus peer w-full rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 pb-2.5 pt-5 pr-12 text-[15px] transition-all"
                    />
                    <label
                      htmlFor="cq-password"
                      className="cq-font pointer-events-none absolute left-4 top-4 text-[15px] text-gray-400 transition-all peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-[#7C5CFC] peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-semibold peer-[&:not(:placeholder-shown)]:text-gray-500"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC]/40"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="mt-2 flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="cq-font text-[13px] font-medium text-gray-500 underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-black hover:decoration-[#7C5CFC]"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="cq-rise rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="cq-btn-primary cq-ripple cq-font group flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-black/10" />
                <span className="cq-font text-[11px] font-medium uppercase tracking-wide text-gray-400">or continue with</span>
                <span className="h-px flex-1 bg-black/10" />
              </div>



              {/* Floating accent card */}
              <div className="cq-rise cq-rise-4 absolute -right-6 -top-6 hidden rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-[0_12px_28px_rgba(17,17,17,0.12)] sm:block">
                <div className="cq-font text-[10px] uppercase tracking-wide text-gray-400">Encryption</div>
                <div className="cq-font text-base font-extrabold">
                  256-<span className="cq-gradient-text">bit</span>
                </div>
              </div>
            </div>

            {/* Trust row */}
            <div className="cq-rise cq-rise-4 mt-6 flex items-center justify-center gap-5 text-gray-400">
              <span className="cq-font inline-flex items-center gap-1.5 text-[12px]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" />
                </svg>
                SSL secured
              </span>
              <span className="cq-font inline-flex items-center gap-1.5 text-[12px]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V7a4 4 0 1 1 8 0v3" />
                </svg>
                2FA ready
              </span>
              <span className="cq-font inline-flex items-center gap-1.5 text-[12px]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-2-7-5.5-7-10V5l7-2 7 2v6c0 4.5-3 8-7 10Z" />
                </svg>
                Privacy-first
              </span>
            </div>

            <p className="cq-rise cq-rise-5 cq-font mt-7 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="font-semibold text-black underline decoration-[#7C5CFC] decoration-2 underline-offset-4">
                Register
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}