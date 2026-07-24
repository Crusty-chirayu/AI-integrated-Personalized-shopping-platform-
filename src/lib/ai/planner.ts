export type AgentPlan =
  | {
      tool: "addToCart";
    }
  | {
      tool: "none";
    };

export function createPlan(
  message: string
): AgentPlan {

  const lower = message.toLowerCase();

  if (
    lower.includes("add to cart") ||
    lower.includes("buy this") ||
    lower.includes("purchase this")
  ) {
    return {
      tool: "addToCart",
    };
  }

  return {
    tool: "none",
  };
}