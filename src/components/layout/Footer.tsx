"use client";

import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faWhatsapp, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faMapMarkerAlt, faPhoneAlt, faMobileAlt } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-200 pt-10 md:pt-16 pb-8 border-t border-slate-800 mt-6 md:mt-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-start">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg">
                <Image 
                  src="/my-shop-logo.png" 
                  alt="My Shop Logo" 
                  width={44} 
                  height={44} 
                  className="object-contain" 
                />
              </div>
              <span className="text-2xl font-black tracking-wider text-white">
                MY SHOP
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your premier destination for the latest flagship smartphones, genuine accessories, smartwatches, and next-generation 5G devices with official brand warranty.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://wa.me/919999999999" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800 text-green-400 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-md active:scale-95"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-800 text-pink-400 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all shadow-md active:scale-95"
              >
                <FontAwesomeIcon icon={faInstagram} className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white text-base uppercase tracking-wider">Quick Navigation</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-amber-400 transition-colors">All Smartphones &amp; Devices</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-amber-400 transition-colors">Brands &amp; Categories</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-amber-400 transition-colors">About Our Store</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-amber-400 transition-colors">Customer Support</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4 text-white text-base uppercase tracking-wider">Mobile Brands</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/products?category=Apple%20iPhone" className="text-gray-400 hover:text-amber-400 transition-colors">Apple iPhone</Link></li>
              <li><Link href="/products?category=Samsung%20Galaxy" className="text-gray-400 hover:text-amber-400 transition-colors">Samsung Galaxy</Link></li>
              <li><Link href="/products?category=Google%20Pixel" className="text-gray-400 hover:text-amber-400 transition-colors">Google Pixel</Link></li>
              <li><Link href="/products?category=OnePlus" className="text-gray-400 hover:text-amber-400 transition-colors">OnePlus 5G</Link></li>
              <li><Link href="/products?category=Xiaomi%20%26%20Redmi" className="text-gray-400 hover:text-amber-400 transition-colors">Xiaomi &amp; Redmi</Link></li>
              <li><Link href="/products?category=Vivo%20%26%20iQOO" className="text-gray-400 hover:text-amber-400 transition-colors">Vivo &amp; iQOO</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4 text-white text-base uppercase tracking-wider">Store &amp; Support</h4>
            <ul className="flex flex-col gap-3.5 text-sm">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 text-amber-400" />
                <span>Express Tech Hub, Store No. 42, Tech City</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FontAwesomeIcon icon={faPhoneAlt} className="text-amber-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FontAwesomeIcon icon={faEnvelope} className="text-amber-400" />
                <span>support@myshopmobiles.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FontAwesomeIcon icon={faWhatsapp} className="text-green-400 text-lg" />
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="text-green-400 font-medium hover:underline">
                  Chat on WhatsApp for Deals
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} My Shop Mobiles. All rights reserved. 100% Genuine Certified Devices.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 transition-colors text-xs">Terms &amp; Warranty Policy</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors text-xs">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
