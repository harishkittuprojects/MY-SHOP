"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";
import { getRecentSearches, getRecentlyViewedProductIds, clearRecentHistory } from "@/lib/recentHistory";
import { products as defaultProducts } from "@/lib/data";
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
  faRotateLeft,
  faClockRotateLeft,
  faPlus,
  faCloudUploadAlt,
  faTimes,
  faChevronLeft,
  faImage,
  faArrowDownWideShort,
  faArrowUpShortWide,
  faIndianRupeeSign,
  faLayerGroup,
  faTags
} from "@fortawesome/free-solid-svg-icons";

// Categories data for switchable Shop by Category grid
const SHOWCASE_CATEGORIES = [
  {
    id: "mobiles",
    name: "Mobiles & Accessories",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Mobiles",
    subtitle: "View Catalog →",
  },
  {
    id: "computers-tablets",
    name: "Computers & Tablets",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Computers%20%26%20Tablets",
    subtitle: "View Catalog →",
  },
  {
    id: "tv-audio",
    name: "TV & Audio",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=TV%20%26%20Audio",
    subtitle: "View Catalog →",
  },
  {
    id: "kitchen-appliances",
    name: "Kitchen Appliances",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Kitchen%20Appliances",
    subtitle: "View Catalog →",
  },
  {
    id: "smart-technology",
    name: "Smart Watches & Wearables",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Smart%20Technology",
    subtitle: "View Catalog →",
  },
  {
    id: "fashion",
    name: "Fashion & Lifestyle",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Fashion",
    subtitle: "View Catalog →",
  },
  {
    id: "jewellery",
    name: "Precious Jewellery",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Jewellery",
    subtitle: "View Catalog →",
  },
  {
    id: "ev-vehicles",
    name: "Electric Vehicles",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=EV%20Vehicles",
    subtitle: "View Catalog →",
  },
  {
    id: "refurbished-mobiles",
    name: "Certified Refurbished Mobiles",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Old%20%2F%20Refurbished%20Mobiles",
    subtitle: "View Catalog →",
  },
  {
    id: "mobile-accessories",
    name: "Fast Mobile Accessories",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Mobile%20Accessories",
    subtitle: "View Catalog →",
  }
];

function parsePrice(val: any): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const numStr = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(numStr);
  return isNaN(num) ? 0 : num;
}

interface DealItem {
  id: string;
  name: string;
  subName: string;
  monthlyEmi: string;
  topTag: string;
  startingPrice: string;
  mrp: string;
  discount: string;
  features: string[];
  image: string;
  link: string;
  accentBadge: string;
}

