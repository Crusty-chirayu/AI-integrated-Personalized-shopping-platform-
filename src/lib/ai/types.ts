export type AIResponseType =
  | "chat"
  | "product_search"
  | "comparison"
  | "recommendation"
  | "customer_support";

export interface AIResponse {

  type: AIResponseType;

  message: string;

  products?: any[];

  comparison?: any;

  recommendation?: string;

  actions?: {
    label: string;
    action: string;
    payload?: any;
  }[];

}