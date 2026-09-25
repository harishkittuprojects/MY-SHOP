"use client";

import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faMapMarkerAlt, faPhoneAlt, faMobileScreen } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-100 pt-10 md:pt-16 pb-8 border-t border-emerald-900 mt-6 md:mt-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-start">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 text-2xl font-black tracking-wider text-white">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-900 p-0.5 border border-emerald-500/40">
                <Image 
                  src="/mobile-logo.png" 
                  alt="Madur Mobiles Logo" 
                  fill 
                  className="object-cover" 
                />
              </div>
              <span>MADUR <span className="text-amber-400 font-extrabold text-xs uppercase px-2 py-0.5 rounded bg-emerald-900 border border-emerald-700">Mobiles</span></span>
            </Link>
            <p className="text-emerald-200/80 text-sm leading-relaxed mb-6 font-normal">
              Your premier destination for certified brand-new flagship smartphones, genuine accessories, smartwatches, and next-generation 5G devices with official brand warranty.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://wa.me/917416750834" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-emerald-900 text-green-400 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-md active:scale-95 border border-emerald-700"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-emerald-900 text-pink-400 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all shadow-md active:scale-95 border border-emerald-700"
              >
                <FontAwesomeIcon icon={faInstagram} className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white text-base uppercase tracking-wider">Quick Navigation</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/" className="text-emerald-200/80 hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link href="/products" className="text-emerald-200/80 hover:text-amber-400 transition-colors">All Smartphones &amp; Devices</Link></li>
              <li><Link href="/categories" className="text-emerald-200/80 hover:text-amber-400 transition-colors">Brands &amp; Categories</Link></li>
              <li><Link href="/about" className="text-emerald-200/80 hover:text-amber-400 transition-colors">About Our Store</Link></li>
              <li><Link href="/contact" className="text-emerald-200/80 hover:text-amber-400 transition-colors">Customer Support</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4 text-white text-base uppercase tracking-wider">Mobile Brands</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/products?category=Apple%20iPhone" className="text-emerald-200/80 hover:text-amber-400 transition-colors">Apple iPhone</Link></li>
              <li><Link href="/products?category=Samsung%20Galaxy" className="text-emerald-200/80 hover:text-amber-400 transition-colors">Samsung Galaxy</Link></li>
              <li><Link href="/products?category=Google%20Pixel" className="text-emerald-200/80 hover:text-amber-400 transition-colors">Google Pixel</Link></li>
              <li><Link href="/products?category=OnePlus%20Series" className="text-emerald-200/80 hover:text-amber-400 transition-colors">OnePlus 5G</Link></li>
              <li><Link href="/products?category=Smartwatches" className="text-emerald-200/80 hover:text-amber-400 transition-colors">Smartwatches &amp; Wearables</Link></li>
              <li><Link href="/products?category=Audio%20%26%20Accessories" className="text-emerald-200/80 hover:text-amber-400 transition-colors">AirPods &amp; Audio</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4 text-white text-base uppercase tracking-wider">Hyderabad Hub &amp; Support</h4>
            <ul className="flex flex-col gap-3.5 text-sm">
              <li className="flex items-start gap-3 text-emerald-200/80 text-sm">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 text-amber-400" />
                <span>11/65, Kukatpally, Hyderabad, Telangana, India</span>
              </li>
              <li className="flex items-center gap-3 text-emerald-200/80 text-sm">
                <FontAwesomeIcon icon={faPhoneAlt} className="text-amber-400" />
                <span>+91 7416750834</span>
              </li>
              <li className="flex items-center gap-3 text-emerald-200/80 text-sm">
                <FontAwesomeIcon icon={faEnvelope} className="text-amber-400" />
                <span>support@myshopmobiles.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FontAwesomeIcon icon={faWhatsapp} className="text-green-400 text-lg" />
                <a href="https://wa.me/917416750834" target="_blank" rel="noopener noreferrer" className="text-amber-300 font-semibold hover:underline">
                  Chat on WhatsApp for Deals
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-emerald-900/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-emerald-300/60 text-xs">
            © {new Date().getFullYear()} Madur Mobiles. 100% Genuine Certified Devices. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-emerald-300/60 hover:text-white transition-colors text-xs">Terms &amp; Warranty Policy</Link>
            <Link href="/privacy" className="text-emerald-300/60 hover:text-white transition-colors text-xs">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
