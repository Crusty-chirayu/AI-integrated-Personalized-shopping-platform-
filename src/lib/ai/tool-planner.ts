import { openrouter } from "./ai-service";

export async function planTool(message: string) {

  const completion =
    await openrouter.chat.completions.create({

      model: "deepseek/deepseek-chat-v3",

      messages: [

        {
          role: "system",

          content: `

You are CartIQ Planner.

Never answer the user.

Return ONLY JSON.

Possible tools:

search_products

compare_products

add_to_cart

wishlist

general_chat

Example:

{
 "tool":"add_to_cart"
}

          `,

        },

        {
          role: "user",
          content: message,
        },

      ],

    });

  try {

    return JSON.parse(
      completion.choices[0].message.content ?? "{}"
    );

  } catch {

    return {

      tool: "general_chat",

    };

  }

}