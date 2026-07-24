import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Lock,
  MessageSquare,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getFeaturedCategories, getHeroSlides, getProducts, getTestimonials } from "@/lib/supabase-data";

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

export default async function HomePage() {
  const [products, featuredCategories, heroSlides, testimonials] = await Promise.all([
    getProducts(),
    getFeaturedCategories(),
    getHeroSlides(),
    getTestimonials(),
  ]);

  return (
    <div className="bg-white">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 10%, rgba(79,70,229,0.10), transparent 60%), radial-gradient(50% 45% at 85% 15%, rgba(20,184,166,0.10), transparent 60%)",
          }}
        />







        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-32">
          <div className="max-w-2xl">


  <div>
  <h2 className="text-4xl font-black tracking-[0.22em] text-zinc-950 sm:text-5xl">
    Cart
    <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
      IQ
    </span>
  </h2>

  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-indigo-700 shadow-sm">
    <Sparkles className="h-3.5 w-3.5" />
    Powered by CartIQ AI
  </div>
</div>

            <h1 className="mt-8 text-5xl font-semibold leading-[0.98] tracking-[-0.03em] text-zinc-950 sm:text-6xl lg:text-7xl">
              Shop smarter
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                with AI.
              </span>
            </h1>








            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              CartIQ understands what you're looking for — personalized recommendations,
              intelligent search, and a shopping assistant you can actually talk to.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Start shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/assistant"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
              >
                <MessageSquare className="h-4 w-4 text-indigo-600" />
✨ Ask CartIQ AI
Find the perfect product in seconds              </Link>
            </div>
          </div>

          {/* Signature element: a mocked AI shopping exchange */}
          <div className="relative">
            <div className="rounded-[28px] border border-black/5 bg-white p-2 shadow-[0_30px_100px_rgba(0,0,0,0.08)]">
              <div className="overflow-hidden rounded-[22px]">
                <img
                  src={heroSlides[0]?.image}
                  alt="Featured product"
                  className="h-72 w-full object-cover"
                />
              </div>

              <div className="space-y-3 p-5">
                <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-zinc-950 px-4 py-2.5 text-sm text-white">
                  Show me white sneakers under ₹3,000
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-2.5 text-sm text-zinc-700">
                    Found 3 great matches — sorted by rating and price.
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:block">
              <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Response time</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-950">&lt; 1s</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Featured categories                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">
              Featured categories
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-4xl">
              Find your next favorite.
            </h2>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featuredCategories.map((category) => (
            <div
              key={category.title}
              className="group overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.10)]"
            >
              <div className="overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-zinc-900">{category.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600">{category.description}</p>
                <Link
                  href="/products"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition group-hover:gap-3"
                >
                  Explore <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Why CartIQ                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-black/5 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">
              Why CartIQ
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-4xl">
              Shopping, understood.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CARTIQ.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-3xl border border-black/5 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_60px_rgba(79,70,229,0.10)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Products                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">
              Recommended for you
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-4xl">
              Trending products.
            </h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-indigo-600">
            View all
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Promotional banner                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="relative overflow-hidden rounded-[36px] border border-black/5 bg-zinc-950 p-10 text-white lg:p-14">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 60% at 80% 0%, rgba(79,70,229,0.35), transparent 60%), radial-gradient(40% 50% at 10% 100%, rgba(20,184,166,0.25), transparent 60%)",
            }}
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-teal-300">
                AI-powered shopping
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Faster discovery. Smarter checkout.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-zinc-400">
                Personalized recommendations that learn as you shop, and a secure checkout
                built for speed — every order, every time.
              </p>
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
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Testimonials + Newsletter                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">
              Trusted by smart shoppers
            </p>
            <div className="mt-8 space-y-4">
              {testimonials.map((item) => (
                <div key={item.author} className="rounded-2xl border border-black/5 bg-zinc-50 p-5">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-sm font-medium text-zinc-700">Verified review</span>
                  </div>
                  <p className="mt-3 text-base leading-7 text-zinc-700">&ldquo;{item.quote}&rdquo;</p>
                  <p className="mt-2 text-sm text-zinc-500">{item.author}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-black/5 bg-gradient-to-br from-indigo-50 to-teal-50 p-8 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">
Never Miss a Smart Deal

AI Shopping Tips
Exclusive Offers
Early Product Launches            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-zinc-950">
              AI shopping tips, in your inbox.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-zinc-600">
              New product launches, smart shopping tips, and exclusive offers —
              no noise, just the useful stuff.
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