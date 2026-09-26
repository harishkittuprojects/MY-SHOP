"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBolt } from "@fortawesome/free-solid-svg-icons";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const heroSlides = [
  {
    id: "samsung-s25-ultra",
    brand: "SAMSUNG GALAXY",
    badgeText: "OFFICIAL FLAGSHIP • GALAXY AI",
    title: "Galaxy S25 Ultra 5G",
    tagline: "Epic AI in every shot. Built with Grade 5 Titanium Silver, Snapdragon 8 Elite & S-Pen.",
    specs: ["Snapdragon 8 Elite", "200MP Quad AI Camera", "Anti-Reflective Gorilla Armor"],
    price: "₹1,29,999",
    originalPrice: "₹1,39,999",
    link: "/products?category=Samsung%20Galaxy",
    image: "/products/samsung-galaxy-s25-ultra.png"
  },
  {
    id: "iphone-16-pro-max",
    brand: "APPLE IPHONE",
    badgeText: "BUILT FOR APPLE INTELLIGENCE",
    title: "iPhone 16 Pro Max",
    tagline: "Stunning Desert Titanium with A18 Pro Chip, Camera Control button & Super Retina XDR.",
    specs: ["A18 Pro with 6-Core GPU", "48MP Fusion Camera", "Grade 5 Titanium Body"],
    price: "₹1,39,999",
    originalPrice: "₹1,44,900",
    link: "/products?category=Apple%20iPhone",
    image: "/products/iphone-16-pro-max.png"
  },
  {
    id: "pixel-9-pro-xl",
    brand: "GOOGLE PIXEL",
    badgeText: "POWERED BY GEMINI ADVANCED",
    title: "Pixel 9 Pro XL 5G",
    tagline: "Engineered by Google with Super Actua Display, pro triple camera system and 7 years of updates.",
    specs: ["Google Tensor G4 Chip", "5x Optical Telephoto", "7 Years of Android Updates"],
    price: "₹1,04,999",
    originalPrice: "₹1,14,999",
    link: "/products?category=Google%20Pixel",
    image: "/products/google-pixel-9-pro-xl.png"
  }
];

export default function Hero() {
  return (
    <section className="relative w-full bg-gradient-to-b from-white via-emerald-50/40 to-white overflow-hidden py-3 sm:py-5 md:py-8 border-b border-emerald-100/80">
      <div className="container">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          loop={true}
          className="w-full rounded-[1.75rem] sm:rounded-[2.25rem] md:rounded-[2.5rem] overflow-hidden shadow-md border border-emerald-100"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="w-full min-h-[230px] sm:min-h-[320px] md:min-h-[460px] bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/50 p-3.5 sm:p-7 md:p-12 rounded-[1.5rem] sm:rounded-[2.25rem] md:rounded-[2.5rem] flex flex-row items-center justify-between gap-3 sm:gap-6 md:gap-8 relative border border-white">
                
                {/* Ambient glow decoration */}
                <div className="absolute top-0 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-5 sm:left-10 w-32 sm:w-64 h-32 sm:h-64 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none"></div>

                {/* Left Content */}
                <div className="flex-1 z-10 text-left min-w-0">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider mb-1 sm:mb-2.5 border border-emerald-200">
                    <FontAwesomeIcon icon={faBolt} className="text-emerald-600 text-[9px] sm:text-xs" />
                    <span className="truncate">{slide.badgeText}</span>
                  </div>

                  <h1 className="text-base sm:text-2xl md:text-4xl lg:text-5xl font-black mb-1 sm:mb-2 text-slate-900 tracking-tight leading-tight line-clamp-1 sm:line-clamp-none">
                    {slide.title}
                  </h1>

                  <p className="text-slate-600 text-[10px] sm:text-xs md:text-base mb-2 sm:mb-4 max-w-xl font-medium leading-snug line-clamp-2">
                    {slide.tagline}
                  </p>

                  {/* Bullet Specs (Hidden on small mobile to keep neat horizontal balance, visible on tablet/desktop) */}
                  <div className="hidden sm:flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-5">
                    {slide.specs.map((spec, i) => (
                      <span key={i} className="bg-white/90 border border-emerald-200 text-emerald-900 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg font-bold shadow-xs flex items-center gap-1">
                        <span className="text-emerald-600 font-black">✓</span>
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-4 pt-0.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-secondary">
                        {slide.price}
                      </span>
                      <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 line-through font-bold">
                        {slide.originalPrice}
                      </span>
                    </div>

                    <Link 
                      href={slide.link} 
                      className="bg-secondary hover:bg-[#255732] text-white font-bold px-3 py-1.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2.5 active:scale-95 text-[9px] sm:text-xs md:text-sm uppercase tracking-wider"
                    >
                      <span>BUY NOW</span>
                      <FontAwesomeIcon icon={faArrowRight} className="text-[8px] sm:text-xs" />
                    </Link>
                  </div>
                </div>

                {/* Right Image (Horizontal alongside content) */}
                <div className="relative w-28 h-36 sm:w-56 sm:h-64 md:w-[320px] md:h-[380px] flex-shrink-0 flex items-center justify-center z-10">
                  <div className="absolute -inset-2 sm:-inset-4 bg-emerald-400/20 rounded-full blur-2xl opacity-60"></div>
                  <Image 
                    src={slide.image} 
                    alt={slide.title} 
                    fill 
                    className="object-contain drop-shadow-[0_10px_25px_rgba(21,128,61,0.2)] transition-transform duration-700 hover:scale-105"
                    priority
                    sizes="(max-width: 640px) 120px, (max-width: 768px) 240px, 360px"
                  />
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Swiper Pagination Styling for Brand Theme */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #a7f3d0 !important;
          opacity: 0.7 !important;
          width: 8px !important;
          height: 8px !important;
          transition: all 0.3s ease !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #2e7d32 !important;
          opacity: 1 !important;
          width: 24px !important;
          border-radius: 9999px !important;
        }
      `}</style>
    </section>
  );
}
