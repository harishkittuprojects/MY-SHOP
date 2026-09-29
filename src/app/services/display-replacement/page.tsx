"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMobileScreenButton,
  faWrench,
  faShieldHalved,
  faClock,
  faCheckCircle,
  faArrowRight,
  faCalendarAlt,
  faPhone,
  faUser,
  faMapMarkerAlt,
  faChevronRight,
  faWandMagicSparkles,
  faTools,
  faTruckFast,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

interface PhoneModel {
  name: string;
  originalOledPrice: number;
  premiumHdPrice: number;
}

const brandData: Record<string, { logo: string; models: PhoneModel[] }> = {
  Apple: {
    logo: "🍎",
    models: [
      { name: "iPhone 16 Pro Max", originalOledPrice: 12999, premiumHdPrice: 6499 },
      { name: "iPhone 16 / 16 Plus", originalOledPrice: 8999, premiumHdPrice: 4999 },
      { name: "iPhone 15 Pro Max", originalOledPrice: 10999, premiumHdPrice: 5499 },
      { name: "iPhone 15 / 15 Plus", originalOledPrice: 7999, premiumHdPrice: 4299 },
      { name: "iPhone 14 Pro / Pro Max", originalOledPrice: 8499, premiumHdPrice: 4499 },
      { name: "iPhone 14 / 14 Plus", originalOledPrice: 5999, premiumHdPrice: 3499 },
      { name: "iPhone 13 / 13 Pro", originalOledPrice: 4999, premiumHdPrice: 2999 },
      { name: "iPhone 12 / 12 Pro", originalOledPrice: 4299, premiumHdPrice: 2499 },
      { name: "iPhone 11 / XR", originalOledPrice: 3299, premiumHdPrice: 1899 },
    ],
  },
  Samsung: {
    logo: "📱",
    models: [
      { name: "Galaxy S25 / S25 Ultra", originalOledPrice: 11999, premiumHdPrice: 5999 },
      { name: "Galaxy S24 / S24 Ultra", originalOledPrice: 9499, premiumHdPrice: 4999 },
      { name: "Galaxy S23 / S23 Ultra", originalOledPrice: 7999, premiumHdPrice: 4299 },
      { name: "Galaxy S22 / S22 Ultra", originalOledPrice: 6499, premiumHdPrice: 3699 },
      { name: "Galaxy A55 / A54 5G", originalOledPrice: 4499, premiumHdPrice: 2499 },
      { name: "Galaxy M35 / M34 5G", originalOledPrice: 3299, premiumHdPrice: 1999 },
    ],
  },
  OnePlus: {
    logo: "🔴",
    models: [
      { name: "OnePlus 13 / 13R 5G", originalOledPrice: 8999, premiumHdPrice: 4799 },
      { name: "OnePlus 12 / 12R 5G", originalOledPrice: 7499, premiumHdPrice: 3999 },
      { name: "OnePlus 11 / 11R 5G", originalOledPrice: 5999, premiumHdPrice: 3299 },
      { name: "OnePlus Nord 4 / 3 5G", originalOledPrice: 4299, premiumHdPrice: 2399 },
      { name: "OnePlus Nord CE 4 / CE 3", originalOledPrice: 3499, premiumHdPrice: 1899 },
    ],
  },
  Vivo: {
    logo: "🔵",
    models: [
      { name: "Vivo X100 / X100 Pro", originalOledPrice: 7999, premiumHdPrice: 4299 },
      { name: "Vivo V40 / V40 Pro 5G", originalOledPrice: 5499, premiumHdPrice: 2999 },
      { name: "Vivo V30 / V30 Pro", originalOledPrice: 4499, premiumHdPrice: 2499 },
      { name: "Vivo T3 / T3 Pro 5G", originalOledPrice: 3299, premiumHdPrice: 1899 },
      { name: "Vivo Y200 / Y400 5G", originalOledPrice: 2799, premiumHdPrice: 1699 },
    ],
  },
  Xiaomi: {
    logo: "🟠",
    models: [
      { name: "Xiaomi 14 / 14 Ultra", originalOledPrice: 8499, premiumHdPrice: 4499 },
      { name: "Redmi Note 13 Pro+ 5G", originalOledPrice: 4299, premiumHdPrice: 2399 },
      { name: "Redmi Note 13 / 12 Pro", originalOledPrice: 3499, premiumHdPrice: 1999 },
      { name: "Redmi 13C / 12 5G", originalOledPrice: 2499, premiumHdPrice: 1499 },
    ],
  },
  GooglePixel: {
    logo: "⚪",
    models: [
      { name: "Pixel 9 / 9 Pro XL", originalOledPrice: 9999, premiumHdPrice: 5299 },
      { name: "Pixel 8 / 8 Pro", originalOledPrice: 7499, premiumHdPrice: 3999 },
      { name: "Pixel 7 / 7a 5G", originalOledPrice: 5299, premiumHdPrice: 2899 },
    ],
  },
};

