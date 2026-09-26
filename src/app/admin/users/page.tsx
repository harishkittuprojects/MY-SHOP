"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  last_login?: string;
  created_at?: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "products", label: "Product Management" },
  { id: "categories", label: "Category Management" },
  { id: "orders", label: "Order Processing & Invoices" },
  { id: "inventory", label: "Inventory & Stock Adjustments" },
  { id: "customers", label: "Customer Profiles & Directory" },
  { id: "coupons", label: "Offers & Coupons" },
  { id: "banners", label: "Homepage & Hero Banners" },
  { id: "gallery", label: "Cloudinary Media Gallery" },
  { id: "reports", label: "Sales Reports & Analytics" },
  { id: "settings", label: "Site Settings & Configuration" },
  { id: "logs", label: "Activity Audit Logs" },
  { id: "users", label: "Admin User Management" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "admin",
    permissions: ["products", "orders", "inventory"],
    is_active: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch admin users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      name: "",
      email: "",
      password: "",
      role: "admin",
      permissions: ["products", "orders", "inventory", "customers"],
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setIsEditing(true);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      permissions: user.permissions || [],
      is_active: user.is_active,
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setFormData((prev) => {
      const current = prev.permissions || [];
      const updated = current.includes(permId)
        ? current.filter((p) => p !== permId)
        : [...current, permId];
      return { ...prev, permissions: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) throw new Error("Operation failed");
      setIsModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to save admin user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove admin access for ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchUsers();
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
            Admin Users & Access Control
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage admin staff, assign granular permissions, and control dashboard accessibility
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Admin User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading administrators...</div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm">No admin users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Admin Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Active Permissions</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {u.last_login ? `Last login: ${new Date(u.last_login).toLocaleDateString()}` : "Never logged in"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-teal-50 text-teal-700 border border-teal-200">
                        {u.role || "Admin"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {u.role === "superadmin" ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            Full Superadmin Access
                          </span>
                        ) : (
                          u.permissions?.map((p) => (
                            <span
                              key={p}
                              className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold"
                            >
                              {p}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                          u.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        {u.role !== "superadmin" && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? "Edit Admin User" : "Create New Admin User"}
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Admin Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="staff@myshop.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  {isEditing ? "New Password (Leave blank to keep unchanged)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!isEditing}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
                >
                  <option value="admin">Admin (Permission Based)</option>
                  <option value="manager">Store Manager</option>
                  <option value="superadmin">Super Admin (All Access)</option>
                </select>
              </div>

              {/* Granular Permissions */}
              {formData.role !== "superadmin" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Granular Access Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.permissions?.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-0"
                        />
                        <span>{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                />
                <span className="text-xs font-bold text-slate-700">Account Active</span>
              </label>

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
                  {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
