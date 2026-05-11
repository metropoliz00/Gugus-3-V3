import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, ArrowRight, Camera, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function KegiatanPage() {
  const [kegiatan, setKegiatan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    async function fetchEvents() {
        if (!supabase) return;
        const { data } = await supabase.from('events').select('*').order('date_start', { ascending: true });
        setKegiatan(data || []);
        setIsLoading(false);
    }
    
    fetchEvents();
  }, []);
  
  return (
    <div className="pt-24 min-h-screen bg-light-gray pb-20">
      {/* Header */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <span className="text-main-blue font-bold tracking-widest text-xs uppercase mb-3 block">Agenda & Dokumentasi</span>
              <h1 className="text-4xl md:text-5xl font-heading font-black text-soft-black mb-4">Kegiatan <span className="text-leaf-green">Gugus 3</span></h1>
              <p className="text-gray-500 text-lg">Ikuti perkembangan aktivitas pendidikan, workshop, dan agenda kolaboratif kami di lingkungan Gugus 3 Melati.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="bg-main-blue/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="bg-main-blue text-white p-3 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-soft-black leading-none mb-1">Agenda Terdekat</h4>
                    <p className="text-xs text-main-blue font-semibold">{kegiatan[0] ? new Date(kegiatan[0].date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kegiatan List */}
      <div className="container mx-auto px-6 max-w-7xl py-12">
        {isLoading ? (
            <div className="text-center py-20 text-gray-500">Memuat kegiatan...</div>
        ) : (
            <div className="grid grid-cols-1 gap-12">
            {kegiatan.map((item, idx) => (
                <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/5 border border-main-orange/20 flex flex-col lg:flex-row"
                >
                <div className="lg:w-1/3 h-64 lg:h-auto overflow-hidden relative">
                    <img src={item.image_url || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000&auto=format&fit=crop"} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-main-blue flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Dokumentasi Terkait
                        </div>
                    </div>
                </div>
                
                <div className="lg:w-2/3 p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-4 md:gap-8 mb-6 text-sm">
                        <div className="flex items-center gap-2 text-main-blue font-bold px-4 py-2 bg-main-blue/5 rounded-full">
                            <Calendar className="w-4 h-4" /> {new Date(item.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                            <Clock className="w-4 h-4" /> {new Date(item.date_start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                            <MapPin className="w-4 h-4" /> {item.location}
                        </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-heading font-black text-soft-black mb-4 hover:text-main-blue transition-colors">
                        {item.title}
                    </h2>
                    
                    <p className="text-gray-500 text-lg leading-relaxed mb-8">
                        {item.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-100">
                        {item.detail_url && (
                            <a href={item.detail_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-main-blue text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-main-blue/20 hover:bg-main-blue/90 transition-all">
                                Detail Lengkap <ArrowRight className="w-4 h-4" />
                            </a>
                        )}
                        {item.materi_url && (
                            <a href={item.materi_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-soft-black hover:text-main-blue px-6 py-3 rounded-2xl font-bold border border-gray-100 transition-all">
                                Unduh Materi <FileText className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
                </motion.div>
            ))}
            </div>
        )}
      </div>

      {/* Newsletter / Call to action */}
      <div className="container mx-auto px-6 max-w-7xl pt-12">
         <div className="bg-leaf-green rounded-[3rem] p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="max-w-xl text-center md:text-left">
                  <h3 className="text-3xl font-heading font-bold mb-4">Ingin Menambahkan Kegiatan?</h3>
                  <p className="text-white/80">Jika sekolah Anda memiliki agenda yang ingin dipublikasikan di lingkup Gugus 3, silakan login ke Dasbor Pengurus atau hubungi sekretariat gugus.</p>
               </div>
               <button className="bg-white text-leaf-green px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                  Hubungi Sekretariat
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
