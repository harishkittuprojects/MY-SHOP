"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheckCircle, faShippingFast, faCreditCard, faTruck, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { placeOrderAction } from "@/lib/actions/orders";
import { formatOrderWhatsAppMessage, sendWhatsAppNotification } from "@/lib/whatsappUtil";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [finalizedOrder, setFinalizedOrder] = useState<{
    items: any[],
    subtotal: number,
    delivery: number,
    paymentMethod: string
  } | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  
  // New user detail fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [locationLink, setLocationLink] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Force Online Payment only
  const [paymentMethod, setPaymentMethod] = useState("Online Payment");
  const [error, setError] = useState("");

  const businessWhatsApp = "917416750834";

  useEffect(() => {
    if (isOpen) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      
      // Prefill if possible (optional: could fetch from session/profile)
      fetch("/api/auth/session", { cache: "no-store" }).then(res => res.json()).then(session => {
        if (session && session.email) {
          setCustomerEmail(session.email);
        }
      });

      // Fetch delivery charge from settings
      fetch("/api/settings").then(res => res.json()).then(data => {
        if (data.delivery_charge) {
          setDeliveryCharge(parseFloat(data.delivery_charge));
        }
      });

      return () => {
        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    }
  }, [isOpen]);

  // Automatic WhatsApp Redirection
  useEffect(() => {
    if (isSuccess && placedOrderId && !whatsappSent) {
      setWhatsappSent(true);
      // Small delay to ensure the success screen is visible first
      setTimeout(() => {
        handleSendWhatsAppNotification(placedOrderId);
      }, 1000);
    }
  }, [isSuccess, placedOrderId, whatsappSent]);

  if (!isOpen) return null;

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const link = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        setLocationLink(link);
        setIsLocating(false);
      },
      () => {
        alert("Unable to fetch location");
        setIsLocating(false);
      }
    );
  };

  const handleSendWhatsAppNotification = (orderId: string) => {
    const customerData = {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: address,
      location: locationLink
    };
    
    // Use frozen data if available, otherwise fallback to current state
    const itemsToUse = finalizedOrder ? finalizedOrder.items : cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      selectedUnit: item.selectedUnit || (item as any).unit
    }));

    const subtotal = finalizedOrder ? finalizedOrder.subtotal : cartTotal;
    const delivery = finalizedOrder ? finalizedOrder.delivery : deliveryCharge;
    const method = finalizedOrder ? finalizedOrder.paymentMethod : paymentMethod;

    const message = formatOrderWhatsAppMessage(
      orderId, 
      customerData, 
      itemsToUse, 
      subtotal, 
      delivery,
      method === "cod" ? "Cash on Delivery" : "Paid Online"
    );
    sendWhatsAppNotification(message);
  };

  const handleOnlinePayment = async (internalOrderId: string) => {
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: cartTotal + deliveryCharge,
          receipt: `order_${internalOrderId}`
        }),
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Madur.in",
        description: "Fresh Produce Order",
        order_id: data.orderId,
        handler: async function (response: any) {
          setIsLoading(true);
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              order_id: internalOrderId,
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPlacedOrderId(internalOrderId);
            // Freeze all order details before cart clear
            setFinalizedOrder({
              items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                selectedUnit: item.selectedUnit || (item as any).unit
              })),
              subtotal: cartTotal,
              delivery: deliveryCharge,
              paymentMethod: "online"
            });
            setIsSuccess(true);
            clearCart();
            // We don't auto-redirect anymore to give time to click WhatsApp
          } else {
            setError("Payment verification failed. Please contact support.");
          }
          setIsLoading(false);
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: { color: "#2F6B3F" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Manual validation to prevent silent HTML5 blocks
    if (!customerName || !customerEmail || !customerPhone || !address) {
      setError("Please fill in all required fields (Name, Email, Phone, and Address).");
      const form = document.querySelector('.custom-scrollbar');
      if (form) form.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setError("");

    // Secondary check for session to prevent server action auth errors
    try {
      const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
      const session = await sessionRes.json();
      if (!session || !session.user) {
        setError("Your session has expired. Please refresh the page and sign in again.");
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Session pre-check failed, continuing to server action...");
    }

    const orderData = {
      total_amount: cartTotal + deliveryCharge,
      delivery_charge: deliveryCharge,
      shipping_address: address,
      payment_method: paymentMethod,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      location_link: locationLink,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        unit: item.selectedUnit
      }))
    };

    const result = await placeOrderAction(orderData);

    if (result.success) {
      if (paymentMethod === "Online Payment") {
        await handleOnlinePayment(result.orderId!);
      } else {
        setPlacedOrderId(result.orderId!);
        // Freeze all order details before cart clear
        setFinalizedOrder({
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            selectedUnit: item.selectedUnit || (item as any).unit
          })),
          subtotal: cartTotal,
          delivery: deliveryCharge,
          paymentMethod: "cod"
        });
        setIsSuccess(true);
        clearCart();
        setIsLoading(false);
      }
    } else {
      setError(result.error || "Failed to place order. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <style jsx>{`
          @keyframes confetti-burst {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .confetti-piece {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #25D366;
            animation: confetti-burst 0.5s ease-out forwards;
          }
        `}</style>
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-green-50 animate-bounce">
              <FontAwesomeIcon icon={faCheckCircle} className="text-5xl" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-800 mb-3 tracking-tighter leading-tight">
              Your order was placed successfully!
            </h2>
            <p className="text-gray-500 font-bold mb-10 text-sm">
              Thank you for shopping with Madur.in. Your fresh items are being prepared for delivery.
              {whatsappSent && <span className="block mt-2 text-secondary animate-pulse text-[10px] uppercase tracking-widest">Redirecting to WhatsApp...</span>}
            </p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => handleSendWhatsAppNotification(placedOrderId || "")}
                className="w-full bg-[#25D366] text-white font-black py-5 rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.5-27.4-16.4-14.6-27.5-32.8-30.7-38.4-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.8-5.7 5.7-9.4 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                Confirm on WhatsApp
              </button>
              
              <button 
                onClick={() => {
                  setIsRedirecting(true);
                  setTimeout(() => {
                    onClose();
                    router.push("/account");
                    router.refresh();
                  }, 500);
                }}
                className="w-full bg-gray-50 text-gray-400 font-bold py-4 rounded-xl hover:bg-gray-100 transition-all text-xs uppercase tracking-widest border border-gray-100"
              >
                {isRedirecting ? "Redirecting..." : "Go to My Dashboard"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <FontAwesomeIcon icon={faShippingFast} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Checkout Details</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>Items Total</span>
              <span>₹{Math.floor(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>Delivery Charge</span>
              <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your name"
                className="w-full bg-accent/30 rounded-xl py-3.5 px-5 font-bold outline-none border-2 border-transparent focus:border-primary/20 transition-all text-sm"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
              <input 
                type="email" 
                placeholder="your@email.com"
                className="w-full bg-accent/30 rounded-xl py-3.5 px-5 font-bold outline-none border-2 border-transparent focus:border-primary/20 transition-all text-sm"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
            <input 
              type="tel" 
              placeholder="10-digit number"
              className="w-full bg-accent/30 rounded-xl py-3.5 px-5 font-bold outline-none border-2 border-transparent focus:border-primary/20 transition-all text-sm"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Delivery Address</label>
            <textarea 
              rows={2}
              placeholder="Enter your full address..."
              className="w-full bg-accent/30 rounded-xl py-2.5 px-4 font-bold outline-none border-2 border-transparent focus:border-primary/20 transition-all resize-none text-sm"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          <div>
             <button 
                type="button" 
                onClick={handleLocateMe}
                disabled={isLocating}
                className="w-full bg-green-50 text-green-700 font-bold py-3 rounded-xl border border-green-100 flex items-center justify-center gap-2 hover:bg-green-100 transition-all active:scale-95 mb-1 text-xs"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} className={isLocating ? "animate-bounce" : ""} />
                {isLocating ? "Locating..." : "Click here share your location"}
              </button>
              {locationLink && (
                <div className="bg-accent/20 p-3 rounded-xl border border-dashed border-gray-200 truncate text-[10px] font-bold text-gray-500">
                  {locationLink}
                </div>
              )}
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Payable Amount</span>
              <span className="text-3xl font-black text-secondary">₹{Math.floor(cartTotal + deliveryCharge)}</span>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Choose Payment Method</label>
              
              <div 
                onClick={() => setPaymentMethod("Online Payment")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                  paymentMethod === "Online Payment" 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  paymentMethod === "Online Payment" ? "bg-primary text-black" : "bg-gray-200 text-gray-400"
                }`}>
                  <FontAwesomeIcon icon={faCreditCard} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-800">Online Payment</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pay securely via Razorpay</p>
                </div>
                {paymentMethod === "Online Payment" && <FontAwesomeIcon icon={faCheckCircle} className="text-primary" />}
              </div>

              <div 
                onClick={() => setPaymentMethod("Cash on Delivery")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                  paymentMethod === "Cash on Delivery" 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  paymentMethod === "Cash on Delivery" ? "bg-primary text-black" : "bg-gray-200 text-gray-400"
                }`}>
                  <FontAwesomeIcon icon={faTruck} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-800">Cash on Delivery</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pay when you receive items</p>
                </div>
                {paymentMethod === "Cash on Delivery" && <FontAwesomeIcon icon={faCheckCircle} className="text-primary" />}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary text-white font-black py-5 rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  {paymentMethod === "Cash on Delivery" ? "Confirm Order" : "Proceed to Payment"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
