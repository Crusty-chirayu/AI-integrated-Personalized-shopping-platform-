import { ConversationState } from "./session";

export function resolveEntity(
  message: string,
  conversation: ConversationState
) {

  const text = message.toLowerCase();

  const products =
    conversation.lastProducts ?? [];

  if (!products.length) {

    return conversation.lastSelectedProduct ?? null;

  }

  const selected: any[] = [];

  // First / Second / Third

  if (text.includes("first") && products[0]) {
    selected.push(products[0]);
  }

  if (text.includes("second") && products[1]) {
    selected.push(products[1]);
  }

  if (text.includes("third") && products[2]) {
    selected.push(products[2]);
  }

  // Last product

  if (
    text.includes("this") ||
    text.includes("it") ||
    text.includes("this one") ||
    text.includes("that") ||
    text.includes("that one")
  ) {

    if (conversation.lastSelectedProduct) {
      return conversation.lastSelectedProduct;
    }

    if (products[0]) {
      return products[0];
    }

  }

  // Cheaper

  if (
    text.includes("cheaper") ||
    text.includes("cheap")
  ) {

    const sorted =
      [...products].sort(
        (a, b) =>
          (a.sale_price ?? a.price) -
          (b.sale_price ?? b.price)
      );

    return sorted[0] ?? null;

  }

  // Expensive

  if (
    text.includes("expensive") ||
    text.includes("premium")
  ) {

    const sorted =
      [...products].sort(
        (a, b) =>
          (b.sale_price ?? b.price) -
          (a.sale_price ?? a.price)
      );

    return sorted[0] ?? null;

  }

  // Match product title

  for (const product of products) {

    if (
      product.title &&
      text.includes(
        product.title.toLowerCase()
      )
    ) {

      return product;

    }

  }

  // Match model number
  // Example:
  // "15"
  // "16"
  // "S24"

  for (const product of products) {

    const numbers =
      product.title.match(/\d+[a-zA-Z]*/g);

    if (!numbers) continue;

    for (const number of numbers) {

      if (
        text === number.toLowerCase() ||
        text.includes(
          number.toLowerCase()
        )
      ) {

        return product;

      }

    }

  }

  if (selected.length === 1) {
    return selected[0];
  }

  if (selected.length > 1) {
    return selected;
  }

  return conversation.lastSelectedProduct ?? null;

}