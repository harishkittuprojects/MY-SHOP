"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faShoppingCart, faShoppingBag, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    original_price?: number;
    unit: string;
    image: string;
    category: string;
  };
  onAddToCart: (quantity: number, unit: string, price: number) => void;
}

export default function ProductDetailModal({ isOpen, onClose, product, onAddToCart }: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[111] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl pointer-events-auto overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Image Section */}
              <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-accent/30 sm:h-auto h-64">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  unoptimized
                />
                <button
                  onClick={onClose}
                  className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:bg-white hover:text-red-500 transition-all z-10 md:hidden"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Content Section */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col relative overflow-y-auto">
                <button
                  onClick={onClose}
                  className="absolute top-8 right-8 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all z-10 hidden md:flex"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className="mb-6">
                  <span className="bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                    {product.category}
                  </span>
                  <h2 className="text-3xl font-black text-gray-800 leading-tight">
                    {product.name}
                  </h2>
                  <p className="text-gray-400 font-bold text-sm mt-1">
                    {product.unit.split(',')
                      .map(u => u.trim())
                      .filter(u => !u.toLowerCase().includes('1000grms'))
                      .join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-8">
                  <span className="text-4xl font-black text-primary">₹{Math.floor(product.price)}</span>
                  {product.original_price && product.original_price > product.price && (
                    <div className="flex flex-col">
                      <span className="text-lg text-gray-300 line-through font-bold">₹{Math.floor(product.original_price)}</span>
                      <span className="text-red-500 text-[10px] font-black uppercase">
                        Save ₹{Math.floor(product.original_price - product.price)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-secondary" />
                    Product Description
                  </h4>
                  <div className="bg-accent/30 rounded-3xl p-6 border border-gray-50 mb-8 min-h-[120px]">
                    <ul className="space-y-3">
                      {(product.description || "Fresh from our farm to your kitchen.\nWe ensure the highest quality and purity in every harvest.")
                        .split('\n')
                        .filter(line => line.trim() !== '')
                        .map((line, index) => (
                          <li key={index} className="flex gap-3 text-gray-700 font-bold leading-relaxed text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                            <span>{line.replace(/^\s*[•.-]\s*/, '').trim()}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4">
                  <button
                    onClick={() => {
                      onClose();
                      onAddToCart(1, product.unit, product.price);
                    }}
                    className="flex-1 bg-secondary text-white font-black py-5 rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
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
