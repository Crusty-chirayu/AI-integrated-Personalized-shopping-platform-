"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { X, Search, Mic, Sparkles, Heart, ShoppingBag, TrendingUp, Clock, Pin } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatCurrency";

// ───────────────────────────────────────────────────────────────────────────
// Presentational constants only — no backend calls live here.
// Swap TRENDING_SEARCHES for a real /api/search/trending endpoint later.
// ───────────────────────────────────────────────────────────────────────────
const TRENDING_SEARCHES = [
  "wireless earbuds",
  "running shoes",
  "desk setup",
  "skincare bundle",
  "backpack",
];

const ANIMATED_PLACEHOLDERS = [
  "Search for products, categories, or brands",
  "Try \"minimalist desk lamp\"",
  "Try \"gifts under $50\"",
  "Ask AI to find something for you",
];

const RECENT_KEY = "cq_recent_searches";
const PINNED_KEY = "cq_pinned_searches";
const MAX_RECENT = 8;

type Product = {
  id: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  // Optional fields — only populated if /api/search already returns them.
  // Nothing here is invented when the API omits them.
  category?: string;
  brand?: string;
  rating?: number;
  stock?: number;
  discountPercent?: number;
  oldPrice?: number;
};

function useLocalList(key: string) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
  }, [key]);

  const persist = useCallback(
    (next: string[]) => {
      setItems(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // storage unavailable — fail silently, UI still works in-session
      }
    },
    [key]
  );

  return [items, persist] as const;
}

