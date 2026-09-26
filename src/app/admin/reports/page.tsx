"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faDownload,
  faRupeeSign,
  faBox,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";

interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  totalCustomers: number;
  averageOrderValue: string;
}

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<ReportSummary>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUnitsSold: 0,
    totalCustomers: 0,
    averageOrderValue: "0",
  });
  const [dailyBreakdown, setDailyBreakdown] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports", { cache: "no-store" });
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
      if (data.dailyBreakdown) setDailyBreakdown(data.dailyBreakdown);
      if (data.topProducts) setTopProducts(data.topProducts);
      if (data.topCustomers) setTopCustomers(data.topCustomers);
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    window.open("/api/admin/reports?type=export_csv", "_blank");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Reports & Business Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Analyze daily sales, high-performing products, revenue volume and download CSV audits
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
        >
          <FontAwesomeIcon icon={faDownload} />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Net Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm border border-emerald-200">
              <FontAwesomeIcon icon={faRupeeSign} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{Number(summary.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-sm border border-blue-200">
              <FontAwesomeIcon icon={faShoppingBag} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{summary.totalOrders}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Units Sold</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-sm border border-teal-200">
              <FontAwesomeIcon icon={faBox} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{summary.totalUnitsSold}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Order Value</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-sm border border-amber-200">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{summary.averageOrderValue}</div>
        </div>
      </div>

      {/* Daily Sales Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-black text-slate-900">Daily Sales History</h2>
        {dailyBreakdown.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center">No daily sales records available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Orders Placed</th>
                  <th className="pb-3 px-4">Units Sold</th>
                  <th className="pb-3 px-4 text-right">Daily Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {dailyBreakdown.map((day, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">{day.date}</td>
                    <td className="py-3 px-4 text-slate-600">{day.orders} orders</td>
                    <td className="py-3 px-4 text-slate-600">{day.itemsSold} items</td>
                    <td className="py-3 px-4 font-bold text-emerald-700 text-right">
                      ₹{Number(day.revenue).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Products & Top Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-slate-900">Top Performing Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center">No sales data yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {topProducts.slice(0, 6).map((tp, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-xs">{tp.name}</div>
                    <div className="text-[11px] text-slate-400">{tp.units} units sold</div>
                  </div>
                  <div className="font-bold text-emerald-700 text-right">
                    ₹{Number(tp.revenue).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-slate-900">Top Spending Customers</h2>
          {topCustomers.length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center">No customer spend records yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {topCustomers.slice(0, 6).map((tc, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <div className="font-bold text-slate-900">{tc.name}</div>
                    <div className="text-[11px] text-slate-400">{tc.ordersCount} orders placed</div>
                  </div>
                  <div className="font-bold text-emerald-700 text-right">
                    ₹{Number(tc.totalSpent).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