export default function DisplayReplacementPage() {
  const [selectedBrand, setSelectedBrand] = useState<string>("Apple");
  const [selectedModel, setSelectedModel] = useState<string>("iPhone 15 / 15 Plus");
  const [screenType, setScreenType] = useState<"oled" | "hd">("oled");

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [serviceDate, setServiceDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [preferredTime, setPreferredTime] = useState("10:00 AM - 01:00 PM");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const currentBrandModels = brandData[selectedBrand]?.models || [];
  const currentModelData =
    currentBrandModels.find((m) => m.name === selectedModel) ||
    currentBrandModels[0] || {
      name: selectedModel,
      originalOledPrice: 4999,
      premiumHdPrice: 2699,
    };

  const calculatedPrice =
    screenType === "oled"
      ? currentModelData.originalOledPrice
      : currentModelData.premiumHdPrice;

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    const firstModel = brandData[brand]?.models[0]?.name || "";
    setSelectedModel(firstModel);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedModel) {
      alert("Please fill in your name, phone number, and model.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/services/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          address,
          pincode,
          device_brand: selectedBrand,
          device_model: selectedModel,
          screen_type:
            screenType === "oled"
              ? "Original OLED 120Hz Display"
              : "Premium Vivid HD Display",
          estimated_price: calculatedPrice,
          preferred_date: serviceDate,
          preferred_time: preferredTime,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      setConfirmedBooking(data.booking);
    } catch (err: any) {
      alert(err.message || "Failed to book display service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-4">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_70%)]"></div>
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-4">
              <FontAwesomeIcon icon={faWrench} />
              <span>30-Minute Express Service</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
              Mobile Display Replacement &amp; Screen Installation
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Get certified OEM screen replacements with up to 6 months warranty, genuine TrueTone preservation, zero touch delay, and doorstep / express in-store installation.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400" />
                6 Months Screen Warranty
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <FontAwesomeIcon icon={faClock} className="text-amber-400" />
                30-Min Fast Fitting
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <FontAwesomeIcon icon={faTruckFast} className="text-sky-400" />
                Doorstep Pickup &amp; Drop
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Booking Interface */}
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT: Brand & Model Selector ================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Select Brand */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                  1
                </span>
                Select Your Smartphone Brand
              </h2>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {Object.keys(brandData).map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleBrandChange(brand)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      selectedBrand === brand
                        ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-black shadow-sm ring-2 ring-emerald-600/20"
                        : "bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700 font-bold"
                    }`}
                  >
                    <span className="text-xl">{brandData[brand].logo}</span>
                    <span className="text-xs truncate w-full">{brand}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Model */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                  2
                </span>
                Select Your Model ({selectedBrand})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {currentBrandModels.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setSelectedModel(m.name)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedModel === m.name
                        ? "bg-emerald-50 border-emerald-600 text-slate-900 font-bold shadow-xs ring-2 ring-emerald-600/20"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 font-medium"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs sm:text-sm font-bold truncate">{m.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        OLED ₹{m.originalOledPrice.toLocaleString()} | HD ₹{m.premiumHdPrice.toLocaleString()}
                      </div>
                    </div>
                    {selectedModel === m.name && (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 text-base shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Choose Screen Quality Tier */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                  3
                </span>
                Choose Replacement Screen Quality
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original OLED */}
                <div
                  onClick={() => setScreenType("oled")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    screenType === "oled"
                      ? "bg-emerald-50/60 border-emerald-600 shadow-md ring-2 ring-emerald-600/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      RECOMMENDED
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      ₹{currentModelData.originalOledPrice.toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    Original OLED 120Hz Display
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Factory grade 100% color gamut, TrueTone, 120Hz ProMotion support, Gorilla Glass exterior.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span>6 Months Comprehensive Warranty</span>
                  </div>
                </div>

                {/* Premium Vivid HD */}
                <div
                  onClick={() => setScreenType("hd")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    screenType === "hd"
                      ? "bg-emerald-50/60 border-emerald-600 shadow-md ring-2 ring-emerald-600/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      BUDGET SAVER
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      ₹{currentModelData.premiumHdPrice.toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    Premium Vivid HD Display
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Crisp HD resolution with accurate multitouch calibration and reinforced glass coating.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span>3 Months Replacement Warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: Booking Form & Summary ================= */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                  Book Screen Replacement
                </h3>
                <p className="text-xs text-slate-500">
                  Select your slot &amp; contact info. Pay after installation &amp; testing.
                </p>
              </div>

              {/* Selected Service Summary Capsule */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Device:</span>
                  <span className="font-bold text-slate-900">{selectedModel}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Screen Quality:</span>
                  <span className="font-bold text-emerald-700">
                    {screenType === "oled" ? "Original OLED (6M Warranty)" : "Premium HD (3M Warranty)"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Installation &amp; Labor:</span>
                  <span className="font-bold text-emerald-600 uppercase tracking-wider">FREE (₹0)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-900">Total Estimated Price:</span>
                  <span className="text-2xl font-black text-emerald-700">
                    ₹{calculatedPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faUser} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faPhone} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        type="date"
                        required
                        value={serviceDate}
                        onChange={(e) => setServiceDate(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    >
                      <option value="10:00 AM - 01:00 PM">Morning (10 AM - 1 PM)</option>
                      <option value="01:00 PM - 04:00 PM">Afternoon (1 PM - 4 PM)</option>
                      <option value="04:00 PM - 08:00 PM">Evening (4 PM - 8 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Pincode / Area
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500081"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Doorstep Address / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter full address for doorstep service, or landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faWrench} />
                  <span>{submitting ? "Booking Service..." : "Confirm & Book Service"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {confirmedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Service Booked Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Our certified screen technician will contact you shortly to confirm appointment.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-200">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Booking ID:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Device Model:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.device_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Screen Type:</span>
                  <span className="font-bold text-emerald-700">{confirmedBooking.screen_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.preferred_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Slot:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.preferred_time}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>Payable at Service:</span>
                  <span className="text-emerald-700">₹{Number(confirmedBooking.estimated_price).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmedBooking(null)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
