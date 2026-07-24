"use server";

import { getSupabaseAdmin } from "@/lib/supabase-server";
import { FULFILLMENT_STATUSES, type FulfillmentStatus } from "./fulfillment-status";

type UpdateFulfillmentResult =
  | { success: true }
  | { success: false; error: string };

export async function updateFulfillmentStatus(
  orderId: string,
  status: FulfillmentStatus
): Promise<UpdateFulfillmentResult> {
  const client = getSupabaseAdmin();

  if (!client) {
    return { success: false, error: "Supabase client is not configured." };
  }

  if (!FULFILLMENT_STATUSES.includes(status)) {
    return { success: false, error: "Invalid fulfillment status." };
  }

  const { error } = await client
    .from("orders")
    .update({ fulfillment_status: status })
    .eq("id", orderId);

  if (error) {
    console.error("updateFulfillmentStatus error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}