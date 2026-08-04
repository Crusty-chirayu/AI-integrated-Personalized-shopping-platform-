"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronDown,
  CreditCard,
  Mic,
  Package,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  UserCircle,
} from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSection = {
  id: string;
  title: string;
  icon: typeof ShoppingBag;
  items: FaqItem[];
};

const sections: FaqSection[] = [
  {
    id: "shopping",
    title: "Shopping",
    icon: ShoppingBag,
    items: [
      {
        question: "How do I find products on CartIQ?",
        answer:
          "Use the search bar in the header, browse by category, or ask the AI Assistant to recommend products based on what you're looking for. You can also filter and sort results on the Products page.",
      },
      {
        question: "Can I save items for later?",
        answer:
          "Yes. Tap the heart icon on any product to add it to your Wishlist. You can review and move items to your cart anytime from the Wishlist page.",
      },
      {
        question: "How accurate are the AI recommendations?",
        answer:
          "Recommendations are generated from your browsing behavior, past purchases, and preferences you share with the AI Assistant. They improve the more you interact with CartIQ.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders",
    icon: Package,
    items: [
      {
        question: "How do I track my order?",
        answer:
          "Go to My Orders from your account menu to see real-time status updates, from confirmation through delivery, for every order you've placed.",
      },
      {
        question: "Can I change or cancel an order?",
        answer:
          "Orders can be changed or cancelled before they enter processing. Open the order from My Orders and select Cancel, or contact support if the option is no longer available.",
      },
      {
        question: "What happens if an item is out of stock?",
        answer:
          "If an item becomes unavailable after ordering, we'll notify you immediately and offer a similar AI-recommended alternative, a refund, or the option to wait for restock.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    items: [
      {
        question: "What payment methods are supported?",
        answer:
          "CartIQ supports major credit and debit cards, UPI, and popular digital wallets at checkout. Available options may vary by region.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes. Payments are processed through encrypted, PCI-compliant channels. CartIQ does not store your full card details on its own servers.",
      },
      {
        question: "Why was my payment declined?",
        answer:
          "Declines are usually caused by incorrect card details, insufficient funds, or a temporary hold from your bank. Double-check your details or try an alternate payment method.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns",
    icon: RotateCcw,
    items: [
      {
        question: "What is CartIQ's return policy?",
        answer:
          "Most items can be returned within a set window from delivery, as long as they're unused and in original packaging. Exact eligibility is shown on each product page.",
      },
      {
        question: "How do I start a return?",
        answer:
          "Open the order from My Orders and select Request Return. Choose a reason and preferred resolution, refund, replacement, or store credit.",
      },
      {
        question: "How long do refunds take?",
        answer:
          "Once a return is received and inspected, refunds are typically issued to your original payment method within a few business days.",
      },
    ],
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    icon: Sparkles,
    items: [
      {
        question: "What can the AI Assistant help with?",
        answer:
          "Ask it to find products, compare options, explain features, build a gift list, or answer questions about your orders, all in natural conversation.",
      },
      {
        question: "Does the AI Assistant remember my preferences?",
        answer:
          "It uses your recent conversations and shopping activity to personalize suggestions during your session. You're always in control of what you share.",
      },
      {
        question: "Can I trust the AI's product suggestions?",
        answer:
          "Suggestions are generated from real catalog data and your stated preferences, but we always encourage reviewing product details before purchasing.",
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    icon: UserCircle,
    items: [
      {
        question: "How do I create a CartIQ account?",
        answer:
          "Select Register from the profile menu and sign up with your email. You can start shopping immediately after verifying your account.",
      },
      {
        question: "I forgot my password. What do I do?",
        answer:
          "On the login page, select Forgot Password and follow the instructions sent to your registered email to reset it securely.",
      },
      {
        question: "How do I update my personal information?",
        answer:
          "Go to Account from the profile menu to update your name, email, shipping addresses, and notification preferences.",
      },
    ],
  },
  {
    id: "voice-search",
    title: "Voice Search",
    icon: Mic,
    items: [
      {
        question: "How do I use voice search?",
        answer:
          "Tap the microphone icon in the search bar and describe what you're looking for. CartIQ will convert your speech to a search or hand it to the AI Assistant.",
      },
      {
        question: "Which browsers support voice search?",
        answer:
          "Voice search works on modern browsers with microphone permissions enabled, including Chrome, Edge, and Safari on most devices.",
      },
      {
        question: "Is my voice data stored?",
        answer:
          "Voice input is converted to text to process your request and is not retained as audio after your query is handled.",
      },
    ],
  },
];

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-[#faf7f0] transition-colors duration-200 hover:border-indigo-100">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
      >
        <span className="text-[15px] font-medium text-zinc-900">
          {item.question}
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
        <p className="px-5 pb-4 text-sm leading-7 text-zinc-600">
          {item.answer}
        </p>
      </motion.div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          Help Center
        </span>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          How can we help you today?
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">
          Browse answers organized by topic, or reach out directly if you
          can't find what you're looking for.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-2">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-zinc-600 transition-colors duration-200 hover:border-indigo-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            {section.title}
          </a>
        ))}
      </div>

      <div className="mt-14 space-y-14">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-sm">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-950">
                  {section.title}
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <AccordionItem key={item.question} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-16 rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm sm:p-12">
        <h2 className="text-xl font-bold tracking-tight text-zinc-950">
          Still need help?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-zinc-600">
          Our team is happy to help with anything not covered above.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-6 py-3 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}