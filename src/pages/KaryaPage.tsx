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
        .select("*, profiles:user_id(full_name)");
      if (data) setWorks(data);
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
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 font-semibold text-gray-500">Guru</th>
                <th className="pb-4 font-semibold text-gray-500">Judul Karya</th>
                <th className="pb-4 font-semibold text-gray-500">Jenis</th>
                <th className="pb-4 font-semibold text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {works.map((work) => (
                <tr key={work.id} className="border-t border-gray-50">
                  <td className="py-4 font-medium">{work.profiles?.full_name || "Guru"}</td>
                  <td className="py-4">{work.title}</td>
                  <td className="py-4 uppercase text-xs font-bold text-main-blue">{work.work_type}</td>
                  <td className="py-4">
                    <button onClick={() => setSelectedWork(work)} className="text-main-blue hover:text-leaf-green">
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedWork && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{selectedWork.title}</h2>
            {selectedWork.work_type === "video" ? (
              <video src={selectedWork.file_url} controls className="w-full rounded-xl" />
            ) : (
              <iframe src={selectedWork.file_url} className="w-full h-96 rounded-xl" />
            )}
            <button onClick={() => setSelectedWork(null)} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
