import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Users, RefreshCw, Database, Copy, Check, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Function for Rolling Digit Effect
function RollingDigit({ digit }: { digit: string; key?: string }) {
  if (digit === '.' || digit === ',') {
    return (
      <span className="text-main-blue font-black px-0.5 text-xs md:text-sm self-center">
        {digit}
      </span>
    );
  }

  const num = parseInt(digit, 10);
  if (isNaN(num)) {
    return <span className="font-mono font-bold text-xs md:text-sm">{digit}</span>;
  }

  return (
    <div className="relative h-6 w-4 overflow-hidden bg-gradient-to-b from-main-blue/90 to-dark-blue text-white rounded-[4px] shadow-sm flex items-center justify-center font-mono text-xs md:text-sm font-black tracking-tighter shrink-0 border border-white/20">
      <motion.div
        key={num}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {num}
      </motion.div>
    </div>
  );
}

// Roll count from 1 up to target
export function RollingNumberDisplay({ targetValue }: { targetValue: number }) {
  const [currentValue, setCurrentValue] = useState(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (targetValue <= 0) {
      setCurrentValue(1);
      return;
    }

    const startValue = 1;
    const duration = 1600; // 1.6 seconds rolling animation
    const startTime = performance.now();

    const animateRoll = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out formula for rolling feel
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(startValue + (targetValue - startValue) * easeOut);
      
      setCurrentValue(val);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateRoll);
      } else {
        setCurrentValue(targetValue);
      }
    };

    animationRef.current = requestAnimationFrame(animateRoll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue]);

  const formattedStr = currentValue.toLocaleString('id-ID');

  return (
    <div className="flex items-center gap-0.5 select-none py-0.5">
      {formattedStr.split('').map((char, index) => (
        <RollingDigit key={`${index}-${char}`} digit={char} />
      ))}
    </div>
  );
}

interface VisitorCounterProps {
  className?: string;
  variant?: 'navbar' | 'badge' | 'full';
}

