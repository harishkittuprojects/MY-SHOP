"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { useState, useEffect } from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const defaultBanners = [
  {
    image_url: "/hero/banner-iphone18pro.jpg",
    title: "Apple iPhone 16 Pro Series",
    link: "/products?category=Mobiles%20%26%20Accessories"
  },
  {
    image_url: "/hero/banner-samsung-zflip.jpg",
    title: "Samsung Galaxy Z Flip & S25 Ultra 5G",
    link: "/products?category=Mobiles%20%26%20Accessories"
  },
  {
    image_url: "/hero/banner-pixel9pro.jpg",
    title: "Google Pixel 9 Pro Series with Gemini AI",
    link: "/products?category=Mobiles%20%26%20Accessories"
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
    <section className="relative w-full overflow-hidden bg-slate-900 select-none">
      {/* Mobile: 16:9 proportion | Desktop: Full Screen Viewport Height (Madur.in style) */}
      <div className="w-full relative aspect-[16/9] sm:aspect-[16/9] md:aspect-auto md:h-[calc(100vh-130px)] lg:h-[calc(100vh-140px)] min-h-[220px] md:min-h-[580px] lg:min-h-[680px]">
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
            dynamicBullets: false,
          }}
          loop={true}
          className="w-full h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="w-full h-full">
              <Link 
                href={slide.link || "/products"} 
                className="block relative w-full h-full cursor-pointer group"
              >
                <Image 
                  src={slide.image_url} 
                  alt={slide.title || `Hero Banner ${index + 1}`} 
                  fill 
                  className="object-cover object-center w-full h-full transition-transform duration-700 group-hover:scale-[1.01]"
                  priority={index === 0}
                  sizes="100vw"
                  unoptimized
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Swiper Pagination Styling */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 12px !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 6px !important;
          z-index: 20 !important;
        }
        @media (min-width: 768px) {
          .swiper-pagination {
            bottom: 24px !important;
            gap: 8px !important;
          }
        }
        .swiper-pagination-bullet {
          background-color: rgba(255, 255, 255, 0.65) !important;
          opacity: 0.85 !important;
          width: 7px !important;
          height: 7px !important;
          margin: 0 !important;
          transition: all 0.3s ease-in-out !important;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45) !important;
        }
        @media (min-width: 768px) {
          .swiper-pagination-bullet {
            width: 10px !important;
            height: 10px !important;
          }
        }
        .swiper-pagination-bullet-active {
          background-color: #ffffff !important;
          opacity: 1 !important;
          width: 24px !important;
          border-radius: 9999px !important;
        }
        @media (min-width: 768px) {
          .swiper-pagination-bullet-active {
            width: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}
