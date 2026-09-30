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
  faMobileAlt
} from "@fortawesome/free-solid-svg-icons";
import StreamingTagline from "./StreamingTagline";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

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
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchSuggestions = searchQuery.trim().length > 1
    ? products
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q)) ||
            (p.category_name && p.category_name.toLowerCase().includes(q)) ||
            (p.sub_category && p.sub_category.toLowerCase().includes(q))
          );
        })
        .slice(0, 6)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? "py-1 shadow-md" : "py-0 shadow-sm"
      }`}
    >
      {/* Horizontal Announcement Bar */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isScrolled ? "max-h-0 opacity-0 -translate-y-2 pointer-events-none" : "max-h-14 opacity-100 translate-y-0"
        }`}
      >
        <StreamingTagline />
      </div>

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
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[#222222]">
          <Link href="/" className={`hover:text-gray-600 font-medium ${pathname === "/" ? "text-secondary font-bold" : ""}`}>Home</Link>
          <Link href="/products" className={`hover:text-gray-600 font-medium ${pathname === "/products" ? "text-secondary font-bold" : ""}`}>Products</Link>
          <Link href="/services/display-replacement" className={`hover:text-gray-600 font-medium flex items-center gap-1.5 ${pathname.includes("/services") ? "text-secondary font-bold" : ""}`}>
            <FontAwesomeIcon icon={faWrench} className="text-xs text-secondary" />
            Screen Repair
          </Link>
          <Link href="/about" className={`hover:text-gray-600 font-medium ${pathname === "/about" ? "text-secondary font-bold" : ""}`}>About</Link>
          <Link href="/contact" className={`hover:text-gray-600 font-medium ${pathname === "/contact" ? "text-secondary font-bold" : ""}`}>Contact</Link>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 lg:gap-5 z-50 flex-shrink-0">
          {/* Live Search Bar with Suggestions */}
          <div ref={searchContainerRef} className="relative">
            <form 
              onSubmit={handleSearch}
              className="flex items-center bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 transition-all focus-within:ring-2 focus-within:ring-secondary/30 focus-within:border-secondary focus-within:bg-white w-28 xs:w-36 sm:w-48 md:w-56 lg:w-64 shadow-xs"
            >
              <FontAwesomeIcon icon={faSearch} className="text-slate-400 text-xs sm:text-sm mr-1.5 sm:mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search brands, products..."
                className="bg-transparent border-none outline-none w-full text-[11px] sm:text-xs md:text-sm text-slate-800 placeholder:text-slate-400 font-medium"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
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
                    setShowSuggestions(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                </button>
              )}
            </form>

            {/* Suggestions Dropdown (Amazon style) */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 min-w-[280px] max-h-[380px] overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Products &amp; Suggestions
                </div>
                {searchSuggestions.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearchQuery("");
                      router.push(`/products/${prod.id}`);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-3 transition-colors group border-b border-slate-50 last:border-0"
                  >
                    <div className="relative w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                      <Image
                        src={prod.image_url || prod.image || "/mobile-logo.png"}
                        alt={prod.name}
                        fill
                        className="object-contain p-0.5"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-secondary truncate">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-black">
                        ₹{Math.floor(prod.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full text-center py-2 text-xs font-bold text-secondary bg-emerald-50/60 hover:bg-emerald-50 transition-colors block"
                >
                  See all results for "{searchQuery}" →
                </button>
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <Link
            href="/account?tab=wishlist"
            className="relative p-1.5 sm:p-2 transition-colors text-[#222222] hover:text-red-500 flex items-center justify-center active:scale-95 flex-shrink-0"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <FontAwesomeIcon icon={faHeart} className="text-base sm:text-xl" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Profile Symbol */}
          {user ? (
            <Link href="/account" className="flex items-center gap-1.5 sm:gap-2 text-[#222222] hover:text-primary transition-colors flex-shrink-0 p-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-xs">
                <FontAwesomeIcon icon={faUser} className="text-xs sm:text-sm" />
              </div>
              <span className="hidden lg:block text-xs md:text-sm font-black uppercase tracking-wider">Account</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 sm:gap-2 text-[#222222] hover:text-primary transition-colors flex-shrink-0 p-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-xs">
                <FontAwesomeIcon icon={faUser} className="text-xs sm:text-sm" />
              </div>
              <span className="hidden lg:block text-xs md:text-sm font-black uppercase tracking-wider">Sign In</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link 
            href="/cart" 
            className="relative p-1.5 sm:p-2 transition-colors text-[#222222] hover:text-secondary flex items-center justify-center active:scale-95 flex-shrink-0"
            aria-label="View Cart"
          >
            <FontAwesomeIcon icon={faShoppingCart} className="text-base sm:text-xl" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            className="p-1.5 text-[#222222] md:hidden hover:text-secondary transition-colors flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-base sm:text-xl" />
          </button>
        </div>
      </div>

      {/* Category Text Sub-Navigation Bar */}
      <div className="bg-white border-t border-b border-slate-100 hidden md:block py-2.5">
        <div className="container flex items-center justify-between gap-4 lg:gap-8 overflow-x-auto no-scrollbar px-2 sm:px-4">
          {[
            { label: "Mobiles", href: "/products?category=Mobiles" },
            { label: "Mobile Accessories", href: "/products?category=Mobile%20Accessories" },
            { label: "Old / Refurbished Mobiles", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles" },
            { label: "Fashion", href: "/products?category=Fashion" },
            { label: "Jewellery", href: "/products?category=Jewellery" },
            { label: "EV Vehicles", href: "/products?category=EV%20Vehicles" },
            { label: "Display Replacement", href: "/services/display-replacement" },
          ].map((catItem) => (
            <Link
              key={catItem.label}
              href={catItem.href}
              className="text-xs lg:text-sm font-bold text-slate-900 hover:text-secondary whitespace-nowrap transition-colors tracking-tight py-0.5 border-b-2 border-transparent hover:border-secondary"
            >
              {catItem.label}
            </Link>
          ))}
        </div>
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
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-slate-100 text-secondary font-black text-sm flex items-center justify-between">
              <span>All Smartphones &amp; Devices</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs text-secondary" />
            </Link>
            
            <div className="py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-2">
                <FontAwesomeIcon icon={faLayerGroup} className="text-secondary" />
                Shop By Category
              </p>
              <div className="grid grid-cols-3 gap-2">
                {categories.slice(0, 6).map((cat) => (
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
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary/10 active:scale-95 transition-all text-center"
                >
                  <div className="w-10 h-10 bg-secondary text-white rounded-lg flex items-center justify-center shadow-xs">
                    <FontAwesomeIcon icon={faArrowRight} size="xs" />
                  </div>
                  <span className="text-[9px] font-black uppercase leading-tight text-secondary">All Brands</span>
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
