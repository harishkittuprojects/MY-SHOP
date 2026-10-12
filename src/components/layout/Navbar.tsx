"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { 
  Heart, 
  Search, 
  X, 
  User, 
  ShoppingCart, 
  ArrowRight, 
  Wrench, 
  Layers, 
  Package, 
  History 
} from "lucide-react";
import StreamingTagline from "./StreamingTagline";
import { addRecentSearch, getRecentSearches, removeRecentSearch, clearRecentHistory } from "@/lib/recentHistory";
import { matchProductSearch, normalizeSearchTerm } from "@/lib/searchUtils";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [wishlistBump, setWishlistBump] = useState(false);
  const desktopSearchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const prevWishlistCount = useRef<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  // Wishlist update animation trigger
  useEffect(() => {
    if (prevWishlistCount.current !== null && prevWishlistCount.current !== wishlistCount) {
      setWishlistBump(true);
      const timer = setTimeout(() => setWishlistBump(false), 800);
      return () => clearTimeout(timer);
    }
    prevWishlistCount.current = wishlistCount;
  }, [wishlistCount]);

  useEffect(() => {
    // Load recent searches
    setRecentSearches(getRecentSearches());

    const handleRecentUpdate = () => {
      setRecentSearches(getRecentSearches());
    };
    window.addEventListener("recent_history_updated", handleRecentUpdate);
    return () => window.removeEventListener("recent_history_updated", handleRecentUpdate);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    
    // Check active session via our API
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session", { 
          signal: controller.signal,
          cache: "no-store",
          headers: { "Accept": "application/json" }
        });
        if (!res.ok) throw new Error("Session failed");
        const session = await res.json();
        setUser(session?.user || null);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setUser(null);
        }
      }
    }
    
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categoryList"),
          fetch("/api/productList")
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
        setProducts(Array.isArray(prodData) ? prodData : []);
      } catch (err) {
        console.error("Failed to fetch nav data:", err);
      }
    }

    checkSession();
    fetchData();
    
    return () => controller.abort();
  }, [pathname]);

  // Handle outside clicks to close search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedDesktop = desktopSearchContainerRef.current?.contains(target);
      const clickedMobile = mobileSearchContainerRef.current?.contains(target);
      if (!clickedDesktop && !clickedMobile) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Popular Brands for instant jumps
  const POPULAR_BRANDS = [
    { name: "Apple", icon: "🍏", category: "Mobiles" },
    { name: "Samsung", icon: "📱", category: "Mobiles" },
    { name: "OnePlus", icon: "⚡", category: "Mobiles" },
    { name: "Google Pixel", icon: "🔍", category: "Mobiles" },
    { name: "Vivo", icon: "📷", category: "Mobiles" },
    { name: "Motorola", icon: "🦋", category: "Mobiles" },
    { name: "Dell", icon: "💻", category: "Laptops & Computers" },
    { name: "HP", icon: "🖥️", category: "Laptops & Computers" },
    { name: "Lenovo", icon: "💼", category: "Laptops & Computers" },
    { name: "Boat", icon: "🎧", category: "Watches & Wearables" },
    { name: "Noise", icon: "⌚", category: "Watches & Wearables" },
    { name: "Nike", icon: "✔️", category: "Fashion" },
    { name: "Tanishq", icon: "👑", category: "Jewellery" }
  ];

  // Matched Brands for query (with typo correction)
  const normalizedQuery = normalizeSearchTerm(searchQuery.trim());
  const matchedBrands = searchQuery.trim().length > 0
    ? POPULAR_BRANDS.filter(b => {
        const bName = b.name.toLowerCase();
        const sq = searchQuery.toLowerCase();
        return bName.includes(sq) || bName.includes(normalizedQuery);
      })
    : [];

  // Matched Products (with full model number & typo tolerance)
  const searchSuggestions = searchQuery.trim().length > 0
    ? products
        .filter((p) => matchProductSearch(p, searchQuery))
        .slice(0, 8)
    : [];

  // Matching Categories
  const matchedCategories = searchQuery.trim().length > 0
    ? categories.filter(c => {
        const cName = (c.name || "").toLowerCase();
        const sq = searchQuery.toLowerCase();
        return cName.includes(sq) || cName.includes(normalizedQuery);
      }).slice(0, 3)
    : [];

  const handleSearch = (e?: React.FormEvent, customQuery?: string, categoryFilter?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery !== undefined ? customQuery : searchQuery;
    if (queryToUse.trim()) {
      addRecentSearch(queryToUse.trim());
      setShowSuggestions(false);
      let url = `/products?search=${encodeURIComponent(queryToUse.trim())}`;
      if (categoryFilter) {
        url = `/products?category=${encodeURIComponent(categoryFilter)}&search=${encodeURIComponent(queryToUse.trim())}`;
      }
      router.push(url);
      setIsMobileMenuOpen(false);
    }
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    e.preventDefault();
    removeRecentSearch(item);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    clearRecentHistory();
    setRecentSearches([]);
  };

  const renderSearchDropdown = () => {
    const matchingRecent = searchQuery.trim().length > 0
      ? recentSearches.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
      : recentSearches;

    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 max-h-[75vh] md:max-h-[500px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
        {/* 1. CUSTOMER'S RECENT SEARCHES */}
        {recentSearches.length > 0 && (
          <div className="p-3 sm:p-3.5 bg-blue-50/40">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
              <span className="flex items-center gap-1.5 text-blue-700">
                <History className="w-3 h-3 text-blue-600 shrink-0" />
                <span>Recent Searches</span>
              </span>
              <button
                type="button"
                onClick={handleClearAllRecentSearches}
                className="text-slate-400 hover:text-red-600 text-[10px] font-bold lowercase hover:underline cursor-pointer transition-colors"
              >
                clear all
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(matchingRecent.length > 0 ? matchingRecent : recentSearches.slice(0, 5)).map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-white hover:bg-blue-100 border border-blue-200 text-xs font-medium text-blue-900 transition-all group cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  onClick={() => handleSearch(undefined, item)}
                >
                  <History className="w-2.5 h-2.5 text-blue-500 group-hover:text-blue-700 shrink-0" />
                  <span className="max-w-[180px] sm:max-w-[220px] truncate text-[11px] font-semibold">{item}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRecentSearch(e, item)}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-0.5"
                    title="Remove search"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. When typing: Dynamic Department & In-Category Suggestions */}
        {searchQuery.trim().length > 0 && (
          <div className="p-2.5 sm:p-3 bg-slate-50/70">
            <button
              type="button"
              onClick={() => handleSearch(undefined, searchQuery)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white text-xs sm:text-[13px] font-semibold text-slate-800 flex items-center justify-between group transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                <span className="truncate">Search for <span className="font-bold text-blue-600">"{searchQuery}"</span> in All Departments</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 shrink-0">↵ Enter</span>
            </button>

            {/* Quick department specific jumps */}
            {["Mobiles", "Mobile Accessories", "Old / Refurbished Mobiles", "Fashion"].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => handleSearch(undefined, searchQuery, dept)}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-white text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-300 group-hover:text-blue-400">↳</span>
                  <span className="truncate">in <span className="font-semibold text-slate-800">{dept}</span></span>
                </div>
                <span className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Jump →</span>
              </button>
            ))}
          </div>
        )}

        {/* 3. Matching Brands Suggestions (Direct Brand Stores) */}
        {matchedBrands.length > 0 && (
          <div className="p-2.5 sm:p-3 bg-white">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
              Brand Stores
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {matchedBrands.slice(0, 4).map((brand, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearch(undefined, brand.name, brand.category)}
                  className="w-full text-left p-2 rounded-xl hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 flex items-center gap-2 transition-all cursor-pointer group"
                >
                  <span className="text-base shrink-0">{brand.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                      {brand.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Official {brand.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Live Matching Products Feed */}
        {searchSuggestions.length > 0 && (
          <div className="p-2 sm:p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-2 flex items-center justify-between">
              <span>Matching Products ({searchSuggestions.length})</span>
              <span className="text-[9px] text-slate-400 lowercase">click to view details</span>
            </div>
            <div className="space-y-1">
              {searchSuggestions.map((prod) => {
                const originalPrice = prod.original_price || prod.price * 1.25;
                const discount = Math.round(((originalPrice - prod.price) / originalPrice) * 100);

                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearchQuery("");
                      router.push(`/products/${prod.id}`);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 transition-all group border border-transparent hover:border-slate-200/80 cursor-pointer"
                  >
                    <div className="relative w-10 h-10 rounded-lg bg-white border border-slate-200/80 flex-shrink-0 overflow-hidden p-1 shadow-2xs group-hover:border-blue-300">
                      <Image
                        src={prod.image_url || prod.image || "/products/iphone-16-pro-max.png"}
                        alt={prod.name}
                        fill
                        className="object-contain p-0.5 group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {prod.categories?.name || prod.category || "Store"}
                        </span>
                        {prod.rating && (
                          <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                            <span>★</span>
                            <span>{Number(prod.rating).toFixed(1)}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 truncate leading-snug">
                        {prod.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-900 font-bold">
                          ₹{Math.floor(prod.price).toLocaleString("en-IN")}
                        </span>
                        {originalPrice > prod.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 pr-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Empty Search State: Popular Categories */}
        {searchQuery.trim().length === 0 && (
          <div className="p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Popular Categories
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { name: "Mobiles", href: "/products?category=Mobiles", icon: "📱" },
                { name: "Accessories", href: "/products?category=Mobile%20Accessories", icon: "⚡" },
                { name: "Refurbished", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles", icon: "🔄" },
                { name: "Screen Repair", href: "/services/display-replacement", icon: "🛠️" }
              ].map((cat, idx) => (
                <Link
                  key={idx}
                  href={cat.href}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-xs font-medium text-slate-800 transition-colors"
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 6. Bottom "See all results" Footer */}
        {searchQuery.trim().length > 0 && (
          <button
            type="button"
            onClick={(e) => handleSearch(e)}
            className="w-full text-center py-2 px-4 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>See all results for "{searchQuery}"</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="container flex items-center justify-between gap-2 sm:gap-4 relative py-1.5 md:py-2">
          {/* Left Section: Logo */}
          <div className="flex items-center flex-shrink-0 z-50">
            <Link 
              href="/" 
              className="flex items-center p-0 m-0 leading-none transition-transform active:scale-95"
            >
              <Image 
                src="/my-shop-logo.png" 
                alt="My Shop Logo" 
                width={220} 
                height={60} 
                sizes="(max-width: 768px) 110px, 150px"
                className="w-auto object-contain select-none h-8 sm:h-9 md:h-10" 
                priority
                loading="eager"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links (Refined, Modern Font Size) */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-slate-700 text-xs sm:text-[13px] font-medium">
            <Link 
              href="/" 
              className={`hover:text-secondary transition-colors ${pathname === "/" ? "text-secondary font-bold" : ""}`}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`hover:text-secondary transition-colors ${pathname?.startsWith("/products") || pathname?.startsWith("/categories") ? "text-secondary font-bold" : ""}`}
            >
              Products
            </Link>
            <Link 
              href="/services/display-replacement" 
              className={`hover:text-secondary transition-colors flex items-center gap-1.5 ${pathname.includes("/services") ? "text-secondary font-bold" : ""}`}
            >
              <Wrench className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>Screen Repair</span>
            </Link>
            <Link 
              href="/about" 
              className={`hover:text-secondary transition-colors ${pathname === "/about" ? "text-secondary font-bold" : ""}`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`hover:text-secondary transition-colors ${pathname === "/contact" ? "text-secondary font-bold" : ""}`}
            >
              Contact
            </Link>
          </div>

          {/* Actions Area */}
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 z-50 flex-shrink-0">
            {/* Live Search Bar (Desktop Only) */}
            <div ref={desktopSearchContainerRef} className="relative hidden md:block">
              <form 
                onSubmit={(e) => handleSearch(e)}
                className="flex items-center bg-white border border-slate-200/90 rounded-full px-3 py-1.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#2E6F40]/30 focus-within:border-[#2E6F40] w-32 xs:w-44 sm:w-56 md:w-68 lg:w-72 xl:w-80 shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search brands, products, electronics..."
                  className="bg-transparent border-none outline-none w-full text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 font-normal"
                  value={searchQuery}
                  onFocus={() => {
                    setRecentSearches(getRecentSearches());
                    setShowSuggestions(true);
                  }}
                  onClick={() => {
                    setRecentSearches(getRecentSearches());
                    setShowSuggestions(true);
                  }}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0 cursor-pointer"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Live Search Suggestions Dropdown (Desktop) */}
              {showSuggestions && (
                <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 z-50 w-[310px] xs:w-[360px] sm:w-[440px] md:w-[480px] lg:w-[520px]">
                  {renderSearchDropdown()}
                </div>
              )}
            </div>

            {/* Wishlist Button: Inner shadow, grey bg, Lucide Heart & update animation */}
            <Link
              href="/account?tab=wishlist"
              className={`relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200/90 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] flex items-center justify-center transition-all duration-200 active:scale-90 flex-shrink-0 group ${
                wishlistBump ? "scale-110 ring-2 ring-red-400/60 bg-red-50/50" : ""
              }`}
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart
                className={`w-4 h-4 sm:w-[17px] sm:h-[17px] transition-all duration-300 ${
                  wishlistCount > 0
                    ? "fill-red-500 text-red-500"
                    : "text-slate-600 group-hover:text-red-500"
                } ${wishlistBump ? "animate-heartbeat fill-red-500 text-red-500" : "group-hover:scale-110"}`}
              />
              {wishlistCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-xs transition-transform duration-300 ${
                    wishlistBump ? "scale-125 animate-bounce bg-red-600" : ""
                  }`}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Profile / Account Symbol */}
            {user ? (
              <Link href="/account" className="flex items-center gap-1.5 text-slate-800 hover:text-secondary transition-colors flex-shrink-0 p-0.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-secondary" />
                </div>
                <span className="hidden lg:block text-xs font-semibold text-slate-800">Account</span>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 text-slate-800 hover:text-secondary transition-colors flex-shrink-0 p-0.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <span className="hidden lg:block text-xs font-semibold text-slate-800">Sign In</span>
              </Link>
            )}

            {/* Cart Button (Desktop Only) */}
            <Link 
              href="/cart" 
              className="hidden md:flex relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200/90 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] items-center justify-center transition-all duration-200 active:scale-90 flex-shrink-0 group"
              aria-label="View Cart"
              title="Cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-[17px] sm:h-[17px] text-slate-700 group-hover:text-secondary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Row 2: Mobile Search Bar */}
        <div ref={mobileSearchContainerRef} className="relative block md:hidden px-3 pb-2 pt-0.5 w-full">
          <form 
            onSubmit={(e) => handleSearch(e)}
            className="flex items-center bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 transition-all focus-within:ring-2 focus-within:ring-[#2E6F40]/30 focus-within:border-[#2E6F40] w-full shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search brands, products, electronics..."
              className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400 font-normal"
              value={searchQuery}
              onFocus={() => {
                setRecentSearches(getRecentSearches());
                setShowSuggestions(true);
              }}
              onClick={() => {
                setRecentSearches(getRecentSearches());
                setShowSuggestions(true);
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0 cursor-pointer"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Live Search Suggestions Dropdown (Mobile) */}
          {showSuggestions && (
            <div className="absolute top-full left-3 right-3 mt-1.5 z-50">
              {renderSearchDropdown()}
            </div>
          )}
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="md:hidden bg-white text-gray-800 absolute top-full left-0 right-0 shadow-2xl border-t border-slate-100 py-3 px-4 flex flex-col gap-2 z-50 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top duration-200">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100 font-semibold text-xs text-slate-800 flex items-center justify-between">
                <span>Home</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100 font-semibold text-xs text-secondary flex items-center justify-between">
                <span>All Products</span>
                <ArrowRight className="w-3 h-3 text-secondary" />
              </Link>
              
              <div className="py-1.5">
                <Link 
                  href="/products" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-secondary mb-2 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-secondary" />
                    Shop By Category
                  </span>
                  <span className="text-[10px] text-secondary font-bold">View All →</span>
                </Link>
                <div className="grid grid-cols-3 gap-1.5">
                  {categories.slice(0, 5).map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={`/products?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-slate-50 border border-slate-100 active:scale-95 transition-all text-center"
                    >
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-secondary relative overflow-hidden shadow-xs">
                        {cat.image_url ? (
                          <Image 
                            src={cat.image_url.startsWith('http') ? cat.image_url : `/api/admin/proxy-image?url=${encodeURIComponent(cat.image_url)}`} 
                            alt={cat.name} 
                            fill 
                            className="object-cover" 
                          />
                        ) : (
                          <Package className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="text-[9px] font-semibold text-slate-800 leading-tight truncate w-full">{cat.name}</span>
                    </Link>
                  ))}
                  <Link 
                    href="/categories" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-secondary/10 border border-secondary/20 active:scale-95 transition-all text-center"
                  >
                    <div className="w-9 h-9 bg-secondary text-white rounded-lg flex items-center justify-center shadow-xs">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-bold uppercase leading-tight text-secondary">All Categories</span>
                  </Link>
                </div>
              </div>

              <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100 font-medium text-xs text-slate-700">Services &amp; Repairs</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100 font-medium text-xs text-slate-700">About Us</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100 font-medium text-xs text-slate-700">Customer Support</Link>
              <Link 
                href="/cart" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span className="flex items-center gap-2 text-secondary font-bold text-xs">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Shopping Cart
                </span>
                {cartCount > 0 && (
                  <span className="bg-secondary text-secondary-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </>
        )}
      </nav>
      {/* Fixed Header Spacer */}
      <div className="h-[88px] md:h-[62px] w-full shrink-0" aria-hidden="true" />
    </>
  );
}
