"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBolt, faShieldHalved, faCreditCard } from "@fortawesome/free-solid-svg-icons";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const heroSlides = [
  {
    id: "samsung-s25-ultra",
    brand: "SAMSUNG GALAXY",
    title: "Galaxy S25 Ultra 5G",
    tagline: "Epic AI In Every Shot. Built with Grade 5 Titanium Silver & S-Pen.",
    specs: ["Snapdragon 8 Elite Processor", "200MP Quad AI Camera System", "Anti-Reflective Gorilla Armor"],
    price: "₹1,29,999",
    originalPrice: "₹1,39,999",
    link: "/products",
    image: "/products/samsung-galaxy-s25-ultra.png",
    accentColor: "from-blue-600 to-indigo-700",
    bgGradient: "from-slate-950 via-slate-900 to-indigo-950"
  },
  {
    id: "iphone-16-pro-max",
    brand: "APPLE IPHONE",
    title: "iPhone 16 Pro Max",
    tagline: "Built for Apple Intelligence. Desert Titanium with A18 Pro Chip.",
    specs: ["A18 Pro with 6-Core GPU", "48MP Fusion Camera Control", "6.9-inch Super Retina XDR OLED"],
    price: "₹1,39,999",
    originalPrice: "₹1,44,900",
    link: "/products",
    image: "/products/iphone-16-pro-max.png",
    accentColor: "from-amber-500 to-amber-700",
    bgGradient: "from-stone-950 via-slate-900 to-stone-900"
  },
  {
    id: "pixel-9-pro-xl",
    brand: "GOOGLE PIXEL",
    title: "Pixel 9 Pro XL 5G",
    tagline: "Engineered by Google. Super Actua Display & Gemini AI.",
    specs: ["Google Tensor G4 Chip", "5x Telephoto Optical Zoom", "7 Years of Official Android OS Updates"],
    price: "₹1,04,999",
    originalPrice: "₹1,14,999",
    link: "/products",
    image: "/products/google-pixel-9-pro-xl.png",
    accentColor: "from-cyan-500 to-blue-600",
    bgGradient: "from-slate-950 via-slate-900 to-cyan-950"
  }
];

export default function Hero() {
  return (
    <section className="relative w-full bg-slate-950 text-white overflow-hidden py-6 md:py-12 border-b border-slate-800">
      <div className="container">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          loop={true}
          className="w-full rounded-[2.5rem] overflow-hidden"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className={`w-full min-h-[460px] md:min-h-[520px] bg-gradient-to-r ${slide.bgGradient} p-6 sm:p-10 md:p-14 rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative shadow-2xl`}>
                
                {/* Left Content */}
                <div className="flex-1 z-10 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-white/10 text-amber-400">
                    <FontAwesomeIcon icon={faBolt} className="text-amber-400" />
                    {slide.brand} • OFFICIAL LAUNCH
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 text-white tracking-tight leading-tight">
                    {slide.title}
                  </h1>

                  <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 max-w-xl font-medium leading-relaxed">
                    {slide.tagline}
                  </p>

                  {/* Bullet Specs */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-6">
                    {slide.specs.map((spec, i) => (
                      <span key={i} className="bg-white/5 border border-white/10 text-gray-200 text-xs px-3 py-1.5 rounded-xl font-bold">
                        ✓ {spec}
                      </span>
                    ))}
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6 pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-4xl font-black text-amber-400">
                        {slide.price}
                      </span>
                      <span className="text-sm sm:text-base text-gray-400 line-through font-bold">
                        {slide.originalPrice}
                      </span>
                    </div>

                    <Link 
                      href={slide.link} 
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
                    >
                      <span>BUY NOW • 0% NO COST EMI</span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>
                </div>

                {/* Right Image (Clean, Uncropped Full View) */}
                <div className="relative w-64 h-72 sm:w-80 sm:h-96 md:w-[380px] md:h-[440px] flex-shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-3xl opacity-50"></div>
                  <Image 
                    src={slide.image} 
                    alt={slide.title} 
                    fill 
                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-700 hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 280px, 450px"
                  />
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
