import { addToCartTool } from "./tools/add-to-cart";
import { addToWishlistTool } from "./tools/add-to-wishlist";

export async function executeTool(

tool: string,

context: any,

product: any

) {

switch(tool){

case "add_to_cart":

return addToCartTool(
context,
product
);

case "wishlist":

return addToWishlistTool(
context,
product
);

default:

return null;

}

}