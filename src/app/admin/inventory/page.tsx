"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarehouse,
  faExclamationTriangle,
  faTimesCircle,
  faEdit,
  faHistory,
  faSearch,
  faTimes,
  faBox,
} from "@fortawesome/free-solid-svg-icons";

interface Product {
  id: string;
  name: string;
  category_name?: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  sku: string;
  is_available: boolean;
}

interface InventoryLog {
  id: string;
  product_id: string;
  product_name: string;
  change_type: string;
  previous_stock: number;
  change_amount: number;
  new_stock: number;
  reason: string;
  admin_name: string;
  created_at: string;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "logs">("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState("Restock / Warehouse Arrival");
  const [submitting, setSubmitting] = useState(false);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory", { cache: "no-store" });
      const data = await res.json();
      if (data.products) setProducts(data.products);
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleOpenAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentAmount(10);
    setAdjustmentReason("Restock / Warehouse Arrival");
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustmentAmount === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          change_amount: adjustmentAmount,
          reason: adjustmentReason,
        }),
      });

      if (!res.ok) throw new Error("Adjustment failed");

      setIsAdjustModalOpen(false);
      await fetchInventoryData();
    } catch (err: any) {
      alert(err.message || "Failed to adjust stock");
    } finally {
      setSubmitting(false);
    }
  };

  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stock_quantity) || 0), 0);
  const lowStockProducts = products.filter(
    (p) => (Number(p.stock_quantity) || 0) > 0 && (Number(p.stock_quantity) || 0) <= 5
  );
  const outOfStockProducts = products.filter(
    (p) => (Number(p.stock_quantity) || 0) <= 0 || !p.is_available
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase());

    const isOut = (p.stock_quantity || 0) <= 0 || !p.is_available;
    const isLow = !isOut && (p.stock_quantity || 0) <= 5;

    if (stockFilter === "low") return matchesSearch && isLow;
    if (stockFilter === "out") return matchesSearch && isOut;
    if (stockFilter === "in_stock") return matchesSearch && !isOut && !isLow;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inventory & Stock Control
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time warehouse tracking with automatic order deductions and cancellation restorations
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-xs">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "inventory"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FontAwesomeIcon icon={faWarehouse} className="mr-1.5" />
            <span>Stock Table</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "logs"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FontAwesomeIcon icon={faHistory} className="mr-1.5" />
            <span>Stock History Logs ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl border border-emerald-200 shrink-0">
            <FontAwesomeIcon icon={faWarehouse} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Stock Units</span>
            <div className="text-2xl font-black text-slate-900">{totalStockUnits.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl border border-amber-200 shrink-0">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock Warning (&le;5)</span>
            <div className="text-2xl font-black text-amber-700">{lowStockProducts.length} Items</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center text-xl border border-rose-200 shrink-0">
            <FontAwesomeIcon icon={faTimesCircle} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Out of Stock</span>
            <div className="text-2xl font-black text-rose-700">{outOfStockProducts.length} Items</div>
          </div>
        </div>
      </div>

      {activeTab === "inventory" ? (
        <>
          {/* Filter Bar */}
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
                placeholder="Search stock by name, SKU..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStockFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  stockFilter === "all" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStockFilter("low")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  stockFilter === "low" ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Low Stock ({lowStockProducts.length})
              </button>
              <button
                onClick={() => setStockFilter("out")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  stockFilter === "out" ? "bg-rose-50 text-rose-700 border border-rose-200" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Out of Stock ({outOfStockProducts.length})
              </button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Selling Price</th>
                    <th className="py-3.5 px-4">Current Stock</th>
                    <th className="py-3.5 px-4">Stock Health</th>
                    <th className="py-3.5 px-4 text-right">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProducts.map((p) => {
                    const isOut = (p.stock_quantity || 0) <= 0 || !p.is_available;
                    const isLow = !isOut && (p.stock_quantity || 0) <= 5;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden relative shrink-0">
                              {p.image_url ? (
                                <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                              ) : (
                                <FontAwesomeIcon icon={faBox} className="text-slate-300 m-auto" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm truncate max-w-xs">{p.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">SKU: {p.sku || p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-700 font-semibold">{p.category_name}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">₹{p.price?.toLocaleString("en-IN")}</td>
                        <td className="py-3.5 px-4 font-black text-base text-slate-900">
                          {p.stock_quantity || 0}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isOut
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : isLow
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenAdjustModal(p)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            <span>Adjust Stock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Logs Tab */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs p-6">
          <h2 className="text-lg font-black text-slate-900 mb-4">Stock Movement History</h2>
          {logs.length === 0 ? (
            <p className="text-slate-400 text-sm py-12 text-center">No inventory changes recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="pb-3 px-4">Timestamp</th>
                    <th className="pb-3 px-4">Product</th>
                    <th className="pb-3 px-4">Change Type</th>
                    <th className="pb-3 px-4">Qty Change</th>
                    <th className="pb-3 px-4">New Stock</th>
                    <th className="pb-3 px-4">Reason / Initiator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-slate-500 text-xs font-mono">
                        {new Date(log.created_at || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.product_name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {log.change_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={log.change_amount >= 0 ? "text-emerald-700" : "text-rose-700"}>
                          {log.change_amount >= 0 ? `+${log.change_amount}` : log.change_amount}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.new_stock}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        <div>{log.reason || "—"}</div>
                        <div className="text-[10px] text-slate-400">By: {log.admin_name || "System"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Adjust Stock Level</h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Product</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProduct.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                Current Stock: <strong className="text-emerald-700">{selectedProduct.stock_quantity} units</strong>
              </p>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Quantity to Add or Subtract (+ / -)
                </label>
                <input
                  type="number"
                  required
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 20 or -5"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  New Resulting Stock:{" "}
                  <strong className="text-slate-900">
                    {Math.max(0, (selectedProduct.stock_quantity || 0) + adjustmentAmount)} units
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Restock, Inventory Audit, Damaged Unit"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || adjustmentAmount === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
