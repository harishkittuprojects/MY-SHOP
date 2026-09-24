"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Skip auth check for the login page (handle trailing slashes)
    const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";
    if (isLoginPage) {
      setIsAuthorized(true);
      return;
    }

    // Check for both localStorage (legacy) and sessionStorage (new)
    const isAdminLocal = localStorage.getItem("isAdminAuthenticated");
    const isAdminSession = sessionStorage.getItem("isAdminAuthenticated");
    
    if (isAdminLocal === "true" || isAdminSession === "true") {
      // Migrate from localStorage to sessionStorage if needed
      if (isAdminLocal === "true") {
        sessionStorage.setItem("isAdminAuthenticated", "true");
        localStorage.removeItem("isAdminAuthenticated");
      }
      setIsAuthorized(true);
    } else {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
