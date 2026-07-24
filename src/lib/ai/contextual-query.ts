import { ConversationState } from "./session";

const NEW_SEARCH_PATTERNS = [
  "i want",
  "i need",
  "show me",
  "find",
  "search",
  "buy",
  "looking for",
  "recommend",
  "suggest",
  "need",
];

const FOLLOW_UP_PATTERNS = [
  "cheaper",
  "another",
  "more",
  "blue",
  "black",
  "white",
  "red",
  "green",
  "128gb",
  "256gb",
  "512gb",
  "compare",
  "compare it",
  "first",
  "second",
  "third",
  "under",
  "below",
  "less than",
  "bigger",
  "smaller",
];

export function buildContextualQuery(
  message: string,
  conversation: ConversationState
) {
  const text = message.trim().toLowerCase();

  // No previous context
  if (!conversation.lastTopic) {
    return message;
  }

  // User is clearly starting a brand-new search
  if (
    NEW_SEARCH_PATTERNS.some(pattern =>
      text.startsWith(pattern)
    )
  ) {
    return message;
  }

  // User is continuing the previous search
  if (
    FOLLOW_UP_PATTERNS.some(pattern =>
      text.includes(pattern)
    )
  ) {
    return [
      conversation.lastBrand,
      conversation.lastTopic,
      message,
    ]
      .filter(Boolean)
      .join(" ");
  }

  // Very short follow-up like "yes", "ok", "that one"
  const words = text.split(/\s+/);

  if (words.length <= 3) {
    return [
      conversation.lastBrand,
      conversation.lastTopic,
      message,
    ]
      .filter(Boolean)
      .join(" ");
  }

  // Default: treat as a new query
  return message;
}