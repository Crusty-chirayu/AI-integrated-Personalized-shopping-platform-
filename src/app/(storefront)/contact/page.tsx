import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Contact</p>
          <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Let’s talk about your next project.</h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            We’re available for personal styling, bulk orders, and bespoke experiences.
          </p>
        </div>
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
