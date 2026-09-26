"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faBox,
  faTags,
  faShoppingBag,
  faWarehouse,
  faUsers,
  faCreditCard,
  faTicketAlt,
  faImage,
  faPhotoVideo,
  faChartLine,
  faUserShield,
  faHistory,
  faCog,
  faSignOutAlt,
  faBars,
  faTimes,
  faStore,
} from "@fortawesome/free-solid-svg-icons";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: faChartPie, permission: "all" },
  { href: "/admin/products", label: "Products", icon: faBox, permission: "products" },
  { href: "/admin/categories", label: "Categories", icon: faTags, permission: "categories" },
  { href: "/admin/orders", label: "Orders", icon: faShoppingBag, permission: "orders" },
  { href: "/admin/inventory", label: "Inventory", icon: faWarehouse, permission: "inventory" },
  { href: "/admin/customers", label: "Customers", icon: faUsers, permission: "customers" },
  { href: "/admin/payments", label: "Payments", icon: faCreditCard, permission: "orders" },
  { href: "/admin/coupons", label: "Offers & Coupons", icon: faTicketAlt, permission: "coupons" },
  { href: "/admin/homepage", label: "Homepage Banners", icon: faImage, permission: "banners" },
  { href: "/admin/gallery", label: "Media Gallery", icon: faPhotoVideo, permission: "gallery" },
  { href: "/admin/reports", label: "Reports & Sales", icon: faChartLine, permission: "reports" },
  { href: "/admin/users", label: "Admin Users", icon: faUserShield, permission: "users" },
  { href: "/admin/logs", label: "Activity Logs", icon: faHistory, permission: "logs" },
  { href: "/admin/settings", label: "Site Settings", icon: faCog, permission: "settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";
    if (isLoginPage) {
      setIsAuthorized(true);
      return;
    }

    const storedAuth = sessionStorage.getItem("isAdminAuthenticated") || localStorage.getItem("isAdminAuthenticated");
    const storedUser = sessionStorage.getItem("adminUser") || localStorage.getItem("adminUser");

    if (storedAuth === "true") {
      setIsAuthorized(true);
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch {
          setCurrentUser({
            id: "1",
            name: "Super Admin",
            email: "admin@example.com",
            role: "superadmin",
            permissions: ["all"]
          });
        }
      } else {
        setCurrentUser({
          id: "1",
          name: "Super Admin",
          email: "admin@example.com",
          role: "superadmin",
          permissions: ["all"]
        });
      }
    } else {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    sessionStorage.removeItem("adminUser");
    localStorage.removeItem("isAdminAuthenticated");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm tracking-wide">Securing Admin Access...</p>
        </div>
      </div>
    );
  }

  const hasPermission = (permission: string) => {
    if (!currentUser) return true;
    if (currentUser.role === "superadmin") return true;
    if (permission === "all") return true;
    return currentUser.permissions?.includes(permission);
  };

  const filteredNavItems = NAV_ITEMS.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100 bg-white">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white font-black text-xl tracking-tighter group-hover:scale-105 transition-transform">
              MS
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">MY SHOP</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-700">Admin Control</span>
            </div>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Store Management
          </div>
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold"
                    : "text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700"
                }`}
              >
                <div className={`w-5 flex justify-center text-base ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-600"}`}>
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Current User & Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
              {currentUser?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name || "Super Admin"}</p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] uppercase font-bold text-emerald-700">{currentUser?.role || "Super Admin"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <FontAwesomeIcon icon={faStore} className="text-slate-500" />
              <span>Live Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors border border-rose-200 cursor-pointer"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center"
              aria-label="Open menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Database:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                Supabase PostgreSQL Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Cloudinary CDN Online
            </div>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <FontAwesomeIcon icon={faStore} />
              <span>Customer Website</span>
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
