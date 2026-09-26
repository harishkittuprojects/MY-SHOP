"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhotoVideo,
  faCloudUploadAlt,
  faCopy,
  faTrash,
  faCheck,
  faExternalLinkAlt,
  faFilePdf,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

interface MediaItem {
  id: string;
  public_id: string;
  url: string;
  secure_url: string;
  format?: string;
  resource_type?: string;
  bytes?: number;
  width?: number;
  height?: number;
  created_at?: string;
}

export default function AdminGalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery", { cache: "no-store" });
      const data = await res.json();
      setMedia(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gallery fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isPdf = file.type === "application/pdf";
        const reader = new FileReader();

        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64Data = await base64Promise;

        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Data,
            folder: "myshop/gallery",
            resource_type: isPdf ? "raw" : "auto",
            alt_text: file.name,
          }),
        });
      }

      await fetchMedia();
    } catch (err) {
      alert("Failed to upload file to Cloudinary");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm("Are you sure you want to delete this media file?")) return;
    try {
      const res = await fetch(`/api/admin/gallery?id=${item.id}&public_id=${item.public_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchMedia();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const filtered = media.filter(
    (m) =>
      (m.public_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.format || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Cloudinary Media Gallery</h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload and manage images and PDF documents served via Cloudinary global CDN
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-emerald-50/40 hover:bg-emerald-50 transition-all text-center group">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl border border-emerald-200 group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faCloudUploadAlt} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {uploading ? "Uploading to Cloudinary CDN..." : "Upload Images & PDF Files"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPG, PNG, WEBP, SVG, GIF and PDF documents up to 20MB
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Search & Counter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search media files..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
          />
        </div>
        <div className="text-xs text-slate-600 font-bold">
          Total Assets: <span className="text-emerald-700">{media.length}</span>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400 text-xs">Loading media assets...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 text-sm">
            No media files found. Upload images above!
          </div>
        ) : (
          filtered.map((item) => {
            const isPdf = item.format === "pdf" || item.resource_type === "raw";
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:border-emerald-300 transition-all flex flex-col justify-between shadow-xs"
              >
                <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                  {isPdf ? (
                    <div className="flex flex-col items-center gap-1 text-rose-500">
                      <FontAwesomeIcon icon={faFilePdf} className="text-3xl" />
                      <span className="text-[10px] font-black uppercase">PDF File</span>
                    </div>
                  ) : (
                    <Image
                      src={item.secure_url || item.url}
                      alt="Gallery Asset"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  )}

                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-white/90 shadow-xs text-[9px] font-mono font-bold text-slate-700 uppercase">
                    {item.format || "img"}
                  </span>
                </div>

                <div className="p-2.5 space-y-1.5 bg-white">
                  <div className="text-[10px] text-slate-600 font-mono truncate font-semibold">
                    {item.public_id?.split("/").pop() || item.id}
                  </div>
                  {item.bytes && (
                    <div className="text-[9px] text-slate-400">
                      {(item.bytes / 1024).toFixed(0)} KB {item.width ? `• ${item.width}×${item.height}` : ""}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                    <button
                      onClick={() => handleCopyUrl(item.secure_url || item.url, item.id)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        isCopied ? "bg-emerald-600 text-white" : "bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700"
                      }`}
                    >
                      <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />
                      <span>{isCopied ? "Copied" : "Copy URL"}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] cursor-pointer"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
