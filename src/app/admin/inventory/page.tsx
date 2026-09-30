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
  faLayerGroup,
  faPlus,
  faTrash,
  faMicrochip,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";

interface ProductVariantItem {
  id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  category_name?: string;
  ram?: string;
  rom?: string;
  storage_label?: string;
  color?: string;
  color_code?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  sku?: string;
  image_url?: string;
  is_active?: boolean;
}

interface Product {
  id: string;
  name: string;
  category_name?: string;
  category?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  image_url: string;
  images?: string[];
  sku: string;
  is_available: boolean;
  variants?: any[];
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

const RAM_OPTIONS = ["4GB", "6GB", "8GB", "12GB", "16GB", "24GB"];
const ROM_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const COLOR_PRESETS = [
  { name: "Titanium Black", code: "#1F2022" },
  { name: "Titanium Gray", code: "#8E8D8A" },
  { name: "Titanium Silver", code: "#E5E4E2" },
  { name: "Titanium Violet", code: "#4C3D54" },
  { name: "Desert Titanium", code: "#C4A482" },
  { name: "Natural Titanium", code: "#9E9A93" },
  { name: "Amber Yellow", code: "#E8B923" },
  { name: "Cobalt Violet", code: "#353866" },
  { name: "Marble White", code: "#F2F4F7" },
  { name: "Onyx Black", code: "#0B0B0C" },
  { name: "Pink", code: "#F4C2C2" },
  { name: "Blue", code: "#2B50AA" },
];

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"variants" | "inventory" | "logs">("variants");
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low" | "out">("all");
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>("all");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // Product Stock Adjust Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState("Restock / Warehouse Arrival");

  // Variant Modal (Add / Edit)
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariantItem | null>(null);
  const [variantForm, setVariantForm] = useState({
    product_id: "",
    ram: "8GB",
    rom: "256GB",
    storage_label: "8GB + 256GB",
    color: "Titanium Black",
    color_code: "#1F2022",
    price: 69999,
    original_price: 79999,
    stock_quantity: 15,
    sku: "",
    image_url: "",
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch all inventory, products, and variants
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [invRes, varRes] = await Promise.all([
        fetch("/api/admin/inventory", { cache: "no-store" }),
        fetch("/api/admin/inventory/variants", { cache: "no-store" }),
      ]);

      const invData = await invRes.json();
      const varData = await varRes.json();

      if (invData.products) setProducts(invData.products);
      if (invData.logs) setLogs(invData.logs);
      if (varData.variants) setVariants(varData.variants);
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Open Product Stock Modal
  const handleOpenAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentAmount(10);
    setAdjustmentReason("Restock / Warehouse Arrival");
    setIsAdjustModalOpen(true);
  };

  // Submit Product Stock Adjustment
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

  // Quick Variant Stock Increment/Decrement
  const handleQuickVariantStock = async (variant: ProductVariantItem, change: number) => {
    try {
      const newStock = Math.max(0, (variant.stock_quantity || 0) + change);
      const res = await fetch("/api/admin/inventory/variants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: variant.product_id,
          variant_id: variant.id,
          stock_quantity: newStock,
        }),
      });

