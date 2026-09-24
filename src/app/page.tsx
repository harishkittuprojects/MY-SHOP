import { Metadata } from 'next';
import HomeContent from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: "MY SHOP | Buy Latest Flagship Smartphones, 5G Mobiles & Smart Gadgets",
  description: "Explore the latest smartphones from Apple iPhone, Samsung Galaxy, Google Pixel, and OnePlus with official warranty, exchange bonus, and 0% No Cost EMI.",
  alternates: {
    canonical: "/",
  },
};

export const dynamic = 'force-dynamic';

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "name": "My Shop Mobiles",
    "url": "http://localhost:3001",
    "description": "Authorized retailer for latest 5G smartphones, iPhones, Samsung Galaxy, smartwatches and mobile accessories."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContent />
    </>
  );
}
