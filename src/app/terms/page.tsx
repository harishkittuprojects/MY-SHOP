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
              By accessing and using MY SHOP, you agree to comply with and be bound by these Terms and Conditions. Our services include the sale and delivery of latest flagship smartphones, 5G devices, mobile accessories, and electronic gadgets. If you do not agree with any part of these terms, please refrain from using our platform.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">2. Service Description</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              MY SHOP provides a platform for customers to order brand new genuine smartphones and accessories. We ensure 100% authenticity and official brand warranty for all listed devices.
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-4 text-sm">
              <li><strong>Original Products:</strong> All products are 100% authentic with manufacturer warranty.</li>
              <li><strong>Product Availability:</strong> Flagship models and accessories are subject to stock availability.</li>
              <li><strong>Pricing:</strong> Prices are inclusive of applicable taxes and competitive market rates.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              You are responsible for providing accurate delivery information (Name, Phone Number, Shipping Address, etc.) to ensure smooth and secure parcel delivery.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">4. Payments, Cancellations and Refunds</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Payments for orders must be made securely via available payment methods. Order cancellations are permitted before dispatch.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm mt-4 font-bold">
              Return & Refund Policy: Returns and replacements are covered under brand warranty and policy within 7 days for defective items.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">5. Quality Assurance</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              We guarantee authentic boxed devices with original seals intact. If you receive a tampered package, please contact our support team immediately upon delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">6. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              For any queries regarding these terms, please contact our customer support team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
