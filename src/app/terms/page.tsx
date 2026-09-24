"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFileContract } from "@fortawesome/free-solid-svg-icons";

export default function TermsPage() {
  return (
    <div className="pb-24 pt-32">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-accent transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <FontAwesomeIcon icon={faFileContract} className="text-primary" />
            Terms & Conditions
          </h1>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 prose prose-gray max-w-none">
          <p className="text-gray-500 font-bold mb-8 italic">Last Updated: March 14, 2026</p>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using MADUR.IN, you agree to comply with and be bound by these Terms and Conditions. Our services include the delivery of farm-fresh milk, organic vegetables, groceries, and traditional food products. If you do not agree with any part of these terms, please refrain from using our platform.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">2. Service Description</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              MADUR.IN provides a platform for customers to order fresh farm products. We ensure high-quality standards for our dairy and produce. Our delivery area is currently limited to specific regions in Hyderabad.
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-4 text-sm">
              <li><strong>Daily Milk Subscription:</strong> Subscribers receive fresh milk daily at their doorstep.</li>
              <li><strong>Product Availability:</strong> Seasonal vegetables and artisanal products are subject to availability.</li>
              <li><strong>Pricing:</strong> Prices may vary based on market conditions, specially for fresh produce.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              You are responsible for providing accurate delivery information (Name, Phone Number, Address, etc.). For milk subscriptions, please ensure a safe and accessible place for delivery.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">4. Payments, Cancellations and Refunds</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Payments for one-time orders and subscriptions must be made through our secure platform. Subscription cancellations require at least 24 hours notice to take effect for the next delivery cycle.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm mt-4 font-bold">
              Refund Policy: Refunds will be issued within 7 days only if the product is damaged.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">5. Quality Assurance</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              We take immense pride in our "Purity, Freshness, and Healthy Living" promise. If any product does not meet your expectations, please contact our support team within 6 hours of delivery for fresh items.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">6. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              For any queries regarding these terms, please contact us at <strong>info@madur.in</strong> or call <strong>+91 7416750834</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
