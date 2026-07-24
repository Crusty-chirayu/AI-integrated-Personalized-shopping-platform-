import { openrouter } from "../ai-service";

export async function handleGeneralChat(
  message: string
) {
  const completion =
    await openrouter.chat.completions.create({
      model: "deepseek/deepseek-chat-v3",

      messages: [
        {
          role: "system",
          content: `
You are CartIQ AI, an intelligent shopping assistant for the CartIQ e-commerce platform.

Your responsibilities:
- Help users discover and compare products.
- Answer shopping-related questions clearly and accurately.
- Give concise, friendly, and professional responses.
- If CartIQ does NOT have a requested product, clearly state that it is currently unavailable in CartIQ's inventory.
- Never pretend that unavailable products exist in the store.
- Never recommend unrelated products just to fill space.
- If a product is unavailable, offer helpful advice or general information instead.
- If the user asks a general question unrelated to shopping, answer it normally.
- Keep responses natural, conversational, and helpful.
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

  return {
    type: "chat",
    message: completion.choices[0].message.content,
  };
}