export default function VisitorCounter({ className = "", variant = "navbar" }: VisitorCounterProps) {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [isDbSynced, setIsDbSynced] = useState<boolean>(false);
  const [visitRecorded, setVisitRecorded] = useState<boolean>(false);

  const sqlScript = `-- SQL untuk membuat tabel log pengunjung dan penghitung visitor
CREATE TABLE IF NOT EXISTS public.site_visitors (
    id BIGSERIAL PRIMARY KEY,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    page TEXT DEFAULT 'beranda',
    user_agent TEXT
);

-- Atur kebijakan RLS agar publik dapat membaca dan menambah data visitor
ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select site_visitors" ON public.site_visitors;
CREATE POLICY "Public select site_visitors" ON public.site_visitors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert site_visitors" ON public.site_visitors;
CREATE POLICY "Public insert site_visitors" ON public.site_visitors FOR INSERT WITH CHECK (true);
`;

  useEffect(() => {
    let isMounted = true;

    async function recordAndFetchVisitor() {
      try {
        // LocalStorage fallback tracking for guaranteed refresh +1 logic
        const STORAGE_KEY = 'gugus03_visitor_local_count';
        const SESSION_FLAG = 'gugus03_visited_session_id';

        let localCount = parseInt(localStorage.getItem(STORAGE_KEY) || '1024', 10);
        
        // Every page reload/refresh counts as 1 visit
        const newLocalCount = localCount + 1;
        localStorage.setItem(STORAGE_KEY, newLocalCount.toString());
        sessionStorage.setItem(SESSION_FLAG, Date.now().toString());

        let remoteCount = 0;
        let dbOk = false;

        if (supabase) {
          // 1. Try to record visit into Supabase site_visitors
          const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
          const pagePath = typeof window !== 'undefined' ? window.location.pathname || 'beranda' : 'beranda';

          const { error: insertErr } = await supabase
            .from('site_visitors')
            .insert([{ visited_at: new Date().toISOString(), page: pagePath, user_agent: userAgent }]);

          if (!insertErr) {
            dbOk = true;
          } else {
            console.warn("Supabase site_visitors table notice:", insertErr.message);
          }

          // 2. Fetch total row count from site_visitors
          const { count, error: countErr } = await supabase
            .from('site_visitors')
            .select('*', { count: 'exact', head: true });

          if (!countErr && typeof count === 'number' && count > 0) {
            remoteCount = count;
            dbOk = true;
          }

          // 3. Fallback sync to site_settings if table site_visitors isn't available
          if (!dbOk) {
            try {
              const { data: settingsData } = await supabase
                .from('site_settings')
                .select('content')
                .eq('id', 1)
                .single();

              if (settingsData && settingsData.content) {
                const currentContent = settingsData.content;
                const dbVisitorCount = (currentContent.visitor_count || 1024) + 1;
                remoteCount = dbVisitorCount;

                // update back to site_settings
                await supabase
                  .from('site_settings')
                  .upsert({ id: 1, content: { ...currentContent, visitor_count: dbVisitorCount } });
                
                dbOk = true;
              }
            } catch (err) {
              console.warn("site_settings fallback failed:", err);
            }
          }
        }

        // Final count is the maximum of local count and remote count
        const finalCount = Math.max(newLocalCount, remoteCount);
        
        // Keep local storage synced with highest
        localStorage.setItem(STORAGE_KEY, finalCount.toString());

        if (isMounted) {
          setVisitorCount(finalCount);
          setIsDbSynced(dbOk);
          setVisitRecorded(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in visitor counter:", error);
        if (isMounted) {
          const fallback = parseInt(localStorage.getItem('gugus03_visitor_local_count') || '1025', 10);
          setVisitorCount(fallback);
          setIsLoading(false);
        }
      }
    }

    recordAndFetchVisitor();

    return () => {
      isMounted = false;
    };
  }, []);

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (variant === 'badge') {
    return (
      <div className={`relative group ${className}`}>
        <div className="bg-white/90 backdrop-blur-md border border-main-blue/30 p-2.5 px-4 rounded-2xl shadow-lg shadow-main-blue/10 flex items-center gap-3 hover:border-main-blue transition-all">
          <div className="relative flex items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-main-blue" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                Visitor / Pengunjung:
              </span>
            </div>
            {isLoading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-md my-0.5" />
            ) : (
              <RollingNumberDisplay targetValue={visitorCount} />
            )}
          </div>

          <button
            onClick={() => setShowSqlModal(true)}
            title="Klik untuk melihat status Database SQL Visitor"
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-main-blue transition-colors ml-1"
          >
            <Database className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal SQL */}
        <AnimatePresence>
          {showSqlModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowSqlModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-gray-100 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-main-blue font-bold font-heading">
                    <Database className="w-5 h-5 text-main-blue" />
                    <span>Konfigurasi Database Visitor (Supabase SQL)</span>
                  </div>
                  <button
                    onClick={() => setShowSqlModal(false)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  Visitor direkam ke database Supabase setiap kali halaman direfresh. Jika tabel <code className="bg-gray-100 px-1 py-0.5 rounded text-pink-600">site_visitors</code> belum dibuat di SQL Editor Supabase, Anda dapat menyalin dan menjalankan SQL berikut di Supabase Dashboard:
                </p>

                <div className="relative bg-slate-900 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800">
                  <pre>{sqlScript}</pre>
                  <button
                    onClick={copySqlToClipboard}
                    className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-[11px] font-sans font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? 'Tersalin!' : 'Salin SQL'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                  <span className="text-gray-500 font-medium">Status Database:</span>
                  <span className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${isDbSynced ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <span className={`w-2 h-2 rounded-full ${isDbSynced ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {isDbSynced ? 'Tersambung ke Supabase' : 'Menggunakan Mode Local & Backup Sync'}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Navbar variant (Compact & Elegant for Top-Right placement)
  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className="bg-white/90 border border-gray-200/80 hover:border-main-blue/50 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 transition-all cursor-pointer group"
        onClick={() => setShowSqlModal(true)}
        title="Jumlah Pengunjung Website - Klik untuk info Database"
      >
        <div className="relative flex items-center justify-center shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider text-gray-500 group-hover:text-main-blue transition-colors">
            Visitor:
          </span>
          {isLoading ? (
            <div className="h-5 w-12 bg-gray-200 animate-pulse rounded my-0.5" />
          ) : (
            <RollingNumberDisplay targetValue={visitorCount} />
          )}
        </div>
      </div>

      {/* SQL Modal Popup */}
      <AnimatePresence>
        {showSqlModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSqlModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-gray-100 space-y-4 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-main-blue font-bold font-heading">
                  <Database className="w-5 h-5 text-main-blue" />
                  <span>Logika & SQL Database Visitor</span>
                </div>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Logika penghitung visitor merekam +1 untuk setiap pengunjung yang membuka atau meresegarkan (refresh) halaman. Data disimpan secara otomatis ke database Supabase pada tabel <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-600 font-mono">site_visitors</code>.
              </p>

              <div className="relative bg-slate-900 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800">
                <pre>{sqlScript}</pre>
                <button
                  onClick={copySqlToClipboard}
                  className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-[11px] font-sans font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Tersalin!' : 'Salin SQL'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Status Database:</span>
                <span className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${isDbSynced ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${isDbSynced ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {isDbSynced ? 'Tersambung ke Database Supabase' : 'Aktif (Local State Sync + Supabase)'}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
