"use client";

import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight, 
  faPaperPlane, 
  faBox, 
  faQuoteLeft, 
  faStar,
  faShieldAlt,
  faTruckFast,
  faSyncAlt,
  faCreditCard,
  faTag,
  faBolt,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import ProductCard from "@/components/common/ProductCard";
import HomeBanners from "@/components/home/HomeBanners";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/home/Hero";
import { useRouter } from "next/navigation";

// Category configurations with meta details, icons, and highlights
interface CategoryConfig {
  id: string;
  name: string;
  badge: string;
  icon: string;
  accentColor: string;
  tagColor: string;
  description: string;
  categoryQuery: string;
  subcategories: string[];
}

const PREDEFINED_CATEGORIES: CategoryConfig[] = [
  {
    id: "mobiles",
    name: "Smartphones & Flagship Mobiles",
    badge: "Official Flagships",
    icon: "📱",
    accentColor: "from-blue-600 to-indigo-700",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Explore the latest flagship 5G smartphones with official brand warranty, exchange bonuses & No-Cost EMI",
    categoryQuery: "Mobiles",
    subcategories: ["Flagship Phones", "5G Phones", "Gaming Phones", "Budget Phones"]
  },
  {
    id: "fashion",
    name: "Fashion, Apparel & Top Brands",
    badge: "Trending Styles",
    icon: "👗",
    accentColor: "from-purple-600 to-pink-600",
    tagColor: "bg-pink-50 text-pink-700 border-pink-200",
    description: "Premium shirts, denim, ethnic sets, sportswear, dresses, jackets & designer handbags from top brands",
    categoryQuery: "Fashion",
    subcategories: ["Men's Shirts & Polos", "Jeans & Trousers", "T-Shirts & Sportswear", "Women's Dresses & Kurtis", "Ethnic Sets", "Jackets", "Handbags & Bags"]
  },
  {
    id: "jewellery",
    name: "Precious Jewellery & Accessories",
    badge: "Certified Authentic",
    icon: "💎",
    accentColor: "from-amber-500 to-yellow-600",
    tagColor: "bg-amber-50 text-amber-800 border-amber-200",
    description: "22K BIS Hallmarked Gold, 925 Sterling Silver, Solitaire Diamonds & Royal Kundan Choker Sets",
    categoryQuery: "Jewellery",
    subcategories: ["Gold Jewellery", "Silver & Moissanite", "Necklace Sets & Chokers", "Rings & Bangles"]
  },
  {
    id: "ev-vehicles",
    name: "Electric Vehicles & Smart Scooters",
    badge: "Zero Emission",
    icon: "⚡",
    accentColor: "from-emerald-600 to-teal-700",
    tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "High-performance EV scooters and AI electric bikes with up to 8-Year battery warranty & fast charging",
    categoryQuery: "EV Vehicles",
    subcategories: ["Electric Scooters", "Electric Bikes", "EV Accessories & Chargers"]
  },
  {
    id: "mobile-accessories",
    name: "Mobile Accessories & Fast Chargers",
    badge: "Power & Protection",
    icon: "🔌",
    accentColor: "from-cyan-600 to-blue-600",
    tagColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    description: "GaN 65W Fast Chargers, MagSafe Wireless, Armor Cases, 9H Tempered Glass, Cables & Power Banks",
    categoryQuery: "Mobile Accessories",
    subcategories: ["Chargers & Adapters", "Cases & Covers", "Tempered Glass", "Power Banks", "Cables"]
  },
  {
    id: "old-refurbished-mobiles",
    name: "Certified Refurbished & Pre-Owned Mobiles",
    badge: "32-Point Inspected",
    icon: "♻️",
    accentColor: "from-teal-600 to-emerald-700",
    tagColor: "bg-teal-50 text-teal-800 border-teal-200",
    description: "100% Quality Tested with 6-Month Warranty, 85%+ Battery Health, and Instant 7-Day Replacement",
    categoryQuery: "Old / Refurbished Mobiles",
    subcategories: ["Superb Grade A+", "Like New", "Refurbished iPhones", "Refurbished Android"]
  },
  {
    id: "smart-technology",
    name: "Smart Technology, Watches & Gadgets",
    badge: "Smart Living",
    icon: "💡",
    accentColor: "from-violet-600 to-indigo-600",
    tagColor: "bg-violet-50 text-violet-800 border-violet-200",
    description: "Apple Watch, fitness trackers, smart home security cameras, and intelligent lifestyle devices",
    categoryQuery: "Smart Technology",
    subcategories: ["Smartwatches", "Fitness Trackers", "Smart Home", "Security Cameras"]
  },
  {
    id: "computers-tablets",
    name: "Computers, Laptops & Tablets",
    badge: "Work & Play",
    icon: "💻",
    accentColor: "from-slate-700 to-slate-900",
    tagColor: "bg-slate-100 text-slate-800 border-slate-300",
    description: "High-performance laptops, iPads, tablets, gaming rigs, and productivity monitors",
    categoryQuery: "Computers & Tablets",
    subcategories: ["Laptops", "iPads & Tablets", "Gaming Laptops", "Monitors & Storage"]
  },
  {
    id: "tv-audio",
    name: "TV, Audio & Home Entertainment",
    badge: "Cinema Experience",
    icon: "📺",
    accentColor: "from-rose-600 to-red-700",
    tagColor: "bg-rose-50 text-rose-800 border-rose-200",
    description: "4K OLED Smart TVs, Dolby Atmos Soundbars, and noise-cancelling studio headphones",
    categoryQuery: "TV & Audio",
    subcategories: ["4K Smart TVs", "Soundbars & Speakers", "Noise Cancelling", "Home Theatres"]
  },
  {
    id: "kitchen-appliances",
    name: "Kitchen & Home Appliances",
    badge: "Smart Home",
    icon: "🍳",
    accentColor: "from-orange-600 to-amber-700",
    tagColor: "bg-orange-50 text-orange-800 border-orange-200",
    description: "Mixer grinders, air fryers, microwave ovens, refrigerators & daily home essentials",
    categoryQuery: "Kitchen Appliances",
    subcategories: ["Mixer Grinders", "Air Fryers", "Refrigerators", "Microwaves"]
  }
];

