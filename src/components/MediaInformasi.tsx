import { motion } from "motion/react";
import { ArrowRight, Calendar, User, FileText, Bell } from "lucide-react";
import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function MediaInformasi() {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function fetchPosts() {
      if (!supabase) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('posts').select(`*, author:author_id(nama)`).order('created_at', { ascending: false }).limit(6);
        if (error) throw error;
        setNews(data || []);
      } catch (err) {
        console.error("Gagal memuat berita:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <section id="media" className="py-24 bg-transparent relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-dark-green font-bold tracking-widest text-sm uppercase mb-3">Pusat Informasi</h2>
            <h3 className="text-3xl md:text-5xl font-heading font-extrabold text-soft-black mb-4">Berita & Pengumuman</h3>
          </motion.div>
          <motion.a 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            href="#" 
            className="flex items-center gap-2 text-main-blue font-bold hover:gap-3 transition-all"
          >
            Lihat Semua <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 py-10 font-medium">Memuat informasi terbaru...</div>
        ) : news.length === 0 ? (
          <div className="text-center text-gray-500 py-10 font-medium">Belum ada berita atau pengumuman.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 border border-main-orange/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group flex flex-col hover:border-main-orange/40"
              >
                {item.featured_image_url ? (
                  <div className="relative h-56 overflow-hidden shrink-0">
                    <img src={item.featured_image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-main-blue shadow-sm capitalize">
                      {item.category}
                    </div>
                  </div>
                ) : (
                  <div className="relative h-56 overflow-hidden shrink-0 bg-gradient-to-br from-main-blue/10 to-leaf-green/10 flex items-center justify-center">
                     {item.category === 'pengumuman' ? <Bell className="w-16 h-16 text-main-blue/20" /> : <FileText className="w-16 h-16 text-main-blue/20" />}
                     <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-main-blue shadow-sm capitalize">
                      {item.category}
                    </div>
                  </div>
                )}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(item.created_at).toLocaleDateString('id-ID')}</div>
                    <div className="flex items-center gap-1"><User className="w-4 h-4" /> {item.author?.nama || 'Admin'}</div>
                  </div>
                  <h4 className="font-heading font-bold text-xl text-soft-black mb-4 group-hover:text-main-blue transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  {item.content && (
                     <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                        {item.content}
                     </p>
                  )}
                  <a href="#" className="font-semibold text-leaf-green flex items-center gap-1 group-hover:gap-2 transition-all text-sm mt-auto">
                    Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
