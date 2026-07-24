import { detectIntent } from "./intent";
import { searchProducts } from "./product-search";
import { buildProductContext } from "./context-builder";

export async function routeUserMessage(message: string) {
  const intent = detectIntent(message);

  switch (intent.type) {

    case "product_search": {

      const products = await searchProducts(intent);

      return {
        type: "product_search",
        intent,
        products,
        context: buildProductContext(products),
      };

    }

    case "comparison": {

      return {
        type: "comparison",
        intent,
      };

    }

    case "recommendation": {

      const products = await searchProducts(intent);

      return {
        type: "recommendation",
        intent,
        products,
        context: buildProductContext(products),
      };

    }

    case "customer_support":

      return {
        type: "customer_support",
        intent,
      };

    case "shopping_advice":

      return {
        type: "shopping_advice",
        intent,
      };

    default:

      return {
        type: "general_chat",
        intent,
      };
  }
}