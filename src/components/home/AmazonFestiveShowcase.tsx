"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
    bannerHeroImg: "/brand-image.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
    bannerHeroImg: "/brand-image.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
    bannerHeroImg: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
    bannerHeroImg: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
    bannerHeroImg: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
    bannerHeroImg: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
    bannerHeroImg: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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
        image: "/placeholder.png",
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

  const [selectedBrand, setSelectedBrand] = useState<string | null>(brandSearch || null);
  const [primeFilter, setPrimeFilter] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<string | null>(null);

  const { config } = useMemo(() => getCategoryConfig(categoryFilter), [categoryFilter]);

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs mb-6">
      
      {/* =========================================================================
          1. TOP SUB-NAVIGATION BAR (Brand Emerald & White Theme)
      ========================================================================= */}
      <div className="bg-white border-b border-slate-200 select-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center overflow-x-auto whitespace-nowrap scrollbar-none gap-5 sm:gap-6 text-xs sm:text-[13px] leading-normal min-h-[46px]">
          <Link
            href={categoryFilter ? `/products?category=${encodeURIComponent(categoryFilter)}` : "/products"}
            className="font-black text-[#2E6F40] flex items-center gap-1.5 shrink-0 hover:opacity-85 transition-opacity"
          >
            <span>{config.storeTitle}</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-[10px] text-[#2E6F40]/70" />
          </Link>

          {config.subNavLinks.map((item, idx) => {
            const itemSearch = new URLSearchParams(item.href.split("?")[1] || "").get("search");
            const isItemActive = brandSearch
              ? itemSearch?.toLowerCase() === brandSearch.toLowerCase()
              : idx === 0;

            return (
              <Link
                key={idx}
                href={item.href}
                className={`shrink-0 py-1 font-bold border-b-2 transition-all inline-block ${
                  isItemActive
                    ? "text-[#2E6F40] border-[#2E6F40]" 
                    : "text-slate-600 border-transparent hover:text-[#2E6F40] hover:border-slate-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
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
                href={config.parentCategory.href} 
                className="text-slate-600 hover:text-[#2E6F40] flex items-center gap-1 font-semibold mb-1"
              >
                <span>{config.parentCategory.name}</span>
              </Link>
              
              <div className="pl-2 border-l-2 border-[#2E6F40]/30 mt-1.5 space-y-1.5">
                <span className="font-bold text-[#2E6F40] block">{config.categoryHeading}</span>
                <ul className="pl-2 space-y-1.5 text-slate-600">
                  {config.categoryTree.map((c, i) => (
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
                {config.brands.map((b, i) => (
                  <label 
                    key={i} 
                    className="flex items-center gap-2 cursor-pointer hover:text-[#2E6F40]"
                    onClick={() => {
                      const newBrand = selectedBrand === b.query ? null : b.query;
                      setSelectedBrand(newBrand);
                      if (newBrand) {
                        const targetUrl = categoryFilter 
                          ? `/products?category=${encodeURIComponent(categoryFilter)}&search=${encodeURIComponent(newBrand)}`
                          : `/products?search=${encodeURIComponent(newBrand)}`;
                        router.push(targetUrl);
                      } else {
                        const targetUrl = categoryFilter ? `/products?category=${encodeURIComponent(categoryFilter)}` : `/products`;
                        router.push(targetUrl);
                      }
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
                <Link 
                  href={categoryFilter ? `/products?category=${encodeURIComponent(categoryFilter)}` : "/products"} 
                  className="flex items-center gap-1.5 text-amber-500 hover:opacity-80"
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
          <div className="col-span-1 lg:col-span-9 space-y-4">
            
            {/* Top Festive Banner (Website's Emerald & Gold Theme) */}
            <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-[#173e22] via-[#245e35] to-[#1c4d29] border border-emerald-500/30 p-4 sm:p-6 text-white">
              
              {/* Top Quick Deal Action Pills */}
              <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {config.bannerPills.map((pill, pIdx) => (
                    <Link 
                      key={pIdx}
                      href={pill.href}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <span>{pill.label}</span>
                      <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
                    </Link>
                  ))}
                </div>

                <div className="bg-amber-400 text-slate-950 font-black px-3.5 py-1 rounded-lg text-xs uppercase tracking-wider shadow-xs">
                  🔥 Special Festive Deals
                </div>
              </div>

              {/* Main Headline & Ambience */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-2">
                  <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3 py-1 rounded-xl border border-emerald-400/40">
                    <span className="text-amber-400 font-bold text-xs">{config.bannerBadge}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                    {config.bannerHeadline} <br />
                    <span className="text-amber-300">{config.bannerHighlight}</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                    {config.bannerTagline}
                  </p>
                </div>

                <div className="md:col-span-4 hidden md:flex justify-end items-center">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40">
                    <Image
                      src={config.bannerHeroImg}
                      alt={config.categoryHeading}
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
                    <span>{config.spotlightTitle}</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Click on any card to view deals, EMI calculator &amp; fast checkout
                  </p>
                </div>

                <span className="text-xs font-bold text-[#2E6F40] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  ⚡ Live Price Drops
                </span>
              </div>

              {/* Horizontal Cards Grid (2 Columns on Medium/Large Screens) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.deals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={deal.link}
                    className="group relative flex flex-row items-center bg-gradient-to-r from-slate-50 via-white to-emerald-50/40 rounded-2xl p-3.5 sm:p-4 border-2 border-slate-200 hover:border-[#2E6F40] shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden gap-3 sm:gap-4"
                  >
                    {/* Left: Device / Product Image on Emerald Lit Podium with EMI Ribbon */}
                    <div className="relative w-28 sm:w-36 h-32 sm:h-36 shrink-0 bg-gradient-to-b from-emerald-900/10 via-slate-900/5 to-emerald-950/20 rounded-xl p-2 flex items-center justify-center overflow-hidden border border-slate-200/80">
                      
                      {/* Ribbon EMI Badge */}
                      <div className="absolute top-2 left-0 z-20 bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-r-md shadow-md">
                        {deal.monthlyEmi}
                      </div>

                      {/* Product Graphic */}
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
                        <span className="text-[10px] font-black uppercase text-[#2E6F40] bg-emerald-100/80 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                          {deal.accentBadge}
                        </span>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded shrink-0">
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
