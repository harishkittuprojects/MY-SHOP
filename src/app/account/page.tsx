"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faBoxOpen, 
  faSignOutAlt, 
  faArrowRight, 
  faChevronRight, 
  faClock, 
  faCheckCircle, 
  faSpinner 
} from "@fortawesome/free-solid-svg-icons";
import { logoutAction } from "@/lib/actions/auth";

import InvoiceModal from "@/components/common/InvoiceModal";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: any[];
  user_email?: string;
  shipping_address?: string;
  payment_method?: string;
  delivery_charge?: number;
  isSubscription?: boolean;
  plan_details?: string;
}

interface Subscription {
  id: string;
  plan_details: string;
  status: string;
  quantity: number;
  customer_name: string;
  customer_email?: string;
  address?: string;
  created_at: string;
  amount_paid?: number;
  deliveries?: Delivery[];
}

interface Delivery {
  id: string;
  subscription_id: string;
  delivery_date: string;
  quantity_delivered: number;
  status: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchUserData() {
      try {
        const sessionRes = await fetch("/api/auth/session", { 
          signal: controller.signal,
          cache: "no-store",
          headers: { "Accept": "application/json" }
        });
        if (!sessionRes.ok) throw new Error("Session check failed");
        const session = await sessionRes.json();
        
        if (!session || !session.user) {
          router.push("/login");
          return;
        }
        
        setUser(session.user);

        // Fetch user's orders
        const orderRes = await fetch(`/api/orders?email=${encodeURIComponent(session.user.email)}`, { 
          signal: controller.signal,
          cache: "no-store" 
        });
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          if (Array.isArray(orderData)) setOrders(orderData);
        }

        // Fetch user's subscriptions
        const subRes = await fetch(`/api/subscriptions?email=${encodeURIComponent(session.user.email)}`, { signal: controller.signal });
        if (subRes.ok) {
          const subData = await subRes.json();

          if (Array.isArray(subData) && subData.length > 0) {
            // Fetch deliveries for these subscriptions
            const subIds = subData.map((s: any) => s.id).join(',');
            
            const delRes = await fetch(`/api/deliveries?subscription_ids=${subIds}`, { signal: controller.signal });
            if (delRes.ok) {
              const delData = await delRes.json();
              const enrichedSubs = subData.map((sub: any) => ({
                ...sub,
                deliveries: Array.isArray(delData) ? delData.filter((d: any) => d.subscription_id === sub.id) : []
              }));
              setSubscriptions(enrichedSubs);
            } else {
              setSubscriptions(subData.map(s => ({ ...s, deliveries: [] })));
            }
          } else {
            setSubscriptions([]);
          }
        }

      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Account Dashboard Error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
    
    return () => controller.abort();
  }, [router]);

  const handleSignOut = async () => {
    await logoutAction();
    router.push("/");
    router.refresh();
  };

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'pending': return <FontAwesomeIcon icon={faClock} className="text-orange-400" />;
      case 'processing': return <FontAwesomeIcon icon={faSpinner} className="text-blue-500 animate-spin" />;
      default: return <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center bg-accent/20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null; // Let the useEffect redirect handle this

  return (
    <div className="min-h-[85vh] bg-accent/20 py-12 px-4 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 -z-10 blur-3xl rounded-b-[100px]"></div>

      <div className="max-w-4xl mx-auto z-10 relative">
        <h1 className="text-4xl font-black text-black mb-8 px-2 md:px-0 tracking-tighter">My Dashboard</h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Area */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 sticky top-24">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-accent text-primary flex items-center justify-center mb-6 shadow-inner ring-4 ring-primary/10">
                  <FontAwesomeIcon icon={faUser} className="text-3xl" />
                </div>
                <h2 className="text-xl font-black text-gray-800 break-all">{user.email?.split('@')[0]}</h2>
                <p className="text-sm text-gray-400 font-bold mb-8 uppercase tracking-widest break-all">
                  {user.email}
                </p>
                
                <div className="w-full flex flex-col gap-3">
                  <button className="w-full bg-accent/50 text-black border-2 border-transparent font-black py-4 rounded-xl hover:border-primary/20 hover:bg-white transition-all text-sm flex items-center justify-between px-6 group">
                    <span>Order History</span>
                    <FontAwesomeIcon icon={faChevronRight} className="text-primary group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full bg-red-50 text-red-600 font-black py-4 rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm flex items-center justify-center gap-3"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    SIGN OUT
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800">Milk Subscription Logs</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Daily tracking for your active plans
                    </p>
                  </div>
                </div>
              </div>

              {Array.isArray(subscriptions) && subscriptions.length > 0 ? (
                <div className="space-y-8 mb-16">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-6 bg-accent/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="font-black text-lg text-gray-800 uppercase tracking-tight">{sub.plan_details}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${sub.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                              {sub.status}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {sub.quantity}L per day
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Deliveries</p>
                          <p className="text-2xl font-black text-primary leading-none">{sub.deliveries?.length || 0}</p>
                        </div>
                      </div>
                      
                      <div className="px-6 py-4 bg-white border-y border-gray-100 flex items-center justify-between sm:justify-end gap-4">
                        <div className="flex flex-col sm:items-end">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</span>
                          <span className="text-xl font-black text-primary">₹{sub.amount_paid || 0}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedOrder({
                              id: sub.id,
                              user_email: sub.customer_email || user.email,
                              shipping_address: sub.address || "Subscription Address",
                              created_at: sub.created_at,
                              payment_method: 'Online Payment',
                              status: sub.status,
                              total_amount: sub.amount_paid || 0,
                              isSubscription: true,
                              plan_details: sub.plan_details
                            });
                            setIsInvoiceOpen(true);
                          }}
                          className="text-[10px] bg-primary/10 border border-primary/20 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          View Invoice
                        </button>
                      </div>

                      <div className="p-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Last 7 Deliveries</p>
                        <div className="grid grid-cols-7 gap-2">
                          {[...Array(7)].map((_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - i);
                            const dateStr = date.toISOString().split('T')[0];
                            const delivery = Array.isArray(sub.deliveries) ? sub.deliveries.find(d => {
                              const dbDate = d.delivery_date ? String(d.delivery_date).split('T')[0] : '';
                              return dbDate === dateStr;
                            }) : null;
                            const isToday = i === 0;

                            return (
                              <div key={i} className="flex flex-col items-center gap-2">
                                <div className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                                  delivery 
                                    ? 'bg-secondary text-secondary-foreground shadow-md' 
                                    : 'bg-accent/30 text-gray-300'
                                } ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                  <FontAwesomeIcon icon={delivery ? faCheckCircle : faClock} className={delivery ? 'text-lg' : 'text-xs'} />
                                </div>
                                <span className="text-[8px] font-black text-gray-400 uppercase">{isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                              </div>
                            );
                          })}
                        </div>
                        
                        {Array.isArray(sub.deliveries) && sub.deliveries.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Full Delivery History</p>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                              {sub.deliveries.map((del) => (
                                <div key={del.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                    <span className="text-xs font-bold text-gray-700">{new Date(del.delivery_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                  </div>
                                  <span className="text-xs font-black text-secondary uppercase tracking-widest">Delivered: {del.quantity_delivered}L</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (

                <div className="bg-accent/10 rounded-3xl p-8 text-center mb-16 border-2 border-dashed border-accent/30">
                  <FontAwesomeIcon icon={faClock} className="text-3xl text-gray-300 mb-4" />
                  <p className="text-sm font-bold text-gray-500 italic">No active milk subscriptions found for your email.</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-primary shadow-inner">
                    <FontAwesomeIcon icon={faBoxOpen} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800">Order History</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                    </p>
                  </div>
                </div>
              </div>

              {Array.isArray(orders) && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="bg-accent/20 border-2 border-transparent hover:border-primary/20 hover:bg-white transition-all rounded-[1.5rem] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(order.status)}
                          <span className="text-xs font-black uppercase tracking-widest text-gray-800">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-400 tracking-tight">
                          Ordered on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase mt-1">
                          ID: #{String(order.id)}
                        </p>
                      </div>
                      
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                          <span className="text-xl font-black text-primary">₹{order.total_amount}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsInvoiceOpen(true);
                              }}
                              className="text-[10px] bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                              Invoice
                            </button>
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (

                <div className="text-center py-16 px-4">
                  <div className="w-32 h-32 mx-auto bg-accent/50 rounded-full flex items-center justify-center mb-6 text-primary border-8 border-white shadow-xl">
                    <FontAwesomeIcon icon={faBoxOpen} className="text-5xl" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">No orders yet</h3>
                  <p className="text-gray-500 font-bold mb-10 max-w-sm mx-auto leading-relaxed">
                    You haven't purchased anything yet. Start exploring our farm-fresh products and fill up your cart!
                  </p>
                  
                  <Link 
                    href="/products" 
                    className="inline-flex bg-primary text-black font-black py-4 px-10 rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all items-center gap-3 overflow-hidden group relative"
                  >
                    <span className="relative z-10">START SHOPPING</span>
                    <FontAwesomeIcon icon={faArrowRight} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Invoice Modal */}
      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={() => setIsInvoiceOpen(false)} 
        order={selectedOrder} 
      />
    </div>
  );
}
