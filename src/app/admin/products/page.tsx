"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faCloudUploadAlt,
  faTimes,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

interface Product {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
  sub_category?: string;
  price: number;
  original_price: number;
  stock_quantity: number;
  sku: string;
  image_url: string;
  images?: string[];
  description: string;
  unit: string;
  is_available: boolean;
  is_featured: boolean;
  is_popular: boolean;
  variants?: any[];
}

interface Category {
  id: string;
  name: string;
  sub_categories?: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    category_id: "mobiles-accessories",
    category_name: "Mobiles & Accessories",
    sub_category: "Mobile",
    price: 0,
    original_price: 0,
    stock_quantity: 15,
    sku: "",
    image_url: "",
    images: [],
    description: "",
    unit: "",
    is_available: true,
    is_featured: false,
    is_popular: false,
    variants: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [customSizeInput, setCustomSizeInput] = useState("");

  const getCategoryVariantConfig = (categoryId?: string, categoryName?: string, subCategory?: string) => {
    const cat = `${categoryId || ""} ${categoryName || ""}`.toLowerCase();
    const sub = (subCategory || "").toLowerCase();

    // 1. Fashion / Apparel / Clothing / Footwear / Bags
    if (
      cat.includes("fashion") || cat.includes("apparel") || cat.includes("cloth") || 
      cat.includes("wear") || cat.includes("shirt") || cat.includes("dress") || 
      sub.includes("shirt") || sub.includes("tshirt") || sub.includes("t-shirt") || 
      sub.includes("jean") || sub.includes("pant") || sub.includes("trouser") || 
      sub.includes("cloth") || sub.includes("kurti") || sub.includes("dress") || 
      sub.includes("shoe") || sub.includes("sneaker") || sub.includes("footwear") || 
      sub.includes("jacket") || sub.includes("bag") || sub.includes("handbag")
    ) {
      return {
        type: "fashion",
        sectionTitle: "👕 Apparel & Clothing Sizes / Fit Options",
        badge: "Fashion Sizes (S, M, L, XL...)",
        sectionSubtitle: "Add clothing sizes (S, M, L, XL, XXL) or waist & shoe measurements (28, 30, UK 8, UK 9). Customers will pick their size on the product page.",
        inputPlaceholder: "Type custom size (e.g. XL, 32, UK 9, 3XL, Free Size) and press Enter",
        addButtonLabel: "+ Add Apparel Size",
        activeBadgeTitle: "Configured Apparel Sizes:",
        presetGroups: [
          {
            groupName: "👕 Standard Apparel Sizes",
            presets: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "Free Size"]
          },
          {
            groupName: "👖 Waist / Denim Sizes (Inches)",
            presets: ["28", "30", "32", "34", "36", "38", "40", "42"]
          },
          {
            groupName: "👟 Footwear & Shoe Sizes (UK / US / EU)",
            presets: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"]
          },
          {
            groupName: "👶 Kids & Age Sizes",
            presets: ["2-3 Yrs", "3-4 Yrs", "5-6 Yrs", "7-8 Yrs", "9-10 Yrs", "11-12 Yrs", "13-14 Yrs"]
          }
        ]
      };
    }

    // 2. Jewellery
    if (
      cat.includes("jewel") || cat.includes("gold") || cat.includes("silver") || 
      cat.includes("diamond") || cat.includes("ring") || sub.includes("ring") || 
      sub.includes("necklace") || sub.includes("bangle") || sub.includes("earring")
    ) {
      return {
        type: "jewellery",
        sectionTitle: "💍 Jewellery Sizes, Metal Purity & Length Variants",
        badge: "Jewellery Sizes",
        sectionSubtitle: "Add ring sizes, chain lengths, or gold/silver purity weights for this jewellery item.",
        inputPlaceholder: "Type jewellery variant (e.g. Size 14, 18-inch, 22K 8g, 925 Silver) and press Enter",
        addButtonLabel: "+ Add Jewellery Variant",
        activeBadgeTitle: "Configured Jewellery Sizes / Variants:",
        presetGroups: [
          {
            groupName: "💍 Ring & Bangle Sizes",
            presets: ["Size 10", "Size 12", "Size 14", "Size 16", "Size 18", "Size 20", "2.4 Bangle", "2.6 Bangle", "2.8 Bangle", "Adjustable Size"]
          },
          {
            groupName: "✨ Chain & Necklace Lengths",
            presets: ["14 Inch (Choker)", "16 Inch", "18 Inch (Standard)", "20 Inch", "22 Inch", "24 Inch (Long)"]
          },
          {
            groupName: "🏆 Gold Purity & Certified Metals",
            presets: ["22K (916 BIS Hallmarked)", "18K Gold", "14K Gold", "925 Sterling Silver", "Solitaire Diamond VVS1", "Rose Gold"]
          },
          {
            groupName: "⚖️ Weight Options",
            presets: ["2 Grams", "4 Grams", "8 Grams (1 Sovereign / Pavan)", "10 Grams", "16 Grams", "20 Grams"]
          }
        ]
      };
    }

