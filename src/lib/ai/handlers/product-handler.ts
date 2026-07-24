import { buildShoppingPrompt } from "../prompt-builder";
import { getPreference } from "../memory-service";
import { openrouter } from "../ai-service";
import { buildRecommendations } from "../recommendation-engine";

export async function handleProductSearch(
  message: string,
  route: any
)
 {

  console.log("Products Found:", route.products);

console.log("Context:", route.context);

const prompt = buildShoppingPrompt(
  message,
  route.context ?? ""
);
  const completion =
    await openrouter.chat.completions.create({

      model: "deepseek/deepseek-chat-v3",

      messages: [
        {
          role: "system",
          content:
            "You are CartIQ AI Shopping Assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

    });



const products =
  route.products && route.products.length > 0
    ? buildRecommendations(route.products)
    : [];

return {
  type: "products",
  products,
  message: completion.choices[0].message.content,
};



}