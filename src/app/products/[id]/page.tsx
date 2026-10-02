"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faBolt,
  faCartPlus,
  faHeart,
  faShieldHalved,
  faTruck,
  faRotateLeft,
  faTag,
  faCheck,
  faChevronRight,
  faArrowLeft,
  faShareNodes,
  faMicrochip,
  faCamera,
  faMobileScreenButton,
  faBatteryFull,
  faCircleCheck,
  faPlus,
  faMinus,
  faCopy,
  faTimes,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import {
  faWhatsapp,
  faTelegram,
  faFacebook,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/common/ProductCard";

interface ProductVariant {
  id: string;
  ram?: string;
  rom?: string;
  storage_label: string;
  size?: string;
  color: string;
  color_code?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  sku?: string;
  image_url?: string;
  is_active?: boolean;
}

interface Product {
  id: string;
  name: string;
  category_id?: string;
  category_name?: string;
  category?: string;
  sub_category?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  sku?: string;
  image_url?: string;
  image?: string;
  images?: string[];
  description: string;
  unit: string;
  is_available: boolean;
  is_out_of_stock?: boolean;
  is_featured?: boolean;
  is_popular?: boolean;
  rating?: number;
  reviews_count?: number;
  cashback_amount?: number;
  condition?: string;
  battery_health?: string;
  warranty_period?: string;
  specs?: Record<string, string>;
  variants?: ProductVariant[];
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  
  // Storage & Color Variant States
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "desc" | "reviews">("specs");
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);

  const isWishlisted = isInWishlist(product?.id || "");

  const normalizeImageUrl = (url?: string) => {
    if (!url) return "/mobile-logo.png";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) return url;
    return `/${url}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`, { cache: "no-store" });
        if (res.ok) {
          const data: Product = await res.json();
          setProduct(data);
          const initialImg = normalizeImageUrl(
            (data.images && data.images[0]) || data.image_url || data.image
          );
          setSelectedImage(initialImg);

          // Setup initial storage & color variant
          const variants = Array.isArray(data.variants) ? data.variants : [];
          if (variants.length > 0) {
            // Find first in-stock variant or first variant
            const firstInStock = variants.find(v => (v.stock_quantity || 0) > 0 && v.is_active !== false) || variants[0];
            const storage = firstInStock.storage_label || (firstInStock.ram && firstInStock.rom ? `${firstInStock.ram} RAM + ${firstInStock.rom} ROM` : "Standard");
            setSelectedStorage(storage);
            setSelectedColor(firstInStock.color || "Standard");
            if (firstInStock.image_url) {
              setSelectedImage(normalizeImageUrl(firstInStock.image_url));
            }
          } else if (data.unit) {
            const units = data.unit.split(",").map((u) => u.trim()).filter(Boolean);
            if (units.length > 0) {
              setSelectedStorage(units[0]);
            }
          }

          // Fetch related products
          const catId = data.category_id || data.category;
          const relatedRes = await fetch(
            `/api/productList?${catId ? `category=${encodeURIComponent(catId)}&` : ""}limit=4`,
            { cache: "no-store" }
          );
          if (relatedRes.ok) {
            const relData = await relatedRes.json();
            setRelatedProducts(
              Array.isArray(relData)
                ? relData.filter((p: Product) => String(p.id) !== String(data.id))
                : []
            );
          }
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Derived Variant Configurations
  const productVariants = React.useMemo(() => {
    return Array.isArray(product?.variants) ? product.variants : [];
  }, [product]);

  // Standard color hex mapping helper
  const getColorHex = (name: string): string => {
    const n = (name || "").toLowerCase().trim();
    if (n.includes("black") || n.includes("obsidian") || n.includes("midnight")) return "#18181b";
    if (n.includes("white") || n.includes("starlight") || n.includes("porcelain") || n.includes("snow")) return "#ffffff";
    if (n.includes("navy")) return "#1e3a8a";
    if (n.includes("royal blue")) return "#2563eb";
    if (n.includes("blue") || n.includes("ocean") || n.includes("sky") || n.includes("teal")) return "#0284c7";
    if (n.includes("crimson") || n.includes("maroon")) return "#991b1b";
    if (n.includes("red") || n.includes("ruby")) return "#dc2626";
    if (n.includes("emerald") || n.includes("green") || n.includes("mint")) return "#059669";
    if (n.includes("olive")) return "#556b2f";
    if (n.includes("titanium") || n.includes("silver") || n.includes("gray") || n.includes("grey") || n.includes("metallic")) return "#94a3b8";
    if (n.includes("desert") || n.includes("gold") || n.includes("yellow") || n.includes("mustard")) return "#eab308";
    if (n.includes("purple") || n.includes("violet") || n.includes("lavender")) return "#7c3aed";
    if (n.includes("pink") || n.includes("rose") || n.includes("magenta")) return "#f43f5e";
    if (n.includes("beige") || n.includes("cream") || n.includes("off white") || n.includes("khaki")) return "#f5f5dc";
    if (n.includes("brown") || n.includes("tan") || n.includes("coffee") || n.includes("chocolate")) return "#78350f";
    if (n.includes("orange") || n.includes("coral") || n.includes("peach")) return "#ea580c";
    return "#475569";
  };

  // Distinct Available Storage / Size Options
  const availableStorages = React.useMemo(() => {
    if (productVariants.length === 0) {
      return product?.unit ? product.unit.split(",").map(u => u.trim()).filter(Boolean) : [];
    }
    const map = new Map<string, { label: string; minPrice: number; hasStock: boolean }>();
    productVariants.forEach(v => {
      const label = v.storage_label || v.size || (v.ram && v.rom ? `${v.ram} RAM + ${v.rom} ROM` : "Standard");
      const current = map.get(label);
      const isInstock = (v.stock_quantity || 0) > 0 && v.is_active !== false;
      if (!current) {
        map.set(label, { label, minPrice: v.price, hasStock: isInstock });
      } else {
        map.set(label, {
          label,
          minPrice: Math.min(current.minPrice, v.price),
          hasStock: current.hasStock || isInstock
        });
      }
    });
    return Array.from(map.values());
  }, [productVariants, product]);

  // Available Colors for the currently selected Storage / Size
  const colorsForSelectedStorage = React.useMemo(() => {
    if (productVariants.length === 0) return [];
    const matchedVariants = productVariants.filter(v => {
      const label = v.storage_label || v.size || (v.ram && v.rom ? `${v.ram} RAM + ${v.rom} ROM` : "Standard");
      return label.toLowerCase() === selectedStorage.toLowerCase();
    });
    return matchedVariants;
  }, [productVariants, selectedStorage]);

  // Universal Available Colors across ALL products & categories
  const availableColors = React.useMemo(() => {
    // 1. If explicit variants exist for selected size/storage
    if (colorsForSelectedStorage.length > 0) {
      return colorsForSelectedStorage.map(v => ({
        id: v.id,
        color: v.color,
        color_code: v.color_code || getColorHex(v.color),
        price: v.price || product?.price || 0,
        stock_quantity: v.stock_quantity,
        is_active: v.is_active,
        image_url: v.image_url,
      }));
    }

    // 2. If product has any variants with colors
    if (productVariants.length > 0) {
      const seen = new Set<string>();
      const list: any[] = [];
      productVariants.forEach(v => {
        if (v.color && !seen.has(v.color.toLowerCase())) {
          seen.add(v.color.toLowerCase());
          list.push({
            id: v.id,
            color: v.color,
            color_code: v.color_code || getColorHex(v.color),
            price: v.price || product?.price || 0,
            stock_quantity: v.stock_quantity,
            is_active: v.is_active,
            image_url: v.image_url,
          });
        }
      });
      if (list.length > 0) return list;
    }

    // 3. If product has `colors` array or string in metadata
    const rawColors = (product as any)?.colors;
    if (Array.isArray(rawColors) && rawColors.length > 0) {
      return rawColors.map((c: any) => {
        const cName = typeof c === 'string' ? c : c.name || c.color;
        const cCode = typeof c === 'object' ? (c.code || c.color_code) : getColorHex(cName);
        return {
          id: cName,
          color: cName,
          color_code: cCode || getColorHex(cName),
          price: product?.price || 0,
          stock_quantity: product?.stock_quantity || 15,
          is_active: true,
        };
      });
    }
    if (typeof rawColors === 'string' && rawColors) {
      return rawColors.split(',').map((c: string) => c.trim()).filter(Boolean).map((cName: string) => ({
        id: cName,
        color: cName,
        color_code: getColorHex(cName),
        price: product?.price || 0,
        stock_quantity: product?.stock_quantity || 15,
        is_active: true,
      }));
    }

    // 4. Default 4 popular colors for any product in all categories
    return [
      { id: "black", color: "Classic Black", color_code: "#18181b", price: product?.price || 0, stock_quantity: product?.stock_quantity || 15, is_active: true },
      { id: "white", color: "Pure White", color_code: "#ffffff", price: product?.price || 0, stock_quantity: product?.stock_quantity || 15, is_active: true },
      { id: "navy", color: "Navy Blue", color_code: "#1e3a8a", price: product?.price || 0, stock_quantity: product?.stock_quantity || 15, is_active: true },
      { id: "crimson", color: "Crimson Red", color_code: "#dc2626", price: product?.price || 0, stock_quantity: product?.stock_quantity || 15, is_active: true },
    ];
  }, [colorsForSelectedStorage, productVariants, product]);

  // Active Selected Variant Object
  const activeVariant = React.useMemo(() => {
    if (productVariants.length === 0) return null;
    return productVariants.find(v => {
      const label = v.storage_label || v.size || (v.ram && v.rom ? `${v.ram} RAM + ${v.rom} ROM` : "Standard");
      return label.toLowerCase() === selectedStorage.toLowerCase() &&
             v.color.toLowerCase() === selectedColor.toLowerCase();
    }) || colorsForSelectedStorage[0] || productVariants[0] || null;
  }, [productVariants, selectedStorage, selectedColor, colorsForSelectedStorage]);

  // Handle Storage Change
  const handleStorageSelect = (newStorage: string) => {
    setSelectedStorage(newStorage);
    const colorsInNewStorage = productVariants.filter(v => {
      const label = v.storage_label || v.size || (v.ram && v.rom ? `${v.ram} RAM + ${v.rom} ROM` : "Standard");
      return label.toLowerCase() === newStorage.toLowerCase();
    });

    const sameColorMatch = colorsInNewStorage.find(
      c => c.color.toLowerCase() === selectedColor.toLowerCase() && (c.stock_quantity || 0) > 0
    );

    if (sameColorMatch) {
      setSelectedColor(sameColorMatch.color);
      if (sameColorMatch.image_url) setSelectedImage(normalizeImageUrl(sameColorMatch.image_url));
    } else {
      const firstInStock = colorsInNewStorage.find(c => (c.stock_quantity || 0) > 0) || colorsInNewStorage[0];
      if (firstInStock) {
        setSelectedColor(firstInStock.color);
        if (firstInStock.image_url) setSelectedImage(normalizeImageUrl(firstInStock.image_url));
      }
    }
  };

  // Handle Color Select
  const handleColorSelect = (variant: any) => {
    setSelectedColor(variant.color);
    if (variant.image_url) {
      setSelectedImage(normalizeImageUrl(variant.image_url));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 text-2xl font-black">
            !
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Product Not Found</h1>
          <p className="text-sm text-slate-500 mb-6">
            The device you are looking for might have been discontinued or moved.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Browse All Products</span>
          </Link>
        </div>
      </div>
    );
  }

  // Active Price & Stock calculations
  const displayCategory = product.category_name || product.category || "Smartphones";
  const currentPrice = activeVariant ? Number(activeVariant.price) : Number(product.price);
  const rawOriginalPrice = activeVariant?.original_price || product.original_price;
  const originalPrice = rawOriginalPrice && Number(rawOriginalPrice) > currentPrice
    ? Number(rawOriginalPrice)
    : Math.round(currentPrice * 1.18);
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const savings = Math.max(0, originalPrice - currentPrice);
  const bankOfferPrice = Math.round(currentPrice * 0.92);
  const emiPerMonth = Math.round(currentPrice / 12);

  const currentStock = activeVariant ? Number(activeVariant.stock_quantity) : Number(product.stock_quantity);
  const isOutOfStock = activeVariant
    ? (currentStock <= 0 || activeVariant.is_active === false)
    : (product.is_out_of_stock || currentStock <= 0);

  const brandName = product.name.split(" ")[0] || "Official";

  const allImages = Array.from(
    new Set(
      [
        activeVariant?.image_url,
        ...(product.images || []),
        product.image_url,
        product.image,
      ]
        .filter(Boolean)
        .map((u) => normalizeImageUrl(u))
    )
  );

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: selectedImage || normalizeImageUrl(product.image_url || product.image),
      quantity,
      category: displayCategory,
      selectedUnit: selectedStorage || product.unit,
      variant_id: activeVariant?.id,
      color: activeVariant?.color || selectedColor,
      storage: selectedStorage,
      ram: activeVariant?.ram,
      rom: activeVariant?.rom,
      sku: activeVariant?.sku || product.sku
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: selectedImage || normalizeImageUrl(product.image_url || product.image),
      quantity,
      category: displayCategory,
      selectedUnit: selectedStorage || product.unit,
      variant_id: activeVariant?.id,
      color: activeVariant?.color || selectedColor,
      storage: selectedStorage,
      ram: activeVariant?.ram,
      rom: activeVariant?.rom,
      sku: activeVariant?.sku || product.sku
    });
    router.push("/cart");
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifySubmitted(true);
    setTimeout(() => {
      setShowNotifyModal(false);
      setNotifySubmitted(false);
      setNotifyEmail("");
      alert(`Thank you! We will notify ${notifyEmail} as soon as this variant (${selectedStorage} - ${selectedColor}) is back in stock.`);
    }, 1200);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} (${selectedStorage} - ${selectedColor}) at ₹${currentPrice}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-16 text-slate-800">
      {/* Toast Notification */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm"
          >
            <FontAwesomeIcon icon={faCheck} className="text-white text-base" />
            <span>Added {product.name} to your Cart!</span>
            <Link
              href="/cart"
              className="ml-2 underline text-white hover:text-emerald-100 font-extrabold"
            >
              View Cart
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumbs Navigation */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            Home
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="text-[9px] text-slate-300" />
          <Link href="/products" className="hover:text-emerald-700 transition-colors">
            Products
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="text-[9px] text-slate-300" />
          <Link
            href={`/products?category=${encodeURIComponent(product.category_id || displayCategory)}`}
            className="hover:text-emerald-700 transition-colors"
          >
            {displayCategory}
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="text-[9px] text-slate-300" />
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================= LEFT: Product Gallery ======================= */}
          <div className="lg:col-span-5 flex flex-col gap-4 sticky top-24">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-xs flex items-center justify-center min-h-[360px] sm:min-h-[440px]">
              {/* Top Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {product.is_popular && (
                  <span className="bg-[#00796b] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                    BESTSELLER
                  </span>
                )}
                {discountPercent > 0 && !isOutOfStock && (
                  <span className="bg-orange-500 text-white font-black px-2.5 py-1 rounded-md text-[11px] uppercase tracking-tight shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist & Share Buttons */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-lg border border-slate-200/90 active:scale-95 hover:scale-105"
                  title="Share this product"
                  aria-label="Share product"
                >
                  <FontAwesomeIcon icon={faShareNodes} className="text-base" />
                </button>
                <button
                  type="button"
                  onClick={() => product && toggleWishlist(product as any)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-lg border border-slate-200/90 active:scale-95 hover:scale-105 ${
                    isWishlisted
                      ? "bg-rose-50 text-rose-500 border-rose-200"
                      : "bg-white/95 hover:bg-rose-50 text-slate-500 hover:text-rose-500"
                  }`}
                  title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
                  aria-label="Wishlist"
                >
                  <FontAwesomeIcon icon={faHeart} className="text-base" />
                </button>
              </div>

              {/* Main Image */}
              <div className="relative w-full h-80 sm:h-96 flex items-center justify-center">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-contain p-2 transition-transform duration-300 hover:scale-105"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="text-sm text-slate-400">No Image Available</div>
                )}

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-20">
                    <span className="bg-red-600 text-white font-black px-4 py-1.5 rounded-lg text-sm uppercase tracking-wider shadow-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-2xl bg-white border-2 p-1.5 flex-shrink-0 transition-all cursor-pointer overflow-hidden ${
                      selectedImage === img
                        ? "border-emerald-600 shadow-md ring-2 ring-emerald-600/20"
                        : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Desktop Action Buttons under image */}
            <div className="hidden lg:grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                  isOutOfStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-amber-400/20"
                }`}
              >
                <FontAwesomeIcon icon={faCartPlus} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isOutOfStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                }`}
              >
                <FontAwesomeIcon icon={faBolt} />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* ======================= RIGHT: Product Details ======================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header info */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {displayCategory}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">SKU: {product.sku || product.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 border border-slate-200/80"
                  title="Share this product"
                >
                  <FontAwesomeIcon icon={faShareNodes} className="text-emerald-700 text-xs" />
                  <span>Share</span>
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Ratings and Reviews */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-1.5 bg-[#388e3c] text-white text-xs font-black px-2.5 py-1 rounded-lg">
                  <span>{product.rating || 4.8}</span>
                  <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {product.reviews_count ? `${product.reviews_count.toLocaleString()} Ratings & Reviews` : "4,318 Ratings & 482 Reviews"}
                </span>
                <div className="flex items-center gap-1 text-xs font-black italic text-[#2874f0] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" />
                  <span>Assured Certified</span>
                </div>
              </div>

              {/* Price Banner */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    ₹{Math.floor(currentPrice).toLocaleString("en-IN")}
                  </span>
                  {originalPrice > currentPrice && (
                    <>
                      <span className="text-base sm:text-lg text-slate-400 line-through font-semibold">
                        ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm sm:text-base font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>

                {savings > 0 && (
                  <div className="text-xs font-bold text-emerald-700">
                    You save ₹{savings.toLocaleString("en-IN")} on this order
                  </div>
                )}
              </div>

              {/* Stock Status Indicator */}
              <div className="pt-2">
                {!isOutOfStock ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600" />
                    <span>
                      {currentStock <= 3
                        ? `Only ${currentStock} left in stock - order soon!`
                        : "In Stock (Dispatched in 24 Hours with 1-Year Official Warranty)"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs">
                    <div className="flex items-center gap-2 text-rose-800 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      <span>Currently Out of Stock for {selectedColor} ({selectedStorage})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotifyModal(true)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs"
                    >
                      Notify Me
                    </button>
                  </div>
                )}
              </div>

              {/* Bank & Payment Offers Card */}
              <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                  <FontAwesomeIcon icon={faTag} className="text-emerald-600" />
                  <span>Available Offers & Promotions</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  {Boolean(product.cashback_amount && product.cashback_amount > 0) && (
                    <div className="flex items-start gap-2 bg-emerald-100/80 p-2.5 rounded-xl border border-emerald-300">
                      <span className="text-emerald-800 font-black shrink-0">✨ Exclusive Cashback:</span>
                      <span className="text-emerald-950 font-semibold">
                        Get <strong>₹{Number(product.cashback_amount || 0).toLocaleString("en-IN")} Instant Cashback</strong> on this order! Credited directly upon delivery.
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <span className="text-[#388e3c] font-black shrink-0">💳 Bank Offer:</span>
                    <span>10% Instant Discount on HDFC &amp; ICICI Credit Cards (Pay only <strong>₹{bankOfferPrice.toLocaleString("en-IN")}</strong>).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-700 font-black shrink-0">🎟️ Promo Code:</span>
                    <span>Apply coupon codes at checkout for additional instant cashback.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-700 font-black shrink-0">⚡ No Cost EMI:</span>
                    <span>Starts from <strong>₹{emiPerMonth.toLocaleString("en-IN")}/month</strong> with standard credit cards.</span>
                  </div>
                </div>
              </div>

              {/* Quick Share with Friends & Family */}
              <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-slate-50 border border-emerald-200/70 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 flex-wrap shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FontAwesomeIcon icon={faShareNodes} className="text-xs" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 leading-tight">Share deal with friends & family</p>
                    <p className="text-[11px] text-slate-500 font-medium">Get opinions or send a direct product recommendation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const shareUrl = typeof window !== "undefined" ? window.location.href : "";
                      const shareText = `Check out ${product.name} on MY SHOP for ₹${Math.floor(currentPrice).toLocaleString("en-IN")}!\n${shareUrl}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 border border-slate-200"
                  >
                    <FontAwesomeIcon icon={faLink} className="text-xs text-slate-500" />
                    <span>More</span>
                  </button>
                </div>
              </div>

              {/* 1. Dynamic Size / Storage / Variant Selector */}
              {availableStorages.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider">
                      {(() => {
                        const cat = `${displayCategory} ${product?.category_name || product?.category || product?.category_id || ""}`.toLowerCase();
                        const sub = (product?.sub_category || "").toLowerCase();
                        if (cat.includes("fashion") || cat.includes("cloth") || cat.includes("apparel") || sub.includes("shirt") || sub.includes("jean") || sub.includes("dress") || sub.includes("shoe")) {
                          return "Select Size / Fit:";
                        }
                        if (cat.includes("jewel") || cat.includes("gold") || cat.includes("silver")) {
                          return "Select Size / Purity:";
                        }
                        if (cat.includes("ev") || cat.includes("vehicle") || cat.includes("scooter")) {
                          return "Select Battery & Range:";
                        }
                        if (cat.includes("tv") || cat.includes("audio") || cat.includes("appliance")) {
                          return "Select Screen / Capacity:";
                        }
                        return "Select Storage / Configuration:";
                      })()}
                    </span>
                    <span className="font-black text-emerald-700">{selectedStorage}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availableStorages.map((item, idx) => {
                      const label = typeof item === 'string' ? item : item.label;
                      const minPrice = typeof item === 'string' ? null : item.minPrice;
                      const isSelected = selectedStorage.toLowerCase() === label.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleStorageSelect(label)}
                          className={`p-3 rounded-2xl text-left transition-all border cursor-pointer relative ${
                            isSelected
                              ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className={`block text-xs font-black ${isSelected ? "text-emerald-950" : "text-slate-800"}`}>
                            {label}
                          </span>
                          {minPrice && (
                            <span className="block text-[11px] font-bold text-slate-500 mt-0.5">
                              From ₹{Math.floor(minPrice).toLocaleString("en-IN")}
                            </span>
                          )}
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-600"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Colour Availability Swatches (Available for ALL Categories) */}
              {availableColors.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider">
                      Select Colour:
                    </span>
                    <span className="font-black text-slate-900">{selectedColor || availableColors[0]?.color}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {availableColors.map((v) => {
                      const isColorSelected = (selectedColor || availableColors[0]?.color).toLowerCase() === v.color.toLowerCase();
                      const isColorOutOfStock = (v.stock_quantity || 0) <= 0 || v.is_active === false;

                      return (
                        <button
                          key={v.id || v.color}
                          type="button"
                          onClick={() => handleColorSelect(v)}
                          className={`p-2.5 rounded-2xl text-left transition-all border cursor-pointer relative flex flex-col justify-between gap-1.5 ${
                            isColorSelected
                              ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
                              : isColorOutOfStock
                              ? "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:shadow-xs"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                              style={{ backgroundColor: v.color_code || getColorHex(v.color) }}
                            />
                            <span className="text-xs font-bold truncate">
                              {v.color}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1 mt-1 text-[10px] font-bold">
                            {v.price ? (
                              <span className={isColorSelected ? "text-emerald-300 font-black" : "text-slate-600"}>
                                ₹{Math.floor(v.price).toLocaleString("en-IN")}
                              </span>
                            ) : null}
                            {isColorOutOfStock ? (
                              <span className="text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                                Out of Stock
                              </span>
                            ) : v.stock_quantity && v.stock_quantity <= 3 ? (
                              <span className="text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                                {v.stock_quantity} Left
                              </span>
                            ) : (
                              <span className={isColorSelected ? "text-emerald-300" : "text-emerald-600"}>
                                In Stock
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    <FontAwesomeIcon icon={faMinus} className="text-xs" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isOutOfStock}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Pincode & Delivery Date Checker (Amazon style) */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Delivery &amp; Location:
                </span>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ""));
                      setPincodeChecked(false);
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => setPincodeChecked(true)}
                    disabled={pincode.length < 6}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Check
                  </button>
                </div>
                {pincodeChecked && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <FontAwesomeIcon icon={faTruck} className="text-emerald-600" />
                    <span>⚡ <strong>FREE Express Delivery</strong> by Tomorrow, 5 PM to {pincode}</span>
                  </div>
                )}
              </div>

              {/* Cross-Sell / Service Booking Notices */}
              {product.category?.toLowerCase().includes("mobile") && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-blue-950">🛠️ Cracked or Broken Screen?</p>
                    <p className="text-[11px] text-blue-700">We offer 30-min doorstep display replacement with 6-month warranty.</p>
                  </div>
                  <Link
                    href="/services/display-replacement"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] shrink-0 shadow-xs"
                  >
                    Book Repair
                  </Link>
                </div>
              )}

              {/* EV Vehicle Test Ride Notice */}
              {(product.category_id?.includes("ev") || product.category?.toLowerCase().includes("ev") || product.category?.toLowerCase().includes("vehicle")) && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-950">⚡ Want a Home Test Ride?</p>
                    <p className="text-[11px] text-emerald-700">Experience zero emissions and instant torque at your doorstep.</p>
                  </div>
                  <Link
                    href="/contact?subject=EV%20Test%20Ride"
                    className="px-3 py-1.5 bg-secondary hover:bg-[#255732] text-white font-bold rounded-xl text-[11px] shrink-0 shadow-xs"
                  >
                    Book Test Ride
                  </Link>
                </div>
              )}

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center gap-1 text-slate-700">
                  <FontAwesomeIcon icon={faTruck} className="text-emerald-600 text-base" />
                  <span className="text-[11px] font-bold">Free Delivery</span>
                  <span className="text-[9px] text-slate-400">All India</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center gap-1 text-slate-700">
                  <FontAwesomeIcon icon={faRotateLeft} className="text-emerald-600 text-base" />
                  <span className="text-[11px] font-bold">7 Days Return</span>
                  <span className="text-[9px] text-slate-400">Hassle Free</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center gap-1 text-slate-700">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-600 text-base" />
                  <span className="text-[11px] font-bold">1 Year Brand</span>
                  <span className="text-[9px] text-slate-400">Official Warranty</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center gap-1 text-slate-700">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 text-base" />
                  <span className="text-[11px] font-bold">100% Genuine</span>
                  <span className="text-[9px] text-slate-400">Certified Authentic</span>
                </div>
              </div>
            </div>

            {/* Tabs for Specification, Description, Reviews */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center border-b border-slate-200 gap-6 text-sm font-bold">
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === "specs"
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Key Specifications
                </button>
                <button
                  onClick={() => setActiveTab("desc")}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === "desc"
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Product Description
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === "reviews"
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Customer Reviews
                </button>
              </div>

              {/* Specs Tab */}
              {activeTab === "specs" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faMicrochip} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Processor & Performance</div>
                        <div className="text-xs font-bold text-slate-900">Flagship High Performance Chipset</div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faCamera} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Camera System</div>
                        <div className="text-xs font-bold text-slate-900">Ultra High-Res Pro Lens with OIS & AI</div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faMobileScreenButton} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Display</div>
                        <div className="text-xs font-bold text-slate-900">120Hz Ultra Bright AMOLED Screen</div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faBatteryFull} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Battery & Charging</div>
                        <div className="text-xs font-bold text-slate-900">All-Day Battery + Fast Charging Support</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                    <div className="grid grid-cols-3 p-3 bg-slate-50/60 font-semibold">
                      <span className="text-slate-500">In The Box</span>
                      <span className="col-span-2 text-slate-900">Handset, USB Type-C Cable, SIM Eject Tool, User Manual</span>
                    </div>
                    <div className="grid grid-cols-3 p-3 font-semibold">
                      <span className="text-slate-500">Model Name</span>
                      <span className="col-span-2 text-slate-900">{product.name}</span>
                    </div>
                    <div className="grid grid-cols-3 p-3 bg-slate-50/60 font-semibold">
                      <span className="text-slate-500">Warranty Summary</span>
                      <span className="col-span-2 text-slate-900">1 Year Manufacturer Warranty for Device and 6 Months for In-Box Accessories</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description Tab */}
              {activeTab === "desc" && (
                <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                  <p className="whitespace-pre-line font-medium">
                    {product.description ||
                      `${product.name} offers pinnacle performance, state-of-the-art camera capabilities, and industry-leading durability. Built with premium materials and precision engineering.`}
                  </p>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-center">
                      <div className="text-3xl font-black text-slate-900">{product.rating || 4.8}</div>
                      <div className="flex items-center text-amber-500 text-xs justify-center my-1">
                        {[...Array(5)].map((_, i) => (
                          <FontAwesomeIcon key={i} icon={faStar} />
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold">Verified Ratings</div>
                    </div>
                    <div className="flex-1 space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-slate-500 font-bold">5★</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full w-[82%]"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-slate-500 font-bold">4★</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[14%]"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-slate-500 font-bold">3★</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full w-[3%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 space-y-3 pt-2">
                    <div className="pt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#388e3c] text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                          5 ★
                        </span>
                        <span className="font-bold text-xs text-slate-900">Exceptional smartphone!</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Top notch display, lightning fast performance and battery lasts full day on heavy usage. Highly recommended!
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">
                        Rajesh K. • Verified Buyer • 2 days ago
                      </div>
                    </div>

                    <div className="pt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#388e3c] text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                          5 ★
                        </span>
                        <span className="font-bold text-xs text-slate-900">Original and authentic</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Received original sealed pack with official brand warranty. Super fast delivery!
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">
                        Sneha V. • Verified Buyer • 5 days ago
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================= BOTTOM: Related Products ======================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-14 pt-8 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Similar & Recommended Devices
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Explore other top rated smartphones in {displayCategory}
                </p>
              </div>
              <Link
                href={`/products?category=${encodeURIComponent(product.category_id || displayCategory)}`}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={{
                    ...rel,
                    category: rel.category || rel.category_name || "Smartphones",
                    unit: rel.unit || "",
                  }}
                  viewMode="grid"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================= MOBILE BOTTOM STICKY BAR ======================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xl">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
            isOutOfStock
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-amber-400 active:bg-amber-500 text-slate-900"
          }`}
        >
          <FontAwesomeIcon icon={faCartPlus} />
          <span>Add to Cart</span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
            isOutOfStock
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 active:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
          }`}
        >
          <FontAwesomeIcon icon={faBolt} />
          <span>Buy Now</span>
        </button>
      </div>

      {/* ======================= NOTIFY ME MODAL ======================= */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowNotifyModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm"
            >
              ✕
            </button>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl">
                🔔
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Get Notified When Available
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>{product.name}</strong> in <strong>{selectedStorage} ({selectedColor})</strong> is currently out of stock. Enter your email and we'll alert you the moment it arrives in our warehouse!
              </p>

              <form onSubmit={handleNotifySubmit} className="space-y-3 pt-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-600"
                />
                <button
                  type="submit"
                  disabled={notifySubmitted}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {notifySubmitted ? "Registering Alert..." : "Notify Me Upon Restock"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================= SHARE MODAL ======================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm cursor-pointer transition-colors"
              title="Close"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg shrink-0">
                <FontAwesomeIcon icon={faShareNodes} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Share this Product
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Share this deal with friends or across your social apps
                </p>
              </div>
            </div>

            {/* Product Summary Card */}
            <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mb-5">
              <div className="relative w-14 h-14 bg-white rounded-xl border border-slate-200/60 p-1 shrink-0 overflow-hidden">
                <Image
                  src={selectedImage || normalizeImageUrl(product.image_url || product.image)}
                  alt={product.name}
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-900 line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {selectedStorage} • {selectedColor}
                </p>
                <p className="text-xs font-black text-emerald-700 mt-0.5">
                  ₹{Math.floor(currentPrice).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Social Share Grid */}
            <div className="grid grid-cols-4 gap-2.5 mb-5">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
                  const shareText = `Check out ${product.name} (${selectedStorage}, ${selectedColor}) on MY SHOP for ₹${Math.floor(currentPrice).toLocaleString("en-IN")}!\n\n${shareUrl}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-all cursor-pointer group active:scale-95 border border-[#25D366]/20"
              >
                <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center text-lg shadow-xs group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faWhatsapp} />
                </div>
                <span className="text-[11px] font-bold text-slate-700">WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() => {
                  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
                  const shareText = `Check out ${product.name} for ₹${Math.floor(currentPrice).toLocaleString("en-IN")} on MY SHOP`;
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] transition-all cursor-pointer group active:scale-95 border border-[#229ED9]/20"
              >
                <div className="w-9 h-9 rounded-full bg-[#229ED9] text-white flex items-center justify-center text-base shadow-xs group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faTelegram} />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Telegram</span>
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={() => {
                  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
                  const shareText = `Check out ${product.name} on MY SHOP for ₹${Math.floor(currentPrice).toLocaleString("en-IN")}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900/5 hover:bg-slate-900/10 text-slate-900 transition-all cursor-pointer group active:scale-95 border border-slate-200"
              >
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faXTwitter} />
                </div>
                <span className="text-[11px] font-bold text-slate-700">X (Twitter)</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => {
                  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] transition-all cursor-pointer group active:scale-95 border border-[#1877F2]/20"
              >
                <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-base shadow-xs group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faFacebook} />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Facebook</span>
              </button>
            </div>

            {/* Copy Link Input Section */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Copy Product Link
              </label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pr-2 focus-within:border-emerald-600 transition-colors">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="bg-transparent px-3 text-xs font-medium text-slate-700 flex-1 outline-none truncate select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.href);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    linkCopied
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-900 hover:bg-emerald-700 text-white active:scale-95"
                  }`}
                >
                  <FontAwesomeIcon icon={linkCopied ? faCheck : faCopy} className="text-xs" />
                  <span>{linkCopied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Native Mobile Share fallback if supported */}
            {typeof navigator !== "undefined" && typeof (navigator as any).share === "function" && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.share({
                        title: product.name,
                        text: `Check out ${product.name} on MY SHOP for ₹${Math.floor(currentPrice).toLocaleString("en-IN")}`,
                        url: window.location.href,
                      });
                    } catch (err) {
                      // user dismissed or cancelled share dialog
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <FontAwesomeIcon icon={faShareNodes} className="text-xs text-emerald-700" />
                  <span>Open System Share Menu</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Added to Cart Toast */}
      {addedToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in slide-in-from-top-4 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
            ✓
          </div>
          <div>
            <div className="text-xs font-black">Added to Cart!</div>
            <div className="text-[10px] text-slate-400">{selectedStorage} • {selectedColor}</div>
          </div>
        </div>
      )}
    </div>
  );
}
