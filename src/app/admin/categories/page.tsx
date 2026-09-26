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
} from "@fortawesome/free-solid-svg-icons";

interface Category {
  id: string;
  name: string;
  icon?: string;
  image_url?: string;
  sub_categories?: string[];
  is_active: boolean;
  display_order?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newSubCategoryTag, setNewSubCategoryTag] = useState("");

  const [formData, setFormData] = useState<Partial<Category>>({
    id: "",
    name: "",
    icon: "📱",
    image_url: "",
    sub_categories: [],
    is_active: true,
    display_order: 1,
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categoryList", { cache: "no-store" });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Categories fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      name: "",
      icon: "📱",
      image_url: "",
      sub_categories: ["General"],
      is_active: true,
      display_order: categories.length + 1,
    });
    setNewSubCategoryTag("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setIsEditing(true);
    setFormData({
      ...cat,
      sub_categories: Array.isArray(cat.sub_categories) ? cat.sub_categories : [],
    });
    setNewSubCategoryTag("");
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

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Data,
          folder: "myshop/categories",
          alt_text: formData.name || "Category Image",
        }),
      });

      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, image_url: data.url }));
      }
    } catch (err) {
      alert("Failed to upload image to Cloudinary");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddSubCategory = () => {
    const tag = newSubCategoryTag.trim();
    if (!tag) return;
    const current = formData.sub_categories || [];
    if (!current.includes(tag)) {
      setFormData({
        ...formData,
        sub_categories: [...current, tag],
      });
    }
    setNewSubCategoryTag("");
  };

  const handleRemoveSubCategory = (tagToRemove: string) => {
    setFormData({
      ...formData,
      sub_categories: (formData.sub_categories || []).filter((t) => t !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = await fetch("/api/categoryList", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch("/api/categoryList", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) throw new Error("Failed to save category");

      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categoryList?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Category & Subcategory Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Organize catalog classifications, subcategories, icons and display orders
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 text-sm">
            No categories created yet. Click "Add New Category" above.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-xs group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {cat.icon || "📱"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">{cat.name}</h3>
                      <span className="text-[11px] font-mono text-slate-500">ID: {cat.id}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      cat.is_active !== false
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {cat.is_active !== false ? "Active" : "Disabled"}
                  </span>
                </div>

                {/* Banner Image Preview */}
                {cat.image_url && (
                  <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 mb-4">
                    <Image src={cat.image_url} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                )}

                {/* Subcategories Tags */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Sub-Categories ({cat.sub_categories?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                    {cat.sub_categories && cat.sub_categories.length > 0 ? (
                      cat.sub_categories.map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No subcategories added</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Order: #{cat.display_order || 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors text-xs font-bold flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors text-xs font-bold"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mobiles & Accessories"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="📱"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm text-center focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Banner Image Upload to Cloudinary */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Category Banner Image (Cloudinary)
                </label>
                <div className="flex items-center gap-3">
                  {formData.image_url && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden relative border border-slate-200 shrink-0">
                      <Image src={formData.image_url} alt="Category" fill className="object-cover" />
                    </div>
                  )}
                  <label className="flex-1 border border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-emerald-50/40 transition-colors text-xs font-bold text-slate-700">
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="text-emerald-600" />
                    <span>{uploadingImage ? "Uploading to Cloudinary..." : "Choose Image"}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} disabled={uploadingImage} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Sub-categories Builder */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Sub-Categories
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubCategoryTag}
                    onChange={(e) => setNewSubCategoryTag(e.target.value)}
                    placeholder="e.g. Chargers, Power Bank, Laptops"
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubCategory}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 min-h-[40px]">
                  {formData.sub_categories?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-emerald-700 text-xs font-bold border border-emerald-200 shadow-xs"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubCategory(tag)}
                        className="text-slate-400 hover:text-rose-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active !== false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                  />
                  <span className="text-xs font-bold text-slate-700">Category Active</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Display Order:</span>
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
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