      if (!res.ok) throw new Error("Failed to update variant stock");
      await fetchInventoryData();
    } catch (err: any) {
      alert(err.message || "Stock update failed");
    }
  };

  // Toggle Variant Active State
  const handleToggleVariantActive = async (variant: ProductVariantItem) => {
    try {
      const res = await fetch("/api/admin/inventory/variants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: variant.product_id,
          variant_id: variant.id,
          is_active: variant.is_active === false ? true : false,
        }),
      });

      if (!res.ok) throw new Error("Failed to toggle variant status");
      await fetchInventoryData();
    } catch (err: any) {
      alert(err.message || "Toggle failed");
    }
  };

  // Open Add Variant Modal
  const handleOpenAddVariant = () => {
    const firstProd = products[0];
    setEditingVariant(null);
    setVariantForm({
      product_id: firstProd ? firstProd.id : "",
      ram: "8GB",
      rom: "256GB",
      storage_label: "8GB + 256GB",
      color: "Titanium Black",
      color_code: "#1F2022",
      price: firstProd ? Number(firstProd.price) || 49999 : 49999,
      original_price: firstProd ? Number(firstProd.original_price) || 59999 : 59999,
      stock_quantity: 15,
      sku: `VAR-${Date.now().toString().slice(-6)}`,
      image_url: firstProd ? (firstProd.image_url || "") : "",
      is_active: true,
    });
    setIsVariantModalOpen(true);
  };

  // Open Edit Variant Modal
  const handleOpenEditVariant = (variant: ProductVariantItem) => {
    setEditingVariant(variant);
    setVariantForm({
      product_id: variant.product_id,
      ram: variant.ram || "8GB",
      rom: variant.rom || "256GB",
      storage_label: variant.storage_label || `${variant.ram || "8GB"} + ${variant.rom || "256GB"}`,
      color: variant.color || "Titanium Black",
      color_code: variant.color_code || "#1F2022",
      price: Number(variant.price) || 0,
      original_price: Number(variant.original_price) || Number(variant.price) || 0,
      stock_quantity: Number(variant.stock_quantity) || 0,
      sku: variant.sku || "",
      image_url: variant.image_url || "",
      is_active: variant.is_active !== false,
    });
    setIsVariantModalOpen(true);
  };

  // Submit Variant Form (Add or Edit)
  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantForm.product_id) {
      alert("Please select a target product");
      return;
    }

    setSubmitting(true);
    try {
      const storageLabel = `${variantForm.ram} + ${variantForm.rom}`;
      const payload = {
        ...variantForm,
        storage_label: storageLabel,
        price: Number(variantForm.price),
        original_price: Number(variantForm.original_price),
        stock_quantity: Number(variantForm.stock_quantity),
      };

      let res;
      if (editingVariant) {
        res = await fetch("/api/admin/inventory/variants", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            product_id: editingVariant.product_id,
            variant_id: editingVariant.id,
          }),
        });
      } else {
        res = await fetch("/api/admin/inventory/variants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Operation failed");
      }

      setIsVariantModalOpen(false);
      await fetchInventoryData();
    } catch (err: any) {
      alert(err.message || "Failed to save variant");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Variant
  const handleDeleteVariant = async (variant: ProductVariantItem) => {
    if (!confirm(`Are you sure you want to delete the ${variant.storage_label} (${variant.color}) variant?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/inventory/variants?product_id=${variant.product_id}&variant_id=${variant.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
      await fetchInventoryData();
    } catch (err: any) {
      alert(err.message || "Failed to delete variant");
    }
  };

  // KPI Calculations
  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stock_quantity) || 0), 0);
  const totalVariantsCount = variants.length;
  const lowStockVariants = variants.filter(
    (v) => (Number(v.stock_quantity) || 0) > 0 && (Number(v.stock_quantity) || 0) <= lowStockThreshold
  );
  const outOfStockVariants = variants.filter(
    (v) => (Number(v.stock_quantity) || 0) <= 0 || v.is_active === false
  );

  const lowStockProducts = products.filter(
    (p) => (Number(p.stock_quantity) || 0) > 0 && (Number(p.stock_quantity) || 0) <= lowStockThreshold
  );
  const outOfStockProducts = products.filter(
    (p) => (Number(p.stock_quantity) || 0) <= 0 || !p.is_available
  );

  // Filtered Variants
  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      (v.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.color || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.storage_label || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.sku || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProduct =
      selectedProductFilter === "all" || v.product_id === selectedProductFilter;

    const isOut = (v.stock_quantity || 0) <= 0 || v.is_active === false;
    const isLow = !isOut && (v.stock_quantity || 0) <= lowStockThreshold;

    let matchesStatus = true;
    if (stockFilter === "low") matchesStatus = isLow;
    if (stockFilter === "out") matchesStatus = isOut;
    if (stockFilter === "in_stock") matchesStatus = !isOut && !isLow;

    return matchesSearch && matchesProduct && matchesStatus;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase());

    const isOut = (p.stock_quantity || 0) <= 0 || !p.is_available;
    const isLow = !isOut && (p.stock_quantity || 0) <= lowStockThreshold;

    if (stockFilter === "low") return matchesSearch && isLow;
    if (stockFilter === "out") return matchesSearch && isOut;
    if (stockFilter === "in_stock") return matchesSearch && !isOut && !isLow;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Stock Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Sync Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Product Variants & Inventory Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure RAM, ROM storage configurations, colour availability, dynamic pricing, and stock quotas.
          </p>
        </div>

        {/* Tab Selector & Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-xs">
            <button
              onClick={() => setActiveTab("variants")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "variants"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FontAwesomeIcon icon={faLayerGroup} />
              <span>Variant Matrix ({variants.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "inventory"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FontAwesomeIcon icon={faWarehouse} />
              <span>Products ({products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "logs"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FontAwesomeIcon icon={faHistory} />
              <span>Audit Logs ({logs.length})</span>
            </button>
          </div>

          <button
            onClick={handleOpenAddVariant}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Mobile Variant</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg border border-emerald-200 shrink-0">
            <FontAwesomeIcon icon={faWarehouse} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Units</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{totalStockUnits.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg border border-blue-200 shrink-0">
            <FontAwesomeIcon icon={faLayerGroup} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Variants</span>
            <div className="text-xl sm:text-2xl font-black text-blue-700">{totalVariantsCount} SKUs</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg border border-amber-200 shrink-0">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Low Stock (&le;{lowStockThreshold})</span>
            <div className="text-xl sm:text-2xl font-black text-amber-700">{lowStockVariants.length} Variants</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center text-lg border border-rose-200 shrink-0">
            <FontAwesomeIcon icon={faTimesCircle} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Out of Stock</span>
            <div className="text-xl sm:text-2xl font-black text-rose-700">{outOfStockVariants.length} Variants</div>
          </div>
        </div>
      </div>

      {/* TAB 1: PRODUCT VARIANTS & MATRIX */}
      {activeTab === "variants" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search variant, colour, SKU..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Product selector filter */}
              <select
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="w-full sm:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-600"
              >
                <option value="all">All Mobile Models</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setStockFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                  stockFilter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Variants ({variants.length})
              </button>
              <button
                onClick={() => setStockFilter("in_stock")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                  stockFilter === "in_stock" ? "bg-emerald-600 text-white" : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                }`}
              >
                In Stock ({variants.length - outOfStockVariants.length})
              </button>
              <button
                onClick={() => setStockFilter("low")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                  stockFilter === "low" ? "bg-amber-600 text-white" : "text-amber-700 bg-amber-50 hover:bg-amber-100"
                }`}
              >
                Low Stock ({lowStockVariants.length})
              </button>
              <button
                onClick={() => setStockFilter("out")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                  stockFilter === "out" ? "bg-rose-600 text-white" : "text-rose-700 bg-rose-50 hover:bg-rose-100"
                }`}
              >
                Out of Stock ({outOfStockVariants.length})
              </button>
            </div>
          </div>

          {/* Variants Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Smartphone & Variant</th>
                    <th className="py-3.5 px-3">RAM + ROM</th>
                    <th className="py-3.5 px-3">Colour Swatch</th>
                    <th className="py-3.5 px-3">Price & MRP</th>
                    <th className="py-3.5 px-3">Stock Units</th>
                    <th className="py-3.5 px-3">Availability</th>
                    <th className="py-3.5 px-3">Active</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredVariants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                        No product variants found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredVariants.map((v) => {
                      const isOutOfStock = (v.stock_quantity || 0) <= 0;
                      const isLowStock = !isOutOfStock && (v.stock_quantity || 0) <= lowStockThreshold;
                      const isEnabled = v.is_active !== false;

                      return (
                        <tr key={v.id} className={`hover:bg-slate-50/80 transition-colors ${!isEnabled ? "opacity-60 bg-slate-50/40" : ""}`}>
                          {/* Product Name & SKU */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden relative shrink-0">
                                {v.image_url || v.product_image ? (
                                  <Image
                                    src={v.image_url || v.product_image || ""}
                                    alt={v.color || "Variant"}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <FontAwesomeIcon icon={faBox} className="text-slate-300 m-auto" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{v.product_name || "Smartphone"}</div>
                                <div className="text-[11px] text-slate-400 font-mono">SKU: {v.sku || v.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* RAM + ROM */}
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-black font-mono">
                              <FontAwesomeIcon icon={faMicrochip} className="text-slate-400 text-[10px]" />
                              {v.storage_label || `${v.ram || "8GB"} + ${v.rom || "256GB"}`}
                            </span>
                          </td>

                          {/* Colour Swatch */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded-full border border-slate-300 shadow-inner shrink-0"
                                style={{ backgroundColor: v.color_code || "#1F2022" }}
                              />
                              <span className="text-xs font-bold text-slate-800">{v.color || "Standard"}</span>
                            </div>
                          </td>

                          {/* Price & MRP */}
                          <td className="py-3.5 px-3">
                            <div className="font-black text-slate-900 text-sm">
                              ₹{Number(v.price || 0).toLocaleString("en-IN")}
                            </div>
                            {v.original_price && Number(v.original_price) > Number(v.price) && (
                              <div className="text-[11px] text-slate-400 line-through">
                                ₹{Number(v.original_price).toLocaleString("en-IN")}
                              </div>
                            )}
                          </td>

                          {/* Stock Units with Quick +/- */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuickVariantStock(v, -1)}
                                disabled={v.stock_quantity <= 0}
                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                                title="Decrease by 1"
                              >
                                -
                              </button>
                              <span className={`font-black text-sm w-8 text-center ${isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-slate-900"}`}>
                                {v.stock_quantity || 0}
                              </span>
                              <button
                                onClick={() => handleQuickVariantStock(v, 1)}
                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                                title="Increase by 1"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Stock Health */}
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                isOutOfStock
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : isLowStock
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {isOutOfStock ? "Out of Stock" : isLowStock ? `Low (${v.stock_quantity} Left)` : "In Stock"}
                            </span>
                          </td>

                          {/* Active / Disable Toggle */}
                          <td className="py-3.5 px-3">
                            <button
                              onClick={() => handleToggleVariantActive(v)}
                              className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                                isEnabled ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
                              }`}
                              title={isEnabled ? "Enabled on Customer Site" : "Disabled (Hidden from Customer)"}
                            >
                              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditVariant(v)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                                title="Edit Variant"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDeleteVariant(v)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                                title="Delete Variant"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS STOCK OVERVIEW */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
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
                  stockFilter === "all" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
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

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Starting Price</th>
                    <th className="py-3.5 px-4">Combined Units</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4 text-right">Quick Stock Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProducts.map((p) => {
                    const isOut = (p.stock_quantity || 0) <= 0 || !p.is_available;
                    const isLow = !isOut && (p.stock_quantity || 0) <= lowStockThreshold;

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
                        <td className="py-3.5 px-4 text-xs text-slate-700 font-semibold">{p.category_name || p.category}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">₹{Number(p.price || 0).toLocaleString("en-IN")}</td>
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
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            <span>Adjust Units</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === "logs" && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Stock Movement & Order Deductions</h2>
              <p className="text-xs text-slate-500">Full audit trail of stock increments, order checkout deductions, and cancellations</p>
            </div>
            <button
              onClick={fetchInventoryData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FontAwesomeIcon icon={faRefresh} />
              <span>Refresh</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <p className="text-slate-400 text-sm py-12 text-center">No inventory changes recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="pb-3 px-4">Timestamp</th>
                    <th className="pb-3 px-4">Product / Variant</th>
                    <th className="pb-3 px-4">Type</th>
                    <th className="pb-3 px-4">Qty Change</th>
                    <th className="pb-3 px-4">Resulting Stock</th>
                    <th className="pb-3 px-4">Reason / Trigger</th>
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
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                            log.change_type === "order_deduct"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
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

      {/* MODAL 1: ADD / EDIT VARIANT MODAL */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FontAwesomeIcon icon={faLayerGroup} />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingVariant ? "Edit Product Variant" : "Add Mobile Variant"}
                </h3>
              </div>
              <button
                onClick={() => setIsVariantModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleVariantSubmit} className="space-y-4 text-xs">
              {/* Target Smartphone */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Smartphone Model
                </label>
                <select
                  required
                  value={variantForm.product_id}
                  disabled={!!editingVariant}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    setVariantForm({
                      ...variantForm,
                      product_id: e.target.value,
                      price: found ? Number(found.price) || variantForm.price : variantForm.price,
                      original_price: found ? Number(found.original_price) || variantForm.original_price : variantForm.original_price,
                      image_url: found ? (found.image_url || "") : variantForm.image_url,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                >
                  <option value="">Select Smartphone...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Base: ₹{p.price?.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              {/* RAM & ROM Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    RAM Capacity
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {RAM_OPTIONS.map((ram) => (
                      <button
                        key={ram}
                        type="button"
                        onClick={() => setVariantForm({ ...variantForm, ram })}
                        className={`px-2.5 py-1.5 rounded-lg font-mono font-bold text-xs cursor-pointer border ${
                          variantForm.ram === ram
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {ram}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    ROM / Internal Storage
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ROM_OPTIONS.map((rom) => (
                      <button
                        key={rom}
                        type="button"
                        onClick={() => setVariantForm({ ...variantForm, rom })}
                        className={`px-2.5 py-1.5 rounded-lg font-mono font-bold text-xs cursor-pointer border ${
                          variantForm.rom === rom
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {rom}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colour Name & Colour Hex Swatch */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Colour Presets & Name
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        setVariantForm({
                          ...variantForm,
                          color: preset.name,
                          color_code: preset.code,
                        })
                      }
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                        variantForm.color === preset.name
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-slate-300"
                        style={{ backgroundColor: preset.code }}
                      />
                      {preset.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Colour Name (e.g. Titanium Violet)"
                      value={variantForm.color}
                      onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={variantForm.color_code}
                      onChange={(e) => setVariantForm({ ...variantForm, color_code: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={variantForm.color_code}
                      onChange={(e) => setVariantForm({ ...variantForm, color_code: e.target.value })}
                      placeholder="#1F2022"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={variantForm.price}
                    onChange={(e) => setVariantForm({ ...variantForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    MRP / List Price (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={variantForm.original_price}
                    onChange={(e) => setVariantForm({ ...variantForm, original_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={variantForm.stock_quantity}
                    onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* SKU & Image URL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                    placeholder="e.g. S26U-8-256-BLK"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Colour Image URL
                  </label>
                  <input
                    type="text"
                    value={variantForm.image_url}
                    onChange={(e) => setVariantForm({ ...variantForm, image_url: e.target.value })}
                    placeholder="https://... or /image.png"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="font-bold text-slate-900">Enable Variant for Customer Selection</div>
                  <div className="text-[11px] text-slate-500">When disabled, this combination will not be selectable by shoppers.</div>
                </div>
                <input
                  type="checkbox"
                  checked={variantForm.is_active}
                  onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsVariantModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : editingVariant ? "Update Variant" : "Add Variant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADJUST PRODUCT STOCK MODAL */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Adjust Product Stock Units</h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || adjustmentAmount === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
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
