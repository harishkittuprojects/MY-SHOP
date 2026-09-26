"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/common/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFilter, 
  faSearch, 
  faTimes, 
  faBox, 
  faChevronLeft, 
  faChevronRight, 
  faArrowRight, 
  faList, 
  faTableCells,
  faGripVertical,
  faSliders,
  faStar
} from "@fortawesome/free-solid-svg-icons";
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

  // View Style & Grid Column Controls
  const [viewStyle, setViewStyle] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);
  const [listCols, setListCols] = useState<1 | 2>(1);

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

  // Compute active grid layout class
  const getLayoutGridClass = () => {
    if (viewStyle === "list") {
      if (listCols === 2) {
        return "grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 divide-y md:divide-y-0 divide-slate-100 gap-0 md:gap-6";
      }
      return "grid grid-cols-1 divide-y md:divide-y-0 divide-slate-100 gap-0 md:gap-5";
    }

    // Grid View on desktop, 1-col full-width Flipkart list on mobile
    if (gridCols === 2) {
      return "grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-slate-100 gap-0 md:gap-6";
    }
    if (gridCols === 3) {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 divide-slate-100 gap-0 md:gap-6";
    }
    // 4 cols default on desktop
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y md:divide-y-0 divide-slate-100 gap-0 md:gap-6";
  };

  return (
    <div className="w-full md:container px-0 md:px-4 py-2 sm:py-6 md:py-10">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Left Categories Sidebar */}
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

        {/* Right Products Catalog with Grid / List & Column Controls */}
        <div className="lg:col-span-3">
          {/* Controls Toolbar: Style Switcher + Column Selector */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Left: Product count & filter info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  {filteredProducts.length} Products
                </span>
                {categoryFilter && (
                  <span className="text-[11px] font-bold text-secondary bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    {categoryFilter}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Showing all genuine brand devices with official warranty
              </p>
            </div>

            {/* Right: Layout & Column Controls */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Column Control for Current View Style */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                {viewStyle === "grid" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setGridCols(2)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        gridCols === 2 ? "bg-white text-secondary shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="2 Columns"
                    >
                      <span>2</span>
                      <span className="text-[10px] opacity-70">Cols</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGridCols(3)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        gridCols === 3 ? "bg-white text-secondary shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="3 Columns"
                    >
                      <span>3</span>
                      <span className="text-[10px] opacity-70">Cols</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGridCols(4)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 hidden sm:flex ${
                        gridCols === 4 ? "bg-white text-secondary shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="4 Columns"
                    >
                      <span>4</span>
                      <span className="text-[10px] opacity-70">Cols</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setListCols(1)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        listCols === 1 ? "bg-white text-secondary shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="1 Column (Full Width List)"
                    >
                      <span>1</span>
                      <span className="text-[10px] opacity-70">Row</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setListCols(2)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        listCols === 2 ? "bg-white text-secondary shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="2 Columns List"
                    >
                      <span>2</span>
                      <span className="text-[10px] opacity-70">Rows</span>
                    </button>
                  </>
                )}
              </div>

              {/* View Style Switcher (Grid vs List) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setViewStyle("grid")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    viewStyle === "grid" 
                      ? "bg-secondary text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  aria-label="Grid View Style"
                  title="Grid View (Cards)"
                >
                  <FontAwesomeIcon icon={faTableCells} className="text-xs" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewStyle("list")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    viewStyle === "list" 
                      ? "bg-secondary text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  aria-label="List View Style"
                  title="List View (Rows)"
                >
                  <FontAwesomeIcon icon={faList} className="text-xs" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Top Quick Comparison Rail (Matching Top of Reference Screenshot) */}
          <div className="block md:hidden mb-4 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-stretch gap-2.5 min-w-max">
              {products.slice(0, 6).map((item) => {
                const orig = item.original_price || Math.round(item.price * 1.18);
                const disc = Math.round(((orig - item.price) / orig) * 100);
                const bank = Math.round(item.price * 0.92);

                return (
                  <Link
                    key={`quick-${item.id}`}
                    href={`/products?category=Mobiles%20%26%20Accessories&search=${encodeURIComponent(item.name)}`}
                    className="w-56 bg-white rounded-xl border border-slate-200 p-2.5 flex items-start gap-2.5 shadow-xs active:scale-95 transition-transform"
                  >
                    <div className="relative w-14 h-20 flex-shrink-0 bg-white rounded flex items-center justify-center">
                      <Image
                        src={item.image_url || item.image || "/mobile-logo.png"}
                        alt={item.name}
                        fill
                        className="object-contain p-0.5"
                        unoptimized
                      />
                      <div className="absolute bottom-0 left-0 bg-[#388e3c] text-white text-[8px] font-black px-1 rounded flex items-center gap-0.5">
                        <span>{item.rating || 4}</span>
                        <FontAwesomeIcon icon={faStar} className="text-[6px]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-slate-900 truncate mb-0.5">
                        {item.name}
                      </h4>
                      <div className="flex items-baseline gap-1 text-[10px] mb-0.5">
                        <span className="text-[#388e3c] font-black">↓{disc}%</span>
                        <span className="text-slate-400 line-through text-[9px]">₹{Math.floor(orig).toLocaleString("en-IN")}</span>
                        <span className="font-black text-slate-900">₹{Math.floor(item.price).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="text-[10px] text-[#2874f0] font-black truncate">
                        <span className="italic">wow!</span> ₹{bank.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[9px] text-slate-500">with Bank offer</div>
                      <div className="text-[9px] text-slate-700 font-medium">Get It by Tomorrow</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Product Items Display */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
               {[...Array(6)].map((_, i) => <div key={i} className="h-44 md:h-80 bg-gray-100 animate-pulse rounded-2xl"></div>)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={`bg-white md:bg-transparent rounded-2xl md:rounded-none overflow-hidden ${getLayoutGridClass()}`}>
              {(Array.isArray(filteredProducts) ? filteredProducts : []).map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard product={product} viewMode={viewStyle} />
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
