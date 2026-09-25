"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBolt, faCheck } from "@fortawesome/free-solid-svg-icons";

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
    specs: ["Snapdragon 8 Elite Processor", "200MP Quad AI Camera System", "Anti-Reflective Gorilla Armor"],
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
    tagline: "Stunning Desert Titanium with A18 Pro Chip, Camera Control button & 6.9-inch Super Retina XDR.",
    specs: ["A18 Pro with 6-Core GPU", "48MP Fusion Camera Control", "Grade 5 Titanium Architecture"],
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
    tagline: "Engineered by Google with Super Actua Display, pro triple camera system and 7 years of OS updates.",
    specs: ["Google Tensor G4 Chip", "5x Telephoto Optical Zoom", "7 Years of Official Android Updates"],
    price: "₹1,04,999",
    originalPrice: "₹1,14,999",
    link: "/products?category=Google%20Pixel",
    image: "/products/google-pixel-9-pro-xl.png"
  }
];

export default function Hero() {
  return (
    <section className="relative w-full bg-gradient-to-b from-white via-emerald-50/40 to-white overflow-hidden py-4 md:py-8 border-b border-emerald-100">
      <div className="container">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          loop={true}
          className="w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-lg border border-emerald-100"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="w-full min-h-[460px] md:min-h-[500px] bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/50 p-6 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative border border-white">
                
                {/* Background decorative leaf / blur glows */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none"></div>

                {/* Left Content */}
                <div className="flex-1 z-10 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-emerald-200 shadow-xs">
                    <FontAwesomeIcon icon={faBolt} className="text-emerald-600" />
                    {slide.badgeText}
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 text-slate-900 tracking-tight leading-tight">
                    {slide.title}
                  </h1>

                  <p className="text-slate-600 text-sm sm:text-base md:text-lg mb-6 max-w-xl font-medium leading-relaxed">
                    {slide.tagline}
                  </p>

                  {/* Bullet Specs */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-6">
                    {slide.specs.map((spec, i) => (
                      <span key={i} className="bg-white/90 border border-emerald-200 text-emerald-900 text-xs px-3.5 py-1.5 rounded-xl font-bold shadow-xs flex items-center gap-1.5">
                        <span className="text-emerald-600 font-black">✓</span>
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6 pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-700">
                        {slide.price}
                      </span>
                      <span className="text-sm sm:text-base text-gray-400 line-through font-bold">
                        {slide.originalPrice}
                      </span>
                    </div>

                    <Link 
                      href={slide.link} 
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl shadow-emerald-700/20 transition-all flex items-center gap-3 active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
                    >
                      <span>BUY NOW • 0% NO COST EMI</span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>
                </div>

                {/* Right Image (Blends seamlessly with the white/green background) */}
                <div className="relative w-64 h-72 sm:w-80 sm:h-96 md:w-[380px] md:h-[440px] flex-shrink-0 flex items-center justify-center z-10">
                  <div className="absolute -inset-4 bg-emerald-400/20 rounded-full blur-3xl opacity-60"></div>
                  <Image 
                    src={slide.image} 
                    alt={slide.title} 
                    fill 
                    className="object-contain drop-shadow-[0_20px_35px_rgba(21,128,61,0.18)] transition-transform duration-700 hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 280px, 450px"
                  />
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Swiper Pagination Styling for Emerald Green */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #a7f3d0 !important;
          opacity: 0.7 !important;
          width: 10px !important;
          height: 10px !important;
          transition: all 0.3s ease !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #047857 !important;
          opacity: 1 !important;
          width: 28px !important;
          border-radius: 9999px !important;
        }
      `}</style>
    </section>
  );
}
