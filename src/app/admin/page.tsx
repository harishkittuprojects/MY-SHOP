"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faBox,
  faExclamationTriangle,
  faUsers,
  faRupeeSign,
  faCalendarDay,
  faArrowTrendUp,
  faPlus,
  faExternalLinkAlt,
  faWarehouse,
  faTicketAlt,
  faPhotoVideo,
  faSyncAlt,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  yesterdayRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      const data = await res.json();
      if (data.counts) {
        setStats(data.counts);
      }
      if (data.chartData) {
        setChartData(data.chartData);
      }
      if (data.recentOrders) {
        setRecentOrders(data.recentOrders);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    return `₹${(val || 0).toLocaleString("en-IN")}`;
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "pending").toLowerCase();
    if (["delivered", "completed"].includes(s)) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (["shipped", "out for delivery"].includes(s)) {
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    }
    if (["confirmed", "preparing"].includes(s)) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s === "cancelled") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const maxChartVal = Math.max(...chartData.map(d => d.sales || 0), 1000);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Store Overview & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time performance metrics synchronized with Supabase & Cloudinary</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faSyncAlt} className={refreshing ? "animate-spin text-emerald-600" : "text-emerald-600"} />
            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm border border-emerald-200">
              <FontAwesomeIcon icon={faRupeeSign} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(stats.totalRevenue)}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <FontAwesomeIcon icon={faArrowTrendUp} />
            <span>All-time Net Sales</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-sm border border-teal-200">
              <FontAwesomeIcon icon={faCalendarDay} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(stats.todayRevenue)}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Yesterday: {formatCurrency(stats.yesterdayRevenue)}
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Orders</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm border border-emerald-200">
              <FontAwesomeIcon icon={faShoppingBag} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.todayOrders}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Placed today</div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm border border-slate-200">
              <FontAwesomeIcon icon={faShoppingBag} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalOrders}</div>
          <Link href="/admin/orders" className="text-[11px] text-emerald-700 hover:underline font-semibold mt-1 block">
            View orders →
          </Link>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-sm border border-amber-200">
              <FontAwesomeIcon icon={faClock} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">{stats.pendingOrders}</div>
          <div className="text-[11px] text-amber-800 font-medium mt-1">Requires fulfillment</div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm border border-emerald-200">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.completedOrders}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Successfully fulfilled</div>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cancelled</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center text-sm border border-rose-200">
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.cancelledOrders}</div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">Stock restored</div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Products</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm border border-emerald-200">
              <FontAwesomeIcon icon={faBox} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalProducts}</div>
          <Link href="/admin/products" className="text-[11px] text-emerald-700 hover:underline font-semibold mt-1 block">
            Catalog list →
          </Link>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock (&le;5)</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center text-sm border border-orange-200">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black ${stats.lowStockProducts > 0 ? "text-orange-600" : "text-slate-900"}`}>
            {stats.lowStockProducts}
          </div>
          <Link href="/admin/inventory" className="text-[11px] text-orange-600 hover:underline font-semibold mt-1 block">
            Manage inventory →
          </Link>
        </div>

        {/* Total Customers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-sm border border-teal-200">
              <FontAwesomeIcon icon={faUsers} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalCustomers}</div>
          <Link href="/admin/customers" className="text-[11px] text-teal-700 hover:underline font-semibold mt-1 block">
            View profiles →
          </Link>
        </div>
      </div>

      {/* Sales Trend Visual Chart & Quick Action Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Chart Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-emerald-600" />
                <span>Sales & Revenue Trends</span>
              </h2>
              <p className="text-xs text-slate-500">Daily revenue and order volume for the past 7 days</p>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
            </Link>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-64 flex items-end gap-3 sm:gap-6 pt-8 pb-4 border-b border-slate-100">
            {chartData.map((day, idx) => {
              const heightPercent = maxChartVal > 0 ? Math.max((day.sales / maxChartVal) * 100, 4) : 4;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{day.sales.toLocaleString()}
                  </div>
                  <div className="w-full relative flex items-end justify-center rounded-xl bg-slate-100 h-48 overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-emerald-600 rounded-xl transition-all duration-500 group-hover:bg-emerald-700"
                    />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 text-center truncate max-w-[50px]">
                    {day.date.split(",")[0]}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
              <span className="font-semibold text-slate-700">Daily Gross Revenue (₹)</span>
            </div>
            <div className="font-semibold text-slate-600">
              Avg/Day: {formatCurrency(stats.totalRevenue / 7)}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-1">Quick Actions</h2>
            <p className="text-xs text-slate-500 mb-6">Frequently used management workflows</p>

            <div className="space-y-3">
              <Link
                href="/admin/products"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 transition-all text-slate-800 hover:text-emerald-900 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm border border-emerald-200">
                    <FontAwesomeIcon icon={faBox} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Manage Products</div>
                    <div className="text-[11px] text-slate-500">Add, edit prices, images & stock</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-emerald-700 transition-colors font-bold">→</span>
              </Link>

              <Link
                href="/admin/orders"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 transition-all text-slate-800 hover:text-emerald-900 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm border border-blue-200">
                    <FontAwesomeIcon icon={faShoppingBag} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Process Orders</div>
                    <div className="text-[11px] text-slate-500">Update status, print invoices</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-emerald-700 transition-colors font-bold">→</span>
              </Link>

              <Link
                href="/admin/inventory"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 transition-all text-slate-800 hover:text-emerald-900 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-sm border border-orange-200">
                    <FontAwesomeIcon icon={faWarehouse} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Stock & Inventory</div>
                    <div className="text-[11px] text-slate-500">Restock, audit logs & alerts</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-emerald-700 transition-colors font-bold">→</span>
              </Link>

              <Link
                href="/admin/gallery"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 transition-all text-slate-800 hover:text-emerald-900 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-sm border border-teal-200">
                    <FontAwesomeIcon icon={faPhotoVideo} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Cloudinary Media</div>
                    <div className="text-[11px] text-slate-500">Upload images & PDF documents</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-emerald-700 transition-colors font-bold">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Storage: Cloudinary CDN</span>
            <span className="text-emerald-700 font-bold">Connected</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Stream */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500">Live feed of orders placed through the customer website</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            View All ({stats.totalOrders}) →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No orders placed yet. Orders will automatically appear here in real-time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-xs">
                      #{order.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {order.customer_name || "Customer"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {order.customer_phone || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs uppercase font-bold text-slate-700">
                        {order.payment_method || "COD"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.order_status)}`}>
                        {order.order_status || "Pending"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/admin/orders"
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        Manage →
                      </Link>
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
