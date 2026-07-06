import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { internalOrderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json();

  if (!internalOrderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment confirmation details." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin client is not configured." }, { status: 500 });
  }

  const { error } = await admin
    .from("orders")
    .update({
      payment_status: "paid",
      razorpay_payment_id,
      razorpay_order_id,
    })
    .eq("id", internalOrderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
