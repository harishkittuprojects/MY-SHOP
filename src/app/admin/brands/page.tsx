"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faCloudUploadAlt,
  faTimes,
  faSearch,
  faTag,
  faMobileScreenButton,
  faCheck,
  faEye,
  faRefresh,
  faLayerGroup
} from "@fortawesome/free-solid-svg-icons";

interface Brand {
  id: string;
  name: string;
  query: string;
  category: string;
  logo_url?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

const CATEGORIES = [
  "Mobiles",
  "Mobile Accessories",
  "Old / Refurbished Mobiles",
  "Smart Technology",
  "Computers & Tablets",
  "TV & Audio",
  "Fashion",
  "Jewellery",
  "EV Vehicles",
  "All"
];

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<Partial<Brand>>({
    id: "",
    name: "",
    query: "",
    category: "Mobiles",
    logo_url: "",
    is_active: true,
    display_order: 1,
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/brands", { cache: "no-store" });
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Brands fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      name: "",
      query: "",
      category: selectedCategoryTab !== "All" ? selectedCategoryTab : "Mobiles",
      logo_url: "",
      is_active: true,
      display_order: brands.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: Brand) => {
    setIsEditing(true);
    setFormData({ ...brand });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;
      // Immediately set the base64 preview so the image shows right away
      setFormData((prev) => ({ ...prev, logo_url: base64Data }));

      // Upload to Cloudinary / storage for CDN optimization
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Data,
          data: base64Data,
          folder: "brands",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url || data.secure_url) {
          setFormData((prev) => ({ ...prev, logo_url: data.url || data.secure_url }));
        }
      }
    } catch (err) {
      console.warn("Cloud upload warning (retaining base64 image):", err);
    } finally {
      setUploadingImage(false);
      // Reset input value so user can re-select same or different image
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("Brand name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const url = "/api/admin/brands";
      const method = isEditing ? "PUT" : "POST";
      const payload = {
        ...formData,
        query: formData.query?.trim() || formData.name?.trim(),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save brand");
      }

      await fetchBrands();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to save brand");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete brand "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/brands?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete brand");
      await fetchBrands();
    } catch (err: any) {
      alert(err.message || "Failed to delete brand");
    }
  };

  const handleToggleStatus = async (brand: Brand) => {
    try {
      const res = await fetch("/api/admin/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: brand.id,
          is_active: !brand.is_active,
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      await fetchBrands();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  // Filtered list
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchesSearch =
        (b.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.query || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        selectedCategoryTab === "All" ||
        (b.category || "").toLowerCase() === selectedCategoryTab.toLowerCase();

      return matchesSearch && matchesTab;
    });
  }, [brands, searchQuery, selectedCategoryTab]);

  const stats = useMemo(() => {
    const total = brands.length;
    const active = brands.filter((b) => b.is_active).length;
    const mobiles = brands.filter((b) => (b.category || "").toLowerCase() === "mobiles").length;
    const accessories = brands.filter((b) => (b.category || "").toLowerCase().includes("accessories")).length;
    return { total, active, mobiles, accessories };
  }, [brands]);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-[#2E6F40] flex items-center justify-center text-sm font-black">
              <FontAwesomeIcon icon={faMobileScreenButton} />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mobile Brands Management</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Add, update, or remove mobile and device brands shown in store filters &amp; quick brand selectors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBrands}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            title="Refresh Brands"
          >
            <FontAwesomeIcon icon={faRefresh} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 rounded-2xl bg-[#2E6F40] hover:bg-[#245e35] text-white font-black text-xs transition-all shadow-md shadow-emerald-800/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add New Brand</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Brands</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Active Brands</span>
          <span className="text-2xl font-black text-[#2E6F40] mt-1 block">{stats.active}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Mobile Brands</span>
          <span className="text-2xl font-black text-blue-900 mt-1 block">{stats.mobiles}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 bg-purple-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Accessories Brands</span>
          <span className="text-2xl font-black text-purple-900 mt-1 block">{stats.accessories}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search brands by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E6F40]/30 focus:border-[#2E6F40]"
            />
          </div>

          <span className="text-xs text-slate-500 font-bold self-end sm:self-center">
            Showing <strong className="text-slate-900">{filteredBrands.length}</strong> brands
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryTab(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                selectedCategoryTab === cat
                  ? "bg-[#2E6F40] text-white shadow-xs font-black"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brands Table & Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm">
            <FontAwesomeIcon icon={faRefresh} className="animate-spin text-2xl text-[#2E6F40] mb-2 block mx-auto" />
            Loading brand repository...
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
              <FontAwesomeIcon icon={faTag} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No brands found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? "Try searching with a different term" : "Click the button below to add your first mobile brand."}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-[#2E6F40] hover:bg-[#245e35] text-white font-bold text-xs shadow-xs"
            >
              + Add Brand Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4">Search Query</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{brand.display_order || 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => handleOpenEditModal(brand)}
                          className="w-11 h-11 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden relative p-1 cursor-pointer hover:border-[#2E6F40] transition-colors"
                          title="Click to change logo"
                        >
                          {brand.logo_url ? (
                            <Image
                              src={brand.logo_url}
                              alt={brand.name}
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 hover:text-[#2E6F40]">
                              <FontAwesomeIcon icon={faCloudUploadAlt} className="text-xs" />
                              <span className="text-[8px] font-bold mt-0.5">+Logo</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{brand.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">id: {brand.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                        ?search={brand.query}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {brand.category || "Mobiles"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(brand)}
                        className={`px-3 py-1 rounded-full text-[11px] font-black cursor-pointer transition-all ${
                          brand.is_active
                            ? "bg-emerald-100 text-[#2E6F40] hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {brand.is_active ? "✓ Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(brand)}
                          className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit Brand"
                        >
                          <FontAwesomeIcon icon={faEdit} className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id, brand.name)}
                          className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete Brand"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================= ADD / EDIT BRAND MODAL ======================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs cursor-pointer transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {/* Modal Header */}
            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2E6F40] bg-emerald-50 px-2 py-0.5 rounded">
                {isEditing ? "Edit Mobile Brand" : "Add New Mobile Brand"}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                {isEditing ? `Edit "${formData.name}"` : "Create Brand"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload official brand logo image to display across website filters &amp; brand cards.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand Logo Upload & Live Preview Canvas */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Brand Logo Image <span className="text-emerald-700 font-bold">(Recommended)</span>
                </label>

                <div className="flex items-center gap-3">
                  {/* Visual Logo Preview */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative shrink-0 shadow-2xs">
                    {formData.logo_url ? (
                      <Image
                        src={formData.logo_url}
                        alt="Logo preview"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <div className="text-center p-1 text-slate-400">
                        <FontAwesomeIcon icon={faCloudUploadAlt} className="text-lg mb-0.5" />
                        <span className="text-[9px] font-bold block leading-none">No Logo</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions & Controls */}
                  <div className="flex-1 space-y-1.5">
                    <label className="w-full py-2 px-3 rounded-xl bg-[#2E6F40] hover:bg-[#255a33] text-white font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 text-center">
                      <FontAwesomeIcon icon={faCloudUploadAlt} />
                      <span>{uploadingImage ? "Uploading Image..." : "Upload Image from Device"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={formData.logo_url || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2E6F40]"
                    />
                  </div>
                </div>

                {/* Quick 1-Click Popular Brand Logo Presets */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Quick Presets (1-Click Fill):</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {[
                      { name: "Samsung", url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
                      { name: "Apple", url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
                      { name: "OnePlus", url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/OP_LU_RGB_red_191211.svg" },
                      { name: "Pixel", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
                      { name: "Vivo", url: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Vivo_mobile_logo.png" },
                      { name: "Motorola", url: "https://upload.wikimedia.org/wikipedia/commons/4/47/Motorola_new_logo.svg" },
                      { name: "Realme", url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Realme_logo.svg" },
                      { name: "Redmi", url: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg" },
                      { name: "Nothing", url: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Nothing_Technology_Limited_logo.svg" },
                      { name: "iQOO", url: "https://upload.wikimedia.org/wikipedia/commons/7/77/IQOO_logo.svg" },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            logo_url: preset.url,
                            name: prev.name || preset.name,
                            query: prev.query || preset.name,
                          }));
                        }}
                        className="px-2 py-0.5 bg-white hover:bg-emerald-50 text-slate-600 hover:text-[#2E6F40] border border-slate-200 hover:border-emerald-300 rounded-md text-[10px] font-bold shrink-0 transition-colors shadow-2xs"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone, Vivo, Google Pixel, Nothing"
                  value={formData.name || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: val,
                      query: !isEditing && (!prev.query || prev.query === prev.name) ? val : prev.query,
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E6F40]/30 focus:border-[#2E6F40]"
                />
              </div>

              {/* Search Query / Keyword */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Search Keyword / Filter Query <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple, Vivo, Pixel, Nothing"
                  value={formData.query || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, query: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E6F40]/30 focus:border-[#2E6F40]"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                  When a customer clicks this brand, products containing this keyword will be displayed.
                </span>
              </div>

              {/* Target Category & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category || "Mobiles"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E6F40]/30 focus:border-[#2E6F40]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order || 1}
                    onChange={(e) => setFormData((prev) => ({ ...prev, display_order: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E6F40]/30 focus:border-[#2E6F40]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Active Status</span>
                  <span className="text-[10px] text-slate-400">Show this brand in live store brand cards</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 rounded text-[#2E6F40] accent-[#2E6F40] cursor-pointer"
                />
              </div>

              {/* Live Preview Card */}
              <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2E6F40] flex items-center gap-1">
                  <FontAwesomeIcon icon={faEye} />
                  <span>Live Storefront Card Preview</span>
                </span>
                <div className="flex items-center gap-3 pt-1">
                  {/* Mini Product Card Preview */}
                  <div className="w-28 bg-white rounded-xl border border-slate-200 shadow-xs p-2 flex flex-col items-center">
                    <div className="w-12 h-10 bg-slate-50 rounded-lg flex items-center justify-center relative overflow-hidden mb-1 p-1">
                      {formData.logo_url ? (
                        <Image src={formData.logo_url} alt="preview" fill className="object-contain" unoptimized />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Logo</span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 truncate w-full text-center">{formData.name || "Brand"}</span>
                    <span className="text-[9px] font-bold bg-[#2E6F40] text-white px-2 py-0.5 rounded-full mt-1">Explore</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#2E6F40] hover:bg-[#245e35] text-white font-black text-xs shadow-md shadow-emerald-800/20 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faRefresh} className="animate-spin text-xs" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{isEditing ? "Save Changes" : "Create Brand"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
