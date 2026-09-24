"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisited");
    if (!hasVisited) {
      setIsVisible(true);
    } else if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const handleEnter = () => {
    setIsExiting(true);
    sessionStorage.setItem("hasVisited", "true");
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1200); 
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center">
          {/* Top-Left Triangle Door */}
          <motion.div
            initial={{ x: 0, y: 0 }}
            animate={{ 
              x: isExiting ? "-110%" : 0,
              y: isExiting ? "-110%" : 0
            }}
            transition={{ 
              duration: 1.5, 
              ease: [0.7, 0, 0.3, 1],
            }}
            className="absolute inset-0 bg-[#f9f6f2] z-20 shadow-[20px_20px_60px_rgba(0,0,0,0.1)]"
            style={{ 
              clipPath: "polygon(0 0, 101% 0, 0 101%)",
              margin: "-1px" 
            }}
          />
          
          {/* Bottom-Right Triangle Door */}
          <motion.div
            initial={{ x: 0, y: 0 }}
            animate={{ 
              x: isExiting ? "110%" : 0,
              y: isExiting ? "110%" : 0
            }}
            transition={{ 
              duration: 1.5, 
              ease: [0.7, 0, 0.3, 1],
            }}
            className="absolute inset-0 bg-[#f9f6f2] z-20 shadow-[-20px_-20px_60px_rgba(0,0,0,0.1)]"
            style={{ 
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
              margin: "-1px"
            }}
          />

          {/* Content Container */}
          <div className="relative z-[30] flex flex-col items-center text-center px-6 -mt-20">
            {/* The Nail */}
            <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 via-gray-500 to-gray-700 shadow-lg z-40 border border-white/20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/30 rounded-full"></div>
            </div>
            
            {/* Pendulum Logo */}
            <motion.div 
              animate={{ 
                rotate: isExiting ? 0 : [-8, 8, -8],
              }}
              transition={{ 
                rotate: { duration: 4, repeat: isExiting ? 0 : Infinity, ease: "easeInOut" }
              }}
              style={{ transformOrigin: "top center" }}
              className="flex flex-col items-center"
            >
              {/* String/Wire */}
              <div className="w-[1px] h-24 bg-gray-300 shadow-sm opacity-40"></div>
              
              {/* Logo */}
              <motion.div 
                animate={{ 
                  opacity: isExiting ? 0 : 1, 
                  scale: isExiting ? 0.5 : 1,
                }}
                transition={{ duration: 0.8 }}
                className="relative w-64 h-64 md:w-96 md:h-96 drop-shadow-2xl -mt-4"
              >
                <Image 
                  src="/madur-logo-2026.png" 
                  alt="MADUR.IN Logo" 
                  fill 
                  className="object-contain"
                  priority
                  sizes="150px"
                />
              </motion.div>
            </motion.div>
            
            {/* Welcome Text & Button */}
            <motion.div
              animate={{ 
                opacity: isExiting ? 0 : 1, 
                scale: isExiting ? 0.8 : 1,
              }}
              transition={{ duration: 0.8 }}
              className="mt-8 flex flex-col items-center"
            >
              <div className="space-y-4 mb-12">
                <h1 className="text-3xl md:text-6xl font-black text-[#5d4037] tracking-tighter uppercase">
                  Welcome to <span className="text-[#4a3b2a]">MADUR.IN</span>
                </h1>
                <p className="text-xs md:text-sm font-black text-[#5d4037]/40 uppercase tracking-[1em] pl-[1em]">
                  Pure. Fresh. Honest.
                </p>
              </div>

              <button
                onClick={handleEnter}
                className="group relative px-16 py-6 bg-[#5d4037] text-white font-black text-xl rounded-full shadow-[0_25px_60px_-15px_rgba(93,64,55,0.4)] hover:shadow-[0_45px_100px_-15px_rgba(93,64,55,0.6)] transition-all active:scale-95 overflow-hidden border-2 border-white/10"
              >
                <span className="relative z-10 tracking-[0.4em]">ENTER</span>
                <div className="absolute inset-0 bg-[#d4af37]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
