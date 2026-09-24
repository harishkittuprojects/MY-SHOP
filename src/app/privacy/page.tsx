"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUserShield } from "@fortawesome/free-solid-svg-icons";

export default function PrivacyPage() {
  return (
    <div className="pb-24 pt-32">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-accent transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <FontAwesomeIcon icon={faUserShield} className="text-secondary" />
            Privacy Policy
          </h1>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 prose prose-gray max-w-none">
          <p className="text-gray-500 font-bold mb-8 italic">Last Updated: March 14, 2026</p>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              At MADUR.IN, we respect your privacy. To provide our farm-to-home services, we collect:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-4 text-sm">
              <li><strong>Contact Details:</strong> Your name, email address, and phone number.</li>
              <li><strong>Delivery Information:</strong> Your full address, including street and landmark.</li>
              <li><strong>Transaction Data:</strong> Details of the orders you place and payments made.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">2. How We Use Your Data</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              We use your information exclusively to:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-4 text-sm">
              <li>Process and deliver your fresh grocery and milk orders.</li>
              <li>Manage your subscriptions and send delivery notifications.</li>
              <li>Communicate updates about our farm products or special offers.</li>
              <li>Improve our logistics and customer support.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">3. Data Security</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Your data is processed securely through SSL encrypted channels. We do not sell or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">4. Subscriptions & Payment Information</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              When you subscribe to our plans, your payment information is handled by secure, external payment gateways. MADUR.IN does not store your full card details on our servers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black mb-4">5. Your Choices</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              You can update your delivery preferences or unsubscribe from our promotional communications at any time through your account settings or by contacting our support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">6. Contact for Privacy Concerns</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              If you have any questions regarding your data, please contact our DP officer at <strong>info@madur.in</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
