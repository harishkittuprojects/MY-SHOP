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
  faCartPlus, 
  faHeart, 
  faShieldHalved,
  faBagShopping,
  faBolt
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

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
  const displayCategory = product.categories?.name || product.category || "Mobiles";
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
          onClick={() => {
            addRecentlyViewedProduct(product.id);
            router.push(`/products/${product.id}`);
          }}
          className={`group bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 hover:border-[#2E6F40]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative cursor-pointer h-full ${
            isOutOfStock ? "opacity-75 grayscale-[0.4]" : ""
          }`}
        >
          {/* Square Image Container */}
          <div className="relative w-full sm:w-44 md:w-48 h-44 sm:h-44 md:h-48 bg-slate-50/80 rounded-xl flex items-center justify-center p-3 shrink-0 overflow-hidden border border-slate-100">
            {discountPercent > 0 && !isOutOfStock && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <FontAwesomeIcon icon={faBolt} className="text-[8px]" />
                  <span>{discountPercent}% OFF</span>
                </span>
              </div>
            )}
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product as any);
              }}
              className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-xs bg-white/90 backdrop-blur-md border border-white hover:bg-white text-slate-400 hover:text-rose-500 transition-all active:scale-90 ${
                isWishlisted ? "bg-rose-50 text-rose-500" : ""
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
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-20">
                <span className="bg-red-600 text-white font-black px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {displayCategory}
                </span>
                <div className="bg-[#388e3c] text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-2xs">
                  <span>{ratingScore}</span>
                  <FontAwesomeIcon icon={faStar} className="text-[7px]" />
                </div>
                <span className="text-xs text-slate-400 font-medium">({reviewsCount})</span>
                <div className="flex items-center gap-0.5 text-[10px] font-black italic text-[#2874f0]">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-[9px]" />
                  <span>Assured</span>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#2E6F40] transition-colors line-clamp-2 leading-snug mb-1">
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
                <span className="text-xs text-slate-400 line-through font-normal">
                  ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-emerald-600">
                  {discountPercent}% off
                </span>
              )}
            </div>

            {/* List Action Buttons */}
            <div className="flex items-center gap-2 max-w-xs">
              <button
                type="button"
                onClick={handleDirectAddToCart}
                disabled={isOutOfStock}
                className={`w-10 h-10 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-2xs cursor-pointer ${
                  isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Add to Cart"
              >
                <FontAwesomeIcon icon={faCartPlus} className="text-sm text-amber-800" />
              </button>
              <button
                type="button"
                onClick={handleDirectBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 h-10 rounded-xl bg-[#2E6F40] hover:bg-[#245e35] text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs cursor-pointer ${
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
        /* ===================== ULTRA-PREMIUM GRID CARD ===================== */
        <div 
          onClick={() => {
            addRecentlyViewedProduct(product.id);
            router.push(`/products/${product.id}`);
          }}
          className={`group h-full bg-white rounded-2xl border border-slate-200/80 hover:border-[#2E6F40]/50 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(46,111,64,0.1)] transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer p-2 sm:p-3 ${
            isOutOfStock ? "opacity-75 grayscale-[0.4]" : ""
          }`}
        >
          <div>
            {/* 1. SQUARE CLEAN IMAGE WRAPPER */}
            <div className="relative w-full aspect-square bg-slate-50/70 rounded-xl flex items-center justify-center p-2 overflow-hidden mb-2 shrink-0 border border-slate-100/90 group-hover:bg-slate-50/40 transition-colors">
              
              {/* Sleek Floating Discount Badge */}
              {discountPercent > 0 && !isOutOfStock && (
                <div className="absolute top-1.5 left-1.5 z-10">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-0.5">
                    <FontAwesomeIcon icon={faBolt} className="text-[7px]" />
                    <span>{discountPercent}% OFF</span>
                  </span>
                </div>
              )}

              {/* Glassmorphic Wishlist Button */}
              <div className="absolute top-1.5 right-1.5 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product as any);
                  }}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-xs bg-white/90 backdrop-blur-md border border-white hover:bg-white text-slate-400 hover:text-rose-500 transition-all active:scale-90 ${
                    isWishlisted ? "bg-rose-50 text-rose-500 border-rose-200" : ""
                  }`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  title={isWishlisted ? "In your Wishlist" : "Add to Wishlist"}
                >
                  <FontAwesomeIcon icon={faHeart} className="text-[10px]" />
                </button>
              </div>

              {/* Centered Product Image */}
              {imgSrc ? (
                <Image 
                  src={imgSrc} 
                  alt={product.name} 
                  fill 
                  className="object-contain p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-300" 
                  onError={() => setImgSrc("/placeholder.png")}
                  unoptimized
                />
              ) : (
                <div className="text-xs text-gray-300">No Image</div>
              )}

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-wider shadow-sm">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* 2. PRODUCT DETAILS */}
            {/* Category / Assured Tag */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[100px]">
                {displayCategory}
              </span>
              <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black italic text-[#2874f0]">
                <FontAwesomeIcon icon={faShieldHalved} className="text-[8px]" />
                <span>Assured</span>
              </div>
            </div>

            {/* Product Title */}
            <h3 className="h-8 sm:h-9 text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-[#2E6F40] transition-colors line-clamp-2 leading-tight tracking-tight mb-1">
              {product.name}
            </h3>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="bg-[#388e3c] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-2xs">
                <span>{ratingScore}</span>
                <FontAwesomeIcon icon={faStar} className="text-[7px]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                ({reviewsCount})
              </span>
            </div>

            {/* Price, MRP & Discount */}
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
                <span className="text-[10px] sm:text-xs font-bold text-emerald-600">
                  {discountPercent}% off
                </span>
              )}
            </div>
          </div>

          {/* 3. PREMIUM ACTION BUTTONS (Icon Cart + Full-Width Buy Now) */}
          <div className="mt-auto pt-2 border-t border-slate-100/90">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed text-center"
              >
                Out of Stock
              </button>
            ) : (
              <div className="flex items-center gap-1.5 w-full">
                <button
                  type="button"
                  onClick={handleDirectAddToCart}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0 active:scale-90 transition-all shadow-2xs cursor-pointer"
                  title="Add to Cart"
                >
                  <FontAwesomeIcon icon={faCartPlus} className="text-xs text-amber-800" />
                </button>
                <button
                  type="button"
                  onClick={handleDirectBuyNow}
                  className="flex-1 h-8 sm:h-9 rounded-xl bg-[#2E6F40] hover:bg-[#245e35] text-white font-black text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1 active:scale-95 shadow-xs cursor-pointer"
                  title="Buy Now"
                >
                  <FontAwesomeIcon icon={faBagShopping} className="text-[10px]" />
                  <span>Buy Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals for spec selection and quick detail */}
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
