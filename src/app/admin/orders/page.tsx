"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faCalendarAlt,
  faClock,
  faUser,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faHome,
  faShoppingCart,
  faRotate,
  faCheck,
  faCheckCircle,
  faEye,
  faPrint,
  faDownload,
  faTrash,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faSearch,
  faCreditCard,
  faMoneyBillWave,
  faBox,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { products as defaultProducts } from "@/lib/data";

interface OrderItem {
  id?: string;
  product_id?: string;
  name: string;
  quantity: number;
  price: number;
  unit?: string;
  image?: string;
  image_url?: string;
  color?: string;
  storage?: string;
  ram?: string;
  rom?: string;
  sku?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  notes?: string;
  created_at: string;
}

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "out for delivery",
  "delivered",
  "cancelled",
];

// Helper to look up image thumbnail across items and fallback catalog
const getProductThumbnail = (item: any): string => {
  if (item?.image_url) return item.image_url;
  if (item?.image) return item.image;
  const pId = String(item?.id || item?.product_id || "").toLowerCase().trim();
  const name = String(item?.name || "").toLowerCase().trim();
  const found = defaultProducts.find((p) => {
    const cId = String(p.id).toLowerCase().trim();
    const cName = String(p.name).toLowerCase().trim();
    return cId === pId || cName === name || (pId && cId.includes(pId)) || (name && cName.includes(name));
  });
  return found?.image_url || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=200";
};

// Helper for customer avatar initials
const getCustomerInitials = (name?: string): string => {
  if (!name) return "CU";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Format date helper: "21 Nov 2026"
const formatOrderDate = (dateStr?: string): string => {
  if (!dateStr) return "Today";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr.slice(0, 10);
  }
};

