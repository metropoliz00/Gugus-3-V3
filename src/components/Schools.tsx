import { motion, AnimatePresence } from "motion/react";
import { MapPin, Users, BookOpen, ArrowRight, X, Target, Lightbulb, Star, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AccreditationSeal = ({ grade, size = "md" }: { grade: string; size?: "sm" | "md" | "lg" }) => {
  if (!grade) return null;
  const initial = grade.charAt(0).toUpperCase();
  
  const outerSize = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  const ribbonWidth = size === "sm" ? "w-3" : size === "lg" ? "w-6" : "w-4";
  const ribbonHeight = size === "sm" ? "h-6" : size === "lg" ? "h-14" : "h-10";
  const letterSize = size === "sm" ? "text-[8px]" : size === "lg" ? "text-2xl" : "text-sm";
  const labelSize = size === "sm" ? "text-[4px]" : size === "lg" ? "text-[7px]" : "text-[5px]";

  return (
    <div className="relative flex flex-col items-center">
      {/* Ribbons */}
      <div className={`absolute ${size === "sm" ? "top-5" : size === "lg" ? "top-11" : "top-8"} flex items-center justify-center gap-0.5 z-0`}>
        <div className={`${ribbonWidth} ${ribbonHeight} bg-gradient-to-b from-red-600 to-red-800 [clip-path:polygon(0%_0%,100%_0%,100%_100%,50%_80%,0%_100%)] rotate-[-12deg] origin-top translate-x-0.5 shadow-sm`}></div>
        <div className={`${ribbonWidth} ${ribbonHeight} bg-gradient-to-b from-red-600 to-red-800 [clip-path:polygon(0%_0%,100%_0%,100%_100%,50%_80%,0%_100%)] rotate-[12deg] origin-top -translate-x-0.5 shadow-sm`}></div>
      </div>

      {/* Main Seal Body */}
      <div className={`relative ${outerSize} flex items-center justify-center z-10 filter drop-shadow-md`}>
        {/* Scalloped Gold Background */}
        <svg className="absolute inset-0 w-full h-full text-[#D4AF37] fill-current" viewBox="0 0 24 24">
          <path d="M12 2L13.8 3.5L15.9 2.7L17.2 4.6L19.4 4.8L19.8 6.9L21.7 8L21.2 10.1L22.6 11.8L21.4 13.7L22.1 15.8L20.4 17.2L20.1 19.3L18.1 20L17 21.8L14.9 21.6L13.3 22.9L11.4 22L9.5 22.9L7.9 21.6L5.8 21.8L4.7 20L2.7 19.3L2.4 17.2L0.7 15.8L1.4 13.7L0.2 11.8L1.6 10.1L1.1 8L3 6.9L3.4 4.8L5.6 4.6L6.9 2.7L9 3.5L10.8 2H12Z" />
        </svg>
        
        {/* Inner Gold ring */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-[#B8860B] via-[#FFD700] to-[#B8860B] p-[1.5px]">
          {/* Dark inner circle */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2a221a] to-[#120e0a] flex flex-col items-center justify-center border border-[#D4AF37]/40 relative overflow-hidden">
            {/* Arched Label */}
            <svg className="absolute top-0.5 w-[90%] h-[90%] z-20 pointer-events-none" viewBox="0 0 100 100">
               <path id={`curve-${grade}-${size}`} d="M 20,40 A 30,30 0 0,1 80,40" fill="none" />
               <text className={`font-black fill-[#FFD700] ${labelSize}`} textAnchor="middle">
                 <textPath xlinkHref={`#curve-${grade}-${size}`} startOffset="50%">AKREDITASI</textPath>
               </text>
            </svg>
            
            {/* Wreath placeholder */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100">
               <path d="M30 75 Q 15 50 30 25 M70 75 Q 85 50 70 25" fill="none" stroke="#FFD700" strokeWidth="3" strokeDasharray="1 3" />
            </svg>
            
            {/* Letter */}
            <span className={`text-[#FFD700] font-black ${letterSize} italic tracking-tighter drop-shadow-[0_2px_1px_rgba(0,0,0,0.9)] z-10`}>
              {initial}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Schools() {
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'Semua' | 'Sekolah Inti' | 'Sekolah Imbas'>('Semua');

  useEffect(() => {
    async function fetchSchools() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.from('schools').select('*').order('name', { ascending: true });
        if (error) throw error;
        setSchools(data || []);
      } catch (err) {
        console.error("Error fetching schools:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchools();
  }, []);

  const filteredSchools = schools.filter(s => {
    if (filter === 'Semua') return true;
    return s.jenis_sekolah === filter;
  });

  return (
    <section id="sekolah" className="py-24 bg-light-gray relative">
      <div className="container mx-auto px-6 max-w-9xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-dark-green font-bold tracking-widest text-sm uppercase mb-3">Jaringan Pendidikan</h2>
            <h3 className="text-3xl md:text-5xl font-heading font-extrabold mb-6">
              <span className="text-main-blue">Profil Sekolah</span> <br />
              <span className="text-main-orange">Gugus 3 Melati Kecamatan Jenu</span>
            </h3>
            <p className="text-gray-500 text-lg">Membangun harmoni dalam keberagaman melalui kolaborasi Sekolah Inti dan Sekolah Imbas untuk mencetak generasi unggul.</p>
          </motion.div>
        </div>

        {/* Filter Buttons */}
        {!isLoading && schools.length > 0 && (
          <div className="flex justify-center gap-3 mb-12">
            {(['Semua', 'Sekolah Inti', 'Sekolah Imbas'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-main-blue text-white shadow-lg shadow-main-blue/20'
                    : 'bg-white text-gray-500 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
           <div className="text-center text-gray-400 font-medium py-10">Memuat profil sekolah...</div>
        ) : filteredSchools.length === 0 ? (
           <div className="text-center text-gray-400 font-medium py-10">Data sekolah tidak ditemukan untuk kategori ini.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSchools.map((school, i) => (
              <motion.div
                key={school.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 border border-main-orange/20 group flex flex-col"
              >
                 <div className="relative h-64 overflow-hidden shrink-0 bg-gray-100">
                   <img 
                     src={school.image_url || school.logo_url || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2000&auto=format&fit=crop'} 
                     alt={school.name} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-dark-gray/90 via-dark-gray/20 to-transparent" />
                   
                   {/* School Logo (Top Right) */}
                   <div className="absolute top-4 right-4 w-12 h-12 bg-white/30 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-white/50 z-10">
                     <img 
                       src={school.logo_url || 'https://www.image2url.com/r2/default/images/1778156189287-e4930eb4-3c36-4ace-8420-ca8908132e66.png'} 
                       alt="Logo" 
                       className="w-full h-full object-contain" 
                     />
                   </div>

                   {/* School Type Badge */}
                   <div className="absolute top-4 left-4 flex flex-col gap-2">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                       school.jenis_sekolah === 'Sekolah Inti' 
                       ? 'bg-main-blue/20 text-white border-white/30' 
                       : 'bg-leaf-green/20 text-white border-white/30'
                     }`}>
                       {school.jenis_sekolah || 'Sekolah Imbas'}
                     </span>
                     {school.akreditasi && (
                       <div className="relative group/akred">
                         <AccreditationSeal grade={school.akreditasi} />
                         <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 text-[10px] text-white font-bold rounded-lg opacity-0 group-hover/akred:opacity-100 transition-all scale-95 group-hover/akred:scale-100 whitespace-nowrap z-50 shadow-xl border border-white/10">
                           AKREDITASI {school.akreditasi.toUpperCase()}
                         </div>
                       </div>
                     )}
                   </div>

                   <div className="absolute bottom-4 left-4 right-4">
                     <h4 className="text-white font-heading font-bold text-2xl">{school.name}</h4>
                   </div>
                 </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                    {school.principal_image_url ? (
                      <img src={school.principal_image_url} alt={school.principal_name} className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-main-orange/20 shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-light-gray flex items-center justify-center text-main-blue shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-dark-gray text-base">Kepala Sekolah</p>
                      <p className="text-gray-500 font-medium">{school.principal_name || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-light-gray rounded-xl p-3 text-center">
                      <BookOpen className="w-5 h-5 mx-auto text-leaf-green mb-1" />
                      <span className="text-xs font-semibold text-gray-500 block">Siswa</span>
                      <span className="font-bold text-dark-gray">{school.student_count || 0}</span>
                    </div>
                    <div className="bg-light-gray rounded-xl p-3 text-center">
                      <Users className="w-5 h-5 mx-auto text-accent-orange mb-1" />
                      <span className="text-xs font-semibold text-gray-500 block">Guru</span>
                      <span className="font-bold text-dark-gray">{school.teacher_count || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => setSelectedSchool(school)}
                      className="text-main-blue font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all hover:text-dark-blue"
                    >
                      Lihat Detail <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setSelectedSchool(school)}
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-leaf-green hover:bg-green-50 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* School Detail Modal */}
      <AnimatePresence>
        {selectedSchool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSchool(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-6xl relative z-10 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]"
            >
              {/* Header */}
              <div className="relative h-48 sm:h-64 shrink-0 bg-gray-100">
                <img 
                  src={selectedSchool.image_url || selectedSchool.logo_url || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2000&auto=format&fit=crop'} 
                  alt={selectedSchool.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                
                {/* Detail Modal Logo */}
                <div className="absolute top-4 left-6 w-16 h-16 bg-white/30 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/50 z-10 hidden sm:block">
                  <img 
                    src={selectedSchool.logo_url || 'https://www.image2url.com/r2/default/images/1778156189287-e4930eb4-3c36-4ace-8420-ca8908132e66.png'} 
                    alt="Logo" 
                    className="w-full h-full object-contain" 
                  />
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedSchool(null); }}
                  className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors cursor-pointer pointer-events-auto"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-6 left-6 right-6 text-gray-700 pointer-events-none">
                  <h3 className="text-xl sm:text-3xl lg:text-4xl font-heading font-bold mb-2 break-normal leading-tight text-main-blue">{selectedSchool.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium opacity-90 overflow-x-auto no-scrollbar pointer-events-auto">
                    <span className="flex items-center gap-2 shrink-0">
                       {selectedSchool.principal_image_url ? 
                         <img src={selectedSchool.principal_image_url} className="w-5 h-5 rounded-full object-cover border border-white/50" alt="" /> :
                         <Users className="w-4 h-4" />
                       }
                       {selectedSchool.principal_name || '-'}
                    </span>
                    <span className="flex items-center gap-1 shrink-0"><BookOpen className="w-4 h-4" /> {selectedSchool.student_count || 0} Siswa</span>
                    <span className="flex items-center gap-1 shrink-0"><Star className="w-4 h-4" /> {selectedSchool.teacher_count || 0} Guru</span>
                    {selectedSchool.akreditasi && (
                      <div className="flex items-center gap-3 pr-4 py-1.5 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 shadow-sm transition-all hover:bg-yellow-500/10 group/modal-akred">
                        <div className="shrink-0 scale-90 translate-x-2">
                           <AccreditationSeal grade={selectedSchool.akreditasi} size="md" />
                        </div>
                        <div className="ml-2 flex flex-col">
                           <span className="text-[8px] font-black text-yellow-600 uppercase tracking-widest leading-none mb-1 opacity-70">Sertifikasi Nasional</span>
                           <span className="text-[11px] font-black text-stone-800 tracking-wider uppercase">Akreditasi {selectedSchool.akreditasi}</span>
                        </div>
                      </div>
                    )}
                    <span className="px-2 py-0.5 bg-main-blue/10 text-main-blue rounded uppercase text-[10px] tracking-widest shrink-0 border border-main-blue/20">{selectedSchool.jenis_sekolah || 'Sekolah Imbas'}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 overflow-y-auto w-full">
                {selectedSchool.motto && (
                  <div className="bg-gradient-to-r from-main-blue/10 to-leaf-green/10 border border-main-blue/20 rounded-2xl p-6 text-center mb-8">
                    <h4 className="text-main-blue font-bold uppercase tracking-widest text-xs mb-2">Moto Sekolah</h4>
                    <p className="text-xl font-heading font-semibold text-soft-black italic">"{selectedSchool.motto}"</p>
                  </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-main-blue/10 text-main-blue rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5" />
                        </div>
                        <h4 className="text-xl font-bold font-heading">Visi</h4>
                      </div>
                      <p className="text-gray-600 leading-relaxed pl-13 whitespace-pre-wrap">{selectedSchool.vision || 'Visi belum ditentukan.'}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-leaf-green/10 text-leaf-green rounded-xl flex items-center justify-center">
                          <Star className="w-5 h-5" />
                        </div>
                        <h4 className="text-xl font-bold font-heading">Keunggulan Sekolah</h4>
                      </div>
                      <p className="text-gray-600 leading-relaxed pl-13 whitespace-pre-wrap">{selectedSchool.keunggulan || 'Belum ada keunggulan yang dicantumkan.'}</p>
                    </div>

                    {selectedSchool.prestasi_images && selectedSchool.prestasi_images.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-main-orange/10 text-main-orange rounded-xl flex items-center justify-center">
                            <Lightbulb className="w-5 h-5" />
                          </div>
                          <h4 className="text-xl font-bold font-heading">Prestasi Sekolah</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-2">
                          {selectedSchool.prestasi_images.slice(0, 4).map((item: any, idx: number) => {
                            const img = typeof item === 'string' ? item : item.image;
                            const desc = typeof item === 'object' ? item.description : "";
                            return (
                              <div key={idx} className="group/item relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50">
                                <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" alt={`Prestasi ${idx + 1}`} />
                                {desc && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <p className="text-white text-[10px] font-bold leading-tight line-clamp-3 italic">
                                      "{desc}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                      
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-main-blue/10 text-main-blue rounded-xl flex items-center justify-center">
                            <Navigation className="w-5 h-5" />
                          </div>
                          <h4 className="text-lg font-bold font-heading">Lokasi Sekolah</h4>
                        </div>
                        <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                          {selectedSchool.map_embed_url ? (
                             <>
                               <iframe 
                                 src={selectedSchool.map_embed_url} 
                                 width="100%" 
                                 height="100%" 
                                 style={{ border: 0 }} 
                                 allowFullScreen 
                                 loading="lazy" 
                                 referrerPolicy="no-referrer-when-downgrade"
                                 title={`Peta lokasi ${selectedSchool.name}`}
                               />
                               <div className="absolute top-4 right-4 flex gap-2">
                                 <a 
                                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedSchool.name)}`}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="bg-white/90 backdrop-blur-md hover:bg-main-blue hover:text-white transition-all p-2 rounded-xl shadow-lg border border-white/50 text-gray-700 flex items-center gap-2 text-xs font-bold"
                                 >
                                   <Navigation className="w-4 h-4" /> Buka Maps
                                 </a>
                               </div>
                             </>
                           ) : (
                             <span className="text-gray-400 text-sm">Peta tidak tersedia</span>
                          )}
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
