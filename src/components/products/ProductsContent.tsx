"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AmazonFestiveShowcase from "@/components/home/AmazonFestiveShowcase";

function Content() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");

  return (
    <div className="w-full max-w-[1440px] mx-auto px-1 sm:px-3 md:px-4 py-1 sm:py-3 md:py-6">
      {/* Amazon-style Grand Festive Showcase with Category Tree, Banners & Spotlight Deals */}
      <AmazonFestiveShowcase category={categoryFilter} />
    </div>
  );
}

export default function ProductsContent() {
  return (
    <Suspense
      fallback={
        <div className="container py-24 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      }
    >
      <Content />
    </Suspense>
  );
}
