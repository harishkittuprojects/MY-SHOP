"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/common/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faSearch, faTimes, faBox } from "@fortawesome/free-solid-svg-icons";
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

  return (
    <div className="container pt-16 md:pt-32 pb-10 md:pb-24 min-h-screen text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-12 gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {categoryFilter ? (
              <>
                {(currentCategory?.image_url || currentCategory?.image) ? (
                  <div className="relative w-12 h-12 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden shadow-md bg-gray-50 flex-shrink-0">
                    <SafeImg src={normalizeImageUrl(currentCategory.image_url || currentCategory.image)} alt={currentCategory.name} />
                  </div>
                ) : (
                  <div className="w-12 h-12 md:w-24 md:h-24 rounded-lg md:rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300">
                    <FontAwesomeIcon icon={faBox} size="xs" />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-brown">{categoryFilter}</span> 
                  <span>Products</span>
                </div>
              </>
            ) : "All Products"}
          </h1>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-wide">
            {filteredProducts.length} smartphones &amp; gadgets available
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by model, brand, or specs..." 
              className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 text-xs md:text-sm outline-none focus:ring-2 ring-primary shadow-sm transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

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
