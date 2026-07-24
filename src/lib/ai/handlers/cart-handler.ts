import { addToCartTool } from "../tools/add-to-cart";

export async function handleAddToCart(
  sessionId: string,
  product: any
) {

  const result =
    await addToCartTool(

      {
        sessionId,
      },

      product

    );

  return {

    type: "cart",

    message: result.message,

    product,

  };

}