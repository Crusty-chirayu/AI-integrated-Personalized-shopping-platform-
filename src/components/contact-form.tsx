"use client";

import { useCallback, useId, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  LifeBuoy,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

type ContactOption = {
  key: string;
  label: string;
  detail: string;
  secondaryDetail?: string;
  href: string;
  icon: React.ElementType;
  internal: boolean;
};

const CONTACT_OPTIONS: ContactOption[] = [
  {
    key: "email",
    label: "Email",
    detail: "chirayujaysawal7@gmail.com",
    href: "mailto:chirayujaysawal7@gmail.com",
    icon: Mail,
    internal: false,
  },
  {
    key: "chat",
    label: "Live Chat",
    detail: "Ask CartIQ AI",
    href: "/assistant",
    icon: MessageCircle,
    internal: true,
  },
  {
    key: "phone",
    label: "Phone",
    detail: "+91 62025 26791",
    secondaryDetail: "Secondary: +91 89513 26830",
    href: "tel:+916202526791",
    icon: Phone,
    internal: false,
  },
  {
    key: "help",
    label: "Help Center",
    detail: "Browse articles",
    href: "/help",
    icon: LifeBuoy,
    internal: true,
  },
];

const TRUST_INDICATORS = [
  { icon: Clock, label: "Avg. reply under 2 hours" },
  { icon: ShieldCheck, label: "Secure & encrypted" },
  { icon: Users, label: "Trusted by 50k+ shoppers" },
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const statusId = useId();

  const isSuccess = useMemo(
    () => Boolean(status && status.toLowerCase().startsWith("message sent")),
    [status]
  );
  const isError = Boolean(status) && !isSuccess;

  // Surfaces the browser's native field validity as a friendly inline
  // message — it does not add or change any validation rules.
  const validateField = useCallback(
    (field: keyof FieldErrors, el: HTMLInputElement | HTMLTextAreaElement) => {
      setErrors((prev) => ({
        ...prev,
        [field]: el.validity.valid ? undefined : el.validationMessage,
      }));
    },
    []
  );

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to send message.");
      }
      setStatus("Message sent. We’ll be in touch soon.");
      setName("");
      setEmail("");
      setMessage("");
      setErrors({});
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - bounds.left, y: e.clientY - bounds.top },
    ]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* Main glass card */}
      <div
        className="relative rounded-[32px] p-[1.5px] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)]"
        style={{
          background:
            "conic-gradient(from 180deg, rgba(99,102,241,0.5), rgba(56,189,248,0.4), rgba(244,63,94,0.35), rgba(245,158,11,0.35), rgba(99,102,241,0.5))",
        }}
      >
        <div className="rounded-[30px] border border-white/40 bg-white/70 p-6 backdrop-blur-2xl sm:p-10">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
              <Clock className="h-3 w-3" />
              Avg. response time: under 2 hours
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Contact CartIQ
              </h1>
              <p className="mt-2 max-w-md text-[15px] text-zinc-600">
                Questions, feedback, or an order issue — our team (and our AI) is here to help.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {TRUST_INDICATORS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Icon className="h-3.5 w-3.5 text-zinc-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submit} noValidate={false} className="space-y-5">
            <FloatingInput
              id={nameId}
              label="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                validateField("name", e.target);
              }}
              onBlur={(e) => validateField("name", e.target)}
              required
              autoComplete="name"
              error={errors.name}
            />

            <FloatingInput
              id={emailId}
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateField("email", e.target);
              }}
              onBlur={(e) => validateField("email", e.target)}
              required
              autoComplete="email"
              error={errors.email}
            />

            <FloatingTextarea
              id={messageId}
              label="Tell us what you need"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                validateField("message", e.target);
              }}
              onBlur={(e) => validateField("message", e.target)}
              required
              error={errors.message}
            />

            <motion.button
              type="submit"
              disabled={loading}
              onClick={handleButtonClick}
              whileTap={loading ? undefined : { scale: 0.97 }}
              whileHover={loading ? undefined : { scale: 1.015, y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              aria-describedby={status ? statusId : undefined}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_45px_-18px_rgba(0,0,0,0.55)] ring-1 ring-white/10 transition-colors duration-300 hover:from-indigo-600 hover:via-violet-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:from-zinc-400 disabled:via-zinc-400 disabled:to-zinc-400 disabled:hover:from-zinc-400 sm:w-auto sm:px-8"
            >
              {!loading && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.35) 40%, transparent 60%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                />
              )}
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  initial={{ opacity: 0.4, scale: 0 }}
                  animate={{ opacity: 0, scale: 3 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ left: r.x, top: r.y }}
                  className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50"
                />
              ))}
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </motion.span>
                ) : isSuccess ? (
                  <motion.span
                    key="sent"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Sent
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send inquiry
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <div id={statusId} aria-live="polite" className="min-h-[1px]">
              <AnimatePresence mode="wait">
                {status && (
                  <motion.div
                    key={status}
                    role={isError ? "alert" : "status"}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                      isSuccess
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {isSuccess ? (
                      <motion.span
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 16 }}
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                      </motion.span>
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    )}
                    <span>{status}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar: AI card + contact options */}
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-[28px] border border-violet-200/60 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-6 shadow-[0_20px_60px_-24px_rgba(99,102,241,0.35)]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-violet-400/30 to-cyan-300/30 blur-2xl"
          />
          <div className="relative flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-zinc-900">Need instant help?</p>
              <p className="mt-0.5 text-sm text-zinc-600">Ask CartIQ AI — available 24/7.</p>
            </div>
          </div>
          <Link
            href="/assistant"
            className="group relative z-10 mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Ask CartIQ AI
            <Sparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {CONTACT_OPTIONS.map(({ key, label, detail, secondaryDetail, href, icon: Icon, internal }, i) => {
            const cardClass =
              "group flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";
            const content = (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors duration-300 group-hover:bg-indigo-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-zinc-900">{label}</span>
                <span className="text-xs text-zinc-500">{detail}</span>
                {secondaryDetail && (
                  <span className="text-[11px] text-zinc-400">{secondaryDetail}</span>
                )}
              </>
            );
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05 }}
              >
                {internal ? (
                  <Link href={href} className={cardClass}>
                    {content}
                  </Link>
                ) : (
                  <a href={href} className={cardClass}>
                    {content}
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating-label field primitives
// ---------------------------------------------------------------------------

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  required,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur(e);
          }}
          required={required}
          autoComplete={autoComplete}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-14 w-full rounded-2xl border bg-white/60 px-4 pt-3.5 text-[15px] text-zinc-900 outline-none backdrop-blur-sm transition-colors duration-200 focus:bg-white focus:ring-4 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : "border-black/10 focus:border-indigo-400 focus:ring-indigo-500/10"
          }`}
        />
        <motion.label
          htmlFor={id}
          animate={active ? { y: -21, scale: 0.78 } : { y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className={`pointer-events-none absolute left-4 top-1/2 origin-left -translate-y-1/2 text-[15px] font-medium ${
            error ? "text-red-500" : active ? "text-indigo-600" : "text-zinc-500"
          }`}
        >
          {label}
        </motion.label>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-1.5 flex items-center gap-1 pl-1 text-xs font-medium text-red-500"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function FloatingTextarea({
  id,
  label,
  value,
  onChange,
  onBlur,
  required,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur(e);
          }}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          rows={5}
          className={`min-h-32 w-full rounded-[24px] border bg-white/60 px-4 pb-7 pt-6 text-[15px] text-zinc-900 outline-none backdrop-blur-sm transition-colors duration-200 focus:bg-white focus:ring-4 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : "border-black/10 focus:border-indigo-400 focus:ring-indigo-500/10"
          }`}
        />
        <motion.label
          htmlFor={id}
          animate={active ? { y: -12, scale: 0.78 } : { y: 6, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className={`pointer-events-none absolute left-4 top-3 origin-left text-[15px] font-medium ${
            error ? "text-red-500" : active ? "text-indigo-600" : "text-zinc-500"
          }`}
        >
          {label}
        </motion.label>
        <span className="pointer-events-none absolute bottom-2.5 right-4 text-[11px] tabular-nums text-zinc-400">
          {value.length} characters
        </span>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-1.5 flex items-center gap-1 pl-1 text-xs font-medium text-red-500"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}