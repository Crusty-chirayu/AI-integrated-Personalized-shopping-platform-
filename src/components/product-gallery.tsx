"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Gem,
  RotateCw,
  Sparkles,
  X,
  ZoomIn,
} from "lucide-react";

type ProductGalleryProps = {
  images?: string[];
  /** Optional product name used for alt text / fullscreen title. Purely cosmetic — defaults preserve original behavior. */
  productName?: string;
};

const BADGES = [
  { key: "ai", label: "AI Recommended View", icon: Sparkles },
  { key: "360", label: "360° Ready", icon: RotateCw },
  { key: "hd", label: "HD Image", icon: ZoomIn },
  { key: "premium", label: "Premium Product", icon: Gem },
] as const;

export default function ProductGallery({
  images = [],
  productName = "Product",
}: ProductGalleryProps) {
  const gallery = useMemo(
    () => (images.length > 0 ? images : ["/placeholder.png"]),
    [images]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false); // desktop hover / double-click zoom
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const [fsScale, setFsScale] = useState(1); // fullscreen pinch / double-click scale
  const [fsPan, setFsPan] = useState({ x: 0, y: 0 });

  const mainImageRef = useRef<HTMLDivElement>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartScale = useRef(1);
  const galleryId = useId();

  // Keep the selected index valid if the images array ever changes length.
  useEffect(() => {
    if (selectedIndex > gallery.length - 1) setSelectedIndex(0);
  }, [gallery.length, selectedIndex]);

  const activeImage = gallery[selectedIndex];

  const markLoaded = useCallback((index: number) => {
    setLoaded((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const next = (index + gallery.length) % gallery.length;
      setSelectedIndex(next);
      setIsZoomed(false);
      setFsScale(1);
      setFsPan({ x: 0, y: 0 });
    },
    [gallery.length]
  );

  const goNext = useCallback(() => goTo(selectedIndex + 1), [goTo, selectedIndex]);
  const goPrev = useCallback(() => goTo(selectedIndex - 1), [goTo, selectedIndex]);

  // Desktop hover-zoom: track pointer position as a percentage for transform-origin.
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width) * 100;
    const y = ((e.clientY - bounds.top) / bounds.height) * 100;
    setLensPos({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }, []);

  // Fullscreen keyboard navigation.
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen, goNext, goPrev]);

  // Lock body scroll while the fullscreen viewer is open.
  useEffect(() => {
    if (!isFullscreen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isFullscreen]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (fsScale > 1.02) return; // don't swipe-navigate while zoomed in — that's for panning
      const swipe = info.offset.x;
      const velocity = info.velocity.x;
      if (swipe < -80 || velocity < -500) goNext();
      else if (swipe > 80 || velocity > 500) goPrev();
    },
    [fsScale, goNext, goPrev]
  );

  const handleDoubleClick = useCallback(() => {
    setIsZoomed((z) => !z);
  }, []);

  const handleFsDoubleClick = useCallback(() => {
    setFsScale((s) => (s > 1 ? 1 : 2.2));
    setFsPan({ x: 0, y: 0 });
  }, []);

  const distanceBetweenTouches = (touches: React.TouchList) => {
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        pinchStartDistance.current = distanceBetweenTouches(e.touches);
        pinchStartScale.current = fsScale;
      }
    },
    [fsScale]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistance.current) {
      const newDistance = distanceBetweenTouches(e.touches);
      const ratio = newDistance / pinchStartDistance.current;
      const next = Math.min(4, Math.max(1, pinchStartScale.current * ratio));
      setFsScale(next);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchStartDistance.current = null;
  }, []);

  return (
    <div className="grid gap-5 lg:grid-cols-[88px_1fr]">
      {/* Thumbnail rail */}
      <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:max-h-[620px] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 lg:pr-1 [scrollbar-width:thin]">
        {gallery.map((image, index) => {
          const isActive = index === selectedIndex;
          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`View image ${index + 1} of ${gallery.length}`}
              aria-current={isActive}
              className="group relative shrink-0 overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2"
            >
              {isActive && (
                <motion.span
                  layoutId={`thumb-ring-${galleryId}`}
                  className="absolute inset-0 z-10 rounded-2xl border-2 border-black shadow-[0_0_0_3px_rgba(0,0,0,0.08),0_8px_20px_-6px_rgba(0,0,0,0.35)]"
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                />
              )}
              <span
                className={`absolute inset-0 z-0 rounded-2xl border-2 transition-colors duration-300 ${
                  isActive
                    ? "border-transparent"
                    : "border-transparent group-hover:border-zinc-300"
                }`}
              />
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="relative z-[1] h-16 w-16 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
            </button>
          );
        })}
      </div>

      {/* Main image */}
      <div className="order-1 lg:order-2">
        <div
          ref={mainImageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
          onDoubleClick={handleDoubleClick}
          className="group relative h-full overflow-hidden rounded-[32px] border border-white/40 bg-gradient-to-br from-zinc-50 to-zinc-100 p-3 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.04] backdrop-blur-sm"
        >
          {/* AI / quality badges */}
          <div className="pointer-events-none absolute left-5 top-5 z-20 flex flex-wrap gap-1.5">
            {BADGES.map(({ key, label, icon: BadgeIcon }) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white shadow-sm backdrop-blur-md"
              >
                <BadgeIcon className="h-3 w-3" strokeWidth={2.25} />
                {label}
              </span>
            ))}
          </div>

          {/* Fullscreen trigger */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="View fullscreen"
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white shadow-lg backdrop-blur-md transition-transform duration-200 hover:scale-110 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Expand className="h-4 w-4" />
          </button>

          {/* Image counter + title */}
          <div className="pointer-events-none absolute bottom-5 left-5 z-20 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <span className="tabular-nums">{selectedIndex + 1}</span>
            <span className="mx-1 text-white/50">/</span>
            <span className="tabular-nums text-white/70">{gallery.length}</span>
            <span className="ml-2 hidden text-white/70 sm:inline">{productName}</span>
          </div>

          {/* Skeleton + shimmer while the active image loads */}
          {!loaded[selectedIndex] && (
            <div className="absolute inset-3 z-10 overflow-hidden rounded-[24px] bg-zinc-200">
              <motion.div
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                animate={{ x: ["-120%", "220%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}

          <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-[24px] sm:min-h-[520px] lg:min-h-[620px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={selectedIndex}
                src={activeImage}
                alt={`${productName} — image ${selectedIndex + 1} of ${gallery.length}`}
                loading={selectedIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                onLoad={() => markLoaded(selectedIndex)}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: `${lensPos.x}% ${lensPos.y}%` }}
                className={`h-full w-full cursor-zoom-in object-cover transition-[transform,filter] duration-500 ease-out will-change-transform ${
                  isZoomed
                    ? "scale-[2] cursor-zoom-out"
                    : "scale-100 group-hover:scale-[1.06]"
                } ${loaded[selectedIndex] ? "blur-none" : "blur-lg"}`}
              />
            </AnimatePresence>

            {/* Gradient overlay for depth / legibility */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />
          </div>

          {/* Prev / next quick controls (desktop convenience — thumbnails remain fully functional) */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous image"
                className="absolute left-5 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/70 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 lg:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next image"
                className="absolute right-5 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/70 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 lg:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen luxury viewer */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} image viewer`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl"
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen viewer"
              className="absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-transform duration-200 hover:scale-110 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pointer-events-none absolute left-1/2 top-5 z-30 -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-md">
              <span className="tabular-nums">{selectedIndex + 1}</span>
              <span className="mx-1 text-white/50">/</span>
              <span className="tabular-nums text-white/60">{gallery.length}</span>
            </div>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-transform duration-200 hover:scale-110 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-8"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-transform duration-200 hover:scale-110 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-8"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <motion.div
              className="relative flex h-full w-full items-center justify-center overflow-hidden px-4 py-16 sm:px-16"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={selectedIndex}
                  src={activeImage}
                  alt={`${productName} — fullscreen image ${selectedIndex + 1} of ${gallery.length}`}
                  drag={fsScale > 1 ? true : "x"}
                  dragElastic={0.12}
                  dragMomentum={fsScale <= 1}
                  onDragEnd={handleDragEnd}
                  onDoubleClick={handleFsDoubleClick}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: fsScale }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={`max-h-full max-w-full select-none rounded-2xl object-contain shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] ${
                    fsScale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
                  }`}
                  draggable={false}
                />
              </AnimatePresence>
            </motion.div>

            <p className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-[11px] text-white/50 sm:block">
              Double-click or pinch to zoom · Drag to pan · Swipe or use arrow keys to browse
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}