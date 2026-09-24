"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faShoppingBag, faPlus, faSignOutAlt, faCog, faChartLine, faUsers, faImages, faQuoteLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons";


export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [counts, setCounts] = useState({
    products: 0,
    activeSubscriptions: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    completedDeliveries: 0
  });
  const [recentSubs, setRecentSubs] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [customRevenue, setCustomRevenue] = useState<number | null>(null);
  const [isCheckingCustom, setIsCheckingCustom] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthorized(true); // Ensure UI renders
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${window.location.origin}/api/admin/stats`, {
        cache: "no-store",
        headers: { "Accept": "application/json" }
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      
      if (data.error) {
        setErrorMsg(data.details || data.error);
        return;
      }

      setCounts({
        products: data.products || 0,
        activeSubscriptions: data.activeSubscriptions || 0,
        pendingOrders: data.pendingOrders || 0,
        completedOrders: data.completedOrders || 0,
        todayRevenue: data.todayRevenue || 0,
        yesterdayRevenue: data.yesterdayRevenue || 0,
        completedDeliveries: data.completedDeliveries || 0
      });
      setRecentSubs(data.recentSubs || []);
      setRecentOrders(data.recentOrders || []);
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err);
      setErrorMsg(err.message || "Failed to connect to stats API");
    } finally {
      setIsLoading(false);
    }
  }

  const checkCustomRevenue = async () => {
    setIsCheckingCustom(true);
    try {
      const res = await fetch(`${window.location.origin}/api/admin/stats?date=${selectedDate}`, {
        cache: "no-store",
        headers: { "Accept": "application/json" }
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setCustomRevenue(data.customRevenue || 0);
    } catch (err) {
      console.error("Error checking custom revenue:", err);
    } finally {
      setIsCheckingCustom(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    router.push("/admin/login");
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    { label: "Today's Revenue", value: `₹${counts.todayRevenue.toLocaleString()}`, icon: faChartLine, color: "bg-green-500" },
    { label: "Active Subscriptions", value: counts.activeSubscriptions.toString(), icon: faShoppingBag, color: "bg-orange-500" },
    { label: "Deliveries Done", value: counts.completedDeliveries.toString(), icon: faPlus, color: "bg-indigo-500" },
    { label: "Pending Orders", value: counts.pendingOrders.toString(), icon: faShoppingBag, color: "bg-amber-500" },
    { label: "Completed Orders", value: counts.completedOrders.toString(), icon: faCheckCircle, color: "bg-emerald-500" },
    { label: "Total Products", value: counts.products.toString(), icon: faBox, color: "bg-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-accent/30 p-4 md:p-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-black">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your farm-fresh business here.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/products" className="bg-white text-gray-800 font-bold px-6 py-3 rounded-xl shadow-sm border hover:bg-gray-50 transition-all flex items-center gap-2">
            <FontAwesomeIcon icon={faBox} />
            Manage Products
          </Link>
          <Link href="/admin/settings" className="bg-white text-gray-800 font-bold px-6 py-3 rounded-xl shadow-sm border hover:bg-gray-50 transition-all flex items-center gap-2">
            <FontAwesomeIcon icon={faCog} />
            Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="bg-red-50 text-red-600 font-bold px-6 py-3 rounded-xl border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-10 p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] flex flex-col items-center text-center gap-2 animate-in slide-in-from-top duration-500">
           <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
              <FontAwesomeIcon icon={faSignOutAlt} />
           </div>
           <h3 className="font-black text-red-900">Database Connection Issue</h3>
           <p className="text-red-600 font-bold text-sm max-w-xl">{errorMsg}</p>
           <button 
             onClick={fetchDashboardData}
             className="mt-4 bg-red-600 text-white font-black px-8 py-3 rounded-xl hover:bg-red-700 transition-all text-xs uppercase tracking-widest"
           >
             Retry Sync
           </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {(Array.isArray(stats) ? stats : []).map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all">
            <div className={`w-12 h-12 ${stat.color} text-white rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
              <FontAwesomeIcon icon={stat.icon} className="text-xl" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-black">{isLoading ? "..." : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Subscriptions Preview */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b flex justify-between items-center text-black">
            <h3 className="text-xl font-black">Recent Subscribers</h3>
            <Link href="/admin/subscriptions" className="text-primary font-bold text-sm hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto text-black">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-accent/50 text-gray-500 text-xs font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Phone</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {(!Array.isArray(recentSubs) || recentSubs.length === 0) ? (
                  <tr><td colSpan={4} className="px-8 py-10 text-center text-gray-400">No subscribers found</td></tr>
                ) : recentSubs.map((sub, i) => (
                  <tr 
                    key={sub.id || i} 
                    className="border-b last:border-none hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => sub.id && router.push(`/admin/subscriptions/${sub.id}`)}
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-primary/60 group-hover:bg-primary group-hover:text-white transition-all">
                          <FontAwesomeIcon icon={faUsers} size="xs" />
                        </div>
                        <span className="text-gray-800 font-bold group-hover:text-primary transition-colors">{sub.customer_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-xs font-bold text-gray-500">{sub.customer_phone}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${sub.status === 'active' ? 'text-green-500 bg-green-50' : 'text-gray-500 bg-gray-50'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const message = `*Subscriber details :*\n*Client:* ${sub.customer_name}\n*Phone:* ${sub.customer_phone}\n*Quantity:* ${sub.quantity ?? 1} L\n*Dashboard Link:* ${window.location.origin}/admin/subscriptions/${sub.id}`;
                            const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                            window.open(url, '_blank');
                          }}
                          className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Share to WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.5-27.4-16.4-14.6-27.4-32.8-30.7-38.4-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.8-5.7 5.7-9.4 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sub.id) router.push(`/admin/subscriptions/${sub.id}`);
                          }}
                          className="bg-primary text-black font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest hover:opacity-90 flex items-center justify-center ml-auto"
                        >
                          Details
                        </button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Recent Orders Preview inside the same column */}
          <div className="mt-8 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center text-black">
              <h3 className="text-xl font-black">Recent Orders</h3>
              <Link href="/admin/orders" className="text-primary font-bold text-sm hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto text-black">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-accent/50 text-gray-500 text-xs font-black uppercase tracking-widest">
                    <th className="px-8 py-4">Customer</th>
                    <th className="px-8 py-4">Items</th>
                    <th className="px-8 py-4">Amount</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {(!Array.isArray(recentOrders) || recentOrders.length === 0) ? (
                    <tr><td colSpan={5} className="px-8 py-10 text-center text-gray-400">No orders found</td></tr>
                  ) : recentOrders.map((order, i) => (
                    <tr 
                      key={order.id || i} 
                      className="border-b last:border-none hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/admin/orders`)}
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-primary/60 group-hover:bg-primary group-hover:text-white transition-all">
                            <FontAwesomeIcon icon={faBox} size="xs" />
                          </div>
                          <span className="text-gray-800 font-bold group-hover:text-primary transition-colors">{order.user_email?.split('@')[0] || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-xs font-bold text-gray-500">
                        {order.items && order.items.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {order.items.slice(0, 2).map((item: any, idx: number) => (
                              <span key={idx} className="block truncate max-w-[200px]">{item.cartQuantity || 1}x {item.name}</span>
                            ))}
                            {order.items.length > 2 && <span className="text-[10px] text-primary">+{order.items.length - 2} more items</span>}
                          </div>
                        ) : (
                          "Farm Fresh items"
                        )}
                      </td>
                      <td className="px-8 py-4 text-xs font-black text-gray-800">₹{order.total_amount}</td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${['completed', 'delivered', 'processing'].includes(order.status) ? 'text-green-500 bg-green-50' : 'text-amber-500 bg-amber-50'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-xs font-bold text-gray-400">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const message = `*Order details :* #${order.id}\n*Customer:* ${order.user_email}\n*Total:* ₹${order.total_amount}\n*Admin:* ${window.location.origin}/admin/orders`;
                              const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                              window.open(url, '_blank');
                            }}
                            className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            title="Share to WhatsApp"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.5-27.4-16.4-14.6-27.4-32.8-30.7-38.4-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.8-5.7 5.7-9.4 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                          </button>
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Sidebar: Revenue + Management */}
        <div className="flex flex-col gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black mb-6 text-black">Revenue Lookup</h3>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full bg-accent/50 border-none rounded-2xl py-4 px-6 font-bold outline-none ring-2 ring-primary/10 focus:ring-primary transition-all text-sm"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <button 
                onClick={checkCustomRevenue}
                disabled={isCheckingCustom}
                className="w-full bg-black text-white font-black py-4 rounded-2xl shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {isCheckingCustom ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faChartLine} />
                    Check Revenue
                  </>
                )}
              </button>
              
              {customRevenue !== null && (
                <div className="mt-4 p-6 rounded-3xl bg-primary/10 border border-primary/20 text-center animate-in zoom-in duration-300">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total Earned on {new Date(selectedDate).toDateString()}</p>
                  <p className="text-4xl font-black text-black">₹{customRevenue.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black mb-6 text-black">Management</h3>
            <div className="flex flex-col gap-4">
              <Link href="/admin/products" className="w-full bg-primary text-black font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3">
                <FontAwesomeIcon icon={faBox} />
                Products
              </Link>
              <Link href="/admin/subscriptions" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3">
                <FontAwesomeIcon icon={faShoppingBag} />
                Subscriptions
              </Link>
              <Link href="/admin/categories" className="w-full bg-secondary text-white font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3">
                <FontAwesomeIcon icon={faPlus} />
                Categories
              </Link>
              <Link href="/admin/hero" className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3">
                <FontAwesomeIcon icon={faImages} />
                Hero Banner
              </Link>
              <Link href="/admin/team" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3">
                <FontAwesomeIcon icon={faUsers} />
                Team Manager
              </Link>
              <Link href="/admin/reviews" className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3">
                <FontAwesomeIcon icon={faQuoteLeft} />
                Review Board
              </Link>
              <Link href="/admin/orders" className="w-full bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3">
                <FontAwesomeIcon icon={faShoppingBag} />
                Orders (One-off)
              </Link>
              <Link href="/admin/settings" className="w-full bg-gray-800 text-white font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3">
                <FontAwesomeIcon icon={faCog} />
                Global Settings
              </Link>
            </div>
          </div>

          <div className="bg-primary/10 p-8 rounded-[2.5rem] border border-primary/20">
             <h4 className="font-black text-lg mb-2 text-black text-center">Need Help?</h4>
             <p className="text-[10px] text-gray-500 font-bold text-center mb-6 uppercase tracking-widest truncate">Codtech IT Solutions Support</p>
             <button className="w-full bg-primary/20 text-primary font-black py-3 rounded-2xl text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Support Ticket</button>
          </div>
        </div>
      </div>
    </div>
  );
}
