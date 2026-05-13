import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PlusCircle, X, Award, Play, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImageUpload from './ImageUpload';

export function SharingPractices({ user }: { user: any }) {
  const [practices, setPractices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPractices() {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("best_practices")
          .select("*")
          .order("created_at", { ascending: false });
        setPractices(data || []);
      } catch (err) {
        console.error("Error fetching sharing practices:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPractices();
  }, []);

  const handleAdd = async () => {
    if (!supabase || isAdding) return;
    setIsAdding(true);
    try {
      const newPractice = {
        user_id: user.id,
        title: "Praktik Baik Baru",
        author_name: user.nama || user.full_name || user.username || "Guru Gugus 3",
        description: "Bagikan pengalaman mengajar Anda di sini...",
        image_url: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&q=80",
      };
      const { data, error } = await supabase
        .from("best_practices")
        .insert([newPractice])
        .select();
      
      if (error) throw error;
      if (data) {
        setPractices([data[0], ...practices]);
        setEditingId(data[0].id);
        // Scroll to top to see the new form
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error("Error adding practice:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    const { error } = await supabase
      .from("best_practices")
      .update(updates)
      .eq("id", id);
    if (!error) {
      setPractices(
        practices.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus praktik baik ini?")) return;
    const { error } = await supabase
      .from("best_practices")
      .delete()
      .eq("id", id);
    if (!error) {
      setPractices(practices.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-10">
      {/* Modern Sharing Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-main-blue via-indigo-600 to-violet-700 p-10 rounded-[3rem] shadow-2xl shadow-main-blue/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-white border border-white/30 shadow-2xl">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Inspirasi Kolektif</span>
              </div>
              <h2 className="text-4xl font-black font-heading text-white tracking-tight leading-none mb-2">
                Sharing Praktik Baik
              </h2>
              <p className="text-base text-white/80 font-medium max-w-lg leading-relaxed">
                Wadah kolaborasi untuk berbagi inovasi pengajaran guna memajukan pendidikan di lingkungan Gugus 3.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="group relative bg-white text-main-blue px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-main-blue opacity-0 group-hover:opacity-5 transition-opacity" />
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-main-blue/30 border-t-main-blue rounded-full animate-spin" />
            ) : (
              <PlusCircle className="w-5 h-5" />
            )}
            {isAdding ? "Menyiapkan..." : "Bagikan Karya"}
          </button>
        </div>
      </div>

      {/* Modal for Editing/Adding */}
      <AnimatePresence>
        {editingId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h3 className="text-xl font-black text-soft-black">Form Praktik Baik</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Lengkapi Detail Inspirasi Anda</p>
                  </div>
                  <button onClick={() => setEditingId(null)} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-soft-black transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 modern-scrollbar">
                  {practices.filter(p => p.id === editingId).map(p => (
                    <div key={p.id} className="space-y-6">
                      <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-main-blue transition-colors">Judul Praktik</label>
                        <input
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-main-blue focus:bg-white outline-none transition-all"
                          value={p.title}
                          onChange={(e) => handleUpdate(p.id, { title: e.target.value })}
                          placeholder="Contoh: Metode Belajar Seru di Luar Kelas"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-main-blue transition-colors">Nama Penulis</label>
                        <input
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-main-blue focus:bg-white outline-none transition-all"
                          value={p.author_name || ""}
                          onChange={(e) => handleUpdate(p.id, { author_name: e.target.value })}
                          placeholder="Ketik Nama Lengkap Anda"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-main-blue transition-colors">Deskripsi Inspirasi</label>
                        <textarea
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-medium h-40 focus:border-main-blue focus:bg-white outline-none transition-all leading-relaxed"
                          value={p.description}
                          onChange={(e) => handleUpdate(p.id, { description: e.target.value })}
                          placeholder="Ceritakan tantangan, langkah-langkah, dan keberhasilan praktik baik yang Anda lakukan..."
                        />
                      </div>
                      <div className="pt-2">
                        <ImageUpload
                          label="Upload Foto Sampul"
                          value={p.image_url || ""}
                          onChange={(url) => handleUpdate(p.id, { image_url: url })}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                  <button
                    onClick={() => setEditingId(null)}
                    className="w-full bg-gradient-to-r from-main-blue to-indigo-600 text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-main-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Simpan & Publikasikan Sekarang
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-main-blue border-t-transparent rounded-full mx-auto mb-4 shadow-lg shadow-main-blue/10"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Menyiapkan Inspirasi...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
          {practices.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200 flex flex-col group h-full relative"
            >
              {/* Card Background Image (Full) */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${p.image_url || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80"})`,
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

              {/* Card Content Overlaid */}
              <div className="relative z-10 p-10 h-full flex flex-col justify-end min-h-[500px]">
                {/* Admin/Owner Controls */}
                {(p.user_id === user.id || user.role === "admin") && (
                  <div className="absolute top-8 right-8 flex gap-3">
                    <button
                      onClick={() => setEditingId(p.id)}
                      className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-main-blue transition-all border border-white/20 shadow-2xl group/btn"
                      title="Edit Praktik Baik"
                    >
                      <PlusCircle className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-12 h-12 rounded-2xl bg-red-500/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-red-500 transition-all border border-white/20 shadow-2xl"
                      title="Hapus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-leaf-green text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-leaf-green/20">
                    Praktik Baik
                  </span>
                </div>

                <h3 className="text-3xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-2xl group-hover:text-main-blue transition-colors duration-500">
                  {p.title}
                </h3>

                <p className="text-gray-300 text-sm mb-10 line-clamp-3 leading-relaxed drop-shadow-lg flex-1 font-medium italic">
                  "{p.description}"
                </p>

                <div className="pt-8 border-t border-white/10 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-main-blue/20 backdrop-blur-md flex items-center justify-center border border-main-blue/30">
                        <Play className="w-4 h-4 text-main-blue fill-main-blue" />
                     </div>
                     <span className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">Inovasi</span>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none mb-2">Penulis</p>
                    <div className="flex items-center justify-end gap-3 text-white">
                      <span className="text-base font-black truncate max-w-[140px] drop-shadow-lg">
                        {p.author_name || "Guru Gugus 3"}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-main-blue to-leaf-green flex items-center justify-center shadow-xl border border-white/10">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
