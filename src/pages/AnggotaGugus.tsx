import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function AnggotaGugusPage() {
  const [gurus, setGurus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGurus() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('role', 'guru');
        
        if (error) throw error;
        
        // Custom sorting
        const sortedData = (data || []).sort((a, b) => {
          // 1. Sort by School (A-Z)
          const schoolA = (a.sekolah || "").toLowerCase();
          const schoolB = (b.sekolah || "").toLowerCase();
          if (schoolA < schoolB) return -1;
          if (schoolA > schoolB) return 1;
          
          // 2. If same school, sort by Position priority
          const normalizeJab = (val: string) => {
            let j = val.toLowerCase().trim();
            // Normalize Roman numerals and numbers
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
          
          // 3. If same position, sort by Name (A-Z)
          return (a.nama || "").localeCompare(b.nama || "");
        });

        setGurus(sortedData);
      } catch (err) {
        console.error("Error fetching guru:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGurus();
  }, []);

  return (
    <div className="min-h-screen bg-light-gray py-24">
      <div className="container mx-auto px-6 max-w-[90%]">
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-heading font-extrabold text-soft-black mb-4">Anggota Gugus</h1>
            <p className="text-gray-600">Daftar tenaga pendidik profesional anggota Gugus 3 Melati.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-500 text-[10px] uppercase tracking-wider">
                  <th className="p-6 font-bold">Foto</th>
                  <th className="p-6 font-bold">Nama</th>
                  <th className="p-6 font-bold">NIP</th>
                  <th className="p-6 font-bold">Pangkat/Gol</th>
                  <th className="p-6 font-bold">Kepegawaian</th>
                  <th className="p-6 font-bold">Jabatan</th>
                  <th className="p-6 font-bold">Sekolah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={7} className="p-10 text-center text-gray-400">Loading...</td></tr>
                ) : gurus.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center text-gray-400">Belum ada data anggota</td></tr>
                ) : gurus.map((g, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-main-blue to-leaf-green p-0.5">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                                <img src={g.foto || g.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.nama || 'G')}&background=random`} alt={g.nama} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </td>
                    <td className="p-6 font-bold text-soft-black">{g.nama || '-'}</td>
                    <td className="p-6 text-gray-500 font-mono text-sm">{g.nip || '-'}</td>
                    <td className="p-6 text-gray-500 text-sm">{g.pangkat || '-'}</td>
                    <td className="p-6 text-gray-500 text-sm">{g.kepegawaian || '-'}</td>
                    <td className="p-6 text-gray-500 text-sm">{g.jabatan || '-'}</td>
                    <td className="p-6 text-gray-500 text-sm">{g.sekolah || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
