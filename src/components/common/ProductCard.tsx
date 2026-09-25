import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import QuantityModal from "./QuantityModal";
import ProductDetailModal from "./ProductDetailModal";
import { useCart } from "@/context/CartContext";
import { faPlus, faCartPlus, faEye } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  original_price?: number;
  image: string;
  image_url?: string;
  description: string;
  is_out_of_stock?: boolean;
  categories?: { name: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const router = useRouter();
  
  const normalizeImageUrl = (url: string) => {
    if (!url) return "/mobile-logo.png";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) return url;
    return `/${url}`;
  };

  const displayImage = normalizeImageUrl(product.image_url || product.image);
  const [imgSrc, setImgSrc] = useState(displayImage);
  const displayCategory = product.categories?.name || product.category || "General";
  const isOutOfStock = product.is_out_of_stock;

  React.useEffect(() => {
    setImgSrc(displayImage);
  }, [displayImage]);

  const handleOpenModal = () => {
    if (isOutOfStock) return;
    setIsModalOpen(true);
  };

  const handleAddToCart = (quantity: number, selectedUnit: string, price: number) => {
    if (isOutOfStock) return;
    addToCart({ 
      ...product, 
      quantity, 
      selectedUnit,
      price, // Use the dynamically calculated price
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

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`group bg-white rounded-xl md:rounded-3xl p-1.5 md:p-3.5 border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all flex flex-col h-full relative ${isOutOfStock ? "opacity-75 grayscale-[0.5]" : ""}`}
      >
        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-lg md:rounded-2xl overflow-hidden bg-accent/50 mb-1.5 md:mb-3.5 border border-gray-50">
          {imgSrc ? (
            <Image 
              src={imgSrc} 
              alt={product.name || "Product"} 
              fill 
              className={`object-cover transition-transform duration-700 ${!isOutOfStock ? "group-hover:scale-110" : ""}`} 
              onError={() => setImgSrc("/placeholder.png")}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 italic text-gray-400 text-[8px]">
              No Image
            </div>
          )}
          
          {product.original_price && product.original_price > product.price && !isOutOfStock && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-red-500 text-white font-black px-2 py-1 rounded-lg text-[7px] md:text-[9px] uppercase tracking-tighter shadow-lg">
                {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
              </span>
            </div>
          )}
          
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="bg-red-600 text-white font-black px-2 py-1 rounded-md text-[8px] md:text-xs uppercase tracking-widest shadow-xl">
                Out of Stock
              </span>
            </div>
          )}

          {/* Eye Icon Overlay */}
          {!isOutOfStock && (
            <div 
              onClick={(e) => { e.stopPropagation(); setIsDetailOpen(true); }}
              className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center z-10"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-secondary scale-50 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                <FontAwesomeIcon icon={faEye} className="text-sm md:text-xl" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 px-0.5">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <span className="bg-secondary/10 text-secondary text-[7px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full">
              {displayCategory}
            </span>
            <span className="text-gray-400 font-bold text-[8px] md:text-[10px]">
              {product.unit.split(',')
                .map(u => u.trim())
                .filter(u => !u.toLowerCase().includes('1000grms'))
                .join(', ')}
            </span>
          </div>
          
          <h3 className={`text-[10px] md:text-sm font-black leading-tight mb-0.5 md:mb-1.5 transition-colors line-clamp-2 ${isOutOfStock ? "text-[#222222]" : "text-[#222222] group-hover:text-primary"}`}>
            {product.name}
          </h3>
          
          <button 
            onClick={() => setIsDetailOpen(true)}
            className="text-[8px] md:text-[10px] font-bold text-secondary hover:underline uppercase tracking-widest mt-1"
          >
            View Details
          </button>
        </div>

        {/* Footer */}
        <div className="pt-1.5 md:pt-3 px-0.5 border-t border-gray-50 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="hidden md:block text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
              {product.original_price ? "Special Price" : "Price"}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[12px] md:text-lg font-black leading-none ${isOutOfStock ? "text-gray-400" : "text-[#222222]"}`}>
                ₹{Math.floor(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-[8px] md:text-xs text-gray-400 line-through font-bold">
                  ₹{Math.floor(product.original_price)}
                </span>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleOpenModal}
            disabled={isOutOfStock}
            className={`font-black px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg md:rounded-xl flex items-center gap-1 transition-all text-[8px] md:text-[9px] uppercase tracking-widest ${isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-secondary hover:opacity-90 text-white active:scale-95"}`}
          >
            {isOutOfStock ? "SOLD" : (
              <>
                Add <span className="text-[10px] md:text-xs">＋</span>
              </>
            )}
          </button>
        </div>
      </motion.div>



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
