"use client";

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft, faCheckCircle, faMobileScreen, faShieldHalved, faAward, faHeadset } from "@fortawesome/free-solid-svg-icons";

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-10 pb-12 md:pt-16 md:pb-24 overflow-hidden">
        <div className="container flex flex-col lg:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3 block">
              About Our Store
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 md:mb-6 leading-tight text-white">
              Your Trusted Hub for <span className="text-amber-400">Next-Gen</span> Mobiles.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-6 md:mb-8">
              We are a premier authorized smartphone retailer dedicated to bringing you the world's best mobile technology. From flagship iPhones and Samsung Galaxy devices to cutting-edge foldables, Google Pixels, smartwatches, and premium audio accessories.
            </p>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border-l-8 border-amber-400 border border-white/10">
              <p className="font-bold text-xl italic text-white">"100% Genuine Devices, Unmatched Customer Trust, and Best Market Deals."</p>
            </div>
          </div>
          <div className="flex-1 relative aspect-[4/3] max-w-lg w-full">
            <div className="absolute -inset-4 bg-amber-400/20 rounded-full blur-3xl opacity-50"></div>
            <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20">
              <Image 
                src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=1200"
                alt="Smartphone Retail Experience"
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
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <Image 
              src="https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=1200"
              alt="Quality Mobile Technology"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-[#222222]">Why Choose Us?</h2>
            <p className="text-gray-700 leading-relaxed mb-6 text-base md:text-lg">
              We understand that buying a smartphone is an important investment. That's why every product in our store is sourced directly through authorized brand distribution channels, guaranteeing brand-new sealed units, full manufacturer warranty support, and comprehensive after-sales assistance.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-xl border-l-4 border-amber-500 shadow-sm">
                <h4 className="font-black text-2xl text-slate-900 mb-1">100%</h4>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Certified Original</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border-l-4 border-secondary shadow-sm">
                <h4 className="font-black text-2xl text-secondary mb-1">1 Year</h4>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Official Warranty</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-[#222]">The Mobile Shopping Guarantee</h2>
            <p className="text-gray-600 text-sm mt-2">Every order is backed by our customer-first commitment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-6">
                <FontAwesomeIcon icon={faShieldHalved} />
              </div>
              <h3 className="text-xl font-black mb-2 text-[#222]">Official Brand Invoices</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                All devices come with full GST-compliant invoices valid at every authorized brand service center nationwide.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-6">
                <FontAwesomeIcon icon={faAward} />
              </div>
              <h3 className="text-xl font-black mb-2 text-[#222]">Best Price Guarantee</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We offer competitive market pricing, instant trade-in exchange bonuses, and special credit card bank discounts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-6">
                <FontAwesomeIcon icon={faHeadset} />
              </div>
              <h3 className="text-xl font-black mb-2 text-[#222]">Dedicated Tech Support</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Have questions regarding device setup, data migration, or specs? Our gadget specialists are always on standby.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
