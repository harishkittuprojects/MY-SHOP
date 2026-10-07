"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import QuantityModal from "./QuantityModal";
import ProductDetailModal from "./ProductDetailModal";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { addRecentlyViewedProduct } from "@/lib/recentHistory";
import { 
  faStar, 
  faBolt, 
  faEye, 
  faCartPlus, 
  faHeart, 
  faShieldHalved,
  faBagShopping
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  category: string;
  sub_category?: string;
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
  cashback_amount?: number;
  condition?: string;
  battery_health?: string;
  warranty_period?: string;
}

export default function ProductCard({ 
  product, 
  viewMode = "grid" 
}: { 
  product: Product; 
  viewMode?: "grid" | "list";
}) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
  const reviewsCount = product.reviews_count ?? (product.rating ? Math.round((product.rating * 28)) : 125);
  const ratingScore = product.rating ? Number(product.rating).toFixed(1) : "4.7";

  React.useEffect(() => {
    setImgSrc(displayImage);
  }, [displayImage]);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsModalOpen(true);
  };

  const handleDirectAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart({ 
      ...product, 
      quantity: 1, 
      selectedUnit: product.unit || "1 Piece",
      price: product.price,
      image: displayImage,
      category: displayCategory
    });
  };

  const handleDirectBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart({ 
      ...product, 
      quantity: 1, 
      selectedUnit: product.unit || "1 Piece",
      price: product.price,
      image: displayImage,
      category: displayCategory
    });
    router.push("/cart");
  };

  const handleAddToCartModal = (quantity: number, selectedUnit: string, price: number) => {
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

  const handleBuyNowModal = (quantity: number, selectedUnit: string, price: number) => {
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
      {viewMode === "list" ? (
        /* ===================== LIST VIEW CARD ===================== */
        <div 
          onClick={() => router.push(`/products/${product.id}`)}
          className={`group bg-white rounded-2xl p-3 sm:p-4 md:p-5 border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative cursor-pointer h-full ${
            isOutOfStock ? "opacity-75 grayscale-[0.4]" : ""
          }`}
        >
          {/* Fixed-Height / Square Image Container */}
          <div className="relative w-full sm:w-44 md:w-48 h-44 sm:h-44 md:h-48 bg-[#f8fafc] sm:bg-[#fafafa] rounded-xl flex items-center justify-center p-3 shrink-0 overflow-hidden border border-slate-100">
            {discountPercent > 0 && !isOutOfStock && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-[#f97316] text-white font-black px-2 py-0.5 rounded-md text-[10px] uppercase tracking-tight shadow-xs">
                  {discountPercent}% OFF
                </span>
              </div>
            )}
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product as any);
              }}
              className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-xs backdrop-blur-xs transition-all active:scale-90 ${
                isWishlisted ? "bg-red-50 text-red-500" : "bg-white/90 text-slate-400 hover:text-red-500"
              }`}
              title={isWishlisted ? "In your Wishlist" : "Add to Wishlist"}
            >
              <FontAwesomeIcon icon={faHeart} className="text-xs" />
            </button>

            {imgSrc ? (
              <Image 
                src={imgSrc} 
                alt={product.name} 
                fill 
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" 
                onError={() => setImgSrc("/placeholder.png")}
                unoptimized
              />
            ) : (
              <div className="text-xs text-gray-300">No Image</div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-20">
                <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wide">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {displayCategory}
                </span>
                <div className="bg-[#388e3c] text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span>{ratingScore}</span>
                  <FontAwesomeIcon icon={faStar} className="text-[7px]" />
                </div>
                <span className="text-xs text-slate-400 font-medium">({reviewsCount})</span>
                <div className="flex items-center gap-0.5 text-[10px] font-black italic text-[#2874f0]">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-[9px]" />
                  <span>Assured</span>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-secondary transition-colors line-clamp-2 leading-snug mb-1">
                {product.name}
              </h3>

              <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-medium">
                {product.unit || "Official Brand Sealed • Genuine Product"}
              </p>
            </div>

            <div className="flex flex-wrap items-baseline gap-2 mb-3">
              <span className="text-lg font-black text-slate-900">
                ₹{Math.floor(product.price).toLocaleString("en-IN")}
              </span>
              {originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-[#388e3c]">
                  {discountPercent}% off
                </span>
              )}
            </div>

            {/* List Action Buttons (MY SHOP Brand Gold & Emerald Green) */}
            <div className="flex items-center gap-2 max-w-xs">
              <button
                type="button"
                onClick={handleDirectAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 font-black py-2 px-3 rounded-xl bg-[#E9CF6A] hover:bg-[#dec253] text-slate-950 border border-[#d4b94a] text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs cursor-pointer ${
                  isOutOfStock ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed" : ""
                }`}
              >
                <FontAwesomeIcon icon={faCartPlus} className="text-xs" />
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                onClick={handleDirectBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 font-black py-2 px-3 rounded-xl bg-[#2E6F40] text-white hover:bg-[#245e35] text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs border border-[#245e35] cursor-pointer ${
                  isOutOfStock ? "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200" : ""
                }`}
              >
                <FontAwesomeIcon icon={faBagShopping} className="text-xs" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ===================== AMAZON / FLIPKART STYLE RECTANGULAR BOX GRID CARD ===================== */
        <div 
          onClick={() => {
            addRecentlyViewedProduct(product.id);
            router.push(`/products/${product.id}`);
          }}
          className={`group h-full bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer p-2.5 sm:p-3.5 ${
            isOutOfStock ? "opacity-75 grayscale-[0.4]" : ""
          }`}
        >
          <div>
            {/* 1. FIXED-HEIGHT IMAGE CONTAINER */}
            <div className="relative w-full h-36 sm:h-44 md:h-48 bg-[#f8fafc] sm:bg-[#fafafa] rounded-xl flex items-center justify-center p-2 sm:p-3 overflow-hidden mb-2.5 shrink-0 border border-slate-100/80">
              {/* Discount Badge */}
              {discountPercent > 0 && !isOutOfStock && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-[#f97316] text-white font-black px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] uppercase tracking-tight shadow-xs">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}

              {/* Wishlist Button */}
              <div className="absolute top-2 right-2 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product as any);
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs backdrop-blur-xs transition-all active:scale-90 ${
                    isWishlisted ? "bg-red-50 text-red-500" : "bg-white/90 text-slate-400 hover:text-red-500"
                  }`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  title={isWishlisted ? "In your Wishlist" : "Add to Wishlist"}
                >
                  <FontAwesomeIcon icon={faHeart} className="text-[11px] sm:text-xs" />
                </button>
              </div>

              {/* Centered, Non-Stretched Product Image */}
              {imgSrc ? (
                <Image 
                  src={imgSrc} 
                  alt={product.name} 
                  fill 
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" 
                  onError={() => setImgSrc("/placeholder.png")}
                  unoptimized
                />
              ) : (
                <div className="text-xs text-gray-300">No Image</div>
              )}

              {/* Out of Stock Ribbon */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[8px] sm:text-[9px] uppercase tracking-wide">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* 2. PRODUCT DETAILS SECTION */}
            {/* Category / Assured Tag */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[110px]">
                {displayCategory}
              </span>
              <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black italic text-[#2874f0]">
                <FontAwesomeIcon icon={faShieldHalved} className="text-[8px]" />
                <span>Assured</span>
              </div>
            </div>

            {/* Reserved Fixed-Height Product Title */}
            <h3 className="h-9 sm:h-10 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-secondary transition-colors line-clamp-2 leading-snug mb-1">
              {product.name}
            </h3>

            {/* Ratings & Reviews Row */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="bg-[#388e3c] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                <span>{ratingScore}</span>
                <FontAwesomeIcon icon={faStar} className="text-[7px]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                ({reviewsCount})
              </span>
            </div>

            {/* Price, MRP & Discount Row */}
            <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
              <span className="text-sm sm:text-base font-black text-slate-900 leading-none">
                ₹{Math.floor(product.price).toLocaleString("en-IN")}
              </span>
              {originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through font-normal">
                  ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-[10px] sm:text-xs font-bold text-[#388e3c]">
                  {discountPercent}% off
                </span>
              )}
            </div>
          </div>

          {/* 3. CONSISTENT BOTTOM ACTION BUTTONS (MY SHOP Brand Gold & Emerald Green) */}
          <div className="mt-auto pt-2.5 border-t border-slate-100">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed text-center"
              >
                Out of Stock
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 w-full">
                <button
                  type="button"
                  onClick={handleDirectAddToCart}
                  className="w-full py-2 px-1 rounded-xl bg-[#E9CF6A] hover:bg-[#dec253] text-slate-950 text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 shadow-2xs border border-[#d4b94a] cursor-pointer"
                  title="Add to Cart"
                >
                  <FontAwesomeIcon icon={faCartPlus} className="text-[10px] shrink-0 text-slate-900" />
                  <span className="truncate">Add to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={handleDirectBuyNow}
                  className="w-full py-2 px-1 rounded-xl bg-[#2E6F40] hover:bg-[#245e35] text-white text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 shadow-xs border border-[#245e35] cursor-pointer"
                  title="Buy Now"
                >
                  <FontAwesomeIcon icon={faBagShopping} className="text-[10px] shrink-0 text-white" />
                  <span className="truncate">Buy Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals for spec selection and quick detail if needed */}
      {!isOutOfStock && (
        <>
          <QuantityModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleAddToCartModal}
            onBuyNow={handleBuyNowModal}
            product={{
              ...product,
              image: displayImage,
              category: displayCategory
            }}
          />
          <ProductDetailModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            onAddToCart={handleAddToCartModal}
            onBuyNow={handleBuyNowModal}
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

