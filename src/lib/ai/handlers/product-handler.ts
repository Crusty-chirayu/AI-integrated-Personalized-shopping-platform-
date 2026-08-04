import { buildShoppingPrompt } from "../prompt-builder";
import { openrouter } from "../ai-service";
import { buildRecommendations } from "../recommendation-engine";
import { handleGeneralChat } from "./chat-handler";
import { IntentResult } from "../intent";

export async function handleProductSearch(
  message: string,
  route: {
    intent: IntentResult;
    products: any[];
    context?: string;
  }
) {
  if (!route.products || route.products.length === 0) {
    const fallback = await handleGeneralChat(
      `I couldn't find matching products in CartIQ for your request. ${message}`
    );

    return {
      type: "text",
      message: `I couldn't find matching products in CartIQ. ${fallback.message}`,
    };
  }

  const prompt = buildShoppingPrompt(message, route.context ?? "");

  const completion = await openrouter.chat.completions.create({
    model: "deepseek/deepseek-chat-v3",
    messages: [
      {
        role: "system",
        content: `You are CartIQ AI Shopping Assistant.
You help customers discover products from the CartIQ catalog.
Explain why the recommended products are a good fit.
If the user asked for multiple options, compare the best choices naturally.
Use the provided product details and do not invent inventory.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    completion.choices[0]?.message?.content ??
    "Here are the products I found for you.";

  const products = buildRecommendations(route.products);

  return {
    type: "products",
    products,
    message: responseText,
  };
}