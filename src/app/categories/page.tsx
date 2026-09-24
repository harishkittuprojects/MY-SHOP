"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faArrowRight } from "@fortawesome/free-solid-svg-icons";

function CategoryCardImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => setImgSrc(src), [src]);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover group-hover:scale-110 transition-transform duration-500"
      sizes="(max-width: 768px) 50vw, 25vw"
      onError={() => setImgSrc("/placeholder.png")}
      unoptimized
    />
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeImageUrl = (url: string) => {
    if (!url) return "/placeholder.png";
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
      <div className="mb-6 md:mb-10 text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          All Categories
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider mt-1">
          Explore top smartphone brands, smartwatches, earbuds, and premium accessories
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {isLoading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-44 sm:h-56 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 font-bold">
            No categories available at the moment.
          </div>
        ) : (
          categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-secondary transition-all flex flex-col overflow-hidden text-center active:scale-95"
            >
              <div className="w-full aspect-[4/3] sm:aspect-square relative overflow-hidden bg-gray-50">
                {cat.image_url || cat.image ? (
                  <CategoryCardImage
                    src={normalizeImageUrl(cat.image_url || cat.image)}
                    alt={cat.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FontAwesomeIcon icon={faBox} className="text-gray-300 text-3xl" />
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-black text-gray-800 leading-tight text-left">
                  {cat.name}
                </span>
                <div className="w-6 h-6 rounded-full bg-secondary/10 group-hover:bg-secondary text-secondary group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                  <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
