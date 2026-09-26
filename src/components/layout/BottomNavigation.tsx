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
  const isProducts = pathname?.startsWith("/products");
  const isCart = pathname === "/cart";
  const isProfile = pathname === "/account" || pathname === "/login";

  const phoneNumber = "+917416750834";
  const message = "Hello! I'm interested in ordering smartphones & gadgets.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 px-2 sm:px-4 flex flex-col items-center pointer-events-none md:hidden select-none safe-area-bottom">
      {/* Floating Bottom Nav Container */}
      <div className="flex items-center gap-2 w-full max-w-[420px] pointer-events-auto">
        {/* Main White Navigation Capsule */}
        <nav 
          aria-label="Mobile Navigation"
          className="flex-1 bg-white rounded-full px-2 sm:px-4 py-2 flex items-center justify-around shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-gray-200/90 min-h-[58px]"
        >
          {/* Home */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all active:scale-90"
          >
            {isHome ? (
              <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center text-secondary mb-0.5">
                <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.5z"/>
                  <path d="M9 22v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
                </svg>
              </div>
            ) : (
              <div className="w-9 h-9 flex items-center justify-center text-[#64748b] mb-0.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.5z"/>
                  <path d="M9 22v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
                </svg>
              </div>
            )}
            <span className={`text-[11px] font-bold leading-none ${isHome ? "text-secondary font-black" : "text-[#64748b]"}`}>
              Home
            </span>
            {isHome && (
              <span className="w-3.5 h-[2.5px] bg-secondary rounded-full mt-1"></span>
            )}
          </Link>

          {/* Products */}
          <Link
            href="/products"
            className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all active:scale-90"
          >
            {isProducts ? (
              <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center text-secondary mb-0.5">
                <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </div>
            ) : (
              <div className="w-9 h-9 flex items-center justify-center text-[#64748b] mb-0.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </div>
            )}
            <span className={`text-[11px] font-bold leading-none ${isProducts ? "text-secondary font-black" : "text-[#64748b]"}`}>
              Products
            </span>
            {isProducts && (
              <span className="w-3.5 h-[2.5px] bg-secondary rounded-full mt-1"></span>
            )}
          </Link>

          {/* Cart Tab with Live Counter */}
          <Link
            href="/cart"
            className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all active:scale-90 relative"
          >
            {isCart ? (
              <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center text-secondary mb-0.5 relative">
                <FontAwesomeIcon icon={faShoppingCart} className="text-base text-secondary" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-9 h-9 flex items-center justify-center text-[#64748b] mb-0.5 relative">
                <FontAwesomeIcon icon={faShoppingCart} className="text-base" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
            )}
            <span className={`text-[11px] font-bold leading-none ${isCart ? "text-secondary font-black" : "text-[#64748b]"}`}>
              Cart
            </span>
            {isCart && (
              <span className="w-3.5 h-[2.5px] bg-secondary rounded-full mt-1"></span>
            )}
          </Link>

          {/* Profile */}
          <Link
            href="/account"
            className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all active:scale-90"
          >
            {isProfile ? (
              <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center text-secondary mb-0.5">
                <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            ) : (
              <div className="w-9 h-9 flex items-center justify-center text-[#64748b] mb-0.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
            <span className={`text-[11px] font-bold leading-none ${isProfile ? "text-secondary font-black" : "text-[#64748b]"}`}>
              Profile
            </span>
            {isProfile && (
              <span className="w-3.5 h-[2.5px] bg-secondary rounded-full mt-1"></span>
            )}
          </Link>
        </nav>

        {/* Only WhatsApp Circular Icon Button */}
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-[52px] h-[52px] sm:w-[54px] sm:h-[54px] rounded-full bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.45)] flex-shrink-0 transition-transform"
          aria-label="Order on WhatsApp"
        >
          <FontAwesomeIcon icon={faWhatsapp} className="text-2xl sm:text-3xl" />
        </a>
      </div>
    </div>
  );
}
