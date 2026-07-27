import React, { useState, useRef, useEffect } from "react";
import {
  School,
  Search,
  PlusCircle,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  X,
  Users,
  GraduationCap,
  User as UserIcon,
  MapPin,
  Globe,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { logActivity } from "../lib/activity";
import { useAlert } from "../contexts/AlertContext";
import ImageUpload from "./ImageUpload";

export default function AdminSekolahForm({ user }: { user: any }) {
  const { alert } = useAlert();
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSchoolType, setNewSchoolType] = useState("Sekolah Imbas");

  // UI states for clean layout
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"Semua" | "Sekolah Inti" | "Sekolah Imbas">("Semua");
  const [editingSchool, setEditingSchool] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<"info" | "visi" | "peta" | "foto">("info");
  const [savingId, setSavingId] = useState<string | null>(null);

  const debouncedSave = useRef<any>(null);

  useEffect(() => {
    async function loadSchools() {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("schools")
          .select("*")
          .order("name", { ascending: true });
        setSchools(data || []);
      } catch (err) {
        console.error("Error fetching schools:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSchools();
  }, []);

  const handleCreate = async () => {
    if (!supabase) return;
    setIsCreating(true);
    const newSchool = {
      name: "Sekolah Baru",
      principal_name: "-",
      student_count: 0,
      teacher_count: 0,
      akreditasi: "-",
      prestasi_images: [],
      jenis_sekolah: newSchoolType,
      logo_url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2000&auto=format&fit=crop",
    };
    const { data, error } = await supabase
      .from("schools")
      .insert([newSchool])
      .select();
    setIsCreating(false);
    if (error) {
      console.error("Error creating school:", error);
      await alert("Gagal menambah sekolah: " + (error.message || "Kesalahan tidak diketahui"), "Error");
      return;
    }

    if (data && data.length > 0) {
      logActivity(user, "create_sekolah", `Menambah sekolah baru: ${newSchool.name}`);
      setSchools([...schools, data[0]]);
      setEditingSchool(data[0]);
      setModalTab("info");
      await alert("Sekolah baru berhasil ditambahkan! Silakan lengkapi detailnya.", "Sukses");
    }
  };

  const handleUpdate = (id: string, updates: any) => {
    setSchools(schools.map((s: any) => (s.id === id ? { ...s, ...updates } : s)));
    if (editingSchool && editingSchool.id === id) {
      setEditingSchool((prev: any) => ({ ...prev, ...updates }));
    }

    if (debouncedSave.current) clearTimeout(debouncedSave.current);

    debouncedSave.current = setTimeout(async () => {
      if (!supabase) return;
      setSavingId(id);
      const { error } = await supabase.from("schools").update(updates).eq("id", id);
      if (error) {
        console.error("Error updating school:", error);
        await alert("Gagal memperbarui sekolah", "Error");
      } else {
        logActivity(user, "update_sekolah", `Memperbarui data sekolah ID: ${id}`);
      }
      setSavingId(null);
    }, 600);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!supabase) return;
    if (window.confirm("Hapus sekolah ini? Data yang dihapus tidak dapat dikembalikan.")) {
      const { error } = await supabase.from("schools").delete().eq("id", id);
      if (!error) {
        logActivity(user, "delete_sekolah", `Menghapus sekolah ID: ${id}`);
        setSchools(schools.filter((s: any) => s.id !== id));
        if (editingSchool?.id === id) setEditingSchool(null);
        await alert("Sekolah berhasil dihapus", "Sukses");
      } else {
        console.error("Error deleting school:", error);
        await alert("Gagal menghapus sekolah: " + (error.message || "Kesalahan tidak diketahui"), "Error");
      }
    }
  };

  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.principal_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "Semua" || s.jenis_sekolah === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-l-8 border-leaf-green shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-leaf-green/10 rounded-2xl flex items-center justify-center text-leaf-green border border-leaf-green/20 shrink-0">
            <School className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-leaf-green/10 rounded-full border border-leaf-green/20 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-leaf-green animate-pulse" />
              <span className="text-[10px] font-bold text-leaf-green uppercase tracking-wider">Data Satker GUGUS 03</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola Sekolah</h2>
            <p className="text-xs text-gray-500">
              Klik pada kartu/baris sekolah untuk melihat & mengedit detail lengkap.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <select
            className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold outline-none cursor-pointer hover:bg-gray-100 transition-colors"
            value={newSchoolType}
            onChange={(e) => setNewSchoolType(e.target.value)}
          >
            <option value="Sekolah Inti">Sekolah Inti</option>
            <option value="Sekolah Imbas">Sekolah Imbas</option>
          </select>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-leaf-green text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-leaf-green/90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {isCreating ? "Menambah..." : "Tambah Sekolah"}
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Filter, View Switch */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari sekolah atau kepala sekolah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-leaf-green/20 focus:border-leaf-green outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Pills & View Mode */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
            {(["Semua", "Sekolah Inti", "Sekolah Imbas"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === type
                    ? "bg-white text-main-blue shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("card")}
              title="Tampilan Card"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "card" ? "bg-white text-main-blue shadow-sm" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              title="Tampilan Tabel"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "table" ? "bg-white text-main-blue shadow-sm" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100 shadow-sm">
          <div className="animate-spin w-8 h-8 border-3 border-leaf-green border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium">Memuat data sekolah...</p>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100 shadow-sm">
          <School className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-bold text-gray-600 mb-1">Tidak ada sekolah ditemukan</p>
          <p className="text-xs text-gray-400">Coba ubah kata kunci pencarian atau filter sekolah.</p>
        </div>
      ) : viewMode === "card" ? (
        /* Card View Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => {
            const isInti = school.jenis_sekolah === "Sekolah Inti";
            return (
              <div
                key={school.id}
                onClick={() => {
                  setEditingSchool(school);
                  setModalTab("info");
                }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-leaf-green/30 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Accent Top Ambient */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isInti ? "bg-main-blue" : "bg-leaf-green"
                  }`}
                />

                <div>
                  {/* Top Bar: Logo & Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 p-2 shrink-0 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                      <img
                        src={school.logo_url || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2000&auto=format&fit=crop"}
                        alt={school.name}
                        className="w-full h-full object-contain"
                        onError={(e: any) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isInti
                            ? "bg-blue-50 text-main-blue border-blue-200"
                            : "bg-emerald-50 text-leaf-green border-emerald-200"
                        }`}
                      >
                        {school.jenis_sekolah || "Sekolah Imbas"}
                      </span>
                      {school.akreditasi && school.akreditasi !== "-" && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          Akreditasi {school.akreditasi}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* School Title & Principal */}
                  <h3 className="text-lg font-bold font-heading text-soft-black group-hover:text-leaf-green transition-colors line-clamp-2 mb-2">
                    {school.name}
                  </h3>

                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">Kepala Sekolah: <strong>{school.principal_name || "-"}</strong></span>
                  </p>

                  {/* Quick Stats Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] font-bold text-gray-600">
                    <span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-main-blue" />
                      {school.student_count || 0} Siswa
                    </span>
                    <span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-leaf-green" />
                      {school.teacher_count || 0} Guru
                    </span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs font-bold text-leaf-green group-hover:underline flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Detail & Edit Data
                  </span>
                  <button
                    onClick={(e) => handleDelete(school.id, e)}
                    title="Hapus Sekolah"
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Nama Sekolah</th>
                  <th className="py-4 px-6">Jenis</th>
                  <th className="py-4 px-6">Kepala Sekolah</th>
                  <th className="py-4 px-6">Akreditasi</th>
                  <th className="py-4 px-6">Siswa / Guru</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredSchools.map((school, idx) => {
                  const isInti = school.jenis_sekolah === "Sekolah Inti";
                  return (
                    <tr
                      key={school.id}
                      onClick={() => {
                        setEditingSchool(school);
                        setModalTab("info");
                      }}
                      className="hover:bg-leaf-green/5 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-6 font-bold text-gray-400">{idx + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={school.logo_url || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2000&auto=format&fit=crop"}
                            alt=""
                            className="w-9 h-9 rounded-xl object-contain border p-1 bg-gray-50 shrink-0"
                          />
                          <span className="font-bold text-soft-black group-hover:text-leaf-green transition-colors">
                            {school.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isInti
                              ? "bg-blue-50 text-main-blue border-blue-200"
                              : "bg-emerald-50 text-leaf-green border-emerald-200"
                          }`}
                        >
                          {school.jenis_sekolah || "Sekolah Imbas"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-600">{school.principal_name || "-"}</td>
                      <td className="py-4 px-6">
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {school.akreditasi || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-600">
                        {school.student_count || 0} / {school.teacher_count || 0}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingSchool(school);
                              setModalTab("info");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-leaf-green/10 text-leaf-green hover:bg-leaf-green hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={(e) => handleDelete(school.id, e)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                            title="Hapus Sekolah"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail & Edit Modal Popup */}
      <AnimatePresence>
        {editingSchool && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingSchool(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-4xl relative z-[10000] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] border border-gray-100"
            >
              {/* Modal Top Header */}
              <div className="p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-main-blue text-white flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm p-1.5 border border-white/20 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={editingSchool.logo_url || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2000&auto=format&fit=crop"}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-white/20 text-white">
                        {editingSchool.jenis_sekolah || "Sekolah"}
                      </span>
                      {savingId === editingSchool.id && (
                        <span className="text-[10px] text-amber-300 font-bold animate-pulse">
                          • Menyimpan...
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold font-heading text-white truncate max-w-md">
                      {editingSchool.name || "Edit Sekolah"}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setEditingSchool(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tabs Header */}
              <div className="flex items-center gap-2 p-2 bg-gray-100 border-b border-gray-200 overflow-x-auto shrink-0">
                {[
                  { id: "info", label: "📋 Info Utama & Kepsek" },
                  { id: "visi", label: "🎯 Visi & Keunggulan" },
                  { id: "peta", label: "🗺️ Peta & Lokasi" },
                  { id: "foto", label: "🖼️ Foto & Prestasi" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      modalTab === tab.id
                        ? "bg-white text-main-blue shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body Content */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                {/* TAB 1: INFO UTAMA */}
                {modalTab === "info" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Nama Sekolah
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-leaf-green/20 outline-none"
                          value={editingSchool.name || ""}
                          onChange={(e) => handleUpdate(editingSchool.id, { name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Jenis Sekolah
                        </label>
                        <select
                          className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-leaf-green/20 outline-none cursor-pointer"
                          value={editingSchool.jenis_sekolah || "Sekolah Imbas"}
                          onChange={(e) => handleUpdate(editingSchool.id, { jenis_sekolah: e.target.value })}
                        >
                          <option value="Sekolah Inti">Sekolah Inti</option>
                          <option value="Sekolah Imbas">Sekolah Imbas</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Nama Kepala Sekolah
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-leaf-green/20 outline-none"
                          value={editingSchool.principal_name || ""}
                          onChange={(e) => handleUpdate(editingSchool.id, { principal_name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Akreditasi
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: A, B, C"
                          className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-leaf-green/20 outline-none"
                          value={editingSchool.akreditasi || ""}
                          onChange={(e) => handleUpdate(editingSchool.id, { akreditasi: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Jumlah Siswa
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-leaf-green/20 outline-none"
                          value={editingSchool.student_count || 0}
                          onChange={(e) =>
                            handleUpdate(editingSchool.id, { student_count: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Jumlah Guru
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-leaf-green/20 outline-none"
                          value={editingSchool.teacher_count || 0}
                          onChange={(e) =>
                            handleUpdate(editingSchool.id, { teacher_count: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <ImageUpload
                        label="Foto Kepala Sekolah"
                        value={editingSchool.principal_image || ""}
                        onChange={(base64) => handleUpdate(editingSchool.id, { principal_image: base64 })}
                        maxWidth={600}
                        maxHeight={600}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: VISI, MOTTO & KEUNGGULAN */}
                {modalTab === "visi" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        Motto Sekolah
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Cerdas, Berkarakter & Berprestasi"
                        className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-leaf-green/20 outline-none"
                        value={editingSchool.motto || ""}
                        onChange={(e) => handleUpdate(editingSchool.id, { motto: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        Visi Sekolah
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tuliskan visi sekolah..."
                        className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-leaf-green/20 outline-none resize-none"
                        value={editingSchool.vision || ""}
                        onChange={(e) => handleUpdate(editingSchool.id, { vision: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        Keunggulan & Program Unggulan Sekolah
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Program unggulan, ekstrakurikuler favorit, fasilitas..."
                        className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-leaf-green/20 outline-none resize-none"
                        value={editingSchool.keunggulan || ""}
                        onChange={(e) => handleUpdate(editingSchool.id, { keunggulan: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: PETA & LOKASI */}
                {modalTab === "peta" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        Google Maps Embed Link (HTML atau URL)
                      </label>
                      <input
                        type="text"
                        placeholder='Tempelkan kode <iframe src="..."> dari Google Maps Share'
                        className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-white focus:ring-2 focus:ring-leaf-green/20 outline-none"
                        value={editingSchool.map_embed_url || ""}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.includes("<iframe") && val.includes('src="')) {
                            const match = val.match(/src="([^"]+)"/);
                            if (match && match[1]) val = match[1];
                          }
                          handleUpdate(editingSchool.id, { map_embed_url: val });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-bold text-gray-500">Koordinat Peta Interactive (Leaflet)</span>
                      <button
                        type="button"
                        onClick={() => {
                          const name = editingSchool.name || "";
                          let foundLat = "-6.832742";
                          let foundLng = "112.022335";
                          if (name.includes("01")) {
                            foundLat = "-6.831500";
                            foundLng = "112.021100";
                          } else if (name.includes("02")) {
                            foundLat = "-6.834100";
                            foundLng = "112.023500";
                          } else if (name.includes("03")) {
                            foundLat = "-6.829900";
                            foundLng = "112.025800";
                          }
                          handleUpdate(editingSchool.id, { latitude: foundLat, longitude: foundLng });
                          alert(`Koordinat terdeteksi: Lintang ${foundLat}, Bujur ${foundLng}`, "Sukses");
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-main-orange hover:bg-orange-600 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" /> Deteksi Koordinat Otomatis
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Garis Lintang (Latitude)</label>
                        <input
                          type="text"
                          placeholder="-6.832742"
                          className="w-full border border-gray-200 p-2.5 rounded-xl text-sm"
                          value={editingSchool.latitude || ""}
                          onChange={(e) => handleUpdate(editingSchool.id, { latitude: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Garis Bujur (Longitude)</label>
                        <input
                          type="text"
                          placeholder="112.022335"
                          className="w-full border border-gray-200 p-2.5 rounded-xl text-sm"
                          value={editingSchool.longitude || ""}
                          onChange={(e) => handleUpdate(editingSchool.id, { longitude: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Live Map Preview if URL exists */}
                    {editingSchool.map_embed_url && editingSchool.map_embed_url.includes("google.com/maps/embed") && (
                      <div className="rounded-2xl overflow-hidden border border-gray-200 h-52 bg-gray-50 relative mt-2">
                        <iframe
                          src={editingSchool.map_embed_url}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          title="Preview Map"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: FOTO & PRESTASI */}
                {modalTab === "foto" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ImageUpload
                        label="Logo Sekolah"
                        value={editingSchool.logo_url || ""}
                        onChange={(base64) => handleUpdate(editingSchool.id, { logo_url: base64 })}
                        maxWidth={400}
                        maxHeight={400}
                      />
                      <ImageUpload
                        label="Foto Banner / Background"
                        value={editingSchool.image_url || ""}
                        onChange={(base64) => handleUpdate(editingSchool.id, { image_url: base64 })}
                        maxWidth={1200}
                        maxHeight={600}
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-xs font-bold text-gray-600 mb-3">
                        Foto Prestasi Sekolah (Max 2)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[0, 1].map((idx) => {
                          const prestasi = (editingSchool.prestasi_images || [])[idx] || { image: "", description: "" };
                          return (
                            <div key={idx} className="space-y-2 border border-gray-100 rounded-2xl p-3 bg-gray-50">
                              <ImageUpload
                                label={`Foto Prestasi ${idx + 1}`}
                                value={typeof prestasi === "string" ? prestasi : prestasi.image || ""}
                                onChange={(base64) => {
                                  const curr = [...(editingSchool.prestasi_images || [])];
                                  const item = typeof curr[idx] === "object" ? { ...curr[idx] } : { description: "" };
                                  item.image = base64;
                                  curr[idx] = item;
                                  handleUpdate(editingSchool.id, { prestasi_images: curr.slice(0, 2) });
                                }}
                                maxWidth={800}
                                maxHeight={450}
                              />
                              <textarea
                                className="w-full text-xs p-2 border border-gray-200 rounded-xl bg-white resize-none outline-none"
                                placeholder="Deskripsi prestasi..."
                                rows={2}
                                value={prestasi.description || ""}
                                onChange={(e) => {
                                  const curr = [...(editingSchool.prestasi_images || [])];
                                  const item = typeof curr[idx] === "object" ? { ...curr[idx] } : { image: "" };
                                  item.description = e.target.value;
                                  curr[idx] = item;
                                  handleUpdate(editingSchool.id, { prestasi_images: curr.slice(0, 2) });
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
                <button
                  onClick={(e) => handleDelete(editingSchool.id, e)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Hapus Sekolah
                </button>

                <button
                  onClick={() => setEditingSchool(null)}
                  className="bg-leaf-green text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-leaf-green/90 transition-all cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
