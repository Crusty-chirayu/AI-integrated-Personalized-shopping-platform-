  "use client";

  import { useMemo, useState } from "react";
  import Image from "next/image";
  import Link from "next/link";
  import { motion } from "framer-motion";
  import {
    ArrowRight,
    Dumbbell,
    GitCompare,
    Laptop,
    Search,
    Shirt,
    ShoppingBasket,
    Sofa,
    Sparkles,
    Wand2,
  } from "lucide-react";

  type Category = {
    name: string;
    slug: string;
    description: string;
    productCount: number;
    image: string;
    icon: React.ComponentType<{ className?: string }>;
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
    },
    {
      name: "Fashion",
      slug: "fashion",
      description: "Clothing, footwear and lifestyle essentials.",
      productCount: 50,
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
      icon: Shirt,
    },
    {
      name: "Grocery",
      slug: "grocery",
      description: "Daily essentials, snacks and healthy food.",
      productCount: 50,
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
      icon: ShoppingBasket,
    },
    {
      name: "Home",
      slug: "home",
      description: "Furniture, appliances and home décor.",
      productCount: 50,
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
      icon: Sofa,
    },
    {
      name: "Sports",
      slug: "sports",
      description: "Fitness equipment and outdoor essentials.",
      productCount: 50,
      image:
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      icon: Dumbbell,
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

  export default function CategoriesPage() {
    const [query, setQuery] = useState("");

    const filteredCategories = useMemo(() => {
      const term = query.trim().toLowerCase();
      if (!term) return categories;
      return categories.filter(
        (category) =>
          category.name.toLowerCase().includes(term) ||
          category.description.toLowerCase().includes(term)
      );
    }, [query]);

    return (
      <div>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-black/5">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 50% at 10% 0%, rgba(79,70,229,0.08), transparent 60%), radial-gradient(45% 45% at 90% 10%, rgba(20,184,166,0.08), transparent 60%)",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-6 py-20 text-center lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-indigo-700 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Browse Categories
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
                  <span className="text-lg font-semibold text-zinc-950">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-10 max-w-lg"
            >
              <div className="flex items-center gap-3 rounded-full border border-black/10 bg-[#f7f3eb] px-5 py-3.5 shadow-sm transition focus-within:border-indigo-200 focus-within:shadow-[0_0_0_4px_rgba(79,70,229,0.08)]">
                <Search className="h-4 w-4 shrink-0 text-zinc-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search categories..."
                  className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-500"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Category grid */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          {filteredCategories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category, index) => {
                const Icon = category.icon;

                return (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                  >
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_70px_rgba(79,70,229,0.16)]"
                    >
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

                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-white">
                            {category.name}
                          </h3>
                          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                            {category.productCount}+ items
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between gap-5 p-6">
                        <p className="text-sm leading-6 text-zinc-600">
                          {category.description}
                        </p>

                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition group-hover:gap-2.5">
                          Explore
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>

                      <div className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 shadow-[0_0_0_1px_rgba(79,70,229,0.25)] transition-opacity duration-300 group-hover:opacity-100" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-black/5 bg-white p-12 text-center text-sm text-zinc-500 shadow-sm">
              No categories match "{query}".
            </div>
          )}
        </section>

        {/* AI section */}
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

                    <h3 className="mt-5 text-base font-semibold text-zinc-950">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
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
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-zinc-950 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
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