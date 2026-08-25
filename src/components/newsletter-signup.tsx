"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Tag, Bell, Rocket, Lightbulb, ShieldCheck, MailX, Lock } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────
// Optional social-proof props. The component never invents subscriber
// counts, avatars, or testimonials on its own — pass real data from the
// server/CMS when you have it. Anything left undefined simply doesn't
// render, instead of showing a fabricated number.
// ─────────────────────────────────────────────────────────────────────────
type NewsletterSignupProps = {
  subscriberCount?: number;
  avatarUrls?: string[];
  testimonial?: { quote: string; name: string };
};

const BENEFITS = [
  { icon: Tag, label: "Exclusive deals", detail: "Offers before they go public." },
  { icon: Lightbulb, label: "AI shopping tips", detail: "Smarter picks, less guesswork." },
  { icon: Rocket, label: "Early access", detail: "New drops before anyone else." },
  { icon: Bell, label: "Price drop alerts", detail: "Know the second a price falls." },
  { icon: Sparkles, label: "Weekly recommendations", detail: "Curated to what you browse." },
];

const ANIMATED_PLACEHOLDERS = [
  "you@example.com",
  "Where should deals land?",
  "Your best email",
];

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

export function NewsletterSignup({ subscriberCount, avatarUrls, testimonial }: NewsletterSignupProps) {
  // ───────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION LOGIC — UNCHANGED. Same endpoint, same payload, same
  // success/error handling and state names.
  // ───────────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe.");
      }
      setMessage("Thanks for subscribing!");
      setEmail("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Subscription failed.");
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────
  // UI-ONLY STATE — presentation, focus, success choreography. None of
  // this touches the submit handler above.
  // ───────────────────────────────────────────────────────────────────────
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const wasLoading = useRef(false);
  const [justSucceeded, setJustSucceeded] = useState(false);

  const emailLooksValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const isSuccess = !loading && message === "Thanks for subscribing!";
  const isError = !loading && !!message && !isSuccess;

  // Detect the loading -> success transition to fire the confetti once.
  useEffect(() => {
    if (wasLoading.current && !loading && message === "Thanks for subscribing!") {
      setJustSucceeded(true);
      const t = setTimeout(() => setJustSucceeded(false), 1400);
      return () => clearTimeout(t);
    }
    wasLoading.current = loading;
  }, [loading, message]);

  useEffect(() => {
    if (email || focused) return;
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % ANIMATED_PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [email, focused]);

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        delay: Math.round(Math.random() * 200),
        hue: i % 2 === 0 ? "#8B6CFF" : "#22C7E0",
        drift: Math.round((Math.random() - 0.5) * 60),
      })),
    [justSucceeded]
  );

  return (
    <section className="cqn-font relative isolate overflow-hidden rounded-[36px] bg-[#07070B] px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap');
        .cqn-font { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cqn-display { font-family: 'Space Grotesk', 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cqn-gradient-text {
          background: linear-gradient(90deg, #8B6CFF 0%, #22C7E0 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .cqn-underline {
          position: relative; display: inline-block;
        }
        .cqn-underline::after {
          content: ""; position: absolute; left: 2%; right: 2%; bottom: -0.06em; height: 0.09em;
          background: linear-gradient(90deg, #8B6CFF, #22C7E0);
          border-radius: 999px;
          transform: scaleX(0); transform-origin: left;
        }
        .cqn-underline.cqn-underline-in::after { transform: scaleX(1); transition: transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s; }

        .cqn-glass { background: rgba(255,255,255,0.045); backdrop-filter: blur(20px) saturate(140%); -webkit-backdrop-filter: blur(20px) saturate(140%); }
        .cqn-gradient-border { position: relative; }
        .cqn-gradient-border::before {
          content: ""; position: absolute; inset: 0; padding: 1px; border-radius: inherit;
          background: linear-gradient(135deg, rgba(139,108,255,0.55), rgba(34,199,224,0.18) 45%, rgba(255,255,255,0.12));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
        }
        .cqn-focus-ring:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(139,108,255,0.4); }

        .cqn-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
        }

        .cqn-btn-primary {
          background: linear-gradient(120deg, #7C5CFC 0%, #22C7E0 130%);
          box-shadow: 0 1px 0 rgba(255,255,255,0.25) inset, 0 14px 30px -10px rgba(124,92,252,0.55);
        }
        .cqn-btn-primary:hover:not(:disabled) {
          box-shadow: 0 1px 0 rgba(255,255,255,0.3) inset, 0 18px 36px -8px rgba(124,92,252,0.65);
        }
        .cqn-ripple { position: relative; overflow: hidden; }
        .cqn-ripple::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit;
          background: radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 60%);
          opacity: 0; transform: scale(0.4); transition: transform 0.5s ease, opacity 0.6s ease;
        }
        .cqn-ripple:active::after { opacity: 1; transform: scale(1.4); transition: 0s; }

        @media (prefers-reduced-motion: no-preference) {
          .cqn-rise { animation: cqn-rise 0.6s cubic-bezier(0.16,1,0.3,1) both; }
          .cqn-rise-1 { animation-delay: 0.02s; } .cqn-rise-2 { animation-delay: 0.09s; }
          .cqn-rise-3 { animation-delay: 0.16s; } .cqn-rise-4 { animation-delay: 0.23s; }
          .cqn-drift-a { animation: cqn-drift-a 18s ease-in-out infinite; }
          .cqn-drift-b { animation: cqn-drift-b 22s ease-in-out infinite; }
          .cqn-particle { animation: cqn-particle linear infinite; }
          .cqn-check-draw { stroke-dasharray: 40; stroke-dashoffset: 40; animation: cqn-check-draw 0.5s ease forwards 0.1s; }
          .cqn-confetti { animation: cqn-confetti 1.1s cubic-bezier(0.16,1,0.3,1) forwards; }
          .cqn-card-in { animation: cqn-card-in 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        }
        @keyframes cqn-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cqn-drift-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(26px,-18px) scale(1.05); } }
        @keyframes cqn-drift-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-22px,20px) scale(1.07); } }
        @keyframes cqn-particle { from { transform: translateY(0); opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.3; } to { transform: translateY(-140px); opacity: 0; } }
        @keyframes cqn-check-draw { to { stroke-dashoffset: 0; } }
        @keyframes cqn-confetti { to { transform: translateY(90px) translateX(var(--drift, 0px)) rotate(180deg); opacity: 0; } }
        @keyframes cqn-card-in { from { opacity: 0; transform: scale(0.96) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      {/* Ambient gradient wash + noise + floating particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="cqn-drift-a absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(124,92,252,0.32),transparent_70%)] blur-3xl" />
        <div className="cqn-drift-b absolute -bottom-24 -right-16 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(34,199,224,0.26),transparent_70%)] blur-3xl" />
        <div className="cqn-noise absolute inset-0 opacity-[0.05]" />
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="cqn-particle absolute bottom-0 h-1 w-1 rounded-full bg-white/40"
            style={{
              left: `${(i * 9.7) % 100}%`,
              animationDuration: `${8 + (i % 5) * 2}s`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="cqn-rise cqn-rise-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/80">
          <Sparkles className="h-3.5 w-3.5 text-[#8B6CFF]" aria-hidden />
          AI-POWERED SHOPPING DIGEST
        </span>

        <h2 className="cqn-rise cqn-rise-2 cqn-display mt-6 text-[2.4rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          Get the{" "}
          <span className="cqn-gradient-text cqn-underline cqn-underline-in">smarter</span>{" "}
          way to shop.
        </h2>
        <p className="cqn-rise cqn-rise-2 mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/55">
          One weekly email — AI-picked deals, price drops, and recommendations
          tuned to what you actually browse. No noise, ever.
        </p>

        {/* Form / success card */}
        <div className="cqn-rise cqn-rise-3 mt-9 w-full max-w-lg">
          {isSuccess ? (
            <div
              role="status"
              aria-live="polite"
              className="cqn-card-in cqn-gradient-border cqn-glass relative overflow-hidden rounded-[28px] px-8 py-10"
            >
              {justSucceeded &&
                confettiPieces.map((p) => (
                  <span
                    key={p.id}
                    className="cqn-confetti pointer-events-none absolute top-6 h-2 w-2 rounded-sm"
                    style={{
                      left: `${p.left}%`,
                      background: p.hue,
                      animationDelay: `${p.delay}ms`,
                      // @ts-ignore custom property for keyframe drift
                      "--drift": `${p.drift}px`,
                    }}
                  />
                ))}

              <div className="relative z-10 flex flex-col items-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#8B6CFF] to-[#22C7E0]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                    <path
                      className="cqn-check-draw"
                      d="M5 13l4 4L19 7"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="cqn-display mt-4 text-lg font-semibold">You're on the list.</p>
                <p className="mt-1 text-[14px] text-white/55">First drop lands in your inbox this week.</p>
                <button
                  onClick={() => setMessage(null)}
                  className="cqn-focus-ring mt-5 rounded-full border border-white/15 px-4 py-2 text-[13px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  Subscribe another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="relative flex-1">
                <Sparkles
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B6CFF]"
                />
                <input
                  id="cqn-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => { setFocused(false); setTouched(true); }}
                  type="email"
                  required
                  placeholder={focused || email ? "" : ANIMATED_PLACEHOLDERS[placeholderIdx]}
                  aria-label="Email address"
                  aria-invalid={touched && email.length > 0 && !emailLooksValid}
                  aria-describedby={message ? "cqn-message" : undefined}
                  className={`cqn-focus-ring h-14 w-full rounded-2xl border bg-white/[0.06] pl-11 pr-4 text-[15px] text-white outline-none transition-all placeholder:text-white/35 ${
                    touched && email.length > 0 && !emailLooksValid
                      ? "border-red-400/60"
                      : "border-white/15 focus:border-[#8B6CFF]/60"
                  }`}
                />
                <label htmlFor="cqn-email" className="sr-only">
                  Email address
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cqn-btn-primary cqn-ripple cqn-font group flex h-14 flex-none items-center justify-center gap-2 rounded-2xl px-7 text-[15px] font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
                  </>
                )}
              </button>
            </form>
          )}

          {message && !isSuccess && (
            <p id="cqn-message" role="alert" className="cqn-rise mt-3 text-left text-[13.5px] text-red-300">
              {message}
            </p>
          )}
        </div>

        {/* Social proof — only renders what the caller actually provides */}
        {(subscriberCount || (avatarUrls && avatarUrls.length > 0)) && (
          <div className="cqn-rise cqn-rise-4 mt-7 flex items-center gap-3">
            {avatarUrls && avatarUrls.length > 0 && (
              <div className="flex -space-x-2.5">
                {avatarUrls.slice(0, 5).map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt=""
                    aria-hidden
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border-2 border-[#07070B] object-cover"
                  />
                ))}
              </div>
            )}
            {typeof subscriberCount === "number" && subscriberCount > 0 && (
              <p className="text-[13px] text-white/50">
                Joined by <span className="font-semibold text-white/80">{formatCount(subscriberCount)}</span> shoppers
              </p>
            )}
          </div>
        )}

        {testimonial && (
          <blockquote className="cqn-rise cqn-rise-4 mt-6 max-w-md">
            <p className="text-[13.5px] italic leading-relaxed text-white/55">"{testimonial.quote}"</p>
            <footer className="mt-1.5 text-[12px] text-white/35">— {testimonial.name}</footer>
          </blockquote>
        )}

        {/* Trust badges */}
        <div className="cqn-rise cqn-rise-4 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/40">
          <span className="inline-flex items-center gap-1.5 text-[12px]">
            <MailX className="h-3.5 w-3.5" /> No spam, ever
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px]">
            <ShieldCheck className="h-3.5 w-3.5" /> One-click unsubscribe
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px]">
            <Lock className="h-3.5 w-3.5" /> Privacy protected · SSL secure
          </span>
        </div>

        {/* Benefit cards */}
        <div className="mt-12 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BENEFITS.map((b, i) => (
            <div
              key={b.label}
              className="cqn-rise cqn-gradient-border cqn-glass group flex flex-col items-start gap-3 rounded-2xl p-4 text-left transition-all hover:-translate-y-1"
              style={{ animationDelay: `${0.28 + i * 0.06}s` }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B6CFF]/25 to-[#22C7E0]/25">
                <b.icon className="h-4.5 w-4.5 text-[#a996ff]" />
              </span>
              <div>
                <p className="cqn-font text-[13px] font-semibold text-white/90">{b.label}</p>
                <p className="cqn-font mt-0.5 text-[11.5px] leading-snug text-white/40">{b.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}