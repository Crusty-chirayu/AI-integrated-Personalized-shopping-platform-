"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm(
      "Delete this product permanently?"
    );

    if (!ok) return;

    const response = await fetch(
      `/api/admin/products/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      alert("Delete failed.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
      title="Delete Product"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}