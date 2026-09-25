import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowsRotate, faMobileScreen, faShieldHalved } from "@fortawesome/free-solid-svg-icons";

export default function HomeBanners() {
  return (
    <section className="container py-6 md:py-10">
      <div className="flex justify-center">
        {/* Smartphone Exchange & Upgrade Banner (White & Green Theme) */}
        <div className="w-full max-w-5xl relative overflow-hidden rounded-[2.5rem] shadow-xl border-2 border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-100/60 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-[#182C20]">
          
          {/* Decorative ambient green glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex-1 z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-300 shadow-xs">
              <FontAwesomeIcon icon={faArrowsRotate} className="text-emerald-600" />
              Instant Smartphone Exchange &amp; Trade-In
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 leading-tight">
              Upgrade Your Old Smartphone Today
            </h3>
            <p className="text-gray-600 font-medium text-base md:text-lg mb-2">
              Get up to ₹25,000 instant trade-in value on latest 5G flagship devices with zero down payment.
            </p>
            <p className="text-emerald-800 font-bold text-sm md:text-base mb-6 tracking-wide flex flex-wrap gap-3 justify-center md:justify-start">
              <span>✓ Instant Doorstep Evaluation</span>
              <span>✓ 0% No Cost EMI</span>
              <span>✓ 100% Brand Sealed</span>
            </p>
            <Link 
              href="/products"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl shadow-emerald-700/20 transition-all inline-flex items-center gap-3 active:scale-95 text-sm uppercase tracking-wider"
            >
              BROWSE 5G MOBILES
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
          <div className="w-56 h-56 md:w-72 md:h-72 relative flex-shrink-0 z-10">
            <Image 
              src="/products/samsung-galaxy-s25-ultra.png"
              alt="Samsung Galaxy S25 Ultra"
              fill
              className="object-contain drop-shadow-[0_15px_30px_rgba(21,128,61,0.15)]"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
