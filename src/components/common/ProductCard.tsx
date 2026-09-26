"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import QuantityModal from "./QuantityModal";
import ProductDetailModal from "./ProductDetailModal";
import { useCart } from "@/context/CartContext";
import { faStar, faBolt, faEye, faCartPlus, faHeart, faCheck, faBagShopping } from "@fortawesome/free-solid-svg-icons";
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

  // ===================== LIST VIEW STYLE =====================
  if (viewMode === "list") {
    return (
      <>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => setIsDetailOpen(true)}
          className={`group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-secondary/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 relative cursor-pointer ${isOutOfStock ? "opacity-75 grayscale-[0.4]" : ""}`}
        >
          {/* List Image Container */}
          <div className="relative w-full sm:w-44 sm:h-44 md:w-52 md:h-52 aspect-square sm:aspect-auto rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-3 flex-shrink-0 group-hover:bg-slate-50/40 transition-colors">
            {discountPercent > 0 && !isOutOfStock && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-[#f97316] text-white font-extrabold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tight shadow-xs">
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
                alt={product.name || "Product"} 
                fill 
                className={`object-contain p-3 transition-transform duration-500 ${!isOutOfStock ? "group-hover:scale-105" : ""}`} 
                onError={() => setImgSrc("/placeholder.png")}
                unoptimized
              />
            ) : (
              <div className="italic text-gray-300 text-xs">No Image</div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                <span className="bg-red-600 text-white font-black px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest shadow-xl">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* List Middle Details */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {displayCategory}
                </span>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-emerald-200/60">
                  <span>{product.rating || 4.8}</span>
                  <FontAwesomeIcon icon={faStar} className="text-[8px] text-amber-500" />
                  <span className="text-slate-400 font-normal">({product.reviews_count || 120})</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                  <FontAwesomeIcon icon={faBolt} className="text-amber-500 text-[9px]" />
                  Express Delivery
                </span>
              </div>

              <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 group-hover:text-secondary transition-colors line-clamp-2 leading-snug mb-1.5">
                {product.name}
              </h3>

              <p className="text-xs text-slate-600 font-medium line-clamp-2 mb-2">
                {product.unit || "Official Brand Warranty • 100% Genuine Device"}
              </p>

              {product.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2 hidden sm:block mb-2">
                  {product.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium pt-1">
              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 font-semibold">
                EMI from ₹{emiPerMonth.toLocaleString("en-IN")}/mo
              </span>
              {savings > 0 && (
                <span className="text-emerald-700 font-bold">
                  Save ₹{savings.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* List Right Price & CTA Section */}
          <div className="sm:w-48 md:w-56 flex-shrink-0 flex flex-col justify-between sm:items-end pt-3 sm:pt-0 sm:border-l sm:border-slate-100 sm:pl-5">
            <div className="sm:text-right mb-3">
              <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                <span className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-none">
                  ₹{Math.floor(product.price).toLocaleString("en-IN")}
                </span>
                {originalPrice > product.price && (
                  <span className="text-xs text-slate-400 line-through font-medium sm:mt-1">
                    ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold hidden sm:block mt-1">
                Inclusive of all taxes
              </span>
            </div>

            <div className="flex flex-col sm:w-full gap-2">
              <button 
                onClick={handleOpenModal}
                disabled={isOutOfStock}
                className={`w-full font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-sm active:scale-95 ${
                  isOutOfStock 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-secondary text-white hover:bg-[#255732] hover:shadow-md"
                }`}
              >
                <FontAwesomeIcon icon={faCartPlus} className="text-xs" />
                <span>{isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDetailOpen(true);
                }}
                className="w-full text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 font-bold py-1.5 px-3 rounded-lg text-[11px] transition-colors border border-slate-200/60"
              >
                View Details
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

  // ===================== GRID VIEW STYLE (CARD FORMAT) =====================
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={() => setIsDetailOpen(true)}
        className={`group bg-white rounded-2xl md:rounded-3xl p-3 sm:p-4 border border-slate-200/90 hover:border-secondary/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative cursor-pointer ${isOutOfStock ? "opacity-75 grayscale-[0.4]" : ""}`}
      >
        {/* Poorvika Style Image Container */}
        <div className="relative aspect-square w-full rounded-xl md:rounded-2xl overflow-hidden bg-white mb-3 border border-slate-100 flex items-center justify-center p-3 sm:p-4 group-hover:bg-slate-50/40 transition-colors">
          
          {/* Top Left Discount Badge */}
          {discountPercent > 0 && !isOutOfStock && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-tight shadow-sm flex items-center gap-1">
                <span>{discountPercent}% OFF</span>
              </span>
            </div>
          )}

          {/* Top Right Actions (Wishlist & Quick View) */}
          <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
              aria-label="Wishlist"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all ${
                isWishlisted ? "bg-red-50 text-red-500" : "bg-white/90 text-slate-400 hover:text-red-500"
              }`}
            >
              <FontAwesomeIcon icon={faHeart} className="text-xs" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailOpen(true);
              }}
              aria-label="Quick View"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-secondary hover:text-white text-slate-600 flex items-center justify-center shadow-md backdrop-blur-md transition-all hidden sm:flex"
            >
              <FontAwesomeIcon icon={faEye} className="text-xs" />
            </button>
          </div>

          {/* Centered Product Poster */}
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
            <div className="w-full h-full flex items-center justify-center italic text-gray-300 text-xs">
              No Image
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20">
              <span className="bg-red-600 text-white font-black px-3 py-1 rounded-lg text-xs uppercase tracking-widest shadow-xl">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Details (Poorvika Layout) */}
        <div className="flex-1 flex flex-col">
          {/* Brand/Category & Ratings Row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="bg-slate-100 text-slate-700 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
              {displayCategory}
            </span>
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-emerald-200/60">
              <span>{product.rating || 4.8}</span>
              <FontAwesomeIcon icon={faStar} className="text-[8px] text-amber-500" />
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-secondary transition-colors line-clamp-2 leading-snug mb-1">
            {product.name}
          </h3>

          {/* Storage / Variant snippet */}
          <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mb-2">
            {product.unit || "Official Brand Sealed • 1 Year Warranty"}
          </p>

          {/* Price & Savings Block (Poorvika Signature) */}
          <div className="mt-auto pt-2 border-t border-slate-100">
            <div className="flex items-baseline gap-2 flex-wrap mb-1">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                ₹{Math.floor(product.price).toLocaleString("en-IN")}
              </span>
              {originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Savings & EMI note */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-3">
              {savings > 0 ? (
                <span className="text-emerald-700 font-bold">
                  Save ₹{savings.toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="text-slate-500 font-medium">Best Price Online</span>
              )}
              <span className="text-slate-500 text-[9px] sm:text-[10px] font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                EMI from ₹{emiPerMonth.toLocaleString("en-IN")}/mo
              </span>
            </div>

            {/* Express Delivery Badge */}
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-emerald-800 font-semibold mb-2.5">
              <FontAwesomeIcon icon={faBolt} className="text-amber-500 text-[10px]" />
              <span>Express Delivery Available</span>
            </div>

            {/* CTA Add to Cart / Buy Now Button */}
            <button 
              onClick={handleOpenModal}
              disabled={isOutOfStock}
              className={`w-full font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-sm active:scale-95 ${
                isOutOfStock 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-secondary text-white hover:bg-[#255732] hover:shadow-md"
              }`}
            >
              <FontAwesomeIcon icon={faCartPlus} className="text-xs" />
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
