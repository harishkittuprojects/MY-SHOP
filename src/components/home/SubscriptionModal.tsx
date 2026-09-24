"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheckCircle, faMapMarkerAlt, faUser, faEnvelope, faRoad, faCreditCard, faUpload, faCheck, faPhone } from "@fortawesome/free-solid-svg-icons";
import { formatOrderWhatsAppMessage, sendWhatsAppNotification } from "@/lib/whatsappUtil";


interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    address: "",
    street: "",
    payment_screenshot_url: null as string | null,
    product_id: "",
    quantity: 1,
  });

  const [subscriptionAmount, setSubscriptionAmount] = useState(599);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedSubId, setPlacedSubId] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [dairyProducts, setDairyProducts] = useState<any[]>([]);

  // Fetch details from local APIs
  React.useEffect(() => {
    async function fetchDetails() {
      try {
        // 1. Fetch fee
        const settingsRes = await fetch("/api/settings");
        const settings = await settingsRes.json();
        if (settings.subscription_fee) setSubscriptionAmount(parseInt(settings.subscription_fee));
  
        // 2. Fetch Milk Products (via API)
        const productsRes = await fetch("/api/productList?category=Milk%20&%20Dairy");
        const prods = await productsRes.json();
        
        setDairyProducts(prods || []);
        if (prods && prods.length > 0) setFormData(prev => ({ ...prev, product_id: prods[0].id }));
      } catch (err) {
        console.error("Error fetching subscription details:", err);
      }
    }

    if (isOpen) {
      fetchDetails();
      setIsSuccess(false);
      
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) document.body.removeChild(existingScript);
      };
    }
  }, [isOpen]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData((prev) => ({ ...prev, location: mapsLink }));
        setIsLocating(false);
      },
      (error) => {
        let errorMessage = "Unable to fetch your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please enable location permissions in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please try again or enter manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get user location timed out. Please try again.";
            break;
        }
        console.error("Geolocation Error:", error.message);
        alert(errorMessage);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };


  const handleSendWhatsAppNotification = (subId: string) => {
    const customerData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      location: formData.location
    };
    
    // For subscriptions, it's typically just one product
    const selectedProduct = dairyProducts.find(p => p.id === formData.product_id);
    const items = [{
      name: selectedProduct?.name || "Milk Subscription",
      quantity: formData.quantity,
      price: selectedProduct?.price || (subscriptionAmount / formData.quantity), // fallback
      selectedUnit: selectedProduct?.unit || "L"
    }];

    const message = formatOrderWhatsAppMessage(subId, customerData, items, subscriptionAmount, 0, "Online Payment", true);
    sendWhatsAppNotification(message);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRazorpayPayment = async (subscriptionId: string) => {
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: subscriptionAmount,
          receipt: `sub_${subscriptionId}`
        }),
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Madur.in",
        description: "Fresh Milk Subscription",
        order_id: data.orderId,
        handler: async function (response: any) {
          setIsSubmitting(true);
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              order_id: subscriptionId,
              type: 'subscription',
              amount: subscriptionAmount
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPlacedSubId(subscriptionId);
            setIsSuccess(true);
            // We no longer auto-redirect to wait for WhatsApp click
          } else {
            alert("Payment verification failed. Please contact support.");
          }
          setIsSubmitting(false);
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#2F6B3F" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Failed to initiate payment.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          address: formData.address,
          location_link: formData.location,
          street: formData.street,
          payment_screenshot_url: formData.payment_screenshot_url,
          product_id: formData.product_id,
          quantity: formData.quantity
        })
      });

      if (!response.ok) throw new Error("Failed to save subscription");
      const result = await response.json();
      await handleRazorpayPayment(result.insertId || result.id);
    } catch (error: any) {
      console.error("Submission error details:", error);
      alert(`Error saving subscription: ${error.message || "Please contact support."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl pointer-events-auto relative flex flex-col max-h-[90vh] overflow-hidden my-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all z-10"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              <div className="p-8 md:p-10 overflow-y-auto flex-1">
                {isSuccess ? (
                  <div className="py-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                      <FontAwesomeIcon icon={faCheck} className="text-3xl" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">Registration Successful!</h3>
                    <p className="text-gray-500 font-bold mb-8">Your subscription is now active. Thank you!</p>
                    
                    <div className="flex flex-col gap-4 w-full">
                      <button 
                        onClick={() => handleSendWhatsAppNotification(placedSubId || "")}
                        className="w-full bg-[#25D366] text-white font-black py-5 rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.5-27.4-16.4-14.6-27.5-32.8-30.7-38.4-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.8-5.7 5.7-9.4 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        Confirm on WhatsApp
                      </button>
                      <button 
                        onClick={() => {
                          setIsRedirecting(true);
                          setTimeout(() => {
                            onClose();
                            window.location.reload();
                          }, 500);
                        }}
                        className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors"
                      >
                        {isRedirecting ? "Redirecting..." : "Skip to Dashboard"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                       <h3 className="text-2xl font-black text-gray-800 mb-1">
                          Subscription Details
                       </h3>
                       <p className="text-gray-500 font-bold text-sm">
                          Tell us where to deliver your fresh milk.
                       </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Full Name</label>
                          <div className="relative">
                            <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                            <input 
                              required
                              type="text" 
                              name="name"
                              placeholder="Your Name"
                              className="w-full bg-accent/30 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary transition-all font-bold"
                              value={formData.name}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="relative">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                          <div className="relative">
                            <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                            <input 
                              required
                              type="email" 
                              name="email"
                              placeholder="your@email.com"
                              className="w-full bg-accent/30 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary transition-all font-bold"
                              value={formData.email}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Phone Number</label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faPhone} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                          <input 
                            required
                            type="tel" 
                            name="phone"
                            placeholder="Your Phone"
                            className="w-full bg-accent/30 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary transition-all font-bold"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Daily Qty (Litres)</label>
                          <input 
                            required
                            type="number" 
                            step="0.1"
                            min="0.1"
                            name="quantity"
                            className="w-full bg-accent/30 border border-gray-100 rounded-2xl py-4 px-4 text-sm outline-none focus:ring-2 ring-primary transition-all font-bold"
                            value={formData.quantity}
                            onChange={(e) => setFormData(p => ({...p, quantity: parseFloat(e.target.value)}))}
                          />
                        </div>
                        <div className="relative">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1 flex justify-between items-center">
                            Maps Link / City
                            <button 
                              type="button"
                              onClick={handleGetCurrentLocation}
                              disabled={isLocating}
                              className="text-[#689f38] normal-case tracking-normal hover:underline active:scale-95 transition-all disabled:opacity-50"
                            >
                              {isLocating ? "Locating..." : "Locate Me"}
                            </button>
                          </label>
                          <div className="relative">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                            <input 
                              required
                              type="text" 
                              name="location"
                              placeholder="Locate me or paste link"
                              className="w-full bg-accent/30 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary transition-all font-bold"
                              value={formData.location}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Street / Landmark / House No.</label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faRoad} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                          <input 
                            required
                            type="text" 
                            name="street"
                            placeholder="e.g. Near Hanuman Temple"
                            className="w-full bg-accent/30 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary transition-all font-bold"
                            value={formData.street}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Full Delivery Address</label>
                        <textarea 
                          required
                          name="address"
                          rows={2}
                          placeholder="Enter your complete address..."
                          className="w-full bg-accent/30 border border-gray-100 rounded-2xl py-4 px-5 text-sm outline-none focus:ring-2 ring-primary transition-all font-bold resize-none"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="pt-4 border-t border-gray-50">
                         <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Payable Amount</span>
                            <span className="text-3xl font-black text-black">₹{subscriptionAmount}</span>
                         </div>
                         <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-secondary hover:opacity-90 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-brown/20 text-sm uppercase tracking-widest disabled:opacity-50"
                        >
                          {isSubmitting ? (
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faCreditCard} />
                              Continue to Payment
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
