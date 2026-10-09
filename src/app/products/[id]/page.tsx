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
  const [pincode, setPincode] = useState("500001");
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [exchangeOption, setExchangeOption] = useState<"without" | "with">("without");
  const [showExchangeModal, setShowExchangeModal] = useState(false);

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
        let data: Product | null = null;
        try {
          const res = await fetch(`/api/products/${productId}`, { cache: "no-store" });
          if (res.ok) {
            data = await res.json();
          }
        } catch {
          // ignore
        }

        if (!data) {
          try {
            const listRes = await fetch(`/api/productList`, { cache: "no-store" });
            if (listRes.ok) {
              const allProds: Product[] = await listRes.json();
              const cleanId = decodeURIComponent(String(productId)).toLowerCase().trim();
              data = allProds.find((p) => {
                const pId = String(p.id).toLowerCase().trim();
                if (pId === cleanId) return true;
                const slug = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return slug === cleanId || cleanId.includes(pId) || pId.includes(cleanId);
              }) || null;
            }
          } catch {
            // ignore
          }
        }

        if (data) {
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
                ? relData.filter((p: Product) => String(p.id) !== String(data?.id))
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
    <div className="min-h-screen bg-[#f8fafc] pb-12 md:pb-8 text-slate-800">
      {/* Toast Notification */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 right-3 sm:right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 font-bold text-xs sm:text-sm"
          >
            <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
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

      {/* Breadcrumbs Navigation (Amazon Exact) */}
      <div className="bg-white border-b border-slate-200/90 text-xs">
        <div className="max-w-[1440px] mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1 text-slate-600 overflow-x-auto whitespace-nowrap">
          <Link href="/products?category=Smart%20Technology" className="hover:text-orange-600 hover:underline">
            Electronics
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="text-[8px] text-slate-400" />
          <Link href="/products?category=Mobiles" className="hover:text-orange-600 hover:underline">
            Mobiles &amp; Accessories
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="text-[8px] text-slate-400" />
          <Link href="/products?category=Mobiles" className="hover:text-orange-600 hover:underline">
            Smartphones &amp; Basic Mobiles
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="text-[8px] text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">
            Smartphones
          </span>
        </div>
      </div>

      {/* Main Container: Amazon 3-Column Layout */}
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 py-2 sm:py-4 md:py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 lg:gap-6 items-start">
          
          {/* ======================= COLUMN 1 (5 cols): Gallery & Thumbnails (Flipkart Style) ======================= */}
          <div className="lg:col-span-5 w-full flex flex-col gap-3">
            {/* Main Image Viewer (Flipkart Clean Card - Full Uncropped Product) */}
            <div className="relative w-full aspect-square min-h-[340px] sm:min-h-[440px] md:min-h-[480px] bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-5 shadow-2xs flex items-center justify-center group overflow-hidden">
              {/* Top Action Buttons */}
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-md border border-slate-200 transition-all cursor-pointer backdrop-blur-xs active:scale-90"
                  title="Share product"
                >
                  <FontAwesomeIcon icon={faShareNodes} className="text-sm" />
                </button>
                <button
                  type="button"
                  onClick={() => product && toggleWishlist(product as any)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-slate-200 transition-all cursor-pointer backdrop-blur-xs active:scale-90 ${
                    isWishlisted ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600"
                  }`}
                  title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
                >
                  <FontAwesomeIcon icon={faHeart} className="text-sm" />
                </button>
              </div>

              {/* Main Product Image (Centered, Full Proportion, Uncropped) */}
              <div className="relative w-full h-full max-h-[440px] flex items-center justify-center">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-contain p-1 sm:p-2 transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                    priority
                    sizes="(max-width: 768px) 100vw, 500px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">No Image Available</div>
                )}

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl z-20">
                    <span className="bg-red-600 text-white font-black px-4 py-1.5 rounded-lg text-sm uppercase tracking-wider shadow-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Horizontal Thumbnail Strip Below Main Image */}
            <div className="w-full flex items-center justify-start gap-2.5 overflow-x-auto scrollbar-none py-1.5 px-0.5">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  onMouseEnter={() => setSelectedImage(img)}
                  className={`relative w-14 h-16 sm:w-16 sm:h-18 rounded-xl bg-white border shrink-0 transition-all cursor-pointer overflow-hidden p-1 ${
                    selectedImage === img
                      ? "border-[#2E6F40] shadow-md ring-2 ring-[#2E6F40]/50 scale-105"
                      : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-contain p-0.5"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ======================= COLUMN 2 (4 cols): Center Product Details ======================= */}
          <div className="lg:col-span-4 w-full space-y-4">
            
            {/* Title & Brand Store Link */}
            <div className="space-y-1.5 border-b border-slate-200 pb-3">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h1>
              
              <Link 
                href={`/products?category=Mobiles&search=${encodeURIComponent(brandName)}`}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-orange-600 hover:underline block"
              >
                Visit the {brandName} Store
              </Link>

              {/* Rating and Reviews Counter */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="font-bold text-slate-900">{product.rating || 4.5}</span>
                <div className="flex text-amber-500 text-xs">
                  {[...Array(4)].map((_, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} />
                  ))}
                  <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                </div>
                <span className="text-blue-600 hover:underline cursor-pointer">
                  ({product.reviews_count || 111})
                </span>
              </div>
            </div>

            {/* Price Block (Matching Screenshot 3 Exact Format) */}
            <div className="space-y-1.5 border-b border-slate-200 pb-3">
              <div className="flex items-baseline gap-3">
                <span className="text-red-700 text-2xl sm:text-3xl font-light">
                  -{discountPercent}%
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                  ₹{Math.floor(exchangeOption === "with" ? Math.max(1000, currentPrice - 34150) : currentPrice).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="text-xs text-slate-500">
                M.R.P.: <span className="line-through">₹{Math.floor(originalPrice).toLocaleString("en-IN")}</span>
              </div>
              <div className="text-xs text-slate-700 font-medium">
                Inclusive of all taxes
              </div>

              <div className="pt-2 text-xs text-slate-800">
                <strong>EMI</strong> starts at ₹{Math.floor(currentPrice / 24).toLocaleString("en-IN")}. No Cost EMI available{" "}
                <button type="button" className="text-blue-600 hover:underline font-bold">
                  EMI options ∨
                </button>
              </div>
            </div>

            {/* Colour Swatches with Color-Specific Rates (Directly below Price) */}
            {availableColors.length > 0 && (
              <div className="space-y-2.5 border-b border-slate-200 pb-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-bold">
                    Colour: <strong className="text-slate-900">{selectedColor || availableColors[0]?.color}</strong>
                  </span>
                  {activeVariant?.price && (
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      Rate: ₹{Number(activeVariant.price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {availableColors.map((v) => {
                    const isColorSelected = (selectedColor || availableColors[0]?.color).toLowerCase() === v.color.toLowerCase();
                    const isOut = v.stock_quantity !== undefined && v.stock_quantity <= 0;
                    return (
                      <button
                        key={v.id || v.color}
                        type="button"
                        onClick={() => handleColorSelect(v)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                          isColorSelected
                            ? "bg-amber-50/90 border-orange-500 text-slate-950 ring-2 ring-orange-500/40 shadow-xs scale-[1.02]"
                            : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50/70"
                        } ${isOut ? "opacity-60" : ""}`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                          style={{ backgroundColor: v.color_code || getColorHex(v.color) }}
                        />
                        <div className="flex flex-col items-start leading-tight">
                          <span className="truncate max-w-[130px]">{v.color}</span>
                          {v.price && (
                            <span className={`text-[10.5px] font-black ${isColorSelected ? "text-orange-700" : "text-emerald-700"}`}>
                              ₹{Number(v.price).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Storage / Configuration Selector */}
            {availableStorages.length > 0 && (
              <div className="space-y-2 border-b border-slate-200 pb-3">
                <span className="text-xs text-slate-600 font-bold">
                  Size / Storage: <strong className="text-slate-900">{selectedStorage}</strong>
                </span>
                <div className="flex gap-2 flex-wrap">
                  {availableStorages.map((item, idx) => {
                    const label = typeof item === 'string' ? item : item.label;
                    const isSelected = selectedStorage.toLowerCase() === label.toLowerCase();
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleStorageSelect(label)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-amber-50 border-orange-500 text-slate-950 shadow-xs ring-1 ring-orange-500"
                            : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3 Horizontal Amazon Offers Cards */}
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span className="text-orange-500 text-sm">🏷️</span>
                <span>Offers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Offer 1: No Cost EMI */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-1">
                  <span className="font-bold text-slate-900 block">No Cost EMI</span>
                  <p className="text-[11px] text-slate-600 leading-tight line-clamp-2">
                    Upto ₹15,103.27 EMI interest savings on select Credit Cards...
                  </p>
                  <span className="text-blue-600 font-bold text-[11px] hover:underline block pt-1">
                    3 offers &gt;
                  </span>
                </div>

                {/* Offer 2: Cashback */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-1">
                  <span className="font-bold text-slate-900 block">Cashback</span>
                  <p className="text-[11px] text-slate-600 leading-tight line-clamp-2">
                    Upto ₹{Number(product.cashback_amount || 5249).toLocaleString("en-IN")} cashback as Store Pay Balance...
                  </p>
                  <span className="text-blue-600 font-bold text-[11px] hover:underline block pt-1">
                    1 offer &gt;
                  </span>
                </div>

                {/* Offer 3: Partner Offers */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-1">
                  <span className="font-bold text-slate-900 block">Partner Offers</span>
                  <p className="text-[11px] text-slate-600 leading-tight line-clamp-2">
                    Get GST invoice and save up to 18% on business purchases...
                  </p>
                  <span className="text-blue-600 font-bold text-[11px] hover:underline block pt-1">
                    1 offer &gt;
                  </span>
                </div>
              </div>
            </div>

            {/* Specs Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-3 p-2.5 bg-slate-50 font-semibold">
                <span className="text-slate-500">Brand</span>
                <span className="col-span-2 text-slate-900">{brandName}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5 font-semibold">
                <span className="text-slate-500">Operating System</span>
                <span className="col-span-2 text-slate-900">Android 15 / OxygenOS / iOS</span>
              </div>
              <div className="grid grid-cols-3 p-2.5 bg-slate-50 font-semibold">
                <span className="text-slate-500">Cellular Technology</span>
                <span className="col-span-2 text-slate-900">5G, 4G LTE, VoLTE</span>
              </div>
            </div>
          </div>

          {/* ======================= COLUMN 3 (3 cols): Amazon Right Buy Box ======================= */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 sticky top-20 text-xs select-none">

            {/* Radio 1: With Exchange */}
            <div 
              onClick={() => setExchangeOption("with")}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                exchangeOption === "with"
                  ? "border-orange-500 bg-amber-50/50 ring-1 ring-orange-400"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                  <input
                    type="radio"
                    name="exchange"
                    checked={exchangeOption === "with"}
                    onChange={() => setExchangeOption("with")}
                    className="text-orange-500 focus:ring-orange-400"
                  />
                  <span>With Exchange</span>
                </label>
              </div>
              <p className="text-[11px] font-bold text-red-700 pl-5 mt-0.5">
                Up to ₹ 34,150.00 off
              </p>
            </div>

            {/* Radio 2: Without Exchange */}
            <div 
              onClick={() => setExchangeOption("without")}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                exchangeOption === "without"
                  ? "border-orange-500 bg-amber-50/50 ring-1 ring-orange-400"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                  <input
                    type="radio"
                    name="exchange"
                    checked={exchangeOption === "without"}
                    onChange={() => setExchangeOption("without")}
                    className="text-orange-500 focus:ring-orange-400"
                  />
                  <span>Without Exchange</span>
                </label>
              </div>
              <div className="pl-5 mt-0.5 flex items-baseline gap-2">
                <span className="font-bold text-red-700 text-xs">
                  ₹ {Math.floor(currentPrice).toLocaleString("en-IN")}
                </span>
                <span className="line-through text-slate-400 text-[11px]">
                  ₹{Math.floor(originalPrice).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Delivery Estimation */}
            <div className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
              <div>
                <strong>FREE delivery</strong> <span className="font-bold text-slate-900">Friday, 9 October.</span>{" "}
                <span className="text-blue-600 hover:underline cursor-pointer">Details</span>
              </div>
              <div>
                Or fastest delivery <span className="font-bold text-slate-900">Tomorrow 8 am - 12 pm.</span> Order within 12 hrs 37 mins.{" "}
                <span className="text-blue-600 hover:underline cursor-pointer">Details</span>
              </div>

              {/* Delivery Location */}
              <div className="flex items-center gap-1.5 text-blue-600 font-semibold pt-1">
                <span>📍</span>
                <span className="hover:underline cursor-pointer">
                  Delivering to Hyderabad {pincode} - Update location
                </span>
              </div>
            </div>

            {/* In Stock Status */}
            <div className="text-sm font-bold text-emerald-700">
              {!isOutOfStock ? "In stock" : "Currently unavailable"}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 font-semibold">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-200"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-[10px]" />
                </button>
                <span className="w-8 text-center font-bold text-xs text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isOutOfStock}
                  className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-200"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now (MY SHOP Brand Colors: Emerald Green) */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3 px-4 rounded-xl font-black text-xs transition-all shadow-md cursor-pointer active:scale-98 flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-[#2E6F40] hover:bg-[#245e35] text-white shadow-emerald-800/20 border border-[#245e35]"
                }`}
              >
                <FontAwesomeIcon icon={faCartPlus} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`w-full py-3 px-4 rounded-xl font-black text-xs transition-all shadow-md cursor-pointer active:scale-98 flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-[#2E6F40] hover:bg-[#245e35] text-white shadow-emerald-800/20 border border-[#245e35]"
                }`}
              >
                <FontAwesomeIcon icon={faBolt} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Secure Transaction & Sold By */}
            <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <FontAwesomeIcon icon={faShieldHalved} className="text-slate-400 text-xs" />
                <span>Secure transaction</span>
              </div>
              <div className="grid grid-cols-2">
                <span>Ships from</span>
                <span className="text-slate-800 font-semibold">My Shop</span>
              </div>
              <div className="grid grid-cols-2">
                <span>Sold by</span>
                <span className="text-slate-800 font-semibold">My Shop Retail</span>
              </div>
            </div>

          </div>

        </div>

        {/* Tabs for Specification, Description, Reviews */}
        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center border-b border-slate-200 gap-6 text-sm font-bold">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "specs"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Key Specifications
            </button>
            <button
              onClick={() => setActiveTab("desc")}
              className={`pb-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "desc"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Product Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "border-orange-600 text-orange-600"
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
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faMicrochip} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Processor &amp; Performance</div>
                    <div className="text-xs font-bold text-slate-900">Flagship High Performance Snapdragon / Bionic Chipset</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faCamera} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Camera System</div>
                    <div className="text-xs font-bold text-slate-900">Ultra High-Res Pro Lens with OIS &amp; Galaxy AI / Photonic Engine</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faMobileScreenButton} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Display</div>
                    <div className="text-xs font-bold text-slate-900">120Hz Ultra Bright Dynamic AMOLED 2X / Super Retina XDR</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faBatteryFull} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Battery &amp; Charging</div>
                    <div className="text-xs font-bold text-slate-900">All-Day Battery + Fast Charging &amp; Wireless Charging Support</div>
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
                  <span className="col-span-2 text-slate-900">1 Year Official Manufacturer Brand Warranty</span>
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
                  <div className="text-3xl font-black text-slate-900">{product.rating || 4.5}</div>
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
              : "bg-[#2E6F40] active:bg-[#245e35] text-white shadow-md shadow-emerald-800/20 border border-[#245e35]"
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
              : "bg-[#2E6F40] active:bg-[#245e35] text-white shadow-md shadow-emerald-800/20 border border-[#245e35]"
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
