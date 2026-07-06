const faqs = [
  {
    question: "How quickly do you ship?",
    answer: "Most orders dispatch within 24 hours and arrive in 2–4 business days.",
  },
  {
    question: "Do you offer exchanges?",
    answer: "Yes. We accept exchanges for unused products within 14 days of delivery.",
  },
  {
    question: "Can I track my order?",
    answer: "Absolutely. Tracking details are shared as soon as the parcel leaves our studio.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">FAQ</p>
      <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Common questions, answered clearly.</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-[24px] border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-lg font-semibold text-zinc-900">{faq.question}</p>
            <p className="mt-3 text-base leading-8 text-zinc-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