interface CategoryConfig {
  storeTitle: string;
  parentCategory: { name: string; href: string };
  categoryHeading: string;
  subNavLinks: { label: string; href: string }[];
  categoryTree: { name: string; href: string; bold?: boolean }[];
  brands: { name: string; query: string }[];
  bannerBadge: string;
  bannerHeadline: string;
  bannerHighlight: string;
  bannerTagline: string;
  bannerHeroImg: string;
  bannerPills: { label: string; href: string }[];
  spotlightTitle: string;
  deals: DealItem[];
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  "for-you": {
    storeTitle: "🛍️ For You: Your Personalized Hub",
    parentCategory: { name: "< All Departments", href: "/products" },
    categoryHeading: "Personalized Picks & Recently Searched Items",
    subNavLinks: [
      { label: "Recently Searched", href: "/products?category=for-you" },
      { label: "Top Mobiles", href: "/products?category=Mobiles" },
      { label: "Fast Accessories", href: "/products?category=Mobile%20Accessories" },
      { label: "Certified Refurbished", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles" },
      { label: "Fashion Trends", href: "/products?category=Fashion" },
      { label: "BIS Gold", href: "/products?category=Jewellery" }
    ],
    categoryTree: [
      { name: "Based On Your Recent Activity", href: "/products?category=for-you", bold: true },
      { name: "Top Smartphone Flagships", href: "/products?category=Mobiles" },
      { name: "Fast Chargers & MagSafe", href: "/products?category=Mobile%20Accessories" },
      { name: "Certified Refurbished (Grade A+)", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles" },
      { name: "Smartwatches & Wearables", href: "/products?category=Smart%20Technology" },
    ],
    brands: [
      { name: "Apple", query: "Apple" },
      { name: "Samsung", query: "Samsung" },
      { name: "OnePlus", query: "OnePlus" },
      { name: "Google Pixel", query: "Pixel" },
      { name: "Anker", query: "Anker" },
      { name: "Nike", query: "Nike" },
      { name: "Tanishq", query: "Tanishq" }
    ],
    bannerBadge: "🛍️ CURATED JUST FOR YOU",
    bannerHeadline: "Your Personalized Recommendations.",
    bannerHighlight: "Based on Your Search & Browsing Activity",
    bannerTagline: "Handpicked deals matching your taste • 100% Brand Sealed • Fast Doorstep Delivery",
    bannerHeroImg: "/products/samsung-galaxy-s26-ultra.jpg",
    bannerPills: [
      { label: "🔥 Top Recommendations", href: "/products?category=for-you" },
      { label: "⚡ Live Price Drops", href: "/products" }
    ],
    spotlightTitle: "Recommended Picks For You",
    deals: [
      {
        id: "samsung-galaxy-s26-ultra",
        name: "Samsung Galaxy S26 Ultra 5G (Titanium Silver)",
        subName: "16GB RAM • 512GB Storage • Galaxy AI",
        monthlyEmi: "At ₹11,666/mo",
        topTag: "★ Top Pick Based on Your Interests",
        startingPrice: "₹1,39,999",
        mrp: "₹1,49,999",
        discount: "7% OFF",
        features: ["Snapdragon 8 Elite", "200MP Quad AI Pro", "Titanium Hinge"],
        image: "/products/samsung-galaxy-s26-ultra.jpg",
        link: "/products/samsung-s26-ultra",
        accentBadge: "Personalized Top Pick"
      },
      {
        id: "iphone-16-pro-max",
        name: "Apple iPhone 16 Pro Max (Natural Titanium)",
        subName: "256GB • A18 Pro Chip • 48MP Fusion",
        monthlyEmi: "At ₹11,241/mo",
        topTag: "★ Trending Recommendation",
        startingPrice: "₹1,34,900",
        mrp: "₹1,44,900",
        discount: "7% OFF",
        features: ["A18 Pro Hexa-Core", "Camera Control Button", "Super Retina XDR"],
        image: "/products/iphone-16-pro-max.png",
        link: "/products/iphone-16-pro-max",
        accentBadge: "Top Pick"
      },
      {
        id: "anker-65w-gan",
        name: "Anker 65W GaN Fast Wall Charger",
        subName: "3-Port Type-C PD 3.0 Fast Charge",
        monthlyEmi: "At ₹483/mo",
        topTag: "★ Popular Accessories Pick",
        startingPrice: "₹2,899",
        mrp: "₹4,999",
        discount: "42% OFF",
        features: ["GaNPrime Tech", "65W Max Output", "Multi-Device"],
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Mobile%20Accessories&search=Anker",
        accentBadge: "Essential Accessory"
      },
      {
        id: "noise-colorfit-ultra",
        name: "Noise ColorFit Pro 5 Max AMOLED Smartwatch",
        subName: "1.96-inch AMOLED • BT Calling • Stainless Steel",
        monthlyEmi: "At ₹499/mo",
        topTag: "★ Smart Wearable Match",
        startingPrice: "₹2,999",
        mrp: "₹6,999",
        discount: "57% OFF",
        features: ["1.96\" AMOLED", "Single-Chip BT 5.3", "Rapid SOS"],
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Smart%20Technology",
        accentBadge: "Lifestyle Wearable"
      }
    ]
  },

  mobiles: {
    storeTitle: "📱 Mobiles Store",
    parentCategory: { name: "< Electronics & Devices", href: "/products" },
    categoryHeading: "Mobiles & Accessories",
    subNavLinks: [
      { label: "All Smartphones", href: "/products?category=Mobiles" },
      { label: "Mobile Accessories", href: "/products?category=Mobile%20Accessories" },
      { label: "Refurbished Mobiles", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles" },
      { label: "Laptops & Tablets", href: "/products?category=Computers%20%26%20Tablets" },
      { label: "Smartwatches", href: "/products?category=Smart%20Technology" },
      { label: "Audio & Earbuds", href: "/products?category=TV%20%26%20Audio" },
      { label: "Screen Replacement", href: "/services/display-replacement" },
    ],
    categoryTree: [
      { name: "Smartphones & Flagships", href: "/products?category=Mobiles", bold: true },
      { name: "Certified Refurbished", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles" },
      { name: "Fast Chargers & MagSafe", href: "/products?category=Mobile%20Accessories" },
      { name: "Cases & 9H Glass", href: "/products?category=Mobile%20Accessories" },
      { name: "Smartwatches & Wearables", href: "/products?category=Smart%20Technology" },
    ],
    brands: [
      { name: "Samsung Galaxy", query: "Samsung" },
      { name: "Apple iPhone", query: "Apple" },
      { name: "OnePlus", query: "OnePlus" },
      { name: "Google Pixel", query: "Pixel" },
      { name: "Vivo", query: "Vivo" },
      { name: "Motorola", query: "Motorola" },
      { name: "Realme", query: "realme" },
      { name: "Xiaomi / Redmi", query: "Redmi" },
      { name: "Nothing Phone", query: "Nothing" },
      { name: "iQOO", query: "iQOO" },
    ],
    bannerBadge: "✨ GRAND FESTIVAL OFFERS",
    bannerHeadline: "Smartphones at Best Price.",
    bannerHighlight: "Instant Bank Discounts & No Cost EMI",
    bannerTagline: "100% Brand Sealed • 1-Year Official Warranty • Same-Day Doorstep Delivery",
    bannerHeroImg: "/products/samsung-galaxy-s26-ultra.jpg",
    bannerPills: [
      { label: "🎧 Accessories", href: "/products?category=Mobile%20Accessories" },
      { label: "📱 Galaxy S26 Ultra 5G", href: "/products/samsung-s26-ultra" },
    ],
    spotlightTitle: "Spotlight Smartphone Deals",
    deals: [
      {
        id: "vivo-t5-pro-5g",
        name: "vivo T5 Pro 5G",
        subName: "8GB RAM • 256GB Storage",
        monthlyEmi: "At ₹2,583/mo",
        topTag: "★ Flat ₹24,000 Off • Sony OIS Camera",
        startingPrice: "₹30,999*",
        mrp: "₹55,999",
        discount: "45% OFF",
        features: ["Sony OIS Camera", "5500mAh Battery", "120Hz 3D Curved AMOLED"],
        image: "/products/samsung-galaxy-s26-ultra.jpg",
        link: "/products?category=Mobiles&search=Vivo",
        accentBadge: "Vivo Festive Deal"
      },
      {
        id: "note-15-se-5g",
        name: "Note 15 SE 5G",
        subName: "8GB RAM • 128GB Storage",
        monthlyEmi: "At ₹1,916/mo",
        topTag: "★ Best Seller Deal • 200MP OIS",
        startingPrice: "₹22,999*",
        mrp: "₹34,999",
        discount: "34% OFF",
        features: ["200MP OIS Camera", "120W HyperCharge", "1.5K AMOLED"],
        image: "/products/samsung-galaxy-s25-ultra.png",
        link: "/products?category=Mobiles&search=Redmi",
        accentBadge: "Redmi Note Deal"
      },
      {
        id: "phone-4b",
        name: "Phone (4b)",
        subName: "8GB RAM • 256GB Glyph Edition",
        monthlyEmi: "At ₹2,166/mo",
        topTag: "★ Glyph Interface 2.0 • 50MP Dual",
        startingPrice: "₹25,999*",
        mrp: "₹54,999",
        discount: "52% OFF",
        features: ["Glyph Interface", "Dimensity 7350 Pro", "Nothing OS 3.0"],
        image: "/products/google-pixel-9-pro-xl.png",
        link: "/products?category=Mobiles&search=Nothing",
        accentBadge: "Nothing Deal"
      },
      {
        id: "motorola-signature",
        name: "motorola Signature",
        subName: "16GB RAM • 512GB Pantone Edition",
        monthlyEmi: "At ₹4,791/mo",
        topTag: "★ Snapdragon 8s Gen 3 • 125W Turbo",
        startingPrice: "₹57,499*",
        mrp: "₹74,999",
        discount: "23% OFF",
        features: ["Pantone Colors", "125W TurboPower", "144Hz pOLED"],
        image: "/products/samsung-galaxy-s26-ultra.jpg",
        link: "/products?category=Mobiles&search=Motorola",
        accentBadge: "Motorola Signature"
      },
      {
        id: "realme-p4x-5g",
        name: "realme P4x 5G",
        subName: "8GB RAM • 128GB Phoenix Design",
        monthlyEmi: "At ₹1,833/mo",
        topTag: "★ Dimensity 7050 • 120Hz Ultra Smooth",
        startingPrice: "₹21,999*",
        mrp: "₹38,999",
        discount: "43% OFF",
        features: ["50MP Sony LYT", "45W SUPERVOOC", "Rainwater Smart Touch"],
        image: "/products/iphone-16-pro-max.png",
        link: "/products?category=Mobiles&search=realme",
        accentBadge: "Realme P-Series"
      },
      {
        id: "iphone-16-pro-max",
        name: "Apple iPhone 16 Pro Max",
        subName: "256GB • Natural Titanium",
        monthlyEmi: "At ₹11,241/mo",
        topTag: "★ Instant ₹5,000 Bank Card Discount",
        startingPrice: "₹1,34,900*",
        mrp: "₹1,44,900",
        discount: "7% OFF",
        features: ["A18 Pro Chip", "48MP Fusion Camera", "Camera Control Button"],
        image: "/products/iphone-16-pro-max.png",
        link: "/products/iphone-16-pro-max",
        accentBadge: "Official Apple"
      },
      {
        id: "samsung-s26-ultra",
        name: "Samsung Galaxy S26 Ultra 5G",
        subName: "16GB RAM • 512GB Storage",
        monthlyEmi: "At ₹10,833/mo",
        topTag: "★ Flat ₹10,000 Exchange Bonus + Free Buds",
        startingPrice: "₹1,29,999*",
        mrp: "₹1,49,999",
        discount: "13% OFF",
        features: ["200MP AI Pro Zoom", "S-Pen Built-in", "Grade 5 Titanium"],
        image: "/products/samsung-galaxy-s25-ultra.png",
        link: "/products/samsung-s26-ultra",
        accentBadge: "Samsung Flagship"
      },
      {
        id: "oneplus-12-flagship",
        name: "OnePlus 12 5G Flagship",
        subName: "16GB RAM • 512GB Silky Black",
        monthlyEmi: "At ₹4,999/mo",
        topTag: "★ Snapdragon 8 Gen 3 • 100W SuperVOOC",
        startingPrice: "₹59,999*",
        mrp: "₹69,999",
        discount: "14% OFF",
        features: ["Snapdragon 8 Gen 3", "Hasselblad Camera", "100W SuperVOOC"],
        image: "/products/google-pixel-9-pro-xl.png",
        link: "/products?category=Mobiles&search=OnePlus",
        accentBadge: "OnePlus Flagship"
      }
    ]
  },

  accessories: {
    storeTitle: "🔌 Accessories Store",
    parentCategory: { name: "< Mobiles & Devices", href: "/products?category=Mobiles" },
    categoryHeading: "Mobile Accessories & Power Gear",
    subNavLinks: [
      { label: "All Accessories", href: "/products?category=Mobile%20Accessories" },
      { label: "Fast Chargers", href: "/products?category=Mobile%20Accessories&search=Charger" },
      { label: "MagSafe & Wireless", href: "/products?category=Mobile%20Accessories&search=MagSafe" },
      { label: "Armor Cases", href: "/products?category=Mobile%20Accessories&search=Case" },
      { label: "9H Screen Glass", href: "/products?category=Mobile%20Accessories&search=Glass" },
      { label: "Power Banks", href: "/products?category=Mobile%20Accessories&search=PowerBank" },
      { label: "Braided Cables", href: "/products?category=Mobile%20Accessories&search=Cable" }
    ],
    categoryTree: [
      { name: "GaN Fast Wall Chargers", href: "/products?category=Mobile%20Accessories&search=Charger", bold: true },
      { name: "Magnetic MagSafe Cases", href: "/products?category=Mobile%20Accessories&search=MagSafe" },
      { name: "9H Tempered Screen Guards", href: "/products?category=Mobile%20Accessories&search=Glass" },
      { name: "65W High-Capacity Powerbanks", href: "/products?category=Mobile%20Accessories&search=PowerBank" },
      { name: "Braided Type-C & Lightning Cables", href: "/products?category=Mobile%20Accessories&search=Cable" }
    ],
    brands: [
      { name: "Anker", query: "Anker" },
      { name: "Spigen", query: "Spigen" },
      { name: "Belkin", query: "Belkin" },
      { name: "boAt", query: "boAt" },
      { name: "Ambrane", query: "Ambrane" },
      { name: "Baseus", query: "Baseus" },
      { name: "Apple MagSafe", query: "Apple" },
      { name: "Portronics", query: "Portronics" }
    ],
    bannerBadge: "⚡ FAST CHARGE CARNIVAL",
    bannerHeadline: "GaN Chargers, MagSafe & Armor Cases.",
    bannerHighlight: "Up to 70% Off on Premium Mobile Accessories",
    bannerTagline: "GaN 65W/120W Superfast Charging • Military Drop Protection • 100% Original Brand Assured",
    bannerHeroImg: "/products/samsung-galaxy-s26-ultra.jpg",
    bannerPills: [
      { label: "⚡ 65W GaN Chargers", href: "/products?category=Mobile%20Accessories&search=Charger" },
      { label: "🛡️ MagSafe Armor Cases", href: "/products?category=Mobile%20Accessories&search=Case" }
    ],
    spotlightTitle: "Spotlight Accessories & Power Deals",
    deals: [
      {
        id: "anker-65w-gan",
        name: "Anker 65W GaN Fast Charger 3-Port",
        subName: "Type-C PD 3.0 • Multi-Device Fast Charge",
        monthlyEmi: "At ₹483/mo",
        topTag: "★ Flat 42% OFF • 18-Month Replacement Warranty",
        startingPrice: "₹2,899",
        mrp: "₹4,999",
        discount: "42% OFF",
        features: ["GaNPrime Tech", "65W Max Output", "Ultra Compact"],
        image: "/products/samsung-galaxy-s26-ultra.jpg",
        link: "/products?category=Mobile%20Accessories&search=Anker",
        accentBadge: "Super Fast 65W"
      },
      {
        id: "spigen-magsafe-case",
        name: "Spigen Ultra Hybrid MagSafe Case",
        subName: "Crystal Clear • Military Drop Certified",
        monthlyEmi: "Special Price",
        topTag: "★ Anti-Yellowing Technology • Strong Magnetic Lock",
        startingPrice: "₹1,499",
        mrp: "₹2,499",
        discount: "40% OFF",
        features: ["Air Cushion Tech", "Strong MagSafe", "Raised Lip Protection"],
        image: "/products/iphone-16-pro-max.png",
        link: "/products?category=Mobile%20Accessories&search=Spigen",
        accentBadge: "Drop Protection"
      },
      {
        id: "ambrane-20000-powerbank",
        name: "Ambrane 20000mAh 65W Powerbank",
        subName: "Laptop & Phone Fast Charging",
        monthlyEmi: "At ₹366/mo",
        topTag: "★ Multi-Layer Chipset Protection • Fast Recharge",
        startingPrice: "₹2,199",
        mrp: "₹3,999",
        discount: "45% OFF",
        features: ["65W Fast Output", "20000mAh Huge Capacity", "Digital Display"],
        image: "/products/google-pixel-9-pro-xl.png",
        link: "/products?category=Mobile%20Accessories&search=PowerBank",
        accentBadge: "20,000mAh"
      },
      {
        id: "apple-magsafe-charger",
        name: "Apple Official MagSafe Charger",
        subName: "15W Magnetic Wireless Charging",
        monthlyEmi: "At ₹633/mo",
        topTag: "★ Official Apple Store Warranty • Fast Wireless",
        startingPrice: "₹3,799",
        mrp: "₹4,500",
        discount: "15% OFF",
        features: ["Perfect Alignment", "15W Fast Charge", "Braided Cable"],
        image: "/products/iphone-16-pro-max.png",
        link: "/products?category=Mobile%20Accessories&search=Apple",
        accentBadge: "Official Apple"
      }
    ]
  },

  refurbished: {
    storeTitle: "♻️ Refurbished Store",
    parentCategory: { name: "< Certified Devices", href: "/products?category=Mobiles" },
    categoryHeading: "Certified Refurbished Mobiles",
    subNavLinks: [
      { label: "All Refurbished", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles" },
      { label: "Refurbished iPhones", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=iPhone" },
      { label: "Refurbished Samsung", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=Samsung" },
      { label: "Flagships Under ₹30k", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles&price=10k-25k" },
      { label: "Refurbished OnePlus", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=OnePlus" },
      { label: "6-Month Warranty", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles" }
    ],
    categoryTree: [
      { name: "Superb Grade (Like New)", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles", bold: true },
      { name: "Certified Apple iPhones", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=iPhone" },
      { name: "Samsung Galaxy Ultra Series", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=Samsung" },
      { name: "OnePlus Performance 5G", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=OnePlus" },
      { name: "Budget 5G Under ₹15,000", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles&price=under-10k" }
    ],
    brands: [
      { name: "Apple", query: "Apple" },
      { name: "Samsung", query: "Samsung" },
      { name: "OnePlus", query: "OnePlus" },
      { name: "Google Pixel", query: "Pixel" },
      { name: "Xiaomi", query: "Xiaomi" },
      { name: "Realme", query: "Realme" },
      { name: "Vivo", query: "Vivo" },
      { name: "iQOO", query: "iQOO" }
    ],
    bannerBadge: "♻️ 32-POINT QUALITY CERTIFIED",
    bannerHeadline: "Flagships at Fraction of the Price.",
    bannerHighlight: "Tested Battery 85%+ • 6-Month Warranty",
    bannerTagline: "100% Genuine OEM Parts • Easy 7-Day Replacement • Free Fast Delivery",
    bannerHeroImg: "/products/iphone-16-pro-max.png",
    bannerPills: [
      { label: "🍏 Like-New iPhones", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=iPhone" },
      { label: "🛡️ 6-Month Free Warranty", href: "/products?category=Old%20%2F%20Refurbished%20Mobiles" }
    ],
    spotlightTitle: "Spotlight Certified Refurbished Deals",
    deals: [
      {
        id: "refurb-iphone-14",
        name: "Apple iPhone 14 128GB (Like New)",
        subName: "Blue • 88%+ Battery Health",
        monthlyEmi: "At ₹3,333/mo",
        topTag: "★ 6-Month Replacement Warranty • Grade A+ Superb",
        startingPrice: "₹39,999",
        mrp: "₹69,900",
        discount: "43% OFF",
        features: ["OLED Super Retina", "A15 Bionic", "Cinematic 4K"],
        image: "/products/iphone-16-pro-max.png",
        link: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=iPhone%2014",
        accentBadge: "Like-New Condition"
      },
      {
        id: "refurb-s23",
        name: "Samsung Galaxy S23 5G 128GB",
        subName: "Phantom Black • Certified Refurbished",
        monthlyEmi: "At ₹3,083/mo",
        topTag: "★ 120Hz Dynamic AMOLED • Flagship Snapdragon 8 Gen 2",
        startingPrice: "₹36,999",
        mrp: "₹74,999",
        discount: "51% OFF",
        features: ["50MP Nightography", "Gorilla Glass Victus 2", "Galaxy AI Ready"],
        image: "/products/samsung-galaxy-s25-ultra.png",
        link: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=Samsung%20S23",
        accentBadge: "Superb Grade A+"
      },
      {
        id: "refurb-oneplus-11r",
        name: "OnePlus 11R 5G (16GB RAM / 256GB)",
        subName: "Galactic Silver • Excellent Condition",
        monthlyEmi: "At ₹1,916/mo",
        topTag: "★ 100W SUPERVOOC Fast Charging • 16GB Huge RAM",
        startingPrice: "₹22,999",
        mrp: "₹39,999",
        discount: "42% OFF",
        features: ["120Hz Super Fluid Display", "Snapdragon 8+ Gen 1", "50MP Sony IMX890"],
        image: "/products/google-pixel-9-pro-xl.png",
        link: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=OnePlus%2011R",
        accentBadge: "Performance Monster"
      },
      {
        id: "refurb-pixel-7-pro",
        name: "Google Pixel 7 Pro 128GB",
        subName: "Hazel • Studio-Grade Camera",
        monthlyEmi: "At ₹2,499/mo",
        topTag: "★ Google Tensor G2 • Best-in-Class Telephoto Zoom",
        startingPrice: "₹29,999",
        mrp: "₹84,999",
        discount: "65% OFF",
        features: ["Google AI Magic Eraser", "30x Super Res Zoom", "QHD+ 120Hz OLED"],
        image: "/products/google-pixel-9.png",
        link: "/products?category=Old%20%2F%20Refurbished%20Mobiles&search=Pixel%207%20Pro",
        accentBadge: "Best Camera Deal"
      }
    ]
  },

  fashion: {
    storeTitle: "👗 Fashion Store",
    parentCategory: { name: "< All Departments", href: "/products" },
    categoryHeading: "Fashion & Lifestyle",
    subNavLinks: [
      { label: "All Fashion", href: "/products?category=Fashion" },
      { label: "Men's Wear", href: "/products?category=Fashion&search=Men" },
      { label: "Women's Ethnic", href: "/products?category=Fashion&search=Women" },
      { label: "Footwear & Sneakers", href: "/products?category=Fashion&search=Shoes" },
      { label: "Luxury Watches", href: "/products?category=Fashion&search=Watch" },
      { label: "Handbags & Wallets", href: "/products?category=Fashion&search=Bag" },
      { label: "Sunglasses", href: "/products?category=Fashion&search=Glasses" }
    ],
    categoryTree: [
      { name: "Men's Shirts, T-Shirts & Jeans", href: "/products?category=Fashion&search=Men", bold: true },
      { name: "Women's Sarees, Kurtas & Dresses", href: "/products?category=Fashion&search=Women" },
      { name: "Running & Lifestyle Sneakers", href: "/products?category=Fashion&search=Sneaker" },
      { name: "Analog & Chronograph Watches", href: "/products?category=Fashion&search=Watch" },
      { name: "Designer Handbags & Wallets", href: "/products?category=Fashion&search=Bag" }
    ],
    brands: [
      { name: "Zara", query: "Zara" },
      { name: "Levi's", query: "Levi" },
      { name: "Nike", query: "Nike" },
      { name: "Puma", query: "Puma" },
      { name: "Allen Solly", query: "Allen Solly" },
      { name: "Tommy Hilfiger", query: "Tommy" },
      { name: "Fossil", query: "Fossil" },
      { name: "Ray-Ban", query: "Ray-Ban" }
    ],
    bannerBadge: "👗 GRAND FASHION CARNIVAL",
    bannerHeadline: "Trendsetting Styles & Wardrobe Upgrades.",
    bannerHighlight: "Flat 50% - 80% OFF on Top Designer Brands",
    bannerTagline: "100% Original Brand Assured • Easy 7-Day Free Returns • Fast Doorstep Delivery",
    bannerHeroImg: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600",
    bannerPills: [
      { label: "👟 Trending Sneakers", href: "/products?category=Fashion&search=Sneakers" },
      { label: "⌚ Luxury Watches", href: "/products?category=Fashion&search=Watch" }
    ],
    spotlightTitle: "Spotlight Fashion & Designer Steals",
    deals: [
      {
        id: "levis-511-jeans",
        name: "Levi's 511 Slim Fit Premium Jeans",
        subName: "Dark Indigo Stretch Denim",
        monthlyEmi: "Flat 52% OFF",
        topTag: "★ 100% Genuine Levi's • Pure Cotton Stretch Comfort",
        startingPrice: "₹2,199",
        mrp: "₹4,599",
        discount: "52% OFF",
        features: ["Slim Fit", "Durable Stitching", "Classic 5-Pocket"],
        image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Fashion&search=Levis",
        accentBadge: "Bestseller Denim"
      },
      {
        id: "nike-air-max",
        name: "Nike Air Max Lifestyle Sneakers",
        subName: "Cushioned Air Sole • Breathable Mesh",
        monthlyEmi: "At ₹833/mo",
        topTag: "★ High Responsive Cushioning • Iconic Streetwear Design",
        startingPrice: "₹4,999",
        mrp: "₹8,995",
        discount: "44% OFF",
        features: ["Max Air Unit", "Ultra Lightweight", "Grippy Rubber Outsole"],
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Fashion&search=Nike",
        accentBadge: "Trending Footwear"
      },
      {
        id: "fossil-gen6-watch",
        name: "Fossil Chronograph Leather Watch",
        subName: "Smoke Grey Dial • Genuine Brown Leather",
        monthlyEmi: "At ₹1,415/mo",
        topTag: "★ 2-Year International Warranty • Water Resistant 5ATM",
        startingPrice: "₹8,495",
        mrp: "₹18,495",
        discount: "54% OFF",
        features: ["Chronograph Dial", "Stainless Steel Bezel", "Mineral Glass"],
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Fashion&search=Fossil",
        accentBadge: "Luxury Collection"
      },
      {
        id: "rayban-aviator",
        name: "Ray-Ban Aviator Classic Polarized",
        subName: "Gold Frame • G-15 Green Lens (58mm)",
        monthlyEmi: "At ₹866/mo",
        topTag: "★ 100% UV400 Protection • Original Case Included",
        startingPrice: "₹5,200",
        mrp: "₹9,890",
        discount: "47% OFF",
        features: ["Crystal Lenses", "Iconic Teardrop Shape", "Glare Reduction"],
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Fashion&search=Ray-Ban",
        accentBadge: "Timeless Icon"
      }
    ]
  },

  jewellery: {
    storeTitle: "💎 Jewellery Store",
    parentCategory: { name: "< All Departments", href: "/products" },
    categoryHeading: "Precious Jewellery & Gold",
    subNavLinks: [
      { label: "All Jewellery", href: "/products?category=Jewellery" },
      { label: "22K Gold", href: "/products?category=Jewellery&search=Gold" },
      { label: "Solitaire Diamonds", href: "/products?category=Jewellery&search=Diamond" },
      { label: "Pure 925 Silver", href: "/products?category=Jewellery&search=Silver" },
      { label: "Bridal Sets", href: "/products?category=Jewellery&search=Bridal" },
      { label: "Gold Coins & Bars", href: "/products?category=Jewellery&search=Coin" },
      { label: "Daily Wear Earrings", href: "/products?category=Jewellery&search=Earrings" }
    ],
    categoryTree: [
      { name: "22K & 18K Hallmarked Gold", href: "/products?category=Jewellery&search=Gold", bold: true },
      { name: "IGI Certified Solitaire Diamonds", href: "/products?category=Jewellery&search=Diamond" },
      { name: "Sterling 925 Silver Collection", href: "/products?category=Jewellery&search=Silver" },
      { name: "Temple & Heritage Bridal Sets", href: "/products?category=Jewellery&search=Bridal" },
      { name: "24K 999 Purity Gold Coins", href: "/products?category=Jewellery&search=Coin" }
    ],
    brands: [
      { name: "Tanishq", query: "Tanishq" },
      { name: "Kalyan Jewellers", query: "Kalyan" },
      { name: "Malabar Gold", query: "Malabar" },
      { name: "GIVA", query: "GIVA" },
      { name: "Mia by Tanishq", query: "Mia" },
      { name: "Joyalukkas", query: "Joyalukkas" },
      { name: "CaratLane", query: "CaratLane" },
      { name: "Senco Gold", query: "Senco" }
    ],
    bannerBadge: "💎 100% BIS HALLMARKED",
    bannerHeadline: "Pure Elegance & Eternal Sparkle.",
    bannerHighlight: "100% BIS Hallmarked Gold & Certified Diamonds",
    bannerTagline: "Zero Making Charges on Select Items • Insured Shipping • Lifetime Exchange Guarantee",
    bannerHeroImg: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600",
    bannerPills: [
      { label: "✨ 22K Gold Collection", href: "/products?category=Jewellery&search=Gold" },
      { label: "💍 Solitaire Rings", href: "/products?category=Jewellery&search=Diamond" }
    ],
    spotlightTitle: "Spotlight Precious Jewellery Deals",
    deals: [
      {
        id: "temple-gold-necklace",
        name: "22K Royal Temple Gold Choker Necklace",
        subName: "Antique Finish • BIS Hallmarked 916",
        monthlyEmi: "At ₹5,750/mo",
        topTag: "★ Lifetime Buyback Guarantee • Free Insured Delivery",
        startingPrice: "₹68,999",
        mrp: "₹82,000",
        discount: "16% OFF",
        features: ["22K 916 Hallmarked", "Handcrafted Heritage", "Tamper-Proof Seal"],
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Jewellery&search=Necklace",
        accentBadge: "BIS Hallmarked"
      },
      {
        id: "giva-silver-ring",
        name: "GIVA 925 Sterling Silver Solitaire Ring",
        subName: "Rhodium Plated • AAA+ Grade Zirconia",
        monthlyEmi: "Top Rated",
        topTag: "★ Anti-Tarnish Coating • Certificate of Authenticity Included",
        startingPrice: "₹1,899",
        mrp: "₹3,499",
        discount: "46% OFF",
        features: ["Pure 925 Silver", "Adjustable Fit", "Gift Box Packaging"],
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Jewellery&search=GIVA",
        accentBadge: "Pure 925 Silver"
      },
      {
        id: "diamond-stud-earrings",
        name: "18K Real Diamond Floral Stud Earrings",
        subName: "SI-GH Clarity • IGI Certified Natural Diamonds",
        monthlyEmi: "At ₹2,041/mo",
        topTag: "★ Flat 23% OFF • Zero Making Charge Promo",
        startingPrice: "₹24,500",
        mrp: "₹32,000",
        discount: "23% OFF",
        features: ["IGI Certified", "Screw-Back Safety", "Daily Wear Elegant"],
        image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Jewellery&search=Diamond%20Earrings",
        accentBadge: "IGI Certified"
      },
      {
        id: "gold-coin-5g",
        name: "24K (999) 5 Gram Gold Minted Bar / Coin",
        subName: "Lakshmi Motif • CertiCard Packing",
        monthlyEmi: "Investment Grade",
        topTag: "★ 99.9% Pure Gold • 0% Making Charge Direct Mint",
        startingPrice: "₹37,500",
        mrp: "₹40,000",
        discount: "6% OFF",
        features: ["24 Karat 999 Purity", "Tamper-Proof Blister", "Assay Certified"],
        image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Jewellery&search=Gold%20Coin",
        accentBadge: "Investment Grade"
      }
    ]
  },

  ev: {
    storeTitle: "⚡ EV Vehicles Store",
    parentCategory: { name: "< Green Mobility", href: "/products" },
    categoryHeading: "Electric Vehicles & Smart Mobility",
    subNavLinks: [
      { label: "All EV Scooters", href: "/products?category=EV%20Vehicles" },
      { label: "High Speed 90km/h+", href: "/products?category=EV%20Vehicles&search=Speed" },
      { label: "Long Range 150km+", href: "/products?category=EV%20Vehicles&search=Range" },
      { label: "Home Fast Chargers", href: "/products?category=EV%20Vehicles&search=Charger" },
      { label: "Smart Helmets & Gear", href: "/products?category=EV%20Vehicles&search=Helmet" },
      { label: "5-Year Warranty", href: "/products?category=EV%20Vehicles" }
    ],
    categoryTree: [
      { name: "Performance Smart Scooters", href: "/products?category=EV%20Vehicles", bold: true },
      { name: "Long Range Commuters (150km+)", href: "/products?category=EV%20Vehicles" },
      { name: "Portable & Removable Battery Scooters", href: "/products?category=EV%20Vehicles" },
      { name: "Level 2 Home Fast Charging Stations", href: "/products?category=EV%20Vehicles&search=Charger" },
      { name: "Certified Riding Helmets & Smart Locks", href: "/products?category=EV%20Vehicles&search=Helmet" }
    ],
    brands: [
      { name: "Ather Energy", query: "Ather" },
      { name: "Ola Electric", query: "Ola" },
      { name: "TVS iQube", query: "TVS" },
      { name: "Bajaj Chetak", query: "Chetak" },
      { name: "Hero Vida", query: "Vida" },
      { name: "Simple Energy", query: "Simple" },
      { name: "River EV", query: "River" },
      { name: "Revolt", query: "Revolt" }
    ],
    bannerBadge: "⚡ ZERO EMISSION REVOLUTION",
    bannerHeadline: "Zero Fuel. Pure Performance. Next-Gen EVs.",
    bannerHighlight: "Up to ₹22,000 State Subsidy + ₹0 Down Payment EMI",
    bannerTagline: "Free Home Installation • 5-Year Battery Warranty • 24/7 Roadside Assistance",
    bannerHeroImg: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
    bannerPills: [
      { label: "🛵 150km+ Range Scooters", href: "/products?category=EV%20Vehicles" },
      { label: "⚡ 7.4kW Fast Chargers", href: "/products?category=EV%20Vehicles&search=Charger" }
    ],
    spotlightTitle: "Spotlight Electric Vehicle Deals",
    deals: [
      {
        id: "ather-450x",
        name: "Ather 450X Gen 3 Pro 3.7kWh",
        subName: "90km/h Top Speed • 146km TrueRange",
        monthlyEmi: "At ₹3,499/mo",
        topTag: "★ Free Home Fast Charger + 5-Year Battery Protect Plan",
        startingPrice: "₹1,38,000",
        mrp: "₹1,58,000",
        discount: "13% OFF",
        features: ["Google Maps Onboard", "Warp Mode Acceleration", "IP67 Water Resistance"],
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=EV%20Vehicles&search=Ather",
        accentBadge: "Hyperdrive 90km/h"
      },
      {
        id: "ola-s1-pro",
        name: "Ola S1 Pro Gen 2 (195km Range)",
        subName: "11kW Peak Motor • 120km/h Top Speed",
        monthlyEmi: "At ₹3,199/mo",
        topTag: "★ 0% Processing Fee • MoveOS 4 Party Mode & Cruise Control",
        startingPrice: "₹1,24,999",
        mrp: "₹1,47,999",
        discount: "15% OFF",
        features: ["195km Certified Range", "34L Boot Space", "Twin Speakers"],
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=EV%20Vehicles&search=Ola",
        accentBadge: "Long Range 195km"
      },
      {
        id: "tvs-iqube-st",
        name: "TVS iQube Electric ST SmartX",
        subName: "5.1kWh Battery • 150km Range",
        monthlyEmi: "At ₹2,999/mo",
        topTag: "★ Trusted TVS Reliability • 7-inch Touchscreen Navigation",
        startingPrice: "₹1,18,500",
        mrp: "₹1,35,000",
        discount: "12% OFF",
        features: ["Flipkey Smart Entry", "Regenerative Braking", "USB Fast Charge"],
        image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=EV%20Vehicles&search=TVS",
        accentBadge: "Family Comfort"
      },
      {
        id: "smart-ev-charger",
        name: "Smart 7.4kW Wallbox Fast EV Charger",
        subName: "Type 2 Universal • App-Enabled Smart Schedule",
        monthlyEmi: "At ₹1,583/mo",
        topTag: "★ 3X Faster Home Charging • IP65 Weatherproof Enclosure",
        startingPrice: "₹18,999",
        mrp: "₹28,000",
        discount: "32% OFF",
        features: ["7.4kW High Speed", "RFID & Mobile App", "Surge Protection"],
        image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=EV%20Vehicles&search=Charger",
        accentBadge: "Fast Home Charger"
      }
    ]
  },

  laptops: {
    storeTitle: "🖥️ Laptops & Tech Store",
    parentCategory: { name: "< Electronics & Devices", href: "/products" },
    categoryHeading: "Computers, Laptops & Tablets",
    subNavLinks: [
      { label: "All Laptops", href: "/products?category=Computers%20%26%20Tablets" },
      { label: "MacBooks", href: "/products?category=Computers%20%26%20Tablets&search=MacBook" },
      { label: "Gaming RTX Laptops", href: "/products?category=Computers%20%26%20Tablets&search=Gaming" },
      { label: "iPads & Tablets", href: "/products?category=Computers%20%26%20Tablets&search=Tablet" },
      { label: "4K Monitors", href: "/products?category=Computers%20%26%20Tablets&search=Monitor" },
      { label: "SSD & Storage", href: "/products?category=Computers%20%26%20Tablets&search=SSD" }
    ],
    categoryTree: [
      { name: "Thin & Light Intel Core Ultra Laptops", href: "/products?category=Computers%20%26%20Tablets", bold: true },
      { name: "NVIDIA RTX 40-Series Gaming Rigs", href: "/products?category=Computers%20%26%20Tablets&search=Gaming" },
      { name: "Apple M3 Silicon MacBooks & iPads", href: "/products?category=Computers%20%26%20Tablets&search=Apple" },
      { name: "Professional 4K Color-Accurate Monitors", href: "/products?category=Computers%20%26%20Tablets&search=Monitor" },
      { name: "High Speed NVMe SSDs & RAM Upgrades", href: "/products?category=Computers%20%26%20Tablets&search=SSD" }
    ],
    brands: [
      { name: "Apple", query: "Apple" },
      { name: "Dell", query: "Dell" },
      { name: "HP", query: "HP" },
      { name: "Lenovo", query: "Lenovo" },
      { name: "ASUS ROG", query: "ASUS" },
      { name: "Acer", query: "Acer" },
      { name: "MSI", query: "MSI" },
      { name: "Samsung Galaxy Book", query: "Samsung" }
    ],
    bannerBadge: "💻 PRO COMPUTING FESTIVAL",
    bannerHeadline: "Unleash Extreme Computing Power.",
    bannerHighlight: "Intel Core Ultra & Apple M3 • Up to ₹15,000 Exchange Bonus",
    bannerTagline: "Genuine Windows 11 & Office Included • 1-Year Onsite Warranty • No Cost EMI",
    bannerHeroImg: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
    bannerPills: [
      { label: "💻 Apple MacBook M3", href: "/products?category=Computers%20%26%20Tablets&search=MacBook" },
      { label: "🎮 RTX 4060 Gaming", href: "/products?category=Computers%20%26%20Tablets&search=Gaming" }
    ],
    spotlightTitle: "Spotlight Laptop & Tablet Deals",
    deals: [
      {
        id: "macbook-air-m3",
        name: "Apple MacBook Air M3 (16GB RAM / 512GB)",
        subName: "13.6-inch Liquid Retina • Midnight Black",
        monthlyEmi: "At ₹9,575/mo",
        topTag: "★ Flat ₹10,000 Bank Card Discount • 18-Hour Battery Life",
        startingPrice: "₹1,14,900",
        mrp: "₹1,34,900",
        discount: "15% OFF",
        features: ["Apple M3 Chip", "MagSafe Charging", "Fanless Silent Design"],
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Computers%20%26%20Tablets&search=MacBook",
        accentBadge: "Apple M3 Power"
      },
      {
        id: "asus-rog-strix",
        name: "ASUS ROG Strix G16 RTX 4060 Gaming",
        subName: "Intel i7 14th Gen • 16GB DDR5 • 1TB NVMe",
        monthlyEmi: "At ₹8,249/mo",
        topTag: "★ 240Hz Nebula Display • ROG Intelligent Cooling",
        startingPrice: "₹98,990",
        mrp: "₹1,36,990",
        discount: "28% OFF",
        features: ["RTX 4060 8GB GDDR6", "240Hz / 3ms QHD+", "RGB Per-Key Aura Sync"],
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Computers%20%26%20Tablets&search=ROG",
        accentBadge: "Pro Gaming Rig"
      },
      {
        id: "dell-inspiron-oled",
        name: "Dell Inspiron 14 OLED Intel Core Ultra 7",
        subName: "16GB LPDDR5X • 1TB SSD • 2.8K 90Hz OLED",
        monthlyEmi: "At ₹6,249/mo",
        topTag: "★ Intel AI Boost NPU • Free Office 2024 Lifetime",
        startingPrice: "₹74,990",
        mrp: "₹96,000",
        discount: "22% OFF",
        features: ["2.8K OLED 100% DCI-P3", "Intel AI Boost", "Backlit Keyboard"],
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Computers%20%26%20Tablets&search=Dell",
        accentBadge: "2.8K OLED Screen"
      },
      {
        id: "ipad-air-m2",
        name: "Apple iPad Air M2 11-inch Liquid Retina",
        subName: "128GB Wi-Fi • Space Grey • Landscape Camera",
        monthlyEmi: "At ₹4,491/mo",
        topTag: "★ Apple M2 Chip • Apple Pencil Pro Supported",
        startingPrice: "₹53,900",
        mrp: "₹59,900",
        discount: "10% OFF",
        features: ["Apple M2 Superchip", "All-Day Battery", "Touch ID Power Button"],
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Computers%20%26%20Tablets&search=iPad",
        accentBadge: "Apple M2 Tablet"
      }
    ]
  },

  electronics: {
    storeTitle: "⌚ Smart Tech & Gadgets Store",
    parentCategory: { name: "< Electronics & Devices", href: "/products" },
    categoryHeading: "Smart Technology & Wearables",
    subNavLinks: [
      { label: "All Smart Tech", href: "/products?category=Smart%20Technology" },
      { label: "Smartwatches", href: "/products?category=Smart%20Technology&search=Watch" },
      { label: "TWS ANC Earbuds", href: "/products?category=Smart%20Technology&search=Earbuds" },
      { label: "Smart Speakers", href: "/products?category=Smart%20Technology&search=Speaker" },
      { label: "Fitness Trackers", href: "/products?category=Smart%20Technology&search=Band" },
      { label: "Smart Security", href: "/products?category=Smart%20Technology&search=Camera" }
    ],
    categoryTree: [
      { name: "AMOLED Calling Smartwatches", href: "/products?category=Smart%20Technology&search=Watch", bold: true },
      { name: "Active Noise Cancelling (ANC) Earbuds", href: "/products?category=Smart%20Technology&search=Earbuds" },
      { name: "Alexa & Google Smart Home Hubs", href: "/products?category=Smart%20Technology&search=Smart" },
      { name: "Health & ECG Monitoring Wearables", href: "/products?category=Smart%20Technology&search=Health" }
    ],
    brands: [
      { name: "Apple Watch", query: "Apple" },
      { name: "Samsung Galaxy Watch", query: "Samsung" },
      { name: "Noise", query: "Noise" },
      { name: "boAt", query: "boAt" },
      { name: "Fire-Boltt", query: "Fire-Boltt" },
      { name: "Amazfit", query: "Amazfit" },
      { name: "Sony", query: "Sony" },
      { name: "JBL", query: "JBL" }
    ],
    bannerBadge: "⌚ SMART WEARABLES & AUDIO",
    bannerHeadline: "Connected Living & Wearable Tech.",
    bannerHighlight: "AMOLED Displays, ANC Audio & Smart Home Hubs",
    bannerTagline: "Official Brand Warranty • 100% Genuine • Free Express 1-Day Delivery",
    bannerHeroImg: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    bannerPills: [
      { label: "⌚ AMOLED Calling Watches", href: "/products?category=Smart%20Technology&search=Watch" },
      { label: "🎧 ANC Earbuds", href: "/products?category=Smart%20Technology&search=Earbuds" }
    ],
    spotlightTitle: "Spotlight Wearable & Smart Gadget Deals",
    deals: [
      {
        id: "apple-watch-10",
        name: "Apple Watch Series 10 GPS 46mm",
        subName: "Jet Black Aluminium • Sport Band",
        monthlyEmi: "At ₹3,741/mo",
        topTag: "★ Thinnest Apple Watch Ever • Sleep Apnea Detection",
        startingPrice: "₹44,900",
        mrp: "₹49,900",
        discount: "10% OFF",
        features: ["Wide-Angle OLED", "Fast Charging 80% in 30min", "ECG & Blood Oxygen"],
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Smart%20Technology&search=Apple%20Watch",
        accentBadge: "Official Apple"
      },
      {
        id: "galaxy-watch-ultra",
        name: "Samsung Galaxy Watch Ultra Titanium",
        subName: "47mm LTE • Cushion Design • 100hr Battery",
        monthlyEmi: "At ₹4,583/mo",
        topTag: "★ 10ATM + IP68 Rugged Titanium • Galaxy AI Health",
        startingPrice: "₹54,999",
        mrp: "₹69,999",
        discount: "21% OFF",
        features: ["Grade 4 Titanium", "Dual GPS Frequency", "Emergency Siren 86dB"],
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Smart%20Technology&search=Galaxy%20Watch",
        accentBadge: "Rugged Ultra"
      },
      {
        id: "sony-xm5",
        name: "Sony WH-1000XM5 Wireless ANC Headphones",
        subName: "Auto NC Optimizer • 30hr Battery Life",
        monthlyEmi: "At ₹2,082/mo",
        topTag: "★ Industry Leading Noise Cancellation • Hi-Res LDAC Audio",
        startingPrice: "₹24,990",
        mrp: "₹34,990",
        discount: "29% OFF",
        features: ["Integrated Processor V1", "8 Microphones ANC", "Speak-to-Chat"],
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Smart%20Technology&search=Sony",
        accentBadge: "Industry #1 ANC"
      },
      {
        id: "amazfit-balance",
        name: "Amazfit Balance AMOLED Smartwatch",
        subName: "1.5-inch HD AMOLED • Dual Band GPS • Zepp OS 4",
        monthlyEmi: "At ₹1,583/mo",
        topTag: "★ Body Composition Analysis • Bluetooth Calling & NFC",
        startingPrice: "₹18,999",
        mrp: "₹24,999",
        discount: "24% OFF",
        features: ["14-Day Battery", "AI Sleep Coach", "150+ Sports Modes"],
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Smart%20Technology&search=Amazfit",
        accentBadge: "AMOLED Bestseller"
      }
    ]
  },

  tv: {
    storeTitle: "📺 TV & Audio Store",
    parentCategory: { name: "< Electronics & Devices", href: "/products" },
    categoryHeading: "Smart TVs & Home Theater Audio",
    subNavLinks: [
      { label: "All TVs & Audio", href: "/products?category=TV%20%26%20Audio" },
      { label: "4K Smart TVs", href: "/products?category=TV%20%26%20Audio&search=4K" },
      { label: "QLED & OLED TVs", href: "/products?category=TV%20%26%20Audio&search=OLED" },
      { label: "Dolby Atmos Soundbars", href: "/products?category=TV%20%26%20Audio&search=Soundbar" },
      { label: "Party Speakers", href: "/products?category=TV%20%26%20Audio&search=Speaker" }
    ],
    categoryTree: [
      { name: "55-inch to 65-inch 4K Google TVs", href: "/products?category=TV%20%26%20Audio", bold: true },
      { name: "High Refresh Rate 120Hz Gaming TVs", href: "/products?category=TV%20%26%20Audio" },
      { name: "Dolby Atmos 5.1 Wireless Soundbars", href: "/products?category=TV%20%26%20Audio&search=Soundbar" },
      { name: "Smart Portable Full HD Projectors", href: "/products?category=TV%20%26%20Audio&search=Projector" }
    ],
    brands: [
      { name: "Sony Bravia", query: "Sony" },
      { name: "Samsung", query: "Samsung" },
      { name: "LG OLED", query: "LG" },
      { name: "TCL", query: "TCL" },
      { name: "Xiaomi TV", query: "Xiaomi" },
      { name: "JBL", query: "JBL" },
      { name: "Bose", query: "Bose" },
      { name: "Sonos", query: "Sonos" }
    ],
    bannerBadge: "📺 CINEMA AT HOME",
    bannerHeadline: "Cinematic 4K Visuals & Immersive Sound.",
    bannerHighlight: "Dolby Atmos, 120Hz VRR & Quantum Dot Displays",
    bannerTagline: "Free Professional Wall-Mount Installation • Extended 2-Year Panel Warranty",
    bannerHeroImg: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=600",
    bannerPills: [
      { label: "📺 55-inch 4K Smart TVs", href: "/products?category=TV%20%26%20Audio&search=55" },
      { label: "🔊 Dolby Atmos Soundbars", href: "/products?category=TV%20%26%20Audio&search=Soundbar" }
    ],
    spotlightTitle: "Spotlight Television & Soundbar Deals",
    deals: [
      {
        id: "sony-bravia-55",
        name: "Sony Bravia 55-inch 4K Ultra HD Smart Google TV",
        subName: "KD-55X74L • 4K Processor X1 • Live Color",
        monthlyEmi: "At ₹4,832/mo",
        topTag: "★ Free Standard Wall Installation • Dolby Audio 20W",
        startingPrice: "₹57,990",
        mrp: "₹99,900",
        discount: "42% OFF",
        features: ["X1 4K HDR Processor", "Google TV Voice Control", "Motionflow XR"],
        image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=TV%20%26%20Audio&search=Sony",
        accentBadge: "4K Sony Bravia"
      },
      {
        id: "lg-oled-55",
        name: "LG 55-inch OLED 4K Cinema TV (B4 Series)",
        subName: "α8 AI Processor 4K • 120Hz VRR • Dolby Vision",
        monthlyEmi: "At ₹9,165/mo",
        topTag: "★ Self-Lit Pixels • 0.1ms Response Time Gaming",
        startingPrice: "₹1,09,990",
        mrp: "₹1,79,990",
        discount: "39% OFF",
        features: ["Infinite Contrast OLED", "NVIDIA G-Sync", "webOS 24 5-Year Updates"],
        image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=TV%20%26%20Audio&search=LG",
        accentBadge: "Perfect OLED"
      },
      {
        id: "jbl-bar-500",
        name: "JBL Bar 500 Pro Dolby Atmos Soundbar 590W",
        subName: "5.1 Channel • 10-inch Wireless Subwoofer",
        monthlyEmi: "At ₹3,333/mo",
        topTag: "★ MultiBeam Surround Sound • Wi-Fi AirPlay & Alexa",
        startingPrice: "₹39,999",
        mrp: "₹59,999",
        discount: "33% OFF",
        features: ["590W Powerful Output", "10-inch Deep Bass Sub", "PureVoice Tech"],
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=TV%20%26%20Audio&search=JBL",
        accentBadge: "Dolby Atmos 590W"
      },
      {
        id: "samsung-65-crystal",
        name: "Samsung 65-inch Crystal 4K Vivid Pro",
        subName: "Crystal Processor 4K • PurColor • Q-Symphony",
        monthlyEmi: "At ₹5,249/mo",
        topTag: "★ 65-inch Giant Display • SolarCell Smart Remote",
        startingPrice: "₹62,990",
        mrp: "₹98,900",
        discount: "36% OFF",
        features: ["PurColor Dynamic Tone", "Q-Symphony Audio", "SmartThings IoT Hub"],
        image: "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=TV%20%26%20Audio&search=Samsung",
        accentBadge: "65-inch Giant 4K"
      }
    ]
  },

  appliances: {
    storeTitle: "🍳 Kitchen & Appliances Store",
    parentCategory: { name: "< All Departments", href: "/products" },
    categoryHeading: "Kitchen & Home Appliances",
    subNavLinks: [
      { label: "All Appliances", href: "/products?category=Kitchen%20Appliances" },
      { label: "Air Fryers", href: "/products?category=Kitchen%20Appliances&search=Air%20Fryer" },
      { label: "Mixer Grinders", href: "/products?category=Kitchen%20Appliances&search=Mixer" },
      { label: "Coffee Machines", href: "/products?category=Kitchen%20Appliances&search=Coffee" },
      { label: "Microwave Ovens", href: "/products?category=Kitchen%20Appliances&search=Microwave" },
      { label: "Water Purifiers", href: "/products?category=Kitchen%20Appliances&search=Purifier" }
    ],
    categoryTree: [
      { name: "Digital Touch Air Fryers & OTGs", href: "/products?category=Kitchen%20Appliances&search=Air%20Fryer", bold: true },
      { name: "1000W Heavy Duty Copper Motor Mixers", href: "/products?category=Kitchen%20Appliances&search=Mixer" },
      { name: "Espresso & Cappuccino Coffee Machines", href: "/products?category=Kitchen%20Appliances&search=Coffee" },
      { name: "RO+UV Active Copper Water Purifiers", href: "/products?category=Kitchen%20Appliances&search=Purifier" }
    ],
    brands: [
      { name: "Philips", query: "Philips" },
      { name: "Morphy Richards", query: "Morphy" },
      { name: "Instant Pot", query: "Instant Pot" },
      { name: "Prestige", query: "Prestige" },
      { name: "Bosch", query: "Bosch" },
      { name: "LG", query: "LG" },
      { name: "Havells", query: "Havells" },
      { name: "Kent", query: "Kent" }
    ],
    bannerBadge: "🍳 SMART KITCHEN FESTIVAL",
    bannerHeadline: "Smart Kitchen & Master Culinary Gear.",
    bannerHighlight: "Up to 55% Off on 5-Star Energy Star Appliances",
    bannerTagline: "100% Food Grade Materials • 2-Year Motor Warranty • Free Home Delivery",
    bannerHeroImg: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600",
    bannerPills: [
      { label: "🍟 XXL Air Fryers", href: "/products?category=Kitchen%20Appliances&search=Air%20Fryer" },
      { label: "☕ Espresso Makers", href: "/products?category=Kitchen%20Appliances&search=Coffee" }
    ],
    spotlightTitle: "Spotlight Kitchen & Home Deals",
    deals: [
      {
        id: "philips-air-fryer",
        name: "Philips Digital Air Fryer XXL 1400W",
        subName: "Rapid Air Tech • Touch Panel with 7 Presets",
        monthlyEmi: "At ₹749/mo",
        topTag: "★ Up to 90% Less Fat • Dishwasher Safe Basket",
        startingPrice: "₹8,999",
        mrp: "₹14,995",
        discount: "40% OFF",
        features: ["Rapid Air Technology", "Touchscreen Control", "Keep Warm Function"],
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Kitchen%20Appliances&search=Philips",
        accentBadge: "XXL Air Fryer"
      },
      {
        id: "morphy-espresso-maker",
        name: "Morphy Richards 15-Bar Espresso Maker",
        subName: "Stainless Steel Boiler • Milk Frothing Nozzle",
        monthlyEmi: "At ₹541/mo",
        topTag: "★ Authentic Italian Crema • Removable Drip Tray",
        startingPrice: "₹6,499",
        mrp: "₹11,995",
        discount: "46% OFF",
        features: ["15-Bar Powerful Pump", "High Pressure Frothing", "Overheat Protection"],
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Kitchen%20Appliances&search=Coffee",
        accentBadge: "Italian Espresso"
      },
      {
        id: "bosch-mixer-grinder",
        name: "Bosch Pro 1000W Heavy Duty Mixer Grinder",
        subName: "4 Stainless Steel Flow Breaker Jars",
        monthlyEmi: "At ₹583/mo",
        topTag: "★ 100% Pure Copper Winding Motor • Stone Pounding Effect",
        startingPrice: "₹6,999",
        mrp: "₹10,990",
        discount: "36% OFF",
        features: ["1000W HiFlux Motor", "Active Cooling Tech", "Ergonomic Handles"],
        image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Kitchen%20Appliances&search=Bosch",
        accentBadge: "1000W Heavy Duty"
      },
      {
        id: "instant-pot-duo",
        name: "Instant Pot Duo 7-in-1 Multi-Use Cooker",
        subName: "6 Litres Capacity • Stainless Steel Inner Pot",
        monthlyEmi: "At ₹624/mo",
        topTag: "★ 7 Appliances in 1 • 13 One-Touch Smart Programs",
        startingPrice: "₹7,499",
        mrp: "₹12,999",
        discount: "42% OFF",
        features: ["Pressure Cook & Slow Cook", "Sous Vide & Sauté", "10+ Safety Features"],
        image: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Kitchen%20Appliances&search=Instant%20Pot",
        accentBadge: "7-in-1 Smart Cook"
      }
    ]
  },

  default: {
    storeTitle: "🛒 Mega Store Carnival",
    parentCategory: { name: "< All Departments", href: "/products" },
    categoryHeading: "All Products & Great Festive Deals",
    subNavLinks: [
      { label: "All Products", href: "/products" },
      { label: "Mobiles", href: "/products?category=Mobiles" },
      { label: "Fashion", href: "/products?category=Fashion" },
      { label: "Jewellery", href: "/products?category=Jewellery" },
      { label: "EV Vehicles", href: "/products?category=EV%20Vehicles" },
      { label: "Accessories", href: "/products?category=Mobile%20Accessories" },
      { label: "Laptops", href: "/products?category=Computers%20%26%20Tablets" }
    ],
    categoryTree: [
      { name: "Mobiles & 5G Smartphones", href: "/products?category=Mobiles", bold: true },
      { name: "Trendy Fashion & Apparels", href: "/products?category=Fashion" },
      { name: "BIS Hallmarked Precious Jewellery", href: "/products?category=Jewellery" },
      { name: "Next-Gen Electric Scooters & EV", href: "/products?category=EV%20Vehicles" },
      { name: "High-Speed Chargers & Accessories", href: "/products?category=Mobile%20Accessories" }
    ],
    brands: [
      { name: "Apple", query: "Apple" },
      { name: "Samsung", query: "Samsung" },
      { name: "OnePlus", query: "OnePlus" },
      { name: "Zara", query: "Zara" },
      { name: "Nike", query: "Nike" },
      { name: "Tanishq", query: "Tanishq" },
      { name: "Ather", query: "Ather" },
      { name: "Dell", query: "Dell" }
    ],
    bannerBadge: "✨ MEGA SHOPPING FESTIVAL",
    bannerHeadline: "Mega Shopping Festival & Carnival.",
    bannerHighlight: "Unbeatable Prices Across Every Department",
    bannerTagline: "100% Brand Sealed • Fast Express Shipping • 12 Months No Cost EMI Available",
    bannerHeroImg: "/products/samsung-galaxy-s26-ultra.jpg",
    bannerPills: [
      { label: "📱 Mobiles Store", href: "/products?category=Mobiles" },
      { label: "👗 Fashion 70% Off", href: "/products?category=Fashion" },
      { label: "💎 Precious Jewellery", href: "/products?category=Jewellery" }
    ],
    spotlightTitle: "Spotlight Festival Mega Deals",
    deals: [
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
      },
      {
        id: "giva-silver-ring",
        name: "GIVA 925 Sterling Silver Solitaire Ring",
        subName: "Rhodium Plated • AAA+ Grade Zirconia",
        monthlyEmi: "Pure Silver",
        topTag: "★ Anti-Tarnish Coating • Certificate of Authenticity",
        startingPrice: "₹1,899",
        mrp: "₹3,499",
        discount: "46% OFF",
        features: ["Pure 925 Silver", "Adjustable Fit", "Gift Box"],
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=Jewellery&search=GIVA",
        accentBadge: "BIS Hallmarked"
      },
      {
        id: "ather-450x",
        name: "Ather 450X Gen 3 Pro 3.7kWh",
        subName: "90km/h Top Speed • 146km TrueRange",
        monthlyEmi: "At ₹3,499/mo",
        topTag: "★ Free Home Fast Charger + 5-Year Battery Warranty",
        startingPrice: "₹1,38,000",
        mrp: "₹1,58,000",
        discount: "13% OFF",
        features: ["Google Maps", "Warp Mode", "IP67 Water Resistance"],
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
        link: "/products?category=EV%20Vehicles&search=Ather",
        accentBadge: "Hyperdrive 90km/h"
      }
    ]
  }
};

function getCategoryConfig(categoryParam?: string | null): { key: string; config: CategoryConfig } {
  if (!categoryParam) {
    return { key: "default", config: CATEGORY_CONFIGS.default };
  }

  const clean = categoryParam.toLowerCase().trim();

  if (clean.includes("for-you") || clean === "for you" || clean === "foryou" || clean === "for_you") {
    return { key: "for-you", config: CATEGORY_CONFIGS["for-you"] };
  }
  if (clean.includes("mobile access") || clean.includes("accessories") || clean === "accessories") {
    return { key: "accessories", config: CATEGORY_CONFIGS.accessories };
  }
  if (clean.includes("refurbish") || clean.includes("old / refurbished")) {
    return { key: "refurbished", config: CATEGORY_CONFIGS.refurbished };
  }
  if (clean.includes("mobile") || clean.includes("smartphones") || clean.includes("phone")) {
    return { key: "mobiles", config: CATEGORY_CONFIGS.mobiles };
  }
  if (clean.includes("fashion") || clean.includes("cloth") || clean.includes("wear")) {
    return { key: "fashion", config: CATEGORY_CONFIGS.fashion };
  }
  if (clean.includes("jewel") || clean.includes("gold") || clean.includes("diamond")) {
    return { key: "jewellery", config: CATEGORY_CONFIGS.jewellery };
  }
  if (clean.includes("ev") || clean.includes("electric") || clean.includes("vehicle") || clean.includes("scooter")) {
    return { key: "ev", config: CATEGORY_CONFIGS.ev };
  }
  if (clean.includes("laptop") || clean.includes("computer") || clean.includes("tablet")) {
    return { key: "laptops", config: CATEGORY_CONFIGS.laptops };
  }
  if (clean.includes("smart") || clean.includes("watch") || clean.includes("gadget")) {
    return { key: "electronics", config: CATEGORY_CONFIGS.electronics };
  }
  if (clean.includes("tv") || clean.includes("audio") || clean.includes("speaker") || clean.includes("sound")) {
    return { key: "tv", config: CATEGORY_CONFIGS.tv };
  }
  if (clean.includes("kitchen") || clean.includes("appliance")) {
    return { key: "appliances", config: CATEGORY_CONFIGS.appliances };
  }

  return { key: "default", config: CATEGORY_CONFIGS.default };
}

export default function AmazonFestiveShowcase({ category }: { category?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFilter = category || searchParams.get("category");
  const brandSearch = searchParams.get("search") || "";

  const [primeFilter, setPrimeFilter] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<string | null>(null);
  const [priceSort, setPriceSort] = useState<string | null>("low-to-high");
  const [priceRange, setPriceRange] = useState<string | null>(searchParams.get("price") || null);
  const [showCategoryGrid, setShowCategoryGrid] = useState<boolean>(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentViewedIds, setRecentViewedIds] = useState<string[]>([]);

  // Smooth scroll down to the product catalog
  const scrollToCatalog = () => {
    if (typeof window === "undefined") return;
    const targetEl = document.getElementById("brand-products-section");
    if (targetEl) {
      const yOffset = -75;
      const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (categoryFilter) {
      const t1 = setTimeout(scrollToCatalog, 60);
      const t2 = setTimeout(scrollToCatalog, 250);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [categoryFilter]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    setRecentViewedIds(getRecentlyViewedProductIds());

    const handleUpdate = () => {
      setRecentSearches(getRecentSearches());
      setRecentViewedIds(getRecentlyViewedProductIds());
    };
    window.addEventListener("recent_history_updated", handleUpdate);
    return () => window.removeEventListener("recent_history_updated", handleUpdate);
  }, []);

  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const fetchBanners = async () => {
    try {
      setLoadingBanners(true);
      const res = await fetch("/api/heroSlides", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const active = data.filter((b: any) => b.is_active !== false);
        setBanners(active.length > 0 ? active : data);
      } else {
        setBanners([
          {
            id: "default-1",
            image_url: "/hero/banner-iphone18pro.jpg",
            title: "Festive Season Flagship Offers",
            subtitle: "Unbeatable Deals on Smartphones & Electronics",
            tag: "Official Store",
            link_url: "/products"
          },
          {
            id: "default-2",
            image_url: "/hero/banner-samsung-zflip.jpg",
            title: "Galaxy AI & Special Discounts",
            subtitle: "Flat Instant Bank Discounts & 0% No Cost EMI",
            tag: "Mega Festival",
            link_url: "/products?category=Mobiles"
          }
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto slide active banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const { config, key: activeKey } = useMemo(() => getCategoryConfig(categoryFilter), [categoryFilter]);

  interface BrandItem {
    name: string;
    query: string;
    logo_url?: string;
    id?: string;
  }

  const [dbBrands, setDbBrands] = useState<BrandItem[]>([]);

  useEffect(() => {
    async function loadDynamicBrands() {
      try {
        const cat = categoryFilter || "Mobiles";
        const res = await fetch(`/api/brands?category=${encodeURIComponent(cat)}`, { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDbBrands(data.map((b: any) => ({
            id: b.id,
            name: b.name,
            query: b.query || b.name,
            logo_url: b.logo_url || ""
          })));
        } else if (!categoryFilter || activeKey === "mobiles") {
          const resAll = await fetch(`/api/brands`, { cache: "no-store" });
          const allData = await resAll.json();
          if (Array.isArray(allData) && allData.length > 0) {
            const filtered = allData.filter((b: any) => !b.category || b.category === "Mobiles" || b.category.toLowerCase().includes("mobile"));
            setDbBrands((filtered.length > 0 ? filtered : allData).map((b: any) => ({
              id: b.id,
              name: b.name,
              query: b.query || b.name,
              logo_url: b.logo_url || ""
            })));
          } else {
            setDbBrands([]);
          }
        } else {
          // For non-mobile categories without custom DB brands, reset dbBrands so category config brands are used
          setDbBrands([]);
        }
      } catch {
        setDbBrands([]);
      }
    }
    loadDynamicBrands();
  }, [categoryFilter, activeKey]);

  // Brand list for quick brand selection (tailored per active category)
  const brandList: BrandItem[] = useMemo(() => {
    const isMobileOrRefurb = activeKey === "mobiles" || activeKey === "refurbished";
    const EXCLUDED_FROM_MOBILES = ["anker", "boat", "spigen", "noise", "nike", "tanishq"];

    let rawList: BrandItem[] = [];
    if (dbBrands.length > 0) {
      rawList = dbBrands;
    } else if (config.brands && config.brands.length > 0) {
      rawList = config.brands;
    } else {
      rawList = [
        { name: "Samsung Galaxy", query: "Samsung" },
        { name: "Apple iPhone", query: "Apple" },
        { name: "OnePlus", query: "OnePlus" },
        { name: "Google Pixel", query: "Pixel" },
        { name: "Vivo", query: "Vivo" },
        { name: "Motorola", query: "Motorola" },
        { name: "Realme", query: "realme" },
        { name: "Xiaomi / Redmi", query: "Redmi" },
        { name: "Nothing Phone", query: "Nothing" },
        { name: "iQOO", query: "iQOO" }
      ];
    }

    if (isMobileOrRefurb) {
      return rawList.filter((b) => {
        const n = (b.name || "").toLowerCase();
        const q = (b.query || "").toLowerCase();
        return !EXCLUDED_FROM_MOBILES.some((ex) => n.includes(ex) || q.includes(ex));
      });
    }

    return rawList;
  }, [dbBrands, config.brands, activeKey]);

  // Sync selectedBrand with URL query param
  const selectedBrand = brandSearch || null;

  const handleBrandClick = (bQuery: string) => {
    if (!bQuery || selectedBrand?.toLowerCase() === bQuery.toLowerCase()) {
      // Unselect brand / Click All Brands -> return to full category products directly
      const targetUrl = categoryFilter 
        ? `/products?category=${encodeURIComponent(categoryFilter)}` 
        : `/products`;
      router.push(targetUrl, { scroll: false });
    } else {
      // Select brand directly
      const targetUrl = categoryFilter 
        ? `/products?category=${encodeURIComponent(categoryFilter)}&search=${encodeURIComponent(bQuery)}`
        : `/products?search=${encodeURIComponent(bQuery)}`;
      router.push(targetUrl, { scroll: false });
    }

    // Directly scroll up to the matching products section
    setTimeout(() => {
      if (typeof window !== "undefined") {
        const brandProductsEl = document.getElementById("brand-products-section");
        if (brandProductsEl) {
          const yOffset = -70; // Header offset
          const y = brandProductsEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }, 50);
  };

  // Filter and sort deals based on selectedBrand, primeFilter, priceRange, priceSort
  const displayedDeals = useMemo(() => {
    let list = [...config.deals];
    
    if (selectedBrand) {
      const q = selectedBrand.toLowerCase();
      const matched = list.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.subName.toLowerCase().includes(q) || 
        d.accentBadge.toLowerCase().includes(q) ||
        (d.features && d.features.some(f => f.toLowerCase().includes(q)))
      );
      if (matched.length > 0) {
        list = matched;
      }
    }

    if (primeFilter) {
      list = list.filter(d => d.topTag.includes("★") || d.accentBadge.includes("Official") || d.accentBadge.includes("Flagship"));
    }

    if (priceRange) {
      list = list.filter(d => {
        const p = parsePrice(d.startingPrice);
        if (priceRange === "under-10k") return p < 10000;
        if (priceRange === "10k-25k") return p >= 10000 && p <= 25000;
        if (priceRange === "25k-50k") return p > 25000 && p <= 50000;
        if (priceRange === "above-50k") return p > 50000;
        return true;
      });
    }

    if (priceSort === "low-to-high") {
      list.sort((a, b) => parsePrice(a.startingPrice) - parsePrice(b.startingPrice));
    } else if (priceSort === "high-to-low") {
      list.sort((a, b) => parsePrice(b.startingPrice) - parsePrice(a.startingPrice));
    }

    return list;
  }, [config.deals, selectedBrand, primeFilter, priceRange, priceSort]);

  const [catalogProducts, setCatalogProducts] = useState<any[]>(defaultProducts || []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/productList");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCatalogProducts(data);
        } else {
          setCatalogProducts(defaultProducts);
        }
      } catch (err) {
        console.error("Failed to load catalog products:", err);
        setCatalogProducts(defaultProducts);
      }
    }
    fetchProducts();
  }, []);

  // Brand keyword mapping for accurate matching across all categories
  const BRAND_ALIAS_MAP: Record<string, string[]> = {
    // Mobiles
    samsung: ["samsung", "galaxy", "z fold", "z flip"],
    apple: ["apple", "iphone", "macbook", "ipad", "airpods", "apple watch"],
    oneplus: ["oneplus", "nord"],
    pixel: ["google pixel", "pixel", "google"],
    google: ["google pixel", "pixel", "google"],
    vivo: ["vivo", "iqoo"],
    motorola: ["motorola", "moto", "razr"],
    moto: ["motorola", "moto", "razr"],
    realme: ["realme", "narzo"],
    redmi: ["redmi", "xiaomi", "mi "],
    xiaomi: ["redmi", "xiaomi", "mi "],
    nothing: ["nothing", "cmf"],
    iqoo: ["iqoo"],
    
    // Laptops & Computers
    dell: ["dell", "inspiron", "xps", "alienware"],
    hp: ["hp", "pavilion", "omen", "victus", "spectre", "envy"],
    lenovo: ["lenovo", "thinkpad", "legion", "ideapad", "yoga"],
    asus: ["asus", "rog", "tuf", "zenbook", "vivobook"],
    acer: ["acer", "predator", "nitro", "aspire", "swift"],
    msi: ["msi", "cyborg", "katana", "stealth"],
    
    // Fashion & Lifestyle
    nike: ["nike", "air max", "jordan"],
    puma: ["puma"],
    zara: ["zara"],
    levi: ["levi", "levi's", "levis"],
    "allen solly": ["allen solly", "solly"],
    tommy: ["tommy", "tommy hilfiger", "hilfiger"],
    fossil: ["fossil"],
    "ray-ban": ["ray-ban", "rayban", "aviator", "wayfarer"],
    
    // Watches & Smart Wearables
    noise: ["noise", "colorfit"],
    boat: ["boat", "storm", "wave", "airdopes", "rockerz"],
    "fire-boltt": ["fire-boltt", "fireboltt", "boltt"],
    amazfit: ["amazfit", "gtr", "gts", "bip"],
    garmin: ["garmin", "forerunner", "fenix"],
    
    // Jewellery
    tanishq: ["tanishq", "mia"],
    kalyan: ["kalyan"],
    malabar: ["malabar"],
    giva: ["giva"],
    caratlane: ["caratlane"],
    joyalukkas: ["joyalukkas"],
    senco: ["senco"],
    
    // Accessories
    anker: ["anker", "ganprime", "soundcore"],
    spigen: ["spigen", "ultra hybrid", "tough armor"],
    belkin: ["belkin", "boostcharge"],
    ambrane: ["ambrane"],
    baseus: ["baseus"],
    portronics: ["portronics"],
    
    // EV Vehicles
    ather: ["ather", "450x", "450s", "rizta"],
    ola: ["ola", "s1 pro", "s1 air", "s1x"],
    tvs: ["tvs", "iqube"],
    chetak: ["chetak", "bajaj"],
    vida: ["vida", "hero vida"],
    simple: ["simple energy", "simple one"],
    revolt: ["revolt", "rv400"]
  };

  const matchedCatalogProducts = useMemo(() => {
    if (!catalogProducts || catalogProducts.length === 0) return [];
    
    let list = [...catalogProducts];
    
    // For You Mode: Match by recent searches and viewed products
    if (activeKey === "for-you") {
      if (selectedBrand) {
        const q = selectedBrand.trim().toLowerCase();
        const matchedKey = Object.keys(BRAND_ALIAS_MAP).find(k => q.includes(k) || k.includes(q));
        const keywords = matchedKey ? BRAND_ALIAS_MAP[matchedKey] : [q];

        list = list.filter(p => {
          const name = (p.name || "").toLowerCase();
          const brand = (p.brand || "").toLowerCase();
          const sub = (p.sub_category || "").toLowerCase();
          return (brand && keywords.some(k => brand.includes(k))) ||
                 keywords.some(k => name.includes(k)) ||
                 keywords.some(k => sub.includes(k));
        });
      } else if (recentSearches.length > 0 || recentViewedIds.length > 0) {
        const matched = list.filter((p) => {
          const name = (p.name || "").toLowerCase();
          const cat = (p.category || p.category_name || "").toLowerCase();
          const sub = (p.sub_category || "").toLowerCase();
          const isViewed = recentViewedIds.includes(p.id);
          const matchesSearch = recentSearches.some((s) => {
            const sq = s.toLowerCase();
            return name.includes(sq) || cat.includes(sq) || sub.includes(sq);
          });
          return isViewed || matchesSearch;
        });

        if (matched.length > 0) {
          list = matched;
        } else {
          list = list.slice(0, 16);
        }
      } else {
        list = list.slice(0, 16);
      }
    } else {
      // Standard category filter
      if (categoryFilter) {
        const catKey = categoryFilter.toLowerCase().trim();
        const isRefurbishedMode = 
          activeKey === "refurbished" || 
          catKey.includes("refurbish") || 
          catKey.includes("old / refurbished") || 
          catKey.includes("old-refurbished");
          
        const isAccessoriesMode = 
          activeKey === "accessories" || 
          (catKey.includes("accessories") && !isRefurbishedMode);

        const isNewMobilesMode = 
          (activeKey === "mobiles" || catKey === "mobiles" || catKey === "mobile") && 
          !isRefurbishedMode && 
          !isAccessoriesMode;

        list = list.filter(p => {
          const c = (p.category || p.category_name || "").toLowerCase();
          const cid = (p.category_id || "").toLowerCase();
          const sub = (p.sub_category || "").toLowerCase();
          const pName = (p.name || "").toLowerCase();
          const desc = (p.description || "").toLowerCase();
          const cond = (p.condition || "").toLowerCase();
          const isRefurbishedProduct = 
            c.includes("refurbish") || c.includes("old") ||
            cid.includes("refurbish") || cid.includes("old") ||
            sub.includes("refurbish") || sub.includes("old") ||
            pName.includes("refurbished") || pName.includes("like new") ||
            pName.includes("pre-owned") || pName.includes("second hand") ||
            desc.includes("refurbished") ||
            cond.includes("refurbish") || cond.includes("grade") || 
            cond.includes("like new") || cond.includes("pre-owned") || 
            (cond.includes("used") && !cond.includes("brand new"));

          if (isRefurbishedMode) {
            // Never include accessories/cables/adapters in refurbished mobiles shelf
            const isAccessory = 
              c.includes("accessories") || cid.includes("accessories") || 
              sub.includes("accessories") || sub.includes("charger") || 
              pName.includes("adapter") || pName.includes("cable") || 
              pName.includes("power bank") || pName.includes("case") || 
              pName.includes("screen guard");

            return isRefurbishedProduct && !isAccessory;
          }

          if (isAccessoriesMode) {
            return (
              c.includes("accessories") || cid.includes("accessories") || 
              sub.includes("accessories") || sub.includes("charger") || 
              sub.includes("cable") || sub.includes("case") || 
              sub.includes("cover") || pName.includes("adapter") || 
              pName.includes("charger") || pName.includes("cable")
            );
          }

          if (isNewMobilesMode) {
            const isAccessory = 
              c.includes("accessories") || cid.includes("accessories") || 
              sub.includes("accessories") || pName.includes("adapter") || 
              pName.includes("cable") || pName.includes("charger") ||
              pName.includes("power bank") || pName.includes("case") ||
              pName.includes("cover") || pName.includes("screen guard");

            if (isRefurbishedProduct || isAccessory) return false;

            return (
              c.includes("mobile") || cid.includes("mobile") || 
              sub.includes("mobile") || sub.includes("phone") || 
              sub.includes("flagship") || c === "mobiles" ||
              pName.includes("galaxy") || pName.includes("iphone") || 
              pName.includes("oneplus") || pName.includes("pixel") || 
              pName.includes("vivo") || pName.includes("realme") || 
              pName.includes("redmi") || pName.includes("poco") || 
              pName.includes("motorola") || pName.includes("moto") || 
              pName.includes("oppo") || pName.includes("iqoo") || 
              pName.includes("nothing") || pName.includes("5g") || 
              pName.includes("smartphone")
            );
          }

          return c.includes(catKey) || cid.includes(catKey) || sub.includes(catKey) || catKey.includes(c);
        });
      }

      // Filter by search query or selected brand strictly
      if (selectedBrand) {
        const q = selectedBrand.trim().toLowerCase();
        const matchedKey = Object.keys(BRAND_ALIAS_MAP).find(k => q.includes(k) || k.includes(q));
        const keywords = matchedKey ? BRAND_ALIAS_MAP[matchedKey] : [q];

        list = list.filter(p => {
          const name = (p.name || "").toLowerCase();
          const brand = (p.brand || "").toLowerCase();
          const sub = (p.sub_category || "").toLowerCase();

          // 1. Match product brand attribute
          if (brand && keywords.some(k => brand.includes(k))) return true;

          // 2. Match product name
          if (keywords.some(k => name.includes(k))) return true;

          // 3. Match sub-category if specifically named after the brand
          if (keywords.some(k => sub.includes(k))) return true;

          return false;
        });
      }
    }

    if (primeFilter) {
      list = list.filter(p => (p.rating && p.rating >= 4) || (p.stock_quantity && p.stock_quantity > 5));
    }

    if (priceRange) {
      list = list.filter(p => {
        const pVal = parsePrice(p.price);
        if (priceRange === "under-10k") return pVal < 10000;
        if (priceRange === "10k-25k") return pVal >= 10000 && pVal <= 25000;
        if (priceRange === "25k-50k") return pVal > 25000 && pVal <= 50000;
        if (priceRange === "above-50k") return pVal > 50000;
        return true;
      });
    }

    if (priceSort === "low-to-high") {
      list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (priceSort === "high-to-low") {
      list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }

    return list;
  }, [catalogProducts, categoryFilter, selectedBrand, activeKey, recentSearches, recentViewedIds, primeFilter, priceRange, priceSort]);

  // Current active brand name
  const activeBrandObj = config.brands.find(b => selectedBrand && b.query.toLowerCase() === selectedBrand.toLowerCase());
  const activeBrandTitle = activeBrandObj ? `${activeBrandObj.name}` : "";

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 rounded-none sm:rounded-2xl md:rounded-3xl overflow-hidden border-0 sm:border border-slate-200/90 shadow-none sm:shadow-xs mb-2 sm:mb-4 md:mb-6">
      
      {/* =========================================================================
          MAIN CONTENT AREA (Sidebar Filter + Brand Emerald Festive Banner & Horizontal Cards)
      ========================================================================= */}
      <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-start">
          
          {/* ======================= LEFT SIDEBAR: CATEGORY & FILTERS ======================= */}
          <aside className="hidden lg:block lg:col-span-3 space-y-3 sm:space-y-4 text-xs select-none bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Category Breadcrumbs Hierarchy */}
            <div>
              <h3 className="font-bold text-slate-900 text-[13px] mb-1.5">Category</h3>
              <Link 
                href={config.parentCategory.href} 
                className="text-slate-600 hover:text-[#2E6F40] flex items-center gap-1 font-semibold mb-1 hover:underline transition-colors"
              >
                <span>{config.parentCategory.name}</span>
              </Link>
              
              <div className="pl-2 border-l-2 border-[#2E6F40]/30 mt-1.5 space-y-1.5">
                <span className="font-bold text-[#2E6F40] block text-xs">{config.categoryHeading}</span>
                <ul className="pl-1 space-y-1 text-slate-600">
                  {config.categoryTree.map((c, i) => {
                    const isTreeActive = 
                      (categoryFilter && c.href.toLowerCase().includes(encodeURIComponent(categoryFilter).toLowerCase())) ||
                      (!categoryFilter && c.href === "/products");

                    return (
                      <li key={i}>
                        <Link 
                          href={c.href}
                          className={`flex items-center gap-1.5 py-1 px-2 rounded-lg transition-all ${
                            isTreeActive 
                              ? "font-black text-[#2E6F40] bg-emerald-50 border border-emerald-200/80 shadow-2xs" 
                              : "text-slate-600 hover:text-[#2E6F40] hover:bg-slate-50"
                          }`}
                        >
                          <span className={isTreeActive ? "font-bold" : ""}>{c.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* MY SHOP Assured / Prime Filter */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Assurance &amp; Delivery</h3>
              <label 
                className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg transition-colors ${
                  primeFilter ? "bg-emerald-50" : "hover:bg-slate-50"
                }`}
                onClick={() => setPrimeFilter(!primeFilter)}
              >
                <input 
                  type="checkbox" 
                  checked={primeFilter} 
                  onChange={() => {}} 
                  className="rounded text-[#2E6F40] focus:ring-[#2E6F40] accent-[#2E6F40] cursor-pointer"
                />
                <span className="font-black text-[#2E6F40] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                  ✓ MY SHOP Assured
                </span>
              </label>
            </div>

            {/* Delivery Day */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Delivery Speed</h3>
              <div className="space-y-1 text-slate-700">
                {["Get It Today (Express)", "Get It by Tomorrow"].map((day, i) => {
                  const isDayActive = deliveryFilter === day;
                  return (
                    <label 
                      key={i} 
                      className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isDayActive ? "bg-emerald-50 text-[#2E6F40] font-bold" : "hover:bg-slate-50 text-slate-700"
                      }`}
                      onClick={() => setDeliveryFilter(isDayActive ? null : day)}
                    >
                      <input 
                        type="checkbox" 
                        checked={isDayActive} 
                        onChange={() => {}} 
                        className="rounded text-[#2E6F40] focus:ring-[#2E6F40] accent-[#2E6F40] cursor-pointer"
                      />
                      <span>{day}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Sorting & Price Filter */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-[13px] flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faIndianRupeeSign} className="text-[#2E6F40] text-[11px]" />
                  <span>Price</span>
                </h3>
                {(priceSort || priceRange) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPriceSort(null);
                      setPriceRange(null);
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-800 underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Price Sort Order */}
              <div className="space-y-1 text-slate-700">
                <label 
                  className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                    priceSort === "low-to-high" ? "bg-emerald-50 text-[#2E6F40] font-bold border border-emerald-200" : "hover:bg-slate-50 text-slate-700"
                  }`}
                  onClick={() => setPriceSort(priceSort === "low-to-high" ? null : "low-to-high")}
                >
                  <input 
                    type="checkbox" 
                    checked={priceSort === "low-to-high"} 
                    onChange={() => {}} 
                    className="rounded text-[#2E6F40] focus:ring-[#2E6F40] accent-[#2E6F40] cursor-pointer"
                  />
                  <span className="text-xs">Price: Low to High</span>
                </label>

                <label 
                  className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                    priceSort === "high-to-low" ? "bg-emerald-50 text-[#2E6F40] font-bold border border-emerald-200" : "hover:bg-slate-50 text-slate-700"
                  }`}
                  onClick={() => setPriceSort(priceSort === "high-to-low" ? null : "high-to-low")}
                >
                  <input 
                    type="checkbox" 
                    checked={priceSort === "high-to-low"} 
                    onChange={() => {}} 
                    className="rounded text-[#2E6F40] focus:ring-[#2E6F40] accent-[#2E6F40] cursor-pointer"
                  />
                  <span className="text-xs">Price: High to Low</span>
                </label>
              </div>

              {/* Price Range */}
              <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Price Range</span>
                {[
                  { label: "Under ₹10,000", value: "under-10k" },
                  { label: "₹10,000 - ₹25,000", value: "10k-25k" },
                  { label: "₹25,000 - ₹50,000", value: "25k-50k" },
                  { label: "Above ₹50,000", value: "above-50k" },
                ].map((range) => {
                  const isActive = priceRange === range.value;
                  return (
                    <label
                      key={range.value}
                      className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isActive ? "bg-emerald-50 text-[#2E6F40] font-bold border border-emerald-200" : "hover:bg-slate-50 text-slate-700"
                      }`}
                      onClick={() => setPriceRange(isActive ? null : range.value)}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => {}}
                        className="rounded text-[#2E6F40] focus:ring-[#2E6F40] accent-[#2E6F40] cursor-pointer"
                      />
                      <span className="text-xs">{range.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-[13px]">Popular Brands</h3>
                {selectedBrand && (
                  <button
                    onClick={() => {
                      const targetUrl = categoryFilter 
                        ? `/products?category=${encodeURIComponent(categoryFilter)}` 
                        : `/products`;
                      router.push(targetUrl);
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-800 underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1 text-slate-700 max-h-56 overflow-y-auto pr-1">
                {brandList.map((b, i) => {
                  const isChecked = selectedBrand?.toLowerCase() === b.query.toLowerCase();
                  return (
                    <label 
                      key={b.id || i} 
                      className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? "bg-emerald-50 text-[#2E6F40] font-bold border border-emerald-200" : "hover:bg-slate-50 text-slate-700"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleBrandClick(b.query);
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => {}} 
                        className="w-4 h-4 rounded text-[#2E6F40] focus:ring-[#2E6F40] accent-[#2E6F40] cursor-pointer"
                      />
                      {b.logo_url && (
                        <div className="w-4 h-4 rounded-full bg-white overflow-hidden relative shrink-0 border border-slate-200 shadow-2xs">
                          <Image 
                            src={b.logo_url} 
                            alt={b.name} 
                            fill 
                            className="object-contain p-0.5" 
                            unoptimized 
                          />
                        </div>
                      )}
                      <span className="text-xs truncate">{b.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-[13px] mb-2">Customer Rating</h3>
              <div className="space-y-1">
                <Link 
                  href={categoryFilter ? `/products?category=${encodeURIComponent(categoryFilter)}` : "/products"} 
                  className="flex items-center gap-1.5 text-amber-500 hover:opacity-80 p-1 rounded-lg hover:bg-slate-50"
                >
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
          <div className="col-span-1 lg:col-span-9 space-y-3 sm:space-y-4 md:space-y-5">
            
            {/* =========================================================================
                1. DYNAMIC BANNER SLIDER (Top Featured Hero Carousel)
            ========================================================================= */}
            <div className="relative w-full rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-xs border border-slate-200/90 bg-slate-950 group">
              
              {/* Banner Carousel Display (Compact & Proportionate on Mobile) */}
              <div className="relative w-full h-[140px] xs:h-[160px] sm:h-[220px] md:h-[270px] lg:h-[300px] overflow-hidden">
                {banners.length > 0 ? (
                  banners.map((b, idx) => (
                    <div 
                      key={b.id || idx}
                      className={`absolute inset-0 transition-opacity duration-700 ${idx === activeBannerIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
                    >
                      <Link href={b.link_url || b.link || "/products"} className="block relative w-full h-full">
                        <Image 
                          src={b.image_url} 
                          alt={b.title || `Promotional Banner ${idx + 1}`}
                          fill
                          className="object-cover object-center w-full h-full"
                          priority={idx === 0}
                          unoptimized
                        />
                        {/* Gradient Overlay & Captions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-2.5 sm:p-4 md:p-6">
                          {b.tag && (
                            <span className="self-start text-[9px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 mb-1 sm:mb-2 shadow-xs">
                              {b.tag}
                            </span>
                          )}
                          {b.title && (
                            <h2 className="text-sm sm:text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md">
                              {b.title}
                            </h2>
                          )}
                          {b.subtitle && (
                            <p className="text-[10px] sm:text-xs md:text-sm text-slate-200 font-medium mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2 drop-shadow-sm max-w-xl">
                              {b.subtitle}
                            </p>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
                    <p className="text-sm font-bold text-slate-300">Festive Season Deals Live Now</p>
                  </div>
                )}
              </div>

              {/* Slider Dots & Navigation */}
              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveBannerIndex(prev => (prev - 1 + banners.length) % banners.length)}
                    className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/20"
                    aria-label="Previous Banner"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBannerIndex(prev => (prev + 1) % banners.length)}
                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/20"
                    aria-label="Next Banner"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>

                  <div className="absolute bottom-2 sm:bottom-3 right-3 sm:right-4 z-20 flex items-center gap-1 sm:gap-1.5">
                    {banners.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setActiveBannerIndex(dotIdx)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                          dotIdx === activeBannerIndex ? "w-5 sm:w-6 bg-emerald-400" : "w-1.5 sm:w-2 bg-white/60 hover:bg-white"
                        }`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>



            {/* =========================================================================
                3. MATCHING PRODUCTS CATALOG SHELF (Positioned directly under Brands)
            ========================================================================= */}
            <div 
              id="brand-products-section" 
              className={`bg-white p-2.5 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xs border transition-all space-y-2.5 sm:space-y-3.5 md:space-y-4 ${
                selectedBrand 
                  ? "border-emerald-300 ring-2 ring-[#2E6F40]/20 bg-emerald-50/10" 
                  : "border-slate-200/90"
              }`}
            >
              <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-slate-100 flex-wrap gap-1.5 sm:gap-2">
                <div>
                  <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2 sm:w-2.5 h-4 sm:h-5 bg-[#2E6F40] rounded-full" />
                    <span>
                      {selectedBrand 
                        ? `Showing "${selectedBrand}" ${
                            activeKey === "refurbished" || (categoryFilter && categoryFilter.toLowerCase().includes("refurbished"))
                              ? "Refurbished Mobiles"
                              : activeKey === "mobiles"
                              ? "Smartphones"
                              : activeKey === "laptops"
                              ? "Laptops & Tablets"
                              : activeKey === "fashion"
                              ? "Fashion & Lifestyle"
                              : activeKey === "electronics"
                              ? "Smartwatches & Wearables"
                              : activeKey === "jewellery"
                              ? "Jewellery Collections"
                              : activeKey === "accessories"
                              ? "Accessories"
                              : activeKey === "ev"
                              ? "Electric Vehicles"
                              : "Products"
                          } (${matchedCatalogProducts.length})` 
                        : `${config.categoryHeading} (${matchedCatalogProducts.length})`}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Sort dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 hidden xs:inline">Sort:</span>
                    <select
                      value={priceSort || "featured"}
                      onChange={(e) => setPriceSort(e.target.value === "featured" ? null : e.target.value)}
                      className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#2E6F40] cursor-pointer"
                    >
                      <option value="low-to-high">Price: Low to High</option>
                      <option value="high-to-low">Price: High to Low</option>
                      <option value="featured">Featured / Default</option>
                    </select>
                  </div>

                  {selectedBrand && (
                    <button
                      type="button"
                      onClick={() => handleBrandClick("")}
                      className="text-[11px] font-bold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>Show All Brands</span>
                      <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Recent Searches Pills when in For You mode */}
              {activeKey === "for-you" && recentSearches.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[11px] sm:text-xs font-black text-blue-900 flex items-center gap-1.5 shrink-0">
                    <FontAwesomeIcon icon={faClockRotateLeft} className="text-[10px] sm:text-xs text-blue-600" />
                    <span>Recent:</span>
                  </span>
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    {recentSearches.map((term, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => router.push(`/products?search=${encodeURIComponent(term)}`, { scroll: false })}
                        className="px-2 py-0.5 rounded-full bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-800 text-[10px] sm:text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedCatalogProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {matchedCatalogProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                    <FontAwesomeIcon icon={faTag} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {selectedBrand ? `No products found for "${selectedBrand}"` : "No products found in this category"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {selectedBrand 
                      ? `We are updating inventory for ${selectedBrand}. Please check out our other collections.`
                      : "We are updating products for this catalog department. Please check out our other flagship categories."
                    }
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/products", { scroll: false });
                      scrollToCatalog();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2E6F40] hover:bg-[#245e35] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    View All Products
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
