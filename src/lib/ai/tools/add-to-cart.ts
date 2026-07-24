export async function addToCartTool(
  context: { sessionId: string },
  product: any
) {
  return {
    message: `"${product.title}" has been added to your cart.`,
  };
}