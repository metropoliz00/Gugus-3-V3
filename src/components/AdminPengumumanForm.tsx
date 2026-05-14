import React, { useState } from "react";
import { Megaphone, PlusCircle, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { CKEditor } from "./CKEditor";

export default function AdminPengumumanForm() {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function loadNews() {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("posts")
          .select("*")
          .eq("category", "pengumuman")
          .order("created_at", { ascending: false });
        setNews(data || []);
      } catch (err) {
        console.error("Error fetching pengumuman:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
  }, []);

  const handleCreate = async () => {
    if (!supabase) return;
    const newPost = {
      title: "Pengumuman Baru",
      slug: `pengumuman-baru-${Date.now()}`,
      content: "Konten pengumuman...",
      featured_image_url: "",
      category: "pengumuman",
    };
    const { data, error } = await supabase
      .from("posts")
      .insert([newPost])
      .select();
    if (!error && data) {
      setNews([data[0], ...news]);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    if (!supabase) return;
    const { error } = await supabase.from("posts").update(updates).eq("id", id);
    if (!error) {
      setNews(news.map((n: any) => (n.id === id ? { ...n, ...updates } : n)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (window.confirm("Hapus pengumuman ini?")) {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (!error) {
        setNews(news.filter((n: any) => n.id !== id));
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Pengumuman Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-red-500 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-red-50 rounded-full border border-red-100 mb-2">
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest font-heading">Informasi Penting</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Kelola Pengumuman
            </h2>
            <p className="text-sm text-gray-500">
              Publikasikan pengumuman mendesak dan informasi resmi Gugus 3.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreate}
          className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-red-600 active:scale-95 transition-all flex items-center gap-3"
        >
          <PlusCircle className="w-4 h-4" /> Buat Pengumuman
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 mb-6">
          {isLoading ? (
            <div className="text-center text-gray-400 py-10">
              Memuat data...
            </div>
          ) : news.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              Belum ada pengumuman.
            </div>
          ) : (
            news.map((item: any) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 group"
              >
                <div className="flex-1 grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Judul Pengumuman
                    </label>
                    <input
                      className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent"
                      value={item.title}
                      onChange={(e) =>
                        handleUpdate(item.id, { title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Isi Singkat Pengumuman
                    </label>
                    <div className="bg-white border rounded-xl overflow-hidden mt-2">
                       <CKEditor
                         id={`editor-pengumuman-${item.id}`}
                         value={item.content}
                         onChange={(content: string) => handleUpdate(item.id, { content })}
                       />
                    </div>
                  </div>
                </div>
                <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                    <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
