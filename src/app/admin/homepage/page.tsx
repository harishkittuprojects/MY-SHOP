"use client";

import { useState, useEffect } from "react";
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
        reader.readAsDataURL(file);
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
    } catch (err) {
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Homepage & Banner Manager</h1>
          <p className="text-slate-500 text-sm mt-1">
            Control hero carousel slides, promotional cards, and announcement streaming bar
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({
              title: "",
              subtitle: "",
              tag: "Special Launch",
              image_url: "",
              link_url: "/products",
              button_text: "Explore Now",
              banner_type: "hero",
              display_order: slides.length + 1,
              is_active: true,
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* Announcement Bar Editor */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <FontAwesomeIcon icon={faBullhorn} className="text-emerald-600" />
          <span>Top Announcement / Streaming Tagline</span>
        </div>
        <p className="text-xs text-slate-500">
          This message streams across the top announcement bar on every page of your store.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="e.g. 🚀 Mega Festival Sale: Flat 20% OFF on all 5G Smartphones! Use code: FESTIVAL20"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
          />
          <button
            onClick={handleSaveAnnouncement}
            disabled={announcementSaving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <FontAwesomeIcon icon={faSave} />
            <span>{announcementSaving ? "Saving..." : "Update Announcement"}</span>
          </button>
        </div>
      </div>

      {/* Hero Slides Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">Hero Carousel Banners ({slides.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-slate-400 text-xs">Loading banners...</div>
          ) : slides.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 text-sm">
              No banners found. Add your first hero slide!
            </div>
          ) : (
            slides.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image Preview */}
                  <div className="relative w-full aspect-[16/9] bg-slate-50">
                    {s.image_url ? (
                      <Image src={s.image_url} alt={s.title || "Banner"} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        No image uploaded
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        s.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {s.is_active ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    {s.tag && (
                      <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                        {s.tag}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{s.title || "Untitled Slide"}</h3>
                    <p className="text-xs text-slate-500">{s.subtitle || "No subtitle"}</p>
                    <div className="text-[11px] text-slate-400 truncate">Link: {s.link_url || "/products"}</div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Order #{s.display_order || 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setFormData({ ...s });
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? "Edit Hero Slide" : "Add New Hero Slide"}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Banner Image (Cloudinary) *
                </label>
                <div className="flex items-center gap-3">
                  {formData.image_url && (
                    <div className="w-16 h-12 rounded-xl overflow-hidden relative border border-slate-200 shrink-0">
                      <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <label className="flex-1 border border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-emerald-50/40 transition-colors text-xs font-bold text-slate-700">
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="text-emerald-600" />
                    <span>{uploadingImage ? "Uploading to Cloudinary..." : "Choose Banner Image"}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} disabled={uploadingImage} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Slide Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Apple iPhone 16 Pro Max Launch"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Subtitle / Highlights
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Titanium Finish • 48MP Camera • 0% EMI"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Tag / Badge
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. Special Offer"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Redirect Link
                  </label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="/products"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                  />
                  <span className="text-xs font-bold text-slate-700">Slide Active</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Order:</span>
                  <input
                    type="number"
                    value={formData.display_order || 1}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs text-center"
                  />
                </div>
              </div>

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
                  {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
