import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = await request.json();
  const { items, email, shipping_address, billing_address, user_id, currency = "INR", receipt } = body;

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_PUBLISHABLE_KEY;
  const keySecret = process.env.RAZORPAY_SECRET_KEY;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay keys are not configured yet. Add them to .env.local first." },
      { status: 400 }
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart items are required to create an order." }, { status: 400 });
  }

  const orderItems = items.map((item: any) => ({
    product_id: item.product_id,
    title: item.title,
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.unit_price || 0),
    line_total: Number(item.unit_price || 0) * Number(item.quantity || 1),
  }));

  const subtotal = orderItems.reduce((sum, item) => sum + item.line_total, 0);
  const shippingCost = 0;
  const taxAmount = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shippingCost + taxAmount).toFixed(2));

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin client is not configured." }, { status: 500 });
  }

  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

  try {
    const { data: orderData, error: orderError } = await admin
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          user_id: user_id || null,
          email,
          shipping_address,
          billing_address,
          shipping_method: "Standard",
          shipping_cost: shippingCost,
          subtotal,
          discount_amount: 0,
          tax_amount: taxAmount,
          total,
          coupon_code: null,
          payment_status: "pending",
          fulfillment_status: "pending",
        },
      ])
      .select("id")
      .single();

    if (orderError || !orderData) {
      return NextResponse.json({ error: orderError?.message || "Failed to create order record." }, { status: 500 });
    }

    const orderId = orderData.id;
    const { error: itemsError } = await admin.from("order_items").insert(
      orderItems.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      }))
    );

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message || "Failed to create order items." }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency,
      receipt: receipt || orderNumber,
      notes: {
        order_id: orderId,
        customer_email: email,
      },
    });

    await admin
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", orderId);

    return NextResponse.json({ orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, internalOrderId: orderId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create order" }, { status: 500 });
  }
}
