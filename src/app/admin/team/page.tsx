"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faArrowLeft, faUserTie, faUpload, faEdit, faCrown, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  is_founder: boolean;
  display_order: number;
}

export default function AdminTeamPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    image_url: "",
    is_founder: false,
    display_order: 0
  });

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdminAuthenticated");
    if (isAdmin !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
      fetchMembers();
    }
  }, []);

  async function fetchMembers() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching team:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.publicUrl) {
         setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      }
    } catch (err) {
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: editingId })
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: "", role: "", bio: "", image_url: "", is_founder: false, display_order: 0 });
      fetchMembers();
    } catch (err) {
      alert("Error saving member!");
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image_url: member.image_url,
      is_founder: Boolean(member.is_founder),
      display_order: member.display_order
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchMembers();
    } catch (err) {
      alert("Error deleting member!");
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
              <h1 className="text-4xl font-black tracking-tighter">Team Manager</h1>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Founders & Leadership</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ name: "", role: "", bio: "", image_url: "", is_founder: false, display_order: 0 });
              setIsModalOpen(true);
            }}
            className="bg-primary text-black font-black px-8 py-4 rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Member
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {members.length === 0 ? (
               <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
                  <FontAwesomeIcon icon={faUserTie} className="text-5xl text-gray-100 mb-4" />
                  <p className="text-gray-400 font-bold italic">No team members yet. Add your founders!</p>
               </div>
            ) : members.map((member) => (
              <div key={member.id} className={`bg-white p-6 rounded-[2.5rem] shadow-xl border-l-8 ${member.is_founder ? 'border-primary' : 'border-secondary'} flex flex-col md:flex-row items-center gap-8 group transition-all`}>
                <div className="w-32 h-32 relative rounded-3xl overflow-hidden bg-accent shrink-0 shadow-lg">
                   {member.image_url ? (
                     <Image src={member.image_url} alt={member.name} fill className="object-cover" unoptimized />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FontAwesomeIcon icon={faUserTie} size="2xl" />
                     </div>
                   )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                   <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                      <h3 className="text-2xl font-black">{member.name}</h3>
                      {member.is_founder && <FontAwesomeIcon icon={faCrown} className="text-primary text-sm" />}
                   </div>
                   <p className="text-primary font-black uppercase text-[10px] tracking-[0.2em] mb-3">{member.role}</p>
                   <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-2xl">{member.bio}</p>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => handleEdit(member)}
                     className="w-12 h-12 rounded-2xl bg-accent text-gray-600 flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                   >
                     <FontAwesomeIcon icon={faEdit} />
                   </button>
                   <button 
                     onClick={() => handleDelete(member.id)}
                     className="w-12 h-12 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                   >
                     <FontAwesomeIcon icon={faTrash} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 my-auto">
            <h2 className="text-2xl font-black mb-8">{editingId ? "Edit Member" : "Add Team Member"}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input required
                      className="w-full bg-accent/50 rounded-2xl py-4 px-6 font-bold outline-none ring-primary/20 focus:ring-4 transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role / Designation</label>
                    <input required
                      className="w-full bg-accent/50 rounded-2xl py-4 px-6 font-bold outline-none ring-primary/20 focus:ring-4 transition-all"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      placeholder="e.g. Founder, CEO"
                    />
                 </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bio / Description</label>
                <textarea required rows={4}
                  className="w-full bg-accent/50 rounded-2xl py-4 px-6 font-bold outline-none ring-primary/20 focus:ring-4 transition-all resize-none"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-8 p-6 bg-accent/30 rounded-3xl border border-dashed border-gray-200">
                 <div className="w-24 h-24 relative rounded-2xl overflow-hidden bg-white shrink-0 shadow-sm">
                    {formData.image_url ? (
                       <Image src={formData.image_url} alt="Preview" fill className="object-cover" unoptimized />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <FontAwesomeIcon icon={faUpload} size="xl" />
                       </div>
                    )}
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-black mb-2 uppercase tracking-widest">Profile Photo</p>
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all font-bold text-xs">
                       <FontAwesomeIcon icon={faUpload} />
                       {uploading ? "Uploading..." : "Click to Upload"}
                       <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                 </div>
                 <div className="flex items-center gap-3">
                    <label className="text-xs font-black uppercase tracking-widest">Founder Access</label>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, is_founder: !formData.is_founder})}
                      className={`w-14 h-8 rounded-full relative transition-all ${formData.is_founder ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                       <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${formData.is_founder ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 font-bold py-5 rounded-2xl hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-black font-black py-5 rounded-2xl shadow-xl hover:opacity-90 transition-all">
                   {editingId ? "Update Member" : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
