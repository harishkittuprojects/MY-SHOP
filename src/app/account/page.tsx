"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faBoxOpen, 
  faSignOutAlt, 
  faArrowRight, 
  faChevronRight, 
  faClock, 
  faCheckCircle, 
  faSpinner,
  faHeart,
  faMapMarkerAlt,
  faShieldHalved,
  faShoppingCart,
  faTrash,
  faTruck,
  faFileInvoice,
  faPlus,
  faBagShopping
} from "@fortawesome/free-solid-svg-icons";
import { logoutAction } from "@/lib/actions/auth";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import InvoiceModal from "@/components/common/InvoiceModal";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: any[];
  user_email?: string;
  shipping_address?: string;
  payment_method?: string;
  delivery_charge?: number;
}

export default function AccountPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "orders";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<string[]>([
    "Flat 402, High-Tech Towers, Madhapur, Hyderabad, Telangana - 500081",
  ]);
  const [newAddressInput, setNewAddressInput] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab") || "orders");
    }
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchUserData() {
      try {
        const sessionRes = await fetch("/api/auth/session", { 
          signal: controller.signal,
          cache: "no-store",
          headers: { "Accept": "application/json" }
        });
        if (!sessionRes.ok) throw new Error("Session check failed");
        const session = await sessionRes.json();
        
        if (!session || !session.user) {
          router.push("/login");
          return;
        }
        
        setUser(session.user);

        // Fetch user's orders
        try {
          const orderRes = await fetch(`/api/orders?email=${encodeURIComponent(session.user.email)}`, { 
            signal: controller.signal,
            cache: "no-store" 
          });
          if (orderRes.ok) {
            const orderData = await orderRes.json();
            if (Array.isArray(orderData)) setOrders(orderData);
          }
        } catch {
          setOrders([]);
        }

      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Account Dashboard Error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
    
    return () => controller.abort();
  }, [router]);

  const handleSignOut = async () => {
    await logoutAction();
    router.push("/");
    router.refresh();
  };

  const handleMoveWishlistToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image_url || item.image || "/mobile-logo.png",
      category: item.category || "Mobiles",
      selectedUnit: item.unit || "Default",
    });
    removeFromWishlist(item.id);
  };

  const handleAddAddress = () => {
    if (newAddressInput.trim()) {
      setSavedAddresses([...savedAddresses, newAddressInput.trim()]);
      setNewAddressInput("");
      setIsAddingAddress(false);
    }
  };

  const getOrderStatusStep = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed" || s === "delivered") return 4;
    if (s === "shipped" || s === "out for delivery") return 3;
    if (s === "processing") return 2;
    return 1; // Pending / Placed
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[85vh] bg-[#f8fafc] py-8 sm:py-12 px-3 sm:px-6 relative">
      <div className="max-w-6xl mx-auto z-10 relative">
        <div className="flex items-center justify-between mb-6 sm:mb-8 px-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Account &amp; Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage your orders, tracking, wishlist, and shipping addresses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* ======================= SIDEBAR TABS ======================= */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 sticky top-28 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-secondary border border-emerald-200/60 flex items-center justify-center text-xl font-black shadow-xs shrink-0">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-black text-slate-900 truncate">
                    {user.name || user.email?.split('@')[0]}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-1.5 text-xs font-bold">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between ${
                    activeTab === "orders"
                      ? "bg-secondary text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faBoxOpen} className="text-sm" />
                    <span>My Orders &amp; Tracking</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "orders" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    {orders.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between ${
                    activeTab === "wishlist"
                      ? "bg-secondary text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faHeart} className="text-sm" />
                    <span>My Wishlist</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "wishlist" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    {wishlist.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between ${
                    activeTab === "addresses"
                      ? "bg-secondary text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-sm" />
                    <span>Saved Addresses</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between ${
                    activeTab === "profile"
                      ? "bg-secondary text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
                    <span>Profile &amp; Security</span>
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={handleSignOut}
                  className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================= MAIN CONTENT TABS ======================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Order History &amp; Status</h3>
                    <p className="text-xs text-slate-500">Live order tracking with instant invoice download</p>
                  </div>
                </div>

                {orders.length > 0 ? (
                  orders.map((order) => {
                    const step = getOrderStatusStep(order.status);
                    return (
                      <div 
                        key={order.id}
                        className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 uppercase">
                                Order #{String(order.id).slice(-8)}
                              </span>
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                                {order.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-base sm:text-lg font-black text-slate-900">
                              ₹{Math.floor(order.total_amount).toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsInvoiceOpen(true);
                              }}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <FontAwesomeIcon icon={faFileInvoice} className="text-xs" />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </div>

                        {/* Order Tracking Progress Stepper (Amazon style) */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[11px] font-bold text-slate-600 mb-3 uppercase tracking-wider">
                            Live Delivery Progress
                          </p>
                          <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                step >= 1 ? "bg-secondary text-white shadow-xs" : "bg-slate-200 text-slate-500"
                              }`}>
                                ✓
                              </div>
                              <span className="text-[10px] font-bold text-slate-800">Order Placed</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                step >= 2 ? "bg-secondary text-white shadow-xs" : "bg-slate-200 text-slate-500"
                              }`}>
                                {step >= 2 ? "✓" : "2"}
                              </div>
                              <span className="text-[10px] font-bold text-slate-800">Confirmed</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                step >= 3 ? "bg-secondary text-white shadow-xs" : "bg-slate-200 text-slate-500"
                              }`}>
                                {step >= 3 ? "✓" : "3"}
                              </div>
                              <span className="text-[10px] font-bold text-slate-800">Shipped</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                step >= 4 ? "bg-secondary text-white shadow-xs" : "bg-slate-200 text-slate-500"
                              }`}>
                                {step >= 4 ? "✓" : "4"}
                              </div>
                              <span className="text-[10px] font-bold text-slate-800">Delivered</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <p className="text-xs font-bold text-slate-700">Items Ordered:</p>
                            <div className="divide-y divide-slate-100">
                              {order.items.map((item: any, i: number) => (
                                <div key={i} className="py-2 flex items-center justify-between text-xs">
                                  <div>
                                    <p className="font-bold text-slate-900">{item.name}</p>
                                    <p className="text-[10px] text-slate-400">Qty: {item.quantity} • {item.unit || item.selectedUnit || "Default"}</p>
                                  </div>
                                  <span className="font-black text-slate-800">₹{Math.floor(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200/80">
                    <div className="text-5xl mb-3 opacity-30">📦</div>
                    <h4 className="text-base font-black text-slate-900 mb-1">No orders yet</h4>
                    <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                      Explore smartphones, certified refurbished phones, jewellery, and electric vehicles!
                    </p>
                    <Link
                      href="/products"
                      className="px-6 py-2.5 bg-secondary text-white rounded-xl text-xs font-black shadow-md hover:bg-[#255732] transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 2. WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">My Wishlist</h3>
                    <p className="text-xs text-slate-500">Items you've saved for later</p>
                  </div>
                  {wishlist.length > 0 && (
                    <button
                      onClick={clearWishlist}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Clear Wishlist
                    </button>
                  )}
                </div>

                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between group"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="relative w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <Image
                              src={item.image_url || item.image || "/mobile-logo.png"}
                              alt={item.name}
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/products/${item.id}`} className="text-xs font-bold text-slate-900 hover:text-secondary line-clamp-2 leading-tight mb-1">
                              {item.name}
                            </Link>
                            <span className="text-sm font-black text-emerald-700">
                              ₹{Math.floor(item.price).toLocaleString("en-IN")}
                            </span>
                            {item.cashback_amount && item.cashback_amount > 0 && (
                              <p className="text-[10px] font-bold text-emerald-800">
                                ✨ ₹{item.cashback_amount} Cashback
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => handleMoveWishlistToCart(item)}
                            className="flex-1 py-2 bg-secondary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#255732] shadow-xs active:scale-95 transition-all"
                          >
                            <FontAwesomeIcon icon={faShoppingCart} className="text-xs" />
                            <span>Move to Cart</span>
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                            title="Remove"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200/80">
                    <div className="text-5xl mb-3 opacity-30">❤️</div>
                    <h4 className="text-base font-black text-slate-900 mb-1">Your wishlist is empty</h4>
                    <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                      Click the heart icon on any product to save items you love.
                    </p>
                    <Link
                      href="/products"
                      className="px-6 py-2.5 bg-secondary text-white rounded-xl text-xs font-black shadow-md hover:bg-[#255732] transition-colors"
                    >
                      Explore Catalog
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 3. SAVED ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Saved Delivery Addresses</h3>
                    <p className="text-xs text-slate-500">Quickly select saved locations at checkout</p>
                  </div>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-3.5 py-1.5 bg-secondary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#255732] transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    <span>Add Address</span>
                  </button>
                </div>

                {isAddingAddress && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase">New Address Details</h4>
                    <textarea
                      rows={3}
                      placeholder="Enter flat/door no, building, street, landmark, city, state and pincode..."
                      value={newAddressInput}
                      onChange={(e) => setNewAddressInput(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-secondary"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setIsAddingAddress(false)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddAddress}
                        className="px-4 py-1.5 bg-secondary text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#255732]"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {savedAddresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-secondary flex items-center justify-center shrink-0">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{idx === 0 ? "Default Home Address" : `Address #${idx + 1}`}</p>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{addr}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSavedAddresses(savedAddresses.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Delete Address"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PROFILE & SECURITY TAB */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">Profile &amp; Account Settings</h3>
                  <p className="text-xs text-slate-500">Update your contact information and security preferences</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user.name || user.email?.split('@')[0]}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Account status: <strong>Active &amp; Verified</strong></span>
                  <button
                    type="button"
                    onClick={() => alert("Profile updated successfully!")}
                    className="px-5 py-2.5 bg-secondary text-white rounded-xl text-xs font-black shadow-md hover:bg-[#255732] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
      
      {/* Invoice Modal */}
      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={() => setIsInvoiceOpen(false)} 
        order={selectedOrder} 
      />
    </div>
  );
}

