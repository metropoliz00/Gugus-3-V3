import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, ChevronRight, Activity } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';

export default function KkgAgendaPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date_start", { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-light-gray min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-main-blue/10 text-main-blue font-semibold text-sm mb-6"
          >
            <Activity className="w-4 h-4" />
            <span>Jadwal & Agenda</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-soft-black mb-4">Timeline Kegiatan KKG</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Pantau seluruh rangkaian agenda kegiatan Kelompok Kerja Guru (KKG) Gugus 3 Melati secara real-time.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
             <div className="w-12 h-12 border-4 border-main-blue/20 border-t-main-blue rounded-full animate-spin" />
             <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Memuat Timeline...</p>
          </div>
        ) : (
          <div className="relative pl-8 md:pl-12 space-y-12 before:content-[''] before:absolute before:left-[15px] md:left-[19px] before:top-2 before:bottom-2 before:w-[3px] before:bg-gradient-to-b before:from-main-blue before:via-main-blue/50 before:to-transparent">
            {events.map((a, i) => {
              const d = new Date(a.date_start);
              const now = new Date();
              const isPast = d < now;
              const isToday = d.toDateString() === now.toDateString();

              return (
                <motion.div 
                  key={a.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
                  {/* Dot Marker */}
                  <div className={`absolute -left-[31px] md:-left-[35px] top-2 w-7 h-7 rounded-full border-4 border-white shadow-xl z-20 transition-all duration-300 group-hover:scale-125 ${
                    isPast ? 'bg-gray-400 shadow-gray-200' : 'bg-main-blue shadow-main-blue/30 scale-110'
                  }`} >
                    {!isPast && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-main-blue/40" />
                    )}
                  </div>

                  <div className={`bg-white p-6 md:p-8 rounded-[2rem] border transition-all duration-300 ${
                    isPast ? 'border-gray-100 opacity-80' : 'border-main-blue/20 shadow-xl shadow-main-blue/5 group-hover:border-main-blue/40'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                             isPast ? 'bg-gray-100 text-gray-500' : isToday ? 'bg-orange-500 text-white' : 'bg-main-blue text-white'
                           }`}>
                             {isPast ? 'Selesai' : isToday ? 'Hari Ini' : 'Mendatang'}
                           </span>
                           <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                             <Clock className="w-3 h-3" /> {d.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" })} WIB
                           </span>
                        </div>
                        <h2 className={`text-xl md:text-2xl font-bold font-heading ${isPast ? 'text-gray-500' : 'text-soft-black'}`}>
                          {a.title}
                        </h2>
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end">
                         <div className="text-right">
                           <p className={`text-lg font-black ${isPast ? 'text-gray-400' : 'text-main-blue'}`}>
                             {d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric" })} {d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", month: "long" })}
                           </p>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", weekday: "long" })}</p>
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 items-center pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                           <MapPin className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Lokasi</p>
                            <p className="text-sm font-bold text-soft-black">{a.location || 'Lokasi belum ditentukan'}</p>
                         </div>
                      </div>

                      {a.description && (
                        <div className="flex-1 min-w-[200px]">
                           <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 italic">
                             "{a.description}"
                           </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {events.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Calendar className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Belum Ada Agenda</h3>
                <p className="text-gray-500 mt-2">Agenda kegiatan akan segera diumumkan melalui portal ini.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
