"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Lock,
  MessageSquare,
  Search,
  Sparkles,
  Wand2,
  ArrowUpRight,
} from "lucide-react";
import { Manrope, Inter, IBM_Plex_Mono } from "next/font/google";
import { ProductCard } from "@/components/product-card";import { NewsletterSignup } from "@/components/newsletter-signup";
import type {
  getFeaturedCategories,
  getHeroSlides,
  getProducts,
  getTestimonials,
} from "@/lib/supabase-data";

type Products = Awaited<ReturnType<typeof getProducts>>;
type FeaturedCategories = Awaited<ReturnType<typeof getFeaturedCategories>>;
type HeroSlides = Awaited<ReturnType<typeof getHeroSlides>>;
type Testimonials = Awaited<ReturnType<typeof getTestimonials>>;

/* ------------------------------------------------------------------------ */
/* Fonts — a geometric display face for scale + presence, a quiet body      */
/* face for reading, and a mono face reserved for data, labels, and eyebrows */
/* ------------------------------------------------------------------------ */

const display = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

/* ------------------------------------------------------------------------ */
/* Static content                                                           */
/* ------------------------------------------------------------------------ */

const WHY_CARTIQ = [
  {
    icon: Brain,
    title: "AI Recommendations",
    description: "Suggestions that get sharper with every product you view.",
  },
  {
    icon: MessageSquare,
    title: "Conversational Shopping",
    description: "Just describe what you need — CartIQ finds it for you.",
  },
  {
    icon: Wand2,
    title: "Personalized Suggestions",
    description: "A storefront that adapts to your taste, not the other way around.",
  },
  {
    icon: Sparkles,
    title: "Smart Product Discovery",
    description: "Surface pieces you'd never have thought to search for.",
  },
  {
    icon: Search,
    title: "Intelligent Search",
    description: "Search by intent, not keywords — typos and all.",
  },
  {
    icon: Lock,
    title: "Secure Shopping",
    description: "Encrypted checkout and protected data, every order.",
  },
];

const DEMO_QUERIES = [
  { query: "Show me white sneakers under ₹3,000", matches: 3 },
  { query: "A lightweight jacket for winter travel", matches: 5 },
  { query: "Gift for my sister who loves skincare", matches: 4 },
  { query: "Budget headphones with noise cancellation", matches: 6 },
];

const HERO_STATS = [
  { label: "Products indexed", value: 2400000, suffix: "+", format: "compact" as const },
  { label: "Avg. response time", value: 0.8, suffix: "s", format: "decimal" as const },
  { label: "Match accuracy", value: 98, suffix: "%", format: "integer" as const },
];

const PROMO_STATS = [
  { label: "Products indexed", value: 2.4, suffix: "M+", format: "decimal" as const },
  { label: "Avg. AI response", value: 180, suffix: "ms", format: "integer" as const },
  { label: "Uptime SLA", value: 99.98, suffix: "%", format: "precise" as const },
];

/* ------------------------------------------------------------------------ */
/* Motion variants                                                          */
/* ------------------------------------------------------------------------ */

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const riseIn: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ------------------------------------------------------------------------ */
/* Reveal — generic scroll-triggered reveal wrapper, animates once          */
/* ------------------------------------------------------------------------ */

function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? undefined : { opacity: 0, y }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------------ */
/* AnimatedCounter — counts up once when it scrolls into view               */
/* ------------------------------------------------------------------------ */

function formatValue(
  value: number,
  format: "compact" | "decimal" | "integer" | "precise"
) {
  switch (format) {
    case "compact":
      return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
    case "decimal":
      return value.toFixed(1);
    case "precise":
      return value.toFixed(2);
    case "integer":
    default:
      return Math.round(value).toString();
  }
}

