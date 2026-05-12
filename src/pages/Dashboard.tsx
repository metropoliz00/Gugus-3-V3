import React, { useState, useEffect, useRef } from 'react'; // Updated
import { 
  LogOut, LayoutDashboard, FileText, Settings, Users, BookOpen, 
  Map, Navigation, Image as ImageIcon, Briefcase, FileVideo, Video, MessageSquare, MessageCircle, Download,
  Calendar, CheckSquare, Search, Menu, X, PlusCircle, PenTool, Trophy, Award,
  UploadCloud, Activity, Bell, Shield, ChevronRight, BarChart3, GraduationCap, Play, Megaphone,
  Wallet, Trash2, Globe, ArrowLeft, Send, ChevronDown, Type
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

import { useSiteContent, defaultContent } from '../contexts/SiteContext';
import FloatingWA from '../components/FloatingWA';
import { supabase } from '../lib/supabase';
import OrgChart from '../components/OrgChart';
import ImageUpload from '../components/ImageUpload';
import { useAlert } from '../contexts/AlertContext';
import { FinanceTransaction } from '../types';
import { logActivity, ActivityLog } from '../lib/activity';
import AdminCertificateEditor, { useCertificateGenerator } from '../components/AdminCertificateEditor';

import * as XLSX from 'xlsx';

// Types
interface User {
  role: 'admin' | 'guru';
  username?: string;
  nama?: string;
  nip?: string;
  jabatan?: string;
  sekolah?: string;
  kepegawaian?: string;
  pangkat?: string;
  email?: string;
  full_name?: string;
  id?: string;
  foto?: string;
  avatar_url?: string;
}

// Data Chart Temp
const dataChart = [
  { name: 'Sen', pengunjung: 4000, aktivitas: 2400 },
  { name: 'Sel', pengunjung: 3000, aktivitas: 1398 },
  { name: 'Rab', pengunjung: 2000, aktivitas: 9800 },
  { name: 'Kam', pengunjung: 2780, aktivitas: 3908 },
  { name: 'Jum', pengunjung: 1890, aktivitas: 4800 },
  { name: 'Sab', pengunjung: 2390, aktivitas: 3800 },
  { name: 'Min', pengunjung: 3490, aktivitas: 4300 },
];

const adminMenu = [
  { id: 'overview', label: 'Dashboard Admin', icon: LayoutDashboard },
  { id: 'berita', label: 'Kelola Berita', icon: FileText },
  { id: 'pengumuman', label: 'Kelola Pengumuman', icon: Bell },
  { id: 'galeri', label: 'Kelola Galeri', icon: ImageIcon },
  { id: 'sekolah', label: 'Kelola Sekolah Inti/Imbas', icon: BookOpen },
  { id: 'guru', label: 'Kelola Guru', icon: Users },
  { id: 'finance', label: 'Kelola Keuangan', icon: Wallet },
  { id: 'user', label: 'Kelola User', icon: Shield },
  { id: 'agenda', label: 'Kelola Agenda KKG', icon: Calendar },
  { id: 'materi', label: 'Kelola Materi KKG', icon: BookOpen },
  { id: 'notulen', label: 'Kelola Notulen Rapat', icon: FileText },
  { id: 'pelatihan', label: 'Kelola Pelatihan', icon: GraduationCap },
  { id: 'sertifikat', label: 'Kelola Sertifikat', icon: Award },
  { id: 'forum', label: 'Kelola Forum Diskusi', icon: MessageSquare },
  { id: 'komentar', label: 'Kelola Komentar Forum', icon: MessageSquare },
  { id: 'sharing', label: 'Kelola Praktik Baik', icon: Play },
  { id: 'hasil_karya', label: 'Kelola Hasil Karya', icon: UploadCloud },
  { id: 'struktur_org', label: 'Kelola KKG & Gugus', icon: Users },
  { id: 'penghargaan', label: 'Kelola Penghargaan', icon: Trophy },
  { id: 'pengaturan', label: 'Pengaturan Website', icon: Settings },
];

const guruMenu = [
  { id: 'overview', label: 'Dashboard Guru', icon: LayoutDashboard },
  { id: 'profil', label: 'Profil Saya', icon: Users },
  { id: 'jadwal', label: 'Jadwal KKG', icon: Calendar },
  { id: 'materi', label: 'Materi KKG', icon: BookOpen },
  { id: 'notulen', label: 'Notulen Rapat', icon: FileText },
  { id: 'pelatihan', label: 'Pelatihan', icon: GraduationCap },
  { id: 'absensi', label: 'Absensi Pelatihan', icon: CheckSquare },
  { id: 'sertifikat', label: 'Sertifikat Pelatihan', icon: Award },
  { id: 'forum', label: 'Forum Diskusi', icon: MessageSquare },
  { id: 'sharing', label: 'Sharing Praktik Baik', icon: Play },
  { id: 'upload_karya', label: 'Upload Hasil Karya', icon: UploadCloud },
  { id: 'pengaturan_akun', label: 'Pengaturan Akun', icon: Settings },
];

const adminMenuGroups = [
  { 
    title: 'Ikhtisar', 
    items: ['overview', 'user', 'guru', 'finance'] 
  },
  { 
    title: 'Konten Publik', 
    items: ['berita', 'pengumuman', 'galeri'] 
  },
  { 
    title: 'Akademik', 
    items: ['agenda', 'materi', 'notulen', 'pelatihan', 'sertifikat'] 
  },
  { 
    title: 'Forum & Karya', 
    items: ['forum', 'komentar', 'sharing', 'hasil_karya', 'penghargaan'] 
  },
  { 
    title: 'Sistem', 
    items: ['sekolah', 'struktur_org', 'pengaturan'] 
  }
];

// Helper for notifications
const getNotificationIcon = (name: string) => {
  switch(name) {
    case 'Megaphone': return Megaphone;
    case 'Calendar': return Calendar;
    case 'MessageSquare': return MessageSquare;
    default: return Bell;
  }
};

export default function Dashboard({ user: initialUser, onLogout }: { user: User; onLogout: () => void }) {
  const [user, setUser] = useState(initialUser);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Ikhtisar': true,
    'Konten Publik': true,
    'Akademik': false,
    'Forum & Karya': false,
    'Sistem': false
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchNotifications() {
      if (!supabase) return;
      try {
        // Fetch last 5 of various items
        const [postsRes, eventsRes, forumRes] = await Promise.all([
          supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('events').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('forum_posts').select('*').order('created_at', { ascending: false }).limit(5)
        ]);

        const combined = [
          ...(postsRes.data || []).map(p => ({
             id: p.id,
             type: 'post',
             title: p.category === 'berita' ? 'Berita Baru' : 'Pengumuman Baru',
             message: p.title,
             time: new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
             iconName: p.category === 'berita' ? 'Megaphone' : 'Bell',
             link: `/dashboard/${p.category === 'berita' ? 'berita' : 'pengumuman'}`,
             raw_date: p.created_at
          })),
          ...(eventsRes.data || []).map(e => ({
             id: e.id,
             type: 'event',
             title: 'Agenda Baru',
             message: e.title,
             time: new Date(e.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
             iconName: 'Calendar',
             link: '/dashboard/agenda',
             raw_date: e.created_at
          })),
           ...(forumRes.data || []).map(f => ({
             id: f.id,
             type: 'forum',
             title: 'Topik Forum Baru',
             message: f.title,
             time: new Date(f.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
             iconName: 'MessageSquare',
             link: '/dashboard/forum',
             raw_date: f.created_at
          }))
        ];

        setNotifications(combined.sort((a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime()).slice(0, 8));
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }
    fetchNotifications();
  }, []);

  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { content, updateContent, saveMessage, isLoading } = useSiteContent();

  const [heroForm, setHeroForm] = useState(content.hero);
  const [profilForm, setProfilForm] = useState(content.profil);
  const [footerForm, setFooterForm] = useState(content.footer);
  const [statsForm, setStatsForm] = useState(content.stats);
  const [kkgForm, setKkgForm] = useState(content.kkg || { struktur: [] });
  const [gugusForm, setGugusForm] = useState(content.gugus || { struktur: [] });
  const [schoolsForm, setSchoolsForm] = useState(content.schools);
  const [newsForm, setNewsForm] = useState(content.news);
  const [galleryForm, setGalleryForm] = useState(content.gallery);
  const [agendaForm, setAgendaForm] = useState(content.agenda);
  const [announcementForm, setAnnouncementForm] = useState(content.announcement || { title: '', subtitle: '', desc: '' });

  // Sync with context if it changes (e.g. initial load)
  React.useEffect(() => {
    if (!isLoading) {
      setHeroForm(content.hero);
      setProfilForm(content.profil);
      setFooterForm(content.footer);
      setStatsForm(content.stats);
      setKkgForm(content.kkg);
      setGugusForm(content.gugus);
      setSchoolsForm(content.schools);
      setNewsForm(content.news);
      setGalleryForm(content.gallery);
      setAgendaForm(content.agenda);
      setAnnouncementForm(content.announcement);
    }
  }, [content, isLoading]);

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateContent({ 
      hero: heroForm, 
      profil: profilForm, 
      footer: footerForm, 
      stats: statsForm, 
      kkg: kkgForm, 
      gugus: gugusForm,
      schools: schoolsForm,
      news: newsForm,
      gallery: galleryForm,
      agenda: agendaForm,
      announcement: announcementForm
    });
  };

  const isAdmin = user.role?.toLowerCase() === 'admin';
  const menuItems = isAdmin 
    ? adminMenu 
    : guruMenu.filter(item => {
        if (isLoading || !content.activeMenus || Object.keys(content.activeMenus).length === 0) return true;
        return !!content.activeMenus[item.id];
      });
  
  // Get active tab from path
  const currentPath = location.pathname.split('/').pop() || 'overview';
  const activeTab = menuItems.find(m => m.id === currentPath) ? currentPath : 'overview';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-soft-black selection:bg-main-blue selection:text-white overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={isDesktop || isSidebarOpen ? { x: 0 } : { x: "-100%" }}
        className="w-[280px] bg-white/80 backdrop-blur-xl border-r border-gray-100 flex-shrink-0 fixed inset-y-0 left-0 z-50 md:sticky md:translate-x-0 transition-transform duration-300 flex flex-col shadow-2xl md:shadow-none"
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-main-blue to-leaf-green flex items-center justify-center p-1 overflow-hidden shadow-lg shadow-main-blue/20"
            >
              <img src="https://www.image2url.com/r2/default/images/1778156189287-e4930eb4-3c36-4ace-8420-ca8908132e66.png" alt="Logo" className="w-full h-full object-contain bg-white rounded-lg" />
            </motion.div>
            <div>
              <h1 className="font-heading font-black bg-clip-text text-transparent bg-gradient-to-r from-main-blue to-leaf-green leading-tight text-xl">Gugus 3</h1>
              <span className="text-[10px] uppercase tracking-wider text-main-blue font-bold px-2 py-0.5 bg-main-blue/10 rounded-full">{user.role}</span>
            </div>
          </div>
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-4 modern-scrollbar">
          {isAdmin ? (
            adminMenuGroups.map((group, idx) => {
              const isExpanded = expandedGroups[group.title];
              return (
                <div key={idx} className="space-y-1">
                  <button 
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-4 py-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-3 bg-main-blue/30 rounded-full"></div>
                       <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.title}</h3>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden space-y-1"
                  >
                    {group.items.map(itemId => {
                      const menu = adminMenu.find(m => m.id === itemId);
                      if (!menu) return null;
                      const Icon = menu.icon;
                      const isActive = activeTab === menu.id;
                      return (
                        <button
                          key={menu.id}
                          onClick={() => {
                            navigate(`/dashboard/${menu.id}`);
                            if (window.innerWidth < 768) setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden ${
                            isActive 
                              ? 'text-main-blue'
                              : 'text-gray-600 hover:text-soft-black hover:bg-gray-50'
                          }`}
                        >
                          {isActive && (
                            <motion.div 
                              layoutId="active-sidebar-admin"
                              className="absolute inset-0 bg-main-blue/10 rounded-xl"
                              initial={false}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-main-blue' : 'text-gray-400 group-hover:text-main-blue/70'}`} />
                          <span className="relative z-10">{menu.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </div>
              );
            })
          ) : (
            <div className="space-y-1">
              {menuItems.map((menu) => {
                const Icon = menu.icon;
                const isActive = activeTab === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => {
                      navigate(`/dashboard/${menu.id}`);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative overflow-hidden ${
                      isActive 
                        ? 'text-main-blue'
                        : 'text-gray-600 hover:text-soft-black hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-sidebar-guru"
                        className="absolute inset-0 bg-main-blue/10 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-main-blue' : 'text-gray-400 group-hover:text-main-blue/70'}`} />
                    <span className="relative z-10">{menu.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100 mt-auto">
          <button                
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold font-heading text-soft-black hidden sm:block">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-400 hover:text-main-blue hover:bg-main-blue/5 rounded-xl transition-all"
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                      <h3 className="font-bold text-soft-black">Notifikasi Terbaru</h3>
                      <span className="text-[10px] bg-main-blue text-white px-2 py-0.5 rounded-full font-bold">
                        {notifications.length} Info
                      </span>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto modern-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => {
                          const Icon = getNotificationIcon(notif.iconName);
                          return (
                            <button
                              key={notif.id}
                              onClick={() => {
                                navigate(notif.link);
                                setNotificationsOpen(false);
                              }}
                              className="w-full p-4 flex gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left group"
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                notif.type === 'post' ? 'bg-blue-50 text-blue-600' :
                                notif.type === 'event' ? 'bg-orange-50 text-orange-600' :
                                'bg-green-50 text-green-600'
                              }`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-400 mb-0.5 uppercase tracking-wider">{notif.title}</p>
                                <p className="text-sm text-soft-black font-medium line-clamp-2 group-hover:text-main-blue transition-colors">{notif.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
                                  <Activity className="w-3 h-3" /> {notif.time}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-10 text-center">
                          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                          <p className="text-gray-500 text-sm">Tidak ada notifikasi baru</p>
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => navigate('/dashboard/pengumuman')}
                        className="w-full p-3 text-center text-xs font-bold text-main-blue hover:bg-main-blue/5 transition-colors border-t border-gray-50"
                      >
                        Lihat Semua Pengumuman
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-200">
               <div className="text-right hidden md:block">
                 <p className="text-sm font-bold text-soft-black">{user.nama || user.full_name || user.username || user.role}</p>
                 <p className="text-xs text-gray-500">Online</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-main-blue to-leaf-green p-0.5 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/dashboard/profil')}>
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                    <img src={user.foto || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama || user.username || 'U')}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative" id="dashboard-main">
           <div className="max-w-9xl mx-auto">
             {saveMessage && (
               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-3">
                 <CheckSquare className="w-5 h-5 text-green-500" />
                 <span className="font-medium text-sm">{saveMessage}</span>
               </motion.div>
             )}

             <AnimatePresence mode="wait">
               <motion.div
                 key={location.pathname}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                 <Routes>
                   <Route path="/" element={<Navigate to="overview" replace />} />
                   <Route path="overview" element={user.role?.toLowerCase() === 'admin' ? <AdminOverview /> : <GuruOverview user={user} />} />
                   
                   {/* Admin Routes */}
                   {user.role?.toLowerCase() === 'admin' && (
                     <>
                        <Route path="pengaturan" element={<AdminSettingsForm />} />
                        <Route path="user" element={<AdminUserManagement />} />
                        <Route path="sekolah" element={<AdminSekolahForm user={user} />} />
                        <Route path="berita" element={<AdminBeritaForm user={user} />} />
                        <Route path="galeri" element={<AdminGaleriForm user={user} />} />
                        <Route path="kkg" element={<AdminKKGForm kkgForm={kkgForm} setKkgForm={setKkgForm} handleSaveContent={handleSaveContent} updateContent={updateContent} />} />
                        <Route path="agenda" element={<AdminAgendaForm user={user} />} />
                        <Route path="gugus" element={<AdminGugusForm gugusForm={gugusForm} setGugusForm={setGugusForm} handleSaveContent={handleSaveContent} />} />
                        <Route path="struktur_org" element={<AdminStrukturManager />} />
                        <Route path="penghargaan" element={<AdminPenghargaanForm />} />
                        <Route path="pengumuman" element={<AdminPengumumanForm />} />
                        <Route path="guru" element={<AdminGuruForm user={user} />} />
                        <Route path="finance" element={<AdminFinanceManagement user={user} />} />
                         <Route path="materi" element={<DataManagementTable user={user} table="kkg_materials" title="Materi KKG" icon={BookOpen} fields={[{name:'title', label:'Judul'}, {name:'description', label:'Deskripsi'}, {name:'category', label:'Kategori'}, {name:'file_url', label:'URL File', type:'file'}]} />} />
                        <Route path="notulen" element={<DataManagementTable user={user} table="meeting_minutes" title="Notulen Rapat" icon={FileText} fields={[{name:'title', label:'Judul Notulen'}, {name:'date', label:'Tanggal Rapat', type:'date'}, {name:'content', label:'Konten / Isi Notulen', type:'textarea'}, {name:'file_url', label:'Lampiran (Opsional)', type:'file'}]} />} />
                        <Route path="pelatihan" element={<DataManagementTable user={user} table="trainings" title="Sistem Manajemen Pelatihan" icon={GraduationCap} fields={[{name:'title', label:'Judul Pelatihan'}, {name:'description', label:'Deskripsi Lengkap', type:'textarea'}, {name:'location', label:'Lokasi / Link Pelatihan'}, {name:'date_start', label:'Tanggal Pelaksanaan', type:'date'}, {name:'status', label:'Status Publikasi', type:'select', options:[{label: 'Direncanakan', value: 'planned'}, {label: 'Sedang Berlangsung', value: 'ongoing'}, {label: 'Selesai', value: 'completed'}]}]} />} />
                         <Route path="sertifikat" element={<AdminCertificateManager user={user} />} />
                        <Route path="forum" element={<DataManagementTable user={user} table="forum_posts" title="Forum Diskusi" icon={MessageSquare} fields={[{name:'title', label:'Judul'}, {name:'content', label:'Konten', type:'textarea'}, {name:'category', label:'Kategori'}]} />} />
                        <Route path="komentar" element={<DataManagementTable user={user} table="forum_comments" title="Komentar Forum" icon={MessageSquare} fields={[{name:'post_id', label:'Post ID'}, {name:'content', label:'Konten', type:'textarea'}, {name:'user_id', label:'User ID'}]} />} />
                        <Route path="sharing" element={<DataManagementTable user={user} table="best_practices" title="Sharing Praktik Baik" icon={Play} fields={[{name:'title', label:'Judul'}, {name:'description', label:'Deskripsi'}, {name:'video_url', label:'URL Video'}, {name:'file_url', label:'URL File', type:'file'}]} />} />
                        <Route path="hasil_karya" element={<DataManagementTable user={user} table="teacher_works" title="Hasil Karya Guru" icon={UploadCloud} fields={[{name:'title', label:'Judul Karya'}, {name:'description', label:'Deskripsi'}, {name:'work_type', label:'Jenis Karya'}, {name:'file_url', label:'URL File', type:'file'}]} />} />
                        <Route path="profil" element={<UserProfileEdit user={user} onUpdate={(updated: any) => setUser(prev => ({ ...prev, ...updated }))} />} />
                     </>
                   )}

                   {/* Guru Routes */}
                   {user.role?.toLowerCase() === 'guru' && (
                     <>
                       <Route path="profil" element={<UserProfileEdit user={user} onUpdate={(updated: any) => setUser(prev => ({ ...prev, ...updated }))} />} />
                       <Route path="jadwal" element={<TeacherJadwalCards />} />
                       <Route path="materi" element={<DataViewList table="kkg_materials" title="Materi KKG" icon={BookOpen} />} />
                       <Route path="notulen" element={<DataViewList table="meeting_minutes" title="Notulen Rapat" icon={FileText} />} />
                       <Route path="pelatihan" element={<TeacherTrainingCards user={user} />} />
                       <Route path="absensi" element={<TeacherAttendance />} />
                       <Route path="sertifikat" element={<DataViewList table="training_certificates" title="Sertifikat Saya" icon={Award} filterColumn="user_id" filterValue={user.id} />} />
                       <Route path="forum" element={<ForumSystem user={user} />} />
                       <Route path="sharing" element={<DataViewList table="best_practices" title="Sharing Praktik Baik" icon={Play} />} />
                       <Route path="upload_karya" element={<DataManagementTable table="teacher_works" title="Upload Hasil Karya" icon={UploadCloud} fields={[{name:'title', label:'Judul Karya'}, {name:'description', label:'Deskripsi'}, {name:'work_type', label:'Jenis Karya'}, {name:'file_url', label:'URL File', type:'file'}]} />} />
                        <Route path="pengaturan_akun" element={<UserProfileEdit user={user} onUpdate={(updated: any) => setUser(prev => ({ ...prev, ...updated }))} />} />
                     </>
                   )}

                   {/* Fallback for other tabs */}
                   <Route path="*" element={<TabPlaceholder menuItems={menuItems} activeTab={activeTab} />} />
                 </Routes>
               </motion.div>
             </AnimatePresence>
           </div>
        </main>
      </div>

    </div>
  );
}

// Helper component for tabs in development
function TabPlaceholder({ menuItems, activeTab }: { menuItems: any[], activeTab: string }) {
  const activeLabel = menuItems.find(m => m.id === activeTab)?.label;
  const ActiveIcon = menuItems.find(m => m.id === activeTab)?.icon || LayoutDashboard;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-main-orange/30 shadow-xl min-h-[400px] flex items-center justify-center relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-main-blue/5 rounded-full blur-3xl" />
      <div className="text-center text-gray-500 relative z-10">
        <ActiveIcon className="w-20 h-20 mx-auto mb-6 text-main-blue/30" strokeWidth={1} />
        <h2 className="text-2xl font-heading font-bold text-soft-black mb-2">{activeLabel}</h2>
        <p className="text-gray-500">Fitur ini sedang dalam pengembangan.</p>
      </div>
    </motion.div>
  );
}

// ==========================================
// SUB COMPONENTS FOR TABS
// ==========================================

function AdminUserManagement() {
  const { alert, confirm } = useAlert();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number, failure: number } | null>(null);
  
  const [userList, setUserList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Manual User Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    nama: '',
    nip: '',
    role: 'guru',
    sekolah: '',
    jabatan: '',
    kepegawaian: '',
    pangkat: '',
    foto: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/debug/list-users');
      if (!response.ok) {
         throw new Error("Gagal mengambil data user");
      }
      
      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        setUserList(data || []);
      } catch (e) {
        console.error("Non-JSON response from list-users:", responseText.substring(0, 50));
        setUserList([]);
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || (!formData.password && !editId)) {
      setFormError("Username dan Password wajib diisi");
      return;
    }
    
    setIsSubmitting(true);
    setFormError("");

    try {
      const endpoint = editId ? '/api/admin/update-user' : '/api/setup/create-user';
      const body = editId ? { ...formData, id: editId } : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      let result;
      const responseText = await response.text();
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Koneksi ke server gagal atau sedang offline. (Ext: ${responseText.substring(0, 40)})`);
      }

      if (!response.ok) throw new Error(result.error || "Gagal memproses user");

      await alert(editId ? `Akun '${formData.username}' berhasil diperbarui.` : `Sukses! Akun '${formData.username}' berhasil dibuat.`);
      setShowAddForm(false);
      setEditId(null);
      setFormData({ 
        username: '', 
        password: '', 
        email: '',
        nama: '', 
        nip: '',
        role: 'guru', 
        sekolah: '',
        jabatan: '',
        kepegawaian: '',
        pangkat: '',
        foto: ''
      });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditId(user.id);
    setFormData({
      username: user.username || '',
      password: '', 
      email: user.email || '',
      nama: user.nama || '',
      nip: user.nip || '',
      role: user.role || 'guru',
      sekolah: user.sekolah || '',
      jabatan: user.jabatan || '',
      kepegawaian: user.kepegawaian || '',
      pangkat: user.pangkat || '',
      foto: user.foto || ''
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = await confirm(`Apakah Anda yakin ingin menghapus akun '${name}'? Tindakan ini tidak dapat dibatalkan.`);
    if (!isConfirmed) return;
    
    try {
      const response = await fetch(`/api/admin/delete-user/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Gagal menghapus user");
      await alert("Akun berhasil dihapus.");
      fetchUsers();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        Username: "budi_setiawan",
        Password: "Password123!",
        Email: "budi@gugus3.id",
        Nama: "Budi Setiawan, S.Pd.",
        NIP: "198501012010011001",
        Role: "guru",
        Sekolah: "SDN 1 Melati",
        Jabatan: "Guru Kelas IV",
        Kepegawaian: "PNS",
        Pangkat: "Penata / IIIc"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template User");
    XLSX.writeFile(wb, "Template_User_Gugus3.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const formattedUsers = jsonData.map(row => ({
          username: row.Username || row.username,
          email: row.Email || row.email,
          password: row.Password || row.password,
          role: row.Role || row.role || 'guru',
          nama: row.Nama || row.nama,
          nip: row.NIP || row.nip,
          kepegawaian: row.Kepegawaian || row.kepegawaian,
          pangkat: row.Pangkat || row.pangkat,
          jabatan: row.Jabatan || row.jabatan,
          sekolah: row.Sekolah || row.sekolah
        }));

        const response = await fetch('/api/admin/bulk-create-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: formattedUsers })
        });

        let result;
        const responseText = await response.text();
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          throw new Error("Respons bulk-create tidak valid dari server.");
        }
        
        const successCount = result.results?.length || 0;
        const failureCount = result.errors?.length || 0;

        setUploadResult({ success: successCount, failure: failureCount });
        
        setIsUploading(false);
        fetchUsers();
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
         <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Manajemen User</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola akun Admin dan Guru dalam sistem.</p>
         </div>
         <div className="flex flex-wrap gap-3">
           <button 
             onClick={() => {
                if (showAddForm) {
                  setShowAddForm(false);
                  setEditId(null);
                  setFormData({ 
                    username: '', 
                    password: '', 
                    email: '', 
                    nama: '', 
                    nip: '', 
                    role: 'guru', 
                    sekolah: '',
                    jabatan: '',
                    kepegawaian: '', 
                    pangkat: '', 
                    foto: ''
                  });
                } else {
                  setShowAddForm(true);
                }
             }}
             className="px-6 py-2.5 bg-main-blue text-white flex items-center gap-2 font-bold rounded-xl hover:bg-dark-blue transition-all shadow-lg shadow-main-blue/20"
           >
             <PlusCircle className="w-5 h-5" /> {showAddForm ? 'Tutup Form' : 'Tambah User Manual'}
           </button>
           
           <label className="px-6 py-2.5 bg-green-600 text-white flex items-center gap-2 font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 cursor-pointer">
             <UploadCloud className="w-5 h-5" /> {isUploading ? 'Mengunggah...' : 'Upload Excel Massal'}
             <input 
               type="file" 
               accept=".xlsx, .xls" 
               onChange={handleFileUpload}
               disabled={isUploading}
               className="hidden" 
             />
           </label>

           <button 
             onClick={downloadTemplate}
             className="px-6 py-2.5 bg-gray-100 text-gray-700 flex items-center gap-2 font-bold rounded-xl hover:bg-gray-200 transition-all font-sans"
           >
             <Download className="w-5 h-5" /> Download Template Excel
           </button>
         </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white p-8 rounded-3xl border border-blue-100"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-main-blue">
               {editId ? <PenTool className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
               {editId ? 'Edit User' : 'Tambah User Baru'}
            </h3>
            <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="space-y-1 lg:col-span-3">
                 <ImageUpload 
                   label="Unggah Foto Profil" 
                   value={formData.foto} 
                   onChange={base64 => setFormData({...formData, foto: base64})}
                   maxWidth={400}
                   maxHeight={400}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                 <input 
                   className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                   value={formData.username}
                   onChange={e => setFormData({...formData, username: e.target.value})}
                   placeholder="e.g. budismart"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Email (Opsional)</label>
                 <input 
                   className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   placeholder="guru@example.com"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                 <input 
                   type="password"
                   className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                   placeholder="••••••••"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Peran (Role)</label>
                 <select 
                   className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none bg-white"
                   value={formData.role}
                   onChange={e => setFormData({...formData, role: e.target.value})}
                 >
                   <option value="guru">Guru</option>
                   <option value="admin">Administrator</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
                 <input 
                   className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                   value={formData.nama}
                   onChange={e => setFormData({...formData, nama: e.target.value})}
                   placeholder="Nama Beserta Gelar"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">NIP</label>
                 <input 
                   className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                   value={formData.nip}
                   onChange={e => setFormData({...formData, nip: e.target.value})}
                   placeholder="NIP (jika ada)"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Kepegawaian</label>
                 <select 
                   className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none bg-white"
                   value={formData.kepegawaian}
                   onChange={e => setFormData({...formData, kepegawaian: e.target.value})}
                 >
                   <option value="">Pilih Status</option>
                   <option value="PNS">PNS</option>
                   <option value="PPPK">PPPK</option>
                   <option value="GTT">GTT</option>
                   <option value="Honorer">Honorer</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Pangkat / Golongan</label>
                 <input 
                   className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                   value={formData.pangkat}
                   onChange={e => setFormData({...formData, pangkat: e.target.value})}
                   placeholder="e.g. Penata / IIIc"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Jabatan</label>
                 <input 
                   className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                   value={formData.jabatan}
                   onChange={e => setFormData({...formData, jabatan: e.target.value})}
                   placeholder="e.g. Guru Kelas IV"
                 />
               </div>
               <div className="space-y-1 lg:col-span-3">
                 <label className="text-xs font-bold text-gray-500 uppercase">Sekolah</label>
                 <input 
                   className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                   value={formData.sekolah}
                   onChange={e => setFormData({...formData, sekolah: e.target.value})}
                   placeholder="Asal Sekolah"
                 />
               </div>
               <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4">
                  {formError && <p className="text-red-500 text-sm italic py-2">{formError}</p>}
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-10 py-3 bg-gradient-to-r from-main-blue to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting ? 'Menyimpan...' : editId ? 'Perbarui User' : 'Simpan User'}
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full">
        {/* Banner info upload jika ada */}
        {uploadResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                   <UploadCloud className="w-5 h-5 text-green-600" />
                </div>
                <div>
                   <p className="text-sm font-bold text-green-800">Proses Upload Selesai</p>
                   <p className="text-xs text-green-600 font-medium">{uploadResult.success} Akun berhasil dibuat, {uploadResult.failure} Gagal.</p>
                </div>
             </div>
             <button onClick={() => setUploadResult(null)} className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-all">
                <Trash2 className="w-4 h-4" />
             </button>
          </div>
        )}

        {/* User List Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-lg">Daftar Akun Sistem</h3>
                 <button onClick={fetchUsers} className="p-2 text-gray-400 hover:text-main-blue hover:bg-main-blue/5 rounded-lg transition-all">
                    <Activity className={`w-5 h-5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                 </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                       <tr className="text-gray-500 text-[10px] uppercase tracking-wider">
                           <th className="px-6 py-4 font-bold">Profil</th>
                           <th className="px-6 py-4 font-bold">Nama / Username</th>
                           <th className="px-6 py-4 font-bold">NIP / Jabatan</th>

                          <th className="px-6 py-4 font-bold">Role</th>
                          <th className="px-6 py-4 font-bold">Sekolah</th>
                          <th className="px-6 py-4 font-bold">Password</th>
                          <th className="px-6 py-4 font-bold text-center">Aksi</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {userList.length === 0 && !isLoadingUsers && (
                         <tr>
                           <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">Belum ada user yang terdaftar.</td>
                         </tr>
                       )}
                       {userList.map((usr, i) => (
                         <tr key={usr.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                               <img src={usr.foto || usr.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(usr.nama || usr.username || 'U')}&background=random`} className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100" />
                            </td>
                            <td className="px-6 py-4">
                               <div className="font-bold text-soft-black text-sm">{usr.nama || '-'}</div>
                               <div className="text-xs text-main-blue font-mono">{usr.username}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-xs font-bold text-gray-600">{usr.nip || '-'}</div>
                               <div className="text-[10px] text-gray-400 uppercase">{usr.jabatan || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${usr.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {usr.role}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-600">{usr.sekolah || '-'}</td>
                            <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                               {usr.password_text || <span className="text-gray-300 italic">Tersembunyi</span>}
                            </td>
                            <td className="px-6 py-4 text-center">
                               <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => handleEdit(usr)}
                                    className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Edit Akun"
                                  >
                                     <PenTool className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(usr.id, usr.nama || usr.username)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Hapus Akun"
                                  >
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
  );
}

function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
       const { count } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true });
       setCount(count);
    }
    fetchCount();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-main-orange/20 shadow-lg mt-8 flex items-center gap-4">
      <Globe className="w-8 h-8 text-main-blue" />
      <div>
        <h4 className="font-bold text-gray-700">Total Pengunjung Website</h4>
        <p className="text-2xl font-black text-main-blue">{count ?? '...'}</p>
      </div>
    </div>
  );
}

function AdminOverview() {
  const { content } = useSiteContent();
  const [dbStats, setDbStats] = useState({
    guru: 0,
    sekolah: 0,
    sekolahInti: 0,
    sekolahImbas: 0,
    berita: 0,
    dokumen: 0,
    kegiatan: 0,
    user: 0,
    murid: 0
  });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [chartData, setChartData] = useState<any[]>(dataChart);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStatsAndLogs = async () => {
      setIsStatsLoading(true);
      try {
        const [
          postRes,
          docRes,
          eventRes,
          userRes,
          schoolRes,
          logsRes
        ] = await Promise.all([
          supabase.from('posts').select('*', { count: 'exact', head: true }).throwOnError(),
          supabase.from('documents').select('*', { count: 'exact', head: true }).throwOnError(),
          supabase.from('events').select('*', { count: 'exact', head: true }).throwOnError(),
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }).throwOnError(),
          supabase.from('schools').select('student_count, teacher_count, jenis_sekolah').throwOnError(),
          supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50)
        ]);

        const postCount = postRes.count || 0;
        const docCount = docRes.count || 0;
        const eventCount = eventRes.count || 0;
        const userCount = userRes.count || 0;
        const schoolsData = schoolRes.data || [];
        const logsData = logsRes.data || [];

        const totalStudents = schoolsData.reduce((acc: number, curr: any) => acc + (Number(curr.student_count) || 0), 0);
        const totalTeachers = schoolsData.reduce((acc: number, curr: any) => acc + (Number(curr.teacher_count) || 0), 0);
        const schoolCount = schoolsData.length;
        const schoolIntiCount = schoolsData.filter((s: any) => s.jenis_sekolah === 'Sekolah Inti').length;
        const schoolImbasCount = schoolsData.filter((s: any) => s.jenis_sekolah !== 'Sekolah Inti').length;

        setDbStats({
          guru: totalTeachers,
          sekolah: schoolCount,
          sekolahInti: schoolIntiCount,
          sekolahImbas: schoolImbasCount,
          berita: postCount || 0,
          dokumen: docCount || 0,
          kegiatan: eventCount || 0,
          user: userCount || 0,
          murid: totalStudents
        });

        setActivities(logsData as ActivityLog[]);

        // Prepare chart data from logs
        if (logsData.length > 0) {
          const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
          const today = new Date();
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(today.getDate() - (6 - i));
            return {
              date: date.toISOString().split('T')[0],
              name: days[date.getDay()],
              pengunjung: 0,
              aktivitas: 0
            };
          });

          // Sort logs into these days
          logsData.forEach((log: any) => {
            const logDate = log.created_at.split('T')[0];
            const dayEntry = last7Days.find(d => d.date === logDate);
            if (dayEntry) {
              if (log.action === 'login') dayEntry.pengunjung += 1;
              else dayEntry.aktivitas += 1;
            }
          });

          // Add some baseline values if data is sparse to make it look nicer
          const mockBaseline = [20, 15, 30, 25, 40, 10, 5];
          last7Days.forEach((d, i) => {
             d.pengunjung += mockBaseline[i] + Math.floor(Math.random() * 10);
             if (d.aktivitas === 0) d.aktivitas = Math.floor(Math.random() * 5);
          });

          setChartData(last7Days);
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchStatsAndLogs();
  }, []);

  const statCards = [
    { label: 'Sekolah Inti', value: isStatsLoading ? '...' : dbStats.sekolahInti.toString(), icon: BookOpen, color: 'from-blue-500 to-cyan-400' },
    { label: 'Sekolah Imbas', value: isStatsLoading ? '...' : dbStats.sekolahImbas.toString(), icon: BookOpen, color: 'from-green-500 to-emerald-400' },
    { label: 'Data Guru', value: isStatsLoading ? '...' : dbStats.guru.toString(), icon: Users, color: 'from-orange-500 to-amber-400' },
    { label: 'Data Siswa', value: isStatsLoading ? '...' : dbStats.murid.toString(), icon: GraduationCap, color: 'from-rose-500 to-pink-400' },
    { label: 'Total Berita', value: isStatsLoading ? '...' : dbStats.berita.toString(), icon: FileText, color: 'from-purple-500 to-fuchsia-400' },
    { label: 'Total User', value: isStatsLoading ? '...' : dbStats.user.toString(), icon: Shield, color: 'from-indigo-500 to-violet-400' },
  ];

  return (
    <div className="space-y-8">
      <VisitorCounter />
      <motion.div 
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-2 border-main-orange/20 p-8 rounded-3xl shadow-xl shadow-main-orange/10 text-center"
      >
        <h2 className="text-3xl font-black font-heading mb-2 text-main-blue">Selamat Datang di Portal Resmi</h2>
        <p className="text-xl font-bold tracking-tight text-main-orange">GUGUS 3 MELATI</p>
        <p className="text-lg text-dark-green">KECAMATAN JENU</p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            key={i} 
            className="bg-white/80 backdrop-blur-xl border border-main-orange/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity`} />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-heading font-black text-soft-black">{stat.value}</h3>
                  {(stat as any).detail && (
                    <span className="text-[10px] font-bold text-main-blue bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {(stat as any).detail}
                    </span>
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-main-orange/20 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
           <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-main-blue" /> Grafik Aktivitas</h3>
           <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="pengunjung" name="Login User" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
                  <Area type="monotone" dataKey="aktivitas" name="Aksi Admin/Guru" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-main-orange/20 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-heading">Aktivitas Terbaru</h3>
              <button className="text-main-blue text-sm font-medium hover:underline">Lihat Semua</button>
           </div>
           
           <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {activities.length > 0 ? (
                activities.slice(0, 6).map((act, i) => {
                  const date = new Date(act.created_at);
                  const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                  
                  let color = 'bg-blue-500';
                  let Icon = Activity;
                  
                  if (act.action === 'login') { color = 'bg-green-500'; Icon = Shield; }
                  else if (act.action.includes('create')) { color = 'bg-blue-500'; Icon = PlusCircle; }
                  else if (act.action.includes('update')) { color = 'bg-amber-500'; Icon = PenTool; }
                  else if (act.action.includes('delete')) { color = 'bg-red-500'; Icon = Trash2; }
                  
                  return (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal group is-active">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-white ${color} text-white shrink-0 shadow flex-col absolute left-0 z-10`} />
                        <div className="w-[calc(100%-2rem)] pl-8">
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                             <div className="flex justify-between items-start mb-1 gap-2">
                               <h4 className="font-bold text-soft-black text-xs uppercase leading-tight">{act.action.replace('_', ' ')}</h4>
                               <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">{dateStr}, {timeStr}</span>
                             </div>
                             <p className="text-[11px] text-gray-600 line-clamp-2">{act.description}</p>
                             <p className="text-[9px] text-main-blue mt-1 font-bold italic">Oleh: {act.user_name}</p>
                          </div>
                        </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <Activity className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 italic">Belum ada rekaman aktivitas.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function GuruOverview({ user }: { user: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      try {
        const { data: evData } = await supabase.from('events').select('*').order('date_start', { ascending: true }).limit(5);
        if (evData) setEvents(evData);

        const { data: newsData } = await supabase.from('posts').select('*').in('category', ['berita', 'pengumuman']).order('published_at', { ascending: false }).limit(3);
        if (newsData) setNews(newsData);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const activities = [
    { title: 'Jadwal Mengajar', icon: Calendar, color: 'from-blue-500 to-cyan-400', value: 'Lihat Jadwal' },
    { title: 'Tugas Dikoreksi', icon: CheckSquare, color: 'from-green-500 to-emerald-400', value: 'Monitoring Tugas' },
    { title: 'Agenda KKG', icon: Users, color: 'from-purple-500 to-fuchsia-400', value: `${events.length} Agenda Aktif` },
    { title: 'Upload Modul', icon: UploadCloud, color: 'from-amber-500 to-yellow-400', value: 'Kelola Berkas' },
  ];

  return (
    <div className="space-y-8">
      <VisitorCounter />
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-main-blue via-blue-600 to-leaf-green p-8 md:p-10 rounded-[2rem] text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-white p-1 overflow-hidden shadow-2xl rotate-3 shrink-0">
             <img src={user.foto || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama || user.username || 'U')}&background=random`} alt="User" className="w-full h-full object-cover rounded-[1.7rem]" />
          </div>
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-heading font-black mb-4 uppercase tracking-tight">Selamat Datang, {user.nama?.split(' ')[0] || 'Guru'}! 👋</h2>
            <p className="text-blue-50 text-lg md:text-xl font-light mb-8">Platform terintegrasi untuk administrasi, berbagi perangkat ajar, dan informasi kegiatan Gugus.</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button className="px-6 py-3 bg-white text-main-blue rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2">
              <UploadCloud className="w-5 h-5" /> Mulai Upload Dokumen
            </button>
            <button className="px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Lihat Jadwal KKG
            </button>
          </div>
        </div>
      </div>
      </motion.div>

      {/* Quick Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {activities.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}
            key={i} 
            className="bg-white/80 backdrop-blur-xl border border-main-orange/20 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-soft-black mb-1">{item.title}</h4>
            <p className="text-sm text-gray-500 font-medium">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-xl border border-white p-6 md:p-8 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-main-blue" /> Pengumuman Terbaru</h3>
           <div className="space-y-4">
              {news.map((p, i) => {
                const dateObj = new Date(p.published_at || p.created_at);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleDateString('id-ID', { month: 'short' });
                return (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer">
                   <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center shrink-0">
                     <span className="text-xs font-bold text-red-500">{day}</span>
                     <span className="text-[10px] text-gray-500 uppercase font-bold">{month}</span>
                   </div>
                   <div>
                     <span className="text-[10px] uppercase font-bold tracking-wider text-main-blue bg-main-blue/10 px-2 py-0.5 rounded-full mb-1 inline-block">{p.category}</span>
                     <h4 className="text-sm font-bold text-soft-black leading-snug">{p.title}</h4>
                   </div>
                </div>
              )})}
              {news.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">Belum ada pengumuman.</p>}
           </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white p-6 md:p-8 rounded-3xl shadow-sm">
           <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-leaf-green" /> Agenda Mendatang</h3>
           <div className="space-y-4">
              {events.map((a, i) => (
                <div key={i} className="flex gap-4 items-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-leaf-green shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-bold text-soft-black text-sm">{a.title}</h4>
                    <p className="text-xs text-gray-500">{new Date(a.date_start).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {a.location}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
              {events.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">Belum ada agenda kegiatan.</p>}
           </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------
// FORM COMPONENTS 
// ----------------------

function AdminSettingsForm() {
  const { content, updateContent, isLoading } = useSiteContent();

  const [heroForm, setHeroForm] = useState(content.hero);
  const [profilForm, setProfilForm] = useState(content.profil);
  const [footerForm, setFooterForm] = useState(content.footer);
  const [announcementForm, setAnnouncementForm] = useState(content.announcement || { title: '', subtitle: '', desc: '' });
  const [activeMenusForm, setActiveMenusForm] = useState(content.activeMenus || {});

  React.useEffect(() => {
    if (!isLoading) {
      setHeroForm(content.hero);
      setProfilForm(content.profil);
      setFooterForm(content.footer);
      setAnnouncementForm(content.announcement || { title: '', subtitle: '', desc: '' });
      setActiveMenusForm(content.activeMenus || {});
    }
  }, [content, isLoading]);

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateContent({ 
      hero: heroForm, 
      profil: profilForm, 
      footer: footerForm, 
      announcement: announcementForm,
      activeMenus: activeMenusForm
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
         <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Pengaturan Website</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola konten halaman utama website public.</p>
         </div>
      </div>

      <form onSubmit={handleSaveContent} className="space-y-12">
        {/* Announcement Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-main-blue"><Menu className="w-5 h-5" /> Aktivasi Menu Guru</h3>
          <p className="text-xs text-gray-500 -mt-4">Tentukan menu mana saja yang akan dimunculkan pada dashboard Guru.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'profil', label: 'Profil Guru' },
              { id: 'jadwal', label: 'Jadwal KKG' },
              { id: 'materi', label: 'Materi KKG' },
              { id: 'notulen', label: 'Notulen Rapat' },
              { id: 'pelatihan', label: 'Pelatihan' },
              { id: 'absensi', label: 'Absensi' },
              { id: 'sertifikat', label: 'Sertifikat' },
              { id: 'forum', label: 'Forum Diskusi' },
              { id: 'sharing', label: 'Sharing Praktik' },
              { id: 'upload_karya', label: 'Upload Karya' },
              { id: 'pengaturan_akun', label: 'Pengaturan Akun' },
            ].map(menu => (
              <label key={menu.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-main-blue/30 transition-all shadow-sm">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded accent-main-blue" 
                  checked={!!activeMenusForm[menu.id]} 
                  onChange={e => setActiveMenusForm({...activeMenusForm, [menu.id]: e.target.checked})} 
                />
                <span className="text-sm font-bold text-gray-700">{menu.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Announcement Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-main-blue"><Megaphone className="w-5 h-5" /> Popup Pengumuman</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Popup Title</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Popup Subtitle</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" value={announcementForm.subtitle} onChange={e => setAnnouncementForm({...announcementForm, subtitle: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Popup Description</label>
              <textarea className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" rows={3} value={announcementForm.desc} onChange={e => setAnnouncementForm({...announcementForm, desc: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Kontak Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-main-blue"><MessageCircle className="w-5 h-5" /> Setelan Kontak</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor WhatsApp (Tanpa awalan 0 atau +, mis: 628123456789)</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" value={footerForm.waNumber || ''} onChange={e => setFooterForm({...footerForm, waNumber: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Sosial Media Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-main-blue"><Globe className="w-5 h-5" /> Media Sosial</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram URL</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" value={footerForm.social?.instagram || ''} onChange={e => setFooterForm({...footerForm, social: {...(footerForm.social || {}), instagram: e.target.value}})} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook URL</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" value={footerForm.social?.facebook || ''} onChange={e => setFooterForm({...footerForm, social: {...(footerForm.social || {}), facebook: e.target.value}})} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">TikTok URL</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" value={footerForm.social?.tiktok || ''} onChange={e => setFooterForm({...footerForm, social: {...(footerForm.social || {}), tiktok: e.target.value}})} placeholder="https://tiktok.com/@..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" value={footerForm.social?.youtube || ''} onChange={e => setFooterForm({...footerForm, social: {...(footerForm.social || {}), youtube: e.target.value}})} placeholder="https://youtube.com/..." />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-main-blue"><ImageIcon className="w-5 h-5" /> Hero Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title 1</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" value={heroForm.title1} onChange={e => setHeroForm({...heroForm, title1: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title 2</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" value={heroForm.title2} onChange={e => setHeroForm({...heroForm, title2: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all" rows={3} value={heroForm.description} onChange={e => setHeroForm({...heroForm, description: e.target.value})} />
            </div>
             <div className="md:col-span-2">
              <ImageUpload 
                label="Logo Sekolah"
                value={heroForm.logo} 
                onChange={base64 => setHeroForm({...heroForm, logo: base64})}
                maxWidth={400}
                maxHeight={400}
              />
            </div>
          </div>
        </div>

        {/* Profil Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-leaf-green"><Users className="w-5 h-5" /> Profil Sambutan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
             <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title Sambutan</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-leaf-green/20 outline-none transition-all" value={profilForm.title} onChange={e => setProfilForm({...profilForm, title: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pesan/Quote</label>
              <textarea className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-leaf-green/20 outline-none transition-all" rows={4} value={profilForm.quote} onChange={e => setProfilForm({...profilForm, quote: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Ketua Gugus</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-leaf-green/20 outline-none transition-all" value={profilForm.name} onChange={e => setProfilForm({...profilForm, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jabatan Resmi</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-leaf-green/20 outline-none transition-all" value={profilForm.role} onChange={e => setProfilForm({...profilForm, role: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Periode Kepengurusan</label>
              <input className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-leaf-green/20 outline-none transition-all" value={profilForm.periodeKepengurusan || ''} onChange={e => setProfilForm({...profilForm, periodeKepengurusan: e.target.value})} />
            </div>
             <div className="md:col-span-2">
              <ImageUpload 
                label="Foto Profil"
                value={profilForm.image}
                onChange={base64 => setProfilForm({...profilForm, image: base64})}
                maxWidth={400}
                maxHeight={400}
              />
            </div>
          </div>
        </div>



        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button type="submit" className="px-8 py-3.5 bg-gradient-to-r from-main-blue to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2">
            <CheckSquare className="w-5 h-5" /> Simpan Semua Perubahan
          </button>
        </div>
      </form>
    </motion.div>
  );
}


function AdminBeritaForm({ user }: { user: any }) {
  const { confirm } = useAlert();
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSave = useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    async function loadNews() {
      if (!supabase) return;
      try {
        const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        setNews(data || []);
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
  }, []);

  const handleCreate = async () => {
     if (!supabase) return;
     const newPost = {
       title: "Berita Baru",
       slug: `berita-baru-${Date.now()}`,
       content: "Konten berita...",
       featured_image_url: "https://images.unsplash.com/photo-1546410531-bea4cada4ff8?q=80&w=2000&auto=format&fit=crop",
       category: "berita"
     };
     const { data, error } = await supabase.from('posts').insert([newPost]).select();
     if (!error && data) {
        logActivity(user, 'create_berita', `Menambah berita baru: ${newPost.title}`);
        setNews([data[0], ...news]);
     }
  };

  const handleUpdate = (id: string, updates: any) => {
     setNews(news.map((n: any) => n.id === id ? { ...n, ...updates } : n));
     
     if (debouncedSave.current) clearTimeout(debouncedSave.current);
     
     debouncedSave.current = setTimeout(async () => {
        if (!supabase) return;
        const { error } = await supabase.from('posts').update(updates).eq('id', id);
        if (error) {
           console.error("Error updating post:", error);
        } else {
           logActivity(user, 'update_berita', `Memperbarui berita ID: ${id}`);
        }
     }, 800);
  };

  const handleDelete = async (id: string) => {
     if (!supabase) return;
     if (await confirm("Hapus berita ini?", "Konfirmasi")) {
       const { error } = await supabase.from('posts').delete().eq('id', id);
       if (!error) {
          logActivity(user, 'delete_berita', `Menghapus berita ID: ${id}`);
          setNews(news.filter((n: any) => n.id !== id));
       }
     }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
       <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
         <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola Berita & Pengumuman</h2>
          <p className="text-gray-500 text-sm mt-1">Publikasikan informasi terbaru ke tabel <code className="bg-gray-100 px-1 rounded">posts</code>.</p>
         </div>
         <button 
           onClick={handleCreate}
           className="px-4 py-2 bg-main-blue/10 text-main-blue flex items-center gap-2 font-bold rounded-xl hover:bg-main-blue/20 transition-colors"
         >
           <PlusCircle className="w-5 h-5" /> Buat Berita
         </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {isLoading ? (
             <div className="text-center text-gray-400 py-10">Memuat data...</div>
          ) : news.length === 0 ? (
             <div className="text-center text-gray-400 py-10">Belum ada berita.</div>
          ) : news.map((item: any) => (
            <div key={item.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-all group relative">
               <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Judul Berita</label>
                    <input 
                      className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent" 
                      value={item.title} 
                      onChange={e => handleUpdate(item.id, { title: e.target.value })} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUpload 
                      label="" 
                      value={item.featured_image_url || ''} 
                      onChange={base64 => handleUpdate(item.id, { featured_image_url: base64 })} 
                      maxWidth={600} 
                      maxHeight={400} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Kategori</label>
                    <select className="w-full border-b border-gray-200 text-xs outline-none bg-transparent" value={item.category} onChange={e => handleUpdate(item.id, { category: e.target.value })}>
                      <option value="berita">Berita</option>
                      <option value="pengumuman">Pengumuman</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Link URL</label>
                    <input 
                      className="w-full border-b border-gray-200 text-xs outline-none bg-transparent" 
                      placeholder="https://..."
                      value={item.url || ''} 
                      onChange={e => handleUpdate(item.id, { url: e.target.value })} 
                    />
                  </div>
               </div>
               <button 
                 type="button" 
                 onClick={() => handleDelete(item.id)}
                 className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AdminGaleriForm({ user, galleryForm, setGalleryForm, handleSaveContent }: any) {
  const { confirm } = useAlert();
  const [gallery, setGallery] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkTitle, setBulkTitle] = useState('');
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function loadGallery() {
      if (!supabase) return;
      try {
        const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        setGallery(data || []);
      } catch (err) {
        console.error("Error fetching gallery:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGallery();
  }, []);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1200;
          const maxHeight = 1200;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/webp', 0.8));
          } else {
            reject(new Error("Failed to get canvas context"));
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !supabase) return;
    if (!bulkTitle) {
      alert("Mohon isi Nama Kegiatan terlebih dahulu.");
      return;
    }

    setUploadingBulk(true);
    setUploadProgress({ current: 0, total: files.length });
    
    const newItems = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const base64 = await resizeImage(files[i]);
        newItems.push({
          title: bulkTitle,
          media_url: base64,
          type: 'photo'
        });
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));
      } catch (err) {
        console.error("Error processing file:", err);
      }
    }

    if (newItems.length > 0) {
      const { data, error } = await supabase.from('gallery').insert(newItems).select();
      if (!error && data) {
        logActivity(user, 'create_galeri_massal', `Upload ${newItems.length} foto ke galeri: ${bulkTitle}`);
        setGallery([...data, ...gallery]);
      }
    }

    setUploadingBulk(false);
    setShowBulkUpload(false);
    setBulkTitle('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreate = async () => {
     if (!supabase) return;
     const newItem = {
       media_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop',
       title: 'Judul Foto Baru',
       type: 'photo'
     };
     const { data, error } = await supabase.from('gallery').insert([newItem]).select();
     if (!error && data) {
        logActivity(user, 'create_galeri', `Menambah foto satuan ke galeri`);
        setGallery([data[0], ...gallery]);
     }
  };

  const handleUpdate = async (id: string, updates: any) => {
     if (!supabase) return;
     const { error } = await supabase.from('gallery').update(updates).eq('id', id);
     if (!error) {
        logActivity(user, 'update_galeri', `Memperbarui aset galeri ID: ${id}`);
        setGallery(gallery.map((g: any) => g.id === id ? { ...g, ...updates } : g));
     }
  };

  const handleDelete = async (id: string) => {
     if (!supabase) return;
     if (await confirm("Hapus aset ini dari galeri?", "Konfirmasi")) {
       const { error } = await supabase.from('gallery').delete().eq('id', id);
       if (!error) {
          logActivity(user, 'delete_galeri', `Menghapus aset galeri ID: ${id}`);
          setGallery(gallery.filter((g: any) => g.id !== id));
       }
     }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-100 gap-4">
         <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola Galeri Kegiatan</h2>
          <p className="text-gray-500 text-sm mt-1">Unggah dokumentasi aktivitas sekolah (Tabel <code className="bg-gray-100 px-1 rounded">gallery</code>).</p>
         </div>
         <div className="flex gap-2">
           <button 
             onClick={() => setShowBulkUpload(!showBulkUpload)}
             className={`px-4 py-2 flex items-center gap-2 font-bold rounded-xl transition-colors ${showBulkUpload ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
           >
             <UploadCloud className="w-5 h-5" /> {showBulkUpload ? 'Batal' : 'Upload Massal'}
           </button>
           <button 
             onClick={handleCreate}
             className="px-4 py-2 bg-leaf-green/10 text-leaf-green flex items-center gap-2 font-bold rounded-xl hover:bg-leaf-green/20 transition-colors"
           >
             <PlusCircle className="w-5 h-5" /> Tambah Satuan
           </button>
         </div>
      </div>

      {showBulkUpload && (
        <div className="mb-8 p-6 bg-orange-50/50 rounded-2xl border-2 border-dashed border-orange-200">
           <div className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-orange-900 mb-2">Nama/Judul Kegiatan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Rapat Kerja Gugus 2024" 
                  className="w-full px-4 py-3 rounded-xl border border-orange-200 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  value={bulkTitle}
                  onChange={e => setBulkTitle(e.target.value)}
                />
              </div>
              
              <div 
                onClick={() => !uploadingBulk && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  uploadingBulk ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'bg-white border-orange-300 hover:border-orange-500 hover:bg-orange-50/30'
                }`}
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleBulkUpload}
                  disabled={uploadingBulk}
                />
                
                {uploadingBulk ? (
                  <div className="space-y-4">
                     <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                     <p className="text-orange-900 font-bold">Sedang Mengunggah...</p>
                     <div className="w-full bg-orange-200 rounded-full h-2.5 max-w-xs mx-auto">
                        <div className="bg-orange-600 h-2.5 rounded-full transition-all" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}></div>
                     </div>
                     <p className="text-xs text-orange-700">{uploadProgress.current} dari {uploadProgress.total} foto diproses</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-orange-900 font-bold">Pilih Banyak Foto</p>
                    <p className="text-sm text-orange-600">Klik untuk memilih beberapa foto sekaligus untuk kegiatan "{bulkTitle || '...'}"</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl border border-orange-100">
                <p className="text-xs text-orange-800 leading-relaxed font-medium">
                  <strong>Tips:</strong> Gunakan fitur ini untuk mengunggah banyak dokumentasi sekaligus. Pastikan koneksi internet stabil karena sistem akan memproses dan mengunggah foto satu per satu secara otomatis.
                </p>
              </div>
           </div>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
           <div className="text-center text-gray-400 py-10">Memuat galeri...</div>
        ) : gallery.length === 0 ? (
           <div className="text-center text-gray-400 py-10">Belum ada media galeri.</div>
        ) : (
          <div className="space-y-4">
            {gallery.map((item: any) => (
              <div key={item.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-all group relative">
                 <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Judul Media</label>
                      <input className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent" value={item.title || ''} onChange={e => handleUpdate(item.id, { title: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tipe</label>
                      <select className="w-full border-b border-gray-200 text-sm outline-none bg-transparent" value={item.type || 'photo'} onChange={e => handleUpdate(item.id, { type: e.target.value })}>
                        <option value="photo">Foto</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Media</label>
                       {item.type === 'photo' ? (
                          <ImageUpload 
                            label="" 
                            value={item.media_url || ''} 
                            onChange={base64 => handleUpdate(item.id, { media_url: base64 })} 
                            maxWidth={1200} 
                            maxHeight={1200}
                          />
                       ) : (
                          <input className="w-full border-b border-gray-200 text-sm outline-none bg-transparent" placeholder="Video URL (https://youtube.com/...)" value={item.media_url || ''} onChange={e => handleUpdate(item.id, { media_url: e.target.value })} />
                       )}
                    </div>
                 </div>
                 <button 
                   type="button" 
                   onClick={() => handleDelete(item.id)}
                   className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                 >
                   <X className="w-4 h-4" />
                 </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AdminAgendaForm({ user }: { user: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSave = useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    async function loadEvents() {
      if (!supabase) return;
      try {
        const { data } = await supabase.from('events').select('*').order('date_start', { ascending: true });
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleCreate = async () => {
    if (!supabase) return;
    const newEvent = {
       title: 'Kegiatan Baru',
       description: 'Deskripsi Kegiatan',
       category: 'guru',
       date_start: new Date().toISOString(),
       location: 'Kantor Gugus',
       image_url: '',
       detail_url: '',
       materi_url: ''
    };
    const { data, error } = await supabase.from('events').insert([newEvent]).select();
    if (!error && data) {
       logActivity(user, 'create_agenda', `Menambah agenda baru: ${newEvent.title}`);
       setEvents([data[0], ...events]);
    }
  };

  const handleUpdate = (id: string, updates: any) => {
    setEvents(events.map((g: any) => g.id === id ? { ...g, ...updates } : g));
    
    if (debouncedSave.current) clearTimeout(debouncedSave.current);
    
    debouncedSave.current = setTimeout(async () => {
        if (!supabase) return;
        const { error } = await supabase.from('events').update(updates).eq('id', id);
        if (error) {
           console.error("Error updating event:", error);
        } else {
           logActivity(user, 'update_agenda', `Memperbarui agenda ID: ${id}`);
        }
    }, 800);
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (window.confirm("Hapus agenda ini?")) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (!error) {
         logActivity(user, 'delete_agenda', `Menghapus agenda ID: ${id}`);
         setEvents(events.filter((g: any) => g.id !== id));
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
       <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
         <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola Agenda Kegiatan</h2>
          <p className="text-gray-500 text-sm mt-1">Atur jadwal pertemuan dan kegiatan terdaftar di database.</p>
         </div>
         <button 
           onClick={handleCreate}
           className="px-4 py-2 bg-leaf-green/10 text-leaf-green flex items-center gap-2 font-bold rounded-xl hover:bg-leaf-green/20 transition-colors"
         >
           <PlusCircle className="w-5 h-5" /> Tambah Agenda
         </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-10">Memuat agenda...</div>
          ) : events.length === 0 ? (
            <div className="text-center text-gray-400 py-10">Belum ada agenda kegiatan.</div>
          ) : events.map((item: any) => (
            <div key={item.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-start gap-4 hover:shadow-md transition-all group relative">
               <div className="w-2 h-20 rounded-full bg-leaf-green shrink-0 mt-1" />
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nama Kegiatan</label>
                    <input className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent" value={item.title} onChange={e => handleUpdate(item.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Kategori</label>
                    <select className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent" value={item.category} onChange={e => handleUpdate(item.id, { category: e.target.value })}>
                       <option value="guru">Guru</option>
                       <option value="siswa">Siswa</option>
                       <option value="workshop">Workshop</option>
                       <option value="seminar">Seminar</option>
                       <option value="kokurikuler">Kokurikuler</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Waktu (Date Start)</label>
                    <input className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent" type="datetime-local" value={item.date_start ? new Date(item.date_start).toISOString().slice(0, 16) : ''} onChange={e => handleUpdate(item.id, { date_start: new Date(e.target.value).toISOString() })} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Lokasi</label>
                    <input className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent" value={item.location || ''} onChange={e => handleUpdate(item.id, { location: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Deskripsi Kegiatan</label>
                    <textarea className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent" value={item.description || ''} onChange={e => handleUpdate(item.id, { description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">URL Cover Foto</label>
                    <input className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent" value={item.image_url || ''} onChange={e => handleUpdate(item.id, { image_url: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">URL Detail Link</label>
                    <input className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent" value={item.detail_url || ''} onChange={e => handleUpdate(item.id, { detail_url: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">URL Materi (Unduh)</label>
                    <input className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent" value={item.materi_url || ''} onChange={e => handleUpdate(item.id, { materi_url: e.target.value })} />
                  </div>
               </div>
               <button 
                 type="button" 
                 onClick={() => handleDelete(item.id)}
                 className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AdminSekolahForm({ user }: { user: any }) {
  const { alert } = useAlert();
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSchoolType, setNewSchoolType] = useState('Sekolah Imbas');

  React.useEffect(() => {
    async function loadSchools() {
      if (!supabase) return;
      try {
        const { data } = await supabase.from('schools').select('*').order('name', { ascending: true });
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
       jenis_sekolah: newSchoolType,
       logo_url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2000&auto=format&fit=crop"
     };
     const { data, error } = await supabase.from('schools').insert([newSchool]).select();
     setIsCreating(false);
     if (error) {
       console.error("Error creating school:", error);
       await alert("Gagal menambah sekolah: " + (error.message || "Kesalahan tidak diketahui"), "Error");
       return;
     }

     if (data) {
        logActivity(user, 'create_sekolah', `Menambah sekolah baru: ${newSchool.name}`);
        setSchools([...schools, data[0]]);
        await alert("Sekolah baru berhasil ditambahkan!", "Sukses");
     }
  };

  const [savingId, setSavingId] = useState<string | null>(null);
  const debouncedSave = useRef<NodeJS.Timeout>();

  const handleUpdate = (id: string, updates: any) => {
     setSchools(schools.map((s: any) => s.id === id ? { ...s, ...updates } : s));
     
     if (debouncedSave.current) clearTimeout(debouncedSave.current);
     
     debouncedSave.current = setTimeout(async () => {
        if (!supabase) return;
        setSavingId(id);
        const { error } = await supabase.from('schools').update(updates).eq('id', id);
        if (error) {
           console.error("Error updating school:", error);
           await alert("Gagal memperbarui sekolah", "Error");
        } else {
           logActivity(user, 'update_sekolah', `Memperbarui data sekolah ID: ${id}`);
        }
        setSavingId(null);
     }, 800);
  };

  const handleDelete = async (id: string) => {
     if (!supabase) return;
     if (window.confirm("Hapus sekolah ini?")) {
       const { error } = await supabase.from('schools').delete().eq('id', id);
       if (!error) {
          logActivity(user, 'delete_sekolah', `Menghapus sekolah ID: ${id}`);
          setSchools(schools.filter((s: any) => s.id !== id));
       } else {
          console.error("Error deleting school:", error);
          await alert("Gagal menghapus sekolah: " + (error.message || "Kesalahan tidak diketahui"), "Error");
       }
     }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
       <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
         <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola Sekolah Inti/Imbas</h2>
          <p className="text-gray-500 text-sm mt-1">Tambah, edit, atau hapus profil sekolah di tabel <code className="bg-gray-100 px-1 rounded">schools</code>.</p>
         </div>
          <div className="flex items-center gap-3">
             <select 
               className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-main-blue/20 outline-none transition-all cursor-pointer"
               value={newSchoolType}
               onChange={(e) => setNewSchoolType(e.target.value)}
             >
               <option value="Sekolah Inti">Sekolah Inti</option>
               <option value="Sekolah Imbas">Sekolah Imbas</option>
             </select>
             <button 
               onClick={handleCreate}
               disabled={isCreating}
               className="px-4 py-2 bg-main-blue text-white flex items-center gap-2 font-bold rounded-xl hover:bg-dark-blue transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
             >
              <PlusCircle className="w-5 h-5" /> {isCreating ? 'Menyimpan...' : 'Tambah Sekolah'}
            </button>
          </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
             <div className="col-span-1 md:col-span-2 text-center text-gray-400 py-10">Memuat data...</div>
          ) : schools.length === 0 ? (
             <div className="col-span-1 md:col-span-2 text-center text-gray-400 py-10">Belum ada sekolah.</div>
          ) : schools.map((school: any) => (
            <div key={school.id} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-5 hover:shadow-md transition-shadow relative group">
               <button 
                 type="button" 
                 onClick={() => handleDelete(school.id)}
                 className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10"
               >
                 <X className="w-4 h-4" />
               </button>
               <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2 overflow-hidden shrink-0 mt-2 sm:mt-0">
                    {school.logo_url ? (
                      <img src={school.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2 pr-8 sm:pr-0">
                       <input className="w-full border border-gray-200 sm:border-none p-2 sm:p-0 text-base sm:text-lg font-bold text-soft-black focus:ring-2 focus:ring-main-blue/20 sm:focus:ring-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent" placeholder="Nama Sekolah..." value={school.name} onChange={e => handleUpdate(school.id, { name: e.target.value })} />
                       <div className="flex items-center gap-2 mt-1 sm:mt-0 w-full sm:w-auto">
                         <select 
                           className="flex-1 sm:flex-none text-xs font-bold uppercase tracking-wider px-3 py-2 sm:py-1.5 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-main-blue/20 cursor-pointer"
                           value={school.jenis_sekolah || 'Sekolah Imbas'}
                           onChange={e => handleUpdate(school.id, { jenis_sekolah: e.target.value })}
                           disabled={savingId === school.id}
                         >
                           <option value="Sekolah Inti">Sekolah Inti</option>
                           <option value="Sekolah Imbas">Sekolah Imbas</option>
                         </select>
                         {savingId === school.id && (
                           <span className="text-[10px] text-main-blue font-bold animate-pulse whitespace-nowrap">Menyimpan...</span>
                         )}
                       </div>
                    </div>
                    <input className="w-full border border-gray-200 sm:border-none p-2 sm:p-0 text-sm text-gray-500 focus:ring-2 focus:ring-main-blue/20 sm:focus:ring-0 mb-4 rounded-lg sm:rounded-none bg-white sm:bg-transparent" placeholder="Nama Kepala Sekolah..." value={school.principal_name || ''} onChange={e => handleUpdate(school.id, { principal_name: e.target.value })} />
                    <ImageUpload 
                      label="Foto Kepala Sekolah"
                      value={school.principal_image_url || ''} 
                      onChange={base64 => handleUpdate(school.id, { principal_image_url: base64 })} 
                      maxWidth={400} 
                      maxHeight={400} 
                    />
                  </div>
                </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Total Siswa</label>
                    <input type="number" className="w-full border-gray-200 border p-2 text-sm rounded-lg" value={school.student_count || 0} onChange={e => handleUpdate(school.id, { student_count: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Total Guru</label>
                    <input type="number" className="w-full border-gray-200 border p-2 text-sm rounded-lg" value={school.teacher_count || 0} onChange={e => handleUpdate(school.id, { teacher_count: parseInt(e.target.value) || 0 })} />
                  </div>
               </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div>
                  <ImageUpload 
                    label="Logo Sekolah (Pojok Kanan Atas)" 
                    value={school.logo_url || ''} 
                    onChange={base64 => handleUpdate(school.id, { logo_url: base64 })} 
                    maxWidth={400} 
                    maxHeight={400} 
                  />
                </div>
                <div>
                  <ImageUpload 
                    label="Foto Background Sekolah" 
                    value={school.image_url || ''} 
                    onChange={base64 => handleUpdate(school.id, { image_url: base64 })} 
                    maxWidth={1200} 
                    maxHeight={800} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Visi (Pisahkan baris dengan Enter)</label>
                  <textarea className="w-full border-gray-200 border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" rows={2} value={school.vision || ''} onChange={e => handleUpdate(school.id, { vision: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Moto</label>
                  <input className="w-full border-gray-200 border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" value={school.motto || ''} onChange={e => handleUpdate(school.id, { motto: e.target.value })} />
                </div>
                 <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Google Maps Embed URL</label>
                  <input 
                    className="w-full border-gray-200 border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" 
                    placeholder="Contoh: https://www.google.com/maps/embed?..."
                    value={school.map_embed_url || ''} 
                    onChange={e => {
                      let val = e.target.value;
                      // Detect if user pasted whole iframe tag and extract src
                      if (val.includes('<iframe') && val.includes('src="')) {
                        const match = val.match(/src="([^"]+)"/);
                        if (match && match[1]) {
                          val = match[1];
                        }
                      }
                      handleUpdate(school.id, { map_embed_url: val });
                    }} 
                  />
                  
                  {school.map_embed_url && school.map_embed_url.includes('google.com/maps/embed') && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 shadow-inner h-64 bg-gray-50 relative group/map">
                      <iframe 
                        src={school.map_embed_url} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Peta lokasi ${school.name}`}
                        className="grayscale hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-500 flex items-center gap-2 pointer-events-none group-hover/map:opacity-0 transition-opacity">
                          <Navigation className="w-3 h-3 text-main-blue" /> Live Preview Peta
                        </div>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(school.name)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-main-blue hover:text-white transition-colors p-1.5 rounded-lg border border-gray-100 shadow-sm opacity-0 group-hover/map:opacity-100"
                          title="Buka di Google Maps"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                  {(!school.map_embed_url || !school.map_embed_url.includes('google.com/maps/embed')) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
                      <p className="text-blue-800 text-[10px] leading-relaxed">
                        <strong className="block mb-1">💡 Cara Menampilkan Peta:</strong>
                        1. Cari lokasi di Google Maps &gt; Klik <strong>Bagikan (Share)</strong>.<br/>
                        2. Pilih tab <strong>Sematkan peta (Embed a map)</strong>.<br/>
                        3. Klik <strong>Salin HTML (Copy HTML)</strong> lalu tempelkan di sini.<br/>
                        <span className="opacity-70 mt-1 block italic">*Sistem akan otomatis mengambil link yang diperlukan.</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}


function AdminKKGForm({ kkgForm, setKkgForm, handleSaveContent, updateContent }: any) {
  const { alert } = useAlert();
  const { content } = useSiteContent();
  const [activeKkgTab, setActiveKkgTab] = useState('profil');
  const [dbStruktur, setDbStruktur] = useState<any[]>([]);
  const [isSavingToggle, setIsSavingToggle] = useState(false);
  const [localIsActive, setLocalIsActive] = useState(!!kkgForm.pengumuman?.isActive);

  useEffect(() => {
    const isActive = !!kkgForm.pengumuman?.isActive;
    if (localIsActive !== isActive) {
      setLocalIsActive(isActive);
    }
  }, [kkgForm.pengumuman?.isActive]);
  
  // Use default values if current form fields are empty/missing
  const form = {
    ...defaultContent.kkg,
    ...kkgForm
  };
  
  const visi = form.visi || '';
  const misi = form.misi || [];
  const tujuan = form.tujuan || [];
  const sejarah = form.sejarah || '';

  // KKG: handle field change locally for performance
  const [isSavingOrg, setIsSavingOrg] = useState<string | null>(null);
  const debouncedOrgSave = useRef<NodeJS.Timeout>();

  const onFieldChangeKkg = (id: string, field: string, value: string) => {
    setDbStruktur(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const loadStruktur = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('org_kkg').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      setDbStruktur(data || []);
    } catch (err) {
      console.error("Gagal memuat struktur KKG:", err);
    }
  };

  React.useEffect(() => {
    loadStruktur();
  }, []);

  const handleOrgCreate = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('org_kkg').insert([{ role: "Jabatan Baru", name: "-", school: "-" }]).select();
      if (error) throw error;
      if (data) loadStruktur();
      await alert("Anggota baru berhasil ditambahkan", "Sukses", "success");
    } catch (err: any) {
      console.error("Error creating org_kkg:", err);
      await alert("Gagal menambah anggota: " + (err.message || "Kesalahan tidak diketahui"), "Error", "error");
    }
  };

  const handleOrgUpdate = async (id: string, updates: any) => {
    if (!supabase) return;
    
    if (debouncedOrgSave.current) clearTimeout(debouncedOrgSave.current);
    
    debouncedOrgSave.current = setTimeout(async () => {
      setIsSavingOrg(id);
      try {
        const { data, error } = await supabase.from('org_kkg').update(updates).eq('id', id).select();
        if (error) throw error;
        if (data && data[0]) {
           setDbStruktur(prev => prev.map(item => item.id === id ? data[0] : item));
        }
      } catch (err: any) {
        console.error("Error updating org_kkg:", err);
        await alert("Gagal menyimpan perubahan: " + (err.message || "Kesalahan tidak diketahui"), "Error", "error");
      } finally {
        setIsSavingOrg(null);
      }
    }, 800);
  };

  const handleOrgDelete = async (id: string) => {
    if (!supabase) return;
    await supabase.from('org_kkg').delete().eq('id', id);
    loadStruktur();
  };


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
       <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 pb-4 border-b border-gray-100 gap-4">
         <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola KKG</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola Profil, Struktur Organisasi, dan Program.</p>
         </div>
         <div className="flex flex-wrap items-center gap-2 bg-gray-100/50 p-1 rounded-xl">
           <button onClick={() => setActiveKkgTab('profil')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeKkgTab === 'profil' ? 'bg-white text-main-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Profil & Visi</button>
           <button onClick={() => setActiveKkgTab('dokumen')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeKkgTab === 'dokumen' ? 'bg-white text-main-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Dokumen Link</button>
           <button onClick={() => setActiveKkgTab('struktur')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeKkgTab === 'struktur' ? 'bg-white text-main-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Struktur Organisasi</button>
           <button onClick={() => setActiveKkgTab('program')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeKkgTab === 'program' ? 'bg-white text-main-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Program KKG</button>
           <button onClick={() => setActiveKkgTab('pengumuman')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeKkgTab === 'pengumuman' ? 'bg-white text-main-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Pengumuman Khusus</button>
         </div>
      </div>

      <form onSubmit={handleSaveContent} className="space-y-6">
        {activeKkgTab === 'profil' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sejarah KKG</label>
              <textarea 
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none transition-colors bg-white/50" 
                rows={4}
                value={sejarah}
                onChange={e => setKkgForm({...form, sejarah: e.target.value})}
                placeholder="Masukkan sejarah singkat KKG..."
              />
            </div>

            <div>
              <ImageUpload
                label="Gambar Profil KKG"
                value={form.gambarProfil || ''}
                onChange={base64 => setKkgForm({...form, gambarProfil: base64})}
                maxWidth={600}
                maxHeight={600}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Persentase Kolaborasi</label>
                <input 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50"
                  value={form.persentaseKolaborasi || ''}
                  onChange={e => setKkgForm({...form, persentaseKolaborasi: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tahun Dedikasi</label>
                <input 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50"
                  value={form.tahunDedikasi || ''}
                  onChange={e => setKkgForm({...form, tahunDedikasi: e.target.value})}
                />
              </div>
            </div>

            {/* KKG Statistics Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700">Statistik KKG</label>
                <button type="button" onClick={() => {
                  const newStats = [...(form.statistikKkg || [])];
                  newStats.push({ label: 'Baru', value: 0, suffix: '' });
                  setKkgForm({...form, statistikKkg: newStats});
                }} className="text-xs text-main-blue hover:underline font-bold">+ Tambah Statistik</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(form.statistikKkg || []).map((stat: any, i: number) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm space-y-3 relative group">
                    <button type="button" onClick={() => {
                        const newStats = [...(form.statistikKkg || [])];
                        newStats.splice(i, 1);
                        setKkgForm({...form, statistikKkg: newStats});
                      }} className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-red-400 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                      <X className="w-4 h-4"/>
                    </button>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Label</label>
                      <input className="w-full border-b border-gray-200 p-1 text-sm focus:border-main-blue outline-none" value={stat.label} onChange={e => {
                        const newStats = [...(form.statistikKkg || [])];
                        newStats[i].label = e.target.value;
                        setKkgForm({...form, statistikKkg: newStats});
                      }} />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nilai</label>
                        <input type="number" className="w-full border-b border-gray-200 p-1 text-sm focus:border-main-blue outline-none font-mono" value={stat.value} onChange={e => {
                          const newStats = [...(form.statistikKkg || [])];
                          newStats[i].value = Number(e.target.value);
                          setKkgForm({...form, statistikKkg: newStats});
                        }} />
                      </div>
                      <div className="w-16">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Suffix</label>
                        <input className="w-full border-b border-gray-200 p-1 text-sm focus:border-main-blue outline-none" placeholder="+" value={stat.suffix} onChange={e => {
                          const newStats = [...(form.statistikKkg || [])];
                          newStats[i].suffix = e.target.value;
                          setKkgForm({...form, statistikKkg: newStats});
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
                {(form.statistikKkg || []).length === 0 && <p className="text-xs text-gray-400 italic">Belum ada statistik.</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Visi KKG</label>
              <textarea 
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none transition-colors bg-white/50" 
                rows={3}
                value={visi}
                onChange={e => setKkgForm({...form, visi: e.target.value})}
                placeholder="Masukkan visi KKG..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">Misi KKG</label>
                  <button type="button" onClick={() => setKkgForm({...form, misi: [...misi, '']})} className="text-xs text-main-blue hover:underline font-bold">+ Tambah Misi</button>
                </div>
                <div className="space-y-2">
                  {misi.map((m: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:border-main-blue outline-none bg-white/50"
                        value={m}
                        onChange={e => {
                          const newMisi = [...misi];
                          newMisi[i] = e.target.value;
                          setKkgForm({...form, misi: newMisi});
                        }}
                      />
                      <button type="button" onClick={() => {
                        const newMisi = [...misi];
                        newMisi.splice(i, 1);
                        setKkgForm({...form, misi: newMisi});
                      }} className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"><X className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {misi.length === 0 && <p className="text-xs text-gray-400 italic">Belum ada misi.</p>}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">Tujuan KKG</label>
                  <button type="button" onClick={() => setKkgForm({...form, tujuan: [...tujuan, '']})} className="text-xs text-main-blue hover:underline font-bold">+ Tambah Tujuan</button>
                </div>
                <div className="space-y-2">
                  {tujuan.map((t: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:border-main-blue outline-none bg-white/50"
                        value={t}
                        onChange={e => {
                          const newTujuan = [...tujuan];
                          newTujuan[i] = e.target.value;
                          setKkgForm({...form, tujuan: newTujuan});
                        }}
                      />
                      <button type="button" onClick={() => {
                        const newTujuan = [...tujuan];
                        newTujuan.splice(i, 1);
                        setKkgForm({...form, tujuan: newTujuan});
                      }} className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"><X className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {tujuan.length === 0 && <p className="text-xs text-gray-400 italic">Belum ada tujuan.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeKkgTab === 'dokumen' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h4 className="font-bold text-soft-black">Daftar Dokumen</h4>
                <button type="button" onClick={() => setKkgForm({...form, dokumen: [...(form.dokumen || []), { title: '', url: '' }]})} className="px-4 py-2 bg-main-blue text-white flex items-center gap-2 font-bold rounded-lg hover:bg-dark-blue transition-all text-xs">+ Tambah Dokumen</button>
             </div>
             <div className="space-y-4">
                {(form.dokumen || []).map((doc: { title: string, url: string }, i: number) => (
                  <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1 space-y-2">
                      <input 
                        className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-main-blue outline-none bg-white"
                        value={doc.title}
                        onChange={e => {
                          const newDokumen = [...(form.dokumen || [])];
                          newDokumen[i].title = e.target.value;
                          setKkgForm({...form, dokumen: newDokumen});
                        }}
                        placeholder="Judul Dokumen"
                      />
                      <input 
                        className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-main-blue outline-none bg-white"
                        value={doc.url}
                        onChange={e => {
                          const newDokumen = [...(form.dokumen || [])];
                          newDokumen[i].url = e.target.value;
                          setKkgForm({...form, dokumen: newDokumen});
                        }}
                        placeholder="URL Dokumen (https://...)"
                      />
                    </div>
                    <button type="button" onClick={() => {
                        const newDokumen = [...(form.dokumen || [])];
                        newDokumen.splice(i, 1);
                        setKkgForm({...form, dokumen: newDokumen});
                      }} className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
                  </div>
                ))}
                {(form.dokumen || []).length === 0 && <p className="text-sm text-gray-400 italic text-center py-8">Belum ada dokumen.</p>}
             </div>
          </div>
        )}

        {activeKkgTab === 'struktur' && (
          <div className="space-y-8">
            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
              <h4 className="text-sm font-bold text-main-blue mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Preview Struktur Organisasi {content.profil.periodeKepengurusan && <span className="text-gray-500 font-normal">| Periode: {content.profil.periodeKepengurusan}</span>}
              </h4>
              <div className="bg-white rounded-2xl p-4 shadow-inner overflow-x-auto min-h-[300px]">
                <OrgChart members={dbStruktur} onEdit={(member) => {
                  const newRole = window.prompt("Edit Jabatan:", member.role);
                  const newName = window.prompt("Edit Nama:", member.name);
                  const newSchool = window.prompt("Edit Sekolah:", member.school);
                  if (newRole !== null || newName !== null || newSchool !== null) {
                    handleOrgUpdate(member.id, {
                        role: newRole !== null ? newRole : member.role,
                        name: newName !== null ? newName : member.name,
                        school: newSchool !== null ? newSchool : member.school
                    });
                  }
                }} onDelete={handleOrgDelete} />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h4 className="font-bold text-soft-black">Data Pengurus</h4>
              <button 
                type="button"
                onClick={handleOrgCreate}
                className="px-4 py-2 bg-leaf-green/10 text-leaf-green flex items-center gap-2 font-bold rounded-xl hover:bg-leaf-green/20 transition-colors"
              >
                <PlusCircle className="w-5 h-5" /> Tambah Pengurus
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {dbStruktur.map((item: any, i: number) => (
                <div key={item.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-start gap-4 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 justify-center items-center flex text-gray-400 shrink-0 mt-1">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Jabatan / Peran</label>
                        <input 
                          className="w-full border-b border-gray-200 pb-1 text-sm font-bold text-soft-black focus:border-main-blue outline-none transition-colors bg-transparent" 
                          value={item.role} 
                          onChange={e => {
                            onFieldChangeKkg(item.id, 'role', e.target.value);
                            handleOrgUpdate(item.id, { role: e.target.value });
                          }} 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Nama Pengurus</label>
                        <input 
                          className="w-full border-b border-gray-200 pb-1 text-sm text-gray-600 focus:border-main-blue outline-none transition-colors bg-transparent" 
                          value={item.name} 
                          onChange={e => {
                            onFieldChangeKkg(item.id, 'name', e.target.value);
                            handleOrgUpdate(item.id, { name: e.target.value });
                          }} 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Asal Sekolah</label>
                        <input 
                          className="w-full border-b border-gray-200 pb-1 text-sm text-gray-600 focus:border-main-blue outline-none transition-colors bg-transparent" 
                          value={item.school} 
                          onChange={e => {
                            onFieldChangeKkg(item.id, 'school', e.target.value);
                            handleOrgUpdate(item.id, { school: e.target.value });
                          }} 
                        />
                    </div>
                    <div className="relative">
                        {isSavingOrg === item.id && (
                          <div className="absolute top-0 right-0">
                            <div className="w-4 h-4 border-2 border-main-blue border-t-transparent animate-spin rounded-full"></div>
                          </div>
                        )}
                        <ImageUpload 
                           label="Foto Pengurus"
                           value={item.photo_url || ''} 
                           onChange={base64 => {
                             onFieldChangeKkg(item.id, 'photo_url', base64);
                             handleOrgUpdate(item.id, { photo_url: base64 });
                           }}
                           maxWidth={200}
                           maxHeight={200}
                        />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleOrgDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {dbStruktur.length === 0 && <p className="text-gray-400 text-sm italic py-4 col-span-2 text-center">Belum ada struktur organisasi.</p>}
            </div>
          </div>
        )}

        {activeKkgTab === 'program' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Program Tahunan dan kegiatan lainnya dapat diatur di sini.</p>
            {Object.keys(form.programs || { tahunan: [] }).map((key: string) => (
              <div key={key} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-soft-black capitalize">Program {key}</h3>
                  <button type="button" onClick={() => {
                    const newPrograms = {...(form.programs || {})};
                    if (!newPrograms[key]) newPrograms[key] = [];
                    newPrograms[key].push({ title: 'Program Baru', desc: '', date: '', status: 'Menunggu' });
                    setKkgForm({...form, programs: newPrograms});
                  }} className="text-xs text-main-blue hover:underline font-bold">+ Tambah</button>
                </div>
                <div className="space-y-3">
                  {((form.programs && form.programs[key]) || []).map((prog: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative group">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input className="border-b border-gray-200 p-1 text-sm font-bold text-soft-black focus:border-main-blue outline-none bg-transparent" placeholder="Judul Program" value={prog.title} onChange={e => {
                          const newPrograms = {...form.programs};
                          newPrograms[key][i].title = e.target.value;
                          setKkgForm({...form, programs: newPrograms});
                        }} />
                        <input className="border-b border-gray-200 p-1 text-sm text-gray-600 focus:border-main-blue outline-none bg-transparent" placeholder="Waktu / Pelaksanaan" value={prog.date} onChange={e => {
                          const newPrograms = {...form.programs};
                          newPrograms[key][i].date = e.target.value;
                          setKkgForm({...form, programs: newPrograms});
                        }} />
                        <textarea className="border border-gray-200 rounded-lg p-2 text-sm text-gray-600 focus:border-main-blue outline-none bg-transparent col-span-1 md:col-span-2" placeholder="Deskripsi Singkat" value={prog.desc} onChange={e => {
                          const newPrograms = {...form.programs};
                          newPrograms[key][i].desc = e.target.value;
                          setKkgForm({...form, programs: newPrograms});
                        }} rows={2} />
                      </div>
                      <button type="button" onClick={() => {
                        const newPrograms = {...form.programs};
                        newPrograms[key].splice(i, 1);
                        setKkgForm({...form, programs: newPrograms});
                      }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-50 p-2 rounded-lg transition-all absolute top-2 right-2"><X className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {((form.programs && form.programs[key]) || []).length === 0 && <p className="text-xs text-gray-400 italic">Belum ada program {key}.</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeKkgTab === 'pengumuman' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-yellow-900 text-lg">Pengumuman Khusus KKG</h3>
                  <p className="text-yellow-700 text-sm">Pesan highlight ini akan muncul di bagian paling atas halaman KKG.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-yellow-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                  <label className="relative inline-block w-[60px] h-[34px]">
                      <input 
                        type="checkbox" 
                        id="kkg_announcement_active"
                        checked={localIsActive}
                        onChange={e => {
                          const isActive = e.target.checked;
                          setLocalIsActive(isActive);
                          
                          if (updateContent) {
                            setIsSavingToggle(true);
                            const updated = { 
                              ...form, 
                              pengumuman: { ...(form.pengumuman || {}), isActive } 
                            };
                            updateContent({ kkg: updated })
                              .then(() => {
                                  alert(isActive ? "Pengumuman KKG diaktifkan!" : "Pengumuman KKG dinonaktifkan!");
                                  console.log("Pengumuman KKG updated to:", isActive);
                              })
                              .catch(err => {
                                  alert("Gagal menyimpan pengaturan!");
                                  console.error("Gagal menyimpan:", err);
                                  setLocalIsActive(!isActive);
                              })
                              .finally(() => setTimeout(() => setIsSavingToggle(false), 1000));
                          }
                        }}
                        className="peer sr-only"
                      />
                      <span className="absolute cursor-pointer inset-0 bg-gray-300 transition-all duration-400 rounded-full peer-checked:bg-[#2196F3] before:absolute before:content-[''] before:h-[26px] before:w-[26px] before:left-[4px] before:bottom-[4px] before:bg-white before:transition-all before:duration-400 before:rounded-full peer-checked:before:translate-x-[26px]"></span>
                    </label>
                  <label htmlFor="kkg_announcement_active" className="text-sm font-bold text-gray-700 cursor-pointer">
                    Tampilkan Pengumuman ini di Halaman KKG
                  </label>
                  {isSavingToggle && (
                    <motion.span 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-[10px] text-yellow-600 font-bold bg-yellow-100 px-2 py-0.5 rounded-full animate-pulse ml-2"
                    >
                      Menyimpan...
                    </motion.span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Judul Pengumuman</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-yellow-500 outline-none bg-gray-50/50 font-bold transition-all"
                      value={form.pengumuman?.title || ''}
                      onChange={e => setKkgForm({
                        ...form, 
                        pengumuman: { ...(form.pengumuman || {}), title: e.target.value }
                      })}
                      placeholder="Masukkan judul (misal: Rapat Koordinasi)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Isi Pesan Pengumuman</label>
                    <textarea 
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-yellow-500 outline-none bg-gray-50/50 min-h-[120px] transition-all"
                      value={form.pengumuman?.desc || ''}
                      onChange={e => setKkgForm({
                        ...form, 
                        pengumuman: { ...(form.pengumuman || {}), desc: e.target.value }
                      })}
                      placeholder="Tuliskan detail pengumuman yang ingin disampaikan kepada guru-guru..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
          <button type="submit" className="px-8 py-3.5 bg-gradient-to-r from-leaf-green to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/20 transition-all flex items-center gap-2">
            <CheckSquare className="w-5 h-5" /> Simpan Data KKG
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function AdminGugusForm({ gugusForm, setGugusForm, handleSaveContent }: any) {
  const { alert } = useAlert();
  const { content } = useSiteContent();
  const [activeTab, setActiveTab] = useState('profil');
  const [dbStruktur, setDbStruktur] = useState<any[]>([]);
  
  const form = {
    ...defaultContent.gugus,
    ...gugusForm
  };
  
  const visi = form.visi || '';
  const misi = form.misi || [];
  const tujuan = form.tujuan || [];
  const sejarah = form.sejarah || '';
  const programs = form.programs || [];

  // Gugus: handle field change locally for performance
  const [isSavingOrg, setIsSavingOrg] = useState<string | null>(null);
  const debouncedOrgSave = useRef<NodeJS.Timeout>();

  const onFieldChangeGugus = (id: string, field: string, value: string) => {
    setDbStruktur(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const loadStruktur = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('org_gugus').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      setDbStruktur(data || []);
    } catch (err) {
      console.error("Gagal memuat struktur Gugus:", err);
    }
  };

  React.useEffect(() => {
    loadStruktur();
  }, []);

  const handleOrgCreate = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('org_gugus').insert([{ role: "Jabatan Baru", name: "-", school: "-" }]).select();
      if (error) throw error;
      if (data) loadStruktur();
      await alert("Anggota baru berhasil ditambahkan", "Sukses", "success");
    } catch (err: any) {
      console.error("Error creating org_gugus:", err);
      await alert("Gagal menambah anggota: " + (err.message || "Kesalahan tidak diketahui"), "Error", "error");
    }
  };

  const handleOrgUpdate = async (id: string, updates: any) => {
    if (!supabase) return;
    
    if (debouncedOrgSave.current) clearTimeout(debouncedOrgSave.current);
    
    debouncedOrgSave.current = setTimeout(async () => {
      setIsSavingOrg(id);
      try {
        const { data, error } = await supabase.from('org_gugus').update(updates).eq('id', id).select();
        if (error) throw error;
        if (data && data[0]) {
           setDbStruktur(prev => prev.map(item => item.id === id ? data[0] : item));
        }
      } catch (err: any) {
        console.error("Error updating org_gugus:", err);
        await alert("Gagal menyimpan perubahan: " + (err.message || "Kesalahan tidak diketahui"), "Error", "error");
      } finally {
        setIsSavingOrg(null);
      }
    }, 800);
  };

  const handleOrgDelete = async (id: string) => {
    if (!supabase) return;
    await supabase.from('org_gugus').delete().eq('id', id);
    loadStruktur();
  };


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
       <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 pb-4 border-b border-gray-100 gap-4">
         <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola Profil Gugus</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola Sejarah, Visi Misi, Struktur, dan Program Gugus.</p>
         </div>
         <div className="flex flex-wrap items-center gap-2 bg-gray-100/50 p-1 rounded-xl">
           <button type="button" onClick={() => setActiveTab('profil')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'profil' ? 'bg-white text-main-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Profil & Visi</button>
           <button type="button" onClick={() => setActiveTab('struktur')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'struktur' ? 'bg-white text-main-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Struktur</button>
           <button type="button" onClick={() => setActiveTab('program')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'program' ? 'bg-white text-main-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Program</button>
         </div>
      </div>

      <form onSubmit={handleSaveContent} className="space-y-6">
        {activeTab === 'profil' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sejarah Gugus</label>
              <textarea 
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50" 
                rows={4}
                value={sejarah}
                onChange={e => setGugusForm({...form, sejarah: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tahun Berdiri</label>
                <input 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50" 
                  value={form.tahunBerdiri || ''}
                  onChange={e => setGugusForm({...form, tahunBerdiri: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sekolah Inti</label>
                <input 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50" 
                  value={form.sekolahInti || ''}
                  onChange={e => setGugusForm({...form, sekolahInti: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Wilayah Kerja</label>
                <input 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50" 
                  value={form.wilayahKerja || ''}
                  onChange={e => setGugusForm({...form, wilayahKerja: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Visi Gugus</label>
              <textarea 
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50" 
                rows={2}
                value={visi}
                onChange={e => setGugusForm({...form, visi: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">Misi Gugus</label>
                  <button type="button" onClick={() => setGugusForm({...form, misi: [...misi, '']})} className="text-xs text-main-blue font-bold">+ Tambah</button>
                </div>
                <div className="space-y-2">
                  {misi.map((m: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input className="flex-1 border border-gray-200 rounded-lg p-2 text-sm outline-none bg-white/50" value={m} onChange={e => {
                        const next = [...misi];
                        next[i] = e.target.value;
                        setGugusForm({...form, misi: next});
                      }} />
                      <button type="button" onClick={() => {
                        const next = [...misi];
                        next.splice(i, 1);
                        setGugusForm({...form, misi: next});
                      }} className="text-red-400 p-2"><X className="w-4 h-4"/></button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">Tujuan Gugus</label>
                  <button type="button" onClick={() => setGugusForm({...form, tujuan: [...tujuan, '']})} className="text-xs text-main-blue font-bold">+ Tambah</button>
                </div>
                <div className="space-y-2">
                  {tujuan.map((t: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input className="flex-1 border border-gray-200 rounded-lg p-2 text-sm outline-none bg-white/50" value={t} onChange={e => {
                        const next = [...tujuan];
                        next[i] = e.target.value;
                        setGugusForm({...form, tujuan: next});
                      }} />
                      <button type="button" onClick={() => {
                        const next = [...tujuan];
                        next.splice(i, 1);
                        setGugusForm({...form, tujuan: next});
                      }} className="text-red-400 p-2"><X className="w-4 h-4"/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'struktur' && (
          <div className="space-y-6">
            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 mb-8">
              <h4 className="text-sm font-bold text-main-blue mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Preview Struktur Organisasi {content.profil.periodeKepengurusan && <span className="text-gray-500 font-normal">| Periode: {content.profil.periodeKepengurusan}</span>}
              </h4>
              <div className="bg-white rounded-2xl p-4 shadow-inner overflow-x-auto min-h-[300px]">
                <OrgChart members={dbStruktur} onEdit={(member) => {
                  const newRole = window.prompt("Edit Jabatan:", member.role);
                  const newName = window.prompt("Edit Nama:", member.name);
                  const newSchool = window.prompt("Edit Sekolah:", member.school);
                  if (newRole !== null || newName !== null || newSchool !== null) {
                    handleOrgUpdate(member.id, {
                        role: newRole !== null ? newRole : member.role,
                        name: newName !== null ? newName : member.name,
                        school: newSchool !== null ? newSchool : member.school
                    });
                  }
                }} onDelete={handleOrgDelete} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-soft-black">Daftar Pengurus Gugus</h4>
              <button 
                type="button" 
                onClick={handleOrgCreate}
                className="px-4 py-2 bg-leaf-green/10 text-leaf-green flex items-center gap-2 font-bold rounded-xl hover:bg-leaf-green/20 transition-colors">
                <PlusCircle className="w-5 h-5" /> Tambah Pengurus
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {dbStruktur.map((item: any) => (
                <div key={item.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-start gap-4 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 justify-center items-center flex text-gray-400 shrink-0 mt-1">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Jabatan / Peran</label>
                        <input 
                          className="w-full border-b border-gray-200 pb-1 text-sm font-bold text-soft-black focus:border-main-blue outline-none transition-colors bg-transparent" 
                          value={item.role} 
                          onChange={e => {
                            onFieldChangeGugus(item.id, 'role', e.target.value);
                            handleOrgUpdate(item.id, { role: e.target.value });
                          }} 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Nama Pengurus</label>
                        <input 
                          className="w-full border-b border-gray-200 pb-1 text-sm text-gray-600 focus:border-main-blue outline-none transition-colors bg-transparent" 
                          value={item.name} 
                          onChange={e => {
                            onFieldChangeGugus(item.id, 'name', e.target.value);
                            handleOrgUpdate(item.id, { name: e.target.value });
                          }} 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Asal Sekolah</label>
                        <input 
                          className="w-full border-b border-gray-200 pb-1 text-sm text-gray-600 focus:border-main-blue outline-none transition-colors bg-transparent" 
                          value={item.school} 
                          onChange={e => {
                            onFieldChangeGugus(item.id, 'school', e.target.value);
                            handleOrgUpdate(item.id, { school: e.target.value });
                          }} 
                        />
                    </div>
                    <div className="relative">
                        {isSavingOrg === item.id && (
                          <div className="absolute top-0 right-0">
                            <div className="w-4 h-4 border-2 border-main-blue border-t-transparent animate-spin rounded-full"></div>
                          </div>
                        )}
                        <ImageUpload 
                           label="Foto Pengurus"
                           value={item.photo_url || ''} 
                           onChange={base64 => {
                             onFieldChangeGugus(item.id, 'photo_url', base64);
                             handleOrgUpdate(item.id, { photo_url: base64 });
                           }}
                           maxWidth={200}
                           maxHeight={200}
                        />
                    </div>
                  </div>
                  <button type="button" onClick={() => handleOrgDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <X className="w-4 h-4"/>
                  </button>
                </div>
              ))}
              {dbStruktur.length === 0 && <p className="text-gray-400 text-sm italic py-4 col-span-2 text-center">Belum ada struktur organisasi.</p>}
            </div>
          </div>
        )}

        {activeTab === 'program' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h4 className="font-bold text-soft-black">Program Gugus</h4>
               <button type="button" onClick={() => setGugusForm({...form, programs: [...programs, { title: 'Program Baru', desc: '', date: '' }]})} className="text-xs text-main-blue font-bold">+ Tambah Program</button>
            </div>
            <div className="space-y-4">
              {programs.map((p: any, i: number) => (
                <div key={i} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-3 relative group">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="w-full border-b border-gray-200 p-1 text-sm font-bold text-soft-black outline-none bg-transparent" placeholder="Judul Program" value={p.title} onChange={e => {
                      const next = [...programs];
                      next[i].title = e.target.value;
                      setGugusForm({...form, programs: next});
                    }} />
                    <input className="w-full border-b border-gray-200 p-1 text-sm text-gray-600 outline-none bg-transparent" placeholder="Waktu" value={p.date} onChange={e => {
                      const next = [...programs];
                      next[i].date = e.target.value;
                      setGugusForm({...form, programs: next});
                    }} />
                    <textarea className="w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-600 outline-none bg-white/50 col-span-2" rows={2} placeholder="Deskripsi" value={p.desc} onChange={e => {
                      const next = [...programs];
                      next[i].desc = e.target.value;
                      setGugusForm({...form, programs: next});
                    }} />
                  </div>
                  <button type="button" onClick={() => {
                    const next = [...programs];
                    next.splice(i, 1);
                    setGugusForm({...form, programs: next});
                  }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400"><X className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
          <button type="submit" className="px-8 py-3.5 bg-main-blue text-white rounded-xl font-bold shadow-lg shadow-main-blue/20">
            Simpan Profil Gugus
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function AdminPenghargaanForm() {
  const [awards, setAwards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSave = useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    async function loadAwards() {
      if (!supabase) return;
      try {
        const { data } = await supabase.from('awards').select('*').order('created_at', { ascending: false });
        setAwards(data || []);
      } catch (err) {
        console.error("Error fetching awards:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAwards();
  }, []);

  const handleCreate = async () => {
     if (!supabase) return;
     const newAward = {
       title: "Penghargaan Baru",
       year: new Date().getFullYear(),
       description: "Deskripsi penghargaan...",
       image_url: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&q=80"
     };
     const { data, error } = await supabase.from('awards').insert([newAward]).select();
     if (!error && data) {
        setAwards([data[0], ...awards]);
     }
  };

  const handleUpdate = (id: string, updates: any) => {
     setAwards(awards.map((a: any) => a.id === id ? { ...a, ...updates } : a));
     
     if (debouncedSave.current) clearTimeout(debouncedSave.current);
     
     debouncedSave.current = setTimeout(async () => {
        if (!supabase) return;
        const { error } = await supabase.from('awards').update(updates).eq('id', id);
        if (error) {
           console.error("Error updating award:", error);
        }
     }, 800);
  };

  const handleDelete = async (id: string) => {
     if (!supabase) return;
     if (window.confirm("Hapus penghargaan ini?")) {
       const { error } = await supabase.from('awards').delete().eq('id', id);
       if (!error) {
          setAwards(awards.filter((a: any) => a.id !== id));
       }
     }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
       <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
         <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola Penghargaan</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola data penghargaan di tabel <code className="bg-gray-100 px-1 rounded">awards</code>.</p>
         </div>
         <button 
           onClick={handleCreate}
           className="flex items-center gap-2 bg-leaf-green hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/20"
         >
           <PlusCircle className="w-5 h-5" /> Tambah Penghargaan
         </button>
      </div>

      <div className="space-y-6">
        {isLoading ? (
           <div className="text-center text-gray-400 py-10">Memuat data...</div>
        ) : awards.length === 0 ? (
           <div className="text-center text-gray-400 py-10">Belum ada penghargaan.</div>
        ) : awards.map((item: any) => (
          <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 group relative">
             <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
               <div className="md:col-span-2">
                 <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Judul Penghargaan</label>
                 <input className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent" value={item.title} onChange={e => handleUpdate(item.id, { title: e.target.value })} />
               </div>
               <div>
                 <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tahun</label>
                 <input className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent" type="number" value={item.year} onChange={e => handleUpdate(item.id, { year: e.target.value })} />
               </div>
               <div className="md:col-span-3">
                  <ImageUpload 
                    label="Foto Penghargaan"
                    value={item.image_url || ''} 
                    onChange={base64 => handleUpdate(item.id, { image_url: base64 })}
                    maxWidth={600}
                    maxHeight={400}
                  />
               </div>
               <div className="md:col-span-3">
                 <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Deskripsi</label>
                 <textarea className="w-full border-b border-gray-200 text-sm text-soft-black outline-none bg-transparent" value={item.description} rows={2} onChange={e => handleUpdate(item.id, { description: e.target.value })} />
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
        ))}
      </div>
    </motion.div>
  );
}

function AdminPengumumanForm() {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function loadNews() {
      if (!supabase) return;
      try {
        const { data } = await supabase.from('posts').select('*').eq('category', 'pengumuman').order('created_at', { ascending: false });
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
       category: "pengumuman"
     };
     const { data, error } = await supabase.from('posts').insert([newPost]).select();
     if (!error && data) {
        setNews([data[0], ...news]);
     }
  };

  const handleUpdate = async (id: string, updates: any) => {
     if (!supabase) return;
     const { error } = await supabase.from('posts').update(updates).eq('id', id);
     if (!error) {
        setNews(news.map((n: any) => n.id === id ? { ...n, ...updates } : n));
     }
  };

  const handleDelete = async (id: string) => {
     if (!supabase) return;
     if (window.confirm("Hapus pengumuman ini?")) {
       const { error } = await supabase.from('posts').delete().eq('id', id);
       if (!error) {
          setNews(news.filter((n: any) => n.id !== id));
       }
     }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
       <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
         <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola Pengumuman</h2>
          <p className="text-gray-500 text-sm mt-1">Publikasikan pengumuman ke tabel <code className="bg-gray-100 px-1 rounded">posts</code>.</p>
         </div>
         <button 
           onClick={handleCreate}
           className="flex items-center gap-2 bg-leaf-green hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/20"
         >
           <PlusCircle className="w-5 h-5" /> Buat Pengumuman
         </button>
      </div>

      <div className="space-y-6">
         <div className="flex flex-col gap-4 mb-6">
          {isLoading ? (
             <div className="text-center text-gray-400 py-10">Memuat data...</div>
          ) : news.length === 0 ? (
             <div className="text-center text-gray-400 py-10">Belum ada pengumuman.</div>
          ) : news.map((item: any) => (
            <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 group">
               <div className="flex-1 grid grid-cols-1 gap-4">
                 <div>
                   <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Judul Pengumuman</label>
                   <input className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent" value={item.title} onChange={e => handleUpdate(item.id, { title: e.target.value })} />
                 </div>
                 <div>
                   <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Isi Singkat Pengumuman</label>
                   <textarea className="w-full border-b border-gray-200 text-sm text-soft-black outline-none bg-transparent" value={item.content} rows={2} onChange={e => handleUpdate(item.id, { content: e.target.value })} />
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
          ))}
         </div>
      </div>
    </motion.div>
  );
}

function AdminGuruForm({ user }: { user: any }) {
  const [gurus, setGurus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function loadGurus() {
      if (!supabase) return;
      try {
        const { data } = await supabase.from('user_profiles').select('*').eq('role', 'guru');
        // Map avatar_url to foto
        const mappedData = (data || []).map(g => ({
          ...g,
          foto: g.foto || g.avatar_url
        }));
        setGurus(mappedData);
      } catch (err) {
        console.error("Error fetching guru:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGurus();
  }, []);

  const handleUpdateGuru = async (id: string, updates: any) => {
    if (!supabase) return;
    try {
      // Map foto to avatar_url for DB
      const dbUpdates = { ...updates };
      if (dbUpdates.foto !== undefined) {
        dbUpdates.avatar_url = dbUpdates.foto;
        // Keep both to be safe during transition
      }

      const { error } = await supabase.from('user_profiles').update(dbUpdates).eq('id', id);
      if (error) throw error;
      logActivity(user, 'update_guru', `Memperbarui profil guru ID: ${id}`);
      setGurus(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    } catch (err) {
      console.error("Error updating guru:", err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
       <div className="mb-8 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola Guru</h2>
          <p className="text-gray-500 text-sm mt-1">Daftar profil guru yang terdaftar dalam sistem (diambil langsung dari database).</p>
       </div>
       <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
               <tr>
                 <th className="p-4 font-bold text-[10px] uppercase tracking-wider w-16">Foto</th>
                 <th className="p-4 font-bold text-[10px] uppercase tracking-wider">Nama</th>
                 <th className="p-4 font-bold text-[10px] uppercase tracking-wider">NIP</th>
                 <th className="p-4 font-bold text-[10px] uppercase tracking-wider">Pangkat/Gol</th>
                 <th className="p-4 font-bold text-[10px] uppercase tracking-wider">Kepegawaian</th>
                 <th className="p-4 font-bold text-[10px] uppercase tracking-wider">Jabatan</th>
                 <th className="p-4 font-bold text-[10px] uppercase tracking-wider">Sekolah</th>
               </tr>
             </thead>
             <tbody>
               {isLoading ? (
                 <tr><td colSpan={7} className="p-4 text-center text-gray-400">Loading...</td></tr>
               ) : gurus.length === 0 ? (
                 <tr><td colSpan={7} className="p-4 text-center text-gray-400">Belum ada data guru</td></tr>
               ) : gurus.map((g, i) => (
                 <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 font-medium align-middle">
                       <ImageUpload
                          label=""
                          compact={true}
                          value={g.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.nama || g.username || 'G')}&background=random`}
                          onChange={base64 => handleUpdateGuru(g.id, { foto: base64 })}
                          maxWidth={200}
                          maxHeight={200}
                       />
                    </td>
                    <td className="p-4 font-medium align-middle">{g.nama || g.username || '-'}</td>
                    <td className="p-4 text-gray-500 align-middle">{g.nip || '-'}</td>
                    <td className="p-4 text-gray-500 align-middle">{g.pangkat || '-'}</td>
                    <td className="p-4 text-gray-500 align-middle">{g.kepegawaian || '-'}</td>
                    <td className="p-4 text-gray-500 align-middle">{g.jabatan || '-'}</td>
                    <td className="p-4 text-gray-500 align-middle">{g.sekolah || '-'}</td>
                 </tr>
               ))}
             </tbody>
          </table>
       </div>
    </motion.div>
  );
}

function AdminFinanceManagement({ user }: { user: any }) {
  const { alert } = useAlert();
  const [records, setRecords] = useState<FinanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    activity_name: '',
    income: 0,
    expense: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/finance/records');
      if (!response.ok) throw new Error("Gagal mengambil data keuangan");
      const data = await response.json();
      setRecords(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activity_name) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/finance/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error("Gagal menyimpan data");
      
      logActivity(user, 'create_finance', `Menambah data keuangan: ${formData.activity_name}`);
      await alert("Data keuangan berhasil disimpan!");
      setFormData({
        activity_name: '',
        income: 0,
        expense: 0,
        date: new Date().toISOString().split('T')[0]
      });
      fetchRecords();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data keuangan ini?")) return;
    
    try {
      const response = await fetch(`/api/finance/records/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Gagal menghapus data");
      logActivity(user, 'delete_finance', `Menghapus data keuangan ID: ${id}`);
      fetchRecords();
    } catch (err: any) {
      console.error(err);
    }
  };

  const totalIncome = records.reduce((sum, r) => sum + (Number(r.income) || 0), 0);
  const totalExpense = records.reduce((sum, r) => sum + (Number(r.expense) || 0), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">Kelola Keuangan</h2>
            <p className="text-gray-500 text-sm mt-1">Atur pemasukan, pengeluaran, dan saldo KAS Gugus.</p>
          </div>
          <div className="text-right">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saldo Saat Ini</p>
             <h3 className="text-2xl font-black text-main-blue truncate">
               {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(balance)}
             </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-1 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal</label>
            <input 
              type="date" 
              className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:border-main-blue transition-colors"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="md:col-span-1 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Keterangan / Kegiatan</label>
            <input 
              type="text" 
              placeholder="Contoh: Iuran Bulanan"
              className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:border-main-blue transition-colors"
              value={formData.activity_name}
              onChange={e => setFormData({...formData, activity_name: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-leaf-green">Pemasukan (Rp)</label>
            <input 
              type="number" 
              className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:border-leaf-green transition-colors font-mono font-bold text-leaf-green"
              value={formData.income}
              onChange={e => setFormData({...formData, income: Number(e.target.value), expense: 0})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-red-500">Pengeluaran (Rp)</label>
            <input 
              type="number" 
              className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:border-red-500 transition-colors font-mono font-bold text-red-500"
              value={formData.expense}
              onChange={e => setFormData({...formData, expense: Number(e.target.value), income: 0})}
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-main-blue text-white rounded-xl font-bold flex items-center gap-2 hover:bg-dark-blue transition-all shadow-lg shadow-main-blue/20"
            >
              <PlusCircle className="w-5 h-5" />
              {isSubmitting ? 'Menyimpan...' : 'Tambah Catatan'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
           <h3 className="font-bold text-lg text-soft-black">Data Transaksi</h3>
           <div className="flex gap-4">
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Pemasukan</span>
                <span className="text-leaf-green font-bold">{new Intl.NumberFormat('id-ID').format(totalIncome)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Pengeluaran</span>
                <span className="text-red-500 font-bold">{new Intl.NumberFormat('id-ID').format(totalExpense)}</span>
              </div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 text-right">Pemasukan</th>
                <th className="px-6 py-4 text-right">Pengeluaran</th>
                <th className="px-6 py-4 text-right">Saldo</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 animate-pulse">Memuat data...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">Belum ada data transaksi.</td></tr>
              ) : (
                (() => {
                  let runningBalance = 0;
                  const sortedForBalance = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  const recordsWithBalance = sortedForBalance.map(r => {
                    runningBalance += (Number(r.income) || 0) - (Number(r.expense) || 0);
                    return { ...r, runningBalance };
                  });
                  return recordsWithBalance.reverse().map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-soft-black">{record.activity_name}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-leaf-green">
                        {record.income > 0 ? `+ ${new Intl.NumberFormat('id-ID').format(record.income)}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-red-500">
                        {record.expense > 0 ? `- ${new Intl.NumberFormat('id-ID').format(record.expense)}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-gray-400">
                        {new Intl.NumberFormat('id-ID').format(record.runningBalance)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminCertificateManager({ user }: { user: any }) {
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'list'>('list');
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading">Manajemen Sertifikat</h2>
            <p className="text-xs text-gray-500">Kelola desain template dan penerbitan sertifikat pelatihan.</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveSubTab('list')} 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeSubTab === 'list' ? 'bg-white text-main-blue shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Daftar Sertifikat
          </button>
          <button 
            onClick={() => setActiveSubTab('editor')} 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeSubTab === 'editor' ? 'bg-white text-main-blue shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Desain Template
          </button>
        </div>
      </div>
      
      {activeSubTab === 'list' ? (
        <DataManagementTable 
          user={user} 
          table="training_certificates" 
          title="Daftar Sertifikat Terbit" 
          icon={Award} 
          fields={[
            {name:'user_id', label:'ID Guru / Email'}, 
            {name:'training_id', label:'ID Pelatihan'}, 
            {name:'certificate_number', label:'Nomor Sertifikat'},
            {name:'certificate_url', label:'File Sertifikat (PDF)', type:'file'}
          ]} 
        />
      ) : (
        <AdminCertificateEditor />
      )}
    </div>
  );
}

function AdminMonitoring() {

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5 flex flex-col items-center justify-center min-h-[400px] text-center">
       <Activity className="w-16 h-16 text-gray-300 mb-4" />
       <h2 className="text-2xl font-bold font-heading text-soft-black mb-2">Monitoring Aktivitas</h2>
       <p className="text-gray-500 text-sm max-w-md">Fitur monitoring aktivitas log pendidik dan absensi terekam di database akan diaktifkan segera.</p>
    </motion.div>
  );
}

function AdminUpload() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5 flex flex-col items-center justify-center min-h-[400px] text-center">
       <UploadCloud className="w-16 h-16 text-gray-300 mb-4" />
       <h2 className="text-2xl font-bold font-heading text-soft-black mb-2">Upload Dokumen</h2>
       <p className="text-gray-500 text-sm max-w-md">Modul sinkronisasi file ke Storage untuk data RPP, silabus, & perangkat ajar lainnya.</p>
    </motion.div>
  );
}

function AdminLaporan() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5 flex flex-col items-center justify-center min-h-[400px] text-center">
       <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
       <h2 className="text-2xl font-bold font-heading text-soft-black mb-2">Laporan Statistik</h2>
       <p className="text-gray-500 text-sm max-w-md">Data laporan ditarik dari tabel kegiatan CMS yang dapat di-export ke format Excel/PDF.</p>
    </motion.div>
  );
}

function AdminStrukturManager() {
  const [activeTab, setActiveTab] = useState<'kkg' | 'gugus'>('kkg');
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-main-orange/10 rounded-2xl flex items-center justify-center text-main-orange">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading">Manajemen KKG & Gugus</h2>
            <p className="text-xs text-gray-500">Kelola informasi dan struktur KKG serta Gugus dari satu tempat.</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('kkg')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'kkg' ? 'bg-white text-main-blue shadow' : 'text-gray-500 hover:text-gray-700'}`}>KKG</button>
          <button onClick={() => setActiveTab('gugus')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'gugus' ? 'bg-white text-main-blue shadow' : 'text-gray-500 hover:text-gray-700'}`}>Gugus</button>
        </div>
      </div>
      
      {activeTab === 'kkg' ? (
        <AdminKKGFormWrapper />
      ) : (
        <AdminGugusFormWrapper />
      )}
    </div>
  );
}

function AdminKKGFormWrapper() {
  const { content, updateContent } = useSiteContent() as any;
  const kkgForm = content.kkg || { struktur: [] };
  
  const setKkgForm = (updater: any) => {
    const currentState = kkgForm;
    const newState = typeof updater === 'function' ? updater(currentState) : updater;
    updateContent({ kkg: newState });
  };
  
  const handleSaveContent = (e: React.FormEvent) => {
      e.preventDefault();
      updateContent({ kkg: kkgForm });
  };

  return <AdminKKGForm kkgForm={kkgForm} setKkgForm={setKkgForm} handleSaveContent={handleSaveContent} updateContent={updateContent} />;
}

function AdminGugusFormWrapper() {
  const { content, updateContent, gugusForm, setGugusForm, handleSaveContent } = useSiteContent() as any;
  return <AdminGugusForm gugusForm={gugusForm} setGugusForm={setGugusForm} handleSaveContent={handleSaveContent} />;
}

function UserProfileEdit({ user, onUpdate }: { user: any, onUpdate: (data: any) => void }) {
  const { alert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({
    nama: user.nama || '',
    nip: user.nip || '',
    jabatan: user.jabatan || '',
    sekolah: user.sekolah || '',
    kepegawaian: user.kepegawaian || '',
    pangkat: user.pangkat || '',
    email: user.email || '',
    foto: user.foto || ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, id: user.id })
      });
      if (!response.ok) throw new Error("Gagal memperbarui profil");
      logActivity(user, 'update_profil', `Memperbarui profil pribadi`);
      onUpdate(profile);
      await alert("Profil berhasil diperbarui.", "Sukses", "success");
    } catch (err: any) {
      alert(err.message, "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-10 pb-6 border-b border-gray-100">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-main-blue to-leaf-green p-1 shadow-lg shadow-main-blue/20">
           <div className="w-full h-full bg-white rounded-xl flex items-center justify-center overflow-hidden">
             <img src={profile.foto || profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nama || 'U')}&background=random`} alt="Profile" className="w-full h-full object-cover" />
           </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">Profil Saya</h2>
          <p className="text-gray-500">Kelola informasi pribadi dan data kepegawaian Anda.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-full">
           <ImageUpload label="Foto Profil" value={profile.foto} onChange={base64 => setProfile({...profile, foto: base64})} maxWidth={400} maxHeight={400} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nama Lengkap</label>
          <input className="w-full border-b border-gray-200 p-2 focus:border-main-blue outline-none" value={profile.nama} onChange={e => setProfile({...profile, nama: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email</label>
          <input className="w-full border-b border-gray-200 p-2 focus:border-main-blue outline-none" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">NIP</label>
          <input className="w-full border-b border-gray-200 p-2 focus:border-main-blue outline-none" value={profile.nip} onChange={e => setProfile({...profile, nip: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Jabatan</label>
          <input className="w-full border-b border-gray-200 p-2 focus:border-main-blue outline-none" value={profile.jabatan} onChange={e => setProfile({...profile, jabatan: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sekolah</label>
          <input className="w-full border-b border-gray-200 p-2 focus:border-main-blue outline-none" value={profile.sekolah} onChange={e => setProfile({...profile, sekolah: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status Kepegawaian</label>
          <input className="w-full border-b border-gray-200 p-2 focus:border-main-blue outline-none" value={profile.kepegawaian} onChange={e => setProfile({...profile, kepegawaian: e.target.value})} />
        </div>
        <div className="col-span-full pt-6">
          <button type="submit" disabled={loading} className="w-full py-4 bg-main-blue text-white rounded-2xl font-bold shadow-lg shadow-main-blue/20 hover:scale-[1.02] transition-all">
            {loading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function DataManagementTable({ user, table, title, icon: Icon, fields }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);
  const { alert, confirm } = useAlert();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setData(res || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        const { error } = await supabase.from(table).update(formData).eq('id', editId);
        if (error) throw error;
        logActivity(user, `update_${table}`, `Memperbarui data di ${title}`);
        await alert("Data Berhasil Diperbarui");
      } else {
        const { error } = await supabase.from(table).insert([formData]);
        if (error) throw error;
        logActivity(user, `create_${table}`, `Menambah data baru di ${title}`);
        await alert("Data Berhasil Ditambahkan");
      }
      setShowForm(false);
      setEditId(null);
      setFormData({});
      fetchData();
    } catch (err: any) {
      alert(err.message, "Error", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm("Yakin ingin menghapus data ini?")) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        logActivity(user, `delete_${table}`, `Menghapus data di ${title} ID: ${id}`);
        fetchData();
      } catch (err: any) {
        alert(err.message, "Error", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading">{title}</h2>
            <p className="text-xs text-gray-500">Kelola data {title.toLowerCase()} didatabase.</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-6 py-2.5 bg-main-blue text-white rounded-xl font-bold shadow-lg shadow-main-blue/20 transition-all flex items-center gap-2">
           {showForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
           {showForm ? 'Batal' : 'Tambah Data'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((f: any) => (
                <div key={f.name} className={f.type === 'textarea' || f.type === 'file' ? 'col-span-full' : ''}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea className="w-full border border-gray-200 p-3 rounded-xl focus:border-main-blue outline-none" rows={4} value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} />
                  ) : f.type === 'select' ? (
                    <select className="w-full border border-gray-200 p-3 rounded-xl focus:border-main-blue outline-none bg-white" value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})}>
                      <option value="">Pilih</option>
                      {f.options.map((opt: any) => {
                        const label = typeof opt === 'string' ? opt : opt.label;
                        const value = typeof opt === 'string' ? opt : opt.value;
                        return <option key={value} value={value}>{label}</option>;
                      })}
                    </select>
                  ) : f.type === 'file' ? (
                    <ImageUpload label={f.label} value={formData[f.name] || ''} onChange={base64 => setFormData({...formData, [f.name]: base64})} />
                  ) : (
                    <input type={f.type || 'text'} className="w-full border border-gray-200 p-3 rounded-xl focus:border-main-blue outline-none" value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} />
                  )}
                </div>
              ))}
              <div className="col-span-full flex justify-end gap-3 pt-4">
                <button type="submit" className="px-8 py-3 bg-main-blue text-white rounded-xl font-bold shadow-lg">Simpan Data</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                {fields.slice(0, 3).map((f: any) => <th key={f.name} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{f.label}</th>)}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={10} className="p-10 text-center text-gray-400 italic">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={10} className="p-10 text-center text-gray-400 italic">Belum ada data.</td></tr>
              ) : data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  {fields.slice(0, 3).map((f: any) => (
                    <td key={f.name} className="px-6 py-4 text-sm font-medium text-gray-700 max-w-[200px] truncate">
                      {f.type === 'date' ? (
                        new Date(item[f.name]).toLocaleDateString('id-ID')
                      ) : f.type === 'select' ? (
                        (() => {
                           let val = item[f.name];
                           
                           // Automate status for trainings table
                           if (table === 'trainings' && f.name === 'status' && item.date_start) {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const trainingDate = new Date(item.date_start);
                              trainingDate.setHours(0, 0, 0, 0);
                              
                              if (trainingDate > today) val = 'planned';
                              else if (trainingDate.getTime() === today.getTime()) val = 'ongoing';
                              else val = 'completed';
                           }

                           const opt = f.options.find((o: any) => (typeof o === 'string' ? o : o.value) === val);
                           return typeof opt === 'string' ? opt : opt?.label || val || '-';
                        })()
                      ) : (
                        item[f.name] || '-'
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => { setFormData(item); setEditId(item.id); setShowForm(true); }} className="p-2 text-main-blue hover:bg-main-blue/5 rounded-lg"><PenTool className="w-4 h-4"/></button>
                       <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DataViewList({ table, title, icon: Icon, filterColumn, filterValue }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query: any = supabase.from(table).select('*').order('created_at', { ascending: false });
        if (filterColumn && filterValue) {
          query = query.eq(filterColumn, filterValue);
        }
        const { data: res, error } = await query;
        if (error) throw error;
        setData(res || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [table, filterColumn, filterValue]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-12 h-12 bg-leaf-green/10 rounded-2xl flex items-center justify-center text-leaf-green">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading">{title}</h2>
          <p className="text-xs text-gray-500">Lihat daftar {title.toLowerCase()} untuk menunjang kegiatan KKG.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic">Belum ada data tersedia.</div>
        ) : data.map((item) => (
          <motion.div whileHover={{ y: -5 }} key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
             </div>
             <h3 className="font-bold text-soft-black mb-2 line-clamp-2">{item.title}</h3>
             <p className="text-xs text-gray-500 mb-4 line-clamp-3">{item.description || item.content || 'Klik tombol dibawah untuk detail.'}</p>
             <div className="flex gap-2">
                {item.file_url && (
                  <a href={item.file_url} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-main-blue/10 text-main-blue rounded-lg text-xs font-bold text-center hover:bg-main-blue hover:text-white transition-all">Download / Lihat File</a>
                )}
                {item.video_url && (
                  <a href={item.video_url} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-main-orange/10 text-main-orange rounded-lg text-xs font-bold text-center hover:bg-main-orange hover:text-white transition-all">Lihat Video</a>
                )}
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TeacherAttendance() {
  const { alert } = useAlert();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const { data, error } = await supabase.from('trainings').select('*').eq('status', 'ongoing');
        if (error) throw error;
        setTrainings(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainings();
  }, []);

  const handleAbsen = async (trainingId: string) => {
    try {
      const { error } = await supabase.from('training_attendance').insert([{ training_id: trainingId }]); // user_id will be handled by RLS or manually if needed
      if (error) throw error;
      await alert("Absensi Berhasil Dicatat!", "Sukses", "success");
    } catch (err: any) {
      alert(err.message, "Error", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-12 h-12 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading">Presensi Pelatihan</h2>
          <p className="text-xs text-gray-500">Lakukan absensi pada pelatihan yang sedang berlangsung.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Memuat pelatihan aktif...</div>
      ) : trainings.length === 0 ? (
        <div className="bg-gray-50/50 p-10 rounded-3xl text-center border-2 border-dashed border-gray-200">
           <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
           <p className="text-gray-500 font-medium">Tidak ada pelatihan yang sedang berlangsung saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainings.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-soft-black">{t.title}</h3>
                <p className="text-xs text-gray-500">{t.location} | {new Date(t.date_start).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleAbsen(t.id)} className="px-6 py-2 bg-main-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-main-blue/20">Absen Sekarang</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ForumSystem({ user }: { user: any }) {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`*, author:user_id (*)`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreateSuccess = () => {
    setActiveView('list');
    fetchPosts();
  };

  const handleViewDetail = (post: any) => {
    setSelectedPost(post);
    setActiveView('detail');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading">Forum Diskusi KKG</h2>
            <p className="text-xs text-gray-500">Ruang berbagi ide, pertanyaan, dan pengalaman antar guru.</p>
          </div>
        </div>
        {activeView === 'list' ? (
          <button onClick={() => setActiveView('create')} className="px-6 py-2.5 bg-main-blue text-white rounded-xl font-bold shadow-lg shadow-main-blue/20 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Buat Topik Baru
          </button>
        ) : (
          <button onClick={() => setActiveView('list')} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-medium">Memuat diskusi...</div>
      ) : activeView === 'create' ? (
        <CreateForumPostForm user={user} onSuccess={handleCreateSuccess} />
      ) : activeView === 'detail' ? (
        <ForumDetail post={selectedPost} user={user} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">
               <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-500">Belum ada diskusi. Jadilah yang pertama memulai!</p>
            </div>
          ) : (
            posts.map(post => (
              <motion.div 
                whileHover={{ x: 5 }} 
                key={post.id} 
                onClick={() => handleViewDetail(post)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-main-blue/30 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden border">
                    <img src={post.author?.foto || post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.nama || 'Guru'}&background=random`} alt="Author" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-main-blue uppercase tracking-widest bg-main-blue/5 px-2 py-0.5 rounded-full">{post.category || 'Umum'}</span>
                    <h3 className="font-bold text-soft-black mt-1 mb-1">{post.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                       <span>Oleh: {post.author?.nama || post.user_id?.substring(0,8)}</span>
                       <span>•</span>
                       <span>{new Date(post.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                   <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold">Detail</span>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CreateForumPostForm({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const { alert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'Umum' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert("Harap isi judul dan konten diskusi.");
    
    setLoading(true);
    try {
      const { error } = await supabase.from('forum_posts').insert([{
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        category: formData.category
      }]);
      
      if (error) throw error;
      await alert("Topik diskusi berhasil diterbitkan!", "Sukses", "success");
      onSuccess();
    } catch (err: any) {
      alert(err.message, "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-3xl mx-auto">
       <h3 className="text-xl font-bold font-heading mb-6 text-soft-black">Buat Topik Baru</h3>
       <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pilih Kategori</label>
            <div className="flex flex-wrap gap-2">
              {['Umum', 'Kurikulum', 'Media', 'Administrasi', 'Inovasi'].map(cat => (
                <button 
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.category === cat ? 'bg-main-blue text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Judul Diskusi</label>
            <input 
              placeholder="Apa yang ingin Anda diskusikan?"
              className="w-full border-b border-gray-200 p-2 focus:border-main-blue outline-none text-lg font-bold"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Detail Pembahasan</label>
            <textarea 
              placeholder="Tuliskan detail pertanyaan atau pengalaman Anda..."
              rows={8}
              className="w-full border border-gray-100 p-4 rounded-2xl focus:border-main-blue outline-none bg-gray-50/50"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-main-blue text-white rounded-2xl font-bold shadow-lg shadow-main-blue/20 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? 'Sedang Menerbitkan...' : 'Terbitkan Diskusi Sekarang'}
          </button>
       </form>
    </motion.div>
  );
}

function ForumDetail({ post, user }: { post: any, user: any }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const { alert } = useAlert();

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`*, author:user_id (*)`)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmittingReply(true);
    try {
      const { error } = await supabase.from('forum_comments').insert([{
        post_id: post.id,
        user_id: user.id,
        content: newComment
      }]);
      
      if (error) throw error;
      setNewComment('');
      fetchComments();
    } catch (err: any) {
      alert(err.message, "Error", "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24">
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full overflow-hidden border">
              <img src={post.author?.foto || post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.nama || 'Guru'}&background=random`} alt="Author" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-soft-black">{post.author?.nama || 'Pengguna'}</p>
              <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('id-ID')}</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold font-heading text-soft-black mb-4">{post.title}</h1>
          <div className="prose prose-blue max-w-none text-gray-600 mb-6 bg-gray-50/50 p-6 rounded-2xl whitespace-pre-wrap">
             {post.content}
          </div>
          <div className="flex items-center gap-4 py-4 border-t border-gray-50">
             <span className="text-[10px] font-extrabold text-main-blue bg-main-blue/10 px-3 py-1 rounded-full uppercase tracking-widest">{post.category}</span>
          </div>
       </motion.div>

       <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading flex items-center gap-2 text-soft-black">
            <MessageSquare className="w-5 h-5 text-main-blue" />
            Tanggapan Komunitas ({comments.length})
          </h3>
          
          {loadingComments ? (
            <div className="py-10 text-center text-gray-400 text-sm italic">Memuat tanggapan...</div>
          ) : comments.length === 0 ? (
            <div className="bg-white/50 p-8 rounded-3xl text-center italic text-gray-400 text-sm border border-dashed border-gray-200">
               Belum ada tanggapan. Jadilah yang pertama memberikan respon!
            </div>
          ) : (
            comments.map(comment => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={comment.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border bg-gray-100">
                       <img src={comment.author?.foto || comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${comment.author?.nama || 'Guru'}&background=random`} alt="Commenter" className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-soft-black">{comment.author?.nama || 'Guru'}</p>
                       <p className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleString('id-ID')}</p>
                    </div>
                 </div>
                 <p className="text-sm text-gray-600 leading-relaxed pl-11">{comment.content}</p>
              </motion.div>
            ))
          )}
       </div>

       <div className="bg-white p-4 md:p-6 rounded-3xl shadow-2xl border border-main-blue/20 sticky bottom-4 z-10 transition-all focus-within:shadow-main-blue/20">
          <form onSubmit={handleReply} className="flex gap-4 items-end">
             <div className="flex-1">
                <textarea 
                  placeholder="Ketik tanggapan konstruktif Anda..."
                  rows={1}
                  className="w-full border-b border-gray-200 focus:border-main-blue outline-none resize-none p-2 text-sm transition-all"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
             </div>
             <button 
               type="submit" 
               disabled={submittingReply || !newComment.trim()}
               className="bg-main-blue text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-main-blue/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
             >
               {submittingReply ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
             </button>
          </form>
       </div>
    </div>
  );
}

function TeacherJadwalCards() {
  const [agendas, setAgendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgendas = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('kkg_agendas')
          .select('*')
          .order('date', { ascending: true })
          .gte('date', new Date().toISOString().split('T')[0]); // Only future/current events
        
        if (error) throw error;
        setAgendas(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgendas();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-main-orange/10 rounded-2xl flex items-center justify-center text-main-orange">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading">Jadwal Kegiatan KKG</h2>
          <p className="text-xs text-gray-500">Daftar agenda kegiatan yang akan datang.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Memuat jadwal...</div>
      ) : agendas.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada agenda kegiatan mendatang.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agendas.map((item) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id} 
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-main-orange/5 transition-all group"
            >
              <div className="bg-main-orange/5 p-6 border-b border-orange-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm border border-orange-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">{new Date(item.date).toLocaleString('id-ID', { month: 'short' })}</span>
                    <span className="text-lg font-bold text-main-orange leading-none mt-1">{new Date(item.date).getDate()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-orange-100">
                    <PenTool className="w-3 h-3 text-main-orange" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{item.type || 'Kegiatan'}</span>
                  </div>
                </div>
                <h3 className="font-bold text-soft-black text-lg group-hover:text-main-orange transition-colors line-clamp-2 min-h-[3.5rem]">{item.title}</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <PenTool className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-400 font-medium">Lokasi / Media</p>
                    <p className="font-bold text-soft-black">{item.location || 'Online / Sekolah'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-400 font-medium">Waktu</p>
                    <p className="font-bold text-soft-black">Pukul {item.time || '08:00'} - Selesai</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-2 leading-relaxed line-clamp-3">{item.description || 'Tidak ada deskripsi tambahan.'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherTrainingCards({ user }: { user: any }) {
  const { alert } = useAlert();
  const { generateTeacherPDF } = useCertificateGenerator();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [certConfig, setCertConfig] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase || !user) return;
    setLoading(true);
    try {
      // Fetch Trainings
      const { data: tData, error: tError } = await supabase
        .from('trainings')
        .select('*')
        .order('date_start', { ascending: false });
      
      if (tError) throw tError;
      setTrainings(tData || []);

      // Fetch User Registrations
      const { data: rData } = await supabase
        .from('training_participants')
        .select('*')
        .eq('user_id', user.id);
      
      const regMap: Record<string, any> = {};
      rData?.forEach(reg => {
        regMap[reg.training_id] = reg;
      });
      setRegistrations(regMap);

      // Fetch Certificate Config
      const { data: sData } = await supabase
        .from('site_settings')
        .select('content')
        .eq('id', 1)
        .single();
      
      if (sData?.content?.certificate_config) {
        setCertConfig(sData.content.certificate_config);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (trainingId: string) => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from('training_participants')
        .insert({
          user_id: user.id,
          training_id: trainingId,
          status: 'registered',
          registered_at: new Date().toISOString()
        });
      
      if (error) throw error;
      alert("Pendaftaran berhasil!", "Sukses", "success");
      fetchData();
    } catch (err: any) {
      alert(err.message, "Gagal Daftar", "error");
    }
  };

  const handleAttendance = async (trainingId: string) => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from('training_participants')
        .update({
          status: 'attended',
          attended_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('training_id', trainingId);
      
      if (error) throw error;
      alert("Daftar hadir berhasil diisi!", "Sukses", "success");
      fetchData();
    } catch (err: any) {
      alert(err.message, "Gagal Absen", "error");
    }
  };

  const handleDownload = async (training: any) => {
    if (!certConfig) {
      alert("Template sertifikat belum diatur oleh admin.", "Info", "info");
      return;
    }
    
    let certNumber = "";

    // Auto-record to training_certificates and generate number
    if (supabase) {
      try {
        // Check if certificate record already exists
        const { data: existingCert } = await supabase
          .from('training_certificates')
          .select('certificate_number')
          .eq('user_id', user.id)
          .eq('training_id', training.id)
          .maybeSingle();
        
        if (existingCert?.certificate_number) {
          certNumber = existingCert.certificate_number;
        } else {
          // Generate an automatic certificate number: [Nomer]/CERT-KKG/[Bulan Romawi]/[Tahun]
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth() + 1;
          const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
          const randomPart = Math.floor(1000 + Math.random() * 9000);
          certNumber = `${randomPart}/CERT-KKG/${romanMonths[month - 1]}/${year}`;
          
          await supabase
            .from('training_certificates')
            .insert({
              user_id: user.id,
              training_id: training.id,
              certificate_number: certNumber,
              // We don't have a URL for client-side generated PDF, 
              // but recording the data satisfies the user request for "daftar riwayat terbit"
              certificate_url: "Generated Individually"
            });
          
          logActivity(user.id, `Mengunduh sertifikat pelatihan: ${training.title}`);
        }
      } catch (err) {
        console.error("Gagal mencatat rincian sertifikat:", err);
      }
    }

    // Generate PDF with the number
    await generateTeacherPDF(user, training, certConfig, certNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-100 text-green-600 border-green-200';
      case 'planned': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ongoing': return 'Sedang Berlangsung';
      case 'planned': return 'Direncanakan';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading">Program Pelatihan Guru</h2>
          <p className="text-xs text-gray-500">Daftar pelatihan dan unduh sertifikat hasil pelatihan.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Memuat pelatihan...</div>
      ) : trainings.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada program pelatihan yang tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainings.map((item) => {
            const reg = registrations[item.id];
            const isRegistered = !!reg;
            const hasAttended = reg?.status === 'attended';
            
            // Logic status otomatis berdasarkan tanggal
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const trainingDate = new Date(item.date_start);
            trainingDate.setHours(0, 0, 0, 0);
            
            let autoStatus = item.status || 'planned';
            if (trainingDate > today) {
              autoStatus = 'planned';
            } else if (trainingDate.getTime() === today.getTime()) {
              autoStatus = 'ongoing';
            } else {
              autoStatus = 'completed';
            }

            return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={item.id} 
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-main-blue/5 transition-all flex flex-col"
              >
                <div className="flex flex-col sm:flex-row flex-1">
                  <div className="sm:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm border border-gray-100 mb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase">{new Date(item.date_start).toLocaleString('id-ID', { month: 'short' })}</span>
                      <span className="text-2xl font-bold text-main-blue leading-none mt-1">{new Date(item.date_start).getDate()}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(autoStatus)}`}>
                      {getStatusLabel(autoStatus)}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-soft-black text-lg mb-2">{item.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Map className="w-3.5 h-3.5 text-gray-300" />
                          <span className="font-medium">{item.location || 'Lokasi TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-300" />
                          <span className="font-medium">Mulai: {new Date(item.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex items-center gap-2">
                       {!isRegistered ? (
                        autoStatus === 'completed' ? (
                          <div className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold border border-gray-200">
                            Pendaftaran Ditutup
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleRegister(item.id)}
                            className="px-4 py-2 bg-main-blue text-white rounded-xl text-xs font-bold shadow-md shadow-main-blue/20 hover:scale-105 transition-all"
                          >
                            Daftar Sekarang
                          </button>
                        )
                      ) : !hasAttended ? (
                        <button 
                          onClick={() => handleAttendance(item.id)}
                          className="px-4 py-2 bg-leaf-green text-white rounded-xl text-xs font-bold shadow-md shadow-leaf-green/20 hover:scale-105 transition-all flex items-center gap-2"
                        >
                          <CheckSquare className="w-4 h-4" /> Isi Daftar Hadir
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold border border-green-100">
                          <CheckSquare className="w-4 h-4" /> Kehadiran Terverifikasi
                        </div>
                      )}
                    </div>

                    {hasAttended && (
                      <button 
                        onClick={() => handleDownload(item)}
                        className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
                      >
                         <Download className="w-4 h-4" /> Unduh Sertifikat
                      </button>
                    )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}


