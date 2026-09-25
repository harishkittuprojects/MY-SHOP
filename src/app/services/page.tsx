"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faBox, faShieldHalved, faTruckFast, faArrowsRotate, faCreditCard } from "@fortawesome/free-solid-svg-icons";

function ServiceCardImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => setImgSrc(src), [src]);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover group-hover:scale-110 transition-transform duration-500"
      onError={() => setImgSrc("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600")}
      unoptimized
    />
  );
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categoryList", { 
          cache: "no-store",
          headers: { "Accept": "application/json" }
        });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div>
      {/* Header */}
      <section className="bg-slate-900 text-white pt-10 pb-16 md:pt-16 md:pb-28 text-center">
        <div className="container">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2 block">
            Premium Mobile &amp; Tech Services
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-6 text-white">Our Smartphone Brands &amp; Services</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Experience next-level mobile retail with certified genuine devices, express same-day dispatch, easy trade-in programs, and flexible 0% interest EMI options.
          </p>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="container -mt-8 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-600 flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900">100% Genuine</h4>
              <p className="text-xs text-gray-500">Official Brand Warranty</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faTruckFast} />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900">Fast Shipping</h4>
              <p className="text-xs text-gray-500">Same-Day Express Dispatch</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faArrowsRotate} />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900">Phone Exchange</h4>
              <p className="text-xs text-gray-500">Instant Trade-in Valuation</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faCreditCard} />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900">0% No Cost EMI</h4>
              <p className="text-xs text-gray-500">All Major Banks &amp; Cards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Grid */}
      <section className="container pb-16">
        <h2 className="text-2xl md:text-3xl font-black mb-8 text-[#222]">Browse by Smartphone Brand &amp; Ecosystem</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {isLoading ? (
            [...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white animate-pulse rounded-3xl shadow-lg"></div>)
          ) : (Array.isArray(categories) ? categories : []).map((service) => (
            <div 
              key={service.id} 
              id={service.id}
              className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:border-secondary transition-all group flex flex-col h-full"
            >
              <div className="w-full aspect-[4/3] relative mb-6 rounded-2xl overflow-hidden bg-gray-50 shadow-inner">
                {service.image_url || service.image ? (
                  <ServiceCardImage src={service.image_url || service.image} alt={service.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                    <FontAwesomeIcon icon={faBox} className="text-4xl" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-black mb-3 text-[#222222]">{service.name}</h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Discover the latest models, cutting-edge cameras, and high-performance specs in {service.name}.
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-[#222222]">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-secondary" /> Brand New Sealed Box
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#222222]">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-secondary" /> 1-Year Manufacturer Warranty
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#222222]">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-secondary" /> GST Invoice &amp; EMI Available
                </li>
              </ul>
              <Link 
                href={`/products?category=${encodeURIComponent(service.name)}`}
                className="w-full bg-secondary text-white font-black py-4 rounded-2xl flex items-center justify-center shadow-lg text-sm uppercase tracking-widest mt-auto hover:opacity-90 transition-opacity"
              >
                View {service.name}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
