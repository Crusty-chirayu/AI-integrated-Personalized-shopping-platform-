import Link from "next/link";
import RecentlyViewed from "@/components/recently-viewed";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Clock,
  Feather,
  Layers,
  Lock,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { notFound } from "next/navigation";

import ProductGallery from "@/components/product-gallery";
import ProductInfo from "@/components/product-info";

import {
  getProductBySlug,
  getProducts,
} from "@/lib/supabase-data";

export async function generateStaticParams() {
  const products = await getProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

function StarRow({ rating = 0, size = "h-4 w-4" }: { rating?: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${
            n <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-200 text-zinc-200"
          }`}
        />
      ))}
    </div>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product: any = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // ---- Defensive reads: adjust these field names to match your real Product type ----
  const specifications: Record<string, string> = product.specifications ?? {};
  const specEntries = Object.entries(specifications);

  const reviews: any[] = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewCount = product.reviewCount ?? reviews.length ?? 0;
  const avgRating =
    product.rating ??
    (reviews.length
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
      : 0);

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
    return { star, count, pct };
  });

  const aiSummary =
    product.aiSummary ??
    `${product.name ?? "This product"} stands out for its build quality, feature set, and value relative to similar items in ${product.category ?? "its category"}.`;
  const aiBestFor: string[] = product.aiBestFor ?? [
    "Everyday use",
    "Value-conscious buyers",
    "First-time buyers in this category",
  ];
  const aiPros: string[] = product.aiPros ?? [
    "Strong reviews from verified buyers",
    "Competitive pricing for the feature set",
    "Reliable brand track record",
  ];
  const aiThingsToKnow: string[] = product.aiThingsToKnow ?? [
    "Availability may vary by region",
    "Check size or variant before ordering",
  ];
  const aiConfidence = product.aiConfidence ?? 92;
  const aiScore = product.aiScore ?? 4.6;

  const highlightIcons = [Zap, Layers, Feather, ShieldCheck];
  const highlights: string[] = product.highlights ?? [
    "Engineered for everyday performance",
    "Premium materials, refined finish",
    "Lightweight, travel-friendly design",
    "Built to last, backed by warranty",
  ];

  const inTheBox: string[] = product.inTheBox ?? [
    product.name ?? "Product unit",
    "User guide & warranty card",
    "Power cable / accessories (if applicable)",
    "Protective packaging, ready to gift",
  ];

  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter(
      (p: any) => p.category === product.category && p.slug !== product.slug
    )
    .slice(0, 8);

  const productForScript = {
    slug: product.slug,
    name: product.name ?? "Product",
    image: product.images?.[0] ?? product.image ?? "",
    price: product.price ?? null,
  };

  return (
    <div className="relative">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-2%, 3%) scale(1.06); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes borderRotate {
          0% { --angle: 0deg; }
          100% { --angle: 360deg; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ripple {
          from { transform: scale(0); opacity: 0.45; }
          to { transform: scale(2.4); opacity: 0; }
        }
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        .pdp-fade-up { opacity: 0; animation: fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .pdp-fade-in { opacity: 0; animation: fadeIn 0.8s ease-out forwards; }
        .pdp-orb { animation: floatOrb 16s ease-in-out infinite; }
        .pdp-glow { animation: pulseGlow 3s ease-in-out infinite; }
        .pdp-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
          opacity: 0.05;
        }
        .pdp-scroll { scroll-snap-type: x mandatory; scroll-behavior: smooth; }
        .pdp-scroll > * { scroll-snap-align: start; }

        .pdp-spec-card {
          position: relative;
          border-radius: 24px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(79,70,229,0.25), rgba(20,184,166,0.15), rgba(0,0,0,0.06));
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease;
        }
        .pdp-spec-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(15,15,35,0.10);
        }
        .pdp-spec-card-inner {
          border-radius: 23px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          height: 100%;
        }

        .pdp-ai-card {
          position: relative;
          border-radius: 28px;
          padding: 1.5px;
          background: conic-gradient(from var(--angle), rgba(99,102,241,0.55), rgba(45,212,191,0.5), rgba(99,102,241,0.15), rgba(99,102,241,0.55));
          animation: borderRotate 8s linear infinite;
        }
        .pdp-ai-card-inner {
          border-radius: 26.5px;
        }

        .pdp-chip {
          position: relative;
          overflow: hidden;
        }
        .pdp-chip::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.55) 40%, transparent 60%);
          background-size: 200% 100%;
          animation: shimmer 3.2s ease-in-out infinite;
        }

        .pdp-ripple {
          position: relative;
          overflow: hidden;
        }
        .pdp-ripple::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          background: currentColor;
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }
        .pdp-ripple:active::after {
          animation: ripple 0.6s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .pdp-fade-up, .pdp-fade-in, .pdp-orb, .pdp-glow, .pdp-ai-card, .pdp-chip::after, .pdp-ripple::after {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#fbfbfd]">
        <div
          className="pdp-orb absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 45% at 8% 0%, rgba(79,70,229,0.09), transparent 60%), radial-gradient(45% 40% at 95% 15%, rgba(20,184,166,0.09), transparent 60%), radial-gradient(35% 35% at 50% 100%, rgba(99,102,241,0.05), transparent 60%)",
          }}
        />
        <div className="pdp-noise absolute inset-0 mix-blend-multiply" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        {/* Breadcrumb */}
        <div className="pdp-fade-in flex items-center justify-between gap-4">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-zinc-950 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to collection
          </Link>

          {product.category && (
            <span className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-zinc-500 shadow-sm backdrop-blur-md sm:inline-flex">
              {product.category}
            </span>
          )}
        </div>

        {/* Hero + specs (left) / purchase + AI (right) — premium 2-column layout */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">
          {/* LEFT COLUMN: Gallery -> Specifications (no gap, continuous flow) */}
          <div className="flex flex-col gap-12">
            <div className="pdp-fade-up" style={{ animationDelay: "60ms" }}>
              <div className="rounded-[28px] border border-black/5 bg-white/40 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                <ProductGallery images={product.images} />
              </div>
            </div>

            {specEntries.length > 0 && (
              <section className="pdp-fade-up" style={{ animationDelay: "140ms" }}>
                <h2 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                  Specifications
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {specEntries.map(([key, value]) => (
                    <div key={key} className="pdp-spec-card">
                      <div className="pdp-spec-card-inner flex flex-col gap-1.5 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                          {key}
                        </p>
                        <p className="text-[15px] font-semibold leading-snug text-zinc-900">
                          {String(value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Highlights */}
            <section className="pdp-fade-up" style={{ animationDelay: "180ms" }}>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                Highlights
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {highlights.map((point, idx) => {
                  const Icon = highlightIcons[idx % highlightIcons.length];
                  return (
                    <div key={point} className="pdp-spec-card">
                      <div className="pdp-spec-card-inner flex items-start gap-3 p-5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-sm">
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="text-sm font-medium leading-6 text-zinc-800">
                          {point}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* In the Box */}
            <section className="pdp-fade-up" style={{ animationDelay: "220ms" }}>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                In the Box
              </h2>
              <div className="pdp-spec-card mt-5">
                <div className="pdp-spec-card-inner p-5 sm:p-6">
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {inTheBox.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-700">
                        <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                        <span className="leading-6">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Purchase card -> AI Intelligence */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="pdp-fade-up" style={{ animationDelay: "100ms" }}>
              <div className="rounded-[28px] border border-black/5 bg-white/70 p-1 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_28px_80px_rgba(0,0,0,0.1)]">
                <div className="rounded-[24px] bg-white/60 p-5 sm:p-6">
                  <ProductInfo product={product} />
                </div>
              </div>
            </div>

            {/* AI Product Intelligence */}
            <div className="pdp-ai-card pdp-fade-up" style={{ animationDelay: "180ms" }}>
              <div className="pdp-ai-card-inner relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-teal-50 p-6 sm:p-7">
                <div
                  className="pdp-glow pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-400/30 to-teal-400/30 blur-3xl"
                  aria-hidden="true"
                />

                <div className="relative flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 shadow-md">
                    <Sparkles className="h-4.5 w-4.5 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-zinc-950">
                      CartIQ AI Intelligence
                    </p>
                    <p className="text-xs text-zinc-500">
                      Generated from product data &amp; shopper behavior
                    </p>
                  </div>
                </div>

                <p className="relative mt-4 text-sm leading-7 text-zinc-700">
                  {aiSummary}
                </p>

                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-black/5 bg-white/70 p-3.5 text-center backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                      Recommendation Score
                    </p>
                    <p className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-zinc-950">
                      <Award className="h-4 w-4 text-indigo-600" />
                      {aiScore}/5
                    </p>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-white/70 p-3.5 text-center backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                      Confidence
                    </p>
                    <p className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-zinc-950">
                      <TrendingUp className="h-4 w-4 text-teal-600" />
                      {aiConfidence}%
                    </p>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400"
                        style={{ width: `${aiConfidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="relative mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    Best For
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {aiBestFor.map((tag) => (
                      <span
                        key={tag}
                        className="pdp-chip rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      Pros
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-zinc-700">
                      {aiPros.map((pro) => (
                        <li key={pro} className="flex items-start gap-2">
                          <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      Things to Know
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-zinc-700">
                      {aiThingsToKnow.map((note) => (
                        <li key={note} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & Trust */}
        <section className="pdp-fade-up mt-20" style={{ animationDelay: "80ms" }}>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
            Delivery &amp; Trust
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: Truck, title: "Free Shipping", body: "On eligible orders, delivered fast." },
              { icon: Clock, title: "Estimated Delivery", body: product.deliveryEstimate ?? "3–5 business days" },
              { icon: RotateCcw, title: "Easy Returns", body: "Hassle-free returns within the return window." },
              { icon: ShieldCheck, title: "Warranty", body: product.warranty ?? "Manufacturer warranty included" },
              { icon: Lock, title: "Secure Payments", body: "Encrypted, PCI-compliant checkout." },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white/70 p-5 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-100 hover:shadow-[0_18px_36px_rgba(79,70,229,0.12)]"
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-indigo-50/0 to-teal-50/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:from-indigo-50/60 group-hover:to-teal-50/60"
                  aria-hidden="true"
                />
                <span className="relative mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-sm transition-shadow duration-300 group-hover:shadow-[0_0_0_6px_rgba(99,102,241,0.15)]">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <p className="relative mt-3 text-sm font-semibold text-zinc-900">{title}</p>
                <p className="relative mt-1 text-xs leading-5 text-zinc-500">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="pdp-fade-up mt-20" style={{ animationDelay: "120ms" }}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              Customer Reviews
            </h2>
            {reviewCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <StarRow rating={avgRating} />
                <span className="font-semibold text-zinc-950">{avgRating.toFixed(1)}</span>
                <span>· {reviewCount} review{reviewCount === 1 ? "" : "s"}</span>
              </div>
            )}
          </div>

          {reviewCount === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-black/10 bg-white/60 p-8 text-center text-sm text-zinc-500">
              No reviews yet — be the first to share your experience.
            </p>
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.6fr]">
              {/* Summary bars */}
              <div className="rounded-[24px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
                <p className="text-4xl font-bold tracking-tight text-zinc-950">
                  {avgRating.toFixed(1)}
                </p>
                <StarRow rating={avgRating} size="h-5 w-5" />
                <p className="mt-1 text-xs text-zinc-500">Based on {reviewCount} reviews</p>

                <div className="mt-5 space-y-2">
                  {ratingBuckets.map(({ star, pct, count }) => (
                    <div key={star} className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="w-8 shrink-0">{star}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review cards */}
              <div className="space-y-4">
                {reviews.slice(0, 6).map((review, idx) => (
                  <div
                    key={review.id ?? idx}
                    className="rounded-[24px] border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.08)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 text-sm font-semibold text-white shadow-sm">
                          {(review.author ?? review.name ?? "U").charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
                            {review.author ?? review.name ?? "Verified Buyer"}
                            {(review.verified ?? true) && (
                              <BadgeCheck className="h-3.5 w-3.5 text-teal-600" aria-label="Verified buyer" />
                            )}
                          </p>
                          <StarRow rating={review.rating ?? 0} size="h-3.5 w-3.5" />
                        </div>
                      </div>
                      {review.date && (
                        <span className="text-xs text-zinc-400">{review.date}</span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm leading-6 text-zinc-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pdp-fade-up mt-20" style={{ animationDelay: "140ms" }}>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              You Might Also Like
            </h2>
            <div className="pdp-scroll mt-6 flex gap-5 overflow-x-auto pb-4">
              {relatedProducts.map((related: any) => (
                <Link
                  key={related.slug}
                  href={`/products/${related.slug}`}
                  className="group w-64 shrink-0 rounded-[24px] border border-black/5 bg-white/75 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-100 hover:shadow-[0_24px_48px_rgba(79,70,229,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                >
                  <div className="aspect-square overflow-hidden rounded-2xl bg-zinc-50">
                    {(related.images?.[0] ?? related.image) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={related.images?.[0] ?? related.image}
                        alt={related.name ?? "Related product"}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    )}
                  </div>
                  <p className="mt-3.5 truncate text-sm font-semibold text-zinc-900">
                    {related.name}
                  </p>
                  {related.price != null && (
                    <p className="mt-1 text-sm font-bold text-indigo-700">
                      ₹{related.price}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="pdp-fade-up mt-20" style={{ animationDelay: "160ms" }}>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          </h2>
          <div className="mt-6">
            <RecentlyViewed currentProduct={productForScript} />
          </div>
        </section>
      </div>
    </div>
  );
}