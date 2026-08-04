"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

const faqs = [
  {
    question: "What is CartIQ?",
    answer:
      "CartIQ is an AI-powered shopping platform that helps you discover the right products through personalized recommendations, intelligent search, and a conversational AI assistant.",
  },
  {
    question: "Is CartIQ free to use?",
    answer:
      "Yes, browsing, searching, and using the AI Assistant are all free. You only pay for the products you choose to order.",
  },
  {
    question: "How does the AI Assistant work?",
    answer:
      "The AI Assistant, powered by DeepSeek, understands natural language so you can describe what you need in your own words. It searches the catalog, compares options, and recommends products tailored to you.",
  },
  {
    question: "Do I need an account to shop?",
    answer:
      "You can browse and use the AI Assistant without an account, but you'll need to register to place orders, save a wishlist, and track order history.",
  },
  {
    question: "What regions does CartIQ ship to?",
    answer:
      "Shipping availability is shown at checkout based on your delivery address. We're continuing to expand coverage over time.",
  },
  {
    question: "How is my data used?",
    answer:
      "Your data is used to personalize recommendations and improve your experience. See our Privacy Policy for full details on what we collect and how it's handled.",
  },
  {
    question: "Who built CartIQ?",
    answer:
      "CartIQ was developed by Chirayu Jayaswal using Next.js, Supabase, TailwindCSS, and DeepSeek AI.",
  },
];

function FaqRow({ faq }: { faq: (typeof faqs)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white transition-colors duration-200 hover:border-indigo-100">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
      >
        <span className="text-[15px] font-medium text-zinc-900">
          {faq.question}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 ${
            open ? "rotate-180 text-indigo-600" : ""
          }`}
        />
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-5 text-sm leading-7 text-zinc-600">
          {faq.answer}
        </p>
      </motion.div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          FAQ
        </span>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          Frequently asked questions
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-zinc-600 sm:text-base">
          Quick answers to the things people ask most about CartIQ.
        </p>
      </div>

      <div className="mt-12 space-y-3">
        {faqs.map((faq) => (
          <FaqRow key={faq.question} faq={faq} />
        ))}
      </div>

      <div className="mt-14 text-center text-sm text-zinc-600">
        Didn't find your answer? Visit the{" "}
        <Link href="/help" className="font-medium text-indigo-600 hover:underline">
          Help Center
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="font-medium text-indigo-600 hover:underline">
          contact us
        </Link>
        .
      </div>
    </div>
  );
}