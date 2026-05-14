import { motion } from "motion/react";
import { Trophy, Medal, Star, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Prestasi() {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (supabase) {
        const { data } = await supabase.from('awards').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setAchievements(data);
        }
      }
    }
    load();
  }, []);

  const defaultAchievements = [
    { title: "Juara 1 Lomba OSN Tingkat Kabupaten", name: "Siti Rahma - SDN Jenu 1", year: "2023", icon: Trophy, bg: "bg-yellow-50", color: "text-yellow-600", border: 'border-yellow-200' },
    { title: "Sekolah Sehat Tingkat Provinsi", name: "SDN Sugihwaras 1", year: "2023", icon: Star, bg: "bg-leaf-green/10", color: "text-leaf-green", border: 'border-leaf-green/30' },
    { title: "Juara 2 Guru Berprestasi Kabupaten", name: "Ahmad Fauzi, S.Pd", year: "2024", icon: Medal, bg: "bg-main-blue/10", color: "text-main-blue", border: 'border-main-blue/30' },
  ];

  const items = achievements.length > 0 ? achievements.map(a => {
    let bg = "bg-yellow-50";
    let color = "text-yellow-600";
    let border = 'border-yellow-200';
    let icon = Trophy;

    if (a.category === 'Guru') {
      bg = "bg-leaf-green/10";
      color = "text-leaf-green";
      border = 'border-leaf-green/30';
      icon = Medal;
    } else if (a.category === 'Siswa') {
      bg = "bg-main-blue/10";
      color = "text-main-blue";
      border = 'border-main-blue/30';
      icon = Star;
    } else if (a.category === 'Sekolah') {
      bg = "bg-indigo-50";
      color = "text-indigo-600";
      border = 'border-indigo-200';
    } else if (a.category === 'Kepala Sekolah') {
      bg = "bg-amber-50";
      color = "text-amber-600";
      border = 'border-amber-200';
    }

    return {
      title: a.title,
      name: a.description,
      year: a.year,
      category: a.category,
      rank: a.rank,
      image_url: a.image_url,
      icon: icon,
      bg: bg,
      color: color,
      border: border
    };
  }) : defaultAchievements;

  return (
    <section id="prestasi" className="py-24 bg-transparent relative">
      <div className="container mx-auto px-6 max-w-7xl">
         <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-dark-green font-bold tracking-widest text-sm uppercase mb-3">Prestasi & Penghargaan</h2>
            <h3 className="text-3xl md:text-5xl font-heading font-extrabold text-soft-black mb-4">Pencapaian Gemilang</h3>
            <p className="text-gray-500 text-lg">Bukti nyata dari komitmen dan dedikasi ekosistem pendidikan Gugus 3 Melati Kecamatan Jenu.</p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item: any, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
                whileHover={{ y: -10 }}
                className="group relative rounded-[2.5rem] p-1 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-main-blue/20 transition-all duration-500 flex flex-col h-full"
              >
                {/* Ambient glow from the card itself */}
                <div className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white via-white to-gray-50 opacity-40`} />
                <div className={`absolute -inset-0.5 rounded-[2.5rem] bg-gradient-to-br from-white via-gray-100 to-gray-200 opacity-20 blur-sm group-hover:opacity-50 transition-opacity duration-500`} />
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/80 to-transparent transition-transform duration-1000 z-10 pointer-events-none rounded-[2.5rem]" />

                <div className="relative z-20 flex flex-col flex-1 bg-white rounded-[2.25rem] p-6 sm:p-8 overflow-hidden h-full shadow-inner border border-white/50">
                  {/* Background watermark icon */}
                  <Icon className={`absolute -bottom-6 -right-6 w-32 h-32 ${item.color} opacity-[0.04] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 pointer-events-none`} />

                  {item.image_url ? (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 relative shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                        {item.category && (
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${item.bg} ${item.color} border ${item.border} backdrop-blur-md`}>
                            {item.category}
                          </div>
                        )}
                        <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm border border-white/20">
                          {item.year}
                        </div>
                      </div>
                      
                      <div className="absolute bottom-3 left-3">
                         <div className={`w-10 h-10 rounded-xl ${item.bg} backdrop-blur-xl flex items-center justify-center border ${item.border} shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-5 h-5 ${item.color}`} />
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between mb-8 relative">
                      <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 border ${item.border} shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 relative z-10`}>
                        <Icon className={`w-8 h-8 ${item.color}`} />
                      </div>
                      <div className="flex flex-col items-end gap-2 z-10">
                        <div className="bg-gray-100/80 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-black text-gray-500 tracking-widest shadow-sm">
                          {item.year}
                        </div>
                        {item.category && (
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.bg} flex items-center gap-1 ${item.color} border ${item.border} shadow-sm backdrop-blur-sm`}>
                            {item.category}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1 flex flex-col relative z-10">
                    {item.rank && (
                      <div className="text-main-blue font-bold text-sm mb-2 uppercase tracking-wider">
                        {item.rank}
                      </div>
                    )}
                    <h4 className="font-heading font-black text-2xl sm:text-[22px] text-soft-black mb-4 leading-snug group-hover:text-main-blue transition-colors duration-300">
                      {item.title}
                    </h4>
                    <div className="mt-auto pt-4 relative">
                      <div className="absolute top-0 left-0 w-12 h-1 rounded-full bg-gray-100 group-hover:w-20 group-hover:bg-main-blue transition-all duration-500" />
                      <p className="text-gray-500 font-medium whitespace-pre-line text-sm leading-relaxed mt-4">
                        {item.name}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
