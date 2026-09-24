"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone, faMapMarkerAlt, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });

  const openWhatsApp = (data = formData) => {
    const phoneNumber = "917416750834";
    const text = `Hi MADUR.IN, I have an enquiry:
*Name:* ${data.name}
*Phone:* ${data.phone}
*Email:* ${data.email || 'N/A'}
*Message:* ${data.message}`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openWhatsApp();
    setFormData({ name: "", phone: "", email: "", message: "" });
  };

  return (
    <div className="pb-10 md:pb-20">
      {/* Header */}
      <section className="bg-background text-foreground pt-16 pb-8 md:pt-32 md:pb-20 text-center border-b border-black/5">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Get In Touch</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Have questions about our products or delivery? We're here to help you live a healthier, purer life.
          </p>
        </div>
      </section>

      <section className="container -mt-12">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-12">
          {/* Contact Information */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
               <h3 className="text-xl font-black mb-8">Contact Information</h3>
               
               <div className="flex flex-col gap-8">
                 <div className="flex gap-4">
                   <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center shrink-0">
                     <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xl" />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-800">Our Location</h4>
                     <p className="text-sm text-gray-500">Plot No. 42, Farm House Colony, Hyderabad, Telangana</p>
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-2xl flex items-center justify-center shrink-0">
                     <FontAwesomeIcon icon={faPhone} className="text-xl" />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-800">Phone Number</h4>
                     <p className="text-sm text-gray-500">+91 7416750834</p>
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <div className="w-12 h-12 bg-accent text-gray-600 rounded-2xl flex items-center justify-center shrink-0">
                     <FontAwesomeIcon icon={faEnvelope} className="text-xl" />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-800">Email Address</h4>
                     <p className="text-sm text-gray-500">info@madur.in</p>
                   </div>
                 </div>
               </div>

               <div className="mt-12 pt-8 border-t">
                 <p className="font-bold text-sm mb-4">Quick Connect</p>
                 <button 
                  onClick={() => openWhatsApp()}
                  className="w-full bg-green-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-lg active:scale-95"
                 >
                   <FontAwesomeIcon icon={faWhatsapp} className="text-2xl" />
                   Chat on WhatsApp
                 </button>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-black mb-8">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your name"
                    className="bg-accent/50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 ring-primary"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="Enter phone number"
                    className="bg-accent/50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 ring-primary"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter email address"
                    className="bg-accent/50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 ring-primary"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Your Message</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="How can we help you?"
                    className="bg-accent/50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 ring-primary resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <div className="md:col-span-2 mt-4">
                  <button 
                    type="submit"
                    className="bg-primary text-primary-foreground font-black px-10 py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 w-full md:w-fit"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Submit Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="container py-8 md:py-24">
         <div className="w-full h-[400px] bg-white rounded-[3rem] overflow-hidden relative shadow-xl border-4 border-white">
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-5xl text-primary mb-4" />
                  <p className="font-bold text-gray-400">Google Maps Integration Placeholder</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
