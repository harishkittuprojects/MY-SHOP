"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faSearch, faTimes, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Don't show bottom nav inside admin panel
  if (pathname?.startsWith("/admin")) return null;

  const isHome = pathname === "/";
  const isCategories = pathname === "/categories" || pathname?.startsWith("/products");
  const isProfile = pathname === "/account" || pathname === "/login";

  const phoneNumber = "+917416750834";
  const message = "Hello! I'm interested in ordering smartphones & gadgets.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 px-2 sm:px-4 flex flex-col items-center pointer-events-none md:hidden select-none safe-area-bottom">
      {/* Expandable Search Drawer */}
      {isSearchOpen && (
        <div className="w-full max-w-[440px] mb-2 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
          <form 
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 bg-[#0f1a30]/95 backdrop-blur-md rounded-2xl p-2.5 px-4 border border-white/15 shadow-2xl text-white"
          >
            <FontAwesomeIcon icon={faSearch} className="text-[#f2ba36] text-sm" />
            <input 
              type="text"
              autoFocus
              placeholder="Search smartphones, brands, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-white placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
            <button
              type="submit"
              className="w-7 h-7 rounded-xl bg-[#dfa735] text-[#0f172a] flex items-center justify-center active:scale-95"
            >
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bottom Nav Container matching the user design */}
      <div className="flex items-center gap-2 w-full max-w-[460px] pointer-events-auto">
        {/* Main Navy Navigation Capsule */}
        <nav 
          aria-label="Mobile Navigation"
          className="flex-1 bg-[#0f1a30] rounded-full px-2 sm:px-4 py-2 flex items-center justify-around shadow-[0_12px_36px_rgba(0,0,0,0.5)] border border-slate-800/80 min-h-[58px]"
        >
          {/* Home */}
          <Link
            href="/"
            onClick={() => setIsSearchOpen(false)}
            className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all active:scale-90"
          >
            {isHome ? (
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#f2ba36] mb-0.5">
                <svg className="w-5 h-5 text-[#f2ba36]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.5z"/>
                  <path d="M9 22v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
                </svg>
              </div>
            ) : (
              <div className="w-9 h-9 flex items-center justify-center text-[#94a3b8] mb-0.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.5z"/>
                  <path d="M9 22v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
                </svg>
              </div>
            )}
            <span className={`text-[11px] font-bold leading-none ${isHome ? "text-[#f2ba36]" : "text-[#94a3b8]"}`}>
              Home
            </span>
            {isHome && (
              <span className="w-3.5 h-[2.5px] bg-[#f2ba36] rounded-full mt-1"></span>
            )}
          </Link>

          {/* Categories */}
          <Link
            href="/products"
            onClick={() => setIsSearchOpen(false)}
            className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all active:scale-90"
          >
            {isCategories && !isSearchOpen ? (
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#f2ba36] mb-0.5">
                <svg className="w-5 h-5 text-[#f2ba36]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </div>
            ) : (
              <div className="w-9 h-9 flex items-center justify-center text-[#94a3b8] mb-0.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </div>
            )}
            <span className={`text-[11px] font-bold leading-none ${isCategories && !isSearchOpen ? "text-[#f2ba36]" : "text-[#94a3b8]"}`}>
              Categories
            </span>
            {isCategories && !isSearchOpen && (
              <span className="w-3.5 h-[2.5px] bg-[#f2ba36] rounded-full mt-1"></span>
            )}
          </Link>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all active:scale-90"
          >
            {isSearchOpen ? (
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#f2ba36] mb-0.5">
                <svg className="w-5 h-5 text-[#f2ba36]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <line x1="21" y1="21" x2="16.5" y2="16.5"/>
                </svg>
              </div>
            ) : (
              <div className="w-9 h-9 flex items-center justify-center text-[#94a3b8] mb-0.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <line x1="21" y1="21" x2="16.5" y2="16.5"/>
                </svg>
              </div>
            )}
            <span className={`text-[11px] font-bold leading-none ${isSearchOpen ? "text-[#f2ba36]" : "text-[#94a3b8]"}`}>
              Search
            </span>
            {isSearchOpen && (
              <span className="w-3.5 h-[2.5px] bg-[#f2ba36] rounded-full mt-1"></span>
            )}
          </button>

          {/* Profile */}
          <Link
            href="/account"
            onClick={() => setIsSearchOpen(false)}
            className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all active:scale-90"
          >
            {isProfile ? (
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#f2ba36] mb-0.5">
                <svg className="w-5 h-5 text-[#f2ba36]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            ) : (
              <div className="w-9 h-9 flex items-center justify-center text-[#94a3b8] mb-0.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
            <span className={`text-[11px] font-bold leading-none ${isProfile ? "text-[#f2ba36]" : "text-[#94a3b8]"}`}>
              Profile
            </span>
            {isProfile && (
              <span className="w-3.5 h-[2.5px] bg-[#f2ba36] rounded-full mt-1"></span>
            )}
          </Link>
        </nav>

        {/* Mustard Yellow WhatsApp Capsule */}
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#dfa735] hover:bg-[#d09825] active:scale-95 transition-all rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 shadow-[0_10px_25px_rgba(223,167,53,0.4)] flex-shrink-0 min-h-[58px]"
          aria-label="Order on WhatsApp"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <FontAwesomeIcon icon={faWhatsapp} className="text-base sm:text-lg" />
          </div>
          <span className="font-black text-[#0f172a] text-xs sm:text-sm tracking-tight pr-1">
            WhatsApp
          </span>
        </a>
      </div>
    </div>
  );
}
