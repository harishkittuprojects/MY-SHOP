import { Metadata } from 'next';
import HomeContent from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: "MADUR MOBILES | Buy Latest Flagship Smartphones, 5G Mobiles & Smart Gadgets",
  description: "Explore the latest smartphones from Apple iPhone, Samsung Galaxy, Google Pixel, and OnePlus with official warranty, exchange bonus, and 0% No Cost EMI in Hyderabad.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "name": "Madur Mobiles",
    "url": "http://localhost:3001",
    "description": "Authorized retailer for latest 5G smartphones, iPhones, Samsung Galaxy, smartwatches and mobile accessories.",
    "telephone": "+91 7416750834",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "11/65, Kukatpally",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "addressCountry": "IN"
    }
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
