"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/common/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faSearch, faTimes, faBox, faChevronLeft, faChevronRight, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";

function SafeImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => setImgSrc(src), [src]);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className || "object-cover"}
      onError={() => setImgSrc("/placeholder.png")}
      unoptimized
    />
  );
}

function Content() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const urlSearchTerm = searchParams.get("search") || "";
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);

  const normalizeImageUrl = (url: string) => {
    if (!url) return "/mobile-logo.png";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) return url;
    return `/${url}`;
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categoryList"),
          fetch("/api/productList")
        ]);
        
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        
        setCategories(Array.isArray(catData) ? catData : []);
        setProducts(Array.isArray(prodData) ? prodData : []);

      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  const filteredProducts = useMemo(() => {
    const cleanSearch = searchTerm.toLowerCase().replace(/\s/g, "");
    
    return products.filter((product) => {
      const prodCategoryName = product.category_name || product.categories?.name || product.category || "";
      
      const matchesCategory = categoryFilter 
        ? prodCategoryName.toLowerCase() === categoryFilter.toLowerCase() 
        : true;
        
      const cleanName = (product.name || "").toLowerCase().replace(/\s/g, "");
      const cleanProductCategory = (prodCategoryName || "").toLowerCase().replace(/\s/g, "");
      
      const matchesSearch = cleanName.includes(cleanSearch) ||
                           cleanProductCategory.includes(cleanSearch);
                           
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchTerm, products]);

  const currentCategory = categories.find(c => c.name.toLowerCase() === categoryFilter?.toLowerCase());

  const isMobileCategory = !categoryFilter || 
    categoryFilter.toLowerCase().includes("mobile") || 
    categoryFilter.toLowerCase() === "mobiles & accessories";

  return (
    <div className="container py-6 sm:py-10">
      {/* Best Selling Smartphones Section (Matching Screenshot) */}
      {isMobileCategory && (
        <section className="mb-10 sm:mb-14">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Best Selling Smartphones
            </h2>
            <div className="flex items-center gap-3">
              <Link 
                href="/products?category=Mobiles%20%26%20Accessories" 
                className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 hover:underline"
              >
                See All
              </Link>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {
                    const el = document.getElementById("best-selling-carousel");
                    if (el) el.scrollBy({ left: -320, behavior: "smooth" });
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-xs cursor-pointer active:scale-90 transition-transform"
                  aria-label="Scroll left"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById("best-selling-carousel");
                    if (el) el.scrollBy({ left: 320, behavior: "smooth" });
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-xs cursor-pointer active:scale-90 transition-transform"
                  aria-label="Scroll right"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel rail with exact screenshot cards */}
          <div 
            id="best-selling-carousel"
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
          >
            {products
              .filter(p => (p.category || "").toLowerCase().includes("mobile") || p.is_popular)
              .map((product) => {
                const origPrice = product.original_price && product.original_price > product.price 
                  ? product.original_price 
                  : Math.round(product.price * 1.17);
                const discount = Math.round(((origPrice - product.price) / origPrice) * 100);

                return (
                  <Link
                    key={product.id}
                    href={`/products?category=Mobiles%20%26%20Accessories&search=${encodeURIComponent(product.name)}`}
                    className="w-[170px] sm:w-[200px] md:w-[220px] flex-shrink-0 bg-white group flex flex-col justify-between"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-square w-full bg-white flex items-center justify-center p-3 mb-2">
                      <Image
                        src={product.image_url || product.image || "/mobile-logo.png"}
                        alt={product.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>

                    {/* Product Name */}
                    <h3 className="text-xs sm:text-sm font-medium text-slate-900 group-hover:text-emerald-700 line-clamp-1 mb-2 leading-tight">
                      {product.name}
                    </h3>

                    {/* Price & Discount Pill Row */}
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <span className="text-sm sm:text-base font-black text-[#15803d]">
                        ₹ {Math.floor(product.price).toLocaleString("en-IN")}
                      </span>
                      {discount > 0 && (
                        <span className="bg-[#f97316] text-white text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded uppercase tracking-tight flex-shrink-0">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="hidden lg:block space-y-8 sticky top-32 self-start">
          <div>
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faFilter} className="text-primary" />
              Categories
            </h3>
            <div className="flex flex-col gap-2">
              <Link 
                href="/products"
                className={`px-4 py-3 rounded-xl font-bold transition-all ${
                  !categoryFilter ? "bg-primary text-black shadow-lg" : "hover:bg-accent text-gray-500"
                }`}
              >
                All Products
              </Link>
              {(Array.isArray(categories) ? categories : []).map((cat) => (
                <Link 
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    categoryFilter?.toLowerCase() === cat.name.toLowerCase() 
                      ? "bg-brown text-white shadow-lg" 
                      : "hover:bg-accent text-gray-500"
                  }`}
                >
                  {(cat.image_url || cat.image) ? (
                    <div className="flex items-center gap-3 text-left">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                        <SafeImg src={normalizeImageUrl(cat.image_url || cat.image)} alt={cat.name} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-tight">{cat.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-left">
                       <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                         <FontAwesomeIcon icon={faBox} size="xs" />
                       </div>
                       <span className="text-xs font-black uppercase tracking-tight">{cat.name}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:gap-8">
               {[...Array(6)].map((_, i) => <div key={i} className="h-60 md:h-80 bg-gray-100 animate-pulse rounded-2xl md:rounded-[2.5rem]"></div>)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 md:gap-8">
              {(Array.isArray(filteredProducts) ? filteredProducts : []).map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 md:py-24 text-center bg-accent/30 rounded-2xl md:rounded-[3rem] border border-dashed border-gray-300">
              <div className="text-4xl md:text-6xl mb-4 md:mb-6 opacity-20 text-gray-400">📦</div>
              <h3 className="text-lg md:text-xl font-black mb-2">No products found</h3>
              <p className="text-gray-500 mb-6 md:mb-8 text-xs md:text-base">Try adjusting your filters or search term.</p>
              <button 
                onClick={() => {setSearchTerm(""); window.location.href="/products"}}
                className="bg-primary text-primary-foreground font-black px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl shadow-lg hover:opacity-90 transition-all text-sm md:text-base"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsContent() {
  return (
    <Suspense fallback={
      <div className="container py-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <Content />
    </Suspense>
  );
}
