"use client";

import Link from "next/link";
import Image from "next/image";

interface CardTile {
  title: string;
  image: string;
  href: string;
  badge?: string;
}

interface MatrixCard {
  id: string;
  heading: string;
  ctaText: string;
  ctaHref: string;
  tiles: [CardTile, CardTile, CardTile, CardTile];
}

const MATRIX_CARDS_ROW_1: MatrixCard[] = [
  {
    id: "flagship-phones",
    heading: "Latest 5G Flagship Smartphones",
    ctaText: "See all 5G Mobiles",
    ctaHref: "/products?category=Mobiles",
    tiles: [
      {
        title: "Galaxy S26 Ultra",
        image: "/products/samsung-galaxy-s26-ultra.jpg",
        href: "/products/samsung-s26-ultra",
        badge: "New"
      },
      {
        title: "iPhone 16 Pro Max",
        image: "/products/iphone-16-pro-max.png",
        href: "/products/iphone-16-pro-max",
        badge: "Pro"
      },
      {
        title: "Google Pixel 9 Pro",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=400",
        href: "/products/google-pixel-9-pro-xl",
        badge: "AI"
      },
      {
        title: "OnePlus 13 5G",
        image: "/products/oneplus-13-black.png",
        href: "/products/oneplus-13-5g",
        badge: "5G"
      }
    ]
  },
  {
    id: "mobile-accessories",
    heading: "Essential Mobile Accessories",
    ctaText: "Shop all Accessories",
    ctaHref: "/products?category=Mobile%20Accessories",
    tiles: [
      {
        title: "Fast Chargers",
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Mobile%20Accessories"
      },
      {
        title: "Power Banks",
        image: "https://images.unsplash.com/photo-1609592424357-6c243859600e?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Mobile%20Accessories"
      },
      {
        title: "Cases & Covers",
        image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Mobile%20Accessories"
      },
      {
        title: "Tempered Glass",
        image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Mobile%20Accessories"
      }
    ]
  },
  {
    id: "refurbished-mobiles",
    heading: "Certified Refurbished & Open-Box",
    ctaText: "See Refurbished Deals",
    ctaHref: "/products?category=Old%20%2F%20Refurbished%20Mobiles",
    tiles: [
      {
        title: "iPhone 15 Pro",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Old%20%2F%20Refurbished%20Mobiles"
      },
      {
        title: "Galaxy S24 Ultra",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Old%20%2F%20Refurbished%20Mobiles"
      },
      {
        title: "Pixel 8 Pro",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Old%20%2F%20Refurbished%20Mobiles"
      },
      {
        title: "OnePlus 12",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Old%20%2F%20Refurbished%20Mobiles"
      }
    ]
  },
  {
    id: "top-brands",
    heading: "Shop by Top Smartphone Brands",
    ctaText: "Browse all Brands",
    ctaHref: "/products",
    tiles: [
      {
        title: "Samsung Galaxy",
        image: "/products/samsung-galaxy-s26-ultra.jpg",
        href: "/products?brand=Samsung"
      },
      {
        title: "Apple iPhone",
        image: "/products/iphone-16-pro-max.png",
        href: "/products?brand=Apple"
      },
      {
        title: "OnePlus 5G",
        image: "/products/oneplus-13-black.png",
        href: "/products?brand=OnePlus"
      },
      {
        title: "Google Pixel",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=400",
        href: "/products?brand=Google"
      }
    ]
  }
];

const MATRIX_CARDS_ROW_2: MatrixCard[] = [
  {
    id: "audio-wearables",
    heading: "Smart Audio & Wearables",
    ctaText: "Explore Audio & Gadgets",
    ctaHref: "/products?category=TV%20%26%20Audio",
    tiles: [
      {
        title: "Wireless Earbuds",
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=TV%20%26%20Audio"
      },
      {
        title: "Noise Cancelling",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=TV%20%26%20Audio"
      },
      {
        title: "Smartwatches",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=TV%20%26%20Audio"
      },
      {
        title: "Party Speakers",
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=TV%20%26%20Audio"
      }
    ]
  },
  {
    id: "repair-services",
    heading: "Screen & Mobile Repair Services",
    ctaText: "Book Doorstep Repair",
    ctaHref: "/services/display-replacement",
    tiles: [
      {
        title: "OLED Screen Fix",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
        href: "/services/display-replacement"
      },
      {
        title: "Battery Health Fix",
        image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=400",
        href: "/services/display-replacement"
      },
      {
        title: "Chip Repair",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
        href: "/services/display-replacement"
      },
      {
        title: "Back Glass Fix",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=400",
        href: "/services/display-replacement"
      }
    ]
  },
  {
    id: "fashion-jewellery",
    heading: "Fashion & Lifestyle Jewellery",
    ctaText: "View Fashion Store",
    ctaHref: "/products?category=Fashion%20%26%20Jewellery",
    tiles: [
      {
        title: "Gold Jewellery",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Fashion%20%26%20Jewellery"
      },
      {
        title: "Diamond Rings",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Fashion%20%26%20Jewellery"
      },
      {
        title: "Luxury Watches",
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Fashion%20%26%20Jewellery"
      },
      {
        title: "Silver Bracelets",
        image: "https://images.unsplash.com/photo-1611591475152-478d133383ae?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=Fashion%20%26%20Jewellery"
      }
    ]
  },
  {
    id: "ev-vehicles",
    heading: "EV Vehicles & Smart Mobility",
    ctaText: "Explore EV Mobility",
    ctaHref: "/products?category=EV%20Vehicles",
    tiles: [
      {
        title: "Electric Scooters",
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=EV%20Vehicles"
      },
      {
        title: "Electric Bikes",
        image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=EV%20Vehicles"
      },
      {
        title: "Fast EV Chargers",
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=EV%20Vehicles"
      },
      {
        title: "EV Accessories",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=400",
        href: "/products?category=EV%20Vehicles"
      }
    ]
  }
];

export default function HomeCardMatrix() {
  const renderCard = (card: MatrixCard) => (
    <div
      key={card.id}
      className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between h-full"
    >
      {/* 1. Section Heading */}
      <div>
        <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight leading-snug mb-3.5 line-clamp-2">
          {card.heading}
        </h3>

        {/* 2. 2 × 2 Image Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3.5">
          {card.tiles.map((tile, idx) => (
            <Link
              key={`${card.id}-${idx}`}
              href={tile.href}
              className="group flex flex-col active:scale-95 transition-transform"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group-hover:border-secondary transition-colors p-2 flex items-center justify-center">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
                  unoptimized
                />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-secondary line-clamp-1 mt-1.5 transition-colors">
                {tile.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Bottom CTA Link */}
      <Link
        href={card.ctaHref}
        className="text-xs font-bold text-secondary hover:text-[#1e4620] hover:underline flex items-center gap-1 mt-auto pt-2"
      >
        <span>{card.ctaText}</span>
        <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    </div>
  );

  return (
    <section className="container py-2 sm:py-4 md:py-6 space-y-4 sm:space-y-6">
      {/* Row 1: 4 Structured Boxed Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {MATRIX_CARDS_ROW_1.map(renderCard)}
      </div>

      {/* Row 2: 4 Structured Boxed Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {MATRIX_CARDS_ROW_2.map(renderCard)}
      </div>
    </section>
  );
}
