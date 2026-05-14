import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AnggotaGugusPage() {
  const [gurus, setGurus] = useState<any[]>([]);
  const [groupedGurus, setGroupedGurus] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGuru, setSelectedGuru] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [gurusRes, schoolsRes] = await Promise.all([
          supabase.from('user_profiles').select('*').eq('role', 'guru'),
          supabase.from('schools').select('name, logo_url')
        ]);
        
        if (gurusRes.error) throw gurusRes.error;
        if (schoolsRes.error) throw schoolsRes.error;
        
        setSchools(schoolsRes.data || []);
        
        const sortedData = (gurusRes.data || []).sort((a, b) => {
          // ... (keep same sorting logic as before) ...
          const schoolA = (a.sekolah || "").toLowerCase();
          const schoolB = (b.sekolah || "").toLowerCase();
          if (schoolA < schoolB) return -1;
          if (schoolA > schoolB) return 1;
          
          const normalizeJab = (val: string) => {
            let j = val.toLowerCase().trim();
            if (j.includes("kelas 1")) j = j.replace("kelas 1", "kelas i");
            if (j.includes("kelas 2")) j = j.replace("kelas 2", "kelas ii");
            if (j.includes("kelas 3")) j = j.replace("kelas 3", "kelas iii");
            if (j.includes("kelas 4")) j = j.replace("kelas 4", "kelas iv");
            if (j.includes("kelas 5")) j = j.replace("kelas 5", "kelas v");
            if (j.includes("kelas 6")) j = j.replace("kelas 6", "kelas vi");
            return j;
          };

          const jabA = normalizeJab(a.jabatan || "");
          const jabB = normalizeJab(b.jabatan || "");
          const priority: Record<string, number> = {
            "kepala sekolah": 1,
            "guru kelas i": 2,
            "guru kelas ii": 3,
            "guru kelas iii": 4,
            "guru kelas iv": 5,
            "guru kelas v": 6,
            "guru kelas vi": 7,
            "guru pjok": 8,
            "guru paibp": 9,
            "guru pai": 9
          };

          const pA = priority[jabA] || 99;
          const pB = priority[jabB] || 99;
          if (pA !== pB) return pA - pB;
          return (a.nama || "").localeCompare(b.nama || "");
        });

        setGurus(sortedData);

        // Grouping
        const grouped: Record<string, any[]> = {};
        sortedData.forEach(guru => {
          const school = guru.sekolah || "Sekolah Lainnya";
          if (!grouped[school]) grouped[school] = [];
          grouped[school].push(guru);
        });
        setGroupedGurus(grouped);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
            <h1 className="text-3xl font-heading font-extrabold text-soft-black">Anggota Gugus</h1>
            <p className="text-gray-600 mt-2">Daftar tenaga pendidik profesional anggota Gugus 3 Melati.</p>
        </div>

        {isLoading ? (
          <div className="text-center p-10 text-gray-400">Loading...</div>
        ) : Object.keys(groupedGurus).length === 0 ? (
          <div className="text-center p-10 text-gray-400">Belum ada data anggota</div>
        ) : (
          Object.entries(groupedGurus).map(([schoolName, members]) => {
            const schoolData = schools.find(s => s.name && s.name.trim().toLowerCase() === schoolName.trim().toLowerCase());
            const logoUrl = schoolData?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(schoolName)}&background=0284c7&color=fff&size=128&rounded=true`;
            
            return (
              <div key={schoolName} className="mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden ring-1 ring-black/5">
                <div className="flex items-center justify-between mb-8 group cursor-pointer">
                  <h2 className="text-xl font-bold text-main-blue group-hover:text-leaf-green transition-colors">{schoolName}</h2>
                  <img src={logoUrl} alt={schoolName} className="w-12 h-12 rounded-full border-2 border-white shadow-md object-contain group-hover:scale-105 transition-transform" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {members.map((g, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      onClick={() => setSelectedGuru(g)}
                      className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all text-center flex flex-col items-center"
                    >
                      <div className="w-20 h-24 rounded-lg overflow-hidden mb-3 shadow-sm bg-gray-200">
                        <img 
                          src={g.foto || g.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.nama || 'G')}&background=random`} 
                          alt={g.nama} 
                          className="w-full h-full object-cover object-top" 
                        />
                      </div>
                      <h3 className="font-bold text-soft-black text-sm mb-1 line-clamp-1">{g.nama}</h3>
                      <p className="text-[10px] text-gray-400 font-mono mb-2">{g.nip || '-'}</p>
                      <div className="text-[10px] bg-main-blue/10 text-main-blue font-medium rounded-lg px-2 py-1 inline-block truncate w-full">{g.jabatan || '-'}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {selectedGuru && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedGuru(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative shadow-2xl border border-gray-100"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelectedGuru(null)} className="absolute top-6 right-6 text-gray-400 hover:text-soft-black bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-all">
                <X size={20} />
              </button>
              <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-main-blue to-leaf-green p-1 mb-6 shadow-xl">
                      <img src={selectedGuru.foto || selectedGuru.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedGuru.nama || 'G')}&background=random`} alt={selectedGuru.nama} className="w-full h-full object-cover object-top rounded-xl border-4 border-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-soft-black mb-1">{selectedGuru.nama}</h2>
                  <p className="text-main-blue font-medium mb-6">{selectedGuru.jabatan}</p>
                  
                  <div className="w-full grid grid-cols-2 gap-4 text-sm text-gray-600 text-left">
                      <div><p className="text-gray-400 text-xs">NIP</p><p className="font-mono">{selectedGuru.nip || '-'}</p></div>
                      <div><p className="text-gray-400 text-xs">Pangkat/Gol</p><p>{selectedGuru.pangkat || '-'}</p></div>
                      <div><p className="text-gray-400 text-xs">Kepegawaian</p><p>{selectedGuru.kepegawaian || '-'}</p></div>
                      <div><p className="text-gray-400 text-xs">Sekolah</p><p>{selectedGuru.sekolah || '-'}</p></div>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