// Lightweight, client-only relevance heuristic used purely for the
// "AI match" badge. Not a claim about backend ranking — just a visual
// cue derived from the query the user actually typed.
function matchScore(title: string, query: string) {
  if (!query.trim()) return null;
  const q = query.toLowerCase().trim().split(/\s+/);
  const t = title.toLowerCase();
  const hits = q.filter((w) => t.includes(w)).length;
  return Math.round((hits / q.length) * 100);
}

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ───────────────────────────────────────────────────────────────────────
  // SEARCH LOGIC — UNCHANGED. Same endpoint, same debounce, same mapping
  // contract (extra fields below are read only if the API already sends
  // them; nothing about the request itself is modified).
  // ───────────────────────────────────────────────────────────────────────
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
          category: item.category ?? item.category_name ?? undefined,
          brand: item.brand ?? undefined,
          rating: item.rating != null ? Number(item.rating) : undefined,
          stock: item.stock != null ? Number(item.stock) : undefined,
          discountPercent:
            item.discount_percent != null ? Number(item.discount_percent) : undefined,
          oldPrice: item.old_price != null ? Number(item.old_price) : undefined,
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

  // ───────────────────────────────────────────────────────────────────────
  // UI-ONLY STATE — presentation, history, voice, keyboard nav, animation.
  // None of this touches the fetch above.
  // ───────────────────────────────────────────────────────────────────────
  const [shouldRender, setShouldRender] = useState(open);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const [recent, setRecent] = useLocalList(RECENT_KEY);
  const [pinned, setPinned] = useLocalList(PINNED_KEY);
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Mount/unmount with an exit transition instead of an abrupt unmount.
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setShouldRender(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (visible) inputRef.current?.focus();
  }, [visible]);

  // Cycle the placeholder only while the field is empty.
  useEffect(() => {
    if (query) return;
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % ANIMATED_PLACEHOLDERS.length);
    }, 2600);
    return () => clearInterval(id);
  }, [query]);

  // Voice search via the browser's native SpeechRecognition API.
  // Feature-detected — the mic icon simply doesn't render if unsupported.
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setVoiceSupported(true);
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setQuery(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => recognition.abort?.();
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Commit a search term into recent history (dedup, cap length).
  const commitToHistory = useCallback(
    (term: string) => {
      const clean = term.trim();
      if (!clean) return;
      const next = [clean, ...recent.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        MAX_RECENT
      );
      setRecent(next);
    },
    [recent, setRecent]
  );

  const runSearch = (term: string) => {
    setQuery(term);
    commitToHistory(term);
  };

  const togglePinned = (term: string) => {
    const isPinned = pinned.includes(term);
    setPinned(isPinned ? pinned.filter((p) => p !== term) : [term, ...pinned].slice(0, MAX_RECENT));
  };

  const clearHistory = () => setRecent([]);

  const toggleWishlist = (id: string) =>
    setWishlisted((w) => ({ ...w, [id]: !w[id] }));

  const quickAddToCart = (product: Product) => {
    // TODO(cart): wire to the real cart mutation once a cart context /
    // API is available to this component. Purely visual confirmation
    // for now — no data is written anywhere.
    setAddedToCart((a) => ({ ...a, [product.id]: true }));
    window.setTimeout(() => setAddedToCart((a) => ({ ...a, [product.id]: false })), 1600);
  };

  // Derived category/brand chips — computed only from real results
  // already returned by the API, never fabricated.
  const categoryChips = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => r.category && set.add(r.category));
    return Array.from(set).slice(0, 6);
  }, [results]);

  // ───────────────────────────────────────────────────────────────────────
  // Keyboard: Escape closes, ArrowUp/Down move through results, Enter
  // opens the highlighted product, Tab is left to native browser flow
  // within a simple focus trap.
  // ───────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shouldRender) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        commitToHistory(query);
        handleSelect(results[activeIndex].slug);
        return;
      }
      if (e.key === "Tab" && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shouldRender, activeIndex, results, query, onClose]);

  useEffect(() => setActiveIndex(-1), [results]);

  if (!shouldRender) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[8vh] transition-opacity duration-200 sm:p-6 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
        .cqs-font { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cqs-display { font-family: 'Space Grotesk', 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .cqs-gradient-text {
          background: linear-gradient(90deg, #8B6CFF 0%, #22C7E0 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .cqs-glass { background: rgba(255,255,255,0.78); backdrop-filter: blur(28px) saturate(180%); -webkit-backdrop-filter: blur(28px) saturate(180%); }
        .cqs-gradient-border { position: relative; }
        .cqs-gradient-border::before {
          content: ""; position: absolute; inset: 0; padding: 1px; border-radius: inherit;
          background: linear-gradient(135deg, rgba(139,108,255,0.5), rgba(34,199,224,0.15) 45%, rgba(255,255,255,0.4));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
        }
        .cqs-focus-ring:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(139,108,255,0.35); }
        .cqs-shimmer { position: relative; overflow: hidden; background: #F1F0F4; }
        .cqs-shimmer::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent);
          transform: translateX(-100%);
        }
        @media (prefers-reduced-motion: no-preference) {
          .cqs-shimmer::after { animation: cqs-shimmer 1.4s ease-in-out infinite; }
          .cqs-thinking span { animation: cqs-thinking 1.1s ease-in-out infinite; }
          .cqs-thinking span:nth-child(2) { animation-delay: 0.15s; }
          .cqs-thinking span:nth-child(3) { animation-delay: 0.3s; }
          .cqs-pop { animation: cqs-pop 0.32s cubic-bezier(0.16,1,0.3,1) both; }
          .cqs-fade-up { animation: cqs-fade-up 0.28s cubic-bezier(0.16,1,0.3,1) both; }
          .cqs-mic-pulse { animation: cqs-mic-pulse 1.4s ease-in-out infinite; }
        }
        @keyframes cqs-shimmer { to { transform: translateX(100%); } }
        @keyframes cqs-thinking { 0%,80%,100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
        @keyframes cqs-pop { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes cqs-fade-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cqs-mic-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(139,108,255,0.35); } 50% { box-shadow: 0 0 0 8px rgba(139,108,255,0); } }
      `}</style>

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        ref={containerRef}
        className={`cqs-font cqs-glass cqs-gradient-border relative flex max-h-[84vh] w-full max-w-3xl flex-col rounded-[32px] p-6 shadow-[0_30px_80px_rgba(17,17,17,0.28)] transition-all duration-220 ease-out sm:p-8 ${
          visible ? "translate-y-0 scale-100 opacity-100" : "-translate-y-3 scale-[0.97] opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#8B6CFF]" aria-hidden />
            <h2 className="cqs-display text-lg font-semibold text-zinc-950">AI-powered search</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="cqs-focus-ring rounded-full border border-black/10 bg-white p-2 text-zinc-600 transition-all hover:-translate-y-0.5 hover:border-black/20 hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden />

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && activeIndex === -1) commitToHistory(query);
            }}
            placeholder={ANIMATED_PLACEHOLDERS[placeholderIdx]}
            aria-label="Search products, categories, or brands"
            className="cqs-focus-ring h-16 w-full rounded-[22px] border border-black/10 bg-white pl-13 pr-28 text-[17px] text-zinc-950 outline-none transition-all placeholder:text-zinc-400 focus:border-[#8B6CFF]/50 focus:shadow-[0_0_0_4px_rgba(139,108,255,0.12)]"
            style={{ paddingLeft: "3.1rem" }}
          />

          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            {query && (
              <button
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                aria-label="Clear search"
                className="cqs-focus-ring rounded-full p-2 text-zinc-400 transition-colors hover:bg-black/5 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {voiceSupported && (
              <button
                onClick={toggleVoice}
                aria-label={isListening ? "Stop voice search" : "Start voice search"}
                aria-pressed={isListening}
                className={`cqs-focus-ring rounded-full p-2.5 transition-colors ${
                  isListening
                    ? "cqs-mic-pulse bg-[#8B6CFF] text-white"
                    : "text-zinc-400 hover:bg-black/5 hover:text-zinc-700"
                }`}
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
            <kbd className="cqs-font hidden rounded-md border border-black/10 bg-black/5 px-1.5 py-1 text-[11px] font-medium text-zinc-500 sm:inline-block">
              ESC
            </kbd>
          </div>
        </div>

        {/* Category chips derived from live results */}
        {categoryChips.length > 0 && (
          <div className="cqs-fade-up mt-3 flex flex-wrap gap-2">
            {categoryChips.map((c) => (
              <button
                key={c}
                onClick={() => runSearch(c)}
                className="cqs-focus-ring rounded-full border border-black/10 bg-white px-3 py-1 text-[12.5px] font-medium text-zinc-600 transition-colors hover:border-[#8B6CFF]/40 hover:text-[#7C5CFC]"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 flex-1 overflow-y-auto pr-1">
          {/* Empty state: trending + recent + pinned */}
          {!query && (
            <div className="cqs-fade-up space-y-7">
              {pinned.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-zinc-400">
                    <Pin className="h-3.5 w-3.5" /> Pinned
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pinned.map((term) => (
                      <button
                        key={term}
                        onClick={() => runSearch(term)}
                        className="cqs-focus-ring inline-flex items-center gap-1.5 rounded-full border border-[#8B6CFF]/25 bg-[#8B6CFF]/[0.06] px-3.5 py-1.5 text-[13px] font-medium text-[#7C5CFC] transition-all hover:-translate-y-0.5"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {recent.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-zinc-400">
                      <Clock className="h-3.5 w-3.5" /> Recent searches
                    </div>
                    <button
                      onClick={clearHistory}
                      className="cqs-focus-ring text-[12px] font-medium text-zinc-400 underline underline-offset-2 hover:text-zinc-700"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <div
                        key={term}
                        className="group inline-flex items-center gap-1 rounded-full border border-black/10 bg-white pl-3.5 pr-1.5 py-1.5 text-[13px] font-medium text-zinc-600 transition-all hover:-translate-y-0.5 hover:border-black/20"
                      >
                        <button onClick={() => runSearch(term)} className="cqs-focus-ring">{term}</button>
                        <button
                          onClick={() => togglePinned(term)}
                          aria-label={pinned.includes(term) ? "Unpin search" : "Pin search"}
                          className="cqs-focus-ring rounded-full p-1 text-zinc-300 hover:text-[#8B6CFF]"
                        >
                          <Pin className={`h-3 w-3 ${pinned.includes(term) ? "fill-[#8B6CFF] text-[#8B6CFF]" : ""}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="mb-3 flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-zinc-400">
                  <TrendingUp className="h-3.5 w-3.5" /> Trending searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => runSearch(term)}
                      className="cqs-focus-ring inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[13px] font-medium text-zinc-600 transition-all hover:-translate-y-0.5 hover:border-[#22C7E0]/40 hover:text-[#0f9fb3]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#8B6CFF] to-[#22C7E0]" />
                      {term}
                    </button>
                  ))}
                </div>
              </section>

              {recent.length === 0 && pinned.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-black/10 py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#8B6CFF]/15 to-[#22C7E0]/15">
                    <Search className="h-6 w-6 text-[#8B6CFF]" />
                  </div>
                  <p className="cqs-display text-[15px] font-semibold text-zinc-800">Search anything in the store</p>
                  <p className="cqs-font mt-1 max-w-xs text-[13px] text-zinc-500">
                    Try a product, a category, or describe what you're looking for.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {query && loading && (
            <div className="space-y-3">
              <div className="cqs-thinking mb-1 flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8B6CFF]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#8B6CFF]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#8B6CFF]" />
                <span className="cqs-font ml-1">AI is thinking…</span>
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-[24px] border border-black/5 p-4">
                  <div className="cqs-shimmer h-16 w-16 flex-none rounded-[18px]" />
                  <div className="flex-1 space-y-2">
                    <div className="cqs-shimmer h-3.5 w-2/3 rounded-full" />
                    <div className="cqs-shimmer h-3 w-1/4 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {query && !loading && results.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {results.map((product, i) => (
                <ProductResultCard
                  key={product.id}
                  product={product}
                  active={i === activeIndex}
                  score={matchScore(product.title, query)}
                  wishlisted={!!wishlisted[product.id]}
                  justAdded={!!addedToCart[product.id]}
                  onSelect={() => { commitToHistory(query); handleSelect(product.slug); }}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                  onQuickAdd={() => quickAddToCart(product)}
                />
              ))}
            </div>
          )}

          {/* No matches for a real (>=2 char) query */}
          {query && !loading && results.length === 0 && query.trim().length >= 2 && (
            <div className="cqs-fade-up flex flex-col items-center justify-center rounded-[24px] border border-dashed border-black/10 py-12 text-center">
              <p className="cqs-display text-[15px] font-semibold text-zinc-800">No matches for "{query}"</p>
              <p className="cqs-font mt-1 text-[13px] text-zinc-500">Try a different term, or explore what's trending.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {TRENDING_SEARCHES.slice(0, 4).map((term) => (
                  <button
                    key={term}
                    onClick={() => runSearch(term)}
                    className="cqs-focus-ring rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[13px] font-medium text-zinc-600 hover:border-[#8B6CFF]/40 hover:text-[#7C5CFC]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim().length === 1 && (
            <p className="cqs-font text-sm text-zinc-500">Type at least 2 characters to search.</p>
          )}
        </div>

        {/* Footer keyboard legend */}
        <div className="cqs-font mt-5 hidden items-center gap-4 border-t border-black/5 pt-4 text-[12px] text-zinc-400 sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded-md border border-black/10 bg-black/5 px-1.5 py-0.5">↑</kbd>
            <kbd className="rounded-md border border-black/10 bg-black/5 px-1.5 py-0.5">↓</kbd>
            Navigate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded-md border border-black/10 bg-black/5 px-1.5 py-0.5">↵</kbd>
            Select
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded-md border border-black/10 bg-black/5 px-1.5 py-0.5">Tab</kbd>
            Move focus
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded-md border border-black/10 bg-black/5 px-1.5 py-0.5">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Memoized product card — keeps re-renders cheap while typing/navigating.
// ─────────────────────────────────────────────────────────────────────────
const ProductResultCard = memo(function ProductResultCard({
  product,
  active,
  score,
  wishlisted,
  justAdded,
  onSelect,
  onToggleWishlist,
  onQuickAdd,
}: {
  product: Product;
  active: boolean;
  score: number | null;
  wishlisted: boolean;
  justAdded: boolean;
  onSelect: () => void;
  onToggleWishlist: () => void;
  onQuickAdd: () => void;
}) {
  return (
    <div
      className={`cqs-pop group relative flex items-center gap-4 rounded-[22px] border p-3.5 text-left transition-all ${
        active
          ? "border-[#8B6CFF]/50 bg-[#8B6CFF]/[0.05] shadow-[0_0_0_3px_rgba(139,108,255,0.12)]"
          : "border-black/5 bg-white hover:-translate-y-0.5 hover:border-black/10 hover:shadow-[0_10px_24px_rgba(17,17,17,0.08)]"
      }`}
    >
      <button onClick={onSelect} className="flex flex-1 items-center gap-4 text-left">
        <div className="relative h-16 w-16 flex-none overflow-hidden rounded-[16px] bg-zinc-100">
          <img src={product.image} alt={product.title} loading="lazy" className="h-full w-full object-cover" />
          {typeof product.discountPercent === "number" && product.discountPercent > 0 && (
            <span className="absolute left-1 top-1 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="cqs-font truncate text-[14.5px] font-semibold text-zinc-950">{product.title}</p>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="cqs-font text-[13.5px] font-semibold text-zinc-800">
              {formatCurrency(product.price)}
            </span>
            {typeof product.oldPrice === "number" && product.oldPrice > product.price && (
              <span className="cqs-font text-[12px] text-zinc-400 line-through">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
            {typeof product.rating === "number" && (
              <span className="cqs-font text-[12px] text-zinc-500">★ {product.rating.toFixed(1)}</span>
            )}
            {typeof product.stock === "number" && (
              <span className={`cqs-font text-[12px] ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {product.stock > 0 ? "In stock" : "Out of stock"}
              </span>
            )}
          </div>

          {score !== null && score >= 50 && (
            <span className="cqs-font mt-1.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#8B6CFF]/12 to-[#22C7E0]/12 px-2 py-0.5 text-[10.5px] font-semibold text-[#7C5CFC]">
              <Sparkles className="h-2.5 w-2.5" /> {score}% AI match
            </span>
          )}
        </div>
      </button>

      <div className="flex flex-none flex-col items-center gap-1.5">
        <button
          onClick={onToggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="cqs-focus-ring rounded-full p-2 text-zinc-400 transition-colors hover:bg-black/5 hover:text-red-500"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>
        <button
          onClick={onQuickAdd}
          aria-label="Quick add to cart"
          className={`cqs-focus-ring rounded-full p-2 transition-colors ${
            justAdded ? "bg-emerald-500 text-white" : "text-zinc-400 hover:bg-black/5 hover:text-[#7C5CFC]"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});