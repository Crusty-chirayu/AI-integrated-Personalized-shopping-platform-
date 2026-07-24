"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useWishlist } from "@/contexts/wishlist-context";

type Props = {
  product: any;
  compact?: boolean;
};

export function AddToWishlist({
  product,
  compact = false,
}: Props) {
  const { toggleItem, isWishlisted } = useWishlist();

  const active = isWishlisted(product.id);

  const handleClick = () => {
    toggleItem(product);

    if (active) {
      toast.success("Removed from wishlist");
    } else {
      toast.success("Added to wishlist ❤️");
    }
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.03 }}
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
        active
          ? "border-red-500 bg-red-500 text-white"
          : "hover:bg-zinc-100"
      } ${compact ? "w-full" : ""}`}
    >
      <Heart
        className={`h-4 w-4 ${
          active ? "fill-current" : ""
        }`}
      />

      {active ? "Saved" : "Wishlist"}
    </motion.button>
  );
}