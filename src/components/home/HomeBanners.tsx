import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faMobileScreen, faArrowsRotate, faShieldHalved } from "@fortawesome/free-solid-svg-icons";

export default function HomeBanners() {
  return (
    <section className="container py-6 md:py-10">
      <div className="flex justify-center">
        {/* Smartphone Trade-In & Upgrade Banner */}
        <div className="w-full max-w-5xl relative overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-white">
          <div className="flex-1 z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 border border-indigo-500/30">
              <FontAwesomeIcon icon={faArrowsRotate} />
              Smartphone Upgrade &amp; Trade-In
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
              Upgrade Your Old Phone Today
            </h3>
            <p className="text-indigo-200 font-bold text-base md:text-lg mb-1">
              Get up to ₹25,000 instant exchange bonus on latest 5G flagship devices.
            </p>
            <p className="text-amber-400 font-black text-sm md:text-base mb-6 tracking-wide">
              ✓ Instant Evaluation • Free Doorstep Pickup • Zero Down Payment EMI
            </p>
            <Link 
              href="/products"
              className="bg-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-xl hover:bg-amber-300 transition-all inline-flex items-center gap-3 active:scale-95 text-base uppercase tracking-wider"
            >
              BROWSE 5G MOBILES
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
          <div className="w-56 h-56 md:w-72 md:h-72 relative flex-shrink-0">
            <Image 
              src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800"
              alt="Latest 5G Smartphones"
              fill
              className="object-cover rounded-2xl shadow-2xl border border-white/20"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
