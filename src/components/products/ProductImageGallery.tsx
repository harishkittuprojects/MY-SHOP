"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ArrowLeft,
} from "lucide-react";

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
  const galleryImages = useMemo(() => {
    return images && images.length > 0 ? images : ["/placeholder.png"];
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const cardDragDistRef = useRef<number>(0);
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Fullscreen Product Viewer State (Opens directly when product is pressed)
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [viewerScale, setViewerScale] = useState<number>(1);
  const [viewerPan, setViewerPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isViewerDragging, setIsViewerDragging] = useState<boolean>(false);
  const viewerDragDistRef = useRef<number>(0);
  const viewerDragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewerPanStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewerLastTapRef = useRef<number>(0);
  const viewerPinchDistRef = useRef<number | null>(null);
  const viewerPinchScaleRef = useRef<number>(1);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll when fullscreen product viewer is open
  useEffect(() => {
    if (isViewerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isViewerOpen]);

  // Sync with external selectedImage prop safely (avoids re-render loop)
  useEffect(() => {
    if (!selectedImage) return;
    const norm = (u: string) => (u || "").split("?")[0].replace(/\/+$/, "").toLowerCase();
    const target = norm(selectedImage);
    let idx = galleryImages.findIndex((img) => norm(img) === target);
    if (idx === -1) {
      idx = galleryImages.findIndex((img) => {
        const n = norm(img);
        return n.includes(target) || target.includes(n);
      });
    }
    if (idx !== -1) {
      setCurrentIndex((prev) => {
        if (prev === idx) return prev;
        setDirection(idx > prev ? 1 : -1);
        return idx;
      });
    }
  }, [selectedImage, galleryImages]);

  // Reset viewer zoom whenever active image changes
  useEffect(() => {
    setViewerScale(1);
    setViewerPan({ x: 0, y: 0 });
  }, [currentIndex]);

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

  // Gallery drag end handler on card
  const handleCardDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 35;
    const velocityThreshold = 180;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      nextImage();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      prevImage();
    }

    // Reset distance after short frame so click/tap handler has exact info
    setTimeout(() => {
      cardDragDistRef.current = 0;
    }, 50);
  };

  // Fullscreen Viewer gesture handlers
  const handleViewerDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (viewerScale > 1) return;

    const swipeThreshold = 40;
    const velocityThreshold = 200;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      nextImage();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      prevImage();
    }

    setTimeout(() => {
      viewerDragDistRef.current = 0;
    }, 50);
  };

  const handleViewerDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (viewerScale === 1) {
      setViewerScale(2.5);
      setViewerPan({ x: 0, y: 0 });
    } else {
      setViewerScale(1);
      setViewerPan({ x: 0, y: 0 });
    }
  };

  const handleViewerTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      viewerPinchDistRef.current = dist;
      viewerPinchScaleRef.current = viewerScale;
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();

      if (now - viewerLastTapRef.current < 300) {
        handleViewerDoubleTap(e);
        viewerLastTapRef.current = 0;
        return;
      }
      viewerLastTapRef.current = now;

      if (viewerScale > 1) {
        setIsViewerDragging(true);
        viewerDragStartRef.current = { x: touch.clientX, y: touch.clientY };
        viewerPanStartRef.current = { ...viewerPan };
      }
    }
  };

  const handleViewerTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && viewerPinchDistRef.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / viewerPinchDistRef.current;
      const newScale = Math.min(Math.max(Number((viewerPinchScaleRef.current * ratio).toFixed(2)), 1), 4);
      setViewerScale(newScale);
      if (newScale === 1) setViewerPan({ x: 0, y: 0 });
      return;
    }

    if (e.touches.length === 1 && viewerScale > 1 && isViewerDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - viewerDragStartRef.current.x;
      const dy = touch.clientY - viewerDragStartRef.current.y;
      const maxPan = (viewerScale - 1) * 350;
      setViewerPan({
        x: Math.max(-maxPan, Math.min(maxPan, viewerPanStartRef.current.x + dx)),
        y: Math.max(-maxPan, Math.min(maxPan, viewerPanStartRef.current.y + dy)),
      });
    }
  };

  const handleViewerTouchEnd = () => {
    viewerPinchDistRef.current = null;
    setIsViewerDragging(false);
    if (viewerScale < 1.05) {
      setViewerScale(1);
      setViewerPan({ x: 0, y: 0 });
    }
  };

  const handleViewerMouseDown = (e: React.MouseEvent) => {
    if (viewerScale > 1) {
      e.preventDefault();
      setIsViewerDragging(true);
      viewerDragStartRef.current = { x: e.clientX, y: e.clientY };
      viewerPanStartRef.current = { ...viewerPan };
    }
  };

  const handleViewerMouseMove = (e: React.MouseEvent) => {
    if (viewerScale > 1 && isViewerDragging) {
      e.preventDefault();
      const dx = e.clientX - viewerDragStartRef.current.x;
      const dy = e.clientY - viewerDragStartRef.current.y;
      const maxPan = (viewerScale - 1) * 350;
      setViewerPan({
        x: Math.max(-maxPan, Math.min(maxPan, viewerPanStartRef.current.x + dx)),
        y: Math.max(-maxPan, Math.min(maxPan, viewerPanStartRef.current.y + dy)),
      });
    }
  };

  const handleViewerMouseUp = () => {
    setIsViewerDragging(false);
  };

  // Keyboard navigation & Esc key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (viewerScale === 1) nextImage();
      } else if (e.key === "ArrowLeft") {
        if (viewerScale === 1) prevImage();
      } else if (e.key === "Escape") {
        if (isViewerOpen) {
          setIsViewerOpen(false);
          setViewerScale(1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextImage, prevImage, isViewerOpen, viewerScale]);

  const currentImageUrl = galleryImages[currentIndex] || "/placeholder.png";
  const displayRating = typeof rating === "number" ? rating.toFixed(1) : "4.1";

  return (
    <div className="w-full flex flex-col gap-2.5 select-none">
      {/* ======================= MAIN VIEWER (Clicking/Pressing the product opens directly into Fullscreen) ======================= */}
      <div
        ref={mainImageContainerRef}
        className="relative w-full aspect-square bg-[#f1f2f4] rounded-none sm:rounded-3xl p-1 sm:p-3 flex items-center justify-center overflow-hidden group select-none cursor-pointer"
        onClick={() => {
          if (cardDragDistRef.current < 10) {
            setIsViewerOpen(true);
          }
        }}
      >
        {/* Top-Right Action Controls: Properly Styled Share Arrow & Wishlist (Desktop only) */}
        <div
          className="hidden lg:flex absolute top-3 right-3 z-20 flex-col items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 shadow-sm border border-slate-200/90 flex items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs"
              title="Share product"
              aria-label="Share product"
            >
              {/* Proper Paper-Airplane Share Arrow pointing top-right */}
              <svg
                className="w-4 h-4 translate-x-[-1px] translate-y-[1px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white shadow-sm border border-slate-200/90 flex items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs ${
                isWishlisted ? "text-rose-500" : "text-slate-600 hover:text-rose-500"
              }`}
              title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          )}
        </div>

        {/* Bottom-Left Floating Rating Badge Pill: 4.1 ★ | 27.2K+ */}
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

        {/* Product Image on Card */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
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
                cardDragDistRef.current = 0;
              }}
              onDrag={(_e, info) => {
                cardDragDistRef.current = Math.hypot(info.offset.x, info.offset.y);
              }}
              onDragEnd={handleCardDragEnd}
              onTap={() => {
                if (cardDragDistRef.current < 10) {
                  setIsViewerOpen(true);
                }
              }}
              className="absolute inset-0 w-full h-full flex items-center justify-center select-none cursor-pointer"
              style={{ transformOrigin: "center center" }}
            >
              <Image
                src={currentImageUrl}
                alt={`${productName} - Image ${currentIndex + 1}`}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                className="object-contain w-full h-full p-1.5 sm:p-3 select-none pointer-events-none"
                unoptimized
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ======================= PAGINATION DOTS & ACTION ICONS (Amazon Mobile Exact) ======================= */}
      <div className="w-full flex items-center justify-between py-2 px-3 sm:px-1">
        {/* Left balance spacer */}
        <div className="w-16 shrink-0" />

        {/* Center: Pagination Dots */}
        {galleryImages.length > 1 ? (
          <div className="flex items-center justify-center gap-1.5">
            {galleryImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToImage(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? "w-2 h-2 bg-slate-900"
                    : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                title={`Go to image ${idx + 1}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        ) : (
          <div />
        )}

        {/* Right: Wishlist & Share Action Icons (Mobile visible, matches screenshot) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onToggleWishlist && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist();
              }}
              className="p-1 text-slate-700 hover:text-rose-500 transition cursor-pointer active:scale-90"
              title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          )}

          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="p-1 text-slate-700 hover:text-slate-950 transition cursor-pointer active:scale-90"
              title="Share product"
              aria-label="Share product"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ======================= DESKTOP-ONLY PHOTO GALLERY THUMBNAILS STRIP ======================= */}
      {galleryImages.length > 1 && (
        <div
          ref={thumbnailContainerRef}
          className="hidden lg:flex w-full items-center gap-2.5 overflow-x-auto scrollbar-none py-1.5 px-3 sm:px-0"
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
                    ? "border-2 border-[#007185] shadow-xs ring-1 ring-[#007185]/30"
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

      {/* ======================= FULLSCREEN PRODUCT IMAGE VIEWER (Matches Reference Image 2) ======================= */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {isViewerOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[99999] bg-black flex flex-col justify-between items-center select-none"
                onClick={() => {
                  if (viewerDragDistRef.current < 10) {
                    setIsViewerOpen(false);
                    setViewerScale(1);
                  }
                }}
              >
                {/* Top Header Bar */}
                <div
                  className="w-full flex items-center justify-between p-3.5 sm:p-5 z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewerOpen(false);
                      setViewerScale(1);
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs"
                    title="Back to product"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {galleryImages.length > 1 && (
                    <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-white/90">
                      {currentIndex + 1} / {galleryImages.length}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsViewerOpen(false);
                      setViewerScale(1);
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs"
                    title="Close"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Fullscreen Image Area (Direct clean view of the product matching Reference 2) */}
                <div
                  className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-auto"
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={handleViewerTouchStart}
                  onTouchMove={handleViewerTouchMove}
                  onTouchEnd={handleViewerTouchEnd}
                  onMouseDown={handleViewerMouseDown}
                  onMouseMove={handleViewerMouseMove}
                  onMouseUp={handleViewerMouseUp}
                  onDoubleClick={handleViewerDoubleTap}
                >
                  {/* Desktop Left/Right Navigation Buttons */}
                  {galleryImages.length > 1 && viewerScale === 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs"
                        title="Previous Image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs"
                        title="Next Image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentIndex}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate={{
                        opacity: 1,
                        scale: viewerScale,
                        x: viewerScale > 1 ? viewerPan.x : 0,
                        y: viewerScale > 1 ? viewerPan.y : 0,
                      }}
                      exit="exit"
                      transition={
                        isViewerDragging
                          ? { duration: 0 }
                          : viewerScale > 1
                          ? { type: "spring", stiffness: 300, damping: 30 }
                          : slideTransition
                      }
                      drag={viewerScale === 1 && galleryImages.length > 1 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.4}
                      onDragStart={() => {
                        viewerDragDistRef.current = 0;
                      }}
                      onDrag={(_e, info) => {
                        viewerDragDistRef.current = Math.hypot(info.offset.x, info.offset.y);
                      }}
                      onDragEnd={handleViewerDragEnd}
                      className="absolute inset-0 w-full h-full flex items-center justify-center select-none"
                      style={{ transformOrigin: "center center" }}
                    >
                      <Image
                        src={currentImageUrl}
                        alt={productName}
                        fill
                        priority
                        sizes="100vw"
                        className="object-contain w-full h-full p-2 sm:p-6 select-none pointer-events-none"
                        unoptimized
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Floating Zoom Percentage Pill when Zoomed */}
                  {viewerScale > 1 && (
                    <div
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setViewerScale((prev) => Math.max(1, prev - 0.5));
                          if (viewerScale <= 1.5) setViewerPan({ x: 0, y: 0 });
                        }}
                        className="p-1.5 rounded-full hover:bg-white/20 transition active:scale-90 cursor-pointer"
                        title="Zoom out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <span className="text-xs font-mono font-bold text-emerald-400 px-1 min-w-[40px] text-center">
                        {Math.round(viewerScale * 100)}%
                      </span>

                      <button
                        type="button"
                        onClick={() => setViewerScale((prev) => Math.min(4, prev + 0.5))}
                        className="p-1.5 rounded-full hover:bg-white/20 transition active:scale-90 cursor-pointer"
                        title="Zoom in"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setViewerScale(1);
                          setViewerPan({ x: 0, y: 0 });
                        }}
                        className="p-1.5 rounded-full hover:bg-white/20 transition active:scale-90 cursor-pointer ml-1 text-slate-300 hover:text-white"
                        title="Reset Zoom"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Dots Indicator inside Fullscreen Viewer */}
                {galleryImages.length > 1 && (
                  <div
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {galleryImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          goToImage(idx);
                          setViewerScale(1);
                          setViewerPan({ x: 0, y: 0 });
                        }}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          currentIndex === idx
                            ? "w-2.5 h-2.5 bg-[#e01a59]"
                            : "w-2 h-2 bg-white/40 hover:bg-white/80"
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
