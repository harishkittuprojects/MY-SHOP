"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTicketAlt,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faMagic,
} from "@fortawesome/free-solid-svg-icons";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: "",
    discount_type: "percentage",
    discount_value: 10,
    min_order_value: 500,
    max_discount_amount: 500,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    usage_limit: 100,
    is_active: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", { cache: "no-store" });
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Coupons fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      code: "FESTIVAL" + Math.floor(Math.random() * 90 + 10),
      discount_type: "percentage",
      discount_value: 15,
      min_order_value: 1000,
      max_discount_amount: 500,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      usage_limit: 100,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setIsEditing(true);
    setFormData({ ...coupon });
    setIsModalOpen(true);
  };

  const generateRandomCode = () => {
    const prefixes = ["SALE", "SAVE", "DEAL", "FESTIVAL", "MEGA", "BONUS"];
    const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    setFormData((prev) => ({ ...prev, code: `${pre}${num}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) return;

    setSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = await fetch("/api/admin/coupons", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) throw new Error("Operation failed");
      setIsModalOpen(false);
      await fetchCoupons();
    } catch (err: any) {
      alert(err.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchCoupons();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Offers & Coupons</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create discount promo codes, minimum spend limits and promotional campaigns
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400 text-xs">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 text-sm">
            No coupon codes created yet. Click "Create Coupon" above.
          </div>
        ) : (
          coupons.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-xs group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-black text-base tracking-wider">
                    <FontAwesomeIcon icon={faTicketAlt} className="text-emerald-600" />
                    <span>{c.code}</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                      c.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {c.is_active ? "Active" : "Disabled"}
                  </span>
                </div>

                <div className="text-2xl font-black text-slate-900 mb-2">
                  {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT OFF`}
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                  <div>Min Order Value: <strong className="text-slate-800">₹{c.min_order_value || 0}</strong></div>
                  {c.max_discount_amount && (
                    <div>Max Cap: <strong className="text-slate-800">₹{c.max_discount_amount}</strong></div>
                  )}
                  {c.end_date && (
                    <div>Expires on: <strong className="text-slate-800">{c.end_date}</strong></div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Used: {c.used_count || 0} {c.usage_limit ? `/ ${c.usage_limit}` : ""}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.code)}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Coupon Code *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    <FontAwesomeIcon icon={faMagic} />
                    <span>Auto Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVAL20"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Discount Type
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.max_discount_amount || ""}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: parseFloat(e.target.value) || undefined })}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                />
                <span className="text-xs font-bold text-slate-700">Enable Coupon Code</span>
              </label>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
