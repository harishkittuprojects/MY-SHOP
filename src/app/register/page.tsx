"use client";

import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faPhone, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("In a real app, this would create your account. For now, you can browse as a guest!");
    window.location.href = "/login";
  };

  return (
    <div className="container py-24 flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100 max-w-lg w-full">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black inline-block mb-6">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-xl">MADUR</span>
            <span className="text-secondary">.IN</span>
          </Link>
          <h2 className="text-2xl font-black">Join MADUR.IN</h2>
          <p className="text-gray-500 text-sm mt-2">Start your journey towards pure and healthy food</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
            <div className="relative">
              <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                required
                placeholder="John Doe"
                className="w-full bg-accent/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
            <div className="relative">
              <FontAwesomeIcon icon={faPhone} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="tel" 
                required
                placeholder="+91 00000 00000"
                className="w-full bg-accent/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                required
                placeholder="email@example.com"
                className="w-full bg-accent/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Create Password</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-accent/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-primary transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="bg-secondary text-secondary-foreground font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 mt-6 active:scale-95"
          >
            CREATE ACCOUNT
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-black hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
