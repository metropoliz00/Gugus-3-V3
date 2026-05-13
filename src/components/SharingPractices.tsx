import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PlusCircle, X, Award, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageUpload } from './ImageUpload';

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
      description: "Deskripsi praktik baik...",
      image_url: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&q=80",
    };
    const { data, error } = await supabase
      .from("best_practices")
      .insert([newPractice])
      .select();
    if (!error && data) {
      setPractices([data[0], ...practices]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-heading text-soft-black">Praktik Baik Guru</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-main-blue text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg hover:bg-blue-600"
        >
          <PlusCircle className="w-5 h-5" /> Tambah Praktik Baik
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">Memuat data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practices.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg shadow-gray-100/50"
            >
              <div 
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${p.image_url || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80'})` }}
              >
                <div className="bg-black/40 h-full w-full p-6 flex flex-col justify-end">
                    <h3 className="text-lg font-bold text-white">{p.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">{p.description}</p>
                {p.user_id === user.id && (
                    <button className="text-red-500 text-xs font-bold">Hapus</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