    // 3. EV Vehicles & Electric Scooters / Bikes
    if (
      cat.includes("ev") || cat.includes("vehicle") || cat.includes("scooter") || 
      cat.includes("bike") || sub.includes("scooter") || sub.includes("bike")
    ) {
      return {
        type: "ev",
        sectionTitle: "⚡ Battery Capacity, Range & Charger Variants",
        badge: "EV Trims & Battery",
        sectionSubtitle: "Add battery packs and range specifications (e.g. 3.7 kWh - 150 km Range, Dual Battery).",
        inputPlaceholder: "Type EV trim / battery (e.g. 3.7 kWh (150km), Fast Charger 3.3kW) and press Enter",
        addButtonLabel: "+ Add EV Trim / Variant",
        activeBadgeTitle: "Configured EV Trims:",
        presetGroups: [
          {
            groupName: "⚡ Battery Packs & Certified IDC Range",
            presets: ["2.5 kWh (85 km Range)", "3.4 kWh (120 km Range)", "3.7 kWh (150 km Range)", "4.0 kWh (195 km Pro Range)", "Dual Battery (220 km Pro Max)"]
          },
          {
            groupName: "🔌 Charger Bundles & Warranty",
            presets: ["Standard Home Charger 750W", "Fast Charger 3.3 kW", "Hypercharger Pro 6 kW", "8-Year Battery Warranty Pack"]
          }
        ]
      };
    }

    // 4. Computers, Laptops & Tablets
    if (
      cat.includes("computer") || cat.includes("laptop") || cat.includes("tablet") || 
      cat.includes("ipad") || sub.includes("laptop") || sub.includes("tablet")
    ) {
      return {
        type: "computers",
        sectionTitle: "💻 Processor, RAM & SSD Storage Variants",
        badge: "Computer Specs",
        sectionSubtitle: "Add RAM, SSD, or display size options for laptops and tablets.",
        inputPlaceholder: "Type configuration (e.g. 16GB RAM + 512GB SSD, 14 Inch OLED) and press Enter",
        addButtonLabel: "+ Add Configuration",
        activeBadgeTitle: "Configured Configurations:",
        presetGroups: [
          {
            groupName: "💻 Memory & SSD Combinations",
            presets: ["8GB RAM + 256GB SSD", "8GB RAM + 512GB SSD", "16GB RAM + 512GB SSD", "16GB RAM + 1TB SSD", "32GB RAM + 1TB SSD", "64GB RAM + 2TB SSD"]
          },
          {
            groupName: "🖥️ Display Sizes & Panel Types",
            presets: ["11 Inch iPad", "13.3 Inch Retina", "14 Inch OLED 120Hz", "15.6 Inch Full HD", "16 Inch Pro Max", "17.3 Inch Gaming 165Hz"]
          }
        ]
      };
    }

