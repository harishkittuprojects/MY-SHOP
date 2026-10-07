"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  "mobiles": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800",
  "old-refurbished-mobiles": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800",
  "mobile-accessories": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800",
  "fashion": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
  "jewellery": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
  "ev-vehicles": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
  "computers-tablets": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
  "tv-audio": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800",
  "kitchen-appliances": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
  "home-appliances": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
  "smart-technology": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
};

function getFallbackImage(catName: string = "", catId: string = ""): string {
  const key = (catId || catName).toLowerCase().replace(/[^a-z0-9]/g, "-");
  for (const [k, url] of Object.entries(CATEGORY_IMAGE_FALLBACKS)) {
    if (key.includes(k) || k.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800";
}

function CategoryCardImage({ src, alt, fallback }: { src: string; alt: string; fallback: string }) {
  const [imgSrc, setImgSrc] = useState(src || fallback);
  useEffect(() => setImgSrc(src || fallback), [src, fallback]);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover group-hover:scale-110 transition-transform duration-500"
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      onError={() => setImgSrc(fallback)}
      unoptimized
    />
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeImageUrl = (url: string, catName: string = "", catId: string = "") => {
    if (!url || url.includes("placeholder.png")) return getFallbackImage(catName, catId);
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) return url;
    return `/api/admin/proxy-image?url=${encodeURIComponent(url)}`;
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categoryList");
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
    <div className="container pt-6 md:pt-12 pb-20 md:pb-24 min-h-screen text-black">
      {/* Header */}
      <div className="mb-8 md:mb-12 text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <span className="w-2.5 h-8 bg-blue-600 rounded-full inline-block" />
          <span>Explore All Departments &amp; Categories</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider mt-1.5">
          Curated collection of top smartphones, wearables, gold jewellery, laptops, appliances &amp; accessories
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-7">
        {isLoading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-56 sm:h-64 bg-gray-100 animate-pulse rounded-3xl"></div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 font-bold">
            No categories available at the moment.
          </div>
        ) : (
          categories.map((cat) => {
            const fallback = getFallbackImage(cat.name, cat.id);
            const imageSrc = normalizeImageUrl(cat.image_url || cat.image, cat.name, cat.id);

            return (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all flex flex-col overflow-hidden text-center active:scale-95"
              >
                <div className="w-full aspect-[4/3] sm:aspect-square relative overflow-hidden bg-slate-100">
                  <CategoryCardImage
                    src={imageSrc}
                    alt={cat.name}
                    fallback={fallback}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  {cat.icon && (
                    <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-lg shadow-sm">
                      {cat.icon}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">Department</span>
                    <span className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-md line-clamp-1">
                      {cat.name}
                    </span>
                  </div>
                </div>
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2 bg-white">
                  <div className="text-left">
                    <span className="text-xs sm:text-sm font-black text-slate-800 leading-tight block truncate">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {(cat.sub_categories || []).length > 0 
                        ? `${cat.sub_categories.length} Sub-categories` 
                        : "Verified Genuine"}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs">
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
