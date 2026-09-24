"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faArrowLeft, faSearch, faImages } from "@fortawesome/free-solid-svg-icons";


interface Category {
  id: string;
  name: string;
  image_url: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    image_url: ""
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    setIsAuthorized(true);
  }, []);

  async function fetchCategories() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categoryList");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {

      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];

      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image_url: localPreview }));

      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData
      });

      if (!response.ok) throw new Error("Upload failed");

      const { publicUrl } = await response.json();
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { 
        ...formData,
        id: editingCategory?.id 
      };
      
      const response = await fetch("/api/categoryList", {
        method: editingCategory ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save category");
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", image_url: "" });
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      alert(`Error saving category: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will affect products in this category.")) {
      try {
        const response = await fetch(`/api/categoryList?id=${id}`, {
          method: "DELETE"
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          if (err.error && err.error.includes('foreign key')) {
            alert("Cannot delete this category because it still has products. Please reassign or delete the products first.");
          } else {
            alert(err.error || "Error deleting category!");
          }
          return;
        }
        fetchCategories();
      } catch (err) {
        alert("Error deleting category! Make sure no products are assigned to it.");
      }
    }
  };

  const openModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        image_url: category.image_url
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", image_url: "" });
    }
    setIsModalOpen(true);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredCategories = (Array.isArray(categories) ? categories : []).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-accent/30 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <h1 className="text-3xl font-black">Manage Categories</h1>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-primary text-black font-black px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center gap-2 active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Category
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b">
            <div className="relative w-full md:w-96">
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search categories..." 
                className="w-full bg-accent/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-accent/50 text-gray-500 text-xs font-black uppercase tracking-widest text-center">
                  <th className="px-8 py-5">Image</th>
                  <th className="px-8 py-5">Name</th>
                  <th className="px-8 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="text-center font-bold">
                {isLoading ? (
                   <tr>
                     <td colSpan={3} className="py-20 text-gray-400">Loading categories...</td>
                   </tr>
                 ) : (Array.isArray(filteredCategories) ? filteredCategories : []).map((category) => (
                  <tr key={category.id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-inner bg-accent/20">
                        {category.image_url ? (
                          <Image src={category.image_url} alt={category.name} fill className="object-cover" unoptimized />
                        ) : (
                          <FontAwesomeIcon icon={faImages} className="absolute inset-0 m-auto text-gray-300 text-2xl" />
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-800">{category.name}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => openModal(category)}
                          className="w-10 h-10 rounded-xl hover:bg-blue-50 hover:text-blue-500 transition-all flex items-center justify-center border border-transparent hover:border-blue-100"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="w-10 h-10 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-6">{editingCategory ? "Edit Category" : "New Category"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Milk & Dairy"
                  className="w-full bg-accent/50 border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-4 ring-primary/20 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Image</label>
                <div className="flex items-center gap-4">
                   <div className="relative w-24 h-24 rounded-2xl bg-accent/50 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200">
                      {formData.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FontAwesomeIcon icon={faImages} className="text-gray-300 text-2xl" />
                      )}
                      {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full"></div></div>}
                   </div>
                   <label className="flex-1">
                      <div className="bg-accent hover:bg-accent/70 transition-colors py-4 px-6 rounded-2xl text-center cursor-pointer font-bold text-sm">
                        {uploading ? "Uploading..." : "Click to Upload"}
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || uploading}
                  className="flex-1 bg-primary text-black font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                   {isLoading ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
