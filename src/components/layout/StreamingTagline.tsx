"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StreamingTagline() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Link 
      href="/products"
      className={`block bg-slate-900 hover:bg-slate-800 text-white overflow-hidden whitespace-nowrap transition-colors ${isHome ? "py-1.5" : "py-1"}`}
    >
      <div className="flex items-center">
        <div className="animate-marquee inline-block">
          <span className="px-6 text-xs font-black uppercase tracking-wider text-white">
            🔥 FESTIVE MOBILE CARNIVAL: Flat ₹5,000 Instant Bank Discount on iPhone 16 &amp; Galaxy S25 Series | 0% No Cost EMI Available! 📱
          </span>
          <span className="px-6 text-xs font-black uppercase tracking-wider text-amber-300">
            ⚡ Free 1-Day Express Delivery | 100% Genuine Sealed Products with 1-Year Official Manufacturer Warranty 🛡️
          </span>
          <span className="px-6 text-xs font-black uppercase tracking-wider text-white">
            🔥 FESTIVE MOBILE CARNIVAL: Flat ₹5,000 Instant Bank Discount on iPhone 16 &amp; Galaxy S25 Series | 0% No Cost EMI Available! 📱
          </span>
          <span className="px-6 text-xs font-black uppercase tracking-wider text-amber-300">
            ⚡ Free 1-Day Express Delivery | 100% Genuine Sealed Products with 1-Year Official Manufacturer Warranty 🛡️
          </span>
        </div>
      </div>
    </Link>
  );
}
