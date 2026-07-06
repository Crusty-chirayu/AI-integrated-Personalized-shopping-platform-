"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Shopping bag</p>
          <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Your selections</h1>
          <div className="mt-8 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-[24px] border border-black/5 bg-white p-8 text-center shadow-sm">
                <p className="text-lg font-semibold text-zinc-900">Your cart is empty.</p>
                <p className="mt-2 text-sm text-zinc-600">Add a few refined pieces to get started.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4 rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
                  <img src={item.product.image} alt={item.product.title} className="h-24 w-24 rounded-[18px] object-cover" />
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-zinc-900">{item.product.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">Qty {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-black/10 bg-[#f7f3eb] p-1">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="rounded-full p-2 text-zinc-700"><Minus className="h-4 w-4" /></button>
                    <span className="min-w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="rounded-full p-2 text-zinc-700"><Plus className="h-4 w-4" /></button>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Order summary</p>
          <div className="mt-6 space-y-4 text-sm text-zinc-600">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
            <div className="flex justify-between"><span>Tax</span><span>$12</span></div>
            <div className="mt-4 flex justify-between border-t border-black/5 pt-4 text-lg font-semibold text-zinc-950"><span>Total</span><span>${subtotal + 12}</span></div>
          </div>
          <Link href="/checkout" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-medium text-white">
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
