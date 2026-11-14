"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ZoomIn,
  ZoomOut,
  RotateCcw,
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
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // In-Place Product Zoom State (Only zooms the product, never the entire screen)
  const [zoomScale, setZoomScale] = useState<number>(1);
  const zoomScaleRef = useRef<number>(zoomScale);
  const [zoomPan, setZoomPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);

  useEffect(() => {
    zoomScaleRef.current = zoomScale;
  }, [zoomScale]);

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

  // Reset in-place zoom whenever active image changes
  useEffect(() => {
    setZoomScale(1);
    setZoomPan({ x: 0, y: 0 });
  }, [currentIndex]);

  // Completely block native browser page/screen zoom when touching the product container
  useEffect(() => {
    const container = mainImageContainerRef.current;
    if (!container) return;

    const preventNativeGesture = (e: TouchEvent) => {
      if (e.touches.length > 1 || zoomScaleRef.current > 1) {
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleWheelNative = (e: WheelEvent) => {
      if (zoomScaleRef.current > 1 || e.ctrlKey) {
        if (e.cancelable) e.preventDefault();
      }
    };

    container.addEventListener("touchmove", preventNativeGesture, { passive: false });
    container.addEventListener("touchstart", preventNativeGesture, { passive: false });
    container.addEventListener("wheel", handleWheelNative, { passive: false });

    return () => {
      container.removeEventListener("touchmove", preventNativeGesture);
      container.removeEventListener("touchstart", preventNativeGesture);
      container.removeEventListener("wheel", handleWheelNative);
    };
  }, []);

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

  // Main gallery drag end handler (for swiping between slides when scale === 1)
  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 150);

    if (zoomScale > 1) return;

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

  // Double tap / double click to toggle in-place zoom
  const handleDoubleTap = (clientX: number, clientY: number, containerRect: DOMRect) => {
    if (zoomScale === 1) {
      const relX = (clientX - containerRect.left) / containerRect.width;
      const relY = (clientY - containerRect.top) / containerRect.height;
      const targetScale = 2.5;
      const maxPanX = ((targetScale - 1) * containerRect.width) / 2;
      const maxPanY = ((targetScale - 1) * containerRect.height) / 2;
      const panX = Math.max(-maxPanX, Math.min(maxPanX, (0.5 - relX) * containerRect.width * (targetScale - 1)));
      const panY = Math.max(-maxPanY, Math.min(maxPanY, (0.5 - relY) * containerRect.height * (targetScale - 1)));
      setZoomScale(targetScale);
      setZoomPan({ x: panX, y: panY });
    } else {
      handleResetZoom();
    }
  };

  // Touch handlers for mobile (Pinch-to-zoom & 1-finger Pan when zoomed)
  const handleTouchStart = (e: React.TouchEvent) => {
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

      // Double tap check
      if (now - lastTapRef.current < 300) {
        handleDoubleTap(touch.clientX, touch.clientY, rect);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (zoomScale > 1) {
        setIsDragging(true);
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        panStartRef.current = { ...zoomPan };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 2-finger pinch (zooms ONLY the product image)
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current;
      const newScale = Math.min(Math.max(Number((pinchStartScaleRef.current * ratio).toFixed(2)), 1), 4);
      setZoomScale(newScale);
      if (newScale === 1) setZoomPan({ x: 0, y: 0 });
      return;
    }

    // 1-finger drag to pan when zoomed
    if (e.touches.length === 1 && zoomScale > 1 && isDragging) {
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      const rect = mainImageContainerRef.current?.getBoundingClientRect();
      const maxPanX = rect ? ((zoomScale - 1) * rect.width) / 2 : 200;
      const maxPanY = rect ? ((zoomScale - 1) * rect.height) / 2 : 200;
      setZoomPan({
        x: Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.x + dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.y + dy)),
      });
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
    setIsDragging(false);
    if (zoomScale < 1.05) {
      setZoomScale(1);
      setZoomPan({ x: 0, y: 0 });
    }
  };

  // Mouse pan handlers when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...zoomPan };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (zoomScale > 1 && isDragging) {
      e.preventDefault();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const rect = mainImageContainerRef.current?.getBoundingClientRect();
      const maxPanX = rect ? ((zoomScale - 1) * rect.width) / 2 : 200;
      const maxPanY = rect ? ((zoomScale - 1) * rect.height) / 2 : 200;
      setZoomPan({
        x: Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.x + dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.y + dy)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Keyboard navigation & Esc key to reset zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (zoomScale === 1) nextImage();
      } else if (e.key === "ArrowLeft") {
        if (zoomScale === 1) prevImage();
      } else if (e.key === "Escape") {
        if (zoomScale > 1) handleResetZoom();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextImage, prevImage, zoomScale, handleZoomIn, handleZoomOut, handleResetZoom]);

  const currentImageUrl = galleryImages[currentIndex] || "/placeholder.png";
  const displayRating = typeof rating === "number" ? rating.toFixed(1) : "4.1";

  return (
    <div className="w-full flex flex-col gap-2.5 select-none">
      {/* ======================= MAIN VIEWER (In-Place Zoom: Only the product zooms inside the card) ======================= */}
      <div
        ref={mainImageContainerRef}
        className="relative w-full aspect-[4/5] sm:aspect-square max-h-[500px] bg-[#f1f2f4] rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex items-center justify-center overflow-hidden group select-none touch-none"
        style={{ touchAction: "none" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          handleDoubleTap(e.clientX, e.clientY, rect);
        }}
      >
        {/* Top-Right Action Controls: Properly Styled Share Arrow & Wishlist in Vertical Position (Safe from product overlap) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-center gap-1.5">
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

        {/* Bottom-Right Floating In-Place Zoom Toggle Button (Clear label for customers) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (zoomScale > 1) {
              handleResetZoom();
            } else {
              setZoomScale(2.5);
              setZoomPan({ x: 0, y: 0 });
            }
          }}
          className={`absolute bottom-3.5 right-3.5 z-20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-md border flex items-center gap-1.5 transition-all duration-200 active:scale-90 cursor-pointer backdrop-blur-xs ${
            zoomScale > 1
              ? "bg-slate-900 text-white border-slate-800 ring-2 ring-emerald-500/40"
              : "bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 border-slate-200/90 hover:shadow-lg"
          }`}
          title={zoomScale > 1 ? "Reset zoom (Click or Esc)" : "Click to zoom in product"}
          aria-label={zoomScale > 1 ? "Reset zoom" : "Zoom product"}
        >
          {zoomScale > 1 ? (
            <>
              <ZoomOut className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] sm:text-xs font-bold text-white">Reset</span>
            </>
          ) : (
            <>
              <ZoomIn className="w-3.5 h-3.5 text-slate-700 group-hover:text-emerald-700" />
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Zoom</span>
            </>
          )}
        </button>

        {/* Floating Mini Controls Pill when Product is Zoomed In */}
        {zoomScale > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full text-white shadow-xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomScale <= 1}
              className={`p-1 rounded-full transition active:scale-90 cursor-pointer ${
                zoomScale <= 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20"
              }`}
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] font-mono font-bold text-emerald-400 min-w-[36px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomScale >= 4}
              className={`p-1 rounded-full transition active:scale-90 cursor-pointer ${
                zoomScale >= 4 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20"
              }`}
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded-full hover:bg-white/20 transition active:scale-90 cursor-pointer ml-0.5 text-slate-300 hover:text-white"
              title="Reset Zoom"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {/* Out Of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-25 pointer-events-none">
            <span className="bg-red-600 text-white font-black px-4 py-2 rounded-xl text-sm uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Desktop-only subtle Hover Navigation Arrows (only when not zoomed) */}
        {galleryImages.length > 1 && zoomScale === 1 && (
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

        {/* Product Image Viewport (In-Place Zoom & Pan, strictly clipped within card) */}
        <div
          className={`relative w-full h-full flex items-center justify-center overflow-hidden touch-none ${
            zoomScale > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-zoom-in"
          }`}
          style={{ touchAction: "none" }}
          onClick={(e) => {
            if (hasDraggedRef.current) return;
            if (zoomScale === 1) {
              const rect = e.currentTarget.getBoundingClientRect();
              handleDoubleTap(e.clientX, e.clientY, rect);
            } else {
              handleResetZoom();
            }
          }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate={{
                opacity: 1,
                scale: zoomScale,
                x: zoomScale > 1 ? zoomPan.x : 0,
                y: zoomScale > 1 ? zoomPan.y : 0,
              }}
              exit="exit"
              transition={
                isDragging
                  ? { duration: 0 }
                  : zoomScale > 1
                  ? { type: "spring", stiffness: 300, damping: 30 }
                  : slideTransition
              }
              drag={zoomScale === 1 && galleryImages.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragStart={() => {
                hasDraggedRef.current = true;
              }}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full flex items-center justify-center select-none touch-none"
              style={{ transformOrigin: "center center", touchAction: "none" }}
            >
              <Image
                src={currentImageUrl}
                alt={`${productName} - Image ${currentIndex + 1}`}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                className="object-contain w-full h-full p-6 sm:p-8 md:p-10 select-none pointer-events-none"
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
              onClick={() => {
                goToImage(idx);
                handleResetZoom();
              }}
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
                  onClick={() => {
                    onSelectColor?.(v.color);
                    handleResetZoom();
                  }}
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
                onClick={() => {
                  goToImage(idx);
                  handleResetZoom();
                }}
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

      {/* Desktop thumbnails strip */}
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
                onClick={() => {
                  goToImage(idx);
                  handleResetZoom();
                }}
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
