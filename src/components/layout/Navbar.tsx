"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBars, 
  faSearch, 
  faTimes, 
  faUser, 
  faShoppingCart,
  faHeart,
  faChevronLeft,
  faLayerGroup,
  faBox,
  faArrowRight,
  faWrench,
  faBolt,
  faGem,
  faMobileAlt,
  faClockRotateLeft,
  faFire
} from "@fortawesome/free-solid-svg-icons";
import StreamingTagline from "./StreamingTagline";
import { addRecentSearch, getRecentSearches, removeRecentSearch, clearRecentHistory } from "@/lib/recentHistory";
import { matchProductSearch, normalizeSearchTerm } from "@/lib/searchUtils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const desktopSearchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

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
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      const insideDesktop = desktopSearchContainerRef.current?.contains(target);
      const insideMobile = mobileSearchContainerRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const POPULAR_BRANDS = [
    { name: "Apple", icon: "🍏", category: "Mobiles" },
    { name: "Samsung", icon: "🌌", category: "Mobiles" },
    { name: "OnePlus", icon: "🔴", category: "Mobiles" },
    { name: "Google Pixel", icon: "🔘", category: "Mobiles" },
    { name: "Anker", icon: "⚡", category: "Mobile Accessories" },
    { name: "Spigen", icon: "🛡️", category: "Mobile Accessories" },
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
    e.preventDefault();
    e.stopPropagation();
    removeRecentSearch(item);
    setRecentSearches((prev) => prev.filter((x) => x.toLowerCase() !== item.toLowerCase()));
  };

  const handleClearAllRecentSearches = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearRecentHistory();
    setRecentSearches([]);
  };

  const renderSearchDropdown = () => {
    const matchingRecent = searchQuery.trim().length > 0
      ? recentSearches.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
      : recentSearches;

    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 max-h-[75vh] md:max-h-[500px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
        {/* 1. CUSTOMER'S RECENT SEARCHES (Always at the top when available) */}
        {recentSearches.length > 0 && (
          <div className="p-3 sm:p-3.5 bg-blue-50/40">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 px-1">
              <span className="flex items-center gap-1.5 text-blue-700">
                <FontAwesomeIcon icon={faClockRotateLeft} className="text-xs text-blue-600" />
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
                  className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-white hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-900 transition-all group cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  onClick={() => handleSearch(undefined, item)}
                >
                  <FontAwesomeIcon icon={faClockRotateLeft} className="text-[9px] text-blue-500 group-hover:text-blue-700" />
                  <span className="max-w-[180px] sm:max-w-[220px] truncate">{item}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRecentSearch(e, item)}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-0.5"
                    title="Remove search"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-[9px]" />
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
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between group transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <FontAwesomeIcon icon={faSearch} className="text-slate-400 text-xs group-hover:text-blue-600" />
                <span className="truncate">Search for <span className="font-black text-blue-600">"{searchQuery}"</span> in All Departments</span>
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
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-slate-300 group-hover:text-blue-400">↳</span>
                  <span className="truncate">in <span className="font-bold text-slate-800">{dept}</span></span>
                </div>
                <span className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Jump →</span>
              </button>
            ))}
          </div>
        )}

        {/* 3. Matched Brands */}
        {searchQuery.trim().length > 0 && matchedBrands.length > 0 && (
          <div className="p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
              <span>👑</span>
              <span>Matching Brands</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {matchedBrands.map((b, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearch(undefined, b.name, b.category)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-bold text-slate-800 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                  <span className="text-[9px] text-slate-400 font-normal">({b.category})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Matched Products List with Photos & Pricing */}
        {searchQuery.trim().length > 0 && searchSuggestions.length > 0 && (
          <div className="p-2 sm:p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center justify-between">
              <span>Matching Products</span>
              <span className="text-[9px] text-blue-600 font-bold">{searchSuggestions.length} found</span>
            </div>

            <div className="space-y-1">
              {searchSuggestions.map((prod) => {
                const originalPrice = prod.original_price && prod.original_price > prod.price 
                  ? prod.original_price 
                  : Math.round(prod.price * 1.18);
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
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-all group border border-transparent hover:border-slate-200/80 cursor-pointer"
                  >
                    <div className="relative w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex-shrink-0 overflow-hidden p-1 shadow-2xs group-hover:border-blue-300">
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
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {prod.categories?.name || prod.category || "Store"}
                        </span>
                        {prod.rating && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                            <span>★</span>
                            <span>{Number(prod.rating).toFixed(1)}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate leading-snug">
                        {prod.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs sm:text-sm text-slate-900 font-black">
                          ₹{Math.floor(prod.price).toLocaleString("en-IN")}
                        </span>
                        {originalPrice > prod.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="text-[10px] font-black text-emerald-600">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 pr-1" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Empty Search State: Popular Categories */}
        {searchQuery.trim().length === 0 && (
          <div className="p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
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
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-800 transition-colors"
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
            className="w-full text-center py-2.5 px-4 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>See all results for "{searchQuery}"</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? "py-0 shadow-md" : "py-0 shadow-sm"
      }`}
    >
      <div className={`container transition-all duration-300 flex items-center justify-between gap-2 sm:gap-4 relative ${isScrolled ? "py-1.5" : "py-1.5 md:py-2"}`}>
        {/* Left Section: Logo */}
        <div className="flex items-center flex-shrink-0 z-50">
          <Link 
            href="/" 
            className="flex items-center p-0 m-0 leading-none transition-transform active:scale-95"
          >
            <Image 
              src="/my-shop-logo.png" 
              alt="My Shop Logo" 
              width={160}
              height={160}
              sizes="(max-width: 768px) 44px, 64px"
              className={`w-auto object-contain select-none transition-all duration-300 ${
                isScrolled ? "h-9 sm:h-11 md:h-13" : "h-10 sm:h-12 md:h-15"
              }`}
              priority
              loading="eager"
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-[#222222]">
          <Link href="/" className={`hover:text-gray-600 font-medium ${pathname === "/" ? "text-secondary font-bold" : ""}`}>Home</Link>
          <Link href="/categories" className={`hover:text-gray-600 font-medium ${pathname?.startsWith("/categories") ? "text-secondary font-bold" : ""}`}>Categories</Link>
          <Link href="/products" className={`hover:text-gray-600 font-medium ${pathname === "/products" ? "text-secondary font-bold" : ""}`}>Products</Link>
          <Link href="/services/display-replacement" className={`hover:text-gray-600 font-medium flex items-center gap-1.5 ${pathname.includes("/services") ? "text-secondary font-bold" : ""}`}>
            <FontAwesomeIcon icon={faWrench} className="text-xs text-secondary" />
            Screen Repair
          </Link>
          <Link href="/about" className={`hover:text-gray-600 font-medium ${pathname === "/about" ? "text-secondary font-bold" : ""}`}>About</Link>
          <Link href="/contact" className={`hover:text-gray-600 font-medium ${pathname === "/contact" ? "text-secondary font-bold" : ""}`}>Contact</Link>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 z-50 flex-shrink-0">
          {/* Live Search Bar (Desktop Only) */}
          <div ref={desktopSearchContainerRef} className="relative hidden md:block">
            <form 
              onSubmit={(e) => handleSearch(e)}
              className="flex items-center bg-white border border-slate-200/90 rounded-full px-2.5 sm:px-3.5 py-1.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#2E6F40]/30 focus-within:border-[#2E6F40] w-32 xs:w-44 sm:w-60 md:w-72 lg:w-80 xl:w-96 shadow-2xs"
            >
              <FontAwesomeIcon icon={faSearch} className="text-slate-400 text-xs sm:text-sm mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search brands, products, electronics..."
                className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
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
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1 flex-shrink-0 cursor-pointer"
                  title="Clear"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
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

          {/* Wishlist Icon */}
          <Link
            href="/account?tab=wishlist"
            className="relative p-2 transition-colors text-slate-800 hover:text-red-500 flex items-center justify-center active:scale-95 flex-shrink-0"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <FontAwesomeIcon icon={faHeart} className="text-xl sm:text-2xl" />
            {wishlistCount > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Profile Symbol */}
          {user ? (
            <Link href="/account" className="flex items-center gap-1.5 text-slate-800 hover:text-primary transition-colors flex-shrink-0 p-1">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-xs">
                <FontAwesomeIcon icon={faUser} className="text-sm" />
              </div>
              <span className="hidden lg:block text-xs md:text-sm font-black uppercase tracking-wider">Account</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 text-slate-800 hover:text-primary transition-colors flex-shrink-0 p-1">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-xs">
                <FontAwesomeIcon icon={faUser} className="text-sm" />
              </div>
              <span className="hidden lg:block text-xs md:text-sm font-black uppercase tracking-wider">Sign In</span>
            </Link>
          )}

          {/* Cart Icon (Desktop Only - Mobile has it in Bottom Nav) */}
          <Link 
            href="/cart" 
            className="hidden md:flex relative p-2 transition-colors text-slate-800 hover:text-secondary items-center justify-center active:scale-95 flex-shrink-0"
            aria-label="View Cart"
          >
            <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
            {cartCount > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 bg-secondary text-secondary-foreground text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Row 2: Mobile Search Bar (Cleanly placed below the header on mobile) */}
      <div ref={mobileSearchContainerRef} className="relative block md:hidden px-3 pb-2 pt-0.5 w-full">
        <form 
          onSubmit={(e) => handleSearch(e)}
          className="flex items-center bg-white border border-slate-200/90 rounded-xl px-3 py-2 transition-all focus-within:ring-2 focus-within:ring-[#2E6F40]/30 focus-within:border-[#2E6F40] w-full shadow-2xs"
        >
          <FontAwesomeIcon icon={faSearch} className="text-slate-400 text-xs mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search brands, products, electronics..."
            className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400 font-medium"
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
              className="text-slate-400 hover:text-slate-700 p-0.5 flex-shrink-0 cursor-pointer"
              title="Clear"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
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
          <div className="md:hidden bg-white text-gray-800 absolute top-full left-0 right-0 shadow-2xl border-t border-slate-100 py-4 px-5 flex flex-col gap-3 z-50 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top duration-200">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-slate-100 font-bold text-sm text-slate-800 flex items-center justify-between">
              <span>Home</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs text-slate-400" />
            </Link>
            <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-slate-100 font-bold text-sm text-secondary flex items-center justify-between">
              <span>Categories</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs text-secondary" />
            </Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-slate-100 font-bold text-sm text-slate-700 flex items-center justify-between">
              <span>All Products &amp; Devices</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs text-slate-400" />
            </Link>
            
            <div className="py-2">
              <Link 
                href="/categories" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-secondary mb-2.5 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-secondary" />
                  Shop By Category
                </span>
                <span className="text-[10px] text-secondary font-bold">View All →</span>
              </Link>
              <div className="grid grid-cols-3 gap-2">
                {categories.slice(0, 5).map((cat) => (
                  <Link 
                    key={cat.id} 
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 active:scale-95 transition-all text-center"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-secondary relative overflow-hidden shadow-xs">
                      {cat.image_url ? (
                        <Image 
                          src={cat.image_url.startsWith('http') ? cat.image_url : `/api/admin/proxy-image?url=${encodeURIComponent(cat.image_url)}`} 
                          alt={cat.name} 
                          fill 
                          className="object-cover" 
                        />
                      ) : (
                        <FontAwesomeIcon icon={faBox} size="xs" />
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-slate-800 leading-tight truncate w-full">{cat.name}</span>
                  </Link>
                ))}
                <Link 
                  href="/categories" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary/10 border border-secondary/20 active:scale-95 transition-all text-center"
                >
                  <div className="w-10 h-10 bg-secondary text-white rounded-lg flex items-center justify-center shadow-xs">
                    <FontAwesomeIcon icon={faArrowRight} size="xs" />
                  </div>
                  <span className="text-[9px] font-black uppercase leading-tight text-secondary">All Categories</span>
                </Link>
              </div>
            </div>

            <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-slate-100 font-semibold text-sm text-slate-700">Services &amp; Repairs</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-slate-100 font-semibold text-sm text-slate-700">About Us</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-slate-100 font-semibold text-sm text-slate-700">Customer Support</Link>
            <Link 
              href="/cart" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="py-2.5 border-b border-slate-100 flex items-center justify-between"
            >
              <span className="flex items-center gap-2.5 text-secondary font-black text-sm">
                <FontAwesomeIcon icon={faShoppingCart} />
                Shopping Cart
              </span>
              {cartCount > 0 && (
                <span className="bg-secondary text-secondary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </>
      )}
    </nav>
  );
}
