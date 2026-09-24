"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash, faArrowLeft, faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CheckoutModal from "@/components/checkout/CheckoutModal";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const session = await res.json();
      setIsLoggedIn(!!session);
    }
    
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.delivery_charge) {
          setDeliveryCharge(parseFloat(data.delivery_charge));
        }
      } catch (err) {
        console.error("Error fetching delivery settings:", err);
      }
    }

    checkAuth();
    fetchSettings();
  }, []);

  const handleCheckoutClick = () => {
    setIsCheckoutOpen(true);
  };

  if (cart.length === 0 && !isCheckoutOpen) {
    return (
      <div className="container pt-32 pb-24 flex flex-col items-center justify-center text-center">
        <div className="text-8xl mb-8 opacity-20">🛒</div>
        <h2 className="text-3xl font-black mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-10 max-w-sm">Looks like you haven't added anything to your cart yet. Fresh milk and organic veggies are waiting!</p>
        <Link 
          href="/" 
          className="bg-secondary text-white font-black px-10 py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center gap-3"
        >
          <FontAwesomeIcon icon={faShoppingBag} />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12 pt-24 md:pt-32">
      <div className="container">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-accent transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-3xl font-black">Shopping Cart</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Item List */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            {cart.map((item, index) => (
              <div 
                key={`${item.id}-${item.selectedUnit}-${index}`} 
                className="bg-white p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3 md:gap-6"
              >
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-md shrink-0 bg-gray-50 flex items-center justify-center">
                  {(item.image || (item as any).image_url) ? (
                    <Image 
                      src={item.image || (item as any).image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-300">
                      <span className="text-2xl mb-1">📦</span>
                      <span className="text-[8px] font-black uppercase">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-secondary mb-1">{item.category}</p>
                    <h3 className="text-lg font-black text-gray-800 mb-1 flex items-center gap-2">
                      {item.name}
                      {item.selectedUnit && (
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          {item.selectedUnit}
                        </span>
                      )}
                    </h3>
                    <p className="text-secondary font-black">₹{Math.floor(item.price)}</p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 md:gap-4 bg-accent rounded-xl px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedUnit)}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-gray-500"
                      >
                        <FontAwesomeIcon icon={faMinus} size="xs" className="md:text-sm" />
                      </button>
                      <span className="font-black w-5 md:w-6 text-center text-sm md:text-base">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedUnit)}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-gray-500"
                      >
                        <FontAwesomeIcon icon={faPlus} size="xs" className="md:text-sm" />
                      </button>
                    </div>

                    <p className="font-black text-lg hidden md:block">₹{Math.floor(item.price * item.quantity)}</p>

                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedUnit)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-gray-50 sticky top-48">
              <h3 className="text-xl font-black mb-6 md:mb-8 pb-4 border-b">Order Summary</h3>
              
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-800">₹{Math.floor(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Charge</span>
                  <span className={deliveryCharge === 0 ? "text-green-600 font-bold" : "font-bold text-gray-800"}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (Tax)</span>
                  <span className="font-bold text-gray-800">₹0</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t mb-8 md:mb-10">
                <span className="text-lg md:text-xl font-black">Total Payable</span>
                <span className="text-2xl md:text-3xl font-black text-secondary">₹{Math.floor(cartTotal + deliveryCharge)}</span>
              </div>

              <div className="flex items-center gap-2 mb-6 justify-center bg-gray-50 py-3 rounded-xl border border-dashed border-gray-200">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">
                  Guaranteed 24 Hours Delivery
                </p>
              </div>

              <button 
                onClick={handleCheckoutClick}
                className="w-full bg-secondary text-white font-black py-5 rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95 mb-4"
              >
                Proceed to Checkout
              </button>
              
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                Secure 256-bit SSL encrypted payment
              </p>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
}
