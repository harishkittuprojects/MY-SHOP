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
  faBullhorn,
  faSave,
  faSliders,
  faLayerGroup,
  faTv,
  faShoppingBag,
  faLink,
} from "@fortawesome/free-solid-svg-icons";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  tag?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  banner_type?: string;
  display_order?: number;
  is_active: boolean;
}

export default function AdminHomepagePage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "hero" | "products">("all");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    title: "",
    subtitle: "",
    tag: "Special Offer",
    image_url: "",
    link_url: "/products",
    button_text: "Shop Now",
    banner_type: "hero",
    display_order: 1,
    is_active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slidesRes, settingsRes] = await Promise.all([
        fetch("/api/admin/homepage", { cache: "no-store" }),
        fetch("/api/admin/settings", { cache: "no-store" }),
      ]);
      const [slidesData, settingsData] = await Promise.all([slidesRes.json(), settingsRes.json()]);
      setSlides(Array.isArray(slidesData) ? slidesData : []);
      if (settingsData?.announcement_text) {
        setAnnouncementText(settingsData.announcement_text);
      }
    } catch (err) {
      console.error("Homepage fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSlides = useMemo(() => {
    if (activeTab === "all") return slides;
    if (activeTab === "products") {
      return slides.filter((s) => s.banner_type === "products");
    }
    return slides.filter((s) => !s.banner_type || s.banner_type === "hero" || s.banner_type === "all");
  }, [slides, activeTab]);

  const handleSaveAnnouncement = async () => {
    setAnnouncementSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcement_text: announcementText }),
      });
      if (!res.ok) throw new Error("Failed to save announcement");
      alert("Announcement banner updated successfully!");
    } catch (err: any) {
      alert(err.message || "Save failed");
    } finally {
      setAnnouncementSaving(false);
    }
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
      });

      const base64Data = await base64Promise;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Data,
          folder: "myshop/banners",
          alt_text: formData.title || "Banner Image",
        }),
      });

      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, image_url: data.url }));
      }
    } catch {
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      alert("Please upload or provide an image URL");
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = await fetch("/api/admin/homepage", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch("/api/admin/homepage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) throw new Error("Operation failed");
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`/api/admin/homepage?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FontAwesomeIcon icon={faSliders} className="text-emerald-600 text-xl sm:text-2xl" />
            <span>Banners &amp; Promos Manager</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage promotional banners for Homepage Hero Slider, Products Page Showcase, and live announcement bars.
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({
              title: "",
              subtitle: "",
              tag: "Special Offer",
              image_url: "",
              link_url: activeTab === "products" ? "/products" : "/products",
              button_text: "Shop Now",
              banner_type: activeTab === "products" ? "products" : "hero",
              display_order: slides.length + 1,
              is_active: true,
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95 transition-all"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Announcement Bar Editor */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
          <FontAwesomeIcon icon={faBullhorn} className="text-emerald-600" />
          <span>Top Announcement Streaming Tagline</span>
        </div>
        <p className="text-xs text-slate-500">
          Streams continuously across the top announcement bar on every page of your store.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="e.g. 🚀 Mega Festival Sale: Flat 20% OFF on all 5G Smartphones! Use code: FESTIVAL20"
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
          />
          <button
            onClick={handleSaveAnnouncement}
            disabled={announcementSaving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs shrink-0"
          >
            <FontAwesomeIcon icon={faSave} />
            <span>{announcementSaving ? "Saving..." : "Update Announcement"}</span>
          </button>
        </div>
      </div>

      {/* Placement Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FontAwesomeIcon icon={faLayerGroup} />
          <span>All Banners ({slides.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "hero"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FontAwesomeIcon icon={faTv} />
          <span>Homepage Hero Banners ({slides.filter(s => !s.banner_type || s.banner_type === "hero" || s.banner_type === "all").length})</span>
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "products"
              ? "bg-[#2E6F40] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FontAwesomeIcon icon={faShoppingBag} />
          <span>Products Page Showcase Banners ({slides.filter(s => s.banner_type === "products").length})</span>
        </button>
      </div>

      {/* Banner Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            {activeTab === "all"
              ? `All Active & Inactive Banners (${filteredSlides.length})`
              : activeTab === "hero"
              ? `Homepage Carousel Slides (${filteredSlides.length})`
              : `Products Page Showcase Banners (${filteredSlides.length})`}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400 text-xs font-bold">
              Loading banners...
            </div>
          ) : filteredSlides.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-slate-500 text-sm font-semibold mb-3">
                No banners found in this category.
              </p>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    title: "",
                    subtitle: "",
                    tag: "Special Offer",
                    image_url: "",
                    link_url: activeTab === "products" ? "/products" : "/products",
                    button_text: "Shop Now",
                    banner_type: activeTab === "products" ? "products" : "hero",
                    display_order: 1,
                    is_active: true,
                  });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                + Create Banner
              </button>
            </div>
          ) : (
            filteredSlides.map((s) => {
              const isProductBanner = s.banner_type === "products";
              return (
                <div
                  key={s.id}
                  className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Banner Image Preview */}
                    <div className="relative w-full aspect-[16/8] sm:aspect-[16/9] bg-slate-100">
                      {s.image_url ? (
                        <Image
                          src={s.image_url}
                          alt={s.title || "Banner"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold">
                          No image uploaded
                        </div>
                      )}

                      {/* Placement Tag Badge */}
                      <span
                        className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight shadow-xs ${
                          isProductBanner
                            ? "bg-[#2E6F40] text-white"
                            : "bg-slate-900 text-white"
                        }`}
                      >
                        {isProductBanner ? "Products Page" : "Homepage Hero"}
                      </span>

                      {/* Active / Disabled Tag */}
                      <span
                        className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase shadow-xs ${
                          s.is_active
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {s.is_active ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 space-y-2">
                      {s.tag && (
                        <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded tracking-wider">
                          {s.tag}
                        </span>
                      )}
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {s.title || "Untitled Banner"}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {s.subtitle || "No subtitle"}
                      </p>
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-1">
                        <FontAwesomeIcon icon={faLink} className="text-[10px]" />
                        <span>{s.link_url || "/products"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">
                      Order #{s.display_order || 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setFormData({ ...s });
                          setIsModalOpen(true);
                        }}
                        className="p-2 px-3 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Add or Edit Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {isEditing ? "Edit Promotional Banner" : "Add New Promotional Banner"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* Placement Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Banner Placement <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, banner_type: "hero" })}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      formData.banner_type !== "products"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-black">🏠 Homepage Hero</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Top slider carousel</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, banner_type: "products" })}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      formData.banner_type === "products"
                        ? "border-[#2E6F40] bg-emerald-50 text-[#2E6F40] ring-2 ring-[#2E6F40]/20"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-black">🛍️ Products Page</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Catalog showcase slider</div>
                  </button>
                </div>
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Banner Image <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-emerald-50/40 transition-colors text-xs font-bold text-slate-700">
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="text-emerald-600 text-sm" />
                    <span>{uploadingImage ? "Uploading image..." : "Upload Image File from Device"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    value={formData.image_url || ""}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                    required
                  />

                  {formData.image_url && (
                    <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <Image
                        src={formData.image_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Festival Mega Sale"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tag / Badge
                  </label>
                  <input
                    type="text"
                    value={formData.tag || ""}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. Special Offer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Subtitle / Highlights
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ""}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Flat ₹10,000 Instant Card Discount • 0% EMI"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Redirect Link URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Redirect Link URL
                </label>
                <input
                  type="text"
                  value={formData.link_url || ""}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/products?category=Mobiles"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                />
                {/* Quick Suggestion Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  <span className="text-[10px] text-slate-400 font-bold">Quick:</span>
                  {[
                    { label: "All Products", url: "/products" },
                    { label: "Mobiles", url: "/products?category=Mobiles" },
                    { label: "Accessories", url: "/products?category=Mobile%20Accessories" },
                    { label: "Smart Tech", url: "/products?category=Smart%20Technology" },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, link_url: chip.url })}
                      className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-[10px] font-semibold border border-slate-200 transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Display Order */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">Banner Active (Published)</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-bold">Display Order:</span>
                  <input
                    type="number"
                    value={formData.display_order || 1}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs text-center font-bold"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer transition-all active:scale-95"
                >
                  {submitting ? "Saving..." : isEditing ? "Save Changes" : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
