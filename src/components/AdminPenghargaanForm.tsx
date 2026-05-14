import React, { useState, useRef } from "react";
import { Trophy, PlusCircle, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import ImageUpload from "./ImageUpload";

export default function AdminPenghargaanForm() {
  const [awards, setAwards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSave = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    async function loadAwards() {
      if (!supabase) return;
      try {
        console.log("Loading awards from DB...");
        const { data, error } = await supabase
          .from("awards")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching awards:", error);
          return;
        }

        if (data) {
          setAwards(data.map(item => ({
              ...item,
              winner_name: item.winner_name || "Nama Penerima",
              category: "guru",
              image_url: item.image_url || ""
          })));
        }
      } catch (err) {
        console.error("Unexpected error in loadAwards:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAwards();
  }, []);

  const handleCreate = async () => {
    console.log("handleCreate clicked - starting insert to awards...");
    if (!supabase) {
      alert("Supabase client not found.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Sesi berakhir. Silakan login kembali.");
      return;
    }

    const newAward = {
      title: "Penghargaan Baru",
      year: new Date().getFullYear(),
      description: "Deskripsi penghargaan...",
      image_url: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&q=80"
    };
    
    try {
      const { data, error } = await supabase
        .from("awards")
        .insert([newAward])
        .select();
        
      if (error) {
        console.error("Insert error:", error);
        alert(`Gagal menambah: ${error.message}`);
        return;
      }
      
      if (data && data.length > 0) {
        setAwards([data[0], ...awards]);
        alert("Berhasil ditambahkan!");
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleUpdate = (id: string, updates: any) => {
    const updatedAwards = awards.map((a: any) => (a.id === id ? { ...a, ...updates } : a));
    setAwards(updatedAwards);

    if (debouncedSave.current) clearTimeout(debouncedSave.current);

    debouncedSave.current = setTimeout(async () => {
      if (!supabase) return;
      const target = updatedAwards.find(a => a.id === id);
      if (!target) return;
      
      const dbPayload = {
        title: target.title,
        year: parseInt(target.year) || new Date().getFullYear(),
        description: target.description,
        image_url: target.image_url
      };

      try {
        const { error } = await supabase
          .from("awards")
          .update(dbPayload)
          .eq("id", id);
        if (error) {
          console.error("Update error:", error);
        }
      } catch (e) {
        console.error(e);
      }
    }, 800);
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (window.confirm("Hapus data ini?")) {
      const { error } = await supabase.from("awards").delete().eq("id", id);
      if (!error) {
        setAwards(awards.filter((a: any) => a.id !== id));
      } else {
        alert("Gagal menghapus: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-10">
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-amber-500 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-amber-50 rounded-full border border-amber-100 mb-2">
              <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-heading">Apresiasi & Prestasi</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Kelola Prestasi & Penghargaan
            </h2>
            <p className="text-sm text-gray-500">
              Kelola data prestasi siswa, guru, dan sekolah di lingkungan GUGUS 3.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreate}
          className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-amber-600 active:scale-95 transition-all flex items-center gap-3"
        >
          <PlusCircle className="w-4 h-4" /> Tambah Penghargaan
        </button>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center text-gray-400 py-10">Memuat data...</div>
        ) : awards.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Belum ada data prestasi.
          </div>
        ) : (
          awards.map((item: any) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 group relative"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 pr-8">
                <div className="md:col-span-2">
                  <div className="flex gap-2 items-center mb-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-400">
                        Nama Prestasi / Penghargaan
                    </label>
                  </div>
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
                    Tahun
                  </label>
                  <input
                    className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent"
                    type="number"
                    value={item.year}
                    onChange={(e) =>
                      handleUpdate(item.id, { year: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Kategori
                  </label>
                  <select
                    className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent capitalize"
                    value={item.category}
                    onChange={(e) =>
                      handleUpdate(item.id, { category: e.target.value })
                    }
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                    <option value="kepala_sekolah">Kepala Sekolah</option>
                    <option value="sekolah">Sekolah</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Penerima (Nama Siswa/Guru/dll)
                  </label>
                  <input
                    className="w-full border-b border-gray-200 text-sm text-soft-black outline-none bg-transparent"
                    value={item.winner_name || ""}
                    onChange={(e) =>
                      handleUpdate(item.id, { winner_name: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-4 mt-2">
                  <ImageUpload
                    label="Foto Penghargaan"
                    value={item.image_url || ""}
                    onChange={(base64) =>
                      handleUpdate(item.id, { image_url: base64 })
                    }
                    maxWidth={800}
                    maxHeight={600}
                  />
                </div>
                
                <div className="md:col-span-4">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    className="w-full border-b border-gray-200 text-sm text-soft-black outline-none bg-transparent"
                    value={item.description}
                    rows={2}
                    onChange={(e) =>
                      handleUpdate(item.id, { description: e.target.value })
                    }
                  />
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
  );
}
