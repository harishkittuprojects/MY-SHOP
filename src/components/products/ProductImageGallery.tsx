"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

export interface ColorVariantItem {
  color: string;
  image_url?: string;
  price?: number;
  stock_quantity?: number;
}

export interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  selectedImage?: string;
  onSelectImage?: (image: string) => void;
  isOutOfStock?: boolean;
  onShare?: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  rating?: number;
  reviewsCount?: number;
  selectedColor?: string;
  colorVariants?: ColorVariantItem[];
  onSelectColor?: (color: string) => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const slideTransition = {
  x: { type: "spring" as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

const formatReviews = (count?: number) => {
  if (!count && count !== 0) return "27.2K+";
  if (count >= 1000) {
    const formatted = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return `${formatted}K+`;
  }
  return `${count}`;
};

export default function ProductImageGallery({
  images,
  productName,
  selectedImage,
  onSelectImage,
  isOutOfStock = false,
  onShare,
  isWishlisted = false,
  onToggleWishlist,
  rating = 4.1,
  reviewsCount = 27200,
  selectedColor,
  colorVariants = [],
  onSelectColor,
}: ProductImageGalleryProps) {
  const galleryImages = images && images.length > 0 ? images : ["/placeholder.png"];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const hasDraggedRef = useRef<boolean>(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Sync with external selectedImage prop
  useEffect(() => {
    if (selectedImage) {
      const norm = (u: string) => (u || "").split("?")[0].replace(/\/+$/, "").toLowerCase();
      const target = norm(selectedImage);
      let idx = galleryImages.findIndex((img) => norm(img) === target);
      if (idx === -1) {
        idx = galleryImages.findIndex((img) => {
          const n = norm(img);
          return n.includes(target) || target.includes(n);
        });
      }
      if (idx !== -1 && idx !== currentIndex) {
        setDirection(idx > currentIndex ? 1 : -1);
        setCurrentIndex(idx);
      }
    }
  }, [selectedImage, galleryImages, currentIndex]);

  // Preload neighboring images
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && galleryImages.length > 1) {
        const nextIdx = (currentIndex + 1) % galleryImages.length;
        const prevIdx = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        if (galleryImages[nextIdx]) {
          const img1 = new window.Image();
          img1.src = galleryImages[nextIdx];
        }
        if (galleryImages[prevIdx]) {
          const img2 = new window.Image();
          img2.src = galleryImages[prevIdx];
        }
      }
    } catch {
      // ignore
    }
  }, [currentIndex, galleryImages]);

  // Navigate to specific index
  const goToImage = useCallback(
    (index: number) => {
      const total = galleryImages.length;
      if (total <= 1 || index === currentIndex) return;
      const validIndex = (index + total) % total;
      setDirection(validIndex > currentIndex ? 1 : -1);
      setCurrentIndex(validIndex);
      onSelectImage?.(galleryImages[validIndex]);
    },
    [currentIndex, galleryImages, onSelectImage]
  );

  const paginate = useCallback(
    (newDirection: number) => {
      const total = galleryImages.length;
      if (total <= 1) return;
      setDirection(newDirection);
      setCurrentIndex((prev) => {
        const nextIdx = (prev + newDirection + total) % total;
        onSelectImage?.(galleryImages[nextIdx]);
        return nextIdx;
      });
    },
    [galleryImages, onSelectImage]
  );

  const nextImage = useCallback(() => paginate(1), [paginate]);
  const prevImage = useCallback(() => paginate(-1), [paginate]);

  // Framer Motion drag end handler for smooth touch swipe
  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 150);

    const swipeThreshold = 35;
    const velocityThreshold = 180;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      nextImage();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      prevImage();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextImage, prevImage]);

  const currentImageUrl = galleryImages[currentIndex] || "/placeholder.png";
  const displayRating = typeof rating === "number" ? rating.toFixed(1) : "4.1";

  return (
    <div className="w-full flex flex-col gap-2.5 select-none">
      {/* ======================= MAIN VIEWER (Flipkart reference style) ======================= */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square max-h-[500px] bg-[#f1f2f4] rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex items-center justify-center overflow-hidden group">
        
        {/* Top-Right Action Controls: Sleek Minimalist Share & Wishlist */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:text-slate-900 transition active:scale-90 cursor-pointer"
              title="Share product"
              aria-label="Share product"
            >
              {/* Reference paper-airplane style share icon */}
              <svg
                className="w-5 h-5 -rotate-45"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          )}

          {onToggleWishlist && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist();
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-90 cursor-pointer ${
                isWishlisted ? "text-rose-500" : "text-slate-600 hover:text-rose-500"
              }`}
              title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          )}
        </div>

        {/* Bottom-Left Floating Rating Badge Pill: 4.1 ★ | 27.2K+ (Exact match to reference) */}
        {rating !== undefined && (
          <div className="absolute bottom-3.5 left-3.5 z-20 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-xs border border-slate-200/60 flex items-center gap-1.5 text-xs font-bold text-slate-800 pointer-events-none">
            <span>{displayRating}</span>
            <span className="text-[#388e3c] text-xs font-black">★</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-semibold">{formatReviews(reviewsCount)}</span>
          </div>
        )}

        {/* Out Of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-25 pointer-events-none">
            <span className="bg-red-600 text-white font-black px-4 py-2 rounded-xl text-sm uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Desktop-only subtle Hover Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="hidden lg:group-hover:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 items-center justify-center shadow-md transition cursor-pointer active:scale-90"
              title="Previous image"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="hidden lg:group-hover:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 items-center justify-center shadow-md transition cursor-pointer active:scale-90"
              title="Next image"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Smooth Swipeable Carousel Viewport */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              drag={galleryImages.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragStart={() => {
                hasDraggedRef.current = true;
              }}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full flex items-center justify-center select-none touch-pan-y"
            >
              <Image
                src={currentImageUrl}
                alt={`${productName} - Image ${currentIndex + 1}`}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                className="object-contain w-full h-full p-2 select-none pointer-events-none"
                unoptimized
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ======================= PAGINATION DOTS (Active dot: Flipkart Magenta) ======================= */}
      {galleryImages.length > 1 && (
        <div className="w-full flex items-center justify-center gap-1.5 py-1.5">
          {galleryImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToImage(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === idx
                  ? "w-2.5 h-2.5 bg-[#e01a59]"
                  : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
              }`}
              title={`Go to image ${idx + 1}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* ======================= COLOR VARIANTS / THUMBNAILS (Flipkart Reference Style) ======================= */}
      {colorVariants && colorVariants.length > 0 ? (
        <div className="w-full space-y-2 pt-1 lg:hidden">
          <div className="text-xs sm:text-sm font-semibold text-slate-800">
            Selected Color: <strong className="text-slate-950 font-bold">{selectedColor || colorVariants[0]?.color}</strong>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
            {colorVariants.map((v, idx) => {
              const isColorSelected = (selectedColor || colorVariants[0]?.color).toLowerCase() === v.color.toLowerCase();
              return (
                <button
                  key={v.color || idx}
                  type="button"
                  onClick={() => onSelectColor?.(v.color)}
                  className={`relative w-15 h-19 sm:w-16 sm:h-20 rounded-2xl bg-white p-1.5 shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                    isColorSelected
                      ? "border-2 border-slate-900 shadow-xs ring-2 ring-slate-900/10"
                      : "border border-slate-200 hover:border-slate-400 shadow-2xs"
                  }`}
                  title={v.color}
                >
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <Image
                      src={v.image_url || "/placeholder.png"}
                      alt={v.color}
                      fill
                      className="object-contain p-0.5"
                      unoptimized
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : galleryImages.length > 1 ? (
        <div
          ref={thumbnailContainerRef}
          className="w-full flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1.5"
        >
          {galleryImages.map((img, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToImage(idx)}
                className={`relative w-15 h-19 sm:w-16 sm:h-20 rounded-2xl bg-white p-1.5 shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? "border-2 border-slate-900 shadow-xs ring-2 ring-slate-900/10"
                    : "border border-slate-200 hover:border-slate-400 shadow-2xs"
                }`}
                title={`Image ${idx + 1}`}
              >
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <Image
                    src={img}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    fill
                    className="object-contain p-0.5"
                    unoptimized
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* On desktop screens with color variants, also display desktop thumbnails if desired */}
      {colorVariants && colorVariants.length > 0 && galleryImages.length > 1 && (
        <div
          ref={thumbnailContainerRef}
          className="hidden lg:flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1.5"
        >
          {galleryImages.map((img, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToImage(idx)}
                className={`relative w-16 h-20 rounded-2xl bg-white p-1.5 shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? "border-2 border-slate-900 shadow-xs ring-2 ring-slate-900/10"
                    : "border border-slate-200 hover:border-slate-400 shadow-2xs"
                }`}
                title={`Image ${idx + 1}`}
              >
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <Image
                    src={img}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    fill
                    className="object-contain p-0.5"
                    unoptimized
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
