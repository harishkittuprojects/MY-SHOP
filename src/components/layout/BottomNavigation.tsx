"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  // Don't show bottom nav inside admin panel
  if (pathname?.startsWith("/admin")) return null;

  const isHome = pathname === "/";
  const isCategories = pathname?.startsWith("/categories");
  const isCart = pathname === "/cart";
  const isProfile = pathname === "/account" || pathname === "/login";

  const phoneNumber = "+917416750834";
  const message = "Hello! I'm interested in ordering smartphones & gadgets.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {/* 1. Floating WhatsApp Button (Positioned cleanly ABOVE the bottom bar) */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-16 sm:bottom-18 right-3.5 sm:right-4 z-50 w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#20ba5a] active:scale-90 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(37,211,102,0.45)] transition-all md:bottom-6 md:right-6 select-none cursor-pointer"
        aria-label="Order on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="text-2xl sm:text-3xl" />
      </a>

      {/* 2. Sleek Android-Style Full-Width Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] h-14 sm:h-15 flex items-center justify-around px-2 select-none md:hidden safe-area-bottom w-full"
      >
        {/* Home */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90"
        >
          <div className={`w-7 h-7 flex items-center justify-center mb-0.5 ${isHome ? "text-secondary" : "text-slate-400"}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isHome ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isHome ? "1.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.5z"/>
              <path d="M9 22v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
            </svg>
          </div>
          <span className={`text-[10px] sm:text-[11px] font-bold leading-none ${isHome ? "text-secondary font-black" : "text-slate-500"}`}>
            Home
          </span>
        </Link>

        {/* Categories */}
        <Link
          href="/categories"
          className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90"
        >
          <div className={`w-7 h-7 flex items-center justify-center mb-0.5 ${isCategories ? "text-secondary" : "text-slate-400"}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isCategories ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isCategories ? "1.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          </div>
          <span className={`text-[10px] sm:text-[11px] font-bold leading-none ${isCategories ? "text-secondary font-black" : "text-slate-500"}`}>
            Categories
          </span>
        </Link>

        {/* Cart Tab with Live Counter */}
        <Link
          href="/cart"
          className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 relative"
        >
          <div className={`w-7 h-7 flex items-center justify-center mb-0.5 relative ${isCart ? "text-secondary" : "text-slate-400"}`}>
            <FontAwesomeIcon icon={faShoppingCart} className="text-base" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] sm:text-[11px] font-bold leading-none ${isCart ? "text-secondary font-black" : "text-slate-500"}`}>
            Cart
          </span>
        </Link>

        {/* Profile */}
        <Link
          href="/account"
          className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90"
        >
          <div className={`w-7 h-7 flex items-center justify-center mb-0.5 ${isProfile ? "text-secondary" : "text-slate-400"}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isProfile ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isProfile ? "1.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span className={`text-[10px] sm:text-[11px] font-bold leading-none ${isProfile ? "text-secondary font-black" : "text-slate-500"}`}>
            Profile
          </span>
        </Link>
      </nav>
    </>
  );
}
