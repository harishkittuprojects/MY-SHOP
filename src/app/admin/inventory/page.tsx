"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faClock, faTruck, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";


interface Subscription {
  id: string;
  customer_name: string;
  customer_phone: string;
  quantity: number;
  product_id: string;
  products: {
    name: string;
    unit: string;
  } | any;
}

interface Delivery {
  subscription_id: string;
  delivery_date: string;
  status: string;
}

export default function AdminInventoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [deliveriesToday, setDeliveriesToday] = useState<Delivery[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      // 1. Fetch Products
      const prodRes = await fetch("/api/productList");
      const productsList = await prodRes.json();

      // 2. Fetch active subscriptions
      const subRes = await fetch("/api/subscriptions");
      const subData = await subRes.json();
      const activeSubs = (subData || []).filter((s: any) => s.status === 'active');

      // 3. Fetch today's deliveries
      const delRes = await fetch(`/api/deliveries?date=${today}`);
      const delData = await delRes.json();
      setDeliveriesToday(Array.isArray(delData) ? delData : []);


      // 4. Enrich subscriptions
      const enrichedSubs = (Array.isArray(activeSubs) ? activeSubs : []).map((sub: any) => {
        const prod = (Array.isArray(productsList) ? productsList : []).find((p: any) => p.id === sub.product_id);
        return {
          ...sub,
          products: prod ? { name: prod.name, unit: prod.unit } : null
        };
      });


      setSubscriptions(enrichedSubs);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleDelivery = async (subId: string) => {
    const existing = deliveriesToday.find(d => d.subscription_id === subId);
    try {
      if (existing) {
        await fetch(`/api/deliveries?subscription_id=${subId}&date=${today}`, {
          method: "DELETE"
        });
      } else {
        await fetch("/api/deliveries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription_id: subId,
            delivery_date: today,
            status: 'delivered'
          })
        });
      }
      fetchData();
    } catch (err) {
      alert("Error toggling delivery!");
    }
  };

  // Calculate totals
  const inventoryTotals: Record<string, { name: string, unit: string, total: number, delivered: number }> = {};
  
  (Array.isArray(subscriptions) ? subscriptions : []).forEach(sub => {
    const product = Array.isArray(sub.products) ? sub.products[0] : sub.products;
    const prodName = product?.name || "Unknown";
    const prodUnit = product?.unit || "L";
    if (!inventoryTotals[sub.product_id]) {
        inventoryTotals[sub.product_id] = { name: prodName, unit: prodUnit, total: 0, delivered: 0 };
    }
    inventoryTotals[sub.product_id].total += sub.quantity;
    if (Array.isArray(deliveriesToday) && deliveriesToday.some(d => d.subscription_id === sub.id)) {
        inventoryTotals[sub.product_id].delivered += sub.quantity;
    }
  });


  return (
    <div className="min-h-screen bg-accent/30 p-4 md:p-8 text-black">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 shadow-sm transition-all duration-300">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <div>
               <h1 className="text-3xl font-black text-black">Inventory Board</h1>
               <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Today: {new Date().toDateString()}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary" />
            <span className="font-bold text-sm">{today}</span>
          </div>
        </div>

        {/* Inventory Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {Object.entries(inventoryTotals).map(([id, data]) => (
            <div key={id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faTruck} />
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${data.delivered >= data.total ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {data.delivered >= data.total ? 'Fulfilled' : 'In Progress'}
                </span>
              </div>
              <h3 className="text-lg font-black">{data.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black">{data.delivered}</span>
                <span className="text-sm font-bold text-gray-400">/ {data.total} {data.unit}</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${(data.delivered / data.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
          {Object.keys(inventoryTotals).length === 0 && !isLoading && (
            <div className="col-span-full bg-white p-10 rounded-[2.5rem] text-center text-gray-400 font-bold border border-dashed">
                No active milk subscriptions found for inventory calculation.
            </div>
          )}
        </div>

        {/* Delivery List */}
        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b bg-primary/5 flex justify-between items-center">
             <div>
                <h3 className="text-xl font-black text-black">Daily Delivery Checklist</h3>
                <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-widest">Mark items as they leave the farm</p>
             </div>
             <div className="text-right">
                <span className="block text-2xl font-black text-primary">{deliveriesToday.length} / {subscriptions.length}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deliveries Done</span>
             </div>
          </div>

          <div className="overflow-x-auto text-black">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-accent/50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5">Quantity</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">Loading inventory data...</td></tr>
                ) : (Array.isArray(subscriptions) ? subscriptions : []).length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">No active subscriptions.</td></tr>
                ) : (Array.isArray(subscriptions) ? subscriptions : []).map(sub => {
                  const isDelivered = Array.isArray(deliveriesToday) && deliveriesToday.some(d => d.subscription_id === sub.id);
                  return (
                    <tr key={sub.id} className={`hover:bg-gray-50/50 transition-colors ${isDelivered ? 'bg-green-50/30' : ''}`}>
                      <td className="px-8 py-6 text-center">
                        <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center ${isDelivered ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-300'}`}>
                          <FontAwesomeIcon icon={isDelivered ? faCheck : faClock} />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-gray-800 text-sm uppercase">{sub.customer_name}</span>
                        <span className="block text-[10px] text-gray-400 font-bold">{sub.customer_phone}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-secondary uppercase tracking-tight">
                          {Array.isArray(sub.products) ? sub.products[0]?.name : sub.products?.name}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-primary">
                          {sub.quantity} {Array.isArray(sub.products) ? sub.products[0]?.unit : sub.products?.unit}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => toggleDelivery(sub.id)}
                          className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDelivered ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-primary text-black shadow-md hover:opacity-90 active:scale-95'}`}
                        >
                          {isDelivered ? 'Undo' : 'Mark Delivered'}
                        </button>
                      </td>
                    </tr>
                  )
                })}

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
