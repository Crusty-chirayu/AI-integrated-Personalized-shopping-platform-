export interface ConversationState {

  // Previous search results
  lastProducts?: any[];

  // Currently selected product
  lastSelectedProduct?: any;

  // Last comparison
  lastComparison?: any[];

  // Current shopping topic
  lastTopic?: string;

  // Filters
  lastCategory?: string;

  lastBrand?: string;

  lastBudget?: number;

  // Last detected intent
  lastIntent?: string;

} 

const sessions = new Map<string, ConversationState>();

export function getConversation(sessionId: string) {

  if (!sessions.has(sessionId)) {

    sessions.set(sessionId, {});

  }

  return sessions.get(sessionId)!;

}

export function updateConversation(

  sessionId: string,

  updates: Partial<ConversationState>

) {

  const current = getConversation(sessionId);

  sessions.set(sessionId, {

    ...current,

    ...updates,

  });

}