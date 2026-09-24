"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  // Don't show bottom nav inside admin panel
  if (pathname?.startsWith("/admin")) return null;

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Shop",
      href: "/products",
      icon: ShoppingBag,
      isActive: pathname === "/products",
    },
    {
      label: "Categories",
      href: "/categories",
      icon: LayoutGrid,
      isActive: pathname === "/categories",
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      isActive: pathname === "/cart",
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      label: "Account",
      href: "/account",
      icon: User,
      isActive: pathname === "/account" || pathname === "/login",
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden safe-area-bottom"
    >
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 select-none ${
                active ? "text-secondary font-bold" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${active ? "font-bold text-secondary" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
