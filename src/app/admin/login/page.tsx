"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faArrowRight, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdminAuthenticated");
    if (isAdmin === "true") {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Use credentials from .env or fallback to project standards
    const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@madur.in").toUpperCase();
    const adminPassword = "admin123"; // Synced with .env

    if (formData.email.toUpperCase() === adminEmail && formData.password === adminPassword) {
      sessionStorage.setItem("isAdminAuthenticated", "true");
      router.push("/admin");
    } else {
      setError("Invalid admin credentials. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-24 flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 max-w-lg w-full relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>

        <div className="text-center mb-10 relative">
          <Link href="/" className="text-4xl font-black inline-block mb-6 tracking-tighter hover:scale-105 transition-transform">
            <span className="bg-primary text-primary-foreground px-4 py-1 rounded-2xl shadow-lg">MADUR</span>
            <span className="text-secondary">.IN</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-[2px] w-8 bg-primary/20"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Admin Access</span>
            <div className="h-[2px] w-8 bg-primary/20"></div>
          </div>
          <h2 className="text-3xl font-black text-gray-800">Owner Portal</h2>
          <p className="text-gray-500 text-sm mt-3">Secure access to your farm-fresh dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-gray-400 ml-1 uppercase tracking-widest">Administrator Email</label>
            <div className="relative group">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" 
              />
              <input 
                type="email" 
                required
                placeholder="admin@madur.in"
                className="w-full bg-accent/30 border-2 border-transparent rounded-[1.25rem] py-5 pl-14 pr-6 text-sm font-bold shadow-inner outline-none focus:border-primary/20 focus:bg-white focus:ring-4 ring-primary/5 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-gray-400 ml-1 uppercase tracking-widest flex justify-between">
              Owner Password
              <Link href="#" className="text-primary hover:underline lowercase tracking-normal">Need assistance?</Link>
            </label>
            <div className="relative group">
              <FontAwesomeIcon 
                icon={faLock} 
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" 
              />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-accent/30 border-2 border-transparent rounded-[1.25rem] py-5 pl-14 pr-6 text-sm font-bold shadow-inner outline-none focus:border-primary/20 focus:bg-white focus:ring-4 ring-primary/5 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="group bg-primary text-black font-black py-5 rounded-[1.25rem] shadow-[0_10px_30px_-10px_rgba(var(--primary-rgb),0.5)] hover:shadow-[0_15px_40px_-10px_rgba(var(--primary-rgb),0.6)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-70"
          >
            {isLoading ? "AUTHENTICATING..." : "ENTER DASHBOARD"}
            <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-12 text-center pt-8 border-t border-gray-100">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            Protected by <span className="text-gray-800">Madur Security</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
