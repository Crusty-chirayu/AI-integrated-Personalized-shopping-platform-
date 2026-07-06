export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-28 text-center lg:px-10">
      <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900">
        Order confirmed
      </div>
      <h1 className="mt-8 text-4xl font-semibold text-zinc-950">Thank you for your purchase.</h1>
      <p className="mt-4 text-lg leading-8 text-zinc-600">
        Your order has been confirmed and payment has been received. We will notify you with tracking details once your order ships.
      </p>
    </div>
  );
}
