"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import { useState, useEffect } from "react";

const defaultBanners = [
  "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=1920",
];

export default function Hero() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHeroImages() {
      try {
        const res = await fetch("/api/heroSlides", { cache: "no-store" });
        if (!res.ok) throw new Error("API Failed");
        const data = await res.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
          setImages(data.map((img: any) => img.image_url));
        } else {
          setImages(defaultBanners);
        }
      } catch (error) {
        setImages(defaultBanners);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroImages();
  }, []);

  if (loading) {
    return (
      <div className="w-full aspect-[16/9] bg-white flex items-center justify-center text-secondary font-black uppercase tracking-[0.5em]">
        Loading...
      </div>
    );
  }

  return (
    <section className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
      {/* Edge-to-Edge Full Width Background Swiper */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="w-full h-full"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <Link href="/products" className="block relative w-full h-full cursor-pointer">
                <Image 
                  src={src} 
                  alt={`Hero Banner ${index + 1}`} 
                  fill 
                  className="object-cover object-center"
                  priority={index === 0}
                  sizes="100vw"
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* Content Overlay: Shop Now Button kept down at the bottom on all screen sizes */}
      <div className="container relative z-10 h-full flex items-end px-4 sm:px-12 md:px-20 pb-3 sm:pb-6 md:pb-8 lg:pb-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            href="/products" 
            className="group bg-secondary text-white font-black px-3 py-1.5 sm:px-7 sm:py-3.5 md:px-8 md:py-4 rounded-lg sm:rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-[#255732] hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)] transition-all flex items-center gap-2 sm:gap-4 w-fit active:scale-95 border border-white/20"
          >
            <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-secondary transition-colors">
              <FontAwesomeIcon icon={faArrowRight} className="text-[8px] sm:text-xs md:text-sm" />
            </div>
            <span className="text-[10px] sm:text-sm md:text-base font-black uppercase tracking-wider md:tracking-widest">
              Shop Now
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
