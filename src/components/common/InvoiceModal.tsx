"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPrint, faFileInvoice, faCheckCircle, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById("invoice-content");
      if (!element) return;
      
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: 10,
        filename: `madur_invoice_${order.id || "download"}.pdf`,
        image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as 'mm', format: 'a4' as 'a4', orientation: 'portrait' as 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Could not generate PDF. You can use the Print button to save as PDF.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden my-8 print:m-0 print:shadow-none print:w-full print:max-w-none">
        
        {/* Header - Not visible during print */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FontAwesomeIcon icon={faFileInvoice} />
            </div>
            <h2 className="text-xl font-black text-gray-800">Order Invoice</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPDF}
              className="p-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all shadow-sm flex items-center gap-2 font-bold text-xs uppercase"
            >
              Download PDF
            </button>
            <button 
              onClick={handlePrint}
              // ... existing print button logic
              className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-primary transition-all shadow-sm flex items-center gap-2 font-bold text-xs uppercase"
            >
              <FontAwesomeIcon icon={faPrint} />
              Print
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-3 bg-primary text-black rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-2 font-black text-xs uppercase"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="invoice-content" className="p-10 print:p-0 bg-white">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="Madurfoods.in" width={180} height={50} className="h-10 w-auto object-contain" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Purity. Freshness. Healthy Living.</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-black text-gray-800 mb-1 uppercase">Invoice</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">#{String(order.id)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12 border-y py-8 border-gray-100">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Invoice To:</p>
              <h4 className="font-black text-gray-800 mb-1">{order.user_email?.split('@')[0]}</h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs">{order.shipping_address || "No address provided"}</p>
              <p className="text-xs text-gray-400 font-bold mt-2">{order.user_email}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Details:</p>
              <div className="space-y-1">
                <div className="flex justify-end gap-3 text-xs">
                  <span className="font-bold text-gray-400 uppercase">Order Date:</span>
                  <span className="font-black text-gray-700">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-end gap-3 text-xs">
                  <span className="font-bold text-gray-400 uppercase">Payment:</span>
                  <span className="font-black text-secondary tracking-widest uppercase">{order.payment_method || "Paid Online"}</span>
                </div>
                <div className="flex justify-end gap-3 text-xs">
                  <span className="font-bold text-gray-400 uppercase">Status:</span>
                  <span className="font-black text-green-500 tracking-widest uppercase">{order.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full mb-12">
            <thead>
              <tr className="bg-accent/50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right pr-1">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-6 py-5">
                       <p className="font-black text-gray-800 text-sm uppercase tracking-tight">{item.name}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{item.unit}</p>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-gray-600">{item.quantity}</td>
                    <td className="px-6 py-5 text-right font-bold text-gray-600">₹{Math.floor(item.price)}</td>
                    <td className="px-6 py-5 text-right font-black text-gray-800 pr-1">₹{Math.floor(item.price * item.quantity)}</td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-5">
                     <p className="font-black text-gray-800 text-sm">Smartphones & Gadgets Order</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Order #{order.id}</p>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-gray-600">1</td>
                  <td className="px-6 py-5 text-right font-bold text-gray-600">₹{order.total_amount}</td>
                  <td className="px-6 py-5 text-right font-black text-gray-800 pr-1">₹{order.total_amount}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end pt-8 border-t border-gray-100">
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                <span className="font-bold text-gray-800">₹{Math.floor(order.total_amount - (order.delivery_charge || 0))}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-400 uppercase tracking-widest">Delivery Charge</span>
                <span className={!order.delivery_charge || order.delivery_charge === 0 ? "font-bold text-green-500 uppercase tracking-widest" : "font-bold text-gray-800 uppercase tracking-widest"}>
                  {!order.delivery_charge || order.delivery_charge === 0 ? "FREE" : `₹${Math.floor(order.delivery_charge)}`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t-2 border-primary/20">
                <span className="text-xl font-black text-gray-800 uppercase tracking-tighter">Total Paid</span>
                <span className="text-2xl font-black text-primary">₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <div className="flex justify-center mb-4">
                <div className="bg-green-50 text-green-600 px-5 py-2 rounded-xl flex items-center gap-2 border border-green-100">
                   <FontAwesomeIcon icon={faCheckCircle} />
                   <span className="font-black text-[10px] uppercase tracking-wider">Payment Successfully Processed</span>
                </div>
             </div>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Thank you for shopping with MY SHOP Mobiles!</p>
             <p className="text-[9px] text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
               This is a computer-generated tax invoice. 1-Year Official Manufacturer Warranty on all certified devices.
             </p>
          </div>

          {/* Back Button at bottom - hidden during print */}
          <div className="mt-8 flex justify-center print:hidden">
            <button
              onClick={onClose}
              className="flex items-center gap-3 bg-secondary text-white font-black px-8 py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all text-sm uppercase tracking-widest"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Account
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 8mm 10mm;
        }
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: #fff !important;
            font-size: 10pt !important;
          }
          #invoice-content {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
