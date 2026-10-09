"use client";

import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight, 
  faPaperPlane, 
  faStar,
  faLayerGroup,
  faTags
} from "@fortawesome/free-solid-svg-icons";
import ProductCard from "@/components/common/ProductCard";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/home/Hero";
import { useRouter } from "next/navigation";
import { products as defaultProducts } from "@/lib/data";

// Category configurations with meta details, icons, and highlights
interface CategoryConfig {
  id: string;
  name: string;
  badge: string;
  icon: string;
  tagColor: string;
  categoryQuery: string;
}

const PREDEFINED_CATEGORIES: CategoryConfig[] = [
  {
    id: "mobiles",
    name: "Smartphones & Flagships",
    badge: "Official Warranty",
    icon: "📱",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    categoryQuery: "Mobiles",
  },
  {
    id: "old-refurbished-mobiles",
    name: "Certified Refurbished Mobiles",
    badge: "32-Point Check",
    icon: "♻️",
    tagColor: "bg-teal-50 text-teal-800 border-teal-200",
    categoryQuery: "Old / Refurbished Mobiles",
  },
  {
    id: "mobile-accessories",
    name: "Fast Chargers & Accessories",
    badge: "100% Genuine",
    icon: "🔌",
    tagColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    categoryQuery: "Mobile Accessories",
  },
  {
    id: "smart-technology",
    name: "Smart Watches & Tech",
    badge: "Trending",
    icon: "💡",
    tagColor: "bg-violet-50 text-violet-800 border-violet-200",
    categoryQuery: "Smart Technology",
  },
  {
    id: "fashion",
    name: "Fashion & Apparel",
    badge: "Top Brands",
    icon: "👗",
    tagColor: "bg-pink-50 text-pink-700 border-pink-200",
    categoryQuery: "Fashion",
  },
  {
    id: "jewellery",
    name: "Precious Jewellery",
    badge: "BIS Hallmarked",
    icon: "💎",
    tagColor: "bg-amber-50 text-amber-800 border-amber-200",
    categoryQuery: "Jewellery",
  },
  {
    id: "ev-vehicles",
    name: "Electric Vehicles & Scooters",
    badge: "Zero Emission",
    icon: "⚡",
    tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    categoryQuery: "EV Vehicles",
  },
  {
    id: "computers-tablets",
    name: "Laptops & Computers",
    badge: "High Performance",
    icon: "💻",
    tagColor: "bg-slate-100 text-slate-800 border-slate-300",
    categoryQuery: "Computers & Tablets",
  }
];

// Top Flipkart-Style Category Navigation Rail with Real Product Photo Thumbnails
const FLIPKART_APP_CATEGORIES = [
  { 
    id: "deals", 
    name: "Top Deals", 
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=200", 
    url: "/products?sort=discount_desc",
    isHot: true 
  },
  { 
    id: "mobiles", 
    name: "Mobiles", 
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=200", 
    url: "/products?category=Mobiles" 
  },
  { 
    id: "refurbished", 
    name: "Refurbished", 
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=200", 
    url: "/products?category=Old%20%2F%20Refurbished%20Mobiles" 
  },
  { 
    id: "accessories", 
    name: "Accessories", 
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=200", 
    url: "/products?category=Mobile%20Accessories" 
  },
  { 
    id: "smart-tech", 
    name: "Smart Tech", 
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200" , 
    url: "/products?category=Smart%20Technology" 
  },
  { 
    id: "laptops", 
    name: "Laptops", 
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=200", 
    url: "/products?category=Computers%20%26%20Tablets" 
  },
  { 
    id: "fashion", 
    name: "Fashion", 
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=200", 
    url: "/products?category=Fashion" 
  },
  { 
    id: "jewellery", 
    name: "Jewellery", 
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=200", 
    url: "/products?category=Jewellery" 
  },
  { 
    id: "ev", 
    name: "EV Scooters", 
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200", 
    url: "/products?category=EV%20Vehicles" 
  },
  { 
    id: "appliances", 
    name: "Appliances", 
    image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&q=80&w=200", 
    url: "/products?category=Kitchen%20Appliances" 
  },
];

// 1. Featured Category Cards for the "Shop by Category" Grid matching the design
const HOME_FEATURED_CATEGORIES = [
  {
    id: "mobiles",
    name: "Mobiles & Accessories",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Mobiles",
    subtitle: "View Catalog →",
    tag: "Flagships & More"
  },
  {
    id: "computers-tablets",
    name: "Computers & Tablets",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Computers%20%26%20Tablets",
    subtitle: "View Catalog →",
    tag: "Laptops & Desktops"
  },
  {
    id: "tv-audio",
    name: "TV & Audio",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=TV%20%26%20Audio",
    subtitle: "View Catalog →",
    tag: "4K TVs & Soundbars"
  },
  {
    id: "kitchen-appliances",
    name: "Kitchen Appliances",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Kitchen%20Appliances",
    subtitle: "View Catalog →",
    tag: "Home & Kitchen"
  },
  {
    id: "smart-technology",
    name: "Smart Watches & Wearables",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Smart%20Technology",
    subtitle: "View Catalog →",
    tag: "AMOLED & Fitness"
  },
  {
    id: "fashion",
    name: "Fashion & Lifestyle",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Fashion",
    subtitle: "View Catalog →",
    tag: "Trends & Apparel"
  },
  {
    id: "jewellery",
    name: "Precious Jewellery",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Jewellery",
    subtitle: "View Catalog →",
    tag: "100% BIS Hallmarked"
  },
  {
    id: "ev-vehicles",
    name: "Electric Vehicles",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=EV%20Vehicles",
    subtitle: "View Catalog →",
    tag: "Green Mobility"
  },
  {
    id: "refurbished-mobiles",
    name: "Certified Refurbished Mobiles",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Old%20%2F%20Refurbished%20Mobiles",
    subtitle: "View Catalog →",
    tag: "32-Point Quality Tested"
  },
  {
    id: "mobile-accessories",
    name: "Fast Mobile Accessories",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800",
    url: "/products?category=Mobile%20Accessories",
    subtitle: "View Catalog →",
    tag: "GaN Chargers & Cables"
  }
];

// 2. Featured Brand Cards for the "Shop by Brand" Grid
const HOME_FEATURED_BRANDS = [
  { name: "Apple", query: "Apple", logo: "/brands/apple.png", desc: "iPhones & MacBooks", count: "Flagships", url: "/products?category=Mobiles&brand=Apple" },
  { name: "Samsung", query: "Samsung", logo: "/brands/samsung.png", desc: "Galaxy S26 & Fold", count: "Top Rated", url: "/products?category=Mobiles&brand=Samsung" },
  { name: "OnePlus", query: "OnePlus", logo: "/brands/oneplus.png", desc: "Never Settle Tech", count: "OxygenOS", url: "/products?category=Mobiles&brand=OnePlus" },
  { name: "Google Pixel", query: "Pixel", logo: "/brands/google.png", desc: "Google Tensor AI", count: "Pixel Pro", url: "/products?category=Mobiles&brand=Pixel" },
  { name: "HP", query: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_630x630.png", desc: "Spectre & Pavilion", count: "Laptops", url: "/products?category=Computers%20%26%20Tablets&brand=HP" },
  { name: "Dell", query: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg", desc: "XPS & Inspiron", count: "Computers", url: "/products?category=Computers%20%26%20Tablets&brand=Dell" },
  { name: "Lenovo", query: "Lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg", desc: "ThinkPad & Legion", count: "High Speed", url: "/products?category=Computers%20%26%20Tablets&brand=Lenovo" },
  { name: "Asus", query: "Asus", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg", desc: "ROG & ZenBook", count: "Gaming", url: "/products?category=Computers%20%26%20Tablets&brand=Asus" },
  { name: "Noise", query: "Noise", logo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200", desc: "ColorFit Smartwatches", count: "Wearables", url: "/products?category=Smart%20Technology&brand=Noise" },
  { name: "Fire-Boltt", query: "Fire-Boltt", logo: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=200", desc: "AMOLED Calling Watches", count: "Smart Tech", url: "/products?category=Smart%20Technology&brand=Fire-Boltt" },
  { name: "Titan", query: "Titan", logo: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=200", desc: "Smart & Luxury Watches", count: "Heritage", url: "/products?category=Smart%20Technology&brand=Titan" },
  { name: "Tanishq", query: "Tanishq", logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200", desc: "100% BIS Hallmarked Gold", count: "Fine Jewellery", url: "/products?category=Jewellery&brand=Tanishq" },
  { name: "Ather", query: "Ather", logo: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200", desc: "Smart Electric 450X", count: "EV Scooters", url: "/products?category=EV%20Vehicles&brand=Ather" },
  { name: "Ola Electric", query: "Ola", logo: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200", desc: "S1 Pro Gen 2 Mobility", count: "Electric", url: "/products?category=EV%20Vehicles&brand=Ola" },
  { name: "Anker", query: "Anker", logo: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=200", desc: "GaN Fast Power & Cables", count: "Fast Charging", url: "/products?category=Mobile%20Accessories&brand=Anker" },
  { name: "Sony", query: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg", desc: "Bravia & Audio Tech", count: "TV & Audio", url: "/products?category=TV%20%26%20Audio&brand=Sony" }
];

export default function HomeContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>(defaultProducts || []);
  const [mobileBrands, setMobileBrands] = useState<any[]>([]);
  const [selectedMobileBrand, setSelectedMobileBrand] = useState<string>("all");
  const [homeExploreMode, setHomeExploreMode] = useState<"category" | "brand">("category");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
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
      try {
        const [catRes, prodRes, brandRes] = await Promise.all([
          fetch("/api/categoryList", { signal: controller.signal, cache: "no-store", headers: { "Accept": "application/json" } }),
          fetch("/api/productList", { signal: controller.signal, cache: "no-store", headers: { "Accept": "application/json" } }),
          fetch("/api/brands?category=Mobiles", { signal: controller.signal, cache: "no-store", headers: { "Accept": "application/json" } })
        ]);
        
        const catData = catRes.ok ? await catRes.json() : [];
        const prodData = prodRes.ok ? await prodRes.json() : [];
        const brandData = brandRes.ok ? await brandRes.json() : [];
        
        if (Array.isArray(catData) && catData.length > 0) {
          setCategories(catData);
        }
        if (Array.isArray(prodData) && prodData.length > 0) {
          setProducts(prodData);
        } else {
          setProducts(defaultProducts);
        }
        if (Array.isArray(brandData) && brandData.length > 0) {
          setMobileBrands(brandData);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Failed to fetch data:", err);
        }
        setProducts(defaultProducts);
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

  // Helper to categorize products cleanly and robustly
  const filterProductsForCategory = (catKey: string, allProducts: any[]) => {
    const key = catKey.toLowerCase();
    
    if (key === "mobiles") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || "").toLowerCase();
        const catId = (p.category_id || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const cond = (p.condition || "").toLowerCase();

        // 1. Must NOT be an accessory
        const isAcc = cat === "mobile accessories" || catId === "mobile-accessories" || 
                      sub.includes("charger") || sub.includes("adapter") || sub.includes("case") || 
                      sub.includes("cover") || sub.includes("glass") || sub.includes("cable") || 
                      sub.includes("power") || sub.includes("storage");
        if (isAcc) return false;

        // 2. Must NOT be refurbished / pre-owned
        const isRefurb = cat.includes("refurbished") || cat.includes("old") || 
                         catId.includes("refurbished") || catId.includes("old") ||
                         sub.includes("refurbished") || name.includes("refurbished") ||
                         cond.includes("refurbished") || cond.includes("grade") || 
                         cond.includes("like new") || cond.includes("pre-owned") || 
                         (cond.includes("used") && !cond.includes("brand new"));
        if (isRefurb) return false;

        // 3. Must NOT be fashion, jewellery, EV, or laptop
        const isOther = cat.includes("fashion") || cat.includes("jewel") || cat.includes("ev") || cat.includes("vehicle") || cat.includes("laptop") || cat.includes("computer");
        if (isOther) return false;

        // 4. Must be a mobile / smartphone or brand match
        return (
          cat === "mobiles" || catId === "mobiles" || catId === "mobiles-accessories" ||
          sub.includes("phone") || sub.includes("flagship") || sub.includes("mobile") ||
          name.includes("galaxy") || name.includes("iphone") || name.includes("oneplus") || 
          name.includes("onplus") || name.includes("nord") || name.includes("fold") || 
          name.includes("flip") || name.includes("ultra") || name.includes("pixel") || 
          name.includes("vivo") || name.includes("realme") || name.includes("redmi") || 
          name.includes("poco") || name.includes("motorola") || name.includes("moto") || 
          name.includes("oppo") || name.includes("iqoo") || name.includes("nothing") || 
          name.includes("5g") || name.includes("4g") || name.includes("pro max") || 
          (!cat && !sub) // Default unclassified products to mobiles
        );
      });
    }

    if (key === "old-refurbished-mobiles" || key === "refurbished" || key === "old / refurbished mobiles") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || "").toLowerCase();
        const catId = (p.category_id || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const cond = (p.condition || "").toLowerCase();

        return (
          cat.includes("refurbished") || cat.includes("old") || 
          catId.includes("refurbished") || catId.includes("old") ||
          sub.includes("refurbished") || name.includes("refurbished") ||
          cond.includes("refurbished") || cond.includes("grade") || 
          cond.includes("like new") || cond.includes("pre-owned") || 
          (cond.includes("used") && !cond.includes("brand new"))
        );
      });
    }
    
    if (key === "mobile-accessories" || key === "mobile accessories" || key === "accessories") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || "").toLowerCase();
        const catId = (p.category_id || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();
        return (
          cat === "mobile accessories" || catId === "mobile-accessories" ||
          sub.includes("charger") || sub.includes("adapter") || sub.includes("case") || 
          sub.includes("cover") || sub.includes("glass") || sub.includes("power") || 
          sub.includes("cable") || sub.includes("storage")
        );
      });
    }
    
    if (key === "smart-technology" || key === "smart technology") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        return cat.includes("smart") || sub.includes("watch") || name.includes("watch") || name.includes("smart");
      });
    }

    if (key === "fashion") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();
        const isSmartTech = cat.includes("smart");
        const isJewel = cat.includes("jewel");
        return !isSmartTech && !isJewel && (
          cat === "fashion" || p.category_id === "fashion" ||
          sub.includes("handbag") || sub.includes("apparel") || sub.includes("clothing") ||
          sub.includes("shirt") || sub.includes("polo") || sub.includes("jeans") ||
          sub.includes("trouser") || sub.includes("dress") || sub.includes("kurta") ||
          sub.includes("jacket") || sub.includes("bag")
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
    
    if (key === "computers-tablets" || key === "computers & tablets") {
      return allProducts.filter(p => {
        const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
        return cat.includes("computer") || cat.includes("laptop") || cat.includes("tablet");
      });
    }
    
    return allProducts.filter(p => {
      const cat = (p.category_name || p.category || p.category_id || "").toLowerCase();
      return cat.includes(key) || (p.category_id && p.category_id.toLowerCase() === key);
    });
  };

  // Top core categories to feature on the homepage
  const HOMEPAGE_FEATURED_CATEGORY_IDS = [
    "mobiles",
    "old-refurbished-mobiles",
    "mobile-accessories",
    "smart-technology",
    "fashion",
    "jewellery",
    "ev-vehicles",
    "computers-tablets"
  ];

  // Compute populated category sections dynamically (compact 2-4 items per category for fast mobile browsing)
  const populatedCategorySections = useMemo(() => {
    const prodsToUse = (products && products.length > 0) ? products : (defaultProducts || []);
    if (!prodsToUse || prodsToUse.length === 0) return [];
    
    const sections: {
      config: CategoryConfig;
      items: any[];
      totalCount: number;
    }[] = [];

    // Prioritize configured categories that contain matching products
    PREDEFINED_CATEGORIES.forEach(config => {
      let matched = filterProductsForCategory(config.id, prodsToUse);
      if (config.id === "mobiles" && selectedMobileBrand !== "all") {
        const bTarget = selectedMobileBrand.toLowerCase();
        const brandFiltered = matched.filter(p => {
          const pName = (p.name || "").toLowerCase();
          const pBrand = (p.brand || "").toLowerCase();
          const pDesc = (p.description || "").toLowerCase();
          return pName.includes(bTarget) || pBrand.includes(bTarget) || pDesc.includes(bTarget);
        });
        if (brandFiltered.length > 0) {
          matched = brandFiltered;
        }
      }

      if (matched.length > 0) {
        sections.push({
          config,
          items: matched.slice(0, 12),
          totalCount: matched.length
        });
      }
    });

    // If no category matched specifically, provide fallback shelf
    if (sections.length === 0 && prodsToUse.length > 0) {
      sections.push({
        config: PREDEFINED_CATEGORIES[0],
        items: prodsToUse.slice(0, 6),
        totalCount: prodsToUse.length
      });
    }

    return sections;
  }, [products, selectedMobileBrand]);

  return (
    <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 pb-8 md:pb-12 w-full max-w-full overflow-x-hidden bg-[#f1f3f6]">
      
      {/* 1. HERO BANNER CAROUSEL (Directly under Header) */}
      <Hero />

      {/* 2. FLIPKART-STYLE REAL PRODUCT PHOTO CATEGORY RAIL (Right under Banner) */}
      <section className="w-full bg-white border-y border-slate-200/80 py-2 sm:py-2.5 px-2 sm:px-4 select-none">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-start lg:justify-center gap-3.5 sm:gap-6 md:gap-8 lg:gap-10 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 px-1 scroll-smooth">
            {FLIPKART_APP_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.url}
                className="flex flex-col items-center group flex-shrink-0 active:scale-95 transition-all min-w-[56px] sm:min-w-[66px] md:min-w-[74px] cursor-pointer"
              >
                {/* Flipkart Style Circular Photo Avatar */}
                <div className="relative">
                  <div className="w-13 h-13 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-full bg-slate-50 border border-slate-200/90 overflow-hidden shadow-2xs group-hover:scale-105 group-hover:border-emerald-500 group-hover:shadow-sm transition-all duration-200 relative flex items-center justify-center">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                  {cat.isHot && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full border border-white shadow-xs animate-pulse">
                      HOT
                    </span>
                  )}
                </div>

                {/* Clean Label */}
                <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-800 text-center tracking-tight group-hover:text-[#2E6F40] transition-colors whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2.5. SHOP BY CATEGORY / SHOP BY BRAND SWITCHABLE SHOWCASE */}
      <section className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 md:px-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 shadow-2xs space-y-4">
          
          {/* Header with Green Accent, Mode Switcher & View All */}
          <div className="flex items-center justify-between flex-wrap gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="w-2.5 h-6 bg-[#2E6F40] rounded-full" />
              <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                {homeExploreMode === "category" ? "Shop by Category" : "Shop by Brand"}
              </h2>
            </div>

            {/* Switch Toggle: [ 📂 Shop by Category | 🏷️ Shop by Brand ] */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setHomeExploreMode("category")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    homeExploreMode === "category"
                      ? "bg-white text-[#2E6F40] shadow-sm border border-slate-200/80 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FontAwesomeIcon icon={faLayerGroup} className="text-[11px]" />
                  <span>Shop by Category</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHomeExploreMode("brand")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    homeExploreMode === "brand"
                      ? "bg-white text-[#2E6F40] shadow-sm border border-slate-200/80 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FontAwesomeIcon icon={faTags} className="text-[11px]" />
                  <span>Shop by Brand</span>
                </button>
              </div>

              {/* View All link */}
              <Link
                href="/products"
                className="text-xs sm:text-sm font-bold text-[#2E6F40] hover:text-emerald-700 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </Link>
            </div>
          </div>

          {/* MODE 1: SHOP BY CATEGORY GRID (Matching screenshot cards) */}
          {homeExploreMode === "category" && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {HOME_FEATURED_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.url}
                  className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#2E6F40] transition-all overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Category Image */}
                  <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      unoptimized
                    />
                  </div>

                  {/* Category Details */}
                  <div className="p-3 sm:p-4 flex flex-col items-center justify-center text-center bg-white flex-1">
                    <h3 className="text-xs sm:text-sm md:text-base font-black text-slate-900 group-hover:text-[#2E6F40] transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 group-hover:text-[#2E6F40] flex items-center gap-1 mt-1 transition-colors">
                      {cat.subtitle}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* MODE 2: SHOP BY BRAND GRID */}
          {homeExploreMode === "brand" && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {HOME_FEATURED_BRANDS.map((b) => (
                <Link
                  key={b.name}
                  href={b.url}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#2E6F40] shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-between p-3 sm:p-3.5 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                      {b.logo ? (
                        <Image
                          src={b.logo}
                          alt={b.name}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 font-black text-xs">
                          {b.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#2E6F40] transition-colors truncate">
                        {b.name}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                  <span className="text-[#2E6F40] group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
                    <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
                  </span>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 3. DYNAMIC CATEGORY PRODUCT SHELVES (Immediately below category rail) */}
      <div className="flex flex-col gap-2.5 sm:gap-3.5 md:gap-4 mt-0.5">
        {isLoading ? (
          // Loading skeleton placeholder shelves
          [...Array(3)].map((_, i) => (
            <section key={i} className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 md:px-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
                <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse mb-3" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            </section>
          ))
        ) : (
          populatedCategorySections.map(({ config, items, totalCount }) => {
            const categoryUrl = `/products?category=${encodeURIComponent(config.categoryQuery)}`;
            
            return (
              <section 
                key={config.id} 
                className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 md:px-4 scroll-mt-20"
                id={`category-${config.id}`}
              >
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                  
                  {/* Category Section Header */}
                  <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 border-b border-slate-100 flex items-center justify-between gap-2">
                    
                    {/* Left: Title & Badge */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-base sm:text-lg flex-shrink-0 shadow-2xs">
                        {config.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight truncate">
                            {config.name}
                          </h2>
                          <span className={`text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${config.tagColor} hidden xs:inline-block`}>
                            {config.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: "View All" Dark Pill Button matching screenshot */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link 
                        href={categoryUrl} 
                        className="bg-slate-950 hover:bg-black text-white font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <span>View All ({totalCount})</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                      </Link>
                    </div>
                  </div>

                  {/* Quick Brand Pills Rail for Mobiles */}
                  {config.id === "mobiles" && (
                    <div className="px-3 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
                      <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 mr-0.5">Brands:</span>
                      
                      {/* All Brands Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedMobileBrand("all")}
                        className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold border shadow-2xs shrink-0 active:scale-95 transition-all cursor-pointer ${
                          selectedMobileBrand === "all"
                            ? "bg-[#2E6F40] text-white border-[#2E6F40] shadow-sm font-black"
                            : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200/90"
                        }`}
                      >
                        All Brands
                      </button>

                      {(mobileBrands.length > 0 ? mobileBrands : [
                        { name: "Samsung Galaxy", query: "Samsung" },
                        { name: "Apple iPhone", query: "Apple" },
                        { name: "OnePlus", query: "OnePlus" },
                        { name: "Google Pixel", query: "Pixel" },
                        { name: "Vivo", query: "Vivo" },
                        { name: "Motorola", query: "Motorola" },
                        { name: "Realme", query: "realme" },
                        { name: "Xiaomi / Redmi", query: "Redmi" },
                        { name: "Nothing Phone", query: "Nothing" },
                        { name: "iQOO", query: "iQOO" }
                      ]).map((b: any, bIdx: number) => {
                        const bQuery = b.query || b.name;
                        const isSelected = selectedMobileBrand.toLowerCase() === bQuery.toLowerCase() || 
                                           selectedMobileBrand.toLowerCase() === b.name.toLowerCase();
                        
                        return (
                          <button
                            key={b.id || bIdx}
                            type="button"
                            onClick={() => {
                              setSelectedMobileBrand(isSelected ? "all" : bQuery);
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold border shadow-2xs shrink-0 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? "bg-[#2E6F40] text-white border-[#2E6F40] shadow-sm font-black"
                                : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90"
                            }`}
                          >
                            {b.logo_url && (
                              <div className="w-3.5 h-3.5 rounded-full bg-white overflow-hidden relative shrink-0 border border-slate-200">
                                <Image
                                  src={b.logo_url}
                                  alt={b.name}
                                  fill
                                  className="object-contain p-0.5"
                                  unoptimized
                                />
                              </div>
                            )}
                            <span>{b.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Product Cards Shelf (Compact 5-6 cards on desktop) */}
                  <div className="p-2 sm:p-2.5 md:p-3 bg-[#fbfcfd]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3">
                      {items.map((product) => (
                        <ProductCard key={product.id} product={product} viewMode="grid" />
                      ))}
                    </div>
                  </div>

                </div>
              </section>
            );
          })
        )}
      </div>

      {/* 4. The Journey of MY SHOP (Brand Story & Trust) */}
      <section className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 md:px-4 py-1 sm:py-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-center bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs">
          <div className="relative aspect-16/10 sm:aspect-square rounded-xl overflow-hidden shadow-md bg-slate-100">
            <Image 
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1200" 
              alt="The Journey of MY SHOP" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 text-white p-3 sm:p-4 bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
              <p className="font-black text-[#2E6F40] text-sm sm:text-base mb-0.5">Quality First Guarantee</p>
              <p className="text-[11px] sm:text-xs text-slate-800 font-bold">100% Genuine products across all categories with official brand warranty.</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#2E6F40] mb-1.5 block">
              Direct Brand Retailer
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-4 leading-tight text-slate-900">
              The Journey of <span className="text-[#2E6F40]">MY SHOP</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-5">
              My Shop is your trusted destination for genuine smartphones, premium fashion, hallmarked jewellery, electric scooters, and smart electronics. We deliver flagship excellence directly to your doorstep with guaranteed official warranty and instant exchange bonuses.
            </p>
            
            <div className="grid grid-cols-2 gap-2.5 mb-4 sm:mb-6">
              <div className="bg-slate-50 p-3 rounded-xl border-l-3 border-[#2E6F40] shadow-2xs">
                <h4 className="font-black text-xl text-[#2E6F40] mb-0.5">100%</h4>
                <p className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">Original &amp; Sealed</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border-l-3 border-[#2E6F40] shadow-2xs">
                <h4 className="font-black text-xl text-[#2E6F40] mb-0.5">Express</h4>
                <p className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">Doorstep Delivery</p>
              </div>
            </div>

            <Link href="/about" className="group bg-[#2E6F40] text-white font-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-xs hover:bg-[#255a33] transition-all flex items-center gap-2 w-fit text-xs sm:text-sm">
              <span>READ FULL STORY</span>
              <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform text-xs" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Customer Support & Inquiry Section */}
      <section className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 md:px-4 py-1 sm:py-2">
        <div className="bg-gradient-to-br from-[#2E6F40]/10 via-emerald-500/5 to-[#2E6F40]/5 rounded-2xl p-3.5 sm:p-6 flex flex-col lg:flex-row items-center gap-4 md:gap-6 border border-[#2E6F40]/20 shadow-2xs">
          <div className="flex-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#2E6F40] mb-1 block">
              Customer Support &amp; Orders
            </span>
            <h2 className="text-base sm:text-xl md:text-2xl font-black mb-1.5 leading-tight text-slate-900">
              Looking for a Specific Model or Bulk Order?
            </h2>
            <p className="text-slate-600 mb-2.5 text-xs sm:text-sm leading-relaxed">
              Whether you need bulk procurement, exchange valuation, or rare models, our team is ready to assist.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/contact" className="bg-[#2E6F40] text-white font-black px-4 py-2 rounded-xl shadow-xs hover:bg-[#255a33] transition-all flex items-center gap-1.5 text-xs">
                <span>Contact Specialists</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md">
            <div className="bg-white p-3.5 sm:p-5 rounded-xl shadow-xs border border-slate-100">
              <h3 className="text-xs sm:text-sm font-black mb-2 text-slate-900">Quick Product Inquiry</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your name"
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 ring-[#2E6F40] transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Contact Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="Enter 10-digit mobile number"
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 ring-[#2E6F40] transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Product Inquiry</label>
                  <textarea 
                    rows={2}
                    required
                    placeholder="e.g. Inquiring about iPhone 16 Pro 256GB"
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 ring-[#2E6F40] resize-none transition-all"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="bg-[#2E6F40] text-white font-black py-2 rounded-lg shadow-xs hover:bg-[#255a33] transition-all active:scale-[0.98] uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 mt-0.5"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="text-[10px]" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
