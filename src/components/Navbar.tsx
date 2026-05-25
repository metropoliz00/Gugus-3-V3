import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, User, LogIn, ChevronDown, Home, School, Newspaper, LayoutDashboard } from "lucide-react";
import { cn } from "../lib/utils";
import { useSiteContent } from "../contexts/SiteContext";

export default function Navbar({ onLoginClick, user }: { onLoginClick: () => void; user?: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('beranda');
  const { content } = useSiteContent();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['beranda', 'sekolah', 'media', 'galeri'];
      let current = 'beranda';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  interface NavItem {
    label: string;
    href: string;
    type: 'nav' | 'anchor';
    dropdown?: string[];
  }

  const menuItems: NavItem[] = [
    { label: "Beranda", href: "/", type: 'nav' },
    { label: "Profil Gugus", href: "/profil-gugus", type: 'nav' },
    { label: "KKG", href: "/kkg", type: 'nav' },
    { label: "Sekolah", href: "/#sekolah", type: 'anchor' },
    { label: "Kegiatan", href: "/kegiatan", type: 'nav' },
    { label: "Media & Informasi", href: "/#media", type: 'anchor' },
    { label: "Praktik Baik", href: "/praktik-baik", type: 'nav' },
    { label: "Keuangan", href: "/keuangan", type: 'nav' },
    { label: "Galeri", href: "/#galeri", type: 'anchor' },
    { label: "Anggota Gugus", href: "/anggota-gugus", type: 'nav' },
    { label: "Hasil Karya", href: "/hasil-karya", type: 'nav' },
  ];

  const isKkgPage = location.pathname === '/kkg';

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 hidden lg:block",
          isScrolled 
            ? "bg-white/80 backdrop-blur-md shadow-sm py-3" 
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-6 max-w-9xl flex items-center justify-between">
          {/* Logo container */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="w-10 h-10 rounded-full bg-white border-2 border-main-blue flex items-center justify-center p-1.5 shadow-sm overflow-hidden"
              >
                <img src={content.hero.logo} alt="Logo Melati" className="w-full h-full object-contain" />
              </motion.div>
              <div className="flex flex-col hidden xl:flex">
                <span className="text-sm font-bold tracking-tight text-dark-green uppercase">GUGUS 03 MELATI</span>
                <span className="text-[10px] uppercase tracking-widest text-main-blue font-semibold">KECAMATAN JENU</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="flex items-center gap-2 xl:gap-6 text-[13px] font-medium text-gray-600 hidden lg:flex">
            {menuItems.map((item) => (
              <div 
                key={item.label} 
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.type === 'nav' ? (
                  <Link
                    to={item.href}
                    className={cn(
                      "px-2 py-1 transition-colors flex items-center gap-1 hover:text-leaf-green",
                      location.pathname === item.href && "text-main-blue font-bold"
                    )}
                  >
                    {item.label}
                    {item.dropdown && <ChevronDown className="w-4 h-4 ml-0.5" />}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      const id = item.href.split('#')[1];
                      if (location.pathname !== '/') {
                        navigate('/');
                        setTimeout(() => {
                            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      } else {
                        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-2 py-1 transition-colors flex items-center gap-1 hover:text-leaf-green cursor-pointer"
                  >
                    {item.label}
                    {item.dropdown && <ChevronDown className="w-4 h-4 ml-0.5" />}
                  </button>
                )}

                {/* Dropdown */}
                {item.dropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-light-gray/50 py-2 overflow-hidden backdrop-blur-xl">
                    {item.dropdown.map((dropItem) => (
                      <a href="#" key={dropItem} className="block px-4 py-2 text-sm text-dark-gray hover:bg-light-gray hover:text-main-blue transition-colors">
                        {dropItem}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Login Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link 
                to="/dashboard"
                className="px-6 py-2 rounded-full bg-gradient-to-r from-main-blue to-leaf-green text-white text-sm font-semibold shadow-lg shadow-main-blue/20 hover:scale-105 transition-transform flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" /> Ke Dashboard
              </Link>
            ) : (
              <button 
                onClick={() => onLoginClick()}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-main-blue to-leaf-green text-white text-sm font-semibold shadow-lg shadow-main-blue/20 hover:scale-105 transition-transform flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Floating Bottom Nav (Mobile) */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
        <div className="bg-white/90 backdrop-blur-lg border border-main-orange/30 shadow-2xl rounded-full p-2 flex items-center justify-between px-6">
           <button 
             onClick={() => {
               if (location.pathname === '/') {
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               } else {
                 navigate('/');
               }
             }}
             className={`flex flex-col items-center gap-1 p-2 transition-colors ${!isKkgPage && activeSection === 'beranda' ? 'text-main-blue scale-110' : 'text-dark-gray/60 hover:text-main-blue'}`}
            >
             <Home className="w-5 h-5" />
             <span className="text-[10px] font-medium">Beranda</span>
           </button>
           <Link to="/kkg" className={`flex flex-col items-center gap-1 p-2 transition-colors ${isKkgPage ? 'text-main-blue scale-110' : 'text-dark-gray/60 hover:text-main-blue'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             <span className="text-[10px] font-medium">KKG</span>
           </Link>
           <button 
             onClick={() => {
               if (location.pathname !== '/') {
                 navigate('/');
                 setTimeout(() => {
                   document.getElementById('sekolah')?.scrollIntoView({ behavior: 'smooth' });
                 }, 100);
               } else {
                 document.getElementById('sekolah')?.scrollIntoView({ behavior: 'smooth' });
               }
             }}
             className={`flex flex-col items-center gap-1 p-2 transition-colors ${!isKkgPage && activeSection === 'sekolah' ? 'text-main-blue scale-110' : 'text-dark-gray/60 hover:text-main-blue'}`}
            >
             <School className="w-5 h-5" />
             <span className="text-[10px] font-medium">Sekolah</span>
           </button>
           <button 
             onClick={() => {
               if (location.pathname !== '/') {
                 navigate('/');
                 setTimeout(() => {
                   document.getElementById('media')?.scrollIntoView({ behavior: 'smooth' });
                 }, 100);
               } else {
                 document.getElementById('media')?.scrollIntoView({ behavior: 'smooth' });
               }
             }}
             className={`flex flex-col items-center gap-1 p-2 transition-colors ${!isKkgPage && activeSection === 'media' ? 'text-main-blue scale-110' : 'text-dark-gray/60 hover:text-main-blue'}`}
            >
             <Newspaper className="w-5 h-5" />
             <span className="text-[10px] font-medium">Info</span>
           </button>
           <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 text-dark-gray/60 hover:text-main-blue transition-colors">
             <Menu className="w-5 h-5" />
             <span className="text-[10px] font-medium">Menu</span>
           </button>
        </div>
      </div>

      {/* Mobile Full Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white lg:hidden overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="font-heading font-bold text-xl text-dark-gray">Menu Utama</div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-light-gray rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {menuItems.map(item => (
                  <div key={item.label}>
                    {item.type === 'nav' ? (
                      <Link 
                        to={item.href} 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="text-lg font-medium text-dark-gray py-2 border-b border-light-gray flex items-center justify-between"
                      >
                        {item.label}
                        <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                      </Link>
                    ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        const id = item.href.split('#')[1];
                        if (location.pathname !== '/') {
                          navigate('/');
                          setTimeout(() => {
                              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        } else {
                          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-lg font-medium text-dark-gray py-2 border-b border-light-gray flex items-center justify-between"
                    >
                        {item.label}
                        <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3">
                {user ? (
                  <Link 
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-main-blue to-dark-blue text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-5 h-5" /> Ke Dashboard
                  </Link>
                ) : (
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onLoginClick(); }} 
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-main-blue to-dark-blue text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" /> Login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
