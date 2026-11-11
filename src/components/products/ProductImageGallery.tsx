"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const galleryImages = images && images.length > 0 ? images : ["/placeholder.png"];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const hasDraggedRef = useRef<boolean>(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Full-screen Zoom Modal State
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [zoomPan, setZoomPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingZoom, setIsDraggingZoom] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Reset zoom whenever image changes
  useEffect(() => {
    setZoomScale(1);
    setZoomPan({ x: 0, y: 0 });
  }, [currentIndex]);

  // Lock body scroll when zoom modal is open
  useEffect(() => {
    if (isZoomOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoomOpen]);

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

  // Main gallery drag end handler (when not zoomed)
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

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomScale((prev) => Math.min(Number((prev + 0.5).toFixed(2)), 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomScale((prev) => {
      const next = Math.max(Number((prev - 0.5).toFixed(2)), 1);
      if (next <= 1.05) setZoomPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomScale(1);
    setZoomPan({ x: 0, y: 0 });
  }, []);

  // Double tap / double click to toggle zoom
  const handleDoubleTapZoom = (clientX: number, clientY: number, containerRect: DOMRect) => {
    if (zoomScale === 1) {
      const relX = (clientX - containerRect.left) / containerRect.width;
      const relY = (clientY - containerRect.top) / containerRect.height;
      const targetScale = 2.5;
      const panX = (0.5 - relX) * containerRect.width * (targetScale - 1);
      const panY = (0.5 - relY) * containerRect.height * (targetScale - 1);
      setZoomScale(targetScale);
      setZoomPan({ x: panX, y: panY });
    } else {
      handleResetZoom();
    }
  };

  // Keyboard navigation & Esc key to close zoom modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "Escape") {
        if (isZoomOpen) {
          setIsZoomOpen(false);
          handleResetZoom();
        }
      } else if (e.key === "+" || e.key === "=") {
        if (isZoomOpen) handleZoomIn();
      } else if (e.key === "-") {
        if (isZoomOpen) handleZoomOut();
      } else if (e.key === "0") {
        if (isZoomOpen) handleResetZoom();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextImage, prevImage, isZoomOpen, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Touch handlers inside zoom modal
  const handleTouchStartZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = zoomScale;
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();
      const rect = e.currentTarget.getBoundingClientRect();

      if (now - lastTapRef.current < 300) {
        handleDoubleTapZoom(touch.clientX, touch.clientY, rect);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (zoomScale > 1) {
        setIsDraggingZoom(true);
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        panStartRef.current = { ...zoomPan };
      }
    }
  };

  const handleTouchMoveZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current;
      const newScale = Math.min(Math.max(pinchStartScaleRef.current * ratio, 1), 4);
      setZoomScale(newScale);
      if (newScale === 1) setZoomPan({ x: 0, y: 0 });
      return;
    }

    if (e.touches.length === 1 && zoomScale > 1 && isDraggingZoom) {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      const maxPan = (zoomScale - 1) * 260;
      setZoomPan({
        x: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.x + dx)),
        y: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.y + dy)),
      });
    }
  };

  const handleTouchEndZoom = () => {
    pinchStartDistRef.current = null;
    setIsDraggingZoom(false);
    if (zoomScale < 1.05) {
      setZoomScale(1);
      setZoomPan({ x: 0, y: 0 });
    }
  };

  const currentImageUrl = galleryImages[currentIndex] || "/placeholder.png";
  const displayRating = typeof rating === "number" ? rating.toFixed(1) : "4.1";

  return (
    <div className="w-full flex flex-col gap-2.5 select-none">
      {/* ======================= MAIN VIEWER (Flipkart reference style) ======================= */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square max-h-[500px] bg-[#f1f2f4] rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex items-center justify-center overflow-hidden group">
        
        {/* Top-Right Action Controls: Properly Styled Share Arrow & Wishlist */}
        <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md border border-slate-200/90 flex items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs"
              title="Share product"
              aria-label="Share product"
            >
              {/* Proper Paper-Airplane Share Arrow pointing top-right */}
              <svg
                className="w-4.5 h-4.5 translate-x-[-1px] translate-y-[1px]"
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
              className={`w-9 h-9 rounded-full bg-white/95 hover:bg-white shadow-md border border-slate-200/90 flex items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs ${
                isWishlisted ? "text-rose-500" : "text-slate-600 hover:text-rose-500"
              }`}
              title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-4.5 h-4.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
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

        {/* Bottom-Right Floating Zoom Option Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomOpen(true);
          }}
          className="absolute bottom-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 shadow-md border border-slate-200/90 flex items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs"
          title="Zoom image"
          aria-label="Zoom image"
        >
          <ZoomIn className="w-4.5 h-4.5" />
        </button>

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

        {/* Smooth Swipeable Carousel Viewport (Click to open Zoom) */}
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in"
          onClick={() => {
            if (hasDraggedRef.current) return;
            setIsZoomOpen(true);
          }}
        >
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

      {/* On desktop screens with color variants, also display desktop thumbnails */}
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

      {/* ======================= FULLSCREEN ZOOM VIEWER LIGHTBOX ======================= */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {isZoomOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5"
                onClick={() => {
                  setIsZoomOpen(false);
                  handleResetZoom();
                }}
              >
                {/* Modal Top Bar */}
                <div
                  className="w-full flex items-center justify-between text-white z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm sm:text-base font-bold text-white/90 line-clamp-1 max-w-[220px] sm:max-w-md">
                      {productName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-slate-300">
                      {currentIndex + 1} / {galleryImages.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsZoomOpen(false);
                      handleResetZoom();
                    }}
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/20"
                    title="Close Zoom (Esc)"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Center Viewport with Interactive Pinch, Double-Tap & Drag Zoom */}
                <div
                  className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-2 select-none"
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={handleTouchStartZoom}
                  onTouchMove={handleTouchMoveZoom}
                  onTouchEnd={handleTouchEndZoom}
                  onDoubleClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleDoubleTapZoom(e.clientX, e.clientY, rect);
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                    if (e.deltaY < 0) handleZoomIn();
                    else handleZoomOut();
                  }}
                >
                  {/* Modal Left/Right Image Navigation Buttons */}
                  {galleryImages.length > 1 && zoomScale === 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/20 backdrop-blur-xs"
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
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/20 backdrop-blur-xs"
                        title="Next Image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Zoomed Image Surface */}
                  <motion.div
                    animate={{
                      scale: zoomScale,
                      x: zoomScale > 1 ? zoomPan.x : 0,
                      y: zoomScale > 1 ? zoomPan.y : 0,
                    }}
                    transition={
                      isDraggingZoom ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }
                    }
                    className={`relative w-full h-full max-h-[75vh] flex items-center justify-center ${
                      zoomScale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
                    }`}
                  >
                    <Image
                      src={currentImageUrl}
                      alt={productName}
                      fill
                      priority
                      className="object-contain p-2 select-none pointer-events-none"
                      unoptimized
                    />
                  </motion.div>

                  {/* Floating Zoom Control Pill at Bottom-Center */}
                  <div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      disabled={zoomScale <= 1}
                      className={`p-1.5 rounded-full transition active:scale-90 cursor-pointer ${
                        zoomScale <= 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20"
                      }`}
                      title="Zoom Out (-)"
                      aria-label="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-mono font-bold text-emerald-400 px-1 min-w-[40px] text-center">
                      {Math.round(zoomScale * 100)}%
                    </span>

                    <button
                      type="button"
                      onClick={handleZoomIn}
                      disabled={zoomScale >= 4}
                      className={`p-1.5 rounded-full transition active:scale-90 cursor-pointer ${
                        zoomScale >= 4 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20"
                      }`}
                      title="Zoom In (+)"
                      aria-label="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    {zoomScale > 1 && (
                      <button
                        type="button"
                        onClick={handleResetZoom}
                        className="p-1.5 rounded-full hover:bg-white/20 transition active:scale-90 cursor-pointer ml-1 text-slate-300 hover:text-white"
                        title="Reset Zoom (0)"
                        aria-label="Reset Zoom"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Modal Bottom Thumbnail Strip for Switching Photos */}
                {galleryImages.length > 1 && (
                  <div
                    className="w-full flex items-center justify-center gap-2 py-1.5 overflow-x-auto scrollbar-none z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {galleryImages.map((img, idx) => (
                      <button
                        key={`modal-thumb-${idx}`}
                        type="button"
                        onClick={() => {
                          goToImage(idx);
                          handleResetZoom();
                        }}
                        className={`relative w-13 h-16 sm:w-15 sm:h-18 rounded-xl bg-white/10 border transition overflow-hidden p-1 shrink-0 cursor-pointer ${
                          currentIndex === idx
                            ? "border-emerald-500 ring-2 ring-emerald-500/50 scale-105 bg-white/20"
                            : "border-white/20 opacity-60 hover:opacity-100"
                        }`}
                        title={`Slide ${idx + 1}`}
                      >
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </button>
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
