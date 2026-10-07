"use client";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import BottomNavigation from "@/components/layout/BottomNavigation";
import CartToast from "@/components/common/CartToast";
import { usePathname } from "next/navigation";
import { SubscriptionProvider } from "@/context/SubscriptionContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <CartProvider>
        <WishlistProvider>
          <main className="min-h-screen bg-accent/30 w-full max-w-full overflow-x-hidden">
            {children}
          </main>
        </WishlistProvider>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <WishlistProvider>
        <SubscriptionProvider>
          <div className="animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden relative">
            <Navbar />
            <CartToast />
            <main className="min-h-screen pb-24 md:pb-0 pt-0 w-full max-w-full overflow-x-hidden">
              {children}
            </main>
            <Footer />
            <BottomNavigation />
            <WhatsAppButton />
          </div>
        </SubscriptionProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
