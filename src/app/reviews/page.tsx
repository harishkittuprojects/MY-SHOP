"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faStar, 
  faQuoteLeft, 
  faArrowLeft, 
  faCheckCircle 
} from "@fortawesome/free-solid-svg-icons";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-16">
      <div className="container max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-secondary font-bold hover:gap-3 transition-all mb-6 group"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            BACK TO HOME
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-[#222222] mb-4">
                What Our Customers Say
              </h1>
              <p className="text-lg text-gray-600 font-medium max-w-2xl">
                We take pride in delivering the freshest products from our farms to your tables. Hear directly from our community of satisfied families.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-secondary/10 shadow-xl flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-black text-secondary">4.9</p>
                <div className="flex gap-0.5 text-yellow-400 my-1">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} size="xs" />
                  ))}
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Average Rating</p>
              </div>
              <div className="w-px h-12 bg-gray-100"></div>
              <div>
                <p className="text-xl font-black text-[#222222]">500+</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest uppercase tracking-widest">Happy Families</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white animate-pulse rounded-[2rem] border border-gray-100"></div>
            ))
          ) : reviews.length === 0 ? (
            <div className="col-span-full text-center py-20 opacity-30 italic font-bold text-[#222222]">
              No reviews shared yet.
            </div>
          ) : reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-7xl text-secondary" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon 
                    key={i} 
                    icon={faStar} 
                    className={`${i < review.rating ? 'text-yellow-400' : 'text-gray-200'} text-sm`} 
                  />
                ))}
              </div>
              
              <p className="text-[#222222] text-lg font-bold italic leading-relaxed mb-8">
                "{review.comment}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary font-black text-lg">
                  {review.customer_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-[#222222] tracking-tight">{review.customer_name}</p>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-secondary text-[10px]" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verified Customer</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 bg-secondary rounded-[3rem] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-[100px]"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-[100px]"></div>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">
            Join the Madur.in Family Today
          </h2>
          <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the purity of farm-fresh products delivered straight to your door. Subscribe to our daily milk plans and taste the difference.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/products" 
              className="bg-white text-secondary font-black px-12 py-5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              SHOP PRODUCTS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
