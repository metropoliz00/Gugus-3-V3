import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PlusCircle, X, Award, Play, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import ImageUpload from './ImageUpload';

export function SharingPractices({ user }: { user: any }) {
  const [practices, setPractices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!supabase) return;
    const newPractice = {
      user_id: user.id,
      title: "Praktik Baik Baru",
      author_name: user.nama || user.full_name || user.username || "Guru Gugus 3",
      description: "Deskripsi praktik baik...",
      image_url:
        "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&q=80",
    };
    const { data, error } = await supabase
      .from("best_practices")
      .insert([newPractice])
      .select();
    if (!error && data) {
      setPractices([data[0], ...practices]);
      setEditingId(data[0].id);
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

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-500/5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">
            Sharing Praktik Baik
          </h2>
          <p className="text-sm text-gray-500">
            Wadah berbagi inspirasi dan pengalaman mengajar antar guru
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-main-blue text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-main-blue/20 hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" /> Bagikan Praktik Baik
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-main-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">Memuat inspirasi...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {practices.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col group h-full relative"
            >
              {/* Card Background Image (Full) */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${p.image_url || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80"})`,
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />

              {/* Card Content Overlaid */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end min-h-[400px]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-main-blue/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Praktik Baik
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 leading-tight drop-shadow-md">
                  {p.title}
                </h3>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-300 font-bold uppercase leading-none mb-1">
                      Oleh Pendidik
                    </p>
                    <p className="text-sm font-bold text-white">
                      {p.author_name || "Guru Gugus 3"}
                    </p>
                  </div>
                </div>

                <p className="text-gray-200 text-sm mb-8 line-clamp-3 leading-relaxed drop-shadow-sm">
                  {p.description}
                </p>

                <div className="pt-6 border-t border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-white/80 font-bold uppercase tracking-widest">
                    <Play className="w-4 h-4 text-main-blue" />
                    Bagi Pengalaman
                  </div>
                  {(p.user_id === user.id || user.role === "admin") && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                        className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-main-blue transition-all border border-white/20 shadow-lg"
                        title="Edit Konten"
                      >
                        {editingId === p.id ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-all border border-white/20 shadow-lg"
                        title="Hapus Konten"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Editing Form */}
                {editingId === p.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-white/95 backdrop-blur-xl rounded-3xl space-y-4 shadow-2xl text-soft-black"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Judul Praktik
                      </label>
                      <input
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold focus:border-main-blue outline-none"
                        value={p.title}
                        onChange={(e) =>
                          handleUpdate(p.id, { title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Nama Lengkap Penulis
                      </label>
                      <input
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold focus:border-main-blue outline-none"
                        value={p.author_name || ""}
                        onChange={(e) =>
                          handleUpdate(p.id, { author_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs h-24 focus:border-main-blue outline-none"
                        value={p.description}
                        onChange={(e) =>
                          handleUpdate(p.id, { description: e.target.value })
                        }
                      />
                    </div>
                    <ImageUpload
                      label="Foto Sampul"
                      value={p.image_url || ""}
                      onChange={(url) => handleUpdate(p.id, { image_url: url })}
                    />
                    <button
                      onClick={() => setEditingId(null)}
                      className="w-full bg-main-blue text-white py-3 rounded-2xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-main-blue/20"
                    >
                      Simpan Perubahan
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
