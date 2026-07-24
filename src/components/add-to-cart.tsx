"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner"; 
import type { Product } from "@/lib/storefront-data";
import { motion, AnimatePresence } from "framer-motion";

interface AddToCartProps {
  product: Product;
  compact?: boolean;
}

export function AddToCart({
  product,
  compact = false,
}: AddToCartProps) {


const { addItem, removeItem, isInCart } = useCart();

const added = isInCart(product.id);

const handleClick = () => {
  if (added) {
    removeItem(product.id);

    toast.info(`${product.title} removed from cart`);
  } else {
    addItem(product);

    toast.success(`${product.title} added to cart`);
  }
};



  return (
<motion.button
  whileTap={{ scale: 0.94 }}
  whileHover={{ scale: 1.03 }}
  transition={{ type: "spring", stiffness: 400, damping: 20 }}
  onClick={handleClick}
  className={`flex w-full items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 ${
    added
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : "border border-zinc-300 bg-white text-zinc-900 hover:border-indigo-500 hover:text-indigo-600"
  } ${compact ? "px-4 py-2.5 text-sm" : "px-5 py-3"}`}
>
  <AnimatePresence mode="wait">
    {added ? (
      <motion.span
        key="added"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2"
      >
        ✓ In Cart
      </motion.span>
    ) : (
      <motion.span
        key="add"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2"
      >
        <ShoppingCart className="h-4 w-4" />
        Add
      </motion.span>
    )}
  </AnimatePresence>
</motion.button>
  );
}