// Format time helper: "12:45 PM"
const formatOrderTime = (dateStr?: string): string => {
  if (!dateStr) return "12:00 PM";
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return "12:00 PM";
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [modalSelectedStatus, setModalSelectedStatus] = useState("confirmed");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      let list: Order[] = Array.isArray(data) ? data : [];

      // Merge with localStorage
      try {
        const raw = localStorage.getItem("myShopOrders");
        if (raw) {
          const localOrders: Order[] = JSON.parse(raw);
          const map = new Map<string, Order>();
          list.forEach((o) => map.set(o.id, o));
          localOrders.forEach((o) => {
            if (!map.has(o.id)) map.set(o.id, o);
          });
          list = Array.from(map.values()).sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
        }
      } catch (e) {
        console.error("Local orders merge error:", e);
      }

      setOrders(list);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");

      try {
        const raw = localStorage.getItem("myShopOrders");
        if (raw) {
          const localOrders: Order[] = JSON.parse(raw);
          localStorage.setItem("myShopOrders", JSON.stringify(localOrders.filter((o) => o.id !== orderId)));
        }
      } catch {}

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string, paymentStatus?: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          order_status: newStatus,
          payment_status: paymentStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      try {
        const raw = localStorage.getItem("myShopOrders");
        if (raw) {
          const localOrders: Order[] = JSON.parse(raw);
          const updated = localOrders.map((o) =>
            o.id === orderId
              ? { ...o, order_status: newStatus, payment_status: paymentStatus || o.payment_status }
              : o
          );
          localStorage.setItem("myShopOrders", JSON.stringify(updated));
        }
      } catch {}

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, order_status: newStatus, payment_status: paymentStatus || o.payment_status }
            : o
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? { ...prev, order_status: newStatus, payment_status: paymentStatus || prev.payment_status }
            : null
        );
      }
    } catch (err: any) {
      alert(err.message || "Status update failed");
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "pending").toLowerCase();
    if (["delivered", "completed"].includes(s)) {
      return "bg-emerald-50 text-emerald-700 border-emerald-300";
    }
    if (["shipped", "out for delivery"].includes(s)) {
      return "bg-cyan-50 text-cyan-700 border-cyan-300";
    }
    if (["confirmed", "preparing"].includes(s)) {
      return "bg-blue-50 text-blue-700 border-blue-300";
    }
    if (s === "cancelled") {
      return "bg-rose-50 text-rose-700 border-rose-300";
    }
    return "bg-amber-50 text-amber-700 border-amber-300";
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === "all" || (o.order_status || "").toLowerCase() === activeTab;
    const matchesSearch =
      (o.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_phone || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 text-xl shrink-0">
            <FontAwesomeIcon icon={faShoppingBag} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Track customer orders, manage statuses, and print invoices with real-time sync
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRotate} className={loading ? "animate-spin" : ""} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* 2. Status Navigation Tabs (Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          All Orders ({orders.length})
        </button>
        {ORDER_STATUSES.map((status) => {
          const count = orders.filter((o) => (o.order_status || "").toLowerCase() === status).length;
          const label = status === "out for delivery" ? "Out for Delivery" : status.charAt(0).toUpperCase() + status.slice(1);
          const isActive = activeTab === status;
          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Order ID, customer name, phone number..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
        />
      </div>

      {/* 4. Orders Data Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-semibold">Synchronizing orders with Supabase...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-2xl mb-1">
              <FontAwesomeIcon icon={faShoppingBag} />
            </div>
            <p className="text-slate-900 font-bold text-base">No orders found</p>
            <p className="text-slate-500 text-xs max-w-sm">
              Orders placed by customers will automatically show up here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left border-collapse">
              <thead>
                <tr className="border-b border-emerald-100 bg-emerald-50/40 text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                  <th className="py-3.5 px-3 text-center w-12">#</th>
                  <th className="py-3.5 px-4 w-36">Order ID</th>
                  <th className="py-3.5 px-4 w-36">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Product(s)</th>
                  <th className="py-3.5 px-3 text-center w-20">Quantity</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((o, index) => {
                  const firstItem = Array.isArray(o.items) && o.items.length > 0 ? o.items[0] : null;
                  const totalQty = Array.isArray(o.items)
                    ? o.items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)
                    : 1;
                  const thumb = getProductThumbnail(firstItem);
                  const isPaid = (o.payment_status || "").toLowerCase() === "paid";
                  const statusVal = (o.order_status || "pending").toLowerCase();

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* # Index */}
                      <td className="py-4 px-3 text-center text-xs font-bold text-slate-500">
                        {index + 1}
                      </td>

                      {/* Order ID & New Badge */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-black text-slate-900 text-xs block">
                          #{o.id}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold mt-1">
                          New
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 text-[11px]" />
                          <span>{formatOrderDate(o.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 font-medium">
                          <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[10px]" />
                          <span>{formatOrderTime(o.created_at)}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-xs">{o.customer_name || "Customer"}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                          <FontAwesomeIcon icon={faPhone} className="text-slate-400 text-[9px]" />
                          <span>{o.customer_phone || "—"}</span>
                        </div>
                      </td>

                      {/* Product(s) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumb}
                            alt={firstItem?.name || "Product"}
                            className="w-11 h-11 object-contain rounded-xl border border-slate-200 bg-white p-1 shrink-0 shadow-2xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div className="min-w-0">
                            <div
                              className="font-bold text-slate-900 text-xs line-clamp-1 hover:text-emerald-700 cursor-pointer"
                              title={firstItem?.name || "Product"}
                              onClick={() => {
                                setSelectedOrder(o);
                                setModalSelectedStatus((o.order_status || "confirmed").toLowerCase());
                                setIsDetailModalOpen(true);
                              }}
                            >
                              {firstItem?.name || "Product Item"}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                              {firstItem?.color || firstItem?.storage || firstItem?.ram
                                ? [firstItem.ram && firstItem.rom ? `${firstItem.ram}/${firstItem.rom}` : (firstItem.storage || firstItem.rom), firstItem.color].filter(Boolean).join(" • ")
                                : (firstItem?.unit || "Standard")}
                            </div>
                            {Array.isArray(o.items) && o.items.length > 1 && (
                              <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                                +{o.items.length - 1} more item{o.items.length - 1 > 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-3 text-center font-bold text-slate-900 text-xs">
                        {totalQty}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4">
                        <div className="font-black text-emerald-700 text-sm">
                          ₹{Number(o.total_amount || 0).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 text-xs font-bold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCreditCard} className="text-slate-400 text-xs" />
                          <span>{o.payment_method || "COD"}</span>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isPaid ? <FontAwesomeIcon icon={faCheckCircle} className="text-[11px]" /> : null}
                          <span>{o.payment_status || "Pending"}</span>
                        </span>
                      </td>

                      {/* Order Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={statusVal}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          disabled={statusUpdating}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${getStatusBadge(
                            o.order_status
                          )}`}
                          title="Change Order Status"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-white text-slate-800 font-bold capitalize">
                              {st === "out for delivery" ? "Out for Delivery" : st.charAt(0).toUpperCase() + st.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setModalSelectedStatus((o.order_status || "confirmed").toLowerCase());
                              setIsDetailModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} className="text-xs" />
                          </button>

                          {/* Print invoice */}
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setTimeout(() => window.print(), 200);
                            }}
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Print Invoice"
                          >
                            <FontAwesomeIcon icon={faPrint} className="text-xs" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteOrder(o.id)}
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredOrders.length}</span> of{" "}
            <span className="font-bold text-slate-800">{orders.length}</span> order{orders.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 flex items-center justify-center disabled:opacity-40 cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs text-xs">
              1
            </button>
            <button
              disabled
              className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 flex items-center justify-center disabled:opacity-40 cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. ORDER DETAILS MODAL (PIXEL-PERFECT MATCH TO USER SCREENSHOT)            */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm text-sm shrink-0">
                  <FontAwesomeIcon icon={faBox} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Order Details</h2>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
            </div>

            {/* Modal Body (2-Column Layout) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ========== LEFT COLUMN ========== */}
                <div className="space-y-4">
                  {/* Customer Information Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                      <FontAwesomeIcon icon={faUser} className="text-emerald-600 text-xs" />
                      <span>Customer Information</span>
                    </div>

                    <div className="flex items-center gap-3.5 pt-1">
                      <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {getCustomerInitials(selectedOrder.customer_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 text-sm truncate">
                          {selectedOrder.customer_name || "Customer"}
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 font-medium">
                          <FontAwesomeIcon icon={faPhone} className="text-slate-400 text-[10px]" />
                          <span>{selectedOrder.customer_phone || "—"}</span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 font-medium truncate">
                          <FontAwesomeIcon icon={faEnvelope} className="text-slate-400 text-[10px]" />
                          <span>{selectedOrder.customer_email || `${selectedOrder.customer_phone || "user"}@example.com`}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-600 text-xs" />
                      <span>Delivery Address</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-medium pt-1">
                      <FontAwesomeIcon icon={faHome} className="text-slate-400 text-xs mt-0.5 shrink-0" />
                      <span>{selectedOrder.shipping_address || "No shipping address provided"}</span>
                    </div>
                  </div>

                  {/* Order Information Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-600 text-xs" />
                      <span>Order Information</span>
                    </div>
                    <div className="space-y-1 text-xs pt-1 font-medium">
                      <div className="flex items-center text-slate-600">
                        <span className="w-32 text-slate-500">Order ID</span>
                        <span className="font-bold text-slate-900">: #{selectedOrder.id}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <span className="w-32 text-slate-500">Order Date</span>
                        <span className="font-bold text-slate-900">
                          : {formatOrderDate(selectedOrder.created_at)}, {formatOrderTime(selectedOrder.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <span className="w-32 text-slate-500">Payment Method</span>
                        <span className="font-bold text-slate-900">: {selectedOrder.payment_method || "Cash on Delivery"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========== RIGHT COLUMN ========== */}
                <div className="space-y-4">
                  {/* Ordered Products Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                      <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-600 text-xs" />
                      <span>Ordered Products</span>
                    </div>

                    {/* Products List Table */}
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-12 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">
                        <span className="col-span-6">Product</span>
                        <span className="col-span-2 text-center">Quantity</span>
                        <span className="col-span-2 text-right">Price</span>
                        <span className="col-span-2 text-right">Total</span>
                      </div>

                      {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => {
                          const itemThumb = getProductThumbnail(item);
                          const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                          return (
                            <div key={idx} className="grid grid-cols-12 items-center py-2 text-xs border-b border-slate-100 last:border-b-0">
                              <div className="col-span-6 flex items-center gap-2.5">
                                <img
                                  src={itemThumb}
                                  alt={item.name || "Product"}
                                  className="w-11 h-11 object-contain rounded-xl border border-slate-200 bg-white p-1 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 text-xs truncate" title={item.name}>
                                    {item.name || "Product"}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                    {item.unit || [item.rom && `ROM: ${item.rom}`, item.ram && `RAM: ${item.ram}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" | ") || "Standard Unit"}
                                  </div>
                                </div>
                              </div>
                              <div className="col-span-2 text-center font-bold text-slate-800 text-xs">
                                {item.quantity || 1}
                              </div>
                              <div className="col-span-2 text-right text-slate-600 text-xs">
                                ₹{Number(item.price || 0).toLocaleString("en-IN")}
                              </div>
                              <div className="col-span-2 text-right font-black text-slate-900 text-xs">
                                ₹{itemTotal.toLocaleString("en-IN")}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-xs text-slate-500 py-3 text-center">No item records found</div>
                      )}
                    </div>

                    {/* Total Amount Green Highlight Box */}
                    <div className="p-3.5 rounded-xl bg-emerald-100/60 border border-emerald-200/80 flex items-center justify-between mt-3">
                      <span className="text-xs font-bold text-slate-700">Total Amount</span>
                      <span className="text-lg font-black text-emerald-800 tracking-tight">
                        ₹{Number(selectedOrder.total_amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Update Order Status Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                        <FontAwesomeIcon icon={faRotate} className="text-emerald-600 text-xs" />
                        <span>Update Order Status:</span>
                      </div>

                      <div className="flex items-center gap-2 flex-1 sm:justify-end">
                        <select
                          value={modalSelectedStatus}
                          onChange={(e) => setModalSelectedStatus(e.target.value)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer capitalize"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st} className="capitalize">
                              {st === "out for delivery" ? "Out for Delivery" : st.charAt(0).toUpperCase() + st.slice(1)}
                            </option>
                          ))}
                        </select>

                        <button
                          disabled={statusUpdating}
                          onClick={() => handleUpdateStatus(selectedOrder.id, modalSelectedStatus)}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faCheck} className="text-xs" />
                          <span>{statusUpdating ? "Updating..." : "Update Status"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                >
                  <FontAwesomeIcon icon={faPrint} />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>Download Invoice</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer active:scale-95"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Printable Invoice */}
      {selectedOrder && (
        <div id="printable-invoice" className="hidden">
          <div className="p-6 bg-white text-black font-sans text-xs leading-normal">
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-0.5">MY SHOP</h1>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Flagship Smartphones, 5G Mobiles &amp; Gadgets
                </p>
                <p className="text-[10px] text-slate-500">Express Tech Hub, Tech City • support@myshop.com</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-1">
                  Tax / Retail Invoice
                </span>
                <p className="text-xs font-black text-slate-900">Order #{selectedOrder.id}</p>
                <p className="text-[10px] text-slate-500">Date: {formatOrderDate(selectedOrder.created_at)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-lg p-3 mb-4 bg-slate-50/50">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Customer Details:</p>
                <p className="text-xs font-bold text-slate-900">{selectedOrder.customer_name}</p>
                <p className="text-[11px] text-slate-600">{selectedOrder.customer_phone}</p>
                <p className="text-[11px] text-slate-700 mt-1">{selectedOrder.shipping_address}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Payment Details:</p>
                <p className="text-xs font-bold text-slate-900">Method: {selectedOrder.payment_method}</p>
                <p className="text-[11px] text-slate-700">Status: {selectedOrder.payment_status}</p>
                <p className="text-[11px] text-slate-700">Order Status: {selectedOrder.order_status}</p>
              </div>
            </div>

            <table className="w-full border-collapse border border-slate-200 mb-4 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-2 text-center w-8 border-r border-slate-200">#</th>
                  <th className="p-2 text-left border-r border-slate-200">Item Description</th>
                  <th className="p-2 text-center w-14 border-r border-slate-200">Qty</th>
                  <th className="p-2 text-right w-24 border-r border-slate-200">Unit Price</th>
                  <th className="p-2 text-right w-28">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, i) => (
                  <tr key={i} className="border-b border-slate-200">
                    <td className="p-2 text-center font-bold border-r border-slate-200">{i + 1}</td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      {item.unit && <div className="text-[10px] text-slate-500">{item.unit}</div>}
                    </td>
                    <td className="p-2 text-center font-bold border-r border-slate-200">{item.quantity}</td>
                    <td className="p-2 text-right border-r border-slate-200">₹{Number(item.price || 0).toLocaleString("en-IN")}</td>
                    <td className="p-2 text-right font-bold text-slate-900">
                      ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 border border-slate-200 rounded divide-y divide-slate-200 text-xs">
                <div className="p-1.5 flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-bold">₹{Number(selectedOrder.subtotal || selectedOrder.total_amount).toLocaleString("en-IN")}</span>
                </div>
                <div className="p-2 flex justify-between bg-slate-100 font-black text-sm">
                  <span>Grand Total:</span>
                  <span className="text-slate-900">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Styles */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 8mm 10mm;
        }
        @media print {
          html, body {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
          }
          .no-print, nav, aside, header, footer, button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
