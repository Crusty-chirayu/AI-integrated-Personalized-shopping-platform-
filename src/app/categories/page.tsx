"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  ArrowUpDown,
  Award,
  Dumbbell,
  Eye,
  Flame,
  GitCompare,
  Laptop,
  Search,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Sofa,
  Sparkles,
  Star,
  TrendingUp,
  Wand2,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data — extended with presentational fields only. Nothing here      */
/*  touches an API or a database; it's the same local demo data the    */
/*  page already shipped with, just richer for the new UI surfaces.    */
/* ------------------------------------------------------------------ */

type Category = {
  name: string;
  slug: string;
  description: string;
  productCount: number;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
  trending: boolean;
  aiScore: number; // 0–100, "how well this matches your taste"
  rating: number; // out of 5
  avgPrice: number;
  viewCount: number;
  growth: string;
  popularBrands: string[];
};

const categories: Category[] = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Latest gadgets, laptops, smartphones and accessories.",
    productCount: 50,
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80",
    icon: Laptop,
    trending: true,
    aiScore: 96,
    rating: 4.7,
    avgPrice: 25999,
    viewCount: 18400,
    growth: "+22%",
    popularBrands: ["Apple", "Samsung", "Sony", "Dell"],
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Clothing, footwear and lifestyle essentials.",
    productCount: 50,
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
    icon: Shirt,
    trending: true,
    aiScore: 91,
    rating: 4.6,
    avgPrice: 1499,
    viewCount: 21200,
    growth: "+18%",
    popularBrands: ["Zara", "H&M", "Nike", "Levi's"],
  },
  {
    name: "Grocery",
    slug: "grocery",
    description: "Daily essentials, snacks and healthy food.",
    productCount: 50,
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    icon: ShoppingBasket,
    trending: false,
    aiScore: 82,
    rating: 4.5,
    avgPrice: 399,
    viewCount: 15800,
    growth: "+9%",
    popularBrands: ["Nestlé", "Tata", "Amul", "ITC"],
  },
  {
    name: "Home",
    slug: "home",
    description: "Furniture, appliances and home décor.",
    productCount: 50,
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
    icon: Sofa,
    trending: false,
    aiScore: 88,
    rating: 4.6,
    avgPrice: 3499,
    viewCount: 12300,
    growth: "+14%",
    popularBrands: ["IKEA", "Philips", "Prestige", "Godrej"],
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Fitness equipment and outdoor essentials.",
    productCount: 50,
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    icon: Dumbbell,
    trending: true,
    aiScore: 89,
    rating: 4.7,
    avgPrice: 1999,
    viewCount: 9800,
    growth: "+27%",
    popularBrands: ["Nike", "Adidas", "Puma", "Decathlon"],
  },
];

const aiFeatures = [
  {
    title: "AI Recommendations",
    description: "Personalized picks that learn from what you actually browse and buy.",
    icon: Sparkles,
  },
  {
    title: "Smart Search",
    description: "Describe what you need in plain language and get real matches, instantly.",
    icon: Search,
  },
  {
    title: "Product Comparison",
    description: "Ask CartIQ to line two products up side by side, no tab-switching needed.",
    icon: GitCompare,
  },
  {
    title: "Personalized Shopping",
    description: "Every category adapts to your taste, budget, and past preferences.",
    icon: Wand2,
  },
];

const stats = [
  { label: "Categories", value: "5" },
  { label: "Products", value: "250+" },
  { label: "Powered By", value: "AI Recommendations" },
];

const lifestyleStyles = [
  {
    title: "Work From Home",
    subtitle: "Desk setups, comfort wear & fast snacks",
    slug: "electronics",
    image:
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Active Lifestyle",
    subtitle: "Performance gear for every workout",
    slug: "sports",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Home Refresh",
    subtitle: "Furniture and décor to reset your space",
    slug: "home",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
  },
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/* ------------------------------------------------------------------ */
/*  Ripple interaction (buttons / links)                               */
/* ------------------------------------------------------------------ */

function useRipple() {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number; size: number }>
  >([]);
  const idRef = useRef(0);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = idRef.current++;
    setRipples((prev) => [...prev, { id, x, y, size }]);
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  }, []);

  const rippleLayer = (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute rounded-full bg-current"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </span>
  );

  return { onPointerDown, rippleLayer };
}