    // 5. TV, Audio & Home Entertainment
    if (
      cat.includes("tv") || cat.includes("audio") || cat.includes("sound") || 
      cat.includes("speaker") || sub.includes("tv") || sub.includes("audio")
    ) {
      return {
        type: "tv-audio",
        sectionTitle: "📺 Display Screen Size & Audio Power Variants",
        badge: "TV & Audio Sizes",
        sectionSubtitle: "Add TV screen inches or soundbar wattage configurations.",
        inputPlaceholder: "Type screen size or wattage (e.g. 55 Inch 4K OLED, 300W Dolby Atmos) and press Enter",
        addButtonLabel: "+ Add Screen / Audio Size",
        activeBadgeTitle: "Configured Screen / Audio Sizes:",
        presetGroups: [
          {
            groupName: "📺 TV Screen Sizes",
            presets: ["32 Inch HD Smart", "43 Inch 4K UHD", "50 Inch 4K HDR", "55 Inch 4K OLED", "65 Inch 4K QLED", "75 Inch 4K Ultra Cinema", "85 Inch 8K Master"]
          },
          {
            groupName: "🔊 Sound Output & Configurations",
            presets: ["100W 2.1 Stereo", "300W with Wireless Subwoofer", "500W Dolby Atmos 5.1", "800W 7.1.2 Spatial Surround"]
          }
        ]
      };
    }

    // 6. Kitchen & Home Appliances
    if (
      cat.includes("kitchen") || cat.includes("appliance") || cat.includes("home") || 
      sub.includes("grinder") || sub.includes("fryer") || sub.includes("fridge") || 
      sub.includes("refrigerator") || sub.includes("washing")
    ) {
      return {
        type: "appliances",
        sectionTitle: "🏠 Appliance Capacity, Wattage & Size Variants",
        badge: "Appliance Sizes",
        sectionSubtitle: "Add appliance capacity (Liters, Kg), motor wattage, or jar packs.",
        inputPlaceholder: "Type capacity or wattage (e.g. 750W 4 Jars, 7.5 Kg, 260 Liters) and press Enter",
        addButtonLabel: "+ Add Appliance Option",
        activeBadgeTitle: "Configured Appliance Options:",
        presetGroups: [
          {
            groupName: "🍳 Kitchen Appliances & Wattage",
            presets: ["500W (3 Jars)", "750W Heavy Duty (4 Jars)", "1000W Commercial", "1.5 Liters", "4.0 Liters (Air Fryer)", "6.5 Liters Family Size"]
          },
          {
            groupName: "🏠 Home Appliances & Refrigerators",
            presets: ["6.5 Kg Front Load", "7.5 Kg Fully Automatic", "8.5 Kg 5-Star", "190 Liters Single Door", "260 Liters Double Door Frost Free", "450 Liters Side-by-Side"]
          }
        ]
      };
    }

