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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={handleClose}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl z-10 my-auto"
          >
            {/* Outer Top-Right Close Button */}
            <button 
              onClick={handleClose}
              className="absolute -top-5 -right-5 sm:-top-6 sm:-right-6 z-50 p-3 rounded-full bg-slate-900/90 hover:bg-black text-white shadow-2xl border-2 border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
              title="Tutup"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              {/* Flyer / Poster Container */}
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {hasImage ? (
                  <div className="relative bg-slate-950 flex items-center justify-center min-h-[220px]">
                    <img 
                      src={announcement.imageUrl} 
                      alt="Flyer Informasi" 
                      className="w-full h-auto max-h-[82vh] object-contain select-none"
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
                    <p className="text-white/80 text-sm max-w-md mx-auto">Upload foto flyer/poster pada menu Pengaturan Admin.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

