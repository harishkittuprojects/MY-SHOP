"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faEdit, faArrowLeft, faStar, faQuoteLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    rating: 5,
    comment: ""
  });

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdminAuthenticated");
    if (isAdmin !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
      fetchReviews();
    }
  }, []);

  async function fetchReviews() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEdit = (review: Review) => {
    setFormData({
      customer_name: review.customer_name,
      rating: review.rating,
      comment: review.comment
    });
    setEditingReviewId(review.id);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ customer_name: "", rating: 5, comment: "" });
    setEditingReviewId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingReviewId ? "PUT" : "POST";
      const body = editingReviewId ? { id: editingReviewId, ...formData } : formData;

      const res = await fetch("/api/reviews", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsModalOpen(false);
      setFormData({ customer_name: "", rating: 5, comment: "" });
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      alert("Error saving review!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchReviews();
    } catch (err) {
      alert("Error deleting review!");
    }
  };

  if (!isAuthorized) return <div className="min-h-screen bg-accent/30"></div>;

  return (
    <div className="min-h-screen bg-accent/30 p-4 md:p-8 text-[#222222]">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 shadow-lg transition-all">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <div>
              <h1 className="text-4xl font-black tracking-tighter">Review Board</h1>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage Customer Feedback</p>
            </div>
          </div>
          <button 
            onClick={handleAddNew}
            className="bg-primary text-black font-black px-8 py-4 rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Review
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.length === 0 ? (
               <div className="col-span-full bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
                  <FontAwesomeIcon icon={faQuoteLeft} className="text-5xl text-gray-100 mb-4" />
                  <p className="text-gray-400 font-bold italic">No reviews yet. Add your first customer feedback!</p>
               </div>
            ) : reviews.map((review) => (
              <div key={review.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative group">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon 
                      key={i} 
                      icon={faStar} 
                      className={i < review.rating ? "text-yellow-400" : "text-gray-100"} 
                    />
                  ))}
                </div>
                <p className="text-base font-bold italic mb-6 leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-xs">
                         {review.customer_name?.charAt(0) || "U"}
                      </div>
                      <span className="font-black text-sm">— {review.customer_name}</span>
                   </div>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => handleEdit(review)}
                       className="w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                     >
                       <FontAwesomeIcon icon={faEdit} size="sm" />
                     </button>
                     <button 
                       onClick={() => handleDelete(review.id)}
                       className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                     >
                       <FontAwesomeIcon icon={faTrash} size="sm" />
                     </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black mb-6">{editingReviewId ? "Edit Review" : "Add Customer Review"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                <input required
                  className="w-full bg-accent/50 rounded-2xl py-4 px-6 font-bold outline-none border-none focus:ring-4 ring-primary/20"
                  value={formData.customer_name}
                  onChange={e => setFormData({...formData, customer_name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rating (1-5)</label>
                <div className="flex gap-4 mt-2">
                  {[1,2,3,4,5].map(num => (
                    <button 
                      key={num}
                      type="button"
                      onClick={() => setFormData({...formData, rating: num})}
                      className={`w-10 h-10 rounded-xl font-black transition-all ${formData.rating === num ? 'bg-primary text-black scale-110 shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Comment</label>
                <textarea required rows={4}
                  className="w-full bg-accent/50 rounded-2xl py-4 px-6 font-bold outline-none border-none focus:ring-4 ring-primary/20 resize-none"
                  value={formData.comment}
                  onChange={e => setFormData({...formData, comment: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 font-bold py-4 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-black font-black py-4 rounded-xl shadow-lg">
                  {editingReviewId ? "Update Review" : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
