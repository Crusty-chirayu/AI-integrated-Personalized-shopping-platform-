import { searchProducts } from "../product-search";
import { IntentResult } from "../intent";

export async function searchProductsTool(
  intent: IntentResult
) {
  return await searchProducts(intent);
}