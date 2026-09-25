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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://madur.in'),
  title: {
    default: "MADUR | 100% Pure Farm-Fresh Milk, Wood-Pressed Oils & Organic Groceries",
    template: "%s | MADUR Farm Fresh",
  },
  description: "Direct farm-to-table delivery across Hyderabad. Fresh cow & buffalo milk in glass bottles, wood-pressed oils, authentic pickles, and organic produce.",
  keywords: ["madur", "madur.in", "farm fresh milk hyderabad", "wood pressed oil", "cold pressed oil", "A2 cow milk", "desi ghee", "organic vegetables hyderabad", "traditional pickles"],
  authors: [{ name: "Madur Team" }],
  creator: "Madur",
  publisher: "Madur Farm Fresh",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MADUR.IN | Farm Fresh Grocery & Dairy Delivery",
    description: "Order fresh milk, vegetables, groceries, and traditional food items online with home delivery in Hyderabad.",
    url: "https://madur.in",
    siteName: "MADUR.IN",
    images: [
      {
        url: "/logo-final.png",
        width: 800,
        height: 600,
        alt: "MADUR.IN Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MADUR.IN | Farm Fresh Grocery & Dairy Delivery",
    description: "Order fresh milk, vegetables, groceries, and traditional food items online with home delivery in Hyderabad.",
    images: ["/logo-final.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-final.png",
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
