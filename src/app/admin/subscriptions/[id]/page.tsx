"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUser, faCalendarAlt, faMapMarkerAlt, faPhone, faEnvelope, faTrash, faEdit, faCheckCircle, faClock, faCalendarPlus } from "@fortawesome/free-solid-svg-icons";


interface Subscription {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  plan_details: string;
  status: string;
  created_at: string;
  location_link?: string;
  street?: string;
  payment_screenshot_url?: string;
  amount_paid?: number;
  product_id?: string;
  quantity?: number;
  products?: {
    name: string;
    unit: string;
    price: number;
  };
}

interface Delivery {
  id: string;
  delivery_date: string;
  status: string;
  notes: string;
  quantity?: number;
}

export default function SubscriberDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [subscriber, setSubscriber] = useState<Subscription | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPast, setIsAddingPast] = useState(false);
  const [pastDate, setPastDate] = useState(new Date().toISOString().split('T')[0]);
  const [pastQuantity, setPastQuantity] = useState<number>(1);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdminAuthenticated");
    if (isAdmin !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
      fetchData();
    }
  }, [router, id]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const cleanId = String(id).replace(/\/$/, '');
      // Fetch subscriber details
      const subRes = await fetch(`/api/subscriptions?id=${cleanId}`);
      if (!subRes.ok) {
        router.push("/admin/subscriptions");
        return;
      }
      const subData = await subRes.json();
      if (!subData || subData.error) {
        router.push("/admin/subscriptions");
        return;
      }
      setSubscriber(subData);
      setPastQuantity(subData.quantity || 1);

      // Fetch delivery history
      const delRes = await fetch(`/api/deliveries?subscription_id=${id}`);
      const delData = await delRes.json();
      setDeliveries(Array.isArray(delData) ? delData : []);

    } catch (err) {
      console.error("Error fetching subscriber data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteSub = async () => {
    if (confirm("Are you sure you want to delete this subscriber's folder? All history will be lost.")) {
      try {
        const response = await fetch(`/api/subscriptions?id=${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed");
        router.push("/admin/subscriptions");
      } catch (err) {
        alert("Error deleting subscriber");
      }
    }
  };

  const handleAddDelivery = async () => {
    try {
      const response = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: id,
          delivery_date: pastDate,
          status: 'delivered',
          quantity: pastQuantity
        })
      });

      if (!response.ok) throw new Error("Failed");
      setIsAddingPast(false);
      fetchData();
    } catch (err) {
      alert("Error adding delivery. It may already exist for this date.");
    }
  };

  const removeDelivery = async (delId: string) => {
    if (confirm("Remove this delivery log?")) {
      try {
        const response = await fetch(`/api/deliveries?id=${delId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed");
        fetchData();
      } catch (err) {
        alert("Error removing log");
      }
    }
  };

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/30 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent/30 text-primary p-4 text-center">
        <h2 className="text-2xl font-black mb-4">Account Folder Not Ready</h2>
        <p className="mb-8 font-bold text-gray-500 text-sm max-w-md">We couldn't load the customer details. This might happen if the account was just created. Try refreshing in a few seconds.</p>
        <div className="flex gap-4">
           <button onClick={() => fetchData()} className="bg-primary text-black font-black px-6 py-3 rounded-xl shadow-lg">Retry Loading</button>
           <Link href="/admin/subscriptions" className="bg-white text-gray-600 font-bold px-6 py-3 rounded-xl border border-gray-200">Go Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/30 p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-4">
              <Link href="/admin/subscriptions" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 shadow-sm transition-all">
                <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
              <div>
                <h1 className="text-3xl font-black text-black">Subscriber Account</h1>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Customer ID: {String(subscriber?.id || '').slice(0, 8)}</p>
              </div>
           </div>
            <div className="flex gap-3">
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/deliveries", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          subscription_id: id,
                          delivery_date: new Date().toISOString().split('T')[0],
                          status: 'delivered',
                          quantity: subscriber?.quantity || 1
                        })
                      });
                      if (!response.ok) throw new Error("Failed");
                      fetchData();
                    } catch (err) {
                      alert("Today's delivery already marked or error occurred!");
                    }
                  }}
                  className="bg-primary text-black font-black px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Log Today
                </button>
               <button 
                 onClick={handleDeleteSub}
                 className="bg-red-50 text-red-600 font-bold px-6 py-3 rounded-xl border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
               >
                 <FontAwesomeIcon icon={faTrash} />
                 Delete Folder
               </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Column: Personal Info Card */}
           <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center text-xl">
                        <FontAwesomeIcon icon={faUser} />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-black uppercase tracking-tight leading-tight">{subscriber?.customer_name || 'Anonymous'}</h2>
                        <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{subscriber?.quantity || 0} {subscriber?.products?.unit || 'L'} {subscriber?.products?.name || 'Milk'}</span>
                     </div>
                  </div>
                  
                  <div className="space-y-6">
                     {/* Identity Section */}
                     <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pb-1 border-b border-gray-50">Customer Identity</h4>
                        <div className="grid grid-cols-1 gap-4">
                           <div className="bg-accent/30 p-4 rounded-2xl">
                              <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-1">Phone Number</label>
                              <span className="text-sm font-black text-black">{subscriber?.customer_phone || 'N/A'}</span>
                           </div>
                           <div className="bg-accent/30 p-4 rounded-2xl">
                              <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                              <span className="text-sm font-black text-black truncate block">{subscriber?.customer_email || 'Not provided'}</span>
                           </div>
                        </div>
                     </div>

                     {/* Delivery Section */}
                     <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pb-1 border-b border-gray-50">Delivery Address</h4>
                        <div className="space-y-4">
                           <div className="bg-accent/30 p-4 rounded-2xl">
                              <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-1">Full Address</label>
                              <span className="text-sm font-bold text-black leading-relaxed block">{subscriber?.address || 'No address provided'}</span>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-accent/30 p-4 rounded-2xl">
                                 <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-1">Street/Landmark</label>
                                 <span className="text-xs font-black text-black">{subscriber?.street || 'Not specified'}</span>
                              </div>
                              <div className="bg-accent/30 p-4 rounded-2xl flex flex-col justify-between">
                                 <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-1">Location</label>
                                 {subscriber?.location_link ? (
                                    <a href={subscriber.location_link} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-black text-[10px] uppercase">Link</a>
                                 ) : (
                                    <span className="text-xs font-black text-gray-300 italic">No link</span>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Plan Section */}
                     <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pb-1 border-b border-gray-50">Subscription Plan</h4>
                        <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/10">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{subscriber?.plan_details || 'Manual Plan'}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

              {subscriber?.payment_screenshot_url && (
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
                  <h4 className="font-black text-sm mb-4 uppercase tracking-[0.2em] text-gray-400">Payment Proof</h4>
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-gray-100 bg-accent/20">
                    <Image src={subscriber.payment_screenshot_url} alt="Payment" fill className="object-cover" unoptimized />
                  </div>
                  <div className="mt-4 flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount Paid</span>
                    <span className="text-lg font-black text-primary">₹{subscriber?.amount_paid || '0'}</span>
                  </div>
                </div>
              )}

              <div className="bg-primary p-8 rounded-[3rem] shadow-xl text-black">
                 <h4 className="font-black text-lg mb-4 uppercase tracking-tight">Delivery Performance</h4>
                 <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-black">{Array.isArray(deliveries) ? deliveries.length : 0}</span>
                    <span className="font-black text-sm mb-2 text-black/60">Days Delivered</span>
                  </div>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-2xl font-black">{Number(Array.isArray(deliveries) ? deliveries.reduce((acc, del) => acc + (Number(del.quantity) || 0), 0) : 0).toFixed(1)}</span>
                    <span className="font-black text-[10px] mb-1 text-black/60 uppercase tracking-widest">Total {subscriber?.products?.unit || 'L'} Received</span>
                 </div>
                 <p className="text-xs font-bold text-black/60 leading-relaxed uppercase tracking-widest">Since {subscriber?.created_at ? new Date(subscriber.created_at).toDateString() : 'Unknown Date'}</p>
              </div>
           </div>

           {/* Right Column: Register Book */}
           <div className="lg:col-span-2">
              <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                 
                 {/* Register Book Header */}
                 <div className="p-8 border-b bg-gray-50/80">
                    <div className="flex items-center justify-between mb-1">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                             <FontAwesomeIcon icon={faCalendarAlt} className="text-black" />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-black">Delivery Register</h3>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily milk log for {subscriber?.customer_name || 'Customer'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-3xl font-black text-black">{Array.isArray(deliveries) ? deliveries.length : 0}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Days</p>
                       </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1">
                       <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
                          <p className="text-2xl font-black text-primary">{Number(Array.isArray(deliveries) ? deliveries.reduce((acc, del) => acc + (Number(del.quantity) || Number(subscriber?.quantity) || 1), 0) : 0).toFixed(1)}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total {subscriber?.products?.unit || 'L'} Delivered</p>
                       </div>
                    </div>
                 </div>

                 {/* Add Log Form — Always Visible */}
                 <div className="p-6 border-b bg-primary/5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">➕ Add New Delivery Entry</p>
                    <div className="flex items-end gap-3">
                       <div className="flex-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Date</label>
                          <input 
                            type="date" 
                            className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 font-bold outline-none ring-2 ring-transparent focus:ring-primary text-sm"
                            value={pastDate}
                            onChange={e => setPastDate(e.target.value)}
                          />
                       </div>
                       <div className="w-28">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Qty ({subscriber?.products?.unit || 'L'})</label>
                          <input 
                            type="number" 
                            step="0.1"
                            className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 font-bold outline-none ring-2 ring-transparent focus:ring-primary text-sm"
                            value={pastQuantity}
                            onChange={e => setPastQuantity(parseFloat(e.target.value) || 0)}
                          />
                       </div>
                       <button 
                         onClick={handleAddDelivery}
                         className="bg-primary text-black font-black px-6 py-3 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                       >
                         <FontAwesomeIcon icon={faCheckCircle} />
                         Add Entry
                       </button>
                    </div>
                 </div>

                 {/* Register Entries */}
                 <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
                    {!Array.isArray(deliveries) || deliveries.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-5xl mb-4" />
                          <p className="font-black italic">No entries logged yet</p>
                          <p className="text-xs font-bold mt-1">Use the form above to add the first delivery.</p>
                       </div>
                    ) : (
                       <div className="space-y-2">
                          {/* Table Header */}
                          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                             <span className="col-span-1">#</span>
                             <span className="col-span-5">Date</span>
                             <span className="col-span-3 text-center">Qty ({subscriber?.products?.unit || 'L'})</span>
                             <span className="col-span-2 text-center">Status</span>
                             <span className="col-span-1"></span>
                          </div>
                                              {(Array.isArray(deliveries) ? deliveries : []).map((del, index) => (
                            <div key={del.id} className="group grid grid-cols-12 gap-2 items-center p-4 rounded-2xl bg-accent/20 hover:bg-accent/40 transition-all border border-transparent hover:border-primary/10">
                               <span className="col-span-1 text-[10px] font-black text-gray-300">#{del.id}</span>
                                <div className="col-span-5">
                                   <span className="font-black text-gray-800 text-sm block">
                                      {del.delivery_date ? new Date(del.delivery_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Invalid Date'}
                                   </span>
                                   <span className="text-[9px] font-bold text-gray-400">
                                      {del.delivery_date ? new Date(del.delivery_date).toLocaleDateString('en-IN', { weekday: 'long' }) : '---'}
                                   </span>
                                </div>
                               <div className="col-span-3 text-center">
                                  <span className="font-black text-primary">{del.quantity || subscriber?.quantity || 1}</span>
                                </div>
                               <div className="col-span-2 flex justify-center">
                                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[8px] font-black uppercase px-2 py-1 rounded-full">
                                     <FontAwesomeIcon icon={faCheckCircle} size="xs" /> Done
                                  </span>
                               </div>
                               <div className="col-span-1 flex justify-end">
                                  <button 
                                    onClick={() => removeDelivery(del.id)}
                                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                  >
                                     <FontAwesomeIcon icon={faTrash} size="xs" />
                                  </button>
                               </div>
                            </div>
                          ))}
                       </div>

                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
