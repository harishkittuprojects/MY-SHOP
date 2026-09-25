"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StreamingTagline() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Link 
      href="/products"
      className={`block bg-emerald-950 hover:bg-emerald-900 text-white overflow-hidden whitespace-nowrap transition-colors ${isHome ? "py-1.5" : "py-1"}`}
    >
      <div className="flex items-center">
        <div className="animate-marquee inline-block">
          <span className="px-6 text-xs font-bold uppercase tracking-wider text-emerald-100">
            🔥 MEGA FLAGSHIP FESTIVAL: Flat ₹5,000 Instant Bank Discount on iPhone 16 &amp; Galaxy S25 Series | 0% No Cost EMI! 📱
          </span>
          <span className="px-6 text-xs font-bold uppercase tracking-wider text-amber-300">
            ⚡ Same-Day Express Delivery Across Hyderabad • 100% Brand Sealed Units with Official Manufacturer Warranty 🛡️
          </span>
          <span className="px-6 text-xs font-bold uppercase tracking-wider text-emerald-100">
            🔄 Get Up to ₹25,000 Instant Exchange Bonus on Your Old Smartphone • Doorstep Pickup 🚀
          </span>
          <span className="px-6 text-xs font-bold uppercase tracking-wider text-amber-300">
            💬 WhatsApp for Exclusive Smartphone Deals &amp; Price Matching: +91 7416750834 📲
          </span>
        </div>
      </div>
    </Link>
  );
}
