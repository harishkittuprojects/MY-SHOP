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
    accentColor: "from-emerald-400 to-green-300",
    bgGradient: "from-[#0c391d] via-[#165a2d] to-[#0d4020]"
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
    accentColor: "from-emerald-300 to-green-400",
    bgGradient: "from-[#114624] via-[#1e6b36] to-[#124d27]"
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
    accentColor: "from-teal-300 to-emerald-400",
    bgGradient: "from-[#093d23] via-[#156038] to-[#0c482a]"
  }
];

export default function Hero() {
  return (
    <section className="relative w-full bg-white text-slate-900 overflow-hidden py-6 md:py-10 border-b border-emerald-100">
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
          className="w-full rounded-[2.5rem] overflow-hidden shadow-xl"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className={`w-full min-h-[460px] md:min-h-[520px] bg-gradient-to-r ${slide.bgGradient} p-6 sm:p-10 md:p-14 rounded-[2.5rem] border-2 border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-8 relative shadow-2xl overflow-hidden`}>
                
                {/* Decorative background glow accents */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Left Content */}
                <div className="flex-1 z-10 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-white/30 text-white shadow-sm">
                    <FontAwesomeIcon icon={faBolt} className="text-emerald-300" />
                    {slide.brand} • OFFICIAL LAUNCH
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 text-white tracking-tight leading-tight">
                    {slide.title}
                  </h1>

                  <p className="text-emerald-100 text-sm sm:text-base md:text-lg mb-6 max-w-xl font-medium leading-relaxed">
                    {slide.tagline}
                  </p>

                  {/* Bullet Specs */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-6">
                    {slide.specs.map((spec, i) => (
                      <span key={i} className="bg-white/15 border border-white/25 text-white text-xs px-3 py-1.5 rounded-xl font-bold backdrop-blur-sm shadow-sm">
                        ✓ {spec}
                      </span>
                    ))}
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6 pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-4xl font-black text-white drop-shadow-sm">
                        {slide.price}
                      </span>
                      <span className="text-sm sm:text-base text-emerald-200/80 line-through font-bold">
                        {slide.originalPrice}
                      </span>
                    </div>

                    <Link 
                      href={slide.link} 
                      className="bg-white hover:bg-emerald-50 text-[#14532d] font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 active:scale-95 text-xs sm:text-sm uppercase tracking-wider border border-white/50"
                    >
                      <span>BUY NOW • 0% NO COST EMI</span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>
                </div>

                {/* Right Image */}
                <div className="relative w-64 h-72 sm:w-80 sm:h-96 md:w-[380px] md:h-[440px] flex-shrink-0 flex items-center justify-center z-10">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute -inset-4 bg-emerald-400/30 rounded-full blur-3xl opacity-70"></div>
                  <Image 
                    src={slide.image} 
                    alt={slide.title} 
                    fill 
                    className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-105"
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
