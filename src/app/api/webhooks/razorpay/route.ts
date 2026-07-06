import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 400 });
  }

  const expectedSignature = createHmac("sha256", secret).update(body).digest("hex");
  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const event = payload.event;
  const payment = payload.payload?.payment?.entity;
  if (!payment) {
    return NextResponse.json({ error: "Webhook payload missing payment entity" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin client is not configured." }, { status: 500 });
  }

  const razorpayOrderId = payment.order_id;
  const paymentStatus = payment.status === "captured" ? "paid" : payment.status;

  const { error } = await admin
    .from("orders")
    .update({
      payment_status: paymentStatus,
      razorpay_payment_id: payment.id,
    })
    .eq("razorpay_order_id", razorpayOrderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, event });
}
