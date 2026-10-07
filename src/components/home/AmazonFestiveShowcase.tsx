"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faChevronRight,
  faChevronDown,
  faCheck,
  faTrash,
  faPlus,
  faMinus,
  faBolt,
  faHeadphones,
  faMobileScreen,
  faShieldHalved,
  faGift,
  faFire,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { useCart } from "@/context/CartContext";

export default function AmazonFestiveShowcase() {
  const router = useRouter();
  const { cart, total, cartCount, updateQuantity, removeFromCart } = useCart();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [primeFilter, setPrimeFilter] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const subNavLinks = [
    { label: "Mobiles & Accessories", href: "/products?category=Mobiles", active: true },
    { label: "Laptops & Accessories", href: "/products?category=Computers%20%26%20Tablets" },
    { label: "TV & Home Entertainment", href: "/products?category=TV%20%26%20Audio" },
    { label: "Audio", href: "/products?category=TV%20%26%20Audio&search=Audio" },
    { label: "Cameras", href: "/products?category=Smart%20Technology&search=Camera" },
    { label: "Computer Peripherals", href: "/products?category=Computers%20%26%20Tablets" },
    { label: "Smart Technology", href: "/products?category=Smart%20Technology" },
    { label: "Musical Instruments", href: "/products" },
    { label: "Office & Stationery", href: "/products" },
  ];

  const categoryTree = [
    { name: "Mobile Accessories", href: "/products?category=Mobile%20Accessories" },
    { name: "Mobile Broadband Devices", href: "/products?category=Smart%20Technology" },
    { name: "SIM Cards", href: "/products?category=Mobiles" },
    { name: "Smartphones & Basic Mobiles", href: "/products?category=Mobiles", bold: true },
    { name: "Smartwatches", href: "/products?category=Smart%20Technology&search=Watch" },
  ];

  const brands = [
    { name: "Samsung", query: "Samsung" },
    { name: "Apple", query: "Apple" },
    { name: "OnePlus", query: "OnePlus" },
    { name: "Google Pixel", query: "Pixel" },
    { name: "Vivo", query: "Vivo" },
    { name: "Motorola", query: "Motorola" },
    { name: "Redmi / Xiaomi", query: "Redmi" },
    { name: "realme", query: "realme" },
    { name: "Ambrane", query: "Ambrane" },
  ];

  // Podium deal cards matching Screenshot 2
  const festivePodiumDeals = [
    {
      id: "samsung-galaxy-z-fold7",
      name: "Galaxy Z Fold7 5G",
      monthlyEmi: "At ₹10,833/month*",
      topTag: "*Including coupon offer • Up to 3 months No Cost EMI",
      startingPrice: "₹1,29,999",
      mrp: "₹2,04,999",
      offerNote: "*Up to 12 months No Cost EMI",
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800",
      altImage: "/products/samsung-galaxy-s26-ultra.jpg",
      highlightSpecs: "Galaxy AI • 200MP Quad • Snapdragon 8 Elite",
      link: "/products/samsung-galaxy-z-fold7",
      bgColor: "from-amber-600/90 via-orange-700/80 to-amber-950"
    },
    {
      id: "oneplus-ce6-lite",
      name: "OnePlus CE6 Lite",
      subName: "(8+128GB)",
      monthlyEmi: "At ₹4,583/month*",
      topTag: "*Including CC EMI bank offer • Up to 6 months No Cost EMI",
      startingPrice: "₹26,999*",
      mrp: "₹33,999",
      offerNote: "*Including CC EMI bank offer • Up to 6 months No Cost EMI",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800",
      altImage: "/products/google-pixel-9-pro-xl.png",
      highlightSpecs: "7000mAh Battery • Powered by OxygenOS • 1.03Mn+ AnTuTu",
      link: "/products/oneplus-ce6-lite",
      bgColor: "from-amber-700/90 via-orange-800/80 to-stone-950"
    },
    {
      id: "samsung-s26-ultra",
      name: "Galaxy S26 Ultra 5G",
      subName: "(12+256GB)",
      monthlyEmi: "At ₹10,833/month*",
      topTag: "*Flat ₹10,000 Exchange Bonus + No Cost EMI",
      startingPrice: "₹1,29,999",
      mrp: "₹1,49,999",
      offerNote: "*Up to 18 months No Cost EMI",
      image: "/products/samsung-galaxy-s26-ultra.jpg",
      highlightSpecs: "200MP Quad Pro AI • S-Pen Built-in • Titanium",
      link: "/products/samsung-s26-ultra",
      bgColor: "from-amber-600/90 via-orange-700/80 to-amber-950"
    },
    {
      id: "iphone-16-pro-max",
      name: "iPhone 16 Pro Max",
      subName: "(256GB Titanium)",
      monthlyEmi: "At ₹11,241/month*",
      topTag: "*Instant ₹5,000 ICICI/HDFC Discount",
      startingPrice: "₹1,34,900",
      mrp: "₹1,44,900",
      offerNote: "*Up to 12 months No Cost EMI",
      image: "/products/iphone-16-pro-max.png",
      highlightSpecs: "A18 Pro Chip • Grade 5 Titanium • 48MP Fusion",
      link: "/products/iphone-16-pro-max",
      bgColor: "from-amber-700/90 via-orange-800/80 to-stone-950"
    }
  ];

  return (
    <div className="w-full bg-[#f8f9fa] text-slate-800">
      {/* =========================================================================
          1. TOP AMAZON SUB-NAVIGATION BAR (Electronics / Mobiles & Accessories)
      ========================================================================= */}
      <div className="bg-[#f0f2f2] border-b border-slate-300 text-xs select-none">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 flex items-center overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 gap-4 sm:gap-6">
          <Link
            href="/products?category=Smart%20Technology"
            className="font-black text-slate-900 hover:text-orange-600 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Electronics</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-[9px] text-slate-400" />
          </Link>

          {subNavLinks.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`hover:text-orange-600 transition-colors shrink-0 py-0.5 ${
                item.active ? "text-slate-950 font-bold border-b-2 border-orange-500 pb-0.5" : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* =========================================================================
          2. MAIN CONTENT AREA (Sidebar Filter + Festive Hero Banner & Spotlight Deals)
      ========================================================================= */}
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* ======================= LEFT SIDEBAR: CATEGORY & FILTERS ======================= */}
          <aside className="hidden lg:block lg:col-span-2 space-y-4 text-xs select-none bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            {/* Category Breadcrumbs Hierarchy */}
            <div>
              <h3 className="font-bold text-slate-900 text-[13px] mb-1.5">Category</h3>
              <Link 
                href="/products" 
                className="text-slate-600 hover:text-orange-600 flex items-center gap-1 font-semibold mb-1"
              >
                <span>&lt; Electronics</span>
              </Link>
              
              <div className="pl-2 border-l-2 border-slate-200 mt-1 space-y-1">
                <span className="font-bold text-slate-900 block">Mobiles &amp; Accessories</span>
                <ul className="pl-2 space-y-1 text-slate-600">
                  {categoryTree.map((c, i) => (
                    <li key={i}>
                      <Link 
                        href={c.href}
                        className={`hover:text-orange-600 transition-colors ${c.bold ? "font-bold text-slate-900" : ""}`}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Amazon Prime / Assured Filter */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Prime &amp; Delivery</h3>
              <label 
                className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-950 font-medium"
                onClick={() => setPrimeFilter(!primeFilter)}
              >
                <input 
                  type="checkbox" 
                  checked={primeFilter} 
                  onChange={() => {}} 
                  className="rounded text-orange-500 focus:ring-orange-400"
                />
                <span className="font-black text-blue-600 italic tracking-wider text-xs">✓prime</span>
              </label>
            </div>

            {/* Delivery Day */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Delivery Day</h3>
              <div className="space-y-1.5 text-slate-700">
                {["Get It Today", "Get It by Tomorrow"].map((day, i) => (
                  <label 
                    key={i} 
                    className="flex items-center gap-2 cursor-pointer hover:text-slate-950"
                    onClick={() => setDeliveryFilter(deliveryFilter === day ? null : day)}
                  >
                    <input 
                      type="checkbox" 
                      checked={deliveryFilter === day} 
                      onChange={() => {}} 
                      className="rounded text-orange-500 focus:ring-orange-400"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Brands</h3>
              <div className="space-y-1.5 text-slate-700 max-h-48 overflow-y-auto pr-1">
                {brands.map((b, i) => (
                  <label 
                    key={i} 
                    className="flex items-center gap-2 cursor-pointer hover:text-slate-950"
                    onClick={() => {
                      const newBrand = selectedBrand === b.query ? null : b.query;
                      setSelectedBrand(newBrand);
                      if (newBrand) router.push(`/products?category=Mobiles&search=${newBrand}`);
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedBrand === b.query} 
                      onChange={() => {}} 
                      className="rounded text-orange-500 focus:ring-orange-400"
                    />
                    <span>{b.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Customer Reviews</h3>
              <div className="space-y-1">
                <Link href="/products?category=Mobiles" className="flex items-center gap-1.5 text-amber-500 hover:opacity-80">
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} className="text-xs" />
                    ))}
                    <FontAwesomeIcon icon={faStar} className="text-xs text-slate-300" />
                  </div>
                  <span className="text-slate-600 text-[11px] font-semibold">&amp; Up</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* ======================= CENTER & RIGHT: FESTIVAL MEGA BANNER & DEALS ======================= */}
          <div className="col-span-1 lg:col-span-10 space-y-4">
            
            {/* Top Row Banner (Screenshot 1 Exact Layout) */}
            <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-[#e65c00] via-[#f9921b] to-[#ea580c] border border-amber-300/40 p-4 sm:p-6 md:p-8 text-white">
              
              {/* Top Action Deal Pills */}
              <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <Link 
                    href="/products?category=Mobile%20Accessories"
                    className="bg-amber-300/95 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2 transition-transform active:scale-95 border border-amber-400"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center text-xs">
                      🎧
                    </span>
                    <span>Accessories</span>
                    <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                  </Link>

                  <Link 
                    href="/products/samsung-s26-ultra"
                    className="bg-amber-300/95 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2 transition-transform active:scale-95 border border-amber-400"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center text-xs">
                      📱
                    </span>
                    <span>Galaxy S26 Ultra 5G</span>
                    <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                  </Link>
                </div>

                <div className="bg-amber-200/90 text-slate-950 font-black px-4 py-1.5 rounded-lg text-xs sm:text-sm tracking-wider uppercase shadow-xs">
                  Deals Revealed
                </div>
              </div>

              {/* Main Festive Visual & Copy */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left Side: Festive Mandala & Typography */}
                <div className="md:col-span-8 space-y-4">
                  
                  {/* Festival Badge */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-900 to-amber-950 px-4 py-2 rounded-2xl border border-amber-300/50 shadow-inner">
                    <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-black text-xs">
                      🪔
                    </div>
                    <div>
                      <span className="block text-[11px] font-black uppercase tracking-widest text-amber-300">
                        Great Indian Festival
                      </span>
                      <span className="block text-xs font-extrabold text-white">
                        Special Mega Smartphone Deals
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-md tracking-tight leading-tight">
                      Mehenga padega wait.* <br />
                      <span className="text-amber-200">Banao apna festival great.</span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-amber-100 drop-shadow-xs">
                      Smartphones at best price. Last chance before price revision!
                    </p>
                  </div>

                  {/* Trust Footer */}
                  <div className="flex items-center gap-3 pt-2 text-xs text-amber-100 font-semibold flex-wrap">
                    <span className="bg-black/30 backdrop-blur-xs px-3 py-1 rounded-md border border-white/20">
                      ⚡ Powered by Samsung Galaxy
                    </span>
                    <span className="bg-black/30 backdrop-blur-xs px-3 py-1 rounded-md border border-white/20">
                      🔒 100% Brand Sealed Guarantee
                    </span>
                    <span className="bg-black/30 backdrop-blur-xs px-3 py-1 rounded-md border border-white/20">
                      🚚 Same-Day Delivery Available
                    </span>
                  </div>
                </div>

                {/* Right Side: Ambassador & Flagship Preview */}
                <div className="md:col-span-4 relative flex justify-center items-center">
                  <div className="relative w-48 sm:w-56 md:w-full h-56 sm:h-64 md:h-72">
                    <Image
                      src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600"
                      alt="Festival Smartphone Deals"
                      fill
                      className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                      priority
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                3. SPOTLIGHT PODIUM DEAL CARDS (Screenshot 2 Exact Layout)
                - Illuminated Pedestals with Galaxy Z Fold7 & OnePlus CE6 Lite
                - Clicking them directly opens Product Detail Page
            ========================================================================= */}
            <div className="bg-gradient-to-b from-amber-700 via-orange-800 to-amber-950 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-amber-400/40">
              
              {/* Header Title */}
              <div className="text-center space-y-1 mb-6 sm:mb-8">
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300">
                  🔥 Grand Festive Reveals
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  Spotlight Flagships on Golden Pedestal
                </h2>
                <p className="text-xs sm:text-sm text-amber-200 font-medium">
                  Click on any device below to explore full 3D gallery, exchange offers &amp; live instant discounts
                </p>
              </div>

              {/* 2-Column or 4-Column Showcase Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
                {festivePodiumDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={deal.link}
                    className="group relative block bg-gradient-to-b from-amber-900/80 via-orange-950 to-black rounded-3xl p-5 sm:p-6 border-2 border-amber-400/60 shadow-2xl hover:border-amber-300 transition-all duration-300 hover:shadow-amber-500/20 hover:-translate-y-1 cursor-pointer overflow-hidden"
                  >
                    {/* Top Offer Label */}
                    <div className="text-center mb-2">
                      <span className="text-[11px] sm:text-xs font-extrabold text-amber-200 tracking-tight block">
                        {deal.topTag}
                      </span>
                    </div>

                    {/* Illuminated Podium Backdrop */}
                    <div className="relative w-full h-64 sm:h-72 flex items-center justify-center my-3">
                      
                      {/* Glow Backdrop */}
                      <div className="absolute w-44 h-44 rounded-full bg-amber-400/25 blur-2xl group-hover:bg-amber-400/40 transition-all pointer-events-none" />
                      
                      {/* Red Ribbon EMI Badge on Phone (Matching Reference Screenshot 2) */}
                      <div className="absolute top-8 left-4 z-20 bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-r-xl shadow-lg border-y border-r border-rose-300">
                        {deal.monthlyEmi}
                      </div>

                      {/* Device Image */}
                      <div className="relative w-full h-full flex items-center justify-center p-2 z-10">
                        <Image
                          src={deal.image}
                          alt={deal.name}
                          fill
                          className="object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      </div>

                      {/* Golden Lit Stage / Pedestal Ring at bottom */}
                      <div className="absolute bottom-2 w-48 sm:w-56 h-8 rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 opacity-70 blur-[3px] shadow-[0_0_20px_#f59e0b] pointer-events-none" />
                      <div className="absolute bottom-3 w-40 sm:w-48 h-4 rounded-full bg-amber-200/80 border border-amber-100 shadow-inner pointer-events-none" />
                    </div>

                    {/* Deal Title Tag Capsule */}
                    <div className="text-center space-y-2 mt-4 relative z-10">
                      
                      <div className="inline-block bg-gradient-to-r from-red-800 via-rose-900 to-red-950 text-white font-black text-sm sm:text-base px-5 py-1.5 rounded-xl border border-amber-400/80 shadow-md">
                        <span>{deal.name}</span> {deal.subName && <span className="text-xs text-amber-200 font-bold">{deal.subName}</span>}
                      </div>

                      {/* Price Banner Tag */}
                      <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 rounded-2xl py-2 px-4 shadow-lg border border-yellow-200 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                          Festive Deal Price
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                            {deal.startingPrice}
                          </span>
                          {deal.mrp && (
                            <span className="text-xs sm:text-sm text-slate-700 line-through font-bold">
                              {deal.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footnote */}
                      <p className="text-[11px] text-amber-200 font-semibold text-center pt-1">
                        {deal.offerNote}
                      </p>
                    </div>

                    {/* Hover Glow Ring */}
                    <div className="absolute inset-0 rounded-3xl ring-2 ring-amber-400/0 group-hover:ring-amber-300/80 transition-all pointer-events-none" />
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
