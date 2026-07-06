import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getFeaturedCategories, getHeroSlides, getProducts, getTestimonials } from "@/lib/supabase-data";

export default async function HomePage() {
  const [products, featuredCategories, heroSlides, testimonials] = await Promise.all([
    getProducts(),
    getFeaturedCategories(),
    getHeroSlides(),
    getTestimonials(),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-black/5 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_55%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-zinc-700">
              <Sparkles className="h-4 w-4 text-blue-600" />
              New collection now live
            </div>
            <h1 className="mt-8 text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-zinc-950 sm:text-6xl lg:text-7xl">
              Elevated essentials for a beautifully lived-in home.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              Curated objects, timeless materials, and thoughtful details designed to make everyday rituals feel extraordinary.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/products" className="rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800">
                Shop now
              </Link>
              <Link href="/about" className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50">
                Discover the story
              </Link>
            </div>
          </div>
          <div className="rounded-[36px] border border-black/5 bg-white p-3 shadow-[0_30px_100px_rgba(0,0,0,0.08)]">
            <img src={heroSlides[0]?.image} alt="Featured interior" className="h-[520px] w-full rounded-[28px] object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Featured categories</p>
            <h2 className="mt-3 text-3xl font-semibold text-zinc-950">Build your own ritual.</h2>
          </div>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featuredCategories.map((category) => (
            <div key={category.title} className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm">
              <img src={category.image} alt={category.title} className="h-64 w-full object-cover transition duration-500 hover:scale-105" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-zinc-900">{category.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600">{category.description}</p>
                <Link href="/products" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600">
                  Explore <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">New arrivals</p>
            <h2 className="mt-3 text-3xl font-semibold text-zinc-950">The latest from the studio.</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-blue-600">View all</Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="rounded-[36px] border border-black/5 bg-zinc-950 p-10 text-white lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Limited release</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Free shipping on orders over $150 this week.</h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-zinc-400">
                Complimentary express delivery and complimentary gift wrapping for every order placed before Friday evening.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-6">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <Truck className="h-5 w-5 text-blue-300" />
                Delivery in 2–4 business days
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
                <ShieldCheck className="h-5 w-5 text-blue-300" />
                Secure checkout and premium support
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Trusted by design-minded customers</p>
            <div className="mt-8 space-y-4">
              {testimonials.map((item) => (
                <div key={item.author} className="rounded-2xl border border-black/5 bg-[#f7f3eb] p-4">
                  <div className="flex items-center gap-2 text-amber-500">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-sm font-medium text-zinc-700">Verified review</span>
                  </div>
                  <p className="mt-3 text-base leading-7 text-zinc-700">“{item.quote}”</p>
                  <p className="mt-2 text-sm text-zinc-500">{item.author}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-black/5 bg-[#f5f2ea] p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Stay in the loop</p>
            <h2 className="mt-3 text-3xl font-semibold text-zinc-950">Join the weekly edit.</h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-zinc-600">
              Receive first access to launches, editorial notes, and private offers.
            </p>
            <div className="mt-8">
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
