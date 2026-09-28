"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faChevronRight,
  faShieldHalved,
  faStar,
  faCartPlus,
  faCheckCircle,
  faHeart,
  faShareNodes,
  faWandMagicSparkles,
  faCamera,
  faMicrochip,
  faPenNib,
  faBatteryFull,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function S26UltraSpotlightAd() {
  const { addToCart } = useCart();
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [isLiked, setIsLiked] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const product = {
    id: "samsung-s26-ultra",
    name: "Samsung Galaxy S26 Ultra 5G (Titanium Silver, 512 GB)",
    price: 139999,
    original_price: 149999,
    image: "/products/samsung-galaxy-s26-ultra.jpg",
    vertical_image: "/hero/samsung-s26-ultra-ad.jpg",
    category: "Mobiles & Accessories",
    unit: "16GB RAM | 512GB ROM • Snapdragon 8 Elite • 200MP Quad Pro AI",
  };

  const discountPercent = Math.round(
    ((product.original_price - product.price) / product.original_price) * 100
  );

  const features = [
    {
      icon: faWandMagicSparkles,
      title: "Galaxy AI 2.0",
      desc: "Live Translate, Circle to Search & Generative Photo Edit",
      badge: "AI Powered",
    },
    {
      icon: faCamera,
      title: "200MP Quad Pro AI",
      desc: "150x Space Zoom & Nightography 8K Video",
      badge: "Industry Best",
    },
    {
      icon: faPenNib,
      title: "Built-in S-Pen",
      desc: "Ultra-low 2.8ms latency precision stylus",
      badge: "Integrated",
    },
    {
      icon: faMicrochip,
      title: "Snapdragon 8 Elite",
      desc: "3nm NPU with 6000mAh all-day battery",
      badge: "Next-Gen",
    },
  ];

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: product.category,
      selectedUnit: product.unit,
    });
    router.push("/cart");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: product.category,
      selectedUnit: product.unit,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <section className="w-full max-w-full overflow-hidden py-4 sm:py-6 md:py-10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container relative z-10 px-3 sm:px-4 md:px-6">
        {/* Ad Header Bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-900 p-1 flex items-center justify-center overflow-hidden">
                <Image
                  src="/my-shop-logo.png"
                  alt="My Shop Official"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                  myshop.mobiles
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px] flex items-center justify-center font-bold">
                  ✓
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium flex items-center gap-1">
                <span>Sponsored</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Flagship Spotlight</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
              <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
              Official 1-Year Warranty
            </span>
            <Link
              href="/products/samsung-s26-ultra"
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full"
            >
              Explore Device
            </Link>
          </div>
        </div>

        {/* Main Instagram-Ad Visual Card */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-950 border border-slate-700/60 shadow-2xl backdrop-blur-md">
          {/* Main Grid: Responsive 2-Col Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left Column: Visual Showcase Inspired by Ad Reference */}
            <div className="lg:col-span-7 relative flex items-center justify-center p-3 sm:p-6 md:p-8 bg-gradient-to-b from-slate-800/40 to-slate-950/60 min-h-[380px] sm:min-h-[480px] md:min-h-[540px]">
              
              {/* Floating Highlight Badges */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  GALAXY S26 ULTRA 5G
                </span>
                <span className="bg-amber-500/90 text-black text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-md shadow-md w-fit">
                  SAVE ₹10,000 TODAY
                </span>
              </div>

              {/* Heart/Save Button */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`absolute top-4 right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
                  isLiked
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    : "bg-black/30 text-white/80 hover:text-white border border-white/10"
                }`}
                aria-label="Wishlist S26 Ultra"
              >
                <FontAwesomeIcon icon={faHeart} className="text-sm sm:text-base" />
              </button>

              {/* Product Hero Image */}
              <Link
                href="/products/samsung-s26-ultra"
                className="relative w-full max-w-[480px] aspect-[4/5] sm:aspect-square md:aspect-[4/3] flex items-center justify-center group cursor-pointer"
              >
                <Image
                  src={product.image}
                  alt="Samsung Galaxy S26 Ultra 5G"
                  fill
                  className="object-contain p-2 sm:p-4 drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  priority
                  sizes="(max-width: 768px) 100vw, 55vw"
                />

                {/* Subtle Floating Feature Tag on Image */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide">
                    Next-Gen S-Pen &amp; 200MP
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Column: Spec Cards, Price, Bank Offers & Actions */}
            <div className="lg:col-span-5 p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full bg-slate-900/60 border-t lg:border-t-0 lg:border-l border-slate-700/50">
              <div>
                {/* Title & Ratings */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-400/30">
                    <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                    <span>5.0</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    (2,450 Verified Reviews)
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" />
                    Official Sealed Box
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-3">
                  Samsung Galaxy S26 Ultra 5G
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-5">
                  Engineered with Titanium Armor, Snapdragon 8 Elite, ultra-responsive 120Hz Dynamic AMOLED 2X, and revolutionary Galaxy AI with S-Pen.
                </p>

                {/* Interactive Key Features Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveFeature(idx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        activeFeature === idx
                          ? "bg-slate-800 border-emerald-500/80 shadow-md shadow-emerald-500/10"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-emerald-400">
                          <FontAwesomeIcon icon={feat.icon} />
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-white truncate">
                          {feat.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Display */}
                <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800/90 mb-5">
                  <div className="flex items-baseline gap-2.5 mb-1">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-slate-500 line-through">
                      ₹{product.original_price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                      {discountPercent}% OFF
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-1">
                    <span className="text-sky-300 font-semibold">
                      ₹11,666/mo with 0% No Cost EMI
                    </span>
                    <span className="text-emerald-400 font-bold">
                      ✓ In Stock (Express Dispatch)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-95 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <FontAwesomeIcon icon={faCartPlus} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleQuickBuy}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faBolt} />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* AJIO-Style Seamless Bottom CTA Bar */}
          <Link
            href="/products/samsung-s26-ultra"
            className="w-full bg-[#8c824b] hover:bg-[#9d9255] active:bg-[#7b7241] text-white py-3.5 px-6 flex items-center justify-between transition-colors cursor-pointer border-t border-white/10 group"
          >
            <span className="text-sm sm:text-base font-bold tracking-wide">
              Shop now
            </span>
            <div className="flex items-center gap-2 text-white/90 group-hover:translate-x-1 transition-transform">
              <span className="text-xs font-semibold hidden sm:inline">
                View S26 Ultra Details &amp; Offers
              </span>
              <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
            </div>
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="text-base" />
            <span>Added Samsung Galaxy S26 Ultra to Cart!</span>
            <Link href="/cart" className="ml-2 underline font-extrabold text-white">
              View Cart
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