/* ------------------------------------------------------------------ */
/*  3D tilt hook (disabled automatically for reduced-motion users)     */
/* ------------------------------------------------------------------ */

function useTilt(strength = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(!mq.matches);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(px * strength);
      rotateX.set(py * -strength);
    },
    [enabled, rotateX, rotateY, strength]
  );

  const onMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
}

/* ------------------------------------------------------------------ */
/*  Small shared bits                                                  */
/* ------------------------------------------------------------------ */

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-zinc-300"
          }`}
        />
      ))}
      <span className="ml-1 text-[11px] font-medium text-zinc-500">{rating.toFixed(1)}</span>
    </div>
  );
}

const FILTERS = ["All", "Trending", "Popularity", "AI Recommended", "Newest"] as const;
type FilterKey = (typeof FILTERS)[number];

const FilterChip = memo(function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
        active ? "text-white" : "text-zinc-600 hover:text-zinc-900"
      }`}
    >
      {active && (
        <motion.span
          layoutId="categoryFilterHighlight"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500"
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
});

/* ------------------------------------------------------------------ */
/*  Skeleton card                                                      */
/* ------------------------------------------------------------------ */

function SkeletonCategoryCard({ delay = 0 }: { delay?: number }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-white">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-zinc-100/80 to-transparent"
        animate={{ translateX: ["-100%", "160%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay }}
      />
      <div className="h-52 w-full bg-zinc-100" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-2/3 rounded-full bg-zinc-100" />
        <div className="h-3 w-1/2 rounded-full bg-zinc-100" />
        <div className="h-3 w-1/3 rounded-full bg-zinc-100" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category card                                                      */
/* ------------------------------------------------------------------ */

const CategoryCard = memo(function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(8);
  const Icon = category.icon;
  const glowX = useTransform(rotateY, [-8, 8], [0, 100]);
  const glowY = useTransform(rotateX, [-8, 8], [100, 0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      style={{ perspective: 1000 }}
    >
      <Link
        href={`/products?category=${category.slug}`}
        aria-label={`Explore ${category.name} — ${category.productCount}+ items`}
        className="group relative block focus-visible:outline-none"
      >
        <motion.div
          ref={ref}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_24px_70px_rgba(79,70,229,0.18)] group-focus-visible:ring-2 group-focus-visible:ring-indigo-500"
        >
          {/* Cursor-follow glow */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: useTransform(
                [glowX, glowY],
                ([x, y]) =>
                  `radial-gradient(240px circle at ${x}% ${y}%, rgba(79,70,229,0.16), transparent 70%)`
              ),
            }}
          />

          <div className="relative h-52 w-full overflow-hidden">
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-zinc-900 shadow-md backdrop-blur">
              <Icon className="h-5 w-5" />
            </div>

            {category.trending && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md backdrop-blur">
                <Flame className="h-3 w-3" />
                Trending
              </span>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{category.name}</h3>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {category.productCount}+ items
              </span>
            </div>
          </div>

          <div className="relative flex flex-1 flex-col justify-between gap-4 p-6">
            <p className="text-sm leading-6 text-zinc-600">{category.description}</p>

            <div className="flex items-center justify-between">
              <Stars rating={category.rating} />
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                <Sparkles className="h-3 w-3" />
                {category.aiScore}% match
              </span>
            </div>

            {/* Hover reveal: popular brands */}
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]">
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {category.popularBrands.map((brand) => (
                    <span
                      key={brand}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10.5px] font-medium text-zinc-600"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-all group-hover:gap-2.5">
              Explore
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>

          <div className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 shadow-[0_0_0_1px_rgba(79,70,229,0.25)] transition-opacity duration-300 group-hover:opacity-100" />
        </motion.div>
      </Link>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/*  Featured carousel                                                  */
/* ------------------------------------------------------------------ */

function FeaturedCarousel({ items }: { items: Category[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">
            Featured this week
          </h2>
          <p className="mt-1 text-sm text-zinc-500">AI-curated picks trending across CartIQ.</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scrollBy(-360)}
            aria-label="Scroll featured categories left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            onClick={() => scrollBy(360)}
            aria-label="Scroll featured categories right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((category, i) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="w-[280px] shrink-0 snap-start sm:w-[340px]"
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(79,70,229,0.16)]"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="340px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                  <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-zinc-900 shadow">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-zinc-950">{category.name}</h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      {category.growth}
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-zinc-500">{category.description}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI Insights panel                                                  */
/* ------------------------------------------------------------------ */

function AiInsightsPanel({ items }: { items: Category[] }) {
  const insights = useMemo(() => {
    const trending = [...items].sort((a, b) => b.aiScore - a.aiScore)[0];
    const fastestGrowing = [...items].sort(
      (a, b) => parseFloat(b.growth) - parseFloat(a.growth)
    )[0];
    const mostViewed = [...items].sort((a, b) => b.viewCount - a.viewCount)[0];
    const bestValue = [...items].sort(
      (a, b) => b.rating / b.avgPrice - a.rating / a.avgPrice
    )[0];

    return [
      {
        label: "Trending Category",
        value: trending.name,
        detail: `${trending.aiScore}% AI match score`,
        icon: Flame,
      },
      {
        label: "Fastest Growing",
        value: fastestGrowing.name,
        detail: `${fastestGrowing.growth} this month`,
        icon: TrendingUp,
      },
      {
        label: "Most Viewed",
        value: mostViewed.name,
        detail: `${mostViewed.viewCount.toLocaleString("en-IN")} views`,
        icon: Eye,
      },
      {
        label: "Best Value",
        value: bestValue.name,
        detail: `Avg. ${currency.format(bestValue.avgPrice)}`,
        icon: Award,
      },
    ];
  }, [items]);

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-teal-50 p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200">
          <Sparkles className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-950">AI Insights</p>
          <p className="text-xs text-zinc-500">Live signals from what shoppers love right now.</p>
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="rounded-2xl border border-white bg-white/70 p-4 shadow-sm backdrop-blur"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950/5 text-zinc-700">
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                {insight.label}
              </p>
              <p className="mt-1 text-base font-semibold text-zinc-950">{insight.value}</p>
              <p className="mt-0.5 text-[12px] text-zinc-500">{insight.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CategoriesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("All");
  const [priceSort, setPriceSort] = useState<"none" | "low" | "high">("none");
  const [isReady, setIsReady] = useState(false);

  const heroRipple = useRipple();

  // Purely cosmetic reveal so the grid gets a premium skeleton →
  // content transition, matching the rest of the site's loading states.
  useEffect(() => {
    const t = window.setTimeout(() => setIsReady(true), 450);
    return () => window.clearTimeout(t);
  }, []);

  const allBrands = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => c.popularBrands.forEach((b) => set.add(b)));
    return Array.from(set);
  }, []);

  const featured = useMemo(
    () => [...categories].sort((a, b) => b.aiScore - a.aiScore).slice(0, 4),
    []
  );

  const filteredCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = categories.filter(
      (category) =>
        !term ||
        category.name.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term)
    );

    if (filter === "Trending") list = list.filter((c) => c.trending);

    list = [...list];
    if (filter === "Popularity") list.sort((a, b) => b.productCount - a.productCount);
    if (filter === "AI Recommended") list.sort((a, b) => b.aiScore - a.aiScore);
    if (filter === "Newest") list.reverse();

    if (priceSort === "low") list.sort((a, b) => a.avgPrice - b.avgPrice);
    if (priceSort === "high") list.sort((a, b) => b.avgPrice - a.avgPrice);

    return list;
  }, [query, filter, priceSort]);

  const hasActiveFilters = query.trim().length > 0 || filter !== "All" || priceSort !== "none";

  const clearFilters = useCallback(() => {
    setQuery("");
    setFilter("All");
    setPriceSort("none");
  }, []);

  return (
    <div>
      {/* ================= Hero ================= */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 50% at 10% 0%, rgba(79,70,229,0.08), transparent 60%), radial-gradient(45% 45% at 90% 10%, rgba(20,184,166,0.08), transparent 60%)",
          }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl"
          animate={{ x: [0, -24, 0], y: [0, -16, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-indigo-700 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Curated · Browse Categories
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-5xl lg:text-6xl"
          >
            Find exactly what{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              you're looking for.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-600"
          >
            CartIQ uses AI to understand what you actually need, not just what
            you searched for — so every category feels personalized from the
            first click.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-1 min-w-[9rem] flex-col items-center gap-1 rounded-[24px] border border-black/5 bg-white px-5 py-4 shadow-sm"
              >
                <span className="text-lg font-semibold text-zinc-950">{stat.value}</span>
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Trending quick pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="flex items-center gap-1 text-xs font-medium text-zinc-500">
              <Flame className="h-3.5 w-3.5 text-orange-500" /> Trending now:
            </span>
            {categories
              .filter((c) => c.trending)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  {c.name}
                </Link>
              ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="mx-auto mt-10 max-w-lg"
          >
            <div className="flex items-center gap-3 rounded-full border border-black/10 bg-[#f7f3eb] px-5 py-3.5 shadow-sm transition focus-within:border-indigo-200 focus-within:shadow-[0_0_0_4px_rgba(79,70,229,0.08)]">
              <motion.span animate={query ? { rotate: [0, -14, 0] } : {}} transition={{ duration: 0.3 }}>
                <Search className="h-4 w-4 shrink-0 text-zinc-500" />
              </motion.span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search categories..."
                aria-label="Search categories"
                className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-500"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="rounded-full p-1 text-zinc-500 hover:bg-black/5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Filter chips + price sort */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {FILTERS.map((f) => (
                <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as typeof priceSort)}
                aria-label="Sort by average price"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12.5px] text-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              >
                <option value="none">Price: relevance</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[12.5px] font-medium text-zinc-400 underline-offset-2 hover:text-zinc-700 hover:underline"
              >
                Clear all
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ================= AI Insights ================= */}
      <section className="mx-auto max-w-7xl px-6 pt-16 lg:px-10">
        <AiInsightsPanel items={categories} />
      </section>

      {/* ================= Featured carousel ================= */}
      <section className="mx-auto max-w-7xl px-6 pt-16 lg:px-10">
        <FeaturedCarousel items={featured} />
      </section>

      {/* ================= Category grid ================= */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">
            All Categories
          </h2>
          <span className="text-sm text-zinc-500">
            {filteredCategories.length} of {categories.length}
          </span>
        </div>

        {!isReady ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCategoryCard key={i} delay={i * 0.1} />
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredCategories.map((category, index) => (
                <CategoryCard key={category.slug} category={category} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-dashed border-zinc-300 bg-zinc-50/60 p-14 text-center"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 20 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950/5"
            >
              <ShoppingBag className="h-6 w-6 text-zinc-400" strokeWidth={1.5} />
            </motion.div>
            <p className="mt-4 text-base font-semibold text-zinc-900">
              No categories match &quot;{query}&quot;
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Try a different search term or clear your filters.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={clearFilters}
                className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-white"
              >
                Clear filters
              </button>
              <Link
                href="/products"
                className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}
      </section>

      {/* ================= Popular brands ================= */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <h2 className="text-center text-2xl font-semibold tracking-[-0.02em] text-zinc-950">
            Popular Brands
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-zinc-500">
            Shoppers on CartIQ keep coming back to these names.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {allBrands.map((brand, i) => (
              <motion.span
                key={brand}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileHover={{ y: -2 }}
                className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur transition-shadow hover:shadow-md"
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Shop by style ================= */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">Shop by Style</h2>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">
          AI-suggested lifestyle edits, pulled from what's trending in each category.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {lifestyleStyles.map((style, i) => (
            <motion.div
              key={style.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={`/products?category=${style.slug}`}
                className="group relative block h-64 overflow-hidden rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:-translate-y-1"
              >
                <Image
                  src={style.image}
                  alt={style.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-lg font-semibold text-white">{style.title}</h3>
                  <p className="mt-1 text-xs text-white/70">{style.subtitle}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= AI features ================= */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-4xl">
              Why shop with CartIQ AI?
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-600">
              Every category on this page is backed by the same intelligence
              that powers your product recommendations, search, and
              comparisons.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="group rounded-[28px] border border-black/5 bg-gradient-to-br from-indigo-50 to-teal-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(79,70,229,0.12)]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-zinc-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= Bottom CTA ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-indigo-600 to-teal-500 px-8 py-16 text-center shadow-[0_30px_80px_rgba(79,70,229,0.35)] sm:px-16"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(40% 60% at 15% 20%, rgba(255,255,255,0.18), transparent 60%)",
            }}
          />

          <h2 className="relative text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
            Ready to discover smarter shopping?
          </h2>

          <p className="relative mx-auto mt-4 max-w-lg text-sm leading-6 text-indigo-50">
            Browse the full catalog or let CartIQ AI narrow it down for you.
          </p>

          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              onPointerDown={heroRipple.onPointerDown}
              className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-medium text-zinc-950 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {heroRipple.rippleLayer}
              Explore Products
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask CartIQ AI
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}