"use client";

import { useEffect, useState, useTransition } from "react";
import { updateFulfillmentStatus } from "./actions";
import {
  FULFILLMENT_STATUSES,
  type FulfillmentStatus,
} from "./fulfillment-status";

type OrderFulfillmentCellProps = {
  orderId: string;
  initialStatus: FulfillmentStatus | string | null;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

function normalizeStatus(status: string | null): FulfillmentStatus {
  const value = (status ?? "pending").toLowerCase();
  return (FULFILLMENT_STATUSES as readonly string[]).includes(value)
    ? (value as FulfillmentStatus)
    : "pending";
}

export default function OrderFulfillmentCell({
  orderId,
  initialStatus,
}: OrderFulfillmentCellProps) {
  const [selectedStatus, setSelectedStatus] = useState<FulfillmentStatus>(
    normalizeStatus(initialStatus)
  );
  const [savedStatus, setSavedStatus] = useState<FulfillmentStatus>(
    normalizeStatus(initialStatus)
  );
  const [toast, setToast] = useState<ToastState>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const hasChanges = selectedStatus !== savedStatus;

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateFulfillmentStatus(orderId, selectedStatus);

      if (result.success) {
        setSavedStatus(selectedStatus);
        setToast({ type: "success", message: "Fulfillment status updated." });
      } else {
        setToast({ type: "error", message: result.error });
      }
    });
  };

  return (
    <>
      <td className="px-4 py-3">
        <select
          value={selectedStatus}
          onChange={(event) =>
            setSelectedStatus(event.target.value as FulfillmentStatus)
          }
          disabled={isPending}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm capitalize text-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
{FULFILLMENT_STATUSES.map((status) => (
  <option key={status} value={status} className="capitalize">
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </option>
))}
        </select>
      </td>
      <td className="relative px-4 py-3">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={isPending || !hasChanges}
          className="rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Updating..." : "Update"}
        </button>

        {toast && (
          <div
            className={`fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}
      </td>
    </>
  );
}