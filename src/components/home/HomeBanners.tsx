import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function HomeBanners() {
  return (
    <section className="container py-2 sm:py-4 md:py-6">
      <div className="flex justify-center">
        {/* Crisp white card matching Madur.in template */}
        <div className="w-full max-w-5xl relative overflow-visible rounded-2xl sm:rounded-3xl shadow-md border-2 border-white bg-white p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 sm:gap-6">
          <div className="flex-1 z-10 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[#33691e] mb-1.5 leading-tight">
              Smartphone Upgrade &amp; Exchange
            </h3>
            <p className="text-[#558b2f] font-bold text-sm sm:text-base md:text-lg mb-1">
              Instant Evaluation &amp; Bonus on New 5G Mobiles
            </p>
            <p className="text-secondary font-black text-sm sm:text-base mb-4 tracking-wide underline decoration-wavy underline-offset-4 decoration-secondary/30">
              Upgrade Your Phone
            </p>
            <Link 
              href="/products"
              className="bg-secondary text-white font-black px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl shadow-md hover:opacity-90 transition-all inline-flex items-center gap-2 active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
            >
              Shop Now
              <FontAwesomeIcon icon={faArrowRight} size="xs" />
            </Link>
          </div>
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 relative flex-shrink-0">
            <Image 
              src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800"
              alt="Latest Smartphones"
              fill
              className="object-cover rounded-xl sm:rounded-2xl shadow-md"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
