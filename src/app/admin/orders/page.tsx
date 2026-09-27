"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faShoppingBag,
  faEye,
  faPrint,
  faTimes,
  faUser,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

interface OrderItem {
  id?: string;
  product_id?: string;
  name: string;
  quantity: number;
  price: number;
  unit?: string;
  image?: string;
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
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
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (["shipped", "out for delivery"].includes(s)) {
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    }
    if (["confirmed", "preparing"].includes(s)) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s === "cancelled") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track customer orders, manage statuses, and print invoices with real-time stock sync
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-50 text-slate-600 hover:text-slate-900"
            }`}
          >
            All Orders ({orders.length})
          </button>
          {ORDER_STATUSES.map((status) => {
            const count = orders.filter((o) => (o.order_status || "").toLowerCase() === status).length;
            return (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === status
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, customer name, phone number..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-semibold">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon icon={faShoppingBag} className="text-slate-300 text-4xl mb-2" />
            <p className="text-slate-800 font-bold text-base">No orders found</p>
            <p className="text-slate-500 text-xs max-w-sm">
              Orders placed by customers will automatically show up here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((o) => {
                  const itemsCount = Array.isArray(o.items)
                    ? o.items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)
                    : 0;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-emerald-700 text-xs block">
                          #{o.id}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {(o.created_at || "").slice(0, 10)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{o.customer_name}</div>
                        <div className="text-[11px] text-slate-500">{o.customer_phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        {itemsCount} item{itemsCount !== 1 ? "s" : ""}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900">
                          ₹{Number(o.total_amount || 0).toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold uppercase text-slate-700 block">
                          {o.payment_method || "COD"}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            o.payment_status === "paid" ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {o.payment_status || "Pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={(o.order_status || "pending").toLowerCase()}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          disabled={statusUpdating}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border uppercase cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${getStatusBadge(
                            o.order_status
                          )}`}
                          title="Click to update order status"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-white text-slate-800 font-bold uppercase">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faEye} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Order Modal & Status Updater */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900 font-mono">Order #{selectedOrder.id}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getStatusBadge(
                      selectedOrder.order_status
                    )}`}
                  >
                    {selectedOrder.order_status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(selectedOrder.created_at || Date.now()).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Updater Bar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Change Order Status
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Cancelling automatically restores inventory stock
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status}
                      disabled={statusUpdating || selectedOrder.order_status.toLowerCase() === status}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer disabled:opacity-40 ${
                        selectedOrder.order_status.toLowerCase() === status
                          ? "bg-emerald-600 text-white"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status Updater Bar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Payment Status ({selectedOrder.payment_method?.toUpperCase() || 'COD'})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Current: <strong className="uppercase text-emerald-700">{selectedOrder.payment_status || 'Pending'}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={statusUpdating || selectedOrder.payment_status === "paid"}
                    onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.order_status, "paid")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                      selectedOrder.payment_status === "paid"
                        ? "bg-emerald-600 text-white"
                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    Mark as Paid
                  </button>
                  <button
                    disabled={statusUpdating || selectedOrder.payment_status === "pending"}
                    onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.order_status, "pending")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                      selectedOrder.payment_status === "pending"
                        ? "bg-amber-600 text-white"
                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    Mark as Pending
                  </button>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                    <FontAwesomeIcon icon={faUser} className="text-emerald-600" />
                    <span>Customer Information</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="font-bold text-slate-900">{selectedOrder.customer_name}</div>
                    <div className="text-slate-600 text-xs flex items-center gap-2">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{selectedOrder.customer_phone || "Not provided"}</span>
                    </div>
                    {selectedOrder.customer_email && (
                      <div className="text-slate-600 text-xs flex items-center gap-2">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{selectedOrder.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-600" />
                    <span>Delivery Address</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedOrder.shipping_address || "No address provided"}
                  </p>
                </div>
              </div>

              {/* Ordered Items List */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Ordered Products ({selectedOrder.items?.length || 0})
                </div>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50/40 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                          {item.unit && <div className="text-[11px] text-slate-500">{item.unit}</div>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.quantity} × ₹{Number(item.price || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total Calculations */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Subtotal</span>
                  <span>₹{Number(selectedOrder.subtotal || selectedOrder.total_amount).toLocaleString("en-IN")}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700 text-xs">
                    <span>Coupon Discount</span>
                    <span>-₹{Number(selectedOrder.discount_amount).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Delivery Charge</span>
                  <span>₹{Number(selectedOrder.delivery_fee || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-base text-slate-900">
                  <span>Total Paid / Payable</span>
                  <span className="text-emerald-700">
                    ₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <FontAwesomeIcon icon={faPrint} />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Standalone Clean 1-Page Printable Invoice (Appears ONLY during Print) */}
      {selectedOrder && (
        <div id="printable-invoice" className="hidden">
          <div className="p-6 bg-white text-black font-sans text-xs leading-normal">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-0.5">MY SHOP</h1>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Flagship Smartphones, 5G Mobiles &amp; Gadgets
                </p>
                <p className="text-[10px] text-slate-500">Express Tech Hub, Tech City • support@myshopmobiles.com</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-1">
                  Tax / Retail Invoice
                </span>
                <p className="text-xs font-black text-slate-900">Order #{selectedOrder.id}</p>
                <p className="text-[10px] text-slate-500">
                  Date: {new Date(selectedOrder.created_at || Date.now()).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </p>
              </div>
            </div>

            {/* Customer & Order Metadata */}
            <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-lg p-3 mb-4 bg-slate-50/50">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Billed &amp; Shipped To:</p>
                <p className="text-xs font-bold text-slate-900">{selectedOrder.customer_name}</p>
                <p className="text-[11px] text-slate-600 font-medium">{selectedOrder.customer_phone || "Phone not provided"}</p>
                {selectedOrder.customer_email && (
                  <p className="text-[10px] text-slate-500">{selectedOrder.customer_email}</p>
                )}
                <p className="text-[11px] text-slate-700 mt-1 leading-tight">{selectedOrder.shipping_address || "Standard Delivery Address"}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Payment &amp; Delivery Details:</p>
                <p className="text-xs font-bold text-slate-900">
                  Method: <span className="uppercase text-emerald-800">{selectedOrder.payment_method || "Paid Online"}</span>
                </p>
                <p className="text-[11px] text-slate-700">
                  Payment Status: <strong className="uppercase">{selectedOrder.payment_status || "Paid"}</strong>
                </p>
                <p className="text-[11px] text-slate-700">
                  Order Status: <strong className="uppercase">{selectedOrder.order_status || "Delivered"}</strong>
                </p>
              </div>
            </div>

            {/* Products Table */}
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
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item: any, i: number) => (
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
                  ))
                ) : (
                  <tr className="border-b border-slate-200">
                    <td className="p-2 text-center">1</td>
                    <td className="p-2">Smartphone / Gadget Order (#{selectedOrder.id})</td>
                    <td className="p-2 text-center">1</td>
                    <td className="p-2 text-right">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</td>
                    <td className="p-2 text-right font-bold">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals & Sign Box */}
            <div className="flex justify-between items-start mb-4">
              <div className="border border-slate-200 rounded p-2.5 max-w-[280px] bg-slate-50/50">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Official Warranty &amp; Guarantee:</p>
                <p className="text-[10px] text-slate-700 leading-tight">
                  1-Year Official Manufacturer Warranty on sealed devices. Keep this invoice for warranty registration and official service center visits.
                </p>
              </div>

              <div className="w-64 border border-slate-200 rounded divide-y divide-slate-200 text-xs">
                <div className="p-1.5 flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-bold">₹{Number(selectedOrder.subtotal || selectedOrder.total_amount).toLocaleString("en-IN")}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="p-1.5 flex justify-between text-emerald-800">
                    <span>Discount:</span>
                    <span className="font-bold">-₹{Number(selectedOrder.discount_amount).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="p-1.5 flex justify-between">
                  <span className="text-slate-600">Delivery Fee:</span>
                  <span className="font-bold">
                    {!selectedOrder.delivery_fee || selectedOrder.delivery_fee === 0 ? "FREE" : `₹${Number(selectedOrder.delivery_fee).toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="p-2 flex justify-between bg-slate-100 font-black text-sm">
                  <span>Grand Total:</span>
                  <span className="text-slate-900">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-2 text-center text-[9px] text-slate-400">
              <p>This is a computer-generated tax invoice and does not require a physical signature.</p>
              <p className="font-bold text-slate-600 mt-0.5">Thank you for shopping with MY SHOP Mobiles!</p>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Strict 1-Page Printing */}
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
            margin: 0 !important;
            padding: 0 !important;
            font-size: 10pt !important;
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
            max-width: 100% !important;
            display: block !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          .no-print, nav, aside, header, footer, button, .admin-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
