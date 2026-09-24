import { Metadata } from 'next';
import ProductsContent from '@/components/products/ProductsContent';

export const metadata: Metadata = {
  title: "Smartphones & Gadgets Catalog",
  description: "Browse our complete catalog of certified smartphones from Apple, Samsung, Google, OnePlus, smartwatches, and premium accessories.",
  alternates: {
    canonical: "/products",
  },
};

export default function ProductsPage() {
  return <ProductsContent />;
}
