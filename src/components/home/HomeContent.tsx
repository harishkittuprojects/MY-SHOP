"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, 
  faArrowRight, 
  faPaperPlane, 
  faBox, 
  faQuoteLeft, 
  faStar,
  faShieldAlt,
  faTruckFast,
  faSyncAlt,
  faCreditCard
} from "@fortawesome/free-solid-svg-icons";
import ProductCard from "@/components/common/ProductCard";
import HomeBanners from "@/components/home/HomeBanners";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/home/Hero";
import { useRouter } from "next/navigation";

export default function HomeContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
          fetch("/api/productList?limit=12", { signal: controller.signal, cache: "no-store", headers: { "Accept": "application/json" } })
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col gap-0 md:gap-12 pb-0 md:pb-20">
      <Hero />

      {/* Quick Brand Categories Rail (Top Categories Section) */}
      <section className="bg-white border-b border-gray-100 py-3 sm:py-4 md:py-6 shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between mb-2 md:mb-4 px-1">
            <h2 className="text-base sm:text-xl md:text-2xl font-black flex items-center gap-2 md:gap-3 text-slate-900 tracking-tight">
              <span className="w-1.5 sm:w-2 h-5 sm:h-7 bg-secondary rounded-full"></span>
              Top Brands &amp; Categories
            </h2>
            <Link 
              href="/categories" 
              className="text-xs sm:text-sm font-bold text-secondary hover:underline flex items-center gap-1.5"
            >
              All Categories <FontAwesomeIcon icon={faArrowRight} size="xs" />
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 group flex-shrink-0 active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-slate-50 border border-gray-200/80 group-hover:border-secondary group-hover:shadow-md transition-all p-2 flex items-center justify-center overflow-hidden relative shadow-sm">
                  {cat.image_url || cat.image ? (
                    <Image
                      src={normalizeImageUrl(cat.image_url || cat.image)}
                      alt={cat.name}
                      fill
                      className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 80px, 96px"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faBox} className="text-gray-300 text-2xl" />
                  )}
                </div>
                <span className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 text-center max-w-[72px] sm:max-w-[88px] leading-tight line-clamp-1 group-hover:text-secondary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Products - Exact Madur.in layout */}
      <section className="bg-secondary/5 pt-2 pb-2 md:py-16">
        <div className="container">
          {/* Mobile Search Bar */}
          <div className="md:hidden mt-1.5 mb-3">
            <form 
              onSubmit={handleSearch}
              className="flex items-center bg-white border border-secondary/20 rounded-xl px-4 py-3 shadow-md"
            >
              <FontAwesomeIcon icon={faSearch} className="text-secondary mr-3 text-sm" />
              <input
                type="text"
                placeholder="Search iPhone, Samsung, Pixel..."
                className="bg-transparent border-none outline-none w-full text-sm text-[#222222] placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center justify-between mb-2 md:mb-10">
            <h2 className="text-2xl font-black flex items-center gap-3 text-[#222222]">
              <span className="w-2 h-8 bg-secondary rounded-full"></span>
              Popular Products
            </h2>
            <Link href="/products" className="text-secondary font-bold flex items-center gap-2 hover:underline text-sm md:text-base">
              See all Products <FontAwesomeIcon icon={faArrowRight} size="xs" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 mb-3 md:mb-12">
            {isLoading ? (
                [...Array(4)].map((_, i) => <div key={i} className="h-80 bg-white/50 animate-pulse rounded-3xl"></div>)
            ) : (Array.isArray(products) ? products : []).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex justify-center mt-2">
            <Link 
              href="/products" 
              className="bg-secondary text-secondary-foreground font-black px-5 py-2.5 md:px-10 md:py-5 text-xs md:text-base rounded-xl md:rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 md:gap-3"
            >
              VIEW ALL PRODUCTS
              <FontAwesomeIcon icon={faArrowRight} className="text-xs md:text-base" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid - Exact Madur.in layout */}
      <section className="container">
        <div className="flex items-center justify-between mb-2 md:mb-8">
          <h2 className="text-2xl font-black flex items-center gap-3 text-[#222222]">
            <span className="w-2 h-8 bg-secondary rounded-full"></span>
            Shop by Category
          </h2>
          <Link href="/categories" className="text-secondary font-bold flex items-center gap-2 hover:underline">
            View All <FontAwesomeIcon icon={faArrowRight} size="xs" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {isLoading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl"></div>)
          ) : (Array.isArray(categories) ? categories : []).map((cat) => (
            <Link 
              href={`/products?category=${encodeURIComponent(cat.name)}`} 
              key={cat.id}
              className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-secondary transition-all text-center overflow-hidden"
            >
              <div className="w-full aspect-[4/3] relative overflow-hidden bg-gray-50">
                {cat.image_url || cat.image ? (
                  <Image 
                    src={normalizeImageUrl(cat.image_url || cat.image)} 
                    alt={cat.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FontAwesomeIcon icon={faBox} className="text-gray-200 text-4xl" />
                  </div>
                )}
              </div>
              <div className="p-3 md:p-4 bg-white border-t border-gray-50">
                <span className="text-xs md:text-sm font-black text-[#222222] leading-tight block">
                  {cat.name}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">View Catalog →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* The Journey Section - Exact Madur.in layout */}
      <section className="container py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="relative aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-gray-100">
            <Image 
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1200" 
              alt="The Journey of MY SHOP" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <p className="font-black text-secondary text-xl mb-1">Quality First</p>
              <p className="text-xs text-[#222222] font-bold">100% Genuine smartphones with official brand warranty.</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-8 leading-tight text-[#222222]">
              The Journey of <span className="text-secondary">MY SHOP</span>
            </h2>
            <p className="text-[#222222] text-lg leading-relaxed mb-4 md:mb-8">
              My Shop is born out of a passion for genuine technology and seamless connectivity. We bring the latest flagship and 5G smartphones directly to your doorstep with guaranteed official warranty and express delivery.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 md:mb-10">
              <div className="bg-accent p-6 rounded-2xl border-l-4 border-secondary shadow-sm">
                <h4 className="font-black text-3xl text-secondary mb-1">100%</h4>
                <p className="text-xs font-bold text-[#222222] uppercase tracking-wider">Original &amp; Sealed</p>
              </div>
              <div className="bg-accent p-6 rounded-2xl border-l-4 border-secondary shadow-sm">
                <h4 className="font-black text-3xl text-secondary mb-1">Express</h4>
                <p className="text-xs font-bold text-[#222222] uppercase tracking-wider">Doorstep Delivery</p>
              </div>
            </div>

            <Link href="/about" className="group bg-secondary text-secondary-foreground font-black px-10 py-5 rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center gap-3 w-fit">
              READ FULL STORY
              <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <HomeBanners />

      {/* Inquiry Form Section */}
      <section className="container py-4 md:py-10">
        <div className="bg-secondary/10 rounded-[2rem] p-5 md:p-16 flex flex-col lg:flex-row items-center gap-6 md:gap-12">
          <div className="flex-1">
            <span className="text-xs font-black uppercase tracking-widest text-secondary mb-2 block">
              Direct Phone Support &amp; Pre-Orders
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4 md:mb-6 leading-tight text-[#222222]">
              Looking for a Specific Model or Custom Configuration?
            </h2>
            <p className="text-[#222222] mb-6 md:mb-8 leading-relaxed">
              Whether you need corporate bulk mobile procurement, custom color pre-orders, or trade-in valuation assistance, our mobile tech specialists are here to help you get the best deal.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="bg-secondary text-secondary-foreground font-black px-8 py-4 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center gap-3">
                CONTACT PHONE EXPERTS
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-white/50">
              <h3 className="text-2xl font-black mb-6 text-[#222222]">Quick Phone Inquiry</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 text-[#222222]">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your name"
                    className="bg-accent/50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 ring-primary transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1 text-gray-800">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="Enter 10-digit mobile number"
                    className="bg-accent/50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 ring-primary transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1 text-gray-800">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Model / Inquiries</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="e.g. Inquiring about iPhone 16 Pro 256GB Desert Titanium stock & exchange offer"
                    className="bg-accent/50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 ring-primary resize-none transition-all"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="bg-secondary text-white font-black py-4 rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  SUBMIT INQUIRY
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="container py-4 md:py-8">
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3 text-[#222222]">
              <span className="w-2 h-8 bg-secondary rounded-full"></span>
              Verified Buyer Reviews
            </h2>
            <p className="text-xs text-gray-500 ml-5 mt-0.5">Real feedback from satisfied gadget shoppers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-6xl text-secondary" />
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} className={i < review.rating ? "text-yellow-400 text-sm" : "text-gray-100 text-sm"} />
                ))}
              </div>
              <p className="text-[#222222] text-lg font-bold italic leading-relaxed mb-6">
                "{review.comment}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black">
                  {review.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-[#222222]">{review.customer_name}</p>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">✓ Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
