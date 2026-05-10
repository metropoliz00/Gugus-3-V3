import { motion, AnimatePresence } from "motion/react";
import { Play, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Gallery() {
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        console.error("Gagal memuat galeri:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGallery();
  }, []);

  useEffect(() => {
    if (!isAutoPlay || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length, isAutoPlay]);

  const next = () => {
    if (items.length === 0) return;
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    if (items.length === 0) return;
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <section id="galeri" className="py-24 bg-gradient-to-b from-white to-light-gray relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-leaf-green font-bold tracking-widest text-sm uppercase mb-3 px-4 py-1 bg-leaf-green/10 rounded-full w-max">Dokumentasi</h2>
              <h3 className="text-4xl md:text-5xl font-heading font-extrabold text-soft-black mb-6">Momen Berharga <span className="text-main-blue">Gugus 3</span></h3>
              <p className="text-gray-500 text-lg leading-relaxed">Saksikan dokumentasi visual dari berbagai kegiatan kolaboratif dan inovatif yang dilaksanakan oleh seluruh anggota Gugus 3 Melati Kecamatan Jenu.</p>
            </motion.div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={prev}
              className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-main-blue hover:text-white hover:border-main-blue transition-all shadow-sm active:scale-95 disabled:opacity-50"
              disabled={items.length <= 1}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={next}
              className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-main-blue hover:text-white hover:border-main-blue transition-all shadow-sm active:scale-95 disabled:opacity-50"
              disabled={items.length <= 1}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isLoading ? (
           <div className="text-center text-gray-400 font-medium py-10">Memuat galeri foto...</div>
        ) : items.length === 0 ? (
           <div className="text-center text-gray-400 font-medium py-10">Galeri belum tersedia.</div>
        ) : (
          <div className="relative group">
            <div className="aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-gray-100 shadow-2xl relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <img 
                    src={items[currentIndex].media_url} 
                    alt={items[currentIndex].title || `Gallery ${currentIndex}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                    <div className="text-white max-w-xl">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-main-orange/40 uppercase tracking-widest">
                          {items[currentIndex].type === 'video' ? 'Video Kegiatan' : 'Foto Kegiatan'}
                        </span>
                        <h4 className="text-2xl md:text-3xl font-bold font-heading mb-2">{items[currentIndex].title || 'Dokumentasi Aktivitas KKG'}</h4>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsAutoPlay(false);
                    setCurrentIndex(i);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    currentIndex === i ? 'w-8 bg-main-blue h-2' : 'w-2 bg-gray-300 h-2'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
