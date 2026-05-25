import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Wallet, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { supabase } from "../lib/supabase";
import { FinanceTransaction } from "../types";

export default function KeuanganPage() {
  const [records, setRecords] = useState<FinanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('finance_transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error("Error fetching finance records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalIncome = records.reduce((sum, r) => sum + (Number(r.income) || 0), 0);
  const totalExpense = records.reduce((sum, r) => sum + (Number(r.expense) || 0), 0);
  const currentBalance = totalIncome - totalExpense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-light-gray pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between md:items-end gap-6"
          >
            <div>
              <h1 className="text-4xl font-heading font-extrabold text-soft-black mb-2 uppercase tracking-tight">Kondisi Keuangan KAS</h1>
              <div className="flex items-center gap-2 text-main-blue font-bold">
                <div className="h-1 w-12 bg-main-blue rounded-full" />
                <span>Gugus 03 Melati</span>
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur px-4 py-2 rounded-2xl border border-white flex items-center gap-2 text-sm text-gray-500">
               <Info className="w-4 h-4" />
               Update terakhir: {new Date().toLocaleDateString('id-ID', { timeZone: "Asia/Jakarta",  day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </motion.div>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-500/5 border border-white flex flex-col gap-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-main-blue/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125" />
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-main-blue">
               <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Saldo KAS</p>
              <h2 className="text-3xl font-extrabold text-soft-black tracking-tight">{formatCurrency(currentBalance)}</h2>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-green-500/5 border border-white flex flex-col gap-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-leaf-green/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125" />
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-leaf-green">
               <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pemasukan</p>
              <h2 className="text-3xl font-extrabold text-leaf-green tracking-tight">{formatCurrency(totalIncome)}</h2>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-red-500/5 border border-white flex flex-col gap-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125" />
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
               <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pengeluaran</p>
              <h2 className="text-3xl font-extrabold text-red-500 tracking-tight">{formatCurrency(totalExpense)}</h2>
            </div>
          </motion.div>
        </div>

        {/* Transactions Table */}
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-white overflow-hidden"
        >
          <div className="p-8 border-b border-light-gray flex items-center justify-between">
            <h3 className="text-xl font-bold font-heading">Riwayat Transaksi</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-light-gray px-3 py-1 rounded-full uppercase">
              <Calendar className="w-3 h-3" />
              Laporan Real-time
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-light-gray/30 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Tanggal</th>
                  <th className="px-8 py-5">Nama Kegiatan / Keterangan</th>
                  <th className="px-8 py-5 text-right">Pemasukan</th>
                  <th className="px-8 py-5 text-right">Pengeluaran</th>
                  <th className="px-8 py-5 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-main-blue/20 border-t-main-blue rounded-full animate-spin" />
                        <p className="text-gray-500 font-medium">Memuat data keuangan...</p>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">
                      Belum ada data transaksi yang tercatat.
                    </td>
                  </tr>
                ) : (
                  (() => {
                    let runningBalance = 0;
                    // Prepare records for running balance (oldest to newest)
                    const sortedForBalance = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const recordsWithBalance = sortedForBalance.map(r => {
                      runningBalance += (Number(r.income) || 0) - (Number(r.expense) || 0);
                      return { ...r, runningBalance };
                    });
                    // Present in UI: Newest to oldest
                    return recordsWithBalance.reverse().map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-700">{new Date(record.date).toLocaleDateString('id-ID', { timeZone: "Asia/Jakarta",  day: 'numeric', month: 'short' })}</span>
                            <span className="text-[10px] text-gray-400">{new Date(record.date).getFullYear()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="font-bold text-soft-black group-hover:text-main-blue transition-colors flex items-center gap-2">
                             {record.income > 0 ? (
                               <ArrowUpRight className="w-3 h-3 text-leaf-green" />
                             ) : (
                               <ArrowDownRight className="w-3 h-3 text-red-500" />
                             )}
                             {record.activity_name}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right font-mono font-bold text-leaf-green">
                          {record.income > 0 ? `+ ${formatCurrency(record.income)}` : '-'}
                        </td>
                        <td className="px-8 py-5 text-right font-mono font-bold text-red-500">
                          {record.expense > 0 ? `- ${formatCurrency(record.expense)}` : '-'}
                        </td>
                        <td className="px-8 py-5 text-right font-mono font-bold text-soft-black bg-gray-50/30">
                          {formatCurrency(record.runningBalance)}
                        </td>
                      </tr>
                    ));
                  })()
                )}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-gray-50 flex items-center justify-between border-t border-light-gray mt-auto">
             <div className="text-gray-400 text-xs font-medium">© {new Date().getFullYear()} Gugus 03 Melati · Transparansi Keuangan</div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-leaf-green"></div>
                 <span className="text-[10px] font-bold text-gray-500 uppercase">Debit</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-red-500"></div>
                 <span className="text-[10px] font-bold text-gray-500 uppercase">Kredit</span>
               </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
