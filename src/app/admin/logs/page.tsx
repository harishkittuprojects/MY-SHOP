"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

interface ActivityLog {
  id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  created_at: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs", { cache: "no-store" });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    const a = (action || "").toLowerCase();
    if (a.includes("create") || a.includes("add")) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (a.includes("update") || a.includes("adjust")) return "text-teal-700 bg-teal-50 border-teal-200";
    if (a.includes("delete") || a.includes("remove")) return "text-rose-700 bg-rose-50 border-rose-200";
    if (a.includes("login")) return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-amber-700 bg-amber-50 border-amber-200";
  };

  const filtered = logs.filter(
    (l) =>
      (l.admin_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.entity_type || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Activity & Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">
            Immutable audit record of all administrative operations, product modifications, and status changes
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter logs by admin name, action..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>
        <div className="text-xs text-slate-500 font-bold">
          Total Recorded Actions: <span className="text-emerald-700">{logs.length}</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading audit logs...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm">No activity records logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Admin Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at || Date.now()).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faUserShield} className="text-emerald-600 text-xs" />
                        <span>{log.admin_name || "System"}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ""}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