export default function HomeContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const normalizeImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600";
    if (url.startsWith("http")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: ""
  });
  
  const reviews = [
    {
      id: 1,
      customer_name: "Rahul Sharma",
      rating: 5,
      comment: "Bought the iPhone 16 Pro Max from here. Delivered on the same day with 100% original sealed box and official Apple warranty. Best price in town!"
    },
    {
      id: 2,
      customer_name: "Sneha Reddy",
      rating: 5,
      comment: "Super smooth phone exchange process for my old Galaxy S21 to Galaxy S25 Ultra with instant bonus discount and No Cost EMI."
    }
  ];

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchData() {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categoryList", { signal: controller.signal, cache: "no-store", headers: { "Accept": "application/json" } }),
          fetch("/api/productList", { signal: controller.signal, cache: "no-store", headers: { "Accept": "application/json" } })
        ]);
        
        const catData = catRes.ok ? await catRes.json() : [];
        const prodData = prodRes.ok ? await prodRes.json() : [];
        
        setCategories(Array.isArray(catData) ? catData : []);
        setProducts(Array.isArray(prodData) ? prodData : []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Failed to fetch data:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    return () => controller.abort();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your mobile inquiry! Our team will contact you shortly with the best offers.");
    setFormData({ name: "", phone: "", message: "" });
  };

  // Helper to categorize products cleanly
  const filterProductsForCategory = (catKey: string, allProducts: any[]) => {
    const key = catKey.toLowerCase();
    
    if (key === "mobiles") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();
        const isAcc = cat.includes("accessories") || sub.includes("charger") || sub.includes("adapter") || sub.includes("case") || sub.includes("cover") || sub.includes("glass") || sub.includes("cable") || sub.includes("power") || sub.includes("storage");
        const isRefurb = cat.includes("refurbished") || cat.includes("old") || (p.condition && p.condition.toLowerCase() !== "new");
        return (cat.includes("mobile") || p.category_id === "mobiles") && !isAcc && !isRefurb;
      });
    }
    
    if (key === "fashion") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();
        const isSmartTech = cat.includes("smart") || (p.category && p.category.toLowerCase().includes("smart"));
        const isJewel = cat.includes("jewel");
        return !isSmartTech && !isJewel && (
          cat === "fashion" || p.category_id === "fashion" ||
          sub.includes("handbag") || sub.includes("apparel") || sub.includes("clothing") ||
          sub.includes("shirt") || sub.includes("polo") || sub.includes("jeans") ||
          sub.includes("trouser") || sub.includes("dress") || sub.includes("kurta") ||
          sub.includes("jacket") || sub.includes("bag") || sub.includes("watch")
        );
      });
    }
    
    if (key === "jewellery" || key === "jewelry") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();
        return cat.includes("jewel") || sub.includes("gold") || sub.includes("silver") || sub.includes("moissanite") || sub.includes("necklace") || sub.includes("ring");
      });
    }
    
    if (key === "ev-vehicles" || key === "ev vehicles" || key === "vehicles") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();
        return cat.includes("ev") || cat.includes("vehicle") || sub.includes("scooter") || sub.includes("bike");
      });
    }
    
    if (key === "mobile-accessories" || key === "mobile accessories" || key === "accessories") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();
        return cat.includes("accessories") || sub.includes("charger") || sub.includes("adapter") || sub.includes("case") || sub.includes("cover") || sub.includes("glass") || sub.includes("power") || sub.includes("cable") || sub.includes("storage");
      });
    }
    
    if (key === "old-refurbished-mobiles" || key === "refurbished" || key === "old / refurbished mobiles") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        return cat.includes("refurbished") || cat.includes("old") || (p.condition && p.condition.toLowerCase() !== "new");
      });
    }
    
    if (key === "smart-technology" || key === "smart technology") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        return cat.includes("smart");
      });
    }
    
    if (key === "computers-tablets" || key === "computers & tablets") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        return cat.includes("computer") || cat.includes("laptop") || cat.includes("tablet");
      });
    }
    
    if (key === "tv-audio" || key === "tv & audio") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        return cat.includes("tv") || cat.includes("audio") || cat.includes("speaker");
      });
    }
    
    if (key === "kitchen-appliances" || key === "kitchen appliances" || key === "home appliances" || key === "home & furniture") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        return cat.includes("kitchen") || cat.includes("appliance") || cat.includes("furniture");
      });
    }
    
    return allProducts.filter(p => {
      const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
      return cat.includes(key) || (p.category_id && p.category_id.toLowerCase() === key);
    });
  };

  // Compute populated category sections dynamically
  const populatedCategorySections = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const sections: {
      config: CategoryConfig;
      items: any[];
      totalCount: number;
    }[] = [];

    // 1. Process predefined primary ecommerce categories
    PREDEFINED_CATEGORIES.forEach(config => {
      const matched = filterProductsForCategory(config.id, products);
      if (matched.length > 0) {
        sections.push({
          config,
          items: matched.slice(0, 8), // Show up to 8 top products on homepage
          totalCount: matched.length
        });
      }
    });

    // 2. Discover any additional custom categories from API not in predefined list
    categories.forEach(cat => {
      const alreadyHandled = sections.some(
        s => s.config.id.toLowerCase() === cat.id?.toLowerCase() ||
             s.config.categoryQuery.toLowerCase() === cat.name?.toLowerCase()
      );
      if (!alreadyHandled) {
        const matched = filterProductsForCategory(cat.id || cat.name, products);
        if (matched.length > 0) {
          sections.push({
            config: {
              id: cat.id || cat.name.toLowerCase().replace(/\s+/g, "-"),
              name: cat.name,
              badge: "Curated Store",
              icon: "📦",
              accentColor: "from-slate-700 to-slate-900",
              tagColor: "bg-slate-100 text-slate-800 border-slate-200",
              description: `Explore the complete collection of ${cat.name} with verified authenticity and fast delivery`,
              categoryQuery: cat.name,
              subcategories: cat.sub_categories || []
            },
            items: matched.slice(0, 8),
            totalCount: matched.length
          });
        }
      }
    });

    return sections;
  }, [products, categories]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 pb-16 md:pb-24 w-full max-w-full overflow-x-hidden bg-[#fafafa]">
      {/* 1. Main Hero Banner Carousel */}
      <Hero />

      {/* 2. Top Category Quick Navigation Rail (Amazon & Flipkart Style) */}
      <section className="bg-white border-y border-slate-200/80 py-3 sm:py-5 shadow-xs sticky top-[60px] md:top-[70px] z-20 backdrop-blur-md bg-white/95">
        <div className="container px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
            <h2 className="text-xs sm:text-sm md:text-base font-black flex items-center gap-2 text-slate-800 uppercase tracking-wider">
              <span className="w-1.5 h-4 bg-secondary rounded-full"></span>
              Explore All Categories
            </h2>
            <Link 
              href="/categories" 
              className="text-xs sm:text-sm font-bold text-secondary hover:underline flex items-center gap-1.5"
            >
              All Categories ({categories.length || 10}) <FontAwesomeIcon icon={faArrowRight} size="xs" />
            </Link>
          </div>

          <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-5 md:gap-8 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth">
            {(categories.length > 0 ? categories : PREDEFINED_CATEGORIES).map((cat) => {
              const catName = cat.name || cat.id;
              const catImg = cat.image_url || cat.image;
              const targetUrl = `/products?category=${encodeURIComponent(cat.name || cat.categoryQuery || cat.id)}`;
              
              return (
                <Link
                  key={cat.id || cat.name}
                  href={targetUrl}
                  className="flex flex-col items-center group flex-shrink-0 active:scale-95 transition-transform"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl bg-slate-50 border border-slate-200/90 group-hover:border-secondary group-hover:shadow-lg transition-all p-1.5 flex items-center justify-center overflow-hidden relative shadow-xs group-hover:scale-105">
                    <div className="relative w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden p-1 border border-slate-100">
                      {catImg ? (
                        <Image
                          src={normalizeImageUrl(catImg)}
                          alt={catName}
                          fill
                          className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 70px, 90px"
                        />
                      ) : (
                        <span className="text-2xl">{cat.icon || "📦"}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 text-center max-w-[75px] sm:max-w-[95px] md:max-w-[105px] leading-tight line-clamp-2 group-hover:text-secondary transition-colors mt-1.5">
                    {catName}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Shop by Top Smartphone Brands Bar */}
      <section className="container px-3 sm:px-4 md:px-6 pt-2">
        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-black flex items-center gap-2 text-slate-900 tracking-tight">
                <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
                Official Brand Stores
              </h2>
              <p className="text-xs text-slate-500 font-medium">100% Genuine products with brand warranty &amp; instant exchange</p>
            </div>
            <Link 
              href="/products" 
              className="text-xs sm:text-sm font-bold text-secondary hover:underline flex items-center gap-1"
            >
              All Brands <FontAwesomeIcon icon={faArrowRight} size="xs" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
            {[
              { name: "Samsung", label: "Galaxy Flagships", count: "5G & AI" },
              { name: "Apple", label: "iPhone Pro Max", count: "iOS 18" },
              { name: "OnePlus", label: "Nord & Pro Series", count: "SuperVOOC" },
              { name: "Google", label: "Pixel AI Phones", count: "Gemini AI" },
              { name: "Nike", label: "Sportswear & Gym", count: "Dri-FIT" },
              { name: "Zara", label: "Dresses & Bags", count: "New Season" },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                className="group relative bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-secondary p-3 rounded-xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-sm sm:text-base font-black text-slate-900 group-hover:text-secondary transition-colors">
                    {brand.name}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                    {brand.count}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold truncate">{brand.label}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-secondary">
                  <span>Explore</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC CATEGORY-BY-CATEGORY PRODUCT SHELVES (Flipkart & Amazon Style) */}
      <div className="flex flex-col gap-6 sm:gap-8 md:gap-12 mt-2">
        {isLoading ? (
          // Loading skeleton placeholder shelves
          [...Array(3)].map((_, i) => (
            <section key={i} className="container px-3 sm:px-4 md:px-6">
              <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
                <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            </section>
          ))
        ) : (
          populatedCategorySections.map(({ config, items, totalCount }, sectionIdx) => {
            const categoryUrl = `/products?category=${encodeURIComponent(config.categoryQuery)}`;
            
            return (
              <section 
                key={config.id} 
                className="container px-3 sm:px-4 md:px-6 scroll-mt-24"
                id={`category-${config.id}`}
              >
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
                  
                  {/* Category Section Header */}
                  <div className="p-4 sm:p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left Header Title & Highlights */}
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                          {config.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                              {config.name}
                            </h2>
                            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.tagColor}`}>
                              {config.badge}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                            {config.description}
                          </p>
                        </div>
                      </div>

                      {/* Right "View All" Button */}
                      <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                        <Link 
                          href={categoryUrl} 
                          className="bg-secondary text-white font-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <span>View All ({totalCount})</span>
                          <FontAwesomeIcon icon={faArrowRight} size="xs" />
                        </Link>
                      </div>
                    </div>

                    {/* Subcategory Tag Quick Pills */}
                    {config.subcategories && config.subcategories.length > 0 && (
                      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-3 sm:pt-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                          Filters:
                        </span>
                        {config.subcategories.map((sub) => (
                          <Link
                            key={sub}
                            href={`/products?category=${encodeURIComponent(config.categoryQuery)}&search=${encodeURIComponent(sub)}`}
                            className="text-[11px] sm:text-xs font-bold px-3 py-1 rounded-lg bg-white border border-slate-200/90 text-slate-700 hover:border-secondary hover:text-secondary hover:bg-emerald-50/40 transition-all flex-shrink-0 shadow-2xs"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Cards Shelf */}
                  <div className="p-3 sm:p-5 md:p-6 bg-slate-50/30">
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                      {items.map((product) => (
                        <ProductCard key={product.id} product={product} viewMode="grid" />
                      ))}
                    </div>

                    {/* End-Shelf "Explore Full Collection" Bar */}
                    <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
                        <span className="text-secondary font-black">●</span>
                        Showing top {items.length} of {totalCount} products in {config.name}
                      </div>
                      <Link
                        href={categoryUrl}
                        className="text-xs sm:text-sm font-black text-secondary hover:underline flex items-center gap-1.5"
                      >
                        Browse all {config.name} catalog
                        <FontAwesomeIcon icon={faArrowRight} size="xs" />
                      </Link>
                    </div>
                  </div>

                </div>

                {/* Intersperse Promotional Banner after 2nd and 4th categories */}
                {sectionIdx === 1 && (
                  <div className="mt-6 sm:mt-8">
                    <HomeBanners />
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* 5. The Journey of MY SHOP (Brand Story & Trust) */}
      <section className="container px-3 sm:px-4 md:px-6 py-4 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center bg-white rounded-3xl border border-slate-200/80 p-6 md:p-12 shadow-xs">
          <div className="relative aspect-4/3 sm:aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-xl bg-gray-100">
            <Image 
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1200" 
              alt="The Journey of MY SHOP" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white p-4 sm:p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <p className="font-black text-secondary text-base sm:text-xl mb-0.5">Quality First Guarantee</p>
              <p className="text-xs text-slate-800 font-bold">100% Genuine products across all categories with official warranty.</p>
            </div>
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-secondary mb-2 block">
              Direct Brand Retailer
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 md:mb-6 leading-tight text-slate-900">
              The Journey of <span className="text-secondary">MY SHOP</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4 md:mb-6">
              My Shop is your trusted destination for genuine smartphones, premium fashion, hallmarked jewellery, electric scooters, and smart electronics. We deliver flagship excellence directly to your doorstep with guaranteed official warranty and instant cashback.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6 md:mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-secondary shadow-2xs">
                <h4 className="font-black text-2xl text-secondary mb-0.5">100%</h4>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Original &amp; Sealed</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-secondary shadow-2xs">
                <h4 className="font-black text-2xl text-secondary mb-0.5">Express</h4>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Doorstep Delivery</p>
              </div>
            </div>

            <Link href="/about" className="group bg-secondary text-white font-black px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center gap-2.5 w-fit text-xs sm:text-sm">
              READ FULL STORY
              <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Customer Support & Inquiry Section */}
      <section className="container px-3 sm:px-4 md:px-6 py-2 md:py-6">
        <div className="bg-gradient-to-br from-secondary/10 via-emerald-500/5 to-secondary/5 rounded-3xl p-5 sm:p-8 md:p-14 flex flex-col lg:flex-row items-center gap-6 md:gap-12 border border-secondary/20 shadow-xs">
          <div className="flex-1">
            <span className="text-xs font-black uppercase tracking-widest text-secondary mb-2 block">
              Dedicated Customer Support &amp; Pre-Orders
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 md:mb-5 leading-tight text-slate-900">
              Looking for a Specific Model, Size, or Bulk Quote?
            </h2>
            <p className="text-slate-600 mb-5 md:mb-6 text-sm sm:text-base leading-relaxed">
              Whether you need corporate bulk procurement, trade-in valuation, or special edition models across any category, our product specialists are here to assist you 24/7.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="bg-secondary text-white font-black px-6 py-3 rounded-xl shadow-md hover:opacity-90 transition-all flex items-center gap-2 text-xs sm:text-sm">
                CONTACT SPECIALISTS
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-xl font-black mb-4 text-slate-900">Quick Product Inquiry</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your name"
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 ring-secondary transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="Enter 10-digit mobile number"
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 ring-secondary transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Product / Inquiry Details</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="e.g. Inquiring about iPhone 16 Pro, Levi's Jeans size, or EV Scooter delivery"
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 ring-secondary resize-none transition-all"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="bg-secondary text-white font-black py-3.5 rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  SUBMIT INQUIRY
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Verified Customer Reviews */}
      <section className="container px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-slate-900">
              <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
              Verified Buyer Reviews
            </h2>
            <p className="text-xs text-slate-500 ml-4 mt-0.5">Real feedback from verified shoppers across all categories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-5xl text-secondary" />
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} className={i < review.rating ? "text-amber-400 text-xs sm:text-sm" : "text-slate-200 text-xs sm:text-sm"} />
                ))}
              </div>
              <p className="text-slate-800 text-sm sm:text-base font-bold italic leading-relaxed mb-4">
                "{review.comment}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-sm">
                  {review.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-xs sm:text-sm">{review.customer_name}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">✓ Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
