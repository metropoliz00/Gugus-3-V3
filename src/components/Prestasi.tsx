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

  const items = achievements.length > 0 ? achievements.map(a => ({
    title: a.title,
    name: a.description,
    year: a.year,
    image_url: a.image_url,
    icon: Trophy,
    bg: "bg-yellow-50",
    color: "text-yellow-600",
    border: 'border-yellow-200'
  })) : defaultAchievements;

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

        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className={`relative bg-white/80 backdrop-blur-md rounded-[2rem] p-8 border ${item.border} shadow-sm hover:shadow-xl transition-all overflow-hidden group flex flex-col`}
              >
                {/* Glow Background */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg} blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700`} />
                
                <div className="relative z-10 flex-1 flex flex-col">
                  {item.image_url ? (
                    <div className="w-full h-40 rounded-xl overflow-hidden mb-6 border border-gray-100 shadow-sm relative shrink-0">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm">
                        {item.year}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 border ${item.border}`}>
                        <Icon className={`w-8 h-8 ${item.color}`} />
                      </div>
                      <div className="inline-block px-3 py-1 bg-light-gray rounded-full text-xs font-bold text-gray-500 shrink-0">
                        {item.year}
                      </div>
                    </div>
                  )}
                  
                  <h4 className="font-heading font-bold text-2xl text-soft-black mb-2 leading-tight">{item.title}</h4>
                  <p className="text-gray-600 font-medium whitespace-pre-line flex-1">{item.name}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
