"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const defaultBanners = [
  {
    image_url: "/hero/banner-iphone18pro.jpg",
    title: "Apple iPhone 16 Pro",
    link: "/products?category=Apple%20iPhone"
  },
  {
    image_url: "/hero/banner-samsung-zflip.jpg",
    title: "Samsung Galaxy Z Flip & S25 Ultra",
    link: "/products?category=Samsung%20Galaxy"
  },
  {
    image_url: "/hero/banner-pixel9pro.jpg",
    title: "Google Pixel 9 Pro XL",
    link: "/products?category=Google%20Pixel"
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
          // Combine DB slides if customized, else default to complete banners
          const validSlides = data.map((item: any) => ({
            image_url: item.image_url,
            title: item.title || "Flagship Smartphone",
            link: "/products"
          }));
          setSlides(validSlides);
        } else {
          setSlides(defaultBanners);
        }
      } catch (error) {
        setSlides(defaultBanners);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroImages();
  }, []);

  return (
    <section className="relative w-full aspect-[16/9] overflow-hidden bg-slate-900 select-none">
      {/* Edge-to-Edge Full Width Background Banner Swiper */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          loop={true}
          className="w-full h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <Link 
                href={slide.link || "/products"} 
                className="block relative w-full h-full cursor-pointer"
              >
                <Image 
                  src={slide.image_url} 
                  alt={slide.title || `Hero Banner ${index + 1}`} 
                  fill 
                  className="object-cover object-center w-full h-full"
                  priority={index === 0}
                  sizes="100vw"
                  unoptimized
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* Overlay: Shop Now Button Bottom Left */}
      <div className="container relative z-10 h-full flex items-end px-3 sm:px-8 md:px-16 pb-3 sm:pb-6 md:pb-8 lg:pb-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            href="/products" 
            className="group bg-secondary text-white font-black px-3 py-1.5 sm:px-6 sm:py-3.5 md:px-8 md:py-4 rounded-lg sm:rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:bg-[#255732] hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] transition-all flex items-center gap-2 sm:gap-3 w-fit active:scale-95 border border-white/20"
          >
            <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-secondary transition-colors">
              <FontAwesomeIcon icon={faArrowRight} className="text-[8px] sm:text-xs md:text-sm" />
            </div>
            <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider md:tracking-widest">
              Shop Now
            </span>
          </Link>
        </div>
      </div>

      {/* Swiper Pagination Styling */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 12px !important;
        }
        @media (min-width: 640px) {
          .swiper-pagination {
            bottom: 20px !important;
          }
        }
        .swiper-pagination-bullet {
          background-color: rgba(255, 255, 255, 0.7) !important;
          opacity: 0.8 !important;
          width: 8px !important;
          height: 8px !important;
          transition: all 0.3s ease !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #2e7d32 !important;
          opacity: 1 !important;
          width: 22px !important;
          border-radius: 9999px !important;
        }
      `}</style>
    </section>
  );
}
