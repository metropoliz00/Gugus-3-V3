import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Image as ImageIcon } from "lucide-react";
import { useSiteContent } from "../contexts/SiteContext";

export default function AnnouncementPopup({ isReady = true }: { isReady?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { content } = useSiteContent();
  const { announcement } = content || {};
  const location = useLocation();

  useEffect(() => {
    // Only show on main page or root
    if (location.pathname !== '/' && location.pathname !== '/halaman-utama') return;
    
    // Do not show if explicitly disabled
    if (announcement && announcement.active === false) return;
      
    const hasBeenShown = sessionStorage.getItem('announcementShown');
    if (!hasBeenShown && isReady) {
      // Show popup slightly after splash screen disappears
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isReady, location.pathname, announcement]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('announcementShown', 'true');
  };

  if (!announcement || announcement.active === false) {
    return null;
  }

  const hasImage = Boolean(announcement.imageUrl && announcement.imageUrl.trim() !== "");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={handleClose}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 my-auto flex flex-col max-h-[90vh]"
          >
            {/* Top Close Button Floating */}
            <button 
              onClick={handleClose}
              className="absolute top-3 right-3 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
              title="Tutup Popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Flyer / Poster Container */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {hasImage ? (
                <div className="relative bg-slate-950 flex items-center justify-center min-h-[220px]">
                  <img 
                    src={announcement.imageUrl} 
                    alt="Flyer Informasi" 
                    className="w-full h-auto max-h-[78vh] object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-main-blue via-blue-600 to-emerald-600 p-12 text-white text-center relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-2">Poster Informasi</h3>
                  <p className="text-white/80 text-sm max-w-md mx-auto">Atur URL gambar flyer/poster pada menu Pengaturan Admin.</p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end shrink-0">
              <button 
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-2 bg-main-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-sm shadow-md shadow-main-blue/10"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

