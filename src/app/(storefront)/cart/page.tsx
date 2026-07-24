"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-teal-50">
          <ShoppingCart className="h-11 w-11 text-indigo-400" />
        </div>

        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.02em] text-zinc-950">
          Your Cart is Empty
        </h1>

        <p className="mt-4 max-w-md text-base leading-7 text-zinc-600">
          Looks like you haven&apos;t added anything yet.
        </p>

        <Link
          href="/products"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-7 py-3.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)] hover:brightness-105"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 50% at 10% 0%, rgba(79,70,229,0.08), transparent 60%), radial-gradient(45% 45% at 90% 10%, rgba(20,184,166,0.08), transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-indigo-700 shadow-sm">
            🛒 Shopping Cart
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.02em] text-zinc-950">
            Review your selections.
          </h1>

          <p className="mt-3 max-w-lg text-base leading-7 text-zinc-600">
            Review your selected products before checkout.
          </p>

          <p className="mt-3 text-sm font-medium text-zinc-500">
            {items.length} item{items.length === 1 ? "" : "s"} in cart
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Cart items */}
          <div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Continue Shopping
            </Link>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="h-28 w-28 shrink-0 rounded-[18px] object-cover"
                  />

                  <div className="flex-1">
                    {item.product.category && (
                      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                        {item.product.category}
                      </p>
                    )}
                    <p className="mt-1 text-lg font-semibold text-zinc-900">
                      {item.product.title}
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-700">
                      {formatCurrency(item.product.salePrice ?? item.product.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-3">
                    <div className="flex items-center gap-1 rounded-full border border-black/10 bg-zinc-50 p-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="rounded-full p-2 text-zinc-700 transition hover:bg-white hover:shadow-sm"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="rounded-full p-2 text-zinc-700 transition hover:bg-white hover:shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="rounded-full p-2.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* AI suggestions — UI only, no recommendation data available here */}
            <div className="mt-14 rounded-[28px] border border-black/5 bg-gradient-to-br from-indigo-50 to-teal-50 p-8">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">CartIQ Suggests</p>
                  <p className="text-xs text-zinc-500">Customers also bought</p>
                </div>
              </div>

              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:gap-2.5"
              >
                Browse more products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                Order summary
              </p>

              <div className="mt-6 space-y-3.5 text-sm text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-zinc-900">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-medium text-zinc-900">{formatCurrency(12)}</span>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-4 text-base font-semibold text-zinc-950">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal + 12)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-6 py-4 text-sm font-medium text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition hover:shadow-[0_6px_28px_rgba(79,70,229,0.5)] hover:brightness-105"
              >
                Proceed to checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust section */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white p-4">
                <Lock className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-medium text-zinc-700">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white p-4">
                <Truck className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-medium text-zinc-700">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white p-4">
                <RotateCcw className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-medium text-zinc-700">Easy Returns</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white p-4">
                <Star className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-medium text-zinc-700">Verified Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}