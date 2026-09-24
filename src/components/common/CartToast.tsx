"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";

export default function CartToast() {
  const { cartToastItem, clearCartToast } = useCart();

  useEffect(() => {
    if (!cartToastItem) return;
    const timer = setTimeout(() => {
      clearCartToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [cartToastItem, clearCartToast]);

  return (
    <AnimatePresence>
      {cartToastItem && (
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -25, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-20 md:top-24 right-3 md:right-8 z-[100] w-[calc(100%-1.5rem)] max-w-sm sm:w-[380px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden"
        >
          <div className="p-3 sm:p-4 flex items-center gap-3 relative">
            {/* Product Image Thumbnail */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
              {cartToastItem.image ? (
                <Image
                  src={cartToastItem.image}
                  alt={cartToastItem.name || "Product"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  Madur
                </div>
              )}
            </div>

            {/* Information */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">
                  Success
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-black text-gray-900 truncate leading-tight">
                {cartToastItem.name}
              </h4>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Added to Cart
                </span>
                <Link
                  href="/cart"
                  onClick={clearCartToast}
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-[#2F6B3F] hover:text-[#255732] hover:underline uppercase tracking-wider"
                >
                  View Cart
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={clearCartToast}
              className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Animated Countdown Progress Bar */}
          <div className="w-full h-1 bg-gray-100 overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
              className="h-full bg-emerald-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
