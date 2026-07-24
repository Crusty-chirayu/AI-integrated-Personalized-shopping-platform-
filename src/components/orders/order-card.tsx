
import Link from "next/link";type OrderCardProps = {
  orderId: string;
  date: string;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
};
import { formatCurrency } from "@/lib/formatCurrency";

export default function OrderCard({
  orderId,
  date,
  total,
  status,
}: OrderCardProps) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            Order ID
          </p>

          <h3 className="text-lg font-semibold">
            #{orderId}
          </h3>
        </div>

<span
  className={`rounded-full px-4 py-2 text-sm font-medium ${
    status === "Delivered"
      ? "bg-green-100 text-green-700"
      : status === "Processing"
      ? "bg-blue-100 text-blue-700"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : status === "Cancelled"
      ? "bg-red-100 text-red-700"
      : "bg-zinc-100 text-zinc-700"
  }`}
>
  {status}
</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-zinc-500">
            Order Date
          </p>

          <p className="font-medium">
            {date}
          </p>
        </div>

        <div>
          <p className="text-sm text-zinc-500">
            Total Amount
          </p>

          <p className="font-medium">
            {formatCurrency(total)}
          </p>
        </div>
      </div>

<Link
  href={`/orders/${orderId}`}
  className="mt-6 inline-block rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800"
>
  View Details
</Link>
    </div>
  );
}