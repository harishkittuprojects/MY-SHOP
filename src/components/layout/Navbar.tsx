"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBars, 
  faSearch, 
  faTimes, 
  faUser, 
  faShoppingCart,
  faChevronLeft,
  faLayerGroup,
  faBox,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import StreamingTagline from "./StreamingTagline";



export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { cartCount } = useCart();

  useEffect(() => {
    const controller = new AbortController();
    
    // Check active session via our API
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session", { 
          signal: controller.signal,
          cache: "no-store", // Prevent browser from caching redirect loops
          headers: {
            "Accept": "application/json"
          }
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
    
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categoryList");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }

    checkSession();
    fetchCategories();
    
    return () => controller.abort();
  }, [pathname]); // Check on every navigation

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
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
      {/* Horizontal Announcement Bar (Collapses smoothly on scroll) */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isScrolled ? "max-h-0 opacity-0 -translate-y-2 pointer-events-none" : "max-h-14 opacity-100 translate-y-0"
        }`}
      >
        <StreamingTagline />
      </div>

      <div className={`container transition-all duration-300 flex items-center justify-between gap-4 relative ${isScrolled ? "py-1" : "py-1 md:py-2"}`}>
        {/* Left Section: Logo Alone (Totally Aligned Left) */}
        <div className="flex items-center z-50">
          <Link 
            href="/" 
            className="flex items-center p-0 m-0 leading-none transition-transform active:scale-95"
          >
            <Image 
              src="/my-shop-logo.png" 
              alt="My Shop Logo" 
              width={160}
              height={160}
              sizes="(max-width: 768px) 52px, 64px"
              className={`w-auto object-contain select-none transition-all duration-300 ${
                isScrolled ? "h-11 md:h-13" : "h-13 md:h-15"
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
          <Link href="/services" className={`hover:text-gray-600 font-medium ${pathname === "/services" ? "text-secondary font-bold" : ""}`}>Services</Link>
          <Link href="/about" className={`hover:text-gray-600 font-medium ${pathname === "/about" ? "text-secondary font-bold" : ""}`}>About</Link>
          <Link href="/contact" className={`hover:text-gray-600 font-medium ${pathname === "/contact" ? "text-secondary font-bold" : ""}`}>Contact</Link>
        </div>

        {/* Actions Area - SEARCH BAR BESIDE PROFILE SYMBOL, MENU & CART */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 z-50">
          {/* Search Bar - Directly beside Profile Symbol */}
          <form 
            onSubmit={handleSearch}
            className="flex items-center bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 transition-all focus-within:ring-2 focus-within:ring-secondary/30 focus-within:border-secondary focus-within:bg-white w-28 sm:w-48 md:w-56 lg:w-64 shadow-xs"
          >
            <FontAwesomeIcon icon={faSearch} className="text-slate-400 text-xs sm:text-sm mr-1.5 sm:mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent border-none outline-none w-full text-[11px] sm:text-xs md:text-sm text-slate-800 placeholder:text-slate-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Profile Symbol */}
          {user ? (
            <Link href="/account" className="flex items-center gap-1.5 sm:gap-2 text-[#222222] hover:text-primary transition-colors flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-xs">
                <FontAwesomeIcon icon={faUser} className="text-xs sm:text-sm" />
              </div>
              <span className="hidden lg:block text-xs md:text-sm font-black uppercase tracking-wider">Account</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 sm:gap-2 text-[#222222] hover:text-primary transition-colors flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-xs">
                <FontAwesomeIcon icon={faUser} className="text-xs sm:text-sm" />
              </div>
              <span className="hidden lg:block text-xs md:text-sm font-black uppercase tracking-wider">Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="p-1.5 text-[#222222] md:hidden hover:text-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-lg sm:text-xl" />
          </button>

          {/* Cart Icon - ALWAYS VISIBLE IN HEADER */}
          <Link 
            href="/cart" 
            className="relative p-1.5 sm:p-2 transition-colors text-[#222222] hover:text-secondary flex items-center justify-center active:scale-95 flex-shrink-0"
            aria-label="View Cart"
          >
            <FontAwesomeIcon icon={faShoppingCart} className="text-lg sm:text-xl" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category Text Sub-Navigation Bar (Exact Poorvika Reference) */}
      <div className="bg-white border-t border-b border-slate-100 hidden md:block py-2.5">
        <div className="container flex items-center justify-between gap-4 lg:gap-8 overflow-x-auto no-scrollbar px-2 sm:px-4">
          {[
            "Mobiles & Accessories",
            "Computers & Tablets",
            "TV & Audio",
            "Kitchen Appliances",
            "Home Appliances",
            "Smart Technology"
          ].map((catName) => (
            <Link
              key={catName}
              href={`/products?category=${encodeURIComponent(catName)}`}
              className="text-xs lg:text-sm font-bold text-slate-900 hover:text-secondary whitespace-nowrap transition-colors tracking-tight py-0.5 border-b-2 border-transparent hover:border-secondary"
            >
              {catName}
            </Link>
          ))}
        </div>
      </div>


      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background text-gray-800 absolute top-full left-0 right-0 shadow-lg border-t border-white/10 py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">Home</Link>
          <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b text-secondary font-black">All Products</Link>
          
          <div className="py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faLayerGroup} className="text-secondary" />
              Shop By Category
            </p>
            <div className="grid grid-cols-3 gap-2">
              {categories.slice(0, 6).map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-accent/30 active:scale-95 transition-all text-center"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-secondary relative overflow-hidden shadow-sm">
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
                  <span className="text-[8px] font-black uppercase leading-tight truncate w-full">{cat.name}</span>
                </Link>
              ))}
              <Link 
                href="/products" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary/10 active:scale-95 transition-all text-center"
              >
                <div className="w-10 h-10 bg-secondary text-white rounded-lg flex items-center justify-center shadow-sm">
                  <FontAwesomeIcon icon={faArrowRight} size="xs" />
                </div>
                <span className="text-[8px] font-black uppercase leading-tight">More</span>
              </Link>
            </div>
          </div>

          <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">Services</Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">About Us</Link>
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">Contact</Link>
          <Link 
            href="/cart" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="py-2 border-b flex items-center justify-between"
          >
            <span className="flex items-center gap-3 text-secondary font-black">
              <FontAwesomeIcon icon={faShoppingCart} />
              MY CART
            </span>
            {cartCount > 0 && (
              <span className="bg-secondary text-secondary-foreground text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      )}
    </nav>
  );
}
