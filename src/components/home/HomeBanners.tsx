import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function HomeBanners() {
  return (
    <section className="container py-10">
      <div className="flex justify-center">
        {/* Crisp white card matching Madur.in template */}
        <div className="w-full max-w-5xl relative overflow-visible rounded-[2.5rem] shadow-2xl border-4 border-white bg-white p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 z-10 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-black text-[#33691e] mb-2 leading-tight">
              Smartphone Upgrade &amp; Exchange
            </h3>
            <p className="text-[#558b2f] font-bold text-lg md:text-xl mb-1">
              Instant Evaluation &amp; Bonus on New 5G Mobiles
            </p>
            <p className="text-secondary font-black text-xl mb-8 tracking-wide underline decoration-wavy underline-offset-4 decoration-secondary/30">
              Upgrade Your Phone
            </p>
            <Link 
              href="/products"
              className="bg-secondary text-white font-black px-10 py-5 rounded-2xl shadow-xl hover:opacity-90 transition-all inline-flex items-center gap-3 active:scale-95 text-lg uppercase tracking-widest"
            >
              Shop Now
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
          <div className="w-56 h-56 md:w-72 md:h-72 relative flex-shrink-0 animate-bounce-slow">
            <Image 
              src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800"
              alt="Latest Smartphones"
              fill
              className="object-cover rounded-2xl shadow-xl"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
