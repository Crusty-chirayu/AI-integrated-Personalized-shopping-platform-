import { routeUserMessage } from "./router";
import { buildContextualQuery } from "./contextual-query";
import { createPlan } from "./planner";
import { resolveEntity } from "./entity-resolver";
import { getConversation, updateConversation } from "./session";

import { handleGeneralChat } from "./handlers/chat-handler";
import { handleProductSearch } from "./handlers/product-handler";
import { handleAddToCart } from "./handlers/cart-handler";

export async function processUserMessage(
  sessionId: string,
  message: string
) {

  const conversation = getConversation(sessionId);

let route = await routeUserMessage(message);

// Smart follow-up search
if (
  route.type === "general_chat" &&
  conversation.lastTopic
) {



const contextualQuery =
  buildContextualQuery(
    message,
    conversation
  );

if (
  contextualQuery !== message
) {

  route =
    await routeUserMessage(
      contextualQuery
    );

}
  


}


  const selectedProduct = resolveEntity(
    message,
    conversation
  );
  if (
  selectedProduct &&
  !Array.isArray(selectedProduct)
) {

  updateConversation(sessionId, {
    lastSelectedProduct:
      selectedProduct,
  });

}

  const plan = createPlan(message);

  // -----------------------------
  // Product comparison
  // -----------------------------
  if (
    Array.isArray(selectedProduct) &&
    selectedProduct.length >= 2
  ) {
    return {
      type: "comparison",
      message: "Here's a comparison.",
      comparison: selectedProduct,
    };
  }

  // -----------------------------
  // Add to Cart
  // -----------------------------
  if (
    plan.tool === "addToCart" &&
    selectedProduct &&
    !Array.isArray(selectedProduct)
  ) {
    return handleAddToCart(
      sessionId,
      selectedProduct
    );
  }

  switch (route.type) {

    case "product_search":
    case "recommendation": {
      const productRoute = route as {
        type: "product_search" | "recommendation";
        intent: any;
        products: any[];
        context?: string;
      };

      updateConversation(sessionId, {
        lastProducts: productRoute.products,
        lastCategory: productRoute.intent?.category,
        lastBrand: productRoute.intent?.brand,
        lastBudget: productRoute.intent?.budget,
        lastIntent: productRoute.type,
        lastTopic:
          productRoute.intent?.category ??
          productRoute.intent?.brand,
      });

      return await handleProductSearch(
        message,
        productRoute
      );
    }

    case "general_chat":

      return await handleGeneralChat(
        message
      );

    default:

      return {
        type: route.type,
        message: "Feature coming soon.",
      };

  }
}