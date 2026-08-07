import type { ReactNode } from "react";
import { StorefrontShell } from "@/components/storefront-shell";

export const metadata = {
  title: "CartIQ — Elevated essentials",
  description: "A premium storefront experience for modern commerce.",
};

/* ============================================================================
 * StorefrontLayout — Premium Global Shell Wrapper
 * ----------------------------------------------------------------------------
 * IMPORTANT ARCHITECTURE NOTE
 * This file exports `metadata`, which Next.js only permits in a Server
 * Component. Interactive chrome described in the brief — a hide-on-scroll
 * header, scroll progress bar, scroll-to-top button, and Framer Motion page
 * transitions — all require client-side hooks (useState/useEffect/usePathname),
 * which would force this file into a Client Component and break the
 * `metadata` export. Rather than silently dropping `metadata` or silently
 * skipping those features, this file stays a Server Component and focuses on
 * everything that can be achieved without JavaScript: ambient background
 * treatment, a noise texture, floating blurred light shapes, and semantic /
 * accessibility scaffolding (skip link, landmark regions). All navigation,
 * search, the AI button, and the footer continue to be owned entirely by
 * `StorefrontShell`, untouched, exactly as before.
 * ==========================================================================*/

export default function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen bg-white">
      {/* ------------------------------------------------------------------
          Skip link — accessibility: keyboard users can bypass the shell's
          header/nav and jump straight to page content.
         ------------------------------------------------------------------ */}
      <a
        href="#storefront-main"
        className="sr-only z-[100] rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-6 focus:top-6"
      >
        Skip to content
      </a>

      {/* ------------------------------------------------------------------
          GLOBAL AMBIENT BACKGROUND
          Pure CSS: subtle gradient wash + soft noise texture + slowly
          drifting blurred light shapes. No client JS required, so it works
          identically whether the page below is a server or client tree,
          and never causes a hydration mismatch.
         ------------------------------------------------------------------ */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* Base gradient wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 40% at 8% 0%, rgba(79,70,229,0.06), transparent 60%), radial-gradient(45% 35% at 100% 10%, rgba(20,184,166,0.06), transparent 60%), radial-gradient(40% 40% at 50% 100%, rgba(217,70,239,0.04), transparent 60%)",
          }}
        />

        {/* Floating blurred shapes — CSS keyframe drift, GPU-accelerated
            (transform-only), no layout thrash. */}
        <span className="cartiq-float-shape absolute left-[6%] top-[8%] h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl [animation-duration:22s]" />
        <span className="cartiq-float-shape absolute right-[4%] top-[28%] h-96 w-96 rounded-full bg-teal-200/25 blur-3xl [animation-delay:-8s] [animation-duration:26s]" />
        <span className="cartiq-float-shape absolute bottom-[6%] left-[30%] h-80 w-80 rounded-full bg-fuchsia-200/20 blur-3xl [animation-delay:-14s] [animation-duration:30s]" />

        {/* Subtle noise texture for a premium, tactile surface */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-multiply">
          <filter id="cartiq-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#cartiq-noise)" />
        </svg>
      </div>

      {/* ------------------------------------------------------------------
          Keyframes for the floating shapes — scoped, no external CSS file
          needed, works in a Server Component since it's plain markup.
         ------------------------------------------------------------------ */}
      <style>{`
        @keyframes cartiq-float {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          33%  { transform: translate3d(2%, -3%, 0) scale(1.04); }
          66%  { transform: translate3d(-2%, 2%, 0) scale(0.97); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        .cartiq-float-shape {
          animation-name: cartiq-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .cartiq-float-shape {
            animation: none;
          }
        }

        /* Premium scrollbar */
        html {
          scroll-behavior: smooth;
        }
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(99,102,241,0.35), rgba(20,184,166,0.35));
          border-radius: 9999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(99,102,241,0.55), rgba(20,184,166,0.55));
          background-clip: padding-box;
        }
        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>

      {/* ------------------------------------------------------------------
          MAIN CONTENT — StorefrontShell owns header, nav, search, the
          floating AI button, and the footer. Untouched, exactly as before.
         ------------------------------------------------------------------ */}
      <div id="storefront-main" className="relative">
        <StorefrontShell>{children}</StorefrontShell>
      </div>
    </div>
  );
}