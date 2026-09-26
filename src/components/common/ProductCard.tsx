"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import QuantityModal from "./QuantityModal";
import ProductDetailModal from "./ProductDetailModal";
import { useCart } from "@/context/CartContext";
import { 
  faStar, 
  faBolt, 
  faEye, 
  faCartPlus, 
  faHeart, 
  faShieldHalved,
  faChevronRight,
  faArrowDown
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  original_price?: number;
  image?: string;
  image_url?: string;
  description: string;
  is_out_of_stock?: boolean;
  categories?: { name: string };
  rating?: number;
  reviews_count?: number;
  is_popular?: boolean;
}

export default function ProductCard({ 
  product, 
  viewMode = "grid" 
}: { 
  product: Product; 
  viewMode?: "grid" | "list";
}) {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const router = useRouter();
  
  const normalizeImageUrl = (url?: string) => {
    if (!url) return "/mobile-logo.png";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) return url;
    return `/${url}`;
  };

  const displayImage = normalizeImageUrl(product.image_url || product.image);
  const [imgSrc, setImgSrc] = useState(displayImage);
  const displayCategory = product.categories?.name || product.category || "Smartphones";
  const isOutOfStock = product.is_out_of_stock;

  const originalPrice = product.original_price && product.original_price > product.price 
    ? product.original_price 
    : Math.round(product.price * 1.18);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const savings = Math.max(0, originalPrice - product.price);
  const bankOfferPrice = Math.round(product.price * 0.92);
  const emiPerMonth = Math.round(product.price / 12);
  const reviewsDisplay = product.reviews_count ? `${(product.reviews_count / 1000).toFixed(1)}K+` : "4.3K+";
  const brandName = product.name.split(" ")[0] || "Official";

  React.useEffect(() => {
    setImgSrc(displayImage);
  }, [displayImage]);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsModalOpen(true);
  };

  const handleAddToCart = (quantity: number, selectedUnit: string, price: number) => {
    if (isOutOfStock) return;
    addToCart({ 
      ...product, 
      quantity, 
      selectedUnit,
      price,
      image: displayImage,
      category: displayCategory
    });
  };

  const handleBuyNow = (quantity: number, selectedUnit: string, price: number) => {
    if (isOutOfStock) return;
    addToCart({ 
      ...product, 
      quantity, 
      selectedUnit,
      price,
      image: displayImage,
      category: displayCategory
    });
    setIsModalOpen(false);
    setIsDetailOpen(false);
    router.push("/cart");
  };

  return (
    <>
      {/* ===================== 1. FLIPKART STYLE MOBILE VIEW (SCREENSHOT EXACT) ===================== */}
      <div 
        onClick={() => setIsDetailOpen(true)}
        className="block md:hidden bg-white border-b border-slate-200 py-3.5 px-2.5 active:bg-slate-50/70 transition-colors cursor-pointer relative"
      >
        <div className="flex items-start gap-3">
          {/* Left: Product Image Box with Bestseller Badge */}
          <div className="relative w-28 h-36 flex-shrink-0 bg-white rounded-lg flex items-center justify-center p-1.5">
            {product.is_popular && (
              <span className="absolute top-0 left-0 z-10 bg-[#2874f0] text-white text-[9px] font-black px-1.5 py-0.5 rounded-br-md shadow-xs">
                Bestseller
              </span>
            )}
            
            {imgSrc ? (
              <Image 
                src={imgSrc} 
                alt={product.name} 
                fill 
                className="object-contain p-1" 
                onError={() => setImgSrc("/placeholder.png")}
                unoptimized
              />
            ) : (
              <div className="text-xs text-gray-300">No Image</div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-lg">
                <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[9px] uppercase">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex-1 min-w-0">
            {/* Title & Wishlist */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                {product.name}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                className={`p-1 flex-shrink-0 transition-colors ${
                  isWishlisted ? "text-red-500" : "text-slate-400 hover:text-red-500"
                }`}
                aria-label="Wishlist"
              >
                <FontAwesomeIcon icon={faHeart} className="text-sm" />
              </button>
            </div>

            {/* Rating & Assured Badge */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="bg-[#388e3c] text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 leading-none">
                <span>{product.rating || 4.1}</span>
                <FontAwesomeIcon icon={faStar} className="text-[7px]" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{reviewsDisplay}</span>
              <div className="flex items-center gap-1 text-[10px] font-black italic text-[#2874f0] bg-blue-50 px-1.5 py-0.5 rounded">
                <FontAwesomeIcon icon={faShieldHalved} className="text-[9px]" />
                <span>Assured</span>
              </div>
            </div>

            {/* Pricing Row: Discount % + MRP + Price */}
            <div className="flex items-baseline gap-1.5 mb-0.5 flex-wrap">
              {discountPercent > 0 && (
                <span className="text-xs font-black text-[#388e3c] flex items-center">
                  <FontAwesomeIcon icon={faArrowDown} className="text-[9px] mr-0.5" />
                  {discountPercent}%
                </span>
              )}
              {originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                </span>
              )}
              <span className="text-sm font-black text-slate-900">
                ₹{Math.floor(product.price).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Bank Offer Row */}
            <div className="flex items-baseline gap-1 mb-1 text-xs">
              <span className="font-black italic text-[#2874f0]">wow!</span>
              <span className="font-black text-[#2874f0]">
                ₹{bankOfferPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">with Bank offer</span>
            </div>

            {/* Stock / Deal info */}
            <div className="text-[11px] font-bold text-rose-600 mb-0.5">
              Only few left
            </div>

            {/* Delivery & Warranty */}
            <div className="text-[11px] text-slate-600 font-medium mb-0.5">
              Get it by <span className="font-bold text-slate-900">Tomorrow</span>
            </div>
            <div className="text-[10px] text-slate-400 mb-1.5">
              1 year warranty by {brandName}
            </div>

            {/* Bottom Actions: View All Variants link + Quick Add */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-black text-[#2874f0] flex items-center gap-1 hover:underline">
                <span>View All Variants</span>
                <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
              </span>

              <button
                onClick={handleOpenModal}
                disabled={isOutOfStock}
                className={`text-[10px] font-black px-2.5 py-1 rounded-md transition-all flex items-center gap-1 shadow-xs active:scale-95 ${
                  isOutOfStock 
                    ? "bg-slate-100 text-slate-400" 
                    : "bg-secondary text-white hover:bg-[#255732]"
                }`}
              >
                <FontAwesomeIcon icon={faCartPlus} className="text-[9px]" />
                <span>ADD</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== 2. DESKTOP VIEW (GRID / LIST MODE) ===================== */}
      <div className="hidden md:block h-full">
        {viewMode === "list" ? (
          /* Desktop List Row */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => setIsDetailOpen(true)}
            className={`group bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 hover:border-secondary/50 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-6 relative cursor-pointer h-full ${isOutOfStock ? "opacity-75 grayscale-[0.4]" : ""}`}
          >
            <div className="relative w-44 h-44 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-3 flex-shrink-0 group-hover:bg-slate-50/40 transition-colors">
              {discountPercent > 0 && !isOutOfStock && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-[#f97316] text-white font-black px-2 py-0.5 rounded-md text-[10px] uppercase tracking-tight shadow-xs">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
              {imgSrc ? (
                <Image 
                  src={imgSrc} 
                  alt={product.name} 
                  fill 
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" 
                  onError={() => setImgSrc("/placeholder.png")}
                  unoptimized
                />
              ) : (
                <div className="text-xs text-gray-300">No Image</div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {displayCategory}
                  </span>
                  <div className="bg-[#388e3c] text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <span>{product.rating || 4.8}</span>
                    <FontAwesomeIcon icon={faStar} className="text-[7px]" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">({reviewsDisplay} reviews)</span>
                  <div className="flex items-center gap-1 text-[10px] font-black italic text-[#2874f0] bg-blue-50 px-1.5 py-0.5 rounded">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-[9px]" />
                    <span>Assured</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-secondary transition-colors line-clamp-2 leading-snug mb-1">
                  {product.name}
                </h3>

                <p className="text-xs text-slate-600 font-medium line-clamp-1 mb-2">
                  {product.unit || "Official Brand Warranty • 100% Genuine Device"}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 font-semibold">
                    EMI from ₹{emiPerMonth.toLocaleString("en-IN")}/mo
                  </span>
                  {savings > 0 && (
                    <span className="text-[#388e3c] font-bold">
                      Save ₹{savings.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="w-52 flex-shrink-0 flex flex-col justify-between items-end border-l border-slate-100 pl-5">
              <div className="text-right mb-3">
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-xl font-black text-slate-900 leading-none">
                    ₹{Math.floor(product.price).toLocaleString("en-IN")}
                  </span>
                  {originalPrice > product.price && (
                    <span className="text-xs text-slate-400 line-through font-medium">
                      ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#2874f0] font-bold mt-1">
                  wow! ₹{bankOfferPrice.toLocaleString("en-IN")} with Bank Offer
                </div>
              </div>

              <button 
                onClick={handleOpenModal}
                disabled={isOutOfStock}
                className={`w-full font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-xs active:scale-95 whitespace-nowrap ${
                  isOutOfStock 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-secondary text-white hover:bg-[#255732]"
                }`}
              >
                <FontAwesomeIcon icon={faCartPlus} className="text-xs" />
                <span>{isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Desktop Grid Card */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => setIsDetailOpen(true)}
            className={`group bg-white rounded-2xl md:rounded-3xl p-3 sm:p-4 border border-slate-200/90 hover:border-secondary/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full relative cursor-pointer ${isOutOfStock ? "opacity-75 grayscale-[0.4]" : ""}`}
          >
            <div className="relative aspect-square w-full rounded-xl md:rounded-2xl overflow-hidden bg-white mb-2.5 border border-slate-100 flex items-center justify-center p-3 group-hover:bg-slate-50/40 transition-colors">
              {discountPercent > 0 && !isOutOfStock && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-[#f97316] text-white font-black px-2 py-0.5 rounded-full text-[10px] uppercase tracking-tight shadow-xs">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
              
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWishlisted(!isWishlisted);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all ${
                    isWishlisted ? "bg-red-50 text-red-500" : "bg-white/90 text-slate-400 hover:text-red-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} className="text-xs" />
                </button>
              </div>

              {imgSrc ? (
                <Image 
                  src={imgSrc} 
                  alt={product.name} 
                  fill 
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105" 
                  onError={() => setImgSrc("/placeholder.png")}
                  unoptimized
                />
              ) : (
                <div className="text-xs text-gray-300">No Image</div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded truncate">
                    {displayCategory}
                  </span>
                  <div className="bg-[#388e3c] text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <span>{product.rating || 4.8}</span>
                    <FontAwesomeIcon icon={faStar} className="text-[7px]" />
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-secondary transition-colors line-clamp-2 leading-tight mb-1">
                  {product.name}
                </h3>

                <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mb-1.5">
                  {product.unit || "Official Brand Sealed • 1 Year"}
                </p>
              </div>

              <div className="mt-auto pt-1.5 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-sm sm:text-base font-black text-slate-900 leading-none">
                    ₹{Math.floor(product.price).toLocaleString("en-IN")}
                  </span>
                  {originalPrice > product.price && (
                    <span className="text-xs text-slate-400 line-through font-medium">
                      ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#2874f0] font-bold mb-2">
                  wow! ₹{bankOfferPrice.toLocaleString("en-IN")} with Bank Offer
                </div>

                <button 
                  onClick={handleOpenModal}
                  disabled={isOutOfStock}
                  className={`w-full font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all shadow-xs active:scale-95 whitespace-nowrap ${
                    isOutOfStock 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-secondary text-white hover:bg-[#255732]"
                  }`}
                >
                  <FontAwesomeIcon icon={faCartPlus} className="text-xs" />
                  <span>{isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals for spec selection and quick detail */}
      {!isOutOfStock && (
        <>
          <QuantityModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleAddToCart}
            onBuyNow={handleBuyNow}
            product={{
              ...product,
              image: displayImage,
              category: displayCategory
            }}
          />
          <ProductDetailModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            product={{
              ...product,
              image: displayImage,
              category: displayCategory
            }}
          />
        </>
      )}
    </>
  );
}