function AnimatedCounter({
  value,
  suffix = "",
  format = "integer",
  duration = 1.4,
}: {
  value: number;
  suffix?: string;
  format?: "compact" | "decimal" | "integer" | "precise";
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (!inView || shouldReduceMotion) {
      if (shouldReduceMotion) setDisplay(value);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, shouldReduceMotion]);

  return (
    <span ref={ref}>
      {formatValue(display, format)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------------ */
/* FloatingBlobs — ambient, slow-moving gradient mesh for atmosphere        */
/* ------------------------------------------------------------------------ */

function FloatingBlobs({ variant = "hero" }: { variant?: "hero" | "banner" }) {
  const shouldReduceMotion = useReducedMotion();

  const blobs =
    variant === "hero"
      ? [
          { className: "left-[-10%] top-[-10%] h-[32rem] w-[32rem] bg-indigo-600/25", dx: 40, dy: 30, dur: 22 },
          { className: "right-[-8%] top-[10%] h-[26rem] w-[26rem] bg-teal-400/20", dx: -30, dy: 40, dur: 26 },
          { className: "left-[20%] bottom-[-15%] h-[24rem] w-[24rem] bg-violet-500/20", dx: 25, dy: -25, dur: 19 },
        ]
      : [
          { className: "right-[-6%] top-[-20%] h-[26rem] w-[26rem] bg-indigo-500/30", dx: -25, dy: 20, dur: 20 },
          { className: "left-[-8%] bottom-[-25%] h-[22rem] w-[22rem] bg-teal-400/25", dx: 25, dy: -20, dur: 24 },
        ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.className}`}
          animate={
            shouldReduceMotion
              ? undefined
              : { x: [0, blob.dx, 0], y: [0, blob.dy, 0] }
          }
          transition={{
            duration: blob.dur,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* AIQueryConsole — the signature element. A live, self-typing demo of the  */
/* conversational search CartIQ is actually built around, not a static mock */
/* ------------------------------------------------------------------------ */

function AIQueryConsole() {
  const shouldReduceMotion = useReducedMotion();
  const [queryIndex, setQueryIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "thinking" | "answered" | "erasing">("typing");

  const current = DEMO_QUERIES[queryIndex];

  useEffect(() => {
    if (shouldReduceMotion) {
      setTyped(current.query);
      setPhase("answered");
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (typed.length < current.query.length) {
        timeout = setTimeout(() => {
          setTyped(current.query.slice(0, typed.length + 1));
        }, 32);
      } else {
        timeout = setTimeout(() => setPhase("thinking"), 350);
      }
    } else if (phase === "thinking") {
      timeout = setTimeout(() => setPhase("answered"), 900);
    } else if (phase === "answered") {
      timeout = setTimeout(() => setPhase("erasing"), 2600);
    } else if (phase === "erasing") {
      if (typed.length > 0) {
        timeout = setTimeout(() => {
          setTyped(typed.slice(0, -1));
        }, 14);
      } else {
        timeout = setTimeout(() => {
          setQueryIndex((i) => (i + 1) % DEMO_QUERIES.length);
          setPhase("typing");
        }, 250);
      }
    }

    return () => clearTimeout(timeout);
  }, [typed, phase, current.query, shouldReduceMotion]);

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-2 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="flex items-center gap-2 px-4 pt-4">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-white/40">
          CartIQ AI · live
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5">
          <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.15em] text-white/35">
            You ask
          </p>
          <p className="mt-1.5 min-h-[1.5em] text-[15px] leading-relaxed text-white/90">
            {typed}
            <span
              className={`ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-teal-300 ${
                phase === "answered" ? "opacity-0" : "animate-pulse"
              }`}
            />
          </p>
        </div>

        <AnimatePresence mode="wait">
          {phase === "thinking" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-1 text-sm text-white/50"
            >
              <Sparkles className="h-4 w-4 animate-pulse text-teal-300" />
              CartIQ is thinking…
            </motion.div>
          )}

          {phase === "answered" && (
            <motion.div
              key={`answer-${queryIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-2.5"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-400">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white/[0.07] px-4 py-2.5 text-sm text-white/85">
                Found {current.matches} great matches — sorted by rating and price.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Hero                                                                      */
/* ------------------------------------------------------------------------ */

function Hero({ heroImage }: { heroImage?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-[#08080D]"
    >
      <FloatingBlobs variant="hero" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6) 1px, transparent 0), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.4) 1px, transparent 0), radial-gradient(1px 1px at 45% 80%, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "180px 180px",
        }}
      />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative mx-auto grid max-w-7xl gap-16 px-6 py-28 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-36"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          <motion.div variants={riseIn}>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-[-0.02em] text-white sm:text-5xl">
              Cart
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-300 bg-clip-text text-transparent">
                IQ
              </span>
            </h2>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-200 backdrop-blur-md">
              <motion.span
                animate={shouldReduceMotion ? undefined : { rotate: [0, 15, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-300" />
              </motion.span>
              Powered by CartIQ AI
            </div>
          </motion.div>

          <motion.h1
            variants={riseIn}
            className="mt-9 font-[family-name:var(--font-display)] text-[3.4rem] font-extrabold leading-[0.96] tracking-[-0.035em] text-white sm:text-7xl lg:text-[5.25rem]"
          >
            Shop smarter
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-teal-300 bg-clip-text text-transparent">
              with AI.
            </span>
          </motion.h1>

          <motion.p
            variants={riseIn}
            className="mt-7 max-w-xl text-lg leading-8 text-white/60"
          >
            CartIQ understands what you&apos;re looking for — personalized
            recommendations, intelligent search, and a shopping assistant you
            can actually talk to.
          </motion.p>

          <motion.div variants={riseIn} className="mt-11 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-400 to-teal-300 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-60" />
              Start shopping
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/assistant"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-white/85 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/[0.08]"
            >
              <MessageSquare className="h-4 w-4 text-teal-300" />
              Ask CartIQ AI
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </Link>
          </motion.div>

          <motion.dl
            variants={riseIn}
            className="mt-16 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-white/40">
                  {stat.label}
                </dt>
                <dd className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} format={stat.format} />
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Signature element: a live, self-typing AI shopping console */}
        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {heroImage ? (
              <div className="mb-4 overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
                <img
                  src={heroImage}
                  alt="Featured product"
                  className="h-56 w-full object-cover"
                />
              </div>
            ) : null}
            <AIQueryConsole />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="absolute -bottom-7 -left-7 hidden rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:block"
          >
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em] text-white/40">
              Response time
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
              &lt; 1s
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* Main export                                                              */
/* ------------------------------------------------------------------------ */

export function CartIQLanding({
  products,
  featuredCategories,
  heroSlides,
  testimonials,
}: {
  products: Products;
  featuredCategories: FeaturedCategories;
  heroSlides: HeroSlides;
  testimonials: Testimonials;
}) {
  const heroImage = useMemo(() => heroSlides[0]?.image, [heroSlides]);

  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable} bg-white font-[family-name:var(--font-body)]`}
    >
      <Hero heroImage={heroImage} />

      {/* ---------------------------------------------------------------- */}
      {/* Featured categories                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">
              Featured categories
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.02em] text-zinc-950 sm:text-4xl">
              Find your next favorite.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {featuredCategories.map((category, i) => (
            <Reveal key={category.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="group h-full overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm transition-shadow duration-300 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]"
              >
                <div className="overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-64 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-zinc-900">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-600">
                    {category.description}
                  </p>
                  <Link
                    href="/products"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition-all duration-300 group-hover:gap-3"
                  >
                    Explore <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Why CartIQ                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-y border-white/5 bg-[#0B0B12]">
        <FloatingBlobs variant="banner" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <Reveal className="max-w-2xl">
            <p className="font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.2em] text-teal-300">
              Why CartIQ
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
              Shopping, understood.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CARTIQ.map(({ icon: Icon, title, description }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition-colors duration-300 hover:border-indigo-400/30 hover:bg-white/[0.07]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-400 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-base font-bold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {description}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Products                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">
              Recommended for you
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.02em] text-zinc-950 sm:text-4xl">
              Trending products.
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i, 4) * 0.06} y={18}>
              <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <ProductCard product={product} />
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Promotional banner                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-zinc-950 p-10 text-white lg:p-16">
            <FloatingBlobs variant="banner" />

            <div className="relative grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.2em] text-teal-300">
                  AI-powered shopping
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
                  Faster discovery. Smarter checkout.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-8 text-zinc-400">
                  Personalized recommendations that learn as you shop, and a
                  secure checkout built for speed — every order, every time.
                </p>

                <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                  {PROMO_STATS.map((stat) => (
                    <div key={stat.label}>
                      <dt className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-white/40">
                        {stat.label}
                      </dt>
                      <dd className="mt-1.5 font-[family-name:var(--font-display)] text-xl font-bold text-white sm:text-2xl">
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} format={stat.format} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <Sparkles className="h-5 w-5 text-teal-300" />
                  Personalized recommendations
                </div>
                <div className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
                  <Search className="h-5 w-5 text-teal-300" />
                  Intelligent, typo-tolerant search
                </div>
                <div className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
                  <Lock className="h-5 w-5 text-teal-300" />
                  Secure, encrypted checkout
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Testimonials + Newsletter                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="h-full rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
              <p className="font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">
                Trusted by smart shoppers
              </p>
              <div className="mt-8 space-y-4">
                {testimonials.map((item, i) => (
                  <motion.div
                    key={item.author}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-2xl border border-black/5 bg-zinc-50 p-5 transition-colors duration-300 hover:bg-zinc-100/70"
                  >
                    <div className="flex items-center gap-2 text-indigo-600">
                      <BadgeCheck className="h-4 w-4" />
                      <span className="text-sm font-medium text-zinc-700">
                        Verified review
                      </span>
                    </div>
                    <p className="mt-3 text-base leading-7 text-zinc-700">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">{item.author}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-[32px] border border-black/5 bg-gradient-to-br from-indigo-50 to-teal-50 p-8 shadow-sm">
              <p className="font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">
                Never miss a smart deal
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.02em] text-zinc-950">
                AI shopping tips, in your inbox.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-zinc-600">
                New product launches, smart shopping tips, and exclusive
                offers — no noise, just the useful stuff.
              </p>
              <div className="mt-8">
                <NewsletterSignup />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}