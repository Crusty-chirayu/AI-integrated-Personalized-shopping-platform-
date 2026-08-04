import { Shield } from "lucide-react";

const sections = [
  {
    title: "1. Overview",
    body: "CartIQ (\"we\", \"our\", \"us\") is an AI-powered shopping platform. This Privacy Policy explains what information we collect, how we use it, and the choices you have. By using CartIQ, you agree to the practices described here.",
  },
  {
    title: "2. Information We Collect",
    body: "We collect information you provide directly, such as your name, email address, and shipping details when you register or place an order. We also collect information automatically, including device details, pages visited, and general usage patterns.",
  },
  {
    title: "3. Account & Authentication",
    body: "Account creation and sign-in are handled through Supabase, our authentication and database provider. Supabase stores your credentials securely using industry-standard encryption; CartIQ never stores plain-text passwords.",
  },
  {
    title: "4. AI Conversations",
    body: "Messages you send to the AI Assistant are processed to generate relevant responses and product recommendations. Conversation content may be temporarily retained to improve the quality and continuity of the assistant, and is not sold to third parties.",
  },
  {
    title: "5. Cookies",
    body: "CartIQ uses cookies and similar technologies to keep you signed in, remember your cart and preferences, and understand how the platform is used. You can control cookies through your browser settings, though some features may not work correctly if cookies are disabled.",
  },
  {
    title: "6. Analytics",
    body: "We use aggregated analytics to understand how customers interact with CartIQ, such as which pages and products are most viewed. This data is used to improve performance and the shopping experience, and is analyzed in a form that does not directly identify you wherever possible.",
  },
  {
    title: "7. How We Use Your Data",
    body: "Your data is used to fulfill orders, personalize AI recommendations, provide customer support, secure your account, and improve CartIQ's features. We do not sell your personal data to third parties.",
  },
  {
    title: "8. Data Sharing",
    body: "We share data only with service providers necessary to operate CartIQ, such as payment processors and hosting infrastructure, and only to the extent required to provide the service. These providers are bound to handle your data responsibly.",
  },
  {
    title: "9. Data Retention",
    body: "We retain account and order information for as long as your account is active or as needed to comply with legal obligations. You may request deletion of your account and associated data at any time.",
  },
  {
    title: "10. Your Rights",
    body: "You can access, update, or delete your personal information from your Account settings, or by contacting us directly. You may also opt out of non-essential communications at any time.",
  },
  {
    title: "11. Security",
    body: "We use reasonable technical and organizational measures to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
  },
  {
    title: "12. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Material changes will be reflected with an updated revision date on this page.",
  },
  {
    title: "13. Contact Us",
    body: "If you have questions about this Privacy Policy or how your data is handled, reach out at chirayujaysawal7@gmail.com.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
          <Shield className="h-3.5 w-3.5 text-indigo-600" />
          Privacy Policy
        </span>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          Your privacy matters to us
        </h1>

        <p className="mt-3 text-sm text-zinc-500">Last updated: January 2026</p>
      </div>

      <div className="mt-14 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}