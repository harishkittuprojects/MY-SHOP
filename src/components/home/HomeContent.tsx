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

        // 3. Must be a mobile / smartphone
        return (
          cat === "mobiles" || catId === "mobiles" || catId === "mobiles-accessories" ||
          sub.includes("phone") || sub.includes("flagship") || sub.includes("mobile") ||
          name.includes("galaxy") || name.includes("iphone") || name.includes("oneplus") || 
          name.includes("pixel") || name.includes("vivo") || name.includes("realme") || 
          name.includes("redmi") || name.includes("poco") || name.includes("motorola")
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

  // Top 4 core categories to feature on the homepage
  const HOMEPAGE_FEATURED_CATEGORY_IDS = [
    "mobiles",
    "old-refurbished-mobiles",
    "mobile-accessories",
    "smart-technology"
  ];

  // Compute populated category sections dynamically (compact 2-4 items per category for fast mobile browsing)
  const populatedCategorySections = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const sections: {
      config: CategoryConfig;
      items: any[];
      totalCount: number;
    }[] = [];

    // Show only the top 4 core categories on homepage
    PREDEFINED_CATEGORIES.filter(c => HOMEPAGE_FEATURED_CATEGORY_IDS.includes(c.id)).forEach(config => {
      const matched = filterProductsForCategory(config.id, products);
      if (matched.length > 0) {
        sections.push({
          config,
          items: matched.slice(0, 4), // 2 to 4 products per category shelf
          totalCount: matched.length
        });
      }
    });

    return sections;
  }, [products]);

  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  // Flipkart-style top icon categories
  const TOP_FLIPKART_CATEGORIES = [
    { id: "for-you", name: "For You", icon: "🛍️", url: "/products?category=for-you", isActive: true, hasMenu: false },
    { id: "fashion", name: "Fashion", icon: "👗", url: "/products?category=Fashion", hasMenu: true },
    { id: "mobiles", name: "Mobiles", icon: "📱", url: "/products?category=Mobiles", hasMenu: true },
    { id: "electronics", name: "Electronics", icon: "💻", url: "/products?category=Smart%20Technology", hasMenu: true },
    { id: "refurbished", name: "Refurbished", icon: "♻️", url: "/products?category=Old%20%2F%20Refurbished%20Mobiles", hasMenu: true },
    { id: "jewellery", name: "Jewellery", icon: "💎", url: "/products?category=Jewellery", hasMenu: true },
    { id: "ev", name: "EV Vehicles", icon: "⚡", url: "/products?category=EV%20Vehicles", hasMenu: true },
    { id: "laptops", name: "Laptops", icon: "🖥️", url: "/products?category=Computers%20%26%20Tablets", hasMenu: true },
    { id: "appliances", name: "Appliances", icon: "🍳", url: "/products?category=Kitchen%20Appliances", hasMenu: true },
    { id: "tv-audio", name: "TV & Audio", icon: "📺", url: "/products?category=TV%20%26%20Audio", hasMenu: true },
    { id: "accessories", name: "Accessories", icon: "🔌", url: "/products?category=Mobile%20Accessories", hasMenu: true },
    { id: "beauty", name: "Beauty & Care", icon: "💄", url: "/products?category=Fashion&search=Beauty", hasMenu: false },
    { id: "sports", name: "Sports & Gym", icon: "🏏", url: "/products?category=Fashion&search=Sport", hasMenu: false },
  ];

  // Comprehensive Mega Menu Data (Subcategories & All Available Brands)
  const MEGA_MENU_DATA: Record<string, {
    title: string;
    badge: string;
    icon: string;
    categoryQuery: string;
    subcategories: { name: string; query: string; icon: string; badge?: string }[];
    brands: { name: string; brandQuery: string; count: string; highlight?: boolean; icon?: string }[];
    priceSegments: { label: string; url: string }[];
  }> = {
    mobiles: {
      title: "Smartphones & Mobile Devices",
      badge: "Official Brand Warranty",
      icon: "📱",
      categoryQuery: "Mobiles",
      subcategories: [
        { name: "All Mobile Phones", query: "Mobiles", icon: "📱" },
        { name: "Official Flagships (iPhone & Galaxy)", query: "Mobiles&search=Flagship", icon: "👑", badge: "Trending" },
        { name: "5G High-Speed Phones", query: "Mobiles&search=5G", icon: "⚡" },
        { name: "Gaming Smartphones", query: "Mobiles&search=Gaming", icon: "🎮" },
        { name: "Budget Smartphones", query: "Mobiles&search=Budget", icon: "💰" },
        { name: "Certified Refurbished Mobiles", query: "Old%20%2F%20Refurbished%20Mobiles", icon: "♻️", badge: "32-Point Check" },
        { name: "Fast Chargers & MagSafe", query: "Mobile%20Accessories&search=Charger", icon: "🔌" },
        { name: "Armor Cases & Covers", query: "Mobile%20Accessories&search=Case", icon: "🛡️" },
        { name: "9H Tempered Glass", query: "Mobile%20Accessories&search=Glass", icon: "💎" },
        { name: "Power Banks & Cables", query: "Mobile%20Accessories&search=Power%20Bank", icon: "🔋" }
      ],
      brands: [
        { name: "Apple", brandQuery: "Apple", count: "iPhone 16 Pro, 15, 14, 13", highlight: true, icon: "🍏" },
        { name: "Samsung", brandQuery: "Samsung", count: "Galaxy S25 Ultra, Fold, A Series", highlight: true, icon: "🌌" },
        { name: "OnePlus", brandQuery: "OnePlus", count: "OnePlus 13, 12R, Nord 4", highlight: true, icon: "🔴" },
        { name: "Vivo", brandQuery: "Vivo", count: "X200 Pro, V40, T3 5G", icon: "🔵" },
        { name: "Realme", brandQuery: "realme", count: "GT 7 Pro, 14 Pro+, Narzo", icon: "🟡" },
        { name: "Xiaomi / Redmi", brandQuery: "Xiaomi", count: "Xiaomi 15, Redmi Note 14", icon: "🟠" },
        { name: "Google Pixel", brandQuery: "Google", count: "Pixel 9 Pro XL, Pixel 8a", highlight: true, icon: "🔘" },
        { name: "Motorola", brandQuery: "Motorola", count: "Edge 50 Ultra, Razr 50", icon: "🔵" },
        { name: "iQOO", brandQuery: "iQOO", count: "iQOO 13, Neo 10, Z9", icon: "⚡" },
        { name: "POCO", brandQuery: "POCO", count: "POCO X7 Pro, F6 Series", icon: "🟡" },
        { name: "Nothing", brandQuery: "Nothing", count: "Phone (2a), Phone 2", icon: "⚪" },
        { name: "Infinix / Tecno", brandQuery: "Infinix", count: "GT 20 Pro, Zero 40", icon: "🟣" }
      ],
      priceSegments: [
        { label: "Under ₹10,000", url: "/products?category=Mobiles&price=under-10k" },
        { label: "₹10,000 – ₹20,000", url: "/products?category=Mobiles&price=10k-25k" },
        { label: "₹20,000 – ₹40,000", url: "/products?category=Mobiles&price=25k-50k" },
        { label: "₹40,000 – ₹70,000", url: "/products?category=Mobiles&price=50k-100k" },
        { label: "Flagships ₹70,000+", url: "/products?category=Mobiles&price=above-100k" }
      ]
    },
    fashion: {
      title: "Fashion, Apparel & Top Brands",
      badge: "Trending Styles",
      icon: "👗",
      categoryQuery: "Fashion",
      subcategories: [
        { name: "All Fashion Catalog", query: "Fashion", icon: "👗" },
        { name: "Men's Shirts & Polos", query: "Fashion&search=Shirt", icon: "👔" },
        { name: "Jeans & Trousers", query: "Fashion&search=Jeans", icon: "👖" },
        { name: "T-Shirts & Sportswear", query: "Fashion&search=T-Shirt", icon: "👕" },
        { name: "Women's Dresses & Kurtis", query: "Fashion&search=Dress", icon: "👗" },
        { name: "Ethnic Sets & Sarees", query: "Fashion&search=Ethnic", icon: "✨" },
        { name: "Casual Shoes & Sneakers", query: "Fashion&search=Shoes", icon: "👟" },
        { name: "Handbags & Backpacks", query: "Fashion&search=Bag", icon: "👜" }
      ],
      brands: [
        { name: "Nike", brandQuery: "Nike", count: "Dri-FIT Sportswear & Shoes", icon: "✔️" },
        { name: "Zara", brandQuery: "Zara", count: "New Season Dresses & Tops", icon: "✨" },
        { name: "Levi's", brandQuery: "Levi's", count: "511 Slim Fit & Denim", icon: "👖" },
        { name: "Adidas", brandQuery: "Adidas", count: "Sneakers & Tracksuits", icon: "👟" },
        { name: "Puma", brandQuery: "Puma", count: "Motorsport & Running", icon: "🐆" },
        { name: "Tommy Hilfiger", brandQuery: "Tommy Hilfiger", count: "Polos & Outerwear", icon: "🚩" },
        { name: "Manyavar", brandQuery: "Manyavar", count: "Royal Kurta Sets & Ethnic", icon: "👑" },
        { name: "Biba", brandQuery: "Biba", count: "Kurtis & Anarkalis", icon: "🌸" }
      ],
      priceSegments: [
        { label: "Under ₹999", url: "/products?category=Fashion&price=under-10k" },
        { label: "₹1,000 – ₹2,500", url: "/products?category=Fashion" },
        { label: "₹2,500 – ₹5,000", url: "/products?category=Fashion" },
        { label: "Designer 50% Off", url: "/products?category=Fashion" }
      ]
    },
    electronics: {
      title: "Smart Technology & Electronics",
      badge: "Latest Gadgets",
      icon: "💻",
      categoryQuery: "Smart Technology",
      subcategories: [
        { name: "Smartwatches & Bands", query: "Smart%20Technology&search=Watch", icon: "⌚" },
        { name: "Noise Cancelling Earbuds", query: "Smart%20Technology&search=Earbuds", icon: "🎧" },
        { name: "Smart Home & Cameras", query: "Smart%20Technology&search=Camera", icon: "📹" },
        { name: "Bluetooth Speakers", query: "TV%20%26%20Audio&search=Speaker", icon: "🔊" },
        { name: "Laptops & iPads", query: "Computers%20%26%20Tablets", icon: "💻" }
      ],
      brands: [
        { name: "Apple", brandQuery: "Apple", count: "Apple Watch & AirPods", icon: "🍏" },
        { name: "Samsung", brandQuery: "Samsung", count: "Galaxy Watch & Buds", icon: "🌌" },
        { name: "boAt", brandQuery: "boAt", count: "Airdopes & Wave Watches", icon: "⛵" },
        { name: "Noise", brandQuery: "Noise", count: "ColorFit Smartwatches", icon: "⚡" },
        { name: "Sony", brandQuery: "Sony", count: "WH-1000XM5 Studio Audio", icon: "🎵" },
        { name: "JBL", brandQuery: "JBL", count: "PartyBox & Flip Speakers", icon: "🔊" }
      ],
      priceSegments: [
        { label: "Budget Under ₹2,000", url: "/products?category=Smart%20Technology" },
        { label: "₹2,000 – ₹5,000", url: "/products?category=Smart%20Technology" },
        { label: "₹5,000 – ₹15,000", url: "/products?category=Smart%20Technology" },
        { label: "Flagship Audio ₹15,000+", url: "/products?category=Smart%20Technology" }
      ]
    },
    jewellery: {
      title: "Certified Jewellery & Precious Metals",
      badge: "BIS 916 Hallmarked",
      icon: "💎",
      categoryQuery: "Jewellery",
      subcategories: [
        { name: "22K BIS Gold Jewellery", query: "Jewellery&search=Gold", icon: "🏆" },
        { name: "Solitaire Diamond Rings", query: "Jewellery&search=Diamond", icon: "💎" },
        { name: "925 Sterling Silver", query: "Jewellery&search=Silver", icon: "✨" },
        { name: "Necklace Sets & Chokers", query: "Jewellery&search=Necklace", icon: "📿" },
        { name: "Bangles & Kadas", query: "Jewellery&search=Bangle", icon: "💫" },
        { name: "Earrings & Jhumkas", query: "Jewellery&search=Earring", icon: "👂" }
      ],
      brands: [
        { name: "Tanishq", brandQuery: "Tanishq", count: "Certified Pure Gold", icon: "👑" },
        { name: "Kalyan Jewellers", brandQuery: "Kalyan", count: "Traditional Heritage", icon: "✨" },
        { name: "Malabar Gold", brandQuery: "Malabar", count: "BIS 916 Hallmarked", icon: "🏆" },
        { name: "Giva", brandQuery: "Giva", count: "925 Pure Silver", icon: "💍" }
      ],
      priceSegments: [
        { label: "Silver Under ₹2,999", url: "/products?category=Jewellery" },
        { label: "Light Gold & Coins", url: "/products?category=Jewellery" },
        { label: "Bridal Jewellery Sets", url: "/products?category=Jewellery" }
      ]
    },
    ev: {
      title: "Electric Vehicles & Scooters",
      badge: "Zero Emission",
      icon: "⚡",
      categoryQuery: "EV Vehicles",
      subcategories: [
        { name: "Electric Scooters (High Range)", query: "EV%20Vehicles&search=Scooter", icon: "🛵" },
        { name: "Smart Electric Bikes", query: "EV%20Vehicles&search=Bike", icon: "🏍️" },
        { name: "Fast Home Chargers (3.3kW)", query: "EV%20Vehicles&search=Charger", icon: "⚡" },
        { name: "Helmets & Riding Gear", query: "EV%20Vehicles&search=Gear", icon: "🪖" }
      ],
      brands: [
        { name: "Ola Electric", brandQuery: "Ola", count: "S1 Pro & S1 Air (195km)", icon: "⚡" },
        { name: "Ather Energy", brandQuery: "Ather", count: "450X & 450S Gen 3", icon: "🚀" },
        { name: "TVS iQube", brandQuery: "TVS", count: "SmartXonnect 140km", icon: "🛵" },
        { name: "Bajaj Chetak", brandQuery: "Bajaj", count: "Premium Solid Metal", icon: "🛡️" }
      ],
      priceSegments: [
        { label: "Entry EV Under ₹80,000", url: "/products?category=EV%20Vehicles" },
        { label: "Long Range 150km+", url: "/products?category=EV%20Vehicles" },
        { label: "Pro Performance & Fast Charge", url: "/products?category=EV%20Vehicles" }
      ]
    },
    refurbished: {
      title: "Certified Refurbished & Pre-Owned Mobiles",
      badge: "32-Point Quality Tested",
      icon: "♻️",
      categoryQuery: "Old / Refurbished Mobiles",
      subcategories: [
        { name: "Superb Grade A+ (Like New)", query: "Old%20%2F%20Refurbished%20Mobiles&search=Superb", icon: "✨" },
        { name: "Refurbished Apple iPhones", query: "Old%20%2F%20Refurbished%20Mobiles&search=iPhone", icon: "🍏" },
        { name: "Refurbished Samsung Flagships", query: "Old%20%2F%20Refurbished%20Mobiles&search=Samsung", icon: "🌌" },
        { name: "Refurbished OnePlus & 5G", query: "Old%20%2F%20Refurbished%20Mobiles&search=OnePlus", icon: "🔴" }
      ],
      brands: [
        { name: "Apple (iPhones)", brandQuery: "Apple", count: "iPhone 15, 14, 13 Pro Max", icon: "🍏" },
        { name: "Samsung Galaxy", brandQuery: "Samsung", count: "S24 Ultra, S23, Z Flip", icon: "🌌" },
        { name: "OnePlus", brandQuery: "OnePlus", count: "OnePlus 11, 10 Pro, Nord", icon: "🔴" },
        { name: "Google Pixel", brandQuery: "Google", count: "Pixel 8 Pro, 7a", icon: "🔘" }
      ],
      priceSegments: [
        { label: "Under ₹15,000", url: "/products?category=Old%20%2F%20Refurbished%20Mobiles" },
        { label: "₹15,000 – ₹35,000", url: "/products?category=Old%20%2F%20Refurbished%20Mobiles" },
        { label: "Flagship Refurbished ₹35,000+", url: "/products?category=Old%20%2F%20Refurbished%20Mobiles" }
      ]
    },
    laptops: {
      title: "Computers, Laptops & Tablets",
      badge: "High Performance",
      icon: "🖥️",
      categoryQuery: "Computers & Tablets",
      subcategories: [
        { name: "High Performance Laptops", query: "Computers%20%26%20Tablets&search=Laptop", icon: "💻" },
        { name: "Apple MacBooks & iPads", query: "Computers%20%26%20Tablets&search=Apple", icon: "🍏" },
        { name: "Gaming Laptops (RTX Series)", query: "Computers%20%26%20Tablets&search=Gaming", icon: "🎮" },
        { name: "Monitors & SSD Storage", query: "Computers%20%26%20Tablets&search=Monitor", icon: "🖥️" }
      ],
      brands: [
        { name: "Apple MacBook", brandQuery: "Apple", count: "M3 / M2 Pro & Air", icon: "🍏" },
        { name: "Lenovo", brandQuery: "Lenovo", count: "ThinkPad & Legion Gaming", icon: "💻" },
        { name: "HP", brandQuery: "HP", count: "Pavilion & Omen Series", icon: "🖥️" },
        { name: "Dell", brandQuery: "Dell", count: "XPS & Inspiron Series", icon: "💾" }
      ],
      priceSegments: [
        { label: "Students Under ₹35,000", url: "/products?category=Computers%20%26%20Tablets" },
        { label: "Work & Coding ₹35k - ₹75k", url: "/products?category=Computers%20%26%20Tablets" },
        { label: "MacBook & Pro Gaming ₹75k+", url: "/products?category=Computers%20%26%20Tablets" }
      ]
    },
    accessories: {
      title: "Mobile Accessories & Fast Charging",
      badge: "100% Genuine",
      icon: "🔌",
      categoryQuery: "Mobile Accessories",
      subcategories: [
        { name: "Fast Chargers (65W GaN & 120W)", query: "Mobile%20Accessories&search=Charger", icon: "⚡" },
        { name: "MagSafe Wireless Chargers", query: "Mobile%20Accessories&search=MagSafe", icon: "🧲" },
        { name: "Armor & Silicon Cases", query: "Mobile%20Accessories&search=Case", icon: "🛡️" },
        { name: "9H Edge-to-Edge Glass", query: "Mobile%20Accessories&search=Glass", icon: "💎" },
        { name: "Braided Fast Type-C Cables", query: "Mobile%20Accessories&search=Cable", icon: "🔌" },
        { name: "Power Banks (20000mAh)", query: "Mobile%20Accessories&search=Power%20Bank", icon: "🔋" }
      ],
      brands: [
        { name: "Anker", brandQuery: "Anker", count: "GaN Prime Chargers", icon: "⚡" },
        { name: "Apple Original", brandQuery: "Apple", count: "20W Adapters & MagSafe", icon: "🍏" },
        { name: "Samsung Original", brandQuery: "Samsung", count: "25W & 45W Fast Charging", icon: "🌌" },
        { name: "Spigen", brandQuery: "Spigen", count: "Armor & Ultra Hybrid", icon: "🛡️" },
        { name: "Portronics", brandQuery: "Portronics", count: "Power Banks & Cables", icon: "🔋" }
      ],
      priceSegments: [
        { label: "Under ₹499", url: "/products?category=Mobile%20Accessories" },
        { label: "₹500 – ₹1,500", url: "/products?category=Mobile%20Accessories" },
        { label: "Premium MagSafe ₹1,500+", url: "/products?category=Mobile%20Accessories" }
      ]
    }
  };

  return (
    <div className="flex flex-col gap-2.5 sm:gap-4 md:gap-5 pb-8 md:pb-12 w-full max-w-full overflow-x-hidden bg-[#f1f3f6]">
      {/* 1. Main Hero Banner Carousel */}
      <Hero />

      {/* 2. DYNAMIC CATEGORY-BY-CATEGORY PRODUCT SHELVES (Flipkart & Amazon Style) */}
      <div className="flex flex-col gap-2.5 sm:gap-4 md:gap-5 mt-0.5">
        {isLoading ? (
          // Loading skeleton placeholder shelves
          [...Array(3)].map((_, i) => (
            <section key={i} className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 md:px-4">
              <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-200/80 p-3 sm:p-4 shadow-xs">
                <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse mb-3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
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
                className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 md:px-4 scroll-mt-20"
                id={`category-${config.id}`}
              >
                <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
                  
                  {/* Attached Top Category Quick-Switch Bar (Seamlessly part of the top box) */}
                  {sectionIdx === 0 && (
                    <div className="border-b border-slate-200/90 bg-slate-50/70 py-2.5 sm:py-3.5 px-3 sm:px-6 relative">
                      <div className="flex items-center justify-start lg:justify-between gap-2.5 sm:gap-4 md:gap-6 overflow-x-auto category-scroll-container no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 px-0.5 scroll-smooth">
                        {TOP_FLIPKART_CATEGORIES.map((cat) => {
                          const isSelected = activeMegaMenu === cat.id;
                          const hasFlyout = Boolean(MEGA_MENU_DATA[cat.id]);

                          return (
                            <div key={cat.id} className="relative flex-shrink-0">
                              <Link
                                href={cat.url}
                                className={`flex flex-col items-center group flex-shrink-0 active:scale-95 transition-all relative pb-0.5 min-w-[62px] sm:min-w-[72px] md:min-w-[80px] cursor-pointer`}
                              >
                                <div className={`w-12 h-12 sm:w-13 sm:h-13 md:w-15 md:h-15 rounded-xl border transition-all flex items-center justify-center text-xl sm:text-2xl md:text-2xl shadow-xs bg-white group-hover:bg-emerald-50 border-slate-200/90 group-hover:border-emerald-500 group-hover:scale-105 group-hover:shadow-md`}>
                                  <span>{cat.icon}</span>
                                </div>

                                <div className="flex items-center gap-1 mt-1">
                                  <span className={`text-[11px] sm:text-xs md:text-sm font-bold text-center transition-colors whitespace-nowrap text-slate-700 group-hover:text-[#2E6F40] group-hover:font-black`}>
                                    {cat.name}
                                  </span>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>

                      {/* Interactive Category Mega Menu Flyout Panel */}
                      {activeMegaMenu && MEGA_MENU_DATA[activeMegaMenu] && (() => {
                        const menu = MEGA_MENU_DATA[activeMegaMenu];

                        return (
                          <div 
                            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-5 sm:p-7 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
                            onMouseLeave={() => setActiveMegaMenu(null)}
                          >
                            {/* Mega Menu Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl p-2 rounded-2xl bg-blue-50 border border-blue-100">{menu.icon}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-base sm:text-lg font-black text-slate-900">{menu.title}</h3>
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                                      {menu.badge}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium">Select a sub-category or popular brand to browse products:</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Link
                                  href={`/products?category=${encodeURIComponent(menu.categoryQuery)}`}
                                  onClick={() => setActiveMegaMenu(null)}
                                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                                >
                                  <span>Browse All {menu.title.split(' ')[0]}</span>
                                  <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => setActiveMegaMenu(null)}
                                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                                  title="Close"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            {/* Mega Menu 2-Column Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Left Column: Sub-Categories */}
                              <div className="lg:col-span-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                                    <span>📑</span>
                                    <span>Popular Sub-Categories</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold">{menu.subcategories.length} Types</span>
                                </div>

                                <div className="space-y-1">
                                  {menu.subcategories.map((sub, sIdx) => (
                                    <Link
                                      key={sIdx}
                                      href={`/products?category=${sub.query}`}
                                      onClick={() => setActiveMegaMenu(null)}
                                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 text-slate-700 hover:text-blue-600 transition-all group"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="text-base">{sub.icon}</span>
                                        <span className="text-xs sm:text-sm font-bold group-hover:translate-x-0.5 transition-transform">{sub.name}</span>
                                      </div>
                                      {sub.badge ? (
                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                          {sub.badge}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </div>

                              {/* Right Column: All Available Brands Grid */}
                              <div className="lg:col-span-8 space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                                    <span>👑</span>
                                    <span>All Available {menu.title.split(' ')[0]} Brands</span>
                                  </span>
                                  <span className="text-xs text-blue-600 font-bold">100% Original Products</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                                  {menu.brands.map((brand, bIdx) => (
                                    <Link
                                      key={bIdx}
                                      href={`/products?category=${encodeURIComponent(menu.categoryQuery)}&brand=${encodeURIComponent(brand.brandQuery)}`}
                                      onClick={() => setActiveMegaMenu(null)}
                                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer ${
                                        brand.highlight 
                                          ? "bg-gradient-to-br from-blue-50/50 via-white to-slate-50 border-blue-200 hover:border-blue-500 hover:shadow-md" 
                                          : "bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-blue-400 hover:shadow-xs"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                          {brand.icon && <span className="text-sm">{brand.icon}</span>}
                                          <span>{brand.name}</span>
                                        </span>
                                        {brand.highlight && (
                                          <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-600 text-white">
                                            Top
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-500 font-medium truncate leading-tight mt-1">{brand.count}</p>
                                      <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-blue-600 pt-1.5 border-t border-slate-100 group-hover:border-blue-100">
                                        <span>View Phones</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                      </div>
                                    </Link>
                                  ))}
                                </div>

                                {/* Price Range Segment Rail */}
                                {menu.priceSegments && menu.priceSegments.length > 0 && (
                                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mr-1">
                                      💵 Filter By Price:
                                    </span>
                                    {menu.priceSegments.map((price, pIdx) => (
                                      <Link
                                        key={pIdx}
                                        href={price.url}
                                        onClick={() => setActiveMegaMenu(null)}
                                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
                                      >
                                        {price.label}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Category Section Header (Compact & Mobile First) */}
                  <div className="p-2.5 sm:p-3.5 md:p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
                    <div className="flex items-center justify-between gap-2">
                      
                      {/* Left Header Title & Badge */}
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-base sm:text-xl flex-shrink-0">
                          {config.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight truncate">
                              {config.name}
                            </h2>
                            <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${config.tagColor} hidden xs:inline-block`}>
                              {config.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right "View All" Button */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Link 
                          href={categoryUrl} 
                          className="bg-secondary text-white font-black px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs shadow-2xs hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
                        >
                          <span>View All ({totalCount})</span>
                          <FontAwesomeIcon icon={faArrowRight} className="text-[8px]" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Product Cards Shelf (Clean 2-card row on mobile, 4-card on desktop) */}
                  <div className="p-2 sm:p-3 bg-slate-50/30">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
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

      {/* 5. The Journey of MY SHOP (Brand Story & Trust) */}
      <section className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 md:px-4 py-2 sm:py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 md:p-8 shadow-xs">
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
      <section className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 md:px-4 py-2 md:py-4">
        <div className="bg-gradient-to-br from-secondary/10 via-emerald-500/5 to-secondary/5 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 flex flex-col lg:flex-row items-center gap-4 md:gap-8 border border-secondary/20 shadow-xs">
          <div className="flex-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-secondary mb-1 block">
              Customer Support &amp; Orders
            </span>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black mb-2 leading-tight text-slate-900">
              Looking for a Specific Model or Bulk Order?
            </h2>
            <p className="text-slate-600 mb-3 text-xs sm:text-sm leading-relaxed">
              Whether you need bulk procurement, exchange valuation, or rare models, our team is ready to assist.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/contact" className="bg-secondary text-white font-black px-4 py-2 rounded-xl shadow-xs hover:opacity-90 transition-all flex items-center gap-1.5 text-xs">
                <span>Contact Specialists</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-100">
              <h3 className="text-sm sm:text-base font-black mb-2.5 text-slate-900">Quick Product Inquiry</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your name"
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 ring-secondary transition-all"
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
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 ring-secondary transition-all"
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
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 ring-secondary resize-none transition-all"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="bg-secondary text-white font-black py-2 rounded-lg shadow-sm hover:opacity-90 transition-all active:scale-[0.98] uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 mt-1"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="text-[10px]" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Verified Customer Reviews */}
      <section className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 md:px-4 py-2 md:py-4">
        <div className="flex items-center justify-between mb-2.5 sm:mb-4">
          <div>
            <h2 className="text-base sm:text-xl font-black flex items-center gap-2 text-slate-900">
              <span className="w-1.5 h-4 bg-secondary rounded-full"></span>
              Verified Buyer Reviews
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 mb-2">
          {reviews.slice(0, 2).map((review) => (
            <div key={review.id} className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="flex gap-1 mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} className={i < review.rating ? "text-amber-400 text-xs" : "text-slate-200 text-xs"} />
                ))}
              </div>
              <p className="text-slate-800 text-xs sm:text-sm font-bold italic leading-snug mb-2">
                "{review.comment}"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-xs">
                  {review.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-xs">{review.customer_name}</p>
                  <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">✓ Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
