"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";

const loadRazorpay = () =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not available."));
      return;
    }

    if ((window as any).Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout library."));
    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const router = useRouter();
const { items, subtotal, clearCart } = useCart();
const { user } = useAuth(); 
 const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderTotal = useMemo(() => subtotal + 12, [subtotal]);

  const handleCheckout = async () => {
    setError(null);

    if (items.length === 0) {
      setError("Add items to your cart before placing an order.");
      return;
    }

    if (!email || !fullName || !addressLine1 || !city || !state || !zip || !country) {
      setError("Please fill in all shipping details.");
      return;
    }

    setIsLoading(true);

    try {
      await loadRazorpay();
console.log("Authenticated user:", user);
console.log("User ID being sent:", user?.id);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },


        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            title: item.product.title,
            quantity: item.quantity,
            unit_price: item.product.salePrice ?? item.product.price,
          })),
          email,
          shipping_address: {
            full_name: fullName,
            address_line1: addressLine1,
            city,
            state,
            zip,
            country,
          },
          billing_address: {
            full_name: fullName,
            address_line1: addressLine1,
            city,
            state,
            zip,
            country,
          },
          user_id: user?.id,
          currency: "INR",
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Unable to create checkout session.");
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_PUBLISHABLE_KEY;
      if (!razorpayKey) {
        throw new Error("Razorpay public key is not configured.");
      }

      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "CartIQ",
        description: "Order payment",
        prefill: {
          email,
          name: fullName,
        },
        handler: async (result: any) => {
          const confirmResponse = await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              internalOrderId: data.internalOrderId,
              razorpay_payment_id: result.razorpay_payment_id,
              razorpay_order_id: result.razorpay_order_id,
              razorpay_signature: result.razorpay_signature,
            }),
          });

          const confirmData = await confirmResponse.json();
          if (!confirmResponse.ok || confirmData.error) {
            setError(confirmData.error || "Payment succeeded, but order confirmation failed.");
            return;
          }

          clearCart();
          router.push("/checkout/success");
        },
      };

      new (window as any).Razorpay(options).open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Checkout</p>
          <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Secure payment</h1>
          <div className="mt-8 space-y-6">
            <div className="rounded-[24px] border border-black/5 bg-[#f7f3eb] p-6">
              <p className="text-sm font-semibold text-zinc-900">Shipping details</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" className="h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none" />
                <input value={addressLine1} onChange={(event) => setAddressLine1(event.target.value)} placeholder="Street address" className="col-span-2 h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none" />
                <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none" />
                <input value={state} onChange={(event) => setState(event.target.value)} placeholder="State" className="h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none" />
                <input value={zip} onChange={(event) => setZip(event.target.value)} placeholder="ZIP code" className="h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none" />
                <input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Country" className="h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none" />
              </div>
            </div>
            <div className="rounded-[24px] border border-black/5 bg-[#f7f3eb] p-6">
              <p className="text-sm font-semibold text-zinc-900">Payment</p>
              <p className="mt-3 text-sm leading-7 text-zinc-600">We securely process payments through Razorpay. Your card details are handled by Razorpay and never stored on our servers.</p>
            </div>
          </div>
        </div>
        <div className="rounded-[32px] border border-black/5 bg-[#f5f2ea] p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Order summary</p>
          <div className="mt-6 space-y-4 text-sm text-zinc-600">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between">
                <span>{item.product.title} × {item.quantity}</span>
                <span>${((item.product.salePrice ?? item.product.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-black/10 pt-4">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
            <div className="flex justify-between"><span>Tax</span><span>$12.00</span></div>
            <div className="mt-4 flex justify-between text-lg font-semibold text-zinc-950"><span>Total</span><span>${orderTotal.toFixed(2)}</span></div>
          </div>
          <button onClick={handleCheckout} disabled={isLoading} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-600">
            {isLoading ? "Processing order..." : "Place order"}
            <ArrowRight className="h-4 w-4" />
          </button>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          <div className="mt-6 flex items-center gap-2 text-sm text-zinc-600">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Secure checkout with SSL protection
          </div>
        </div>
      </div>
    </div>
  );
}
