"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faStore,
  faTruck,
  faCreditCard,
  faBullhorn,
  faCloudUploadAlt,
  faSave,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: "MY SHOP",
    contact_email: "support@myshop.com",
    contact_phone: "+91 9876543210",
    whatsapp_number: "+91 9876543210",
    store_address: "123 Tech Park, Electronics City, Bengaluru, Karnataka 560100",
    delivery_fee: "49",
    free_delivery_threshold: "999",
    tax_rate: "18",
    currency_symbol: "₹",
    announcement_text: "🚀 Mega Festival Sale: Flat 20% OFF on all 5G Smartphones! Use code: FESTIVAL20",
    enable_cod: "true",
    enable_online_payment: "true",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      const data = await res.json();
      if (data && typeof data === "object") {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Settings fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Save failed");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Store Settings & Preferences</h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure store branding, customer contact points, delivery rules and payment gateways
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Store Identity */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faStore} />
            </div>
            <span>Store Brand & Contact Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={settings.store_name || ""}
                onChange={(e) => handleChange("store_name", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currency_symbol || "₹"}
                onChange={(e) => handleChange("currency_symbol", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Support Email Address
              </label>
              <input
                type="email"
                value={settings.contact_email || ""}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                WhatsApp Support Number
              </label>
              <input
                type="text"
                value={settings.whatsapp_number || ""}
                onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Physical Store Address
            </label>
            <textarea
              rows={2}
              value={settings.store_address || ""}
              onChange={(e) => handleChange("store_address", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600 transition resize-none"
            />
          </div>
        </div>

        {/* Delivery & Shipping Rules */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faTruck} />
            </div>
            <span>Delivery & Shipping Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                value={settings.delivery_fee || "49"}
                onChange={(e) => handleChange("delivery_fee", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.free_delivery_threshold || "999"}
                onChange={(e) => handleChange("free_delivery_threshold", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Orders above this amount get free delivery automatically</p>
            </div>
          </div>
        </div>

        {/* Payment & Tax Rules */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faCreditCard} />
            </div>
            <span>Payment Methods & Tax Settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Default GST / Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.tax_rate || "18"}
                onChange={(e) => handleChange("tax_rate", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-500 transition">
              <input
                type="checkbox"
                checked={settings.enable_cod !== "false"}
                onChange={(e) => handleChange("enable_cod", e.target.checked ? "true" : "false")}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-0 accent-emerald-600"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Enable Cash on Delivery (COD)</div>
                <div className="text-[10px] text-slate-500">Allow customers to pay cash upon arrival</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-500 transition">
              <input
                type="checkbox"
                checked={settings.enable_online_payment !== "false"}
                onChange={(e) => handleChange("enable_online_payment", e.target.checked ? "true" : "false")}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-0 accent-emerald-600"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Enable Online Payments</div>
                <div className="text-[10px] text-slate-500">Accept Razorpay, UPI, Net Banking & Cards</div>
              </div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {savedSuccess ? (
            <span className="text-emerald-700 text-xs font-bold flex items-center gap-2">
              ✓ Settings saved successfully to Supabase!
            </span>
          ) : (
            <span className="text-slate-500 text-xs">Remember to save after making changes.</span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
          >
            <FontAwesomeIcon icon={faSave} />
            <span>{saving ? "Saving..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
