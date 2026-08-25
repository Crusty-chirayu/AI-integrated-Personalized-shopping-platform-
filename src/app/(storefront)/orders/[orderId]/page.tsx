"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatCurrency";

export default function OrderDetailsPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const handleCancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("orders")
      .update({
        fulfillment_status: "cancelled",
      })
      .eq("id", order.id);

    if (error) {
      alert("Failed to cancel order.");
      console.error(error);
      return;
    }

    setOrder((prev: any) => ({
      ...prev,
      fulfillment_status: "cancelled",
    }));

    alert("Order cancelled successfully.");
  };

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("CartIQ", 14, 20);

    doc.setFontSize(12);
    doc.text("Invoice", 14, 30);

    doc.text(`Order Number: ${order.order_number}`, 14, 40);
    doc.text(
      `Payment Status: ${order.payment_status.toUpperCase()}`,
      14,
      48
    );

    doc.text("Shipping Address:", 14, 62);

    const address = order.shipping_address;

    doc.setFontSize(11);

    doc.text(address.full_name || "", 14, 70);
    doc.text(address.address_line1 || "", 14, 77);
    doc.text(
      `${address.city || ""}, ${address.state || ""}`,
      14,
      84
    );
    doc.text(address.zip || "", 14, 91);
    doc.text(address.country || "", 14, 98);

let y = 108;

doc.setFontSize(12);
doc.text("Products:", 14, y);

y += 10;

items.forEach((item, index) => {
  doc.text(
    `${index + 1}. ${item.products?.title || item.title || "Product"}`,
    14,
    y
  );

  y += 8;

  doc.text(`Quantity : ${item.quantity}`, 20, y);

  y += 8;

  doc.text(
    `Unit Price : Rs. ${Number(item.unit_price).toFixed(2)}`,
    20,
    y
  );

  y += 8;

  doc.text(
    `Total : Rs. ${Number(item.line_total).toFixed(2)}`,
    20,
    y
  );

  y += 12;
});

let finalY = y + 5;


    doc.text(
  `Subtotal: Rs. ${Number(order.subtotal).toFixed(2)}`,
  14,
  finalY
);
doc.text(
  `Tax: Rs. ${Number(order.tax_amount).toFixed(2)}`,
  14,
  finalY + 8
);
doc.text(
  `Shipping: Rs. ${Number(order.shipping_cost).toFixed(2)}`,
  14,
  finalY + 16
);

    doc.setFontSize(14);
doc.text(
  `Grand Total: Rs. ${Number(order.total).toFixed(2)}`,
  14,
  finalY + 30
);

    doc.setFontSize(10);
    doc.text(
      "Thank you for shopping with CartIQ!",
      14,
      finalY + 45
    );

    doc.save(`Invoice-${order.order_number}.pdf`);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderId)
        .eq("user_id", user.id)
        .single();

      if (orderError) {
        console.error(orderError);
        setLoading(false);
        return;
      }

      setOrder(orderData);

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select(
          `
          *,
          products(
            id,
            title,
            slug
          )
        `
        )
        .eq("order_id", orderData.id);

      if (itemError) {
        console.error(itemError);
      } else {
        console.log("ORDER ITEMS:", itemData);
        setItems(itemData ?? []);
      }

      if (itemData?.length) {
        const productIds = itemData.map((item) => item.product_id);

        const { data: images } = await supabase
          .from("product_images")
          .select("product_id, image_url, sort_order")
          .in("product_id", productIds)
          .order("sort_order", { ascending: true });

        const imageMap: Record<string, string> = {};

        images?.forEach((img) => {
          if (!imageMap[img.product_id]) {
            imageMap[img.product_id] = img.image_url;
          }
        });

        console.log("IMAGE MAP:", imageMap);

        setProductImages(imageMap);
      }

      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-lg">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-3xl font-bold">
          Order not found or you are not authorized to view it.
        </h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      {/* Header */}

      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Order Details
        </p>

        <h1 className="mt-2 text-4xl font-bold">{order.order_number}</h1>

        <div className="mt-4 flex flex-wrap gap-3">
          <span
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              order.fulfillment_status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.fulfillment_status}
          </span>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 capitalize">
            {order.payment_status}
          </span>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        {order.payment_status === "pending" &&
          order.fulfillment_status === "pending" && (
            <button
              onClick={handleCancelOrder}
              className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
            >
              Cancel Order
            </button>
          )}

        <button
          onClick={handleDownloadInvoice}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700"
        >
          Download Invoice
        </button>
      </div>

      {/* Products */}

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Products</h2>

        <div className="mt-6 space-y-5">
          {items.map((item) => {
            const image = productImages[item.product_id] || "/placeholder.png";
            const slug = item.products?.slug;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-6 border-b pb-5 last:border-0"
              >
                <div className="flex items-center gap-5">
                  <Image
                    src={image}
                    alt={item.products?.title || item.title}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-xl border border-zinc-200 object-cover"
                  />

                  <div>
                    {slug ? (
                      <Link
                        href={`/products/${slug}`}
                        className="text-lg font-semibold text-zinc-900 hover:text-indigo-600 hover:underline"
                      >
                        {item.products?.title || item.title}
                      </Link>
                    ) : (
                      <h3 className="text-lg font-semibold">
                        {item.products?.title || item.title}
                      </h3>
                    )}

                    <p className="mt-2 text-zinc-500">
                      Quantity: {item.quantity}
                    </p>

                    <p className="text-zinc-500">
                      Unit Price: {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {formatCurrency(item.line_total)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Address */}

      <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Shipping Address</h2>

        <div className="mt-5 space-y-2 text-zinc-700">
          <p className="font-semibold">
            {order.shipping_address?.full_name}
          </p>

          <p>{order.shipping_address?.address_line1}</p>

          <p>
            {order.shipping_address?.city}, {order.shipping_address?.state}
          </p>

          <p>{order.shipping_address?.zip}</p>

          <p>{order.shipping_address?.country}</p>
        </div>
      </div>

      {/* Payment Information */}

      <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Payment Information</h2>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between">
            <span>Payment Status</span>
            <span className="font-semibold capitalize">
              {order.payment_status}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Razorpay Order ID</span>
            <span className="font-mono text-sm">
              {order.razorpay_order_id}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Razorpay Payment ID</span>
            <span className="font-mono text-sm">
              {order.razorpay_payment_id ?? "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Order Summary */}

      <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Order Summary</h2>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(order.tax_amount)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(order.shipping_cost)}</span>
          </div>

          <hr />

          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>

            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}