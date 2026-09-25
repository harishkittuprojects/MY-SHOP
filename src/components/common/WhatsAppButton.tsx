"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export default function WhatsAppButton() {
  const phoneNumber = "+917416750834";
  const message = "Hello MADUR.IN! I'm interested in ordering fresh products.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden md:flex fixed bottom-6 right-6 z-[60] bg-green-500 text-white w-14 h-14 rounded-full items-center justify-center shadow-lg hover:bg-green-600 transition-all hover:scale-110 active:scale-95 group"
      aria-label="Chat on WhatsApp"
    >
      <FontAwesomeIcon icon={faWhatsapp} className="text-3xl" />
      <span className="absolute right-full mr-3 bg-white text-green-600 font-bold px-3 py-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block border border-green-500">
        Order on WhatsApp
      </span>
    </a>
  );
}
