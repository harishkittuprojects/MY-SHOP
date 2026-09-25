"use client";

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf, faShieldHalved, faBottleWater, faTruckFast, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-emerald-950 text-white pt-10 pb-12 md:pt-16 md:pb-24 overflow-hidden border-b border-emerald-900">
        <div className="container flex flex-col lg:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 block">
              Our Farm Roots
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 md:mb-6 leading-tight text-white">
              Bridging the Gap to <span className="text-amber-400">Pure, Honest</span> Nutrition.
            </h1>
            <p className="text-lg text-emerald-100/90 leading-relaxed mb-6 md:mb-8 font-normal">
              Madur was founded with a singular purpose: to deliver real, unprocessed food straight from local rural farms to families in Hyderabad. In a market flooded with chemically extended milk and refined cooking oils, we bring you back to nature's original purity.
            </p>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border-l-8 border-amber-400 border border-white/10">
              <p className="font-bold text-xl italic text-white">"100% Pure, Zero Chemicals, and Direct Support to Local Village Farmers."</p>
            </div>
          </div>
          <div className="flex-1 relative aspect-[4/3] max-w-lg w-full">
            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-3xl opacity-50"></div>
            <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-emerald-800">
              <Image 
                src="/brand-image.png"
                alt="Madur Farm Fresh Story"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="container py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-emerald-100 bg-emerald-50">
            <Image 
              src="/categories/milk-dairy.png"
              alt="Pure Farm Dairy"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-[#182C20]">Why Families Trust Madur?</h2>
            <p className="text-gray-700 leading-relaxed mb-6 text-base md:text-lg">
              We test every batch of morning milk for purity, fat content, and absence of synthetic adulterants before it ever leaves our dispatch centers. Packaged in sanitized, eco-friendly glass bottles and delivered before 7:00 AM, our products preserve the vital enzymes and nutrients your family needs.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-5 rounded-xl border-l-4 border-emerald-600 shadow-sm">
                <h4 className="font-black text-2xl text-emerald-900 mb-1">100%</h4>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Unadulterated &amp; Pure</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-xl border-l-4 border-amber-500 shadow-sm">
                <h4 className="font-black text-2xl text-amber-900 mb-1">6:30 AM</h4>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Hyderabad Doorstep Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="bg-emerald-50/50 py-16 border-t border-emerald-100">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-[#182C20]">The Madur Purity Guarantee</h2>
            <p className="text-gray-600 text-sm mt-2">Every drop and every grain is handled with absolute integrity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-6">
                <FontAwesomeIcon icon={faShieldHalved} />
              </div>
              <h3 className="text-xl font-black mb-2 text-[#182C20]">Zero Chemicals &amp; Hormones</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                No oxytocin injections, no chemical stabilizers, and zero synthetic preservatives in our dairy or pantry items.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto mb-6">
                <FontAwesomeIcon icon={faBottleWater} />
              </div>
              <h3 className="text-xl font-black mb-2 text-[#182C20]">Sanitized Glass Packaging</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We avoid toxic plastics by delivering pure milk in sterilized glass bottles that are collected, washed, and reused sustainably.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-6">
                <FontAwesomeIcon icon={faLeaf} />
              </div>
              <h3 className="text-xl font-black mb-2 text-[#182C20]">Traditional Wood-Pressing</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our oils are pressed in wooden ghanis below 40°C, ensuring vital antioxidants, natural flavor, and vitamins remain intact.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
