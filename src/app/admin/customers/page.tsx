"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  total_orders: number;
  total_spent: number;
  status: string;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Customers fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleViewCustomer = async (c: Customer) => {
    setSelectedCustomer(c);
    setIsDetailModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/customers?id=${c.id}`);
      const data = await res.json();
      if (data.orders) {
        setCustomerOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load customer orders:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      (c.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-slate-500 text-sm mt-1">
            Registered customer accounts, spending history, addresses and order logs
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, email, phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total Registered: <span className="text-emerald-700 font-bold">{customers.length}</span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Orders</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{c.full_name || "Customer"}</div>
                      <div className="text-[11px] text-slate-400">
                        Joined: {(c.created_at || "").slice(0, 10)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{c.email || "—"}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">{c.phone || "—"}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-xs text-slate-800">{c.total_orders || 0} orders</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{Number(c.total_spent || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {c.status || "Active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewCustomer(c)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faEye} />
                        <span>Profile & History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile & Order History Modal */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.full_name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Customer Profile & Order History</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Card */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Contact Email
                  </span>
                  <span className="text-slate-800 font-semibold">{selectedCustomer.email || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Phone Number</span>
                  <span className="text-slate-800 font-semibold">{selectedCustomer.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Spent</span>
                  <span className="text-emerald-700 font-bold text-sm">
                    ₹{Number(selectedCustomer.total_spent || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Orders</span>
                  <span className="text-slate-800 font-bold text-sm">{selectedCustomer.total_orders || 0}</span>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Past Orders ({customerOrders.length})
                </h3>
                {loadingDetails ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Loading orders...</p>
                ) : customerOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No orders recorded for this profile.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {customerOrders.map((ord) => (
                      <div key={ord.id} className="p-3.5 bg-slate-50/40 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-emerald-700">#{ord.id}</div>
                          <div className="text-slate-400 text-[10px]">{(ord.created_at || "").slice(0, 10)}</div>
                        </div>
                        <div className="font-bold text-slate-900">
                          ₹{Number(ord.total_amount).toLocaleString("en-IN")}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {ord.order_status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
