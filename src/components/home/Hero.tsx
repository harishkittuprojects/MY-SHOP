"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faArrowRight } from "@fortawesome/free-solid-svg-icons";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

const defaultBanners = [
  {
    image_url: "/hero/banner-iphone18pro.jpg",
    title: "Apple iPhone 16 Pro Max",
    subtitle: "Titanium Finish • A18 Pro Chip • 48MP Fusion Camera",
    tag: "Official Flagship",
    link: "/products?category=Mobiles%20%26%20Accessories&search=iPhone%2016"
  },
  {
    image_url: "/hero/banner-samsung-zflip.jpg",
    title: "Samsung Galaxy Flagship AI Series",
    subtitle: "Galaxy AI • 200MP Quad Telephoto • Ultra Bright AMOLED",
    tag: "Exclusive Offer",
    link: "/products?category=Mobiles%20%26%20Accessories&search=Samsung"
  },
  {
    image_url: "/hero/banner-pixel9pro.jpg",
    title: "Google Pixel 9 Pro Series",
    subtitle: "Engineered by Google • Gemini AI Assistant • Pro Cameras",
    tag: "Next-Gen AI",
    link: "/products?category=Mobiles%20%26%20Accessories&search=Pixel"
  }
];

export default function Hero() {
  const [slides, setSlides] = useState<any[]>(defaultBanners);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHeroImages() {
      try {
        const res = await fetch("/api/heroSlides", { cache: "no-store" });
        if (!res.ok) throw new Error("API Failed");
        const data = await res.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
          const validSlides = data.map((item: any) => ({
            image_url: item.image_url,
            title: item.title || "Special Festival Offer",
            subtitle: item.subtitle || "",
            tag: item.tag || "Featured",
            link: item.link_url || item.link || "/products"
          }));
          setSlides(validSlides);
        } else {
          setSlides(defaultBanners);
        }
      } catch {
        setSlides(defaultBanners);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroImages();
  }, []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-2 sm:pt-3 md:pt-4 select-none">
      {/* 
        Responsive Hero Container:
        - Mobile: Original 16:9 aspect ratio with edge-to-edge cover fit
        - Desktop: Compact ~340px - 375px with ambient-contain fit
      */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/9] md:aspect-auto md:h-[340px] lg:h-[375px] max-h-[390px] rounded-2xl sm:rounded-3xl md:rounded-3xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-950 group">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination, Navigation]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={700}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: false,
          }}
          navigation={{
            prevEl: ".hero-prev-btn",
            nextEl: ".hero-next-btn",
          }}
          loop={true}
          className="w-full h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="w-full h-full bg-slate-950">
              <Link 
                href={slide.link || "/products"} 
                className="block relative w-full h-full cursor-pointer overflow-hidden"
              >
                {/* ================= MOBILE VIEW (Original 16:9 Full-Bleed Cover Fit) ================= */}
                <div className="relative w-full h-full block md:hidden">
                  <Image 
                    src={slide.image_url} 
                    alt={slide.title || `Hero Banner ${index + 1}`} 
                    fill 
                    className="object-cover object-center w-full h-full transition-transform duration-700 active:scale-100"
                    priority={index === 0}
                    sizes="100vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10 pointer-events-none" />
                </div>

                {/* ================= DESKTOP VIEW (Dual-Layer Ambient Contain Layout) ================= */}
                <div className="relative w-full h-full hidden md:block">
                  {/* Ambient Backdrop */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Image 
                      src={slide.image_url} 
                      alt="" 
                      fill 
                      className="object-cover object-center w-full h-full blur-2xl opacity-35 scale-110 saturate-150"
                      aria-hidden="true"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-slate-950/40" />
                  </div>

                  {/* Foreground Sharp Banner Graphic */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image 
                      src={slide.image_url} 
                      alt={slide.title || `Hero Banner ${index + 1}`} 
                      fill 
                      className="object-contain object-center w-full h-full transition-transform duration-700 group-hover:scale-[1.01] drop-shadow-xl"
                      priority={index === 0}
                      sizes="1280px"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Subtle vignette border for ultra-crisp edge finish */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl sm:rounded-3xl md:rounded-3xl pointer-events-none" />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Arrows (Visible on hover on desktop) */}
        <button 
          className="hero-prev-btn absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white border border-white/20 hidden md:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95 shadow-md"
          aria-label="Previous Slide"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs md:text-sm" />
        </button>
        <button 
          className="hero-next-btn absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white border border-white/20 hidden md:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95 shadow-md"
          aria-label="Next Slide"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-xs md:text-sm" />
        </button>
      </div>

      {/* Swiper Pagination Styling */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 8px !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 5px !important;
          z-index: 20 !important;
        }
        @media (min-width: 768px) {
          .swiper-pagination {
            bottom: 14px !important;
            gap: 7px !important;
          }
        }
        .swiper-pagination-bullet {
          background-color: rgba(255, 255, 255, 0.7) !important;
          opacity: 0.8 !important;
          width: 6px !important;
          height: 6px !important;
          margin: 0 !important;
          transition: all 0.3s ease-in-out !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) !important;
        }
        @media (min-width: 768px) {
          .swiper-pagination-bullet {
            width: 8px !important;
            height: 8px !important;
          }
        }
        .swiper-pagination-bullet-active {
          background-color: #ffffff !important;
          opacity: 1 !important;
          width: 20px !important;
          border-radius: 9999px !important;
        }
        @media (min-width: 768px) {
          .swiper-pagination-bullet-active {
            width: 28px !important;
          }
        }
      `}</style>
    </section>
  );
}

