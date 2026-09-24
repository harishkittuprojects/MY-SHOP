"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faArrowLeft, faImages, faUpload, faGripLines } from "@fortawesome/free-solid-svg-icons";


interface HeroImage {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  display_order: number;
}

export default function AdminHeroPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [images, setImages] = useState<HeroImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
    setIsAuthorized(true);
  }, []);

  async function fetchImages() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/heroSlides");
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Error fetching images:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");

      const { publicUrl } = await response.json();

      // Add to MySQL
      const dbRes = await fetch("/api/heroSlides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: publicUrl })
      });

      if (!dbRes.ok) throw new Error("Failed to save hero slide");
      
      fetchImages();
    } catch (error) {
      console.error("Error uploading hero image:", error);
      alert("Error uploading image!");
    } finally {
      setUploading(false);
    }
  };

  const handleMigrateDefaults = async () => {
    try {
      setUploading(true);
      const defaults = [
        "/hero/hero-1.png",
        "/hero/hero-2.png",
        "/hero/hero-3.png",
        "/hero/hero-4.png",
        "/hero/hero-5.png",
      ];

      for (const url of defaults) {
        await fetch("/api/heroSlides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: url })
        });
      }
      
      fetchImages();
    } catch (error) {
      console.error("Error migrating defaults:", error);
      alert("Error migrating defaults!");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, isDefault?: boolean) => {
    if (isDefault) {
      alert("System defaults cannot be deleted until you click 'Manage System Defaults' to add them to your database.");
      return;
    }
    if (confirm("Delete this hero banner?")) {
      try {
        const response = await fetch(`/api/heroSlides?id=${id}`, {
          method: "DELETE"
        });
        if (!response.ok) throw new Error("Failed to delete");
        fetchImages();
      } catch (err) {
        alert("Error deleting image!");
      }
    }
  };

  if (!isAuthorized) {
    return <div className="min-h-screen bg-accent/30"></div>;
  }

  return (
    <div className="min-h-screen bg-accent/30 p-4 md:p-8 text-black">
      <div className="container mx-auto max-w-5xl">
         <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
                <Link href="/admin" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 shadow-lg">
                  <FontAwesomeIcon icon={faArrowLeft} />
                </Link>
                <div>
                  <h1 className="text-4xl font-black tracking-tighter">Hero Section</h1>
                  <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage Home Carousel</p>
                </div>
            </div>
            
            <label className="cursor-pointer">
               <div className="bg-primary text-black font-black px-8 py-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(var(--primary-rgb),0.5)] hover:bg-white transition-all flex items-center gap-3">
                  <FontAwesomeIcon icon={faUpload} />
                  {uploading ? "Uploading..." : "Add Banner"}
               </div>
               <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
            </label>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(Array.isArray(images) && images.length > 0) ? images.map((img, index) => (
              <div key={img.id} className="group relative bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                 <div className="absolute top-8 left-8 z-10 bg-black/60 backdrop-blur-md text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-white/20">
                    Slide {index + 1}
                 </div>
                 
                 <div className="relative aspect-[16/9] rounded-[1.5rem] overflow-hidden shadow-inner bg-accent/20">
                    <Image src={img.image_url} alt="Hero Banner" fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <button 
                      onClick={() => handleDelete(img.id)}
                      className="absolute bottom-6 right-6 w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-200 translate-y-20 group-hover:translate-y-0 transition-all duration-300"
                    >
                       <FontAwesomeIcon icon={faTrash} />
                    </button>
                 </div>
                 
                 <div className="pt-6 px-4 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-gray-400">
                       <FontAwesomeIcon icon={faGripLines} className="cursor-grab active:cursor-grabbing" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Hold to reorder</span>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary">Active</span>
                    </div>
                 </div>
              </div>
            )) : [1,2,3,4,5].map((num, index) => (

              <div key={num} className="group relative bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                 <div className="absolute top-8 left-8 z-10 bg-gray-600 backdrop-blur-md text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-white/20">
                    System Default {num}
                 </div>
                 
                 <div className="relative aspect-[16/9] rounded-[1.5rem] overflow-hidden shadow-inner bg-accent/20">
                    <Image src={`/hero/hero-${num}.png`} alt="Default Banner" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" unoptimized />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <p className="text-white font-black uppercase tracking-[0.2em] text-xs">Locked Default</p>
                    </div>
                 </div>
                 
                 <div className="pt-6 px-4 border-t border-dashed border-gray-100 mt-2 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Database entry missing</span>
                    <button disabled className="text-[10px] font-black uppercase tracking-widest text-gray-300">Default</button>
                 </div>
              </div>
            ))}
         </div>

         {images.length === 0 && !isLoading && (
            <div className="mt-12 p-10 bg-white rounded-[3rem] border-2 border-dashed border-primary/20 text-center shadow-2xl animate-in slide-in-from-bottom-5">
               <h3 className="text-2xl font-black text-black mb-4 italic">Unmanaged System Content Detected</h3>
               <p className="max-w-xl mx-auto text-gray-500 font-bold mb-8 leading-relaxed">
                  Your website is currently showing 5 default banners that are hardcoded. 
                  To edit, delete, or replace them, you must first add them to your management system.
               </p>
               <button 
                 onClick={handleMigrateDefaults}
                 disabled={uploading}
                 className="bg-black text-primary font-black px-10 py-5 rounded-[2rem] hover:scale-105 transition-all shadow-2xl active:scale-95 flex items-center gap-3 mx-auto"
               >
                  <FontAwesomeIcon icon={faPlus} />
                  {uploading ? "Configuring..." : "Migrate Defaults to Manager"}
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
