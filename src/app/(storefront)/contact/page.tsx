"use client";

import { useState } from "react";
import { Github, Linkedin, Mail, MapPin, Send, Sparkles } from "lucide-react";

const CONTACT_EMAIL = "chirayujaysawal7@gmail.com";
const GITHUB_URL = "https://github.com/Crusty-chirayu";
const LINKEDIN_URL = "https://www.linkedin.com/in/chirayu-jayaswal";

type FormState = {
  name: string;
  email: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = { name: "", email: "", message: "" };

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Please enter your name.";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!form.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!form.message.trim()) {
    errors.message = "Please enter a message.";
  } else if (form.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true);
      setForm(initialForm);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          Get in Touch
        </span>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          We'd love to hear from you
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">
          Questions, feedback, or partnership ideas, reach out and the CartIQ
          team will get back to you.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-5">
        {/* Info column */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">
              CartIQ
            </h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              An AI-powered shopping assistant helping customers discover the
              right products through personalized recommendations and
              conversational AI.
            </p>

            <div className="mt-8 space-y-5">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-start gap-3.5 rounded-2xl transition-colors duration-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf7f0] text-zinc-600">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    Email
                  </span>
                  <span className="mt-0.5 block break-all text-sm font-medium text-zinc-900">
                    {CONTACT_EMAIL}
                  </span>
                </span>
              </a>

              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf7f0] text-zinc-600">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    Location
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-zinc-900">
                    Bangalore, India
                  </span>
                </span>
              </div>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3.5 transition-colors duration-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf7f0] text-zinc-600">
                  <Github className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    GitHub
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-zinc-900">
                    Crusty-chirayu
                  </span>
                </span>
              </a>

              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3.5 transition-colors duration-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf7f0] text-zinc-600">
                  <Linkedin className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    LinkedIn
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-zinc-900">
                    chirayu-jayaswal
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Form column */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
            {submitted && (
              <div
                role="status"
                className="mb-6 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700"
              >
                Thanks for reaching out! We'll get back to you soon.
              </div>
            )}

            <form noValidate onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`w-full rounded-xl border bg-[#faf7f0] px-4 py-3 text-sm text-zinc-900 outline-none transition-colors duration-200 placeholder:text-zinc-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 ${
                    errors.name ? "border-red-300" : "border-black/10"
                  }`}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-xs text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full rounded-xl border bg-[#faf7f0] px-4 py-3 text-sm text-zinc-900 outline-none transition-colors duration-200 placeholder:text-zinc-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 ${
                    errors.email ? "border-red-300" : "border-black/10"
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={`w-full resize-none rounded-xl border bg-[#faf7f0] px-4 py-3 text-sm text-zinc-900 outline-none transition-colors duration-200 placeholder:text-zinc-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 ${
                    errors.message ? "border-red-300" : "border-black/10"
                  }`}
                  placeholder="How can we help?"
                />
                {errors.message && (
                  <p id="message-error" className="mt-1.5 text-xs text-red-600">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-6 py-3.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}