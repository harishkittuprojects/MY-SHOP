"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faSearch,
  faCheckCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

interface Payment {
  id: string;
  order_id: string;
  customer_name?: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  payment_date: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments", { cache: "no-store" });
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Payments fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, payment_status: newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");
      await fetchPayments();
    } catch (err: any) {
      alert(err.message || "Failed to update payment");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "refunded") return "bg-purple-50 text-purple-700 border-purple-200";
    if (s === "failed") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.order_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.transaction_id || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || (p.payment_status || "").toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = payments
    .filter((p) => (p.payment_status || "").toLowerCase() === "paid")
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const pendingAmount = payments
    .filter((p) => (p.payment_status || "").toLowerCase() === "pending")
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Payments & Transactions</h1>
          <p className="text-slate-500 text-sm mt-1">
            Reconcile payments, track transaction IDs, COD settlement and refund statuses
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl border border-emerald-200 shrink-0">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Collected</span>
            <div className="text-2xl font-black text-slate-900">₹{totalCollected.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl border border-amber-200 shrink-0">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Settlement (COD)</span>
            <div className="text-2xl font-black text-amber-700">₹{pendingAmount.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl border border-teal-200 shrink-0">
            <FontAwesomeIcon icon={faCreditCard} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Transactions</span>
            <div className="text-2xl font-black text-slate-900">{payments.length}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-xs">
        <div className="relative w-full sm:w-80">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Transaction ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "paid", "pending", "failed", "refunded"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-emerald-600 text-white font-black"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading payment records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Order & Transaction ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-emerald-700 text-xs">#{p.order_id}</div>
                      <div className="text-[11px] text-slate-500 font-mono">TXN: {p.transaction_id || "—"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{p.customer_name || "Customer"}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-xs uppercase font-bold text-slate-700">
                      {p.payment_method || "COD"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase ${getStatusBadge(p.payment_status)}`}>
                        {p.payment_status || "Pending"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(p.payment_date || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.payment_status !== "paid" && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, "paid")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        {p.payment_status === "paid" && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, "refunded")}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold cursor-pointer"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
