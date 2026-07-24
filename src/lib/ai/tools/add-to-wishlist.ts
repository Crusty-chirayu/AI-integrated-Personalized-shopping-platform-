import { ToolContext, ToolResult } from "./types";

export async function addToWishlistTool(

context: ToolContext,

product:any

):Promise<ToolResult>{

return{

success:true,

message:`${product.title} added to wishlist.`

};

}