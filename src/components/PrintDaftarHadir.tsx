import React from "react";

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

export default function PrintDaftarHadir({ selectedActivity, participants, chairman }: PrintDaftarHadirProps) {
  if (!selectedActivity) return null;

  const formatName = (name: string | undefined | null) => {
    return name || "-";
  };

  return (
    <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 print:shadow-none print:border-none print:p-0 w-full" id="print-area">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
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
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          #print-kop-surat {
            margin-top: -5px !important;
            padding-top: -5px !important;
          }
          /* Background colors for print */
          .print-bg-emerald {
            background-color: #ecfdf5 !important;
            color: #047857 !important;
          }
        }
      `}</style>

      {/* KOP - Visible on screen and in print */}
      <div id="print-kop-surat" className="flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6 mt-0 w-full box-border">
        <img 
          src="https://www.image2url.com/r2/default/images/1778851343355-1a6a088b-6728-48ec-b530-6f16d372b2ee.png" 
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0 print:w-16 print:h-16" 
          alt="Logo Kemendikdasmen" 
        />
        <div className="text-center flex-1 px-4 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold font-serif leading-tight print:text-base">KELOMPOK KERJA GURU ( KKG )</h1>
          <h2 className="text-xl sm:text-2xl font-black font-serif leading-tight print:text-lg">GUGUS 03 “MELATI”</h2>
          <p className="text-xs sm:text-sm font-bold font-serif print:text-xs">KECAMATAN JENU KABUPATEN TUBAN</p>
        </div>
        <img 
          src="https://www.image2url.com/r2/default/images/1778156189287-e4930eb4-3c36-4ace-8420-ca8908132e66.png" 
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0 print:w-16 print:h-16" 
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

      <table className="w-full border-collapse border-2 border-black text-[11px] sm:text-xs table-auto">
        <thead>
          <tr className="bg-gray-100 print:bg-gray-100 font-bold uppercase tracking-wider">
            <th className="border-2 border-black px-2 py-3 w-[4%] text-center whitespace-nowrap">No</th>
            <th className="border-2 border-black px-3 py-2 text-center whitespace-nowrap w-[30%]">Nama</th>
            <th className="border-2 border-black px-3 py-2 text-center w-[15%]">NIP</th>
            <th className="border-2 border-black px-3 py-2 text-center w-[15%]">Jabatan</th>
            <th className="border-2 border-black px-3 py-2 text-center w-[22%]">Instansi</th>
            <th className="border-2 border-black px-2 py-2 text-center whitespace-nowrap w-[8%]">Kehadiran</th>
            <th className="border-2 border-black px-2 py-2 text-center w-[10%] whitespace-nowrap">Tanda Tangan</th>
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
                  <td className="border-2 border-black px-3 py-2.5 font-bold text-soft-black leading-tight whitespace-nowrap text-[11px] sm:text-xs">
                    {formatName(nama)}
                  </td>
                  <td className="border-2 border-black px-3 py-2.5 font-mono leading-tight whitespace-normal break-all text-[10px] sm:text-xs text-center">
                    {profile?.nip || "-"}
                  </td>
                  <td className="border-2 border-black px-3 py-2.5 leading-tight whitespace-normal break-words text-[10px] sm:text-xs">
                    {profile?.jabatan || "-"}
                  </td>
                  <td className="border-2 border-black px-3 py-2.5 leading-tight whitespace-normal break-words text-[10px] sm:text-xs">
                    {profile?.sekolah || "-"}
                  </td>
                  <td className="border-2 border-black px-2 py-2.5 text-center">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 print:bg-emerald-50 print:print-bg-emerald rounded-full font-bold uppercase text-[8px]">Hadir</span>
                  </td>
                  <td className="border-2 border-black px-2 py-2.5 text-left h-12 relative min-w-[80px]">
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
  );
}
