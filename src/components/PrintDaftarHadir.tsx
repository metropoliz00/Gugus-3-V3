import React, { useState } from "react";
import { Sliders, Settings, Printer, Info, MoveUp, MoveDown, MoveLeft, MoveRight } from "lucide-react";

interface PrintDaftarHadirProps {
  selectedActivity: {
    title: string;
    date_start: string;
  } | null;
  participants: Array<{
    profile?: {
      nama?: string;
      nip?: string;
      jabatan?: string;
      sekolah?: string;
    };
  }>;
  chairman: {
    name?: string;
    nip?: string;
  } | null;
}

type MarginType = "default" | "none" | "compact" | "medium" | "standard" | "custom";

interface CustomMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export default function PrintDaftarHadir({ selectedActivity, participants, chairman }: PrintDaftarHadirProps) {
  if (!selectedActivity) return null;

  const [marginType, setMarginType] = useState<MarginType>("standard");
  const [customMargin, setCustomMargin] = useState<CustomMargin>({
    top: 5,
    bottom: 5,
    left: 15,
    right: 15,
  });

  const formatName = (name: string | undefined | null) => {
    return name || "-";
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Determine margin specification based on selected marginType
  let marginRule = "";
  if (marginType === "none") {
    marginRule = "0mm 0mm 0mm 0mm";
  } else if (marginType === "compact") {
    marginRule = "5mm 5mm 5mm 5mm";
  } else if (marginType === "medium") {
    marginRule = "10mm 10mm 10mm 10mm";
  } else if (marginType === "standard") {
    marginRule = "12mm 15mm 12mm 15mm";
  } else if (marginType === "custom") {
    marginRule = `${customMargin.top}mm ${customMargin.right}mm ${customMargin.bottom}mm ${customMargin.left}mm`;
  }

  return (
    <div className="space-y-6">
      {/* Configuration Toolbar - Hidden in Print */}
      <div className="print:hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 p-6 rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-main-blue/10 text-main-blue rounded-2xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Pengaturan Margin Cetak</h3>
              <p className="text-xs text-slate-500 font-medium">Atur margin dokumen agar presisi dan tidak terpotong saat di-print.</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-main-blue hover:bg-dark-blue text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-main-blue/10 transition-all active:scale-95 shrink-0"
          >
            <Printer className="w-4 h-4" /> Cetak Sekarang
          </button>
        </div>

        {/* Options grid */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Pilih Preset Margin</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { id: "default", label: "Gunakan Default", desc: "Sistem browser" },
                { id: "none", label: "Tanpa Margin", desc: "0 mm" },
                { id: "compact", label: "Sempit", desc: "5 mm" },
                { id: "medium", label: "Sedang", desc: "10 mm" },
                { id: "standard", label: "Standar", desc: "12mm & 15mm" },
                { id: "custom", label: "Kustom manual", desc: "Atur sendiri" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setMarginType(preset.id as MarginType)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all select-none hover:border-slate-300 ${
                    marginType === preset.id
                      ? "border-main-blue bg-white shadow-sm ring-2 ring-main-blue/10"
                      : "border-slate-200 bg-white/50"
                  }`}
                >
                  <span className={`text-[11px] font-black ${marginType === preset.id ? "text-main-blue" : "text-slate-700"}`}>
                    {preset.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Sliders */}
          {marginType === "custom" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><MoveUp className="w-3.5 h-3.5 text-main-blue" /> Atas</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{customMargin.top} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={customMargin.top}
                  onChange={(e) => setCustomMargin({ ...customMargin, top: parseInt(e.target.value) })}
                  className="w-full accent-main-blue cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><MoveDown className="w-3.5 h-3.5 text-main-blue" /> Bawah</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{customMargin.bottom} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={customMargin.bottom}
                  onChange={(e) => setCustomMargin({ ...customMargin, bottom: parseInt(e.target.value) })}
                  className="w-full accent-main-blue cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><MoveLeft className="w-3.5 h-3.5 text-main-blue" /> Kiri</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{customMargin.left} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={customMargin.left}
                  onChange={(e) => setCustomMargin({ ...customMargin, left: parseInt(e.target.value) })}
                  className="w-full accent-main-blue cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><MoveRight className="w-3.5 h-3.5 text-main-blue" /> Kanan</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{customMargin.right} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={customMargin.right}
                  onChange={(e) => setCustomMargin({ ...customMargin, right: parseInt(e.target.value) })}
                  className="w-full accent-main-blue cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 font-medium">
              <span className="font-bold">Tips Cepat Cetak:</span> Bila kop surat atau tanda tangan terpotong di kertas, silakan perkecil margin dengan memilih preset <span className="font-bold">Sempit</span> atau geser slider <span className="font-bold">Kustom</span>. Di kotak cetak browser Anda, pastikan juga untuk menonaktifkan setelan opsi <span className="font-bold">Headers and Footers</span> demi tampilan kop yang bersih.
            </div>
          </div>
        </div>
      </div>

      {/* Main Print Area */}
      <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 print:shadow-none print:border-none print:p-0 w-full" id="print-area">
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              ${marginType !== "default" ? `margin: ${marginRule} !important;` : ""}
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Hide all elements during print */
            body * {
              visibility: hidden;
            }
            /* Show only the print area and its contents */
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
            }
            #print-kop-surat {
              margin-top: 0 !important;
              padding-top: 0 !important;
            }
            /* Background colors for print */
            .print-bg-emerald {
              background-color: #ecfdf5 !important;
              color: #047857 !important;
            }
          }
        `}</style>

      {/* KOP - Visible on screen and in print */}
      <div id="print-kop-surat" className="flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6 mt-0">
        <img 
          src="https://www.image2url.com/r2/default/images/1778851343355-1a6a088b-6728-48ec-b530-6f16d372b2ee.png" 
          className="w-24 h-24 object-contain" 
          alt="Logo Kemendikdasmen" 
        />
        <div className="text-center flex-1 px-4">
          <h1 className="text-xl font-bold font-serif leading-tight">KELOMPOK KERJA GURU ( KKG )</h1>
          <h2 className="text-2xl font-black font-serif leading-tight">GUGUS 03 “MELATI”</h2>
          <p className="text-sm font-bold font-serif">KECAMATAN JENU KABUPATEN TUBAN</p>
        </div>
        <img 
          src="https://www.image2url.com/r2/default/images/1778156189287-e4930eb4-3c36-4ace-8420-ca8908132e66.png" 
          className="w-24 h-24 object-contain" 
          alt="Logo KKG" 
        />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold uppercase underline mb-2 decoration-2 underline-offset-4">Rekap Daftar Hadir</h2>
        <p className="text-xl font-bold text-soft-black mb-1">{selectedActivity.title}</p>
        <p className="text-sm font-medium text-gray-500">
          Hari, Tanggal: {new Date(selectedActivity.date_start).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <table className="w-full border-collapse border-2 border-black text-[11px] sm:text-xs">
        <thead>
          <tr className="bg-gray-100 print:bg-gray-100 font-bold uppercase tracking-wider">
            <th className="border-2 border-black px-2 py-3 w-[4%] text-center">No</th>
            <th className="border-2 border-black px-3 py-2 text-center w-[30%] whitespace-normal">Nama</th>
            <th className="border-2 border-black px-3 py-2 text-center w-[18%]">NIP</th>
            <th className="border-2 border-black px-3 py-2 text-center w-[12%]">Jabatan</th>
            <th className="border-2 border-black px-3 py-2 text-center w-[16%] whitespace-normal">Instansi</th>
            <th className="border-2 border-black px-2 py-2 text-center w-[8%]">Kehadiran</th>
            <th className="border-2 border-black px-2 py-2 text-center w-[12%]">Tanda Tangan</th>
          </tr>
        </thead>
        <tbody>
          {participants.length === 0 ? (
            <tr>
              <td colSpan={7} className="border-2 border-black px-4 py-12 text-center italic text-gray-400">Belum ada participant yang hadir</td>
            </tr>
          ) : (
            participants.map((p, idx) => {
              const profile = p.profile;
              const nama = profile?.nama || "";
              return (
                <tr key={idx} className="hover:bg-gray-50 print:hover:bg-transparent transition-colors">
                  <td className="border-2 border-black px-2 py-2.5 text-center font-bold">{idx + 1}</td>
                  <td className={`border-2 border-black px-3 py-2.5 font-bold text-soft-black leading-tight break-words ${nama.length > 35 ? "text-[8px]" : nama.length > 25 ? "text-[9px]" : "text-[10px]"}`}>
                    {formatName(nama)}
                  </td>
                  <td className={`border-2 border-black px-3 py-2.5 font-mono leading-tight ${profile?.nip && profile.nip.length > 18 ? "text-[8px]" : "text-[9px]"}`}>
                    {profile?.nip || "-"}
                  </td>
                  <td className={`border-2 border-black px-3 py-2.5 leading-tight ${profile?.jabatan && profile.jabatan.length > 20 ? "text-[8px]" : "text-[9px]"}`}>
                    {profile?.jabatan || "-"}
                  </td>
                  <td className={`border-2 border-black px-3 py-2.5 leading-tight ${profile?.sekolah && profile.sekolah.length > 25 ? "text-[8px]" : "text-[9px]"}`}>
                    {profile?.sekolah || "-"}
                  </td>
                  <td className="border-2 border-black px-2 py-2.5 text-center">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 print:bg-emerald-50 print:print-bg-emerald rounded-full font-bold uppercase text-[8px]">Hadir</span>
                  </td>
                  <td className="border-2 border-black px-2 py-2.5 text-left h-12 relative min-w-[90px]">
                    <span className="text-[10px] text-gray-400 font-mono absolute left-2 top-2">{idx + 1}.</span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="mt-12 flex justify-end">
        <div className="text-center w-72">
          <p className="text-sm italic mb-2">Jenu, {new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", year: "numeric", month: "long", day: "numeric" })}</p>
          <p className="text-sm font-bold mb-20 uppercase tracking-wide">Ketua KKG,</p>
          <p className="text-sm font-bold underline underline-offset-4 leading-none mb-1">{formatName(chairman?.name) || "......................................"}</p>
          <p className="text-sm font-bold">NIP. {chairman?.nip || "....................................."}</p>
        </div>
      </div>
    </div>
    </div>
  );
}
