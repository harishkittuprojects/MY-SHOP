"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faChevronRight,
  faCheck,
  faBolt,
  faShieldHalved,
  faArrowRight,
  faTag,
  faTruckFast,
  faRotateLeft
} from "@fortawesome/free-solid-svg-icons";

export default function AmazonFestiveShowcase() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [primeFilter, setPrimeFilter] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<string | null>(null);

  const subNavLinks = [
    { label: "All Smartphones", href: "/products?category=Mobiles", active: true },
    { label: "Mobile Accessories", href: "/products?category=Mobile%20Accessories" },
    { label: "Refurbished Mobiles", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles" },
    { label: "Laptops & Tablets", href: "/products?category=Computers%20%26%20Tablets" },
    { label: "Smartwatches", href: "/products?category=Smart%20Technology" },
    { label: "Audio & Earbuds", href: "/products?category=TV%20%26%20Audio" },
    { label: "Screen Replacement", href: "/services/display-replacement" },
  ];

  const categoryTree = [
    { name: "Smartphones & Flagships", href: "/products?category=Mobiles", bold: true },
    { name: "Certified Refurbished", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles" },
    { name: "Fast Chargers & MagSafe", href: "/products?category=Mobile%20Accessories" },
    { name: "Cases & 9H Glass", href: "/products?category=Mobile%20Accessories" },
    { name: "Smartwatches & Wearables", href: "/products?category=Smart%20Technology" },
  ];

  const brands = [
    { name: "Samsung Galaxy", query: "Samsung" },
    { name: "Apple iPhone", query: "Apple" },
    { name: "OnePlus", query: "OnePlus" },
    { name: "Google Pixel", query: "Pixel" },
    { name: "Vivo", query: "Vivo" },
    { name: "Motorola", query: "Motorola" },
    { name: "Realme", query: "realme" },
    { name: "Xiaomi / Redmi", query: "Redmi" },
  ];

  // Horizontal spotlight deals with MY SHOP brand theme (Emerald Green & Gold)
  const horizontalDeals = [
    {
      id: "samsung-galaxy-z-fold7",
      name: "Samsung Galaxy Z Fold7 5G",
      subName: "12GB RAM • 256GB Storage",
      monthlyEmi: "At ₹10,833/mo",
      topTag: "★ Up to 12 Months No Cost EMI • Free 1-Year Screen Protection",
      startingPrice: "₹1,29,999",
      mrp: "₹2,04,999",
      discount: "36% OFF",
      features: ["Galaxy AI Engine", "200MP Quad Pro", "Snapdragon 8 Elite"],
      image: "/products/samsung-galaxy-s26-ultra.jpg",
      link: "/products/samsung-galaxy-z-fold7",
      accentBadge: "Flagship Foldable"
    },
    {
      id: "oneplus-ce6-lite",
      name: "OnePlus Nord CE6 Lite 5G",
      subName: "8GB RAM • 128GB Storage",
      monthlyEmi: "At ₹4,583/mo",
      topTag: "★ Instant ₹3,000 Bank Cashback • 6 Months No Cost EMI",
      startingPrice: "₹26,999",
      mrp: "₹33,999",
      discount: "21% OFF",
      features: ["7000mAh Battery", "OxygenOS 15", "50MP Sony LYT OIS"],
      image: "/products/google-pixel-9-pro-xl.png",
      link: "/products/oneplus-ce6-lite",
      accentBadge: "Battery Champion"
    },
    {
      id: "samsung-s26-ultra",
      name: "Samsung Galaxy S26 Ultra 5G",
      subName: "16GB RAM • 512GB Storage",
      monthlyEmi: "At ₹11,666/mo",
      topTag: "★ Flat ₹10,000 Instant Exchange Bonus + Free Buds",
      startingPrice: "₹1,29,999",
      mrp: "₹1,49,999",
      discount: "13% OFF",
      features: ["200MP AI Pro Zoom", "S-Pen Built-in", "Grade 5 Titanium"],
      image: "/products/samsung-galaxy-s25-ultra.png",
      link: "/products/samsung-s26-ultra",
      accentBadge: "Top Bestseller"
    },
    {
      id: "iphone-16-pro-max",
      name: "Apple iPhone 16 Pro Max",
      subName: "256GB • Natural Titanium",
      monthlyEmi: "At ₹11,241/mo",
      topTag: "★ Instant ₹5,000 HDFC/ICICI Card Discount",
      startingPrice: "₹1,34,900",
      mrp: "₹1,44,900",
      discount: "7% OFF",
      features: ["A18 Pro Chip", "48MP Fusion Camera", "Camera Control Button"],
      image: "/products/iphone-16-pro-max.png",
      link: "/products/iphone-16-pro-max",
      accentBadge: "Official Apple"
    }
  ];

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs mb-6">
      
      {/* =========================================================================
          1. TOP SUB-NAVIGATION BAR (Brand Emerald & White Theme)
      ========================================================================= */}
      <div className="bg-white border-b border-slate-200 text-xs select-none">
        <div className="max-w-[1440px] mx-auto px-4 py-2 flex items-center overflow-x-auto whitespace-nowrap scrollbar-none gap-4 sm:gap-6">
          <Link
            href="/products?category=Mobiles"
            className="font-black text-[#2E6F40] flex items-center gap-1.5 shrink-0"
          >
            <span>📱 Mobiles Store</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-[9px] text-[#2E6F40]/60" />
          </Link>

          {subNavLinks.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`hover:text-[#2E6F40] transition-colors shrink-0 py-0.5 font-bold ${
                item.active 
                  ? "text-[#2E6F40] border-b-2 border-[#2E6F40] pb-0.5" 
                  : "text-slate-600 hover:text-[#2E6F40]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* =========================================================================
          2. MAIN CONTENT AREA (Sidebar Filter + Brand Emerald Festive Banner & Horizontal Cards)
      ========================================================================= */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ======================= LEFT SIDEBAR: CATEGORY & FILTERS ======================= */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 text-xs select-none bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Category Breadcrumbs Hierarchy */}
            <div>
              <h3 className="font-bold text-slate-900 text-[13px] mb-1.5">Category</h3>
              <Link 
                href="/products" 
                className="text-slate-600 hover:text-[#2E6F40] flex items-center gap-1 font-semibold mb-1"
              >
                <span>&lt; Electronics &amp; Devices</span>
              </Link>
              
              <div className="pl-2 border-l-2 border-[#2E6F40]/30 mt-1.5 space-y-1.5">
                <span className="font-bold text-[#2E6F40] block">Mobiles &amp; Accessories</span>
                <ul className="pl-2 space-y-1.5 text-slate-600">
                  {categoryTree.map((c, i) => (
                    <li key={i}>
                      <Link 
                        href={c.href}
                        className={`hover:text-[#2E6F40] transition-colors ${c.bold ? "font-bold text-slate-900" : ""}`}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* MY SHOP Assured / Prime Filter */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Assurance &amp; Delivery</h3>
              <label 
                className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-[#2E6F40] font-medium"
                onClick={() => setPrimeFilter(!primeFilter)}
              >
                <input 
                  type="checkbox" 
                  checked={primeFilter} 
                  onChange={() => {}} 
                  className="rounded text-[#2E6F40] focus:ring-[#2E6F40]"
                />
                <span className="font-black text-[#2E6F40] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                  ✓ MY SHOP Assured
                </span>
              </label>
            </div>

            {/* Delivery Day */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Delivery Speed</h3>
              <div className="space-y-1.5 text-slate-700">
                {["Get It Today (Express)", "Get It by Tomorrow"].map((day, i) => (
                  <label 
                    key={i} 
                    className="flex items-center gap-2 cursor-pointer hover:text-[#2E6F40]"
                    onClick={() => setDeliveryFilter(deliveryFilter === day ? null : day)}
                  >
                    <input 
                      type="checkbox" 
                      checked={deliveryFilter === day} 
                      onChange={() => {}} 
                      className="rounded text-[#2E6F40] focus:ring-[#2E6F40]"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Popular Brands</h3>
              <div className="space-y-1.5 text-slate-700 max-h-48 overflow-y-auto pr-1">
                {brands.map((b, i) => (
                  <label 
                    key={i} 
                    className="flex items-center gap-2 cursor-pointer hover:text-[#2E6F40]"
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
                      className="rounded text-[#2E6F40] focus:ring-[#2E6F40]"
                    />
                    <span>{b.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Customer Rating</h3>
              <div className="space-y-1">
                <Link href="/products?category=Mobiles" className="flex items-center gap-1.5 text-amber-500 hover:opacity-80">
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} className="text-xs" />
                    ))}
                    <FontAwesomeIcon icon={faStar} className="text-xs text-slate-300" />
                  </div>
                  <span className="text-slate-600 text-[11px] font-semibold">&amp; Up (4.0+)</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* ======================= CENTER: FESTIVE BANNER & HORIZONTAL SPOTLIGHT CARDS ======================= */}
          <div className="col-span-1 lg:col-span-9 space-y-4">
            
            {/* Top Festive Banner (Website's Emerald & Gold Theme) */}
            <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-[#173e22] via-[#245e35] to-[#1c4d29] border border-emerald-500/30 p-4 sm:p-6 text-white">
              
              {/* Top Quick Deal Action Pills */}
              <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <Link 
                    href="/products?category=Mobile%20Accessories"
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>🎧 Accessories</span>
                    <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
                  </Link>

                  <Link 
                    href="/products/samsung-s26-ultra"
                    className="bg-white/95 hover:bg-white text-emerald-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>📱 Galaxy S26 Ultra 5G</span>
                    <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
                  </Link>
                </div>

                <div className="bg-amber-400 text-slate-950 font-black px-3.5 py-1 rounded-lg text-xs uppercase tracking-wider shadow-xs">
                  🔥 Special Festive Deals
                </div>
              </div>

              {/* Main Headline & Ambience */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-2">
                  <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3 py-1 rounded-xl border border-emerald-400/40">
                    <span className="text-amber-400 font-bold text-xs">✨ GRAND FESTIVAL OFFERS</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                    Smartphones at Best Price. <br />
                    <span className="text-amber-300">Instant Bank Discounts &amp; No Cost EMI</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                    100% Brand Sealed • 1-Year Official Warranty • Same-Day Doorstep Delivery
                  </p>
                </div>

                <div className="md:col-span-4 hidden md:flex justify-end items-center">
                  <div className="relative w-40 h-40">
                    <Image
                      src="/products/samsung-galaxy-s26-ultra.jpg"
                      alt="Flagship Smartphone"
                      fill
                      className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                3. HORIZONTAL SPOTLIGHT DEAL CARDS (Brand Emerald & Gold Website Theme)
            ========================================================================= */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 space-y-4">
              
              {/* Section Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-[#2E6F40] rounded-full" />
                    <span>Spotlight Smartphone Deals</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Click on any card to view 3D image gallery, exchange calculator &amp; checkout
                  </p>
                </div>

                <span className="text-xs font-bold text-[#2E6F40] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  ⚡ Live Price Drops
                </span>
              </div>

              {/* Horizontal Cards Grid (2 Columns on Medium/Large Screens) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {horizontalDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={deal.link}
                    className="group relative flex flex-row items-center bg-gradient-to-r from-slate-50 via-white to-emerald-50/40 rounded-2xl p-3.5 sm:p-4 border-2 border-slate-200 hover:border-[#2E6F40] shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden gap-3 sm:gap-4"
                  >
                    {/* Left: Device Image on Emerald Lit Podium with EMI Ribbon */}
                    <div className="relative w-28 sm:w-36 h-32 sm:h-36 shrink-0 bg-gradient-to-b from-emerald-900/10 via-slate-900/5 to-emerald-950/20 rounded-xl p-2 flex items-center justify-center overflow-hidden border border-slate-200/80">
                      
                      {/* Ribbon EMI Badge */}
                      <div className="absolute top-2 left-0 z-20 bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-r-md shadow-md">
                        {deal.monthlyEmi}
                      </div>

                      {/* Device Graphic */}
                      <div className="relative w-full h-full">
                        <Image
                          src={deal.image}
                          alt={deal.name}
                          fill
                          className="object-contain p-1 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      </div>

                      {/* Lit Stage Circle */}
                      <div className="absolute bottom-1 w-20 h-2.5 rounded-full bg-emerald-400/40 blur-[2px]" />
                    </div>

                    {/* Right: Details, Specs, Pricing & CTA */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      
                      {/* Top Accent Badge */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase text-[#2E6F40] bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          {deal.accentBadge}
                        </span>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          {deal.discount}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#2E6F40] transition-colors line-clamp-1 leading-tight">
                        {deal.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">
                        {deal.subName}
                      </p>

                      {/* Pricing Tag */}
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                          {deal.startingPrice}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-bold">
                          {deal.mrp}
                        </span>
                      </div>

                      {/* Offer Note */}
                      <p className="text-[10px] text-emerald-800 font-bold truncate">
                        {deal.topTag}
                      </p>

                      {/* Action CTA Link */}
                      <div className="pt-1 flex items-center justify-between text-[11px] font-black text-[#2E6F40] group-hover:text-emerald-800">
                        <span>View Deal &amp; Offers</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Subtle Hover Ring */}
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-[#2E6F40]/0 group-hover:ring-[#2E6F40]/30 transition-all pointer-events-none" />
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
