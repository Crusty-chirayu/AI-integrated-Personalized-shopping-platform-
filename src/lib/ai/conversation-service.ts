import { supabase } from "@/lib/supabase";

export async function createConversation(
  userId: string
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      user_id: userId,
      title: "New Chat",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  type: string = "text",
  metadata: any = {}
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("ai_messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
      type,
      metadata,
    });

  if (error) throw error;
}

export async function getMessages(
  conversationId: string
) 

{
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", {
      ascending: true,
    });

  if (error) throw error;

  

  return data ?? [];
}

export async function getConversations(
  userId: string
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", {
      ascending: false,
    });

  if (error) throw error;

  return data ?? [];
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  console.log(
  "Updating title:",
  conversationId,
  title
);

  const { error } = await supabase
    .from("ai_conversations")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) throw error;
}
export async function getLatestConversation(
  userId: string
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}
export async function deleteConversation(
  conversationId: string
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  // Delete messages first
  const { error: messageError } = await supabase
    .from("ai_messages")
    .delete()
    .eq("conversation_id", conversationId);

  if (messageError) throw messageError;

  // Delete conversation
  const { error: conversationError } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", conversationId);

  if (conversationError) throw conversationError;
}