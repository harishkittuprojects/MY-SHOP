"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus, faTimes, faCheckCircle, faBox, faBolt, faCartPlus } from "@fortawesome/free-solid-svg-icons";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  unit: string;
  category: string;
  image_url?: string;
}

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, selectedUnit: string, price: number) => void;
  onBuyNow?: (quantity: number, selectedUnit: string, price: number) => void;
  product: Product;
}

export default function QuantityModal({ isOpen, onClose, onConfirm, onBuyNow, product }: QuantityModalProps) {
  const router = useRouter();
  const normalizeImageUrl = (url: string) => {
    if (!url) return "/mobile-logo.png";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) return url;
    return `/${url}`;
  };

  const [quantity, setQuantity] = useState(1);
  const currentUnit = product.unit || "1 unit";
  
  // Helper to parse unit string (e.g. "1kg" -> { value: 1000, unit: "g" })
  const parseUnit = (unitStr: string) => {
    const match = unitStr.toLowerCase().match(/(\d+)\s*(g|kg|ml|l|unit|grms|litre)/);
    if (!match) return { value: 1, unit: "unit" };
    let value = parseInt(match[1]);
    let unit = match[2];
    
    if (unit === "kg") {
      value *= 1000;
      unit = "g";
    } else if (unit === "l" || unit === "litre") {
      value *= 1000;
      unit = "ml";
    } else if (unit === "grms") {
      unit = "g";
    }
    
    return { value, unit };
  };

  const baseUnitInfo = parseUnit(currentUnit);
  // Derive available units based on what's stored in the product record
  const getAvailableUnits = () => {
    // If the unit field contains multiple units (comma separated), use those
    if (product.unit && product.unit.includes(',')) {
      return product.unit.split(',')
        .map(u => u.trim())
        .filter(u => !u.toLowerCase().includes('1000grms'));
    }
    
    // Fallback to the intelligent derivation if only one unit is selected
    if (baseUnitInfo.unit === "g") {
      // If "1 kg" is the only unit, show the standard set
      if (currentUnit.toLowerCase().includes("1 kg") || currentUnit.toLowerCase().includes("1kg")) {
        return ["100 grms", "250 grms", "500 grms", "1 kg"];
      }
      return [currentUnit];
    } else if (baseUnitInfo.unit === "ml") {
      // If "1 litre" is the only unit, show the standard set
      if (currentUnit.toLowerCase().includes("1 litre") || currentUnit.toLowerCase().includes("1 l")) {
        return ["250 ml", "500 ml", "1 litre"];
      }
      return [currentUnit];
    }
    return [currentUnit];
  };

  const units = getAvailableUnits();
  const [selectedUnit, setSelectedUnit] = useState(units[0] || currentUnit);
  
  // Calculate price for selected unit
  const calculatePrice = (unitStr: string) => {
    const selectedInfo = parseUnit(unitStr);
    if (baseUnitInfo.value === 0) return product.price;
    const pricePerBase = product.price / baseUnitInfo.value;
    return Math.round(pricePerBase * selectedInfo.value);
  };

  const currentTotalPrice = calculatePrice(selectedUnit);
  
  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleConfirm = () => {
    onConfirm(quantity, selectedUnit, currentTotalPrice);
    onClose();
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(quantity, selectedUnit, currentTotalPrice);
    } else {
      onConfirm(quantity, selectedUnit, currentTotalPrice);
      router.push("/cart");
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl pointer-events-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all z-10"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              {/* Product Info Section */}
              <div className="p-6 pb-2 md:p-8 md:pb-4">
                <div className="flex gap-4 md:gap-6 items-center mb-4 md:mb-6">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden bg-accent/20 border border-gray-100">
                    {product.image ? (
                      <Image
                        src={normalizeImageUrl(product.image_url || product.image)}
                        alt={product.name || "Product"}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                        <FontAwesomeIcon icon={faBox} />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-black text-gray-800 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-2xl font-black text-gray-900 mt-1">₹{Math.floor(currentTotalPrice)}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full" />
              </div>

              {/* Selection Content */}
              <div className="p-8 pt-0 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Unit Selection */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                    Choose Unit
                  </label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {units.map((u) => (
                      <button
                        key={u}
                        onClick={() => setSelectedUnit(u)}
                        className={`px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all border-2 ${
                          selectedUnit === u
                            ? "bg-primary border-primary text-black shadow-lg shadow-primary/20"
                            : "bg-gray-50 border-gray-100 text-gray-500 hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selection */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block text-center">
                    Select Quantity
                  </label>
                  <div className="flex items-center justify-center gap-8">
                    <button
                      onClick={handleDecrement}
                      className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-800 flex items-center justify-center text-xl hover:bg-gray-200 transition-all active:scale-90"
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="text-4xl font-black text-gray-900 w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center text-xl hover:bg-gray-800 transition-all active:scale-90"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>

                {/* Delivery Tagline */}
                <div className="flex items-center gap-2 mb-4 justify-center bg-gray-50 py-3 rounded-xl border border-dashed border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                  <p className="text-[9px] font-black text-secondary uppercase tracking-[0.15em]">
                    Guaranteed 24 Hours Delivery
                  </p>
                </div>

                {/* Action Buttons: Add to Cart and Buy Now */}
                <div className="flex flex-col sm:flex-row gap-2.5 md:gap-3 mt-2 md:mt-4">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-black py-3.5 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 text-[10px] md:text-xs uppercase tracking-widest"
                  >
                    <FontAwesomeIcon icon={faCartPlus} />
                    Add to Cart
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-secondary hover:bg-[#255732] text-white font-black py-3.5 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-secondary/20 text-[10px] md:text-xs uppercase tracking-widest"
                  >
                    <FontAwesomeIcon icon={faBolt} />
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
