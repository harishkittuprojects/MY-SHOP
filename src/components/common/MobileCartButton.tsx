"use client";

import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileCartButton() {
  const { cartCount, cartTotal } = useCart();
  const pathname = usePathname();
  const isCartPage = pathname === "/cart";

  if (cartCount === 0 || isCartPage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-6 z-[60] md:hidden"
      >
        <Link
          href="/cart"
          className="bg-[#2F6B3F] text-white flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl overflow-hidden group active:scale-95 transition-transform"
        >
          <div className="relative">
            <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
            <motion.span
              key={cartCount}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#2F6B3F]"
            >
              {cartCount}
            </motion.span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5 opacity-80">View Cart</span>
            <span className="text-sm font-black leading-none">₹{cartTotal}</span>
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
