"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faMapMarkerAlt, faPhone, faEnvelope, faCalendarAlt, faCreditCard, faTruck, faCheckCircle, faClock, faDownload } from "@fortawesome/free-solid-svg-icons";

interface OrderItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  location_link?: string;
  total_amount: number;
  delivery_charge: number;
  payment_method: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdminAuthenticated");
    if (isAdmin !== "true") {
      router.push("/admin/login");
    } else {
      fetchOrderDetails();
    }
  }, [resolvedParams.id]);

  async function fetchOrderDetails() {
    setIsLoading(true);
    try {
      // First fetch the order
      const res = await fetch(`/api/admin/orders?id=${resolvedParams.id}`);
      const data = await res.json();
      
      // If it's the specific order, we might need a separate endpoint for detail or just filter
      // For now assuming the API returns the specific order if ID is provided
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order details:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resolvedParams.id, status: newStatus })
      });
      if (res.ok) fetchOrderDetails();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent/30 text-black">
        <h2 className="text-2xl font-black mb-4">Order Not Found</h2>
        <Link href="/admin/orders" className="bg-primary text-black px-6 py-2 rounded-xl font-bold">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/30 p-4 md:p-8 text-black">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 shadow-sm">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <div>
              <h1 className="text-2xl font-black">Order File</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">#{order.id.toString().toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex gap-2 no-print">
            <button 
              onClick={() => window.print()} 
              className="bg-white text-gray-800 font-bold px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center gap-2 text-xs uppercase tracking-widest"
            >
              <FontAwesomeIcon icon={faDownload} />
              Download PDF
            </button>
            <button onClick={() => updateStatus('processing')} className="bg-orange-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest hover:opacity-90">Mark Processing</button>
            <button onClick={() => updateStatus('completed')} className="bg-green-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest hover:opacity-90">Mark Delivered</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
               <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">📦</div>
                 Order Summary
               </h3>
               
               <div className="space-y-4">
                 {(order.items || []).map((item, i) => (
                   <div key={i} className="flex justify-between items-center py-4 border-b last:border-none">
                     <div>
                       <p className="font-black text-sm uppercase tracking-tight">{item.name}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase">{item.quantity} x {item.unit}</p>
                     </div>
                     <span className="font-black text-secondary">₹{Math.floor(item.price * item.quantity)}</span>
                   </div>
                 ))}
               </div>

               <div className="mt-8 pt-6 border-t border-dashed border-gray-200 space-y-3">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-400 font-bold uppercase tracking-widest">Items Total</span>
                   <span className="font-bold text-gray-700">₹{Math.floor(order.total_amount - (order.delivery_charge || 0))}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-400 font-bold uppercase tracking-widest">Delivery Charge</span>
                   <span className="font-bold text-gray-700">₹{Math.floor(order.delivery_charge || 0)}</span>
                 </div>
                 <div className="flex justify-between items-center pt-3 border-t">
                   <span className="text-gray-400 font-black uppercase tracking-widest text-xs">Total Amount</span>
                   <span className="text-3xl font-black text-secondary">₹{Math.floor(order.total_amount)}</span>
                 </div>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
               <h3 className="text-lg font-black mb-6">Delivery Address</h3>
               <p className="bg-accent/30 p-6 rounded-2xl font-bold text-gray-700 leading-relaxed border border-gray-50">
                 {order.shipping_address}
               </p>
               {order.location_link && (
                 <a href={order.location_link} target="_blank" rel="noopener noreferrer" className="mt-4 w-full bg-green-50 text-green-600 font-black py-4 rounded-2xl flex items-center justify-center gap-3 border border-green-100 hover:bg-green-100 transition-all">
                   <FontAwesomeIcon icon={faMapMarkerAlt} />
                   View on Google Maps
                 </a>
               )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8 text-black">
             <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-black mb-6">Customer Profile</h3>
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-gray-400">
                        <FontAwesomeIcon icon={faPhone} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                        <p className="font-bold">{order.customer_phone}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-gray-400">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                        <p className="font-bold truncate max-w-[150px]">{order.customer_email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-gray-400">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Date</p>
                        <p className="font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-black mb-6">Order Status</h3>
                <div className="space-y-4">
                   <div className={`flex items-center gap-3 p-4 rounded-2xl border ${order.status === 'pending' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                      <FontAwesomeIcon icon={faClock} />
                      <span className="font-black text-[10px] uppercase tracking-widest">Pending</span>
                   </div>
                   <div className={`flex items-center gap-3 p-4 rounded-2xl border ${order.status === 'processing' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                      <FontAwesomeIcon icon={faTruck} />
                      <span className="font-black text-[10px] uppercase tracking-widest">Processing</span>
                   </div>
                   <div className={`flex items-center gap-3 p-4 rounded-2xl border ${order.status === 'completed' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span className="font-black text-[10px] uppercase tracking-widest">Delivered</span>
                   </div>
                </div>
                
                <div className="mt-8 pt-6 border-t">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Method</p>
                   <div className="flex items-center gap-2 font-black text-secondary">
                      <FontAwesomeIcon icon={order.payment_method === 'Online Payment' ? faCreditCard : faTruck} />
                      {order.payment_method}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
          }
          .container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .grid {
            display: block !important;
          }
          .lg\\:col-span-2, .space-y-8 {
            width: 100% !important;
          }
          .rounded-\\[2\\.5rem\\], .rounded-2xl {
            border-radius: 0 !important;
            border: 1px solid #eee !important;
            box-shadow: none !important;
            margin-bottom: 20px !important;
          }
          .bg-accent\\/30 {
            background: white !important;
          }
          a[href^="https://www.google.com/maps"] {
            display: none !important;
          }
          /* Ensure text is black */
          h1, h2, h3, p, span {
            color: black !important;
          }
          /* Custom header for print */
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #2F6B3F;
            padding-bottom: 20px;
          }
          .print-header h1 {
            color: #2F6B3F !important;
            font-size: 32px;
          }
        }
        @media screen {
          .print-header {
            display: none;
          }
        }
      `}</style>
      
      {/* Hidden header for print only */}
      <div className="print-header hidden">
        <h1>MADUR.IN</h1>
        <p className="font-bold">Fresh Produce Order Invoice</p>
      </div>
    </div>
  );
}
