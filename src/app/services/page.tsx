"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faBox, faShieldHalved, faTruckFast, faBottleWater, faLeaf } from "@fortawesome/free-solid-svg-icons";

function ServiceCardImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => setImgSrc(src), [src]);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover group-hover:scale-110 transition-transform duration-500"
      onError={() => setImgSrc("/categories/milk-dairy.png")}
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
      <section className="bg-emerald-950 text-white pt-10 pb-16 md:pt-16 md:pb-28 text-center border-b border-emerald-900">
        <div className="container">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">
            Pure • Natural • Farm Fresh Services
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-6 text-white">Our Farm Produce &amp; Delivery Services</h1>
          <p className="text-lg text-emerald-100/90 max-w-2xl mx-auto font-normal">
            Enjoy reliable daily morning deliveries of raw cow milk, traditional wood-pressed cooking oils, and authentic homemade pantry items across Hyderabad.
          </p>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="container -mt-8 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#182C20]">100% Pure</h4>
              <p className="text-xs text-gray-500">Lab Tested Every Morning</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faTruckFast} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#182C20]">Morning Delivery</h4>
              <p className="text-xs text-gray-500">Before 7:00 AM Doorstep</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faBottleWater} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#182C20]">Glass Bottles</h4>
              <p className="text-xs text-gray-500">Sterilized &amp; Plastic-Free</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faLeaf} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#182C20]">Cold Pressed</h4>
              <p className="text-xs text-gray-500">Traditional Wooden Mill</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container pb-16">
        <h2 className="text-2xl md:text-3xl font-black mb-8 text-[#182C20]">Explore Farm Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {isLoading ? (
            [...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white animate-pulse rounded-3xl shadow-lg"></div>)
          ) : (Array.isArray(categories) ? categories : []).map((service) => (
            <div 
              key={service.id} 
              id={service.id}
              className="bg-white p-8 rounded-3xl shadow-md border border-emerald-100 hover:border-emerald-500 transition-all group flex flex-col h-full"
            >
              <div className="w-full aspect-[4/3] relative mb-6 rounded-2xl overflow-hidden bg-emerald-50/50 shadow-inner">
                {service.image_url || service.image ? (
                  <ServiceCardImage src={service.image_url || service.image} alt={service.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                    <FontAwesomeIcon icon={faBox} className="text-emerald-300 text-4xl" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#182C20]">{service.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                Pure, authentic rural produce harvested sustainably without chemicals or artificial additives.
              </p>
              <Link 
                href={`/products?category=${encodeURIComponent(service.name)}`}
                className="w-full bg-emerald-50 group-hover:bg-emerald-700 text-emerald-800 group-hover:text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                BROWSE PRODUCE
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
