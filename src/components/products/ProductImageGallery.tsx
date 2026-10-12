"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  RotateCcw,
  Sparkles,
  Share2,
  Heart,
  Search,
  Camera,
} from "lucide-react";

export interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  selectedImage?: string;
  onSelectImage?: (image: string) => void;
  isOutOfStock?: boolean;
  onShare?: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
}

// Silky-smooth spring slide variants for concurrent sliding
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
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
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
}: ProductImageGalleryProps) {
  // Ensure we have at least one valid image
  const galleryImages = images && images.length > 0 ? images : ["/placeholder.png"];

  // Active image index
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0); // 1 for next, -1 for prev

  // Full-screen Modal state
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Zoom and Pan states
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  // Desktop Hover Magnifier state
  const [isHoverMagnifierActive, setIsHoverMagnifierActive] = useState<boolean>(false);
  const [magnifierModeEnabled, setMagnifierModeEnabled] = useState<boolean>(false); // desktop toggle
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Image loading states
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Touch gesture tracking (Swipe, Double Tap, Pinch-to-zoom)
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const lastTapRef = useRef<number>(0);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);

  // Refs for scrolling thumbnails
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Sync with external selectedImage prop if provided
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

  // Reset zoom & pan when image changes
  useEffect(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setImageLoaded(false);
  }, [currentIndex]);

  // Preload next and previous images for instant switching (Requirement #18)
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && galleryImages.length > 1) {
        const nextIdx = (currentIndex + 1) % galleryImages.length;
        const prevIdx = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        if (galleryImages[nextIdx]) {
          const img1 = new Image();
          img1.src = galleryImages[nextIdx];
        }
        if (galleryImages[prevIdx]) {
          const img2 = new Image();
          img2.src = galleryImages[prevIdx];
        }
      }
    } catch {
      // ignore
    }
  }, [currentIndex, galleryImages]);

  // Auto-scroll active thumbnail into view (Requirement #8)
  useEffect(() => {
    try {
      if (!thumbnailContainerRef.current) return;
      const activeBtn = thumbnailContainerRef.current.children[currentIndex] as HTMLElement;
      if (activeBtn && typeof activeBtn.scrollIntoView === "function") {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    } catch {
      // ignore
    }
  }, [currentIndex]);

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

  const nextImage = useCallback(() => {
    paginate(1);
  }, [paginate]);

  const prevImage = useCallback(() => {
    paginate(-1);
  }, [paginate]);

  // Framer Motion drag end handler for real-time smooth swipe/scroll
  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 150);

    if (scale > 1) return;

    const swipeThreshold = 45;
    const velocityThreshold = 200;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      nextImage();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      prevImage();
    }
  };

  // Zoom controls
  const zoomIn = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(Number((prev + 0.5).toFixed(2)), 4));
  }, []);

  const zoomOut = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => {
      const nextScale = Math.max(Number((prev - 0.5).toFixed(2)), 1);
      if (nextScale <= 1.05) setPan({ x: 0, y: 0 });
      return nextScale;
    });
  }, []);

  const resetZoom = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Keyboard navigation (Requirement #12)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "Escape") {
        if (isFullScreen) {
          setIsFullScreen(false);
          resetZoom();
        } else if (scale > 1) {
          resetZoom();
        }
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      } else if (e.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextImage, prevImage, isFullScreen, scale, resetZoom, zoomIn, zoomOut]);

  // Lock body scroll when in full screen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullScreen]);

  // Double-tap zoom handler (Requirement #10)
  const handleDoubleTap = (clientX: number, clientY: number, containerRect: DOMRect) => {
    if (scale === 1) {
      // Zoom into the tap location
      const relX = (clientX - containerRect.left) / containerRect.width;
      const relY = (clientY - containerRect.top) / containerRect.height;
      const targetScale = 2.5;
      const panX = (0.5 - relX) * containerRect.width * (targetScale - 1);
      const panY = (0.5 - relY) * containerRect.height * (targetScale - 1);
      setScale(targetScale);
      setPan({ x: panX, y: panY });
    } else {
      resetZoom();
    }
  };

  // Touch event handlers for mobile (Swipe, Double Tap, Pinch-to-zoom) (Requirements #2, #4, #10)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = scale;
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();
      const rect = e.currentTarget.getBoundingClientRect();

      // Check double tap
      if (now - lastTapRef.current < 300) {
        handleDoubleTap(touch.clientX, touch.clientY, rect);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };

      if (scale > 1) {
        setIsDragging(true);
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        panStartRef.current = { ...pan };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 2-Finger Pinch-to-Zoom (Requirement #2)
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current;
      const newScale = Math.min(Math.max(pinchStartScaleRef.current * ratio, 1), 4);
      setScale(newScale);
      if (newScale === 1) setPan({ x: 0, y: 0 });
      return;
    }

    // Drag-to-Pan while Zoomed (Requirement #11)
    if (e.touches.length === 1 && scale > 1 && isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      
      const maxPan = (scale - 1) * 220;
      setPan({
        x: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.x + dx)),
        y: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.y + dy)),
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    pinchStartDistRef.current = null;
    setIsDragging(false);

    // Reset if scale is basically 1
    if (scale < 1.05) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    }
  };

  // Mouse drag-to-pan handlers on desktop (Requirement #11)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Desktop hover magnifier (Requirement #9)
    if (scale === 1 && magnifierModeEnabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const xPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setMousePos({ x: xPercent, y: yPercent });
      setIsHoverMagnifierActive(true);
    }

    // Drag-to-pan when zoomed
    if (scale > 1 && isDragging) {
      e.preventDefault();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const maxPan = (scale - 1) * 300;
      setPan({
        x: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.x + dx)),
        y: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.y + dy)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHoverMagnifierActive(false);
  };

  // Desktop double click to zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleDoubleTap(e.clientX, e.clientY, rect);
  };

  // Thumbnail slider horizontal scroll controls (Requirement #3)
  const scrollThumbnails = (scrollDirection: "left" | "right") => {
    if (!thumbnailContainerRef.current) return;
    const scrollAmount = 240;
    thumbnailContainerRef.current.scrollBy({
      left: scrollDirection === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const currentImageUrl = galleryImages[currentIndex] || "/placeholder.png";

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* ======================= MAIN VIEWER ======================= */}
      <div
        ref={mainImageContainerRef}
        className="relative w-full aspect-square max-h-[520px] bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-sm flex items-center justify-center overflow-hidden group touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      >
        {/* Top-Right Action Floating Controls: Share & Wishlist */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md border border-slate-200/80 transition-all cursor-pointer backdrop-blur-xs active:scale-90 hover:text-emerald-700"
              title="Share product"
              aria-label="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {onToggleWishlist && (
            <button
              type="button"
              onClick={onToggleWishlist}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border border-slate-200/80 transition-all cursor-pointer backdrop-blur-xs active:scale-90 ${
                isWishlisted
                  ? "bg-rose-50 text-rose-600 border-rose-200"
                  : "bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600"
              }`}
              title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`} />
            </button>
          )}
        </div>

        {/* Top-Left Badges: Image Counter & Desktop Mode Toggles (Requirements #6, #9) */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
          {/* Image Counter (Requirement #6) */}
          <div className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold tracking-wide shadow-md flex items-center gap-1.5 border border-white/10">
            <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{currentIndex + 1}</span>
            <span className="text-slate-400">/</span>
            <span>{galleryImages.length}</span>
          </div>

          {/* Desktop Hover Magnifier Toggle (Requirement #9) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMagnifierModeEnabled((prev) => !prev);
              resetZoom();
            }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md border transition-all cursor-pointer backdrop-blur-md ${
              magnifierModeEnabled
                ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20"
                : "bg-white/90 text-slate-700 border-slate-200 hover:bg-white"
            }`}
            title="Toggle Hover Magnifier Lens"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px]">{magnifierModeEnabled ? "Magnifier ON" : "Magnifier"}</span>
          </button>
        </div>

        {/* Floating Toolbar Controls: Zoom In, Zoom Out, Reset, Full-screen (Requirements #1, #7, #19) */}
        <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-slate-200/90">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              zoomIn();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition active:scale-95 cursor-pointer"
            title="Zoom In (+)"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              zoomOut();
            }}
            disabled={scale <= 1}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer ${
              scale <= 1
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-100 hover:text-emerald-700"
            }`}
            title="Zoom Out (-)"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {scale > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition active:scale-95 cursor-pointer"
              title="Reset Zoom"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

          {/* Full Screen View Toggle (Requirement #7) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullScreen(true);
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-emerald-600 hover:text-white transition active:scale-95 cursor-pointer"
            title="Full-Screen Viewer"
            aria-label="Open full screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Out Of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-25 pointer-events-none">
            <span className="bg-red-600 text-white font-black px-4 py-2 rounded-xl text-sm uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Image Navigation Arrows (Requirement #5) */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-700 flex items-center justify-center shadow-lg border border-slate-200/80 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-90 hover:scale-105"
              title="Previous image (Left arrow)"
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-700 flex items-center justify-center shadow-lg border border-slate-200/80 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-90 hover:scale-105"
              title="Next image (Right arrow)"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Smooth Animated Main Image (Requirements #1, #9, #11, #13, #15) */}
        <div
          className={`relative w-full h-full flex items-center justify-center overflow-hidden ${
            scale > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : magnifierModeEnabled
              ? "cursor-crosshair"
              : "cursor-zoom-in"
          }`}
          onClick={() => {
            if (hasDraggedRef.current) return;
            if (scale === 1 && !magnifierModeEnabled) {
              setIsFullScreen(true);
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
                scale: isHoverMagnifierActive && magnifierModeEnabled ? 2.2 : scale,
                x: scale > 1 ? pan.x : 0,
                y: scale > 1 ? pan.y : 0,
              }}
              exit="exit"
              transition={
                scale > 1 && isDragging
                  ? { duration: 0 }
                  : slideTransition
              }
              drag={scale === 1 && galleryImages.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragStart={() => {
                hasDraggedRef.current = true;
              }}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full flex items-center justify-center select-none touch-pan-y"
              style={{
                transformOrigin:
                  isHoverMagnifierActive && magnifierModeEnabled
                    ? `${mousePos.x}% ${mousePos.y}%`
                    : "center center",
              }}
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

      {/* Product Image Pagination Dots (Cleanly Centered Below Main Image) (Requirement #20) */}
      {galleryImages.length > 1 && (
        <div className="w-full flex items-center justify-center gap-1.5 py-1">
          {galleryImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToImage(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === idx
                  ? "w-6 h-2 bg-emerald-600 shadow-xs"
                  : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
              }`}
              title={`Go to image ${idx + 1}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* ======================= THUMBNAIL SLIDER (Requirements #3, #8, #15) ======================= */}
      <div className="relative w-full flex items-center gap-1.5 pt-1">
        {/* Left Scroll Button */}
        {galleryImages.length > 4 && (
          <button
            type="button"
            onClick={() => scrollThumbnails("left")}
            className="shrink-0 w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-xs transition cursor-pointer active:scale-95"
            title="Scroll thumbnails left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Draggable & Scrollable Thumbnail Strip */}
        <div
          ref={thumbnailContainerRef}
          className="w-full flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1.5 px-0.5 scroll-smooth"
        >
          {galleryImages.map((img, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToImage(idx)}
                className={`relative w-16 h-18 sm:w-20 sm:h-22 rounded-xl sm:rounded-2xl bg-white border shrink-0 transition-all cursor-pointer overflow-hidden p-1.5 group/thumb ${
                  isActive
                    ? "border-emerald-600 shadow-md ring-2 ring-emerald-500/40 scale-105"
                    : "border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100 shadow-2xs"
                }`}
                title={`Thumbnail ${idx + 1}`}
                aria-label={`Select image ${idx + 1}`}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  loading="lazy"
                  className="object-contain w-full h-full p-1 transition-transform group-hover/thumb:scale-105"
                  unoptimized
                />
                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        {galleryImages.length > 4 && (
          <button
            type="button"
            onClick={() => scrollThumbnails("right")}
            className="shrink-0 w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-xs transition cursor-pointer active:scale-95"
            title="Scroll thumbnails right"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Helper Tips on Desktop */}
      <div className="hidden sm:flex items-center justify-between text-[11px] text-slate-600 px-1 pt-0.5">
        <span className="flex items-center gap-1 text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Double-click to zoom • Click or arrow keys to switch
        </span>
        <span className="text-slate-700 font-medium">
          {galleryImages.length} {galleryImages.length === 1 ? "Image" : "Images"}
        </span>
      </div>

      {/* ======================= FULL-SCREEN MODAL LIGHTBOX (Requirements #7, #17) ======================= */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {isFullScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6"
                onClick={() => {
                  setIsFullScreen(false);
                  resetZoom();
                }}
              >
            {/* Modal Top Bar */}
            <div
              className="w-full flex items-center justify-between text-white z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-bold text-white/90 line-clamp-1 max-w-[260px] sm:max-w-md">
                  {productName}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-300">
                  {currentIndex + 1} / {galleryImages.length}
                </span>
              </div>

              {/* Close Button (Requirement #17) */}
              <button
                type="button"
                onClick={() => {
                  setIsFullScreen(false);
                  resetZoom();
                }}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/20"
                title="Close Full Screen (Esc)"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Center Viewport with Zoom & Pan */}
            <div
              ref={modalContainerRef}
              className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-2"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onDoubleClick={handleDoubleClick}
            >
              {/* Navigation Arrows inside Modal */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/20 backdrop-blur-xs"
                    title="Previous Image"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/20 backdrop-blur-xs"
                    title="Next Image"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Zoomed / Scaled Modal Image */}
              <div
                className={`relative w-full h-full max-w-5xl flex items-center justify-center overflow-hidden ${
                  scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
                }`}
              >
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={`modal-${currentIndex}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate={{
                      opacity: 1,
                      scale: scale,
                      x: scale > 1 ? pan.x : 0,
                      y: scale > 1 ? pan.y : 0,
                    }}
                    exit="exit"
                    transition={
                      scale > 1 && isDragging
                        ? { duration: 0 }
                        : slideTransition
                    }
                    drag={scale === 1 && galleryImages.length > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    onDragStart={() => {
                      hasDraggedRef.current = true;
                    }}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 w-full h-full flex items-center justify-center select-none touch-pan-y"
                    style={{
                      transformOrigin: "center center",
                    }}
                  >
                    <Image
                      src={currentImageUrl}
                      alt={productName}
                      fill
                      className="object-contain w-full h-full p-2 select-none pointer-events-none"
                      sizes="100vw"
                      priority
                      unoptimized
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Floating Bottom Toolbar inside Modal */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={zoomIn}
                  className="p-2 hover:bg-white/20 rounded-full transition cursor-pointer active:scale-90"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={scale <= 1}
                  className={`p-2 rounded-full transition cursor-pointer active:scale-90 ${
                    scale <= 1 ? "opacity-35 cursor-not-allowed" : "hover:bg-white/20"
                  }`}
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="p-2 hover:bg-white/20 rounded-full transition cursor-pointer active:scale-90"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-emerald-400 px-1">
                  {Math.round(scale * 100)}%
                </span>
              </div>
            </div>

            {/* Modal Bottom Thumbnail Strip */}
            <div
              className="w-full flex items-center justify-center gap-2 py-2 overflow-x-auto scrollbar-none z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={`modal-thumb-${idx}`}
                  type="button"
                  onClick={() => goToImage(idx)}
                  className={`relative w-14 h-16 sm:w-16 sm:h-18 rounded-xl bg-white/10 border transition overflow-hidden p-1 shrink-0 cursor-pointer ${
                    currentIndex === idx
                      ? "border-emerald-500 ring-2 ring-emerald-500/50 scale-105 bg-white/20"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    className="object-contain w-full h-full"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
}
