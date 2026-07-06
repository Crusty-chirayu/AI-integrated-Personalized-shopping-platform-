import { StorefrontShell } from "@/components/storefront-shell";

export const metadata = {
  title: "CartIQ — Elevated essentials",
  description: "A premium storefront experience for modern commerce.",
};

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return <StorefrontShell>{children}</StorefrontShell>;
}
