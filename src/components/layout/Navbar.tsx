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
        {/* Mobile Left Section (Menu) */}
        <div className="flex items-center md:hidden z-50">
          <button
            className="p-2 text-[#222222]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-xl" />
          </button>
        </div>

        <div className="flex items-center flex-1 md:flex-initial justify-center md:justify-start">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 p-0 m-0 leading-none z-10 transition-transform active:scale-95"
          >
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-900 border border-slate-700">
              <Image 
                src="/mobile-logo.png" 
                alt="Madur Mobiles Logo" 
                fill
                sizes="(max-width: 768px) 48px, 64px"
                className="object-cover"
                priority
                loading="eager"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-xl md:text-2xl tracking-tight text-slate-900 uppercase">
                MADUR <span className="text-emerald-700">MOBILES</span>
              </span>
              <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-emerald-700 uppercase -mt-0.5">
                FLAGSHIPS &amp; 5G GADGETS
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Search Bar (Madur Style) - HIDDEN ON MOBILE */}
        <form 
          onSubmit={handleSearch}
          className="hidden lg:flex flex-1 max-w-md mx-4 items-center bg-gray-50 border border-green-200/80 rounded-xl px-4 py-2 shadow-sm focus-within:border-emerald-600 focus-within:bg-white transition-all"
        >
          <FontAwesomeIcon icon={faSearch} className="text-emerald-700 mr-3" />
          <input
            type="text"
            placeholder="Search iPhone 16 Pro, Galaxy S25, Pixel 9, Smartwatches..."
            className="bg-transparent border-none outline-none w-full text-sm text-[#182C20] placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Desktop Links - HIDDEN ON MOBILE */}
        <div className="hidden md:flex items-center gap-7 text-[#182C20]">
          <Link href="/" className="hover:text-emerald-700 font-semibold transition-colors">Home</Link>
          <Link href="/products" className="hover:text-emerald-700 font-bold text-emerald-700 transition-colors">Smartphones</Link>
          <Link href="/categories" className="hover:text-emerald-700 font-semibold transition-colors">Brands</Link>
          <Link href="/about" className="hover:text-emerald-700 font-semibold transition-colors">About Store</Link>
          <Link href="/contact" className="hover:text-emerald-700 font-semibold transition-colors">Support</Link>
        </div>

        {/* Actions - ACCOUNT ON RIGHT ON MOBILE, CART+ACCOUNT ON DESKTOP */}
        <div className="flex items-center gap-4 md:gap-6 z-50">
          
          {user ? (
            <Link href="/account" className="flex items-center gap-2 text-[#222222] hover:text-primary transition-colors">
              <div className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-sm" />
              </div>
              <span className="hidden md:block text-sm font-black uppercase tracking-widest">Account</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-2 text-[#222222] hover:text-primary transition-colors">
              <div className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-sm" />
              </div>
              <span className="hidden md:block text-sm font-black uppercase tracking-widest">Sign In</span>
            </Link>
          )}

          {/* Cart Icon - HIDDEN ON MOBILE HEADER, MOVED TO MENU */}
          <Link href="/cart" className="hidden md:block relative p-2 transition-colors text-[#222222] hover:text-gray-600">
            <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
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
