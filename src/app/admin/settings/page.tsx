"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faCog } from "@fortawesome/free-solid-svg-icons";


export default function AdminSettingsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [subscriptionFee, setSubscriptionFee] = useState("599");
  const [deliveryCharge, setDeliveryCharge] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    setIsAuthorized(true);
  }, []);

  async function fetchSettings() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.subscription_fee) {
        setSubscriptionFee(data.subscription_fee);
      }
      if (data.delivery_charge) {
        setDeliveryCharge(data.delivery_charge);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subscription_fee: subscriptionFee,
          delivery_charge: deliveryCharge 
        })
      });
      
      if (!response.ok) throw new Error("Failed to save");
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Error saving settings!");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/30 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-3xl font-black text-black">Global Settings</h1>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
             <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-primary">
                <FontAwesomeIcon icon={faCog} className="text-xl" />
             </div>
             <div>
                <h3 className="text-xl font-black text-black">Subscription Configuration</h3>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Manage your subscription parameters</p>
             </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-4 ml-1 text-black">Monthly Subscription Fee (₹)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">₹</span>
                <input 
                  type="number"
                  required
                  className="w-full bg-accent/30 border-none rounded-2xl py-6 pl-12 pr-6 text-2xl font-black text-black outline-none focus:ring-4 ring-primary/20 transition-all"
                  value={subscriptionFee}
                  onChange={(e) => setSubscriptionFee(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-400 font-bold mt-4 px-2">This value will be displayed to users in the Subscription Modal and used for all new registrations.</p>
            </div>

            <div className="pt-6 border-t border-gray-50">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-4 ml-1 text-black">Delivery Charge (₹)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">₹</span>
                <input 
                  type="number"
                  required
                  className="w-full bg-accent/30 border-none rounded-2xl py-6 pl-12 pr-6 text-2xl font-black text-black outline-none focus:ring-4 ring-primary/20 transition-all"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-400 font-bold mt-4 px-2">This fixed charge will be added to every order during checkout. Set to 0 for free delivery.</p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-primary text-black font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              <FontAwesomeIcon icon={faSave} />
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
