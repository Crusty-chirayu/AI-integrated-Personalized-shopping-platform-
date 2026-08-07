"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  memo,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  Trash2,
  Plus,
  Search,
  Pin,
  PinOff,
  Star,
  MoreHorizontal,
  Pencil,
  Copy,
  Share2,
  Download,
  Sparkles,
  MessageSquare,
  X,
  Check,
  Menu as MenuIcon,
  CircleDot,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * Conversation shape is intentionally backwards compatible.
 * Only `id` and `title` are required — everything else is optional so
 * existing callers that only pass { id, title } keep working exactly
 * as before, while richer data (when available) unlocks the premium UI.
 */
type Conversation = {
  id: string;
  title: string;
  preview?: string;
  updatedAt?: string | number | Date;
  pinned?: boolean;
  favorite?: boolean;
  unread?: boolean;
};

type AIStatus = "online" | "thinking" | "offline";

type Props = {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;

  /* ---- Everything below is optional & additive. Nothing here
     changes existing behavior — omit them and the component works
     exactly as it always has, just re-skinned. Provide them to wire
     the new quick actions into real backend logic later. ---- */
  isLoading?: boolean;
  aiStatus?: AIStatus;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRename?: (id: string, title: string) => void;
  onDuplicate?: (id: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
  onFavorite?: (id: string, favorite: boolean) => void;
  onShare?: (id: string) => void;
  onExport?: (id: string) => void;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function toDate(value?: string | number | Date): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatRelativeTime(value?: string | number | Date): string {
  const d = toDate(value);
  if (!d) return "";
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Buckets conversations into Today / Yesterday / This Week / Earlier.
 *  If no conversation has a usable date, everything falls into a single
 *  "All Conversations" bucket so the feature degrades gracefully. */
function groupByRecency(list: Conversation[]) {
  const hasDates = list.some((c) => toDate(c.updatedAt));
  if (!hasDates) {
    return list.length ? [{ label: "All Conversations", items: list }] : [];
  }

  const today = startOfDay(new Date());
  const yesterday = today - 86400000;
  const weekAgo = today - 6 * 86400000;

  const buckets: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  for (const c of list) {
    const d = toDate(c.updatedAt);
    if (!d) {
      buckets.Earlier.push(c);
      continue;
    }
    const t = startOfDay(d);
    if (t === today) buckets.Today.push(c);
    else if (t === yesterday) buckets.Yesterday.push(c);
    else if (t >= weekAgo) buckets["This Week"].push(c);
    else buckets.Earlier.push(c);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

/* ------------------------------------------------------------------ */
/*  Motion variants                                                     */
/* ------------------------------------------------------------------ */

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.035, delayChildren: 0.03 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 32 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15 },
  },
};

/* ------------------------------------------------------------------ */
/*  Skeleton                                                            */
/* ------------------------------------------------------------------ */

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] p-3"
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 shrink-0 rounded-xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded-full bg-white/10" />
          <div className="h-2.5 w-1/2 rounded-full bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                         */
/* ------------------------------------------------------------------ */

function EmptyState({ isSearch }: { isSearch: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/10 ring-1 ring-white/10"
      >
        <Sparkles className="h-6 w-6 text-violet-300" strokeWidth={1.75} />
        <span className="absolute inset-0 animate-ping rounded-2xl bg-violet-500/10" />
      </motion.div>
      <p className="text-sm font-medium text-zinc-200">
        {isSearch ? "No matching conversations" : "No conversations yet"}
      </p>
      <p className="max-w-[220px] text-xs leading-relaxed text-zinc-500">
        {isSearch
          ? "Try a different search term, or clear the search to see everything."
          : "Start a new chat and it will show up here, ready whenever you need it."}
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section divider                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-[#0F1115] via-[#0F1115]/95 to-transparent px-3 pb-1.5 pt-3 backdrop-blur-sm">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {children}
      </span>
      <span className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Context menu                                                        */
/* ------------------------------------------------------------------ */

type MenuAction = {
  key: string;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
};

function CardMenu({
  open,
  onClose,
  actions,
  anchorLabel,
}: {
  open: boolean;
  onClose: () => void;
  actions: MenuAction[];
  anchorLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="menu"
          aria-label={`Actions for ${anchorLabel}`}
          initial={{ opacity: 0, scale: 0.94, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -4 }}
          transition={{ duration: 0.12 }}
          className="absolute right-2 top-9 z-30 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#16181D]/95 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          {actions.map((a) => (
            <button
              key={a.key}
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                a.onClick();
                onClose();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 ${
                a.danger
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-zinc-200 hover:bg-white/[0.06]"
              }`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Conversation card                                                   */
/* ------------------------------------------------------------------ */

type CardProps = {
  conversation: Conversation;
  displayTitle: string;
  isSelected: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  isMenuOpen: boolean;
  isRenaming: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onExport: () => void;
  onStartRename: () => void;
  onCommitRename: (value: string) => void;
  onCancelRename: () => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
};

const ConversationCard = memo(function ConversationCard({
  conversation,
  displayTitle,
  isSelected,
  isPinned,
  isFavorite,
  isMenuOpen,
  isRenaming,
  onSelect,
  onDelete,
  onTogglePin,
  onToggleFavorite,
  onDuplicate,
  onShare,
  onExport,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onToggleMenu,
  onCloseMenu,
}: CardProps) {
  const [draft, setDraft] = useState(displayTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      setDraft(displayTitle);
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [isRenaming, displayTitle]);

  const handleRenameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onCommitRename(draft.trim() || displayTitle);
    if (e.key === "Escape") onCancelRename();
  };

  const actions: MenuAction[] = [
    {
      key: "rename",
      label: "Rename",
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: onStartRename,
    },
    {
      key: "pin",
      label: isPinned ? "Unpin" : "Pin",
      icon: isPinned ? (
        <PinOff className="h-3.5 w-3.5" />
      ) : (
        <Pin className="h-3.5 w-3.5" />
      ),
      onClick: onTogglePin,
    },
    {
      key: "favorite",
      label: isFavorite ? "Unfavorite" : "Favorite",
      icon: (
        <Star
          className={`h-3.5 w-3.5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
        />
      ),
      onClick: onToggleFavorite,
    },
    {
      key: "duplicate",
      label: "Duplicate",
      icon: <Copy className="h-3.5 w-3.5" />,
      onClick: onDuplicate,
    },
    {
      key: "share",
      label: "Share",
      icon: <Share2 className="h-3.5 w-3.5" />,
      onClick: onShare,
    },
    {
      key: "export",
      label: "Export chat",
      icon: <Download className="h-3.5 w-3.5" />,
      onClick: onExport,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      danger: true,
      onClick: onDelete,
    },
  ];

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      whileHover={{ y: -2 }}
      className="relative"
    >
      <div
        role="option"
        aria-selected={isSelected}
        tabIndex={0}
        onClick={() => !isRenaming && onSelect()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isRenaming) {
            e.preventDefault();
            onSelect();
          }
        }}
        className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2.5 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-violet-400/60 ${
          isSelected
            ? "border-white/10 bg-gradient-to-br from-violet-500/20 via-white/[0.06] to-cyan-400/10 shadow-lg shadow-violet-900/20"
            : "border-transparent hover:border-white/5 hover:bg-white/[0.045]"
        }`}
      >
        {/* AI icon */}
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isSelected
              ? "bg-gradient-to-br from-violet-500 to-cyan-400 text-white"
              : "bg-white/[0.06] text-zinc-400 group-hover:text-zinc-200"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {isRenaming ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleRenameKeyDown}
                onBlur={() => onCommitRename(draft.trim() || displayTitle)}
                aria-label="Rename conversation"
                className="w-full rounded-md border border-violet-400/40 bg-black/30 px-1.5 py-0.5 text-[13.5px] font-medium text-zinc-100 outline-none"
              />
            ) : (
              <p
                className={`truncate text-[13.5px] font-medium leading-snug ${
                  isSelected ? "text-white" : "text-zinc-200"
                }`}
              >
                {displayTitle}
              </p>
            )}

            {isPinned && !isRenaming && (
              <Pin
                aria-label="Pinned"
                className="h-3 w-3 shrink-0 rotate-45 text-violet-300"
              />
            )}
            {isFavorite && !isRenaming && (
              <Star
                aria-label="Favorite"
                className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400"
              />
            )}
            {conversation.unread && !isRenaming && (
              <span
                aria-label="Unread"
                className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]"
              />
            )}
          </div>

          {conversation.preview && !isRenaming && (
            <p className="mt-0.5 truncate text-[12px] leading-snug text-zinc-500">
              {conversation.preview}
            </p>
          )}

          {conversation.updatedAt && !isRenaming && (
            <p className="mt-1 text-[10.5px] font-medium tracking-wide text-zinc-600">
              {formatRelativeTime(conversation.updatedAt)}
            </p>
          )}
        </div>

        {/* Quick action trigger */}
        {!isRenaming && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu();
            }}
            title="More actions"
            aria-label={`More actions for ${displayTitle}`}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className={`shrink-0 rounded-lg p-1.5 text-zinc-500 opacity-0 transition-all duration-150 hover:bg-white/10 hover:text-zinc-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 group-hover:opacity-100 ${
              isMenuOpen ? "opacity-100 bg-white/10 text-zinc-100" : ""
            }`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}

        <CardMenu
          open={isMenuOpen}
          onClose={onCloseMenu}
          actions={actions}
          anchorLabel={displayTitle}
        />
      </div>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export default function ConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
  onDelete,
  isLoading = false,
  aiStatus = "online",
  isOpen: controlledOpen,
  onOpenChange,
  onRename,
  onDuplicate,
  onPin,
  onFavorite,
  onShare,
  onExport,
}: Props) {
  const [query, setQuery] = useState("");
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isMobileOpen = controlledOpen ?? uncontrolledOpen;
  const setMobileOpen = onOpenChange ?? setUncontrolledOpen;

  const [pinnedIds, setPinnedIds] = useState<Set<string>>(
    () => new Set(conversations.filter((c) => c.pinned).map((c) => c.id))
  );
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(conversations.filter((c) => c.favorite).map((c) => c.id))
  );
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  // Keep local pin/favorite state in sync when new conversations arrive
  // with those flags already set, without clobbering local toggles.
  useEffect(() => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      conversations.forEach((c) => c.pinned && next.add(c.id));
      return next;
    });
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      conversations.forEach((c) => c.favorite && next.add(c.id));
      return next;
    });
  }, [conversations]);

  // Cmd/Ctrl+K focuses search — quality-of-life shortcut.
  useEffect(() => {
    function handleKey(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const getTitle = useCallback(
    (c: Conversation) => titleOverrides[c.id] ?? c.title,
    [titleOverrides]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const title = getTitle(c).toLowerCase();
      const preview = (c.preview ?? "").toLowerCase();
      return title.includes(q) || preview.includes(q);
    });
  }, [conversations, query, getTitle]);

  const pinned = useMemo(
    () => filtered.filter((c) => pinnedIds.has(c.id)),
    [filtered, pinnedIds]
  );
  const unpinned = useMemo(
    () => filtered.filter((c) => !pinnedIds.has(c.id)),
    [filtered, pinnedIds]
  );
  const groups = useMemo(() => groupByRecency(unpinned), [unpinned]);

  const statusMeta: Record<AIStatus, { color: string; label: string }> = {
    online: { color: "bg-emerald-400", label: "AI Online" },
    thinking: { color: "bg-amber-400", label: "Thinking…" },
    offline: { color: "bg-zinc-500", label: "Offline" },
  };

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete]
  );

  const handleExport = useCallback(
    (c: Conversation) => {
      if (onExport) {
        onExport(c.id);
        return;
      }
      // Sensible client-only default: download a JSON snapshot.
      try {
        const blob = new Blob(
          [JSON.stringify({ id: c.id, title: getTitle(c), preview: c.preview }, null, 2)],
          { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${getTitle(c).replace(/[^\w-]+/g, "_") || "conversation"}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        /* no-op fallback */
      }
    },
    [onExport, getTitle]
  );

  const handleShare = useCallback(
    (c: Conversation) => {
      if (onShare) {
        onShare(c.id);
        return;
      }
      // Sensible client-only default: copy a reference to the clipboard.
      const text = `${getTitle(c)} — ${typeof window !== "undefined" ? window.location.href : ""}`;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    },
    [onShare, getTitle]
  );

  const renderCard = (c: Conversation) => (
    <ConversationCard
      key={c.id}
      conversation={c}
      displayTitle={getTitle(c)}
      isSelected={selectedId === c.id}
      isPinned={pinnedIds.has(c.id)}
      isFavorite={favoriteIds.has(c.id)}
      isMenuOpen={openMenuId === c.id}
      isRenaming={renamingId === c.id}
      onSelect={() => {
        onSelect(c.id);
        setMobileOpen(false);
      }}
      onDelete={() => handleDelete(c.id)}
      onTogglePin={() => {
        setPinnedIds((prev) => {
          const next = new Set(prev);
          const nowPinned = !next.has(c.id);
          nowPinned ? next.add(c.id) : next.delete(c.id);
          onPin?.(c.id, nowPinned);
          return next;
        });
      }}
      onToggleFavorite={() => {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          const nowFav = !next.has(c.id);
          nowFav ? next.add(c.id) : next.delete(c.id);
          onFavorite?.(c.id, nowFav);
          return next;
        });
      }}
      onDuplicate={() => onDuplicate?.(c.id)}
      onShare={() => handleShare(c)}
      onExport={() => handleExport(c)}
      onStartRename={() => setRenamingId(c.id)}
      onCommitRename={(value) => {
        setTitleOverrides((prev) => ({ ...prev, [c.id]: value }));
        onRename?.(c.id, value);
        setRenamingId(null);
      }}
      onCancelRename={() => setRenamingId(null)}
      onToggleMenu={() => setOpenMenuId((prev) => (prev === c.id ? null : c.id))}
      onCloseMenu={() => setOpenMenuId(null)}
    />
  );

  const totalCount = conversations.length;
  const showEmpty = !isLoading && filtered.length === 0;

  const sidebarContent = (
    <div className="flex h-full w-72 flex-col overflow-hidden border-r border-white/5 bg-[#0F1115]/95 text-zinc-100 backdrop-blur-2xl">
      {/* ---------------- Header ---------------- */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/10 px-4 pb-4 pt-5">
        <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-white">
              Conversation History
            </h2>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400">
              <span>
                {totalCount} {totalCount === 1 ? "conversation" : "conversations"}
              </span>
              <span className="h-0.5 w-0.5 rounded-full bg-zinc-600" />
              <span className="flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${statusMeta[aiStatus].color}`}
                  />
                  <span
                    className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusMeta[aiStatus].color}`}
                  />
                </span>
                {statusMeta[aiStatus].label}
              </span>
            </div>
          </div>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New chat */}
        <motion.button
          onClick={onNewChat}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-lg shadow-violet-900/30 outline-none transition-shadow duration-200 hover:shadow-violet-500/40 focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New Chat
        </motion.button>
      </div>

      {/* ---------------- Search ---------------- */}
      <div className="border-b border-white/5 px-3 py-3">
        <div className="group relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 transition-colors focus-within:border-violet-400/50 focus-within:bg-white/[0.06]">
          <motion.span
            animate={query ? { rotate: [0, -12, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500 group-focus-within:text-violet-300" />
          </motion.span>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="ml-2 w-full bg-transparent text-[13px] text-zinc-100 placeholder:text-zinc-500 outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="rounded-md p-0.5 text-zinc-500 hover:bg-white/10 hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:flex">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* ---------------- List ---------------- */}
      <div
        role="listbox"
        aria-label="Conversations"
        className="relative flex-1 space-y-4 overflow-y-auto px-2 pb-4 pt-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]"
      >
        {isLoading ? (
          <div className="space-y-2 px-1 pt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} delay={i * 60} />
            ))}
          </div>
        ) : showEmpty ? (
          <EmptyState isSearch={query.trim().length > 0} />
        ) : (
          <>
            {pinned.length > 0 && (
              <div>
                <SectionLabel>
                  <span className="flex items-center gap-1">
                    <Pin className="h-2.5 w-2.5 rotate-45" /> Pinned
                  </span>
                </SectionLabel>
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-1.5 px-1"
                >
                  <AnimatePresence mode="popLayout">
                    {pinned.map(renderCard)}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {groups.map((group) => (
              <div key={group.label}>
                <SectionLabel>{group.label}</SectionLabel>
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-1.5 px-1"
                >
                  <AnimatePresence mode="popLayout">
                    {group.items.map(renderCard)}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open conversation history"
        className="fixed left-3 top-3 z-40 rounded-xl border border-white/10 bg-[#0F1115]/90 p-2.5 text-zinc-200 shadow-lg backdrop-blur-xl md:hidden"
      >
        <MenuIcon className="h-4 w-4" />
      </button>

      {/* Desktop, always visible */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Conversation history"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}