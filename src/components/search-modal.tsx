"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatCurrency";

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; title: string; slug: string; image: string; price: number }>>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const search = async (searchTerm: string) => {
  setLoading(true);

  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(searchTerm)}`
    );

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();

    setResults(
      (data ?? []).map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        image:
          item.product_images?.[0]?.image_url ??
          "https://images.unsplash.com/photo-1522292476735-2c3f01d7c8c8?auto=format&fit=crop&w=900&q=80",
        price: Number(item.price) || 0,
      }))
    );
  } catch (error) {
    console.error(error);
    setResults([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const timer = setTimeout(() => {
      const term = query.trim();

      if (term.length >= 2) {
        search(term);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (slug: string) => {
    onClose();
    router.push(`/products/${slug}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-6">
      <div className="mx-auto flex h-full max-w-4xl flex-col rounded-[32px] bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-950">Search products</h2>
          <button onClick={onClose} className="rounded-full border border-black/10 p-2 text-zinc-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Search for products, categories, or tags"
          className="mt-6 h-14 w-full rounded-full border border-black/10 bg-[#f7f3eb] px-5 text-lg outline-none"
        />
        <div className="mt-6 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-zinc-500">Searching…</p>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product.slug)}
                  className="flex w-full items-center gap-4 rounded-[24px] border border-black/5 bg-[#f7f3eb] p-4 text-left transition hover:bg-[#ede8dd]"
                >
                  <img src={product.image} alt={product.title} className="h-16 w-16 rounded-[18px] object-cover" />
                  <div>
                    <p className="font-semibold text-zinc-950">{product.title}</p>
                    <p className="text-sm text-zinc-600">{formatCurrency(product.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Type at least 2 characters to search.</p>
          )}
        </div>
      </div>
    </div>
  );
}