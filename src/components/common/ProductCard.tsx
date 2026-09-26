"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import QuantityModal from "./QuantityModal";
import ProductDetailModal from "./ProductDetailModal";
import { useCart } from "@/context/CartContext";
import { faStar, faBolt, faEye, faCartPlus, faHeart } from "@fortawesome/free-solid-svg-icons";
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
    : Math.round(product.price * 1.08);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const savings = Math.max(0, originalPrice - product.price);
  const emiPerMonth = Math.round(product.price / 12);

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

  // ===================== LIST VIEW STYLE (ROWS) =====================
  if (viewMode === "list") {
    return (
      <>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => setIsDetailOpen(true)}
          className={`group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200/90 hover:border-secondary/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 relative cursor-pointer ${isOutOfStock ? "opacity-75 grayscale-[0.4]" : ""}`}
        >
          {/* List Image Container */}
          <div className="relative w-full sm:w-40 sm:h-40 md:w-48 md:h-48 aspect-square sm:aspect-auto rounded-lg sm:rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-2.5 sm:p-3 flex-shrink-0 group-hover:bg-slate-50/40 transition-colors">
            {discountPercent > 0 && !isOutOfStock && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-[#f97316] text-white font-black px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] uppercase tracking-tight shadow-xs">
                  {discountPercent}% OFF
                </span>
              </div>
            )}

            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                aria-label="Wishlist"
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all ${
                  isWishlisted ? "bg-red-50 text-red-500" : "bg-white/90 text-slate-400 hover:text-red-500"
                }`}
              >
                <FontAwesomeIcon icon={faHeart} className="text-[10px] sm:text-xs" />
              </button>
            </div>

            {imgSrc ? (
              <Image 
                src={imgSrc} 
                alt={product.name || "Product"} 
                fill 
                className={`object-contain p-2.5 transition-transform duration-500 ${!isOutOfStock ? "group-hover:scale-105" : ""}`} 
                onError={() => setImgSrc("/placeholder.png")}
                unoptimized
              />
            ) : (
              <div className="italic text-gray-300 text-xs">No Image</div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-widest shadow-xl">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* List Middle Details */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
                <span className="bg-slate-100 text-slate-700 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded">
                  {displayCategory}
                </span>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold border border-emerald-200/60">
                  <span>{product.rating || 4.8}</span>
                  <FontAwesomeIcon icon={faStar} className="text-[8px] text-amber-500" />
                  <span className="text-slate-400 font-normal">({product.reviews_count || 120})</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50/80 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                  <FontAwesomeIcon icon={faBolt} className="text-amber-500 text-[8px]" />
                  Express Delivery
                </span>
              </div>

              <h3 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-secondary transition-colors line-clamp-2 leading-tight mb-1">
                {product.name}
              </h3>

              <p className="text-[10px] sm:text-xs text-slate-600 font-medium line-clamp-1 sm:line-clamp-2 mb-1.5">
                {product.unit || "Official Brand Warranty • 100% Genuine Device"}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium pt-0.5">
              <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 font-semibold text-[9px] sm:text-[10px]">
                EMI from ₹{emiPerMonth.toLocaleString("en-IN")}/mo
              </span>
              {savings > 0 && (
                <span className="text-emerald-700 font-bold text-[9px] sm:text-[10px]">
                  Save ₹{savings.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* List Right Price & CTA */}
          <div className="sm:w-44 md:w-52 flex-shrink-0 flex flex-col justify-between sm:items-end pt-2 sm:pt-0 sm:border-l sm:border-slate-100 sm:pl-4">
            <div className="sm:text-right mb-2">
              <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                <span className="text-base sm:text-xl font-black text-slate-900 leading-none">
                  ₹{Math.floor(product.price).toLocaleString("en-IN")}
                </span>
                {originalPrice > product.price && (
                  <span className="text-[11px] sm:text-xs text-slate-400 line-through font-medium sm:mt-1">
                    ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:w-full gap-1.5">
              <button 
                onClick={handleOpenModal}
                disabled={isOutOfStock}
                className={`w-full font-black py-2 px-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all shadow-xs active:scale-95 whitespace-nowrap ${
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

  // ===================== GRID VIEW STYLE (SLEEK COMPACT MADUR.IN CARD) =====================
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={() => setIsDetailOpen(true)}
        className={`group bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-3 md:p-4 border border-slate-200/90 hover:border-secondary/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full relative cursor-pointer ${isOutOfStock ? "opacity-75 grayscale-[0.4]" : ""}`}
      >
        {/* Compact Square Image Container */}
        <div className="relative aspect-square w-full rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-white mb-2 sm:mb-2.5 border border-slate-100 flex items-center justify-center p-1.5 sm:p-2.5 md:p-3 group-hover:bg-slate-50/40 transition-colors">
          
          {/* Top Left Discount Badge */}
          {discountPercent > 0 && !isOutOfStock && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
              <span className="bg-[#f97316] text-white font-black px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] uppercase tracking-tight shadow-xs flex items-center gap-0.5">
                <span>{discountPercent}% OFF</span>
              </span>
            </div>
          )}

          {/* Top Right Wishlist */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 flex flex-col gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
              aria-label="Wishlist"
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-xs backdrop-blur-md transition-all ${
                isWishlisted ? "bg-red-50 text-red-500" : "bg-white/90 text-slate-400 hover:text-red-500"
              }`}
            >
              <FontAwesomeIcon icon={faHeart} className="text-[9px] sm:text-xs" />
            </button>
          </div>

          {/* Centered Product Poster */}
          {imgSrc ? (
            <Image 
              src={imgSrc} 
              alt={product.name || "Product"} 
              fill 
              className={`object-contain p-1.5 sm:p-2 transition-transform duration-500 ${!isOutOfStock ? "group-hover:scale-105" : ""}`} 
              onError={() => setImgSrc("/placeholder.png")}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center italic text-gray-300 text-xs">
              No Image
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20">
              <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[8px] sm:text-[10px] uppercase tracking-widest shadow-xl">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Details (Compact Madur.in layout) */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Category & Rating Pill Row */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="bg-slate-100 text-slate-700 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded truncate max-w-[90px] sm:max-w-none">
                {displayCategory}
              </span>
              <div className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold border border-emerald-200/60 flex-shrink-0">
                <span>{product.rating || 4.8}</span>
                <FontAwesomeIcon icon={faStar} className="text-[7px] text-amber-500" />
              </div>
            </div>

            {/* Product Title */}
            <h3 className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 group-hover:text-secondary transition-colors line-clamp-2 leading-tight mb-1">
              {product.name}
            </h3>

            {/* Storage / Variant Snippet */}
            <p className="text-[9px] sm:text-[10px] text-slate-500 line-clamp-1 mb-1.5">
              {product.unit || "Official Brand Sealed • 1 Year"}
            </p>
          </div>

          {/* Price Block */}
          <div className="mt-auto pt-1.5 border-t border-slate-100">
            <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
              <span className="text-xs sm:text-sm md:text-base font-black text-slate-900 leading-none">
                ₹{Math.floor(product.price).toLocaleString("en-IN")}
              </span>
              {originalPrice > product.price && (
                <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 line-through font-medium">
                  ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Savings (Compact row) */}
            {savings > 0 && (
              <div className="text-[9px] sm:text-[10px] text-emerald-700 font-bold mb-1.5 leading-none">
                Save ₹{savings.toLocaleString("en-IN")}
              </div>
            )}

            {/* CTA Add to Cart Button */}
            <button 
              onClick={handleOpenModal}
              disabled={isOutOfStock}
              className={`w-full font-black py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 text-[10px] sm:text-xs transition-all shadow-xs active:scale-95 whitespace-nowrap ${
                isOutOfStock 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-secondary text-white hover:bg-[#255732]"
              }`}
            >
              <FontAwesomeIcon icon={faCartPlus} className="text-[9px] sm:text-xs" />
              <span>{isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}</span>
            </button>
          </div>
        </div>
      </motion.div>

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
