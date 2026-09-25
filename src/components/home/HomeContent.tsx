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
  faShieldHalved,
  faTruckFast,
  faArrowsRotate,
  faCreditCard,
  faMobileScreen
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
    if (!url) return "/mobile-logo.png";
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
      customer_name: "Rahul Sharma (Kukatpally, Hyderabad)",
      rating: 5,
      comment: "Bought the iPhone 16 Pro Max from Madur Mobiles. Delivered within 3 hours in Hyderabad with 100% original sealed packaging and official Apple warranty. Best price in town!"
    },
    {
      id: 2,
      customer_name: "Sneha Reddy (Madhapur, Hyderabad)",
      rating: 5,
      comment: "Super smooth phone exchange process for my old Galaxy S21 to Galaxy S25 Ultra with instant bonus discount and 0% No Cost EMI on HDFC card. Highly recommended!"
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
    alert("Thank you for your inquiry! Our smartphone specialist will contact you shortly with the best pricing and exchange offers.");
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

      {/* Trust Badges Bar (Madur Style) */}
      <section className="bg-emerald-50/60 border-y border-emerald-100 py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-xs md:text-sm text-[#182C20]">100% Genuine &amp; Sealed</p>
                <p className="text-[10px] md:text-xs text-gray-500">Official Brand Warranty</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <FontAwesomeIcon icon={faTruckFast} className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-xs md:text-sm text-[#182C20]">Same-Day Dispatch</p>
                <p className="text-[10px] md:text-xs text-gray-500">Express Hyderabad Delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <FontAwesomeIcon icon={faArrowsRotate} className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-xs md:text-sm text-[#182C20]">Instant Exchange</p>
                <p className="text-[10px] md:text-xs text-gray-500">Up to ₹25,000 Trade-In</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <FontAwesomeIcon icon={faCreditCard} className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-xs md:text-sm text-[#182C20]">0% No Cost EMI</p>
                <p className="text-[10px] md:text-xs text-gray-500">All Major Bank Cards</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Smartphones & Devices */}
      <section className="bg-emerald-50/30 pt-4 pb-4 md:py-16">
        <div className="container">
          {/* Mobile Search Bar */}
          <div className="md:hidden mt-1.5 mb-3">
            <form 
              onSubmit={handleSearch}
              className="flex items-center bg-white border border-emerald-300 rounded-xl px-4 py-3 shadow-md"
            >
              <FontAwesomeIcon icon={faSearch} className="text-emerald-700 mr-3 text-sm" />
              <input
                type="text"
                placeholder="Search iPhone, Samsung, Pixel..."
                className="bg-transparent border-none outline-none w-full text-sm text-[#182C20] placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center justify-between mb-4 md:mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 text-[#182C20]">
                <span className="w-2 h-8 bg-emerald-600 rounded-full"></span>
                Trending Flagships &amp; 5G Mobiles
              </h2>
              <p className="text-xs md:text-sm text-gray-500 ml-5 mt-0.5">Explore the latest flagship releases from Apple, Samsung, Pixel and OnePlus</p>
            </div>
            <Link href="/products" className="text-emerald-700 font-bold flex items-center gap-2 hover:underline text-sm md:text-base">
              See All Smartphones <FontAwesomeIcon icon={faArrowRight} size="xs" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 mb-4 md:mb-12">
            {isLoading ? (
                [...Array(8)].map((_, i) => <div key={i} className="h-80 bg-white/50 animate-pulse rounded-3xl"></div>)
            ) : (Array.isArray(products) ? products : []).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex justify-center mt-2">
            <Link 
              href="/products" 
              className="bg-emerald-700 text-white font-bold px-5 py-2.5 md:px-10 md:py-5 text-xs md:text-base rounded-xl md:rounded-2xl shadow-xl hover:bg-emerald-800 transition-all active:scale-95 flex items-center gap-2 md:gap-3 uppercase tracking-wider"
            >
              EXPLORE ALL 5G DEVICES
              <FontAwesomeIcon icon={faArrowRight} className="text-xs md:text-base" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid (Madur Style) */}
      <section className="container">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 text-[#182C20]">
              <span className="w-2 h-8 bg-emerald-600 rounded-full"></span>
              Shop by Smartphone Brand
            </h2>
            <p className="text-xs md:text-sm text-gray-500 ml-5 mt-0.5">Discover flagship smartphones, smartwatches and audio ecosystems</p>
          </div>
          <Link href="/products" className="text-emerald-700 font-bold flex items-center gap-2 hover:underline">
            View All Brands <FontAwesomeIcon icon={faArrowRight} size="xs" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
          {isLoading ? (
            [...Array(8)].map((_, i) => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl"></div>)
          ) : (Array.isArray(categories) ? categories : []).map((cat) => (
            <Link 
              href={`/products?category=${encodeURIComponent(cat.name)}`} 
              key={cat.id}
              className="group flex flex-col bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all text-center overflow-hidden"
            >
              <div className="w-full aspect-[4/3] relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
                {cat.image_url || cat.image ? (
                  <Image 
                    src={normalizeImageUrl(cat.image_url || cat.image)} 
                    alt={cat.name} 
                    fill 
                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <FontAwesomeIcon icon={faBox} className="text-gray-300 text-4xl" />
                  </div>
                )}
              </div>
              <div className="p-3 md:p-4 bg-white border-t border-emerald-50">
                <span className="text-xs md:text-sm font-black text-[#182C20] leading-tight block">
                  {cat.name}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">View Catalog →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flagship Spotlight Section (White & Green Theme) */}
      <section className="container pt-4 pb-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 items-center bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/50 rounded-[2.5rem] p-6 md:p-14 text-[#182C20] overflow-hidden relative shadow-xl border-2 border-emerald-200/80">
          
          {/* Decorative ambient green glows */}
          <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative aspect-square md:aspect-auto md:h-[450px] rounded-2xl overflow-hidden shadow-lg border border-emerald-200/70 bg-white flex items-center justify-center z-10">
            <Image 
              src="/products/iphone-16-pro-max.png"
              alt="Next-Gen Smartphone Technology"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6 drop-shadow-[0_15px_30px_rgba(21,128,61,0.15)]"
            />
            <div className="absolute bottom-4 left-4 p-4 bg-white/95 backdrop-blur-md rounded-xl border border-emerald-200 shadow-md max-w-xs">
              <p className="font-bold text-emerald-800 text-lg mb-1">Official Brand Warranty</p>
              <p className="text-xs text-gray-600 font-medium">Equipped with Apple A18 Pro &amp; Snapdragon 8 Elite processors.</p>
            </div>
          </div>

          <div className="z-10">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase tracking-wider text-xs px-3.5 py-1.5 rounded-full mb-3 shadow-xs">
              Official Authorized Retailer
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 leading-tight text-slate-900">
              Upgrade to the Future of <span className="text-emerald-700">Mobile Innovation</span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 md:mb-8 font-normal">
              Experience lightning-fast 5G speeds, cutting-edge AI computational photography, and revolutionary battery longevity. Guaranteed genuine with official manufacturer warranty and hassle-free exchange.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 md:mb-8">
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm">
                <h4 className="font-black text-2xl md:text-3xl text-emerald-700 mb-1">0%</h4>
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">No Cost EMI Options</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm">
                <h4 className="font-black text-2xl md:text-3xl text-emerald-700 mb-1">100%</h4>
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Original &amp; Sealed</p>
              </div>
            </div>

            <Link href="/products" className="group bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl shadow-emerald-700/20 transition-all flex items-center gap-3 w-fit text-sm uppercase tracking-wider active:scale-95">
              SHOP FLAGSHIP PHONES
              <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <HomeBanners />

      {/* Inquiry Form Section */}
      <section className="container py-4 md:py-10">
        <div className="bg-emerald-50 rounded-[2rem] p-5 md:p-16 flex flex-col lg:flex-row items-center gap-6 md:gap-12 border border-emerald-200/60">
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2 block">
              Direct Phone Support &amp; Pre-Orders
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4 md:mb-6 leading-tight text-[#182C20]">
              Looking for a Specific Model or Color Variant?
            </h2>
            <p className="text-gray-700 mb-6 md:mb-8 leading-relaxed">
              Whether you need corporate bulk procurement, custom storage configuration pre-orders, or trade-in valuation assistance, our smartphone tech specialists in Hyderabad are here to help.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-emerald-800 transition-all flex items-center gap-3 text-sm uppercase tracking-wider">
                TALK TO MOBILE SPECIALISTS
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-emerald-100">
              <h3 className="text-2xl font-black mb-6 text-[#182C20]">Quick Mobile Inquiry</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 text-[#182C20]">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your name"
                    className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4 text-sm outline-none focus:ring-2 ring-emerald-600 transition-all"
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
                    className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4 text-sm outline-none focus:ring-2 ring-emerald-600 transition-all"
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
                    className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4 text-sm outline-none focus:ring-2 ring-emerald-600 resize-none transition-all"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-emerald-800 transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2"
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
            <h2 className="text-2xl font-black flex items-center gap-3 text-[#182C20]">
              <span className="w-2 h-8 bg-emerald-600 rounded-full"></span>
              Verified Customer Reviews
            </h2>
            <p className="text-xs text-gray-500 ml-5 mt-0.5">Real feedback from satisfied smartphone shoppers across Hyderabad</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-6xl text-emerald-700" />
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} className={i < review.rating ? "text-amber-400 text-sm" : "text-gray-100 text-sm"} />
                ))}
              </div>
              <p className="text-[#182C20] text-base md:text-lg font-medium italic leading-relaxed mb-6">
                "{review.comment}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                  {review.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[#182C20]">{review.customer_name}</p>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">✓ Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
