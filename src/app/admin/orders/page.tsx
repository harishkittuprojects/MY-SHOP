"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faShoppingBag, faTrash, faChevronRight, faMapMarkerAlt, faPhone } from "@fortawesome/free-solid-svg-icons";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  location_link?: string;
  total_amount: number;
  payment_method: string;
  delivery_charge: number;
  status: string;
  created_at: string;
  item_count: number;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdminAuthenticated");
    if (isAdmin !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
      fetchOrders();
    }
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const res = await fetch(`${window.location.origin}/api/admin/orders`, {
        cache: "no-store"
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const deleteOrder = async (orderId: string, name: string) => {
    if (!confirm(`Delete order #${orderId} from ${name}?`)) return;
    try {
      const response = await fetch(`/api/admin/orders?id=${orderId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      fetchOrders();
    } catch (err) {
      alert("Error deleting order!");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/30 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/30 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 shadow-sm transition-all duration-300">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-black">Order Management</h1>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest text-black">Manage one-off customer orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden text-black">
          <div className="p-8 border-b bg-secondary/5">
            <h3 className="text-xl font-black">All Orders</h3>
            <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-widest text-black/50">Tracking {orders.length} orders in total</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-accent/50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">No orders found.</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                    <td className="px-8 py-6 font-mono text-xs font-black text-gray-400">#{order.id.toString().slice(-6).toUpperCase()}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-800 text-sm uppercase tracking-tight">{order.customer_name || "Guest Order"}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <FontAwesomeIcon icon={faPhone} className="text-[8px] text-gray-300" />
                          <span className="text-[10px] text-gray-400 font-bold">{order.customer_phone || "No Phone"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-secondary">₹{Math.floor(order.total_amount)}</span>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{order.item_count} items • {order.payment_method}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        order.status === 'completed' ? 'text-green-500 bg-green-50' : 
                        order.status === 'pending' ? 'text-orange-500 bg-orange-50' : 
                        'text-gray-500 bg-gray-50'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.location_link && (
                          <a href={order.location_link} target="_blank" rel="noopener noreferrer" 
                             onClick={e => e.stopPropagation()}
                             className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm">
                            <FontAwesomeIcon icon={faMapMarkerAlt} size="sm" />
                          </a>
                        )}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation();
                            const subtotal = order.total_amount - (order.delivery_charge || 0);
                            const message = `*Order details :* #${order.id.toString()}\n*Client:* ${order.customer_name}\n*Phone:* ${order.customer_phone}\n*Address:* ${order.shipping_address}\n*Items Total:* ₹${Math.floor(subtotal)}\n*Delivery:* ₹${Math.floor(order.delivery_charge || 0)}\n*Grand Total:* ₹${Math.floor(order.total_amount)}\n*Order Link:* ${window.location.origin}/admin/orders/${order.id}`;
                            const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                            window.open(url, '_blank');
                          }}
                          className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Share to WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.5-27.4-16.4-14.6-27.5-32.8-30.7-38.4-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.8-5.7 5.7-9.4 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteOrder(order.id, order.customer_name || 'Guest'); }}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                        </button>
                        <Link href={`/admin/orders/${order.id}`} className="w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                          <FontAwesomeIcon icon={faChevronRight} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
