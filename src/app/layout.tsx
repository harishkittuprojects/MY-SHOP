import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import ClientLayout from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://my-shop.vercel.app'),
  title: {
    default: "MY SHOP | Buy Latest Flagship Smartphones & 5G Mobiles",
    template: "%s | MY SHOP Mobiles",
  },
  description: "Shop certified brand-new smartphones from Apple iPhone, Samsung Galaxy, Google Pixel, OnePlus with 1-Year Official Warranty, Instant Exchange & No Cost EMI.",
  keywords: ["smartphones", "buy mobile online", "iPhone 16", "Samsung Galaxy S25", "5G mobiles", "smartwatches", "mobile accessories"],
  authors: [{ name: "My Shop Mobile Team" }],
  creator: "My Shop",
  publisher: "My Shop",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MY SHOP | Buy Latest Flagship Smartphones, 5G Mobiles & Smart Gadgets",
    description: "Explore the latest smartphones from Apple iPhone, Samsung Galaxy, Google Pixel, and OnePlus with official warranty and 0% No Cost EMI.",
    url: "https://myshop.com",
    siteName: "MY SHOP",
    images: [
      {
        url: "/my-shop-logo.png",
        width: 500,
        height: 500,
        alt: "MY SHOP Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MY SHOP | Buy Latest Flagship Smartphones, 5G Mobiles & Smart Gadgets",
    description: "Explore the latest smartphones from Apple iPhone, Samsung Galaxy, Google Pixel, and OnePlus with official warranty and 0% No Cost EMI.",
    images: ["/my-shop-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/my-shop-logo.png",
  },
  verification: {
    google: "BCfi7DVg3MgGcY_x3QC_bbFyRk7gWn57vAtC-w4uC54",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
