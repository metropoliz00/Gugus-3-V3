import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; // Assuming supabase is exported from lib/supabase or similar
import { FileText, Play, ExternalLink } from "lucide-react";

export default function KaryaPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<any | null>(null);

  useEffect(() => {
    async function fetchWorks() {
      const { data, error } = await supabase
        .from("teacher_works")
        .select("*");

      if (data) {
        const userIds = [...new Set(data.map((w: any) => w.user_id).filter(Boolean))];
        let profilesData: any[] = [];
        
        if (userIds.length > 0) {
          const { data: pData } = await supabase
             .from("user_profiles")
             .select("id, full_name")
             .in("id", userIds);
          if (pData) profilesData = pData;
        }

        const worksWithProfiles = data.map((work: any) => ({
          ...work,
          profiles: profilesData.find(p => p.id === work.user_id) || null
        }));
        setWorks(worksWithProfiles);
      }
      setLoading(false);
    }
    fetchWorks();
  }, []);

  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <h1 className="text-4xl font-heading font-bold text-soft-black mb-12">Hasil Karya Guru</h1>
      {loading ? (
        <p>Memuat...</p>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-gray-500">Guru</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-gray-500">Judul Karya</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-gray-500">Jenis</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-gray-500">File</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-gray-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {works.map((work) => (
                  <tr key={work.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-soft-black text-sm">{work.profiles?.full_name || "Guru"}</td>
                    <td className="py-4 px-6 text-gray-600 text-sm font-medium">{work.title}</td>
                    <td className="py-4 px-6 uppercase text-[10px] tracking-widest font-bold text-main-blue">{work.work_type}</td>
                    <td className="py-4 px-6">
                       {work.file_url ? (
                         <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest whitespace-nowrap">Terupload</span>
                       ) : (
                         <span className="text-gray-400">-</span>
                       )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {work.file_url && (
                          <a href={work.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex flex-shrink-0 items-center justify-center w-8 h-8 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors" title="Unduh">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          </a>
                        )}
                        <button onClick={() => setSelectedWork(work)} className="inline-flex items-center gap-2 px-4 py-2 bg-main-blue/10 text-main-blue hover:bg-main-blue hover:text-white rounded-xl transition-colors font-bold text-xs min-w-[80px]">
                          <ExternalLink className="w-4 h-4" /> Buka
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {works.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400 italic">Belum ada karya yang diunggah.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedWork && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{selectedWork.title}</h2>
            {selectedWork.work_type === "video" ? (
              <video src={selectedWork.file_url} controls className="w-full rounded-xl" />
            ) : (
              <div className="flex flex-col gap-4">
                <iframe src={selectedWork.file_url} className="w-full h-96 rounded-xl border border-gray-200 hidden md:block" />
                <div className="md:hidden bg-blue-50 p-6 rounded-xl text-center border border-blue-100">
                   <FileText className="w-12 h-12 text-main-blue mx-auto mb-4" />
                   <p className="text-sm text-gray-600 mb-4">Pratinjau dokumen mungkin tidak didukung di perangkat ini.</p>
                </div>
              </div>
            )}
            <div className="mt-6 flex flex-col md:flex-row gap-3 justify-end">
              <a href={selectedWork.file_url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-main-blue text-white font-bold rounded-xl text-center hover:bg-main-blue/90 w-full md:w-auto">
                Buka di Tab Baru
              </a>
              <button onClick={() => setSelectedWork(null)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
