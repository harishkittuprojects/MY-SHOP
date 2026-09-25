"use client";

import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import BottomNavigation from "@/components/layout/BottomNavigation";
import CartToast from "@/components/common/CartToast";
import { usePathname } from "next/navigation";
import { SubscriptionProvider } from "@/context/SubscriptionContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <CartProvider>
        <main className="min-h-screen bg-accent/30">
          {children}
        </main>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <SubscriptionProvider>
        <div className="animate-in fade-in duration-300">
          <Navbar />
          <CartToast />
          <main className="min-h-screen pb-24 md:pb-0 pt-[90px] sm:pt-[98px] md:pt-[108px]">
            {children}
          </main>
          <Footer />
          <BottomNavigation />
          <WhatsAppButton />
        </div>
      </SubscriptionProvider>
    </CartProvider>
  );
}
