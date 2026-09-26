"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEnvelope, faShieldAlt, faArrowRight, faStore, faKey } from "@fortawesome/free-solid-svg-icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid administrator credentials");
      }

      sessionStorage.setItem("isAdminAuthenticated", "true");
      sessionStorage.setItem("adminUser", JSON.stringify(data.admin));
      localStorage.setItem("isAdminAuthenticated", "true");
      localStorage.setItem("adminUser", JSON.stringify(data.admin));

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans text-slate-800">
      {/* Background Accent Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100/60 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl shadow-xl shadow-emerald-600/20 mb-4">
            MS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage products, orders, inventory & store settings</p>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
              <span className="text-base">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FontAwesomeIcon icon={faLock} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In to Admin Panel</span>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </>
                )}
              </button>

              {/* 1-Click Quick Auto Fill & Login */}
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setEmail("admin@example.com");
                  setPassword("admin123");
                  setLoading(true);
                  setError(null);
                  try {
                    const res = await fetch("/api/admin/auth", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) throw new Error(data.error || "Login failed");
                    sessionStorage.setItem("isAdminAuthenticated", "true");
                    sessionStorage.setItem("adminUser", JSON.stringify(data.admin));
                    localStorage.setItem("isAdminAuthenticated", "true");
                    localStorage.setItem("adminUser", JSON.stringify(data.admin));
                    router.push("/admin");
                  } catch (err: any) {
                    setError(err.message || "Failed to authenticate");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡ 1-Click Auto Fill & Instant Login</span>
              </button>
            </div>
          </form>

          {/* Quick Auto-Fill Selector */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Auto-Fill Options
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@example.com");
                  setPassword("admin123");
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <FontAwesomeIcon icon={faKey} className="text-emerald-600 text-xs" />
                <span>Auto-Fill Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Back to store */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-700 text-xs font-semibold transition-colors"
          >
            <FontAwesomeIcon icon={faStore} />
            <span>Return to Customer Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