    // 7. Mobiles, Smartphones & Accessories (Default for tech / phones)
    return {
      type: "mobiles",
      sectionTitle: "📱 Storage & RAM / Device Variants",
      badge: "Mobile Storage & RAM",
      sectionSubtitle: "Add available storage capacities, RAM configurations, or dial sizes (e.g. 128 GB, 256 GB, 512 GB, 45mm). Customers will select their preferred variant on the product page.",
      inputPlaceholder: "Type storage/variant (e.g. 128 GB, 256 GB, 512 GB, 8GB/256GB, 45mm) and press Enter",
      addButtonLabel: "+ Add Storage / Variant",
      activeBadgeTitle: "Configured Storage & RAM:",
      presetGroups: [
        {
          groupName: "📱 RAM + Storage Combinations (Flagships & 5G)",
          presets: ["6GB RAM + 128GB ROM", "8GB RAM + 128GB ROM", "8GB RAM + 256GB ROM", "12GB RAM + 256GB ROM", "12GB RAM + 512GB ROM", "16GB RAM + 512GB ROM", "16GB RAM + 1TB ROM"]
        },
        {
          groupName: "💾 Internal Storage Only",
          presets: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"]
        },
        {
          groupName: "⌚ Smartwatch Dials & Fast Chargers",
          presets: ["40mm", "41mm", "44mm", "45mm", "49mm Ultra", "25W Charger", "45W Fast Charger", "65W GaN Pro"]
        }
      ]
    };
  };

  const getCurrentSizes = (): string[] => {
    if (!formData.unit) return [];
    return formData.unit
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleAddSize = (sizeToAdd: string) => {
    const trimmed = sizeToAdd.trim();
    if (!trimmed) return;
    const current = getCurrentSizes();
    if (!current.includes(trimmed)) {
      const next = [...current, trimmed];
      setFormData((prev) => ({ ...prev, unit: next.join(", ") }));
    }
    setCustomSizeInput("");
  };

  const handleRemoveSize = (indexToRemove: number) => {
    const current = getCurrentSizes();
    const next = current.filter((_, idx) => idx !== indexToRemove);
    setFormData((prev) => ({ ...prev, unit: next.join(", ") }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/productList", { cache: "no-store" }),
        fetch("/api/categoryList", { cache: "no-store" }),
      ]);

      const [prods, cats] = await Promise.all([prodRes.json(), catRes.json()]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    const defaultCat = categories[0]?.id || "mobiles-accessories";
    const defaultCatName = categories[0]?.name || "Mobiles & Accessories";
    setFormData({
      name: "",
      category_id: defaultCat,
      category_name: defaultCatName,
      sub_category: "Mobile",
      price: 0,
      original_price: 0,
      stock_quantity: 20,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      image_url: "",
      images: [],
      description: "",
      unit: "1 Unit",
      is_available: true,
      is_featured: false,
      is_popular: false,
      variants: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setIsEditing(true);
    setFormData({
      ...product,
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image_url],
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
            folder: "myshop/products",
            alt_text: formData.name || "Product Image",
          }),
        });

        const data = await res.json();
        if (data.url) {
          setFormData((prev) => {
            const currentImages = prev.images || [];
            const newImages = [...currentImages, data.url];
            return {
              ...prev,
              images: newImages,
              image_url: prev.image_url || data.url,
            };
          });
        }
      }
    } catch (err) {
      alert("Failed to upload image to Cloudinary.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const updated = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updated,
        image_url: updated.length > 0 ? updated[0] : "",
      };
    });
  };

  const handleSetPrimaryImage = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("Please enter product name and price");
      return;
    }

    setSubmitting(true);
    try {
      const cat = categories.find((c) => c.id === formData.category_id);
      const payload = {
        ...formData,
        category_name: cat ? cat.name : formData.category_name,
        price: Number(formData.price),
        original_price: Number(formData.original_price) || Number(formData.price),
        stock_quantity: Number(formData.stock_quantity) || 0,
      };

      let res;
      if (isEditing) {
        res = await fetch("/api/productList", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/productList", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Failed to save product");
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/productList?id=${productToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Failed to delete product");
      }
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      p.category_id === selectedCategory ||
      p.category_name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your store items, gallery images, pricing, and stock levels
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
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
            placeholder="Search products by name, SKU..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs px-3.5 py-2 focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-semibold">Loading product catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon icon={faBoxOpen} className="text-slate-300 text-4xl mb-2" />
            <p className="text-slate-800 font-bold text-base">No products found</p>
            <p className="text-slate-500 text-xs max-w-sm">
              Try adjusting your search criteria or add a new product.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Badges</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((p) => {
                  const isOutOfStock = (p.stock_quantity || 0) <= 0 || !p.is_available;
                  const isLowStock = !isOutOfStock && (p.stock_quantity || 0) <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                            {p.image_url ? (
                              <Image
                                src={p.image_url}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <FontAwesomeIcon icon={faBoxOpen} className="text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm truncate max-w-xs">{p.name}</h3>
                            <p className="text-[11px] text-slate-500 font-mono">SKU: {p.sku || p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        {p.category_name || p.category_id}
                        {p.sub_category && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {p.sub_category}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">₹{p.price?.toLocaleString("en-IN")}</div>
                        {p.original_price > p.price && (
                          <div className="text-[11px] text-slate-400 line-through">
                            ₹{p.original_price?.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold text-xs ${
                            isOutOfStock
                              ? "text-rose-600"
                              : isLowStock
                              ? "text-amber-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {p.stock_quantity || 0} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            p.is_available
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {p.is_available ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {p.is_featured && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              Featured
                            </span>
                          )}
                          {p.is_popular && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              Popular
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="Edit product"
                          >
                            <FontAwesomeIcon icon={faEdit} className="text-xs" />
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(p);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200 cursor-pointer"
                            title="Delete product"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isEditing ? "Edit Product" : "Add New Product"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Product Title & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apple iPhone 16 Pro Max 256GB"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU-IPH16"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        category_id: e.target.value,
                        category_name: cat?.name || "",
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Sub-Category
                  </label>
                  <input
                    type="text"
                    value={formData.sub_category}
                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                    placeholder="e.g. Mobile, Chargers, Storage"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Multiple Images Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Product Images
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {uploadingImage ? "Uploading images..." : "Click below to upload"}
                  </span>
                </div>

                {/* Upload Button */}
                <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-emerald-50/40 hover:bg-emerald-50 transition-all text-center group">
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    className="text-2xl text-emerald-600 group-hover:scale-110 transition-transform"
                  />
                  <div className="text-xs font-bold text-slate-800">
                    {uploadingImage ? "Uploading files..." : "Upload Images"}
                  </div>
                  <div className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP, GIF</div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                {/* Image Thumbnails List */}
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
                    {formData.images.map((imgUrl, idx) => {
                      const isPrimary = formData.image_url === imgUrl;
                      return (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-slate-50 group ${
                            isPrimary ? "border-emerald-600 shadow-md" : "border-slate-200"
                          }`}
                        >
                          <Image src={imgUrl} alt="Preview" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(imgUrl)}
                              title="Set as Main Cover"
                              className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              title="Remove image"
                              className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold"
                            >
                              ✕
                            </button>
                          </div>
                          {isPrimary && (
                            <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                              COVER
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dynamic Category Variant & Sizes Section */}
              {(() => {
                const variantConfig = getCategoryVariantConfig(
                  formData.category_id,
                  formData.category_name,
                  formData.sub_category
                );

                return (
                  <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                          {variantConfig.sectionTitle}
                        </label>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full">
                          {variantConfig.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-bold bg-white border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                        {getCurrentSizes().length} Sizes / Variants Added
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {variantConfig.sectionSubtitle}
                    </p>

                    {/* Active Configured Sizes Badges */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {variantConfig.activeBadgeTitle}
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 bg-white rounded-xl border border-slate-200 items-center shadow-2xs">
                        {getCurrentSizes().length === 0 ? (
                          <span className="text-xs text-slate-400 italic">
                            No sizes configured yet. Click the 1-tap suggestions below or enter custom sizes.
                          </span>
                        ) : (
                          getCurrentSizes().map((size, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-lg text-xs font-black shadow-xs animate-in zoom-in-95"
                            >
                              <span>{size}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(idx)}
                                className="w-4 h-4 rounded-full bg-emerald-200/80 hover:bg-rose-500 hover:text-white text-emerald-800 text-[10px] flex items-center justify-center transition-colors cursor-pointer"
                                title="Remove"
                              >
                                ✕
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Add Custom Variant / Size Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSize(customSizeInput);
                          }
                        }}
                        placeholder={variantConfig.inputPlaceholder}
                        className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSize(customSizeInput)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        {variantConfig.addButtonLabel}
                      </button>
                    </div>

                    {/* 1-Tap Category Presets Groups */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        ⚡ 1-Tap {variantConfig.badge} Presets (Click to Add / Remove):
                      </div>

                      <div className="space-y-2">
                        {variantConfig.presetGroups.map((group, gIdx) => (
                          <div key={gIdx} className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                            <div className="text-[10px] font-bold text-slate-600">
                              {group.groupName}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {group.presets.map((preset) => {
                                const isAdded = getCurrentSizes().includes(preset);
                                return (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                      if (isAdded) {
                                        const idx = getCurrentSizes().indexOf(preset);
                                        if (idx !== -1) handleRemoveSize(idx);
                                      } else {
                                        handleAddSize(preset);
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                                      isAdded
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs scale-105"
                                        : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
                                    }`}
                                  >
                                    {isAdded ? `✓ ${preset}` : `+ ${preset}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Full Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product features, specifications, box contents..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600 resize-none"
                />
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Active Status</div>
                    <div className="text-[10px] text-slate-500">Visible to customers</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Featured Product</div>
                    <div className="text-[10px] text-slate-500">Shown in featured grid</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Popular Tag</div>
                    <div className="text-[10px] text-slate-500">Highlighted on Home</div>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving to Supabase..." : isEditing ? "Update Product" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Delete Product?</h3>
            <p className="text-sm text-slate-500">
              Are you sure you want to permanently delete <strong>{productToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
