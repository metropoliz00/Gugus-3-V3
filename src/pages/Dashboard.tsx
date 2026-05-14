import React, { useState, useEffect, useRef } from "react"; // Updated
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  BookOpen,
  Map,
  Navigation,
  Image as ImageIcon,
  Briefcase,
  FileVideo,
  Video,
  MessageSquare,
  MessageCircle,
  Download,
  Calendar,
  CheckSquare,
  Search,
  Menu,
  X,
  PlusCircle,
  PenTool,
  Trophy,
  Award,
  CheckCircle,
  UploadCloud,
  Activity,
  Bell,
  Shield,
  ChevronRight,
  BarChart3,
  GraduationCap,
  Play,
  Megaphone,
  Wallet,
  Trash2,
  Globe,
  ArrowLeft,
  Send,
  ChevronDown,
  Type,
  RefreshCw,
  Upload,
  Info,
  MapPin,
  Clock,
  UserCheck,
  User as UserIcon,
  Mail,
  ShieldCheck,
  Newspaper,
  Camera,
  School,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import { useSiteContent, defaultContent } from "../contexts/SiteContext";
import FloatingWA from "../components/FloatingWA";
import { supabase } from "../lib/supabase";
import OrgChart from "../components/OrgChart";
import ImageUpload from "../components/ImageUpload";
import { useAlert } from "../contexts/AlertContext";
import { FinanceTransaction } from "../types";
import { logActivity, ActivityLog } from "../lib/activity";
import AdminCertificateEditor, {
  useCertificateGenerator,
} from "../components/AdminCertificateEditor";
import { SharingPractices } from "../components/SharingPractices";

import * as XLSX from "xlsx";

// Types
interface User {
  role: "admin" | "guru";
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
  { name: "Sen", pengunjung: 4000, aktivitas: 2400 },
  { name: "Sel", pengunjung: 3000, aktivitas: 1398 },
  { name: "Rab", pengunjung: 2000, aktivitas: 9800 },
  { name: "Kam", pengunjung: 2780, aktivitas: 3908 },
  { name: "Jum", pengunjung: 1890, aktivitas: 4800 },
  { name: "Sab", pengunjung: 2390, aktivitas: 3800 },
  { name: "Min", pengunjung: 3490, aktivitas: 4300 },
];

const adminMenu = [
  { id: "overview", label: "Dashboard Admin", icon: LayoutDashboard },
  { id: "berita", label: "Kelola Berita", icon: FileText },
  { id: "pengumuman", label: "Kelola Pengumuman", icon: Bell },
  { id: "galeri", label: "Kelola Galeri", icon: ImageIcon },
  { id: "sekolah", label: "Kelola Sekolah Inti/Imbas", icon: BookOpen },
  { id: "guru", label: "Kelola Guru", icon: Users },
  { id: "finance", label: "Kelola Keuangan", icon: Wallet },
  { id: "user", label: "Kelola User", icon: Shield },
  { id: "agenda", label: "Kelola Agenda KKG", icon: Calendar },
  { id: "materi", label: "Kelola Materi KKG", icon: BookOpen },
  { id: "notulen", label: "Kelola Notulen Rapat", icon: FileText },
  { id: "pelatihan", label: "Kelola Pelatihan", icon: GraduationCap },
  { id: "sertifikat", label: "Kelola Sertifikat", icon: Award },
  { id: "forum", label: "Kelola Forum Diskusi", icon: MessageSquare },
  { id: "komentar", label: "Kelola Komentar Forum", icon: MessageSquare },
  { id: "sharing", label: "Kelola Praktik Baik", icon: Play },
  { id: "hasil_karya", label: "Kelola Hasil Karya", icon: UploadCloud },
  { id: "struktur_org", label: "Kelola KKG & Gugus", icon: Users },
  { id: "penghargaan", label: "Kelola Penghargaan", icon: Trophy },
  { id: "pengaturan", label: "Pengaturan Website", icon: Settings },
];

const guruMenu = [
  { id: "overview", label: "Dashboard Guru", icon: LayoutDashboard },
  { id: "profil", label: "Profil Saya", icon: Users },
  { id: "jadwal", label: "Jadwal KKG", icon: Calendar },
  { id: "materi", label: "Materi KKG", icon: BookOpen },
  { id: "notulen", label: "Notulen Rapat", icon: FileText },
  { id: "pelatihan", label: "Pelatihan", icon: GraduationCap },
  { id: "forum", label: "Forum Diskusi", icon: MessageSquare },
  { id: "sharing", label: "Sharing Praktik Baik", icon: Play },
  { id: "upload_karya", label: "Upload Hasil Karya", icon: UploadCloud },
];

const adminMenuGroups = [
  {
    title: "Ikhtisar",
    items: ["overview", "user", "guru", "finance"],
  },
  {
    title: "Konten Publik",
    items: ["berita", "pengumuman", "galeri"],
  },
  {
    title: "Akademik",
    items: ["agenda", "materi", "notulen", "pelatihan", "sertifikat"],
  },
  {
    title: "Forum & Karya",
    items: ["forum", "komentar", "sharing", "hasil_karya", "penghargaan"],
  },
  {
    title: "Sistem",
    items: ["sekolah", "struktur_org", "pengaturan"],
  },
];

// Helper for notifications
const getNotificationIcon = (name: string) => {
  switch (name) {
    case "Megaphone":
      return Megaphone;
    case "Calendar":
      return Calendar;
    case "MessageSquare":
      return MessageSquare;
    default:
      return Bell;
  }
};

export default function Dashboard({
  user: initialUser,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [user, setUser] = useState(initialUser);

  // Set Page Title
  useEffect(() => {
    const fullName = user.nama || user.full_name || user.username || "User";
    document.title = `Dasbord ${fullName} | Gugus 3 Melati`;
  }, [user]);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      Ikhtisar: true,
      "Konten Publik": true,
      Akademik: false,
      "Forum & Karya": false,
      Sistem: false,
    },
  );

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("readNotifs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const notificationRef = useRef<HTMLDivElement>(null);

  const hasUnread = notifications.some(
    (n) => !readIds.includes(`${n.type}-${n.id}`),
  );

  const handleOpenNotifications = () => {
    if (!isNotificationsOpen) {
      // Mark all displayed notifications as read
      const newReadIds = Array.from(
        new Set([...readIds, ...notifications.map((n) => `${n.type}-${n.id}`)]),
      );
      setReadIds(newReadIds);
      localStorage.setItem("readNotifs", JSON.stringify(newReadIds));
    }
    setNotificationsOpen(!isNotificationsOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
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
          supabase
            .from("posts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("forum_posts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const combined = [
          ...(postsRes.data || []).map((p) => ({
            id: p.id,
            type: "post",
            title: p.category === "berita" ? "Berita Baru" : "Pengumuman Baru",
            message: p.title,
            time: new Date(p.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            iconName: p.category === "berita" ? "Megaphone" : "Bell",
            link: `/dashboard/${p.category === "berita" ? "berita" : "pengumuman"}`,
            raw_date: p.created_at,
          })),
          ...(eventsRes.data || []).map((e) => ({
            id: e.id,
            type: "event",
            title: "Agenda Baru",
            message: e.title,
            time: new Date(e.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            iconName: "Calendar",
            link: "/dashboard/agenda",
            raw_date: e.created_at,
          })),
          ...(forumRes.data || []).map((f) => ({
            id: f.id,
            type: "forum",
            title: "Topik Forum Baru",
            message: f.title,
            time: new Date(f.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            iconName: "MessageSquare",
            link: "/dashboard/forum",
            raw_date: f.created_at,
          })),
        ];

        setNotifications(
          combined
            .sort(
              (a, b) =>
                new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime(),
            )
            .slice(0, 8),
        );
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }
    fetchNotifications();
  }, []);

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false,
  );
  const navigate = useNavigate();
  const location = useLocation();

  // Ensure desktop state is accurate
  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize(); // Call once to be sure
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { content, updateContent, saveMessage, isLoading } = useSiteContent();

  const [heroForm, setHeroForm] = useState(content.hero);
  const [profilForm, setProfilForm] = useState(content.profil);
  const [footerForm, setFooterForm] = useState(content.footer);
  const [statsForm, setStatsForm] = useState(content.stats);
  const [kkgForm, setKkgForm] = useState(content.kkg || defaultContent.kkg);
  const [gugusForm, setGugusForm] = useState(
    content.gugus || defaultContent.gugus,
  );
  const [schoolsForm, setSchoolsForm] = useState(content.schools);
  const [newsForm, setNewsForm] = useState(content.news);
  const [galleryForm, setGalleryForm] = useState(content.gallery);
  const [agendaForm, setAgendaForm] = useState(content.agenda);
  const [announcementForm, setAnnouncementForm] = useState(
    content.announcement || { title: "", subtitle: "", desc: "" },
  );
  const [activeMenusForm, setActiveMenusForm] = useState(
    (content as any).activeMenus || {},
  );

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
      setActiveMenusForm((content as any).activeMenus || {});
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
      announcement: announcementForm,
      activeMenus: activeMenusForm,
    });
  };

  const isAdmin = user.role?.toLowerCase() === "admin";
  const menuItems = isAdmin
    ? adminMenu
    : guruMenu.filter((item) => {
        const activeMenus = (content as any).activeMenus;
        if (isLoading) return true;
        // Default to visible if not explicitly hidden in settings
        if (
          !activeMenus ||
          typeof activeMenus !== "object" ||
          activeMenus[item.id] === undefined
        )
          return true;
        return !!activeMenus[item.id];
      });

  // Get active tab from path
  const currentPath = location.pathname.split("/").pop() || "overview";
  const activeTab = (menuItems || []).find((m) => m.id === currentPath)
    ? currentPath
    : "overview";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-soft-black selection:bg-main-blue selection:text-white overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isDesktop || isSidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-[280px] bg-white border-r border-gray-100 flex-shrink-0 fixed md:sticky inset-y-0 left-0 z-50 flex flex-col shadow-2xl md:shadow-none bg-white/95 backdrop-blur-xl"
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-main-blue to-leaf-green flex items-center justify-center p-1 overflow-hidden shadow-lg shadow-main-blue/20"
            >
              <img
                src="https://www.image2url.com/r2/default/images/1778156189287-e4930eb4-3c36-4ace-8420-ca8908132e66.png"
                alt="Logo"
                className="w-full h-full object-contain bg-white rounded-lg"
              />
            </motion.div>
            <div>
              <h1 className="font-heading font-black bg-clip-text text-transparent bg-gradient-to-r from-main-blue to-leaf-green text-xl leading-tight">
                Gugus 3
              </h1>
              <div className="mt-1">
                <span className="text-[10px] uppercase tracking-wider text-main-blue font-bold px-2 py-0.5 bg-main-blue/10 rounded-full">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <button
            className="md:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
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
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {group.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded ? "auto" : 0,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.04, 0.62, 0.23, 0.98],
                    }}
                    className="overflow-hidden space-y-1"
                  >
                    {group.items.map((itemId) => {
                      const menu = adminMenu.find((m) => m.id === itemId);
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
                              ? "text-main-blue"
                              : "text-gray-600 hover:text-soft-black hover:bg-gray-50"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="active-sidebar-admin"
                              className="absolute inset-0 bg-main-blue/10 rounded-xl"
                              initial={false}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                          <Icon
                            className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-main-blue" : "text-gray-400 group-hover:text-main-blue/70"}`}
                          />
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
                        ? "text-main-blue"
                        : "text-gray-600 hover:text-soft-black hover:bg-gray-50"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-sidebar-guru"
                        className="absolute inset-0 bg-main-blue/10 rounded-xl"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon
                      className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-main-blue" : "text-gray-400 group-hover:text-main-blue/70"}`}
                    />
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
            <button
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold font-heading text-soft-black hidden sm:block">
              {menuItems.find((m) => m.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleOpenNotifications}
                className="relative p-2 text-gray-400 hover:text-main-blue hover:bg-main-blue/5 rounded-xl transition-all"
              >
                <Bell className="w-6 h-6" />
                {hasUnread && (
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
                      <h3 className="font-bold text-soft-black">
                        Notifikasi Terbaru
                      </h3>
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
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  notif.type === "post"
                                    ? "bg-blue-50 text-blue-600"
                                    : notif.type === "event"
                                      ? "bg-orange-50 text-orange-600"
                                      : "bg-green-50 text-green-600"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-400 mb-0.5 uppercase tracking-wider">
                                  {notif.title}
                                </p>
                                <p className="text-sm text-soft-black font-medium line-clamp-2 group-hover:text-main-blue transition-colors">
                                  {notif.message}
                                </p>
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
                          <p className="text-gray-500 text-sm">
                            Tidak ada notifikasi baru
                          </p>
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <button
                        onClick={() => navigate("/dashboard/pengumuman")}
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
                <p className="text-sm font-bold text-soft-black">
                  {user.nama || user.full_name || user.username || user.role}
                </p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-main-blue to-leaf-green p-0.5 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate("/dashboard/profil")}
              >
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                  <img
                    src={
                      user.foto ||
                      user.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama || user.username || "U")}&background=6366f1&color=fff`
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main
          className="flex-1 overflow-y-auto p-6 md:p-10 relative"
          id="dashboard-main"
        >
          <div className="max-w-9xl mx-auto">
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-3"
              >
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
                  <Route
                    path="/"
                    element={<Navigate to="overview" replace />}
                  />
                  <Route
                    path="overview"
                    element={
                      user.role?.toLowerCase() === "admin" ? (
                        <AdminOverview user={user} />
                      ) : (
                        <GuruOverview user={user} />
                      )
                    }
                  />

                  {/* Admin Routes */}
                  {user.role?.toLowerCase() === "admin" && (
                    <>
                      <Route
                        path="pengaturan"
                        element={<AdminSettingsForm />}
                      />
                      <Route path="user" element={<AdminUserManagement />} />
                      <Route
                        path="sekolah"
                        element={<AdminSekolahForm user={user} />}
                      />
                      <Route
                        path="berita"
                        element={<AdminBeritaForm user={user} />}
                      />
                      <Route
                        path="galeri"
                        element={<AdminGaleriForm user={user} />}
                      />
                      <Route
                        path="kkg"
                        element={
                          <AdminKKGForm
                            kkgForm={kkgForm}
                            setKkgForm={setKkgForm}
                            handleSaveContent={handleSaveContent}
                            updateContent={updateContent}
                          />
                        }
                      />
                      <Route
                        path="agenda"
                        element={<AdminAgendaForm user={user} />}
                      />
                      <Route
                        path="gugus"
                        element={
                          <AdminGugusForm
                            gugusForm={gugusForm}
                            setGugusForm={setGugusForm}
                            handleSaveContent={handleSaveContent}
                          />
                        }
                      />
                      <Route
                        path="struktur_org"
                        element={<AdminStrukturManager />}
                      />
                      <Route
                        path="penghargaan"
                        element={<AdminPenghargaanForm />}
                      />
                      <Route
                        path="pengumuman"
                        element={<AdminPengumumanForm />}
                      />
                      <Route
                        path="guru"
                        element={<AdminGuruForm user={user} />}
                      />
                      <Route
                        path="finance"
                        element={<AdminFinanceManagement user={user} />}
                      />
                      <Route
                        path="materi"
                        element={
                          <DataManagementTable
                            user={user}
                            table="kkg_materials"
                            title="Materi KKG"
                            icon={BookOpen}
                            fields={[
                              { name: "title", label: "Judul" },
                              { name: "description", label: "Deskripsi" },
                              { name: "category", label: "Kategori" },
                              {
                                name: "file_url",
                                label: "URL Link Materi",
                                type: "text",
                              },
                            ]}
                          />
                        }
                      />
                      <Route
                        path="notulen"
                        element={
                          <DataManagementTable
                            user={user}
                            table="meeting_minutes"
                            title="Notulen Rapat"
                            icon={FileText}
                            fields={[
                              { name: "title", label: "Judul Notulen" },
                              {
                                name: "date",
                                label: "Tanggal Rapat",
                                type: "date",
                              },
                              {
                                name: "content",
                                label: "Konten / Isi Notulen",
                                type: "textarea",
                              },
                              {
                                name: "file_url",
                                label: "URL Lampiran (Opsional)",
                                type: "text",
                              },
                            ]}
                          />
                        }
                      />
                      <Route
                        path="pelatihan"
                        element={
                          <DataManagementTable
                            user={user}
                            table="trainings"
                            title="Sistem Manajemen Pelatihan"
                            icon={GraduationCap}
                            fields={[
                              { name: "title", label: "Judul Pelatihan" },
                              {
                                name: "description",
                                label: "Deskripsi Lengkap",
                                type: "textarea",
                              },
                              {
                                name: "location",
                                label: "Lokasi / Link Pelatihan",
                              },
                              {
                                name: "date_start",
                                label: "Tanggal Pelaksanaan",
                                type: "date",
                              },
                              {
                                name: "materi_url",
                                label: "URL Materi / Slide (Opsional)",
                                type: "url",
                              },
                              {
                                name: "video_url",
                                label: "URL Video / Rekaman (Opsional)",
                                type: "url",
                              },
                              {
                                name: "status",
                                label: "Status Publikasi",
                                type: "select",
                                options: [
                                  { label: "Direncanakan", value: "planned" },
                                  {
                                    label: "Sedang Berlangsung",
                                    value: "ongoing",
                                  },
                                  { label: "Selesai", value: "completed" },
                                ],
                              },
                            ]}
                          />
                        }
                      />
                      <Route
                        path="sertifikat"
                        element={<AdminCertificateManager user={user} />}
                      />
                      <Route
                        path="forum"
                        element={
                          <DataManagementTable
                            user={user}
                            table="forum_posts"
                            title="Forum Diskusi"
                            icon={MessageSquare}
                            fields={[
                              { name: "title", label: "Judul" },
                              {
                                name: "content",
                                label: "Konten",
                                type: "textarea",
                              },
                              { name: "category", label: "Kategori" },
                            ]}
                          />
                        }
                      />
                      <Route
                        path="komentar"
                        element={
                          <DataManagementTable
                            user={user}
                            table="forum_comments"
                            title="Komentar Forum"
                            icon={MessageSquare}
                            fields={[
                              { name: "post_id", label: "Post ID" },
                              {
                                name: "content",
                                label: "Konten",
                                type: "textarea",
                              },
                              { name: "user_id", label: "User ID" },
                            ]}
                          />
                        }
                      />
                      <Route
                        path="sharing"
                        element={<SharingPractices user={user} />}
                      />
                      <Route
                        path="hasil_karya"
                        element={
                          <DataManagementTable
                            user={user}
                            table="teacher_works"
                            title="Hasil Karya Guru"
                            icon={UploadCloud}
                            fields={[
                              { name: "title", label: "Judul Karya" },
                              { name: "description", label: "Deskripsi" },
                              { name: "work_type", label: "Jenis Karya" },
                              {
                                name: "file_url",
                                label: "URL File",
                                type: "file",
                              },
                            ]}
                          />
                        }
                      />
                      <Route
                        path="profil"
                        element={
                          <UserProfileEdit
                            user={user}
                            onUpdate={(updated: any) =>
                              setUser((prev) => ({ ...prev, ...updated }))
                            }
                          />
                        }
                      />
                    </>
                  )}

                  {/* Guru Routes */}
                  {user.role?.toLowerCase() === "guru" && (
                    <>
                      <Route
                        path="profil"
                        element={
                          <UserProfileEdit
                            user={user}
                            onUpdate={(updated: any) =>
                              setUser((prev) => ({ ...prev, ...updated }))
                            }
                          />
                        }
                      />
                      <Route path="jadwal" element={<TeacherJadwalCards />} />
                      <Route
                        path="materi"
                        element={
                          <DataViewList
                            table="kkg_materials"
                            title="Materi KKG"
                            icon={BookOpen}
                          />
                        }
                      />
                      <Route
                        path="notulen"
                        element={
                          <DataViewList
                            table="meeting_minutes"
                            title="Notulen Rapat"
                            icon={FileText}
                          />
                        }
                      />
                      <Route
                        path="pelatihan"
                        element={<TeacherTrainingCards user={user} />}
                      />
                      <Route path="absensi" element={<TeacherAttendance user={user} />} />
                      <Route
                        path="sertifikat"
                        element={
                          <DataViewList
                            table="training_certificates"
                            title="Sertifikat Saya"
                            icon={Award}
                            filterColumn="user_id"
                            filterValue={user.id}
                          />
                        }
                      />
                      <Route
                        path="forum"
                        element={<ForumSystem user={user} />}
                      />
                      <Route
                        path="sharing"
                        element={<SharingPractices user={user} />}
                      />
                      <Route
                        path="upload_karya"
                        element={
                          <DataManagementTable
                            table="teacher_works"
                            title="Upload Hasil Karya"
                            icon={UploadCloud}
                            fields={[
                              { name: "title", label: "Judul Karya" },
                              { name: "description", label: "Deskripsi" },
                              { name: "work_type", label: "Jenis Karya" },
                              {
                                name: "file_url",
                                label: "URL File",
                                type: "url",
                              },
                            ]}
                          />
                        }
                      />
                      <Route
                        path="pengaturan_akun"
                        element={
                          <UserProfileEdit
                            user={user}
                            onUpdate={(updated: any) =>
                              setUser((prev) => ({ ...prev, ...updated }))
                            }
                          />
                        }
                      />
                    </>
                  )}

                  {/* Fallback for other tabs */}
                  <Route
                    path="*"
                    element={
                      <TabPlaceholder
                        menuItems={menuItems}
                        activeTab={activeTab}
                      />
                    }
                  />
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
function TabPlaceholder({
  menuItems,
  activeTab,
}: {
  menuItems: any[];
  activeTab: string;
}) {
  const activeLabel = menuItems.find((m) => m.id === activeTab)?.label;
  const ActiveIcon =
    menuItems.find((m) => m.id === activeTab)?.icon || LayoutDashboard;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-main-orange/30 shadow-xl min-h-[400px] flex items-center justify-center relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-main-blue/5 rounded-full blur-3xl" />
      <div className="text-center text-gray-500 relative z-10">
        <ActiveIcon
          className="w-20 h-20 mx-auto mb-6 text-main-blue/30"
          strokeWidth={1}
        />
        <h2 className="text-2xl font-heading font-bold text-soft-black mb-2">
          {activeLabel}
        </h2>
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
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failure: number;
    errors?: any[];
  } | null>(null);

  const [userList, setUserList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [previewUsers, setPreviewUsers] = useState<any[] | null>(null);

  // Manual User Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    nama: "",
    nip: "",
    role: "guru",
    sekolah: "",
    jabatan: "",
    kepegawaian: "",
    pangkat: "",
    foto: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch("/api/debug/list-users");
      if (!response.ok) {
        throw new Error("Gagal mengambil data user");
      }

      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        setUserList(data || []);
      } catch (e) {
        console.error(
          "Non-JSON response from list-users:",
          responseText.substring(0, 50),
        );
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
      const endpoint = editId
        ? "/api/admin/update-user"
        : "/api/setup/create-user";
      const body = editId ? { ...formData, id: editId } : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let result;
      const responseText = await response.text();
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          `Koneksi ke server gagal atau sedang offline. (Ext: ${responseText.substring(0, 40)})`,
        );
      }

      if (!response.ok) throw new Error(result.error || "Gagal memproses user");

      await alert(
        editId
          ? `Akun '${formData.username}' berhasil diperbarui.`
          : `Sukses! Akun '${formData.username}' berhasil dibuat.`,
      );
      setShowAddForm(false);
      setEditId(null);
      setFormData({
        username: "",
        password: "",
        email: "",
        nama: "",
        nip: "",
        role: "guru",
        sekolah: "",
        jabatan: "",
        kepegawaian: "",
        pangkat: "",
        foto: "",
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
      username: user.username || "",
      password: "",
      email: user.email || "",
      nama: user.nama || "",
      nip: user.nip || "",
      role: user.role || "guru",
      sekolah: user.sekolah || "",
      jabatan: user.jabatan || "",
      kepegawaian: user.kepegawaian || "",
      pangkat: user.pangkat || "",
      foto: user.foto || "",
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = await confirm(
      `Apakah Anda yakin ingin menghapus akun '${name}'? Tindakan ini tidak dapat dibatalkan.`,
    );
    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/delete-user/${id}`, {
        method: "DELETE",
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
        Pangkat: "Penata / IIIc",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template User");
    XLSX.writeFile(wb, "Template_User_Gugus3.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          alert("File Excel kosong atau tidak terbaca.", "Gagal", "error");
          return;
        }

        const formattedUsers = jsonData.map((row) => {
          const normalizedRow: Record<string, any> = {};
          for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
              const cleanKey = key.trim().toLowerCase();
              normalizedRow[cleanKey] = row[key];
            }
          }

          const nama = String(
            normalizedRow["nama"] ||
              normalizedRow["nama lengkap"] ||
              normalizedRow["penerima"] ||
              ""
          );

          let email =
            normalizedRow["email"] !== undefined
              ? String(normalizedRow["email"]).trim()
              : "";

          let username = "";
          if (
            normalizedRow["username"] !== undefined &&
            String(normalizedRow["username"]).trim() !== ""
          ) {
            username = String(normalizedRow["username"]).trim();
          } else if (
            normalizedRow["user name"] !== undefined &&
            String(normalizedRow["user name"]).trim() !== ""
          ) {
            username = String(normalizedRow["user name"]).trim();
          }

          if (!username) {
            username =
              nama.toLowerCase().replace(/[^a-z0-9]/g, "") +
              Math.floor(Math.random() * 1000);
          }

          if (!email || !email.includes("@")) {
            email = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Math.floor(Math.random() * 10000)}@gugus3.local`;
          }

          let password = "";
          if (
            normalizedRow["password"] !== undefined &&
            String(normalizedRow["password"]).trim() !== ""
          ) {
            password = String(normalizedRow["password"]).trim();
          } else if (
            normalizedRow["kata sandi"] !== undefined &&
            String(normalizedRow["kata sandi"]).trim() !== ""
          ) {
            password = String(normalizedRow["kata sandi"]).trim();
          }

          if (password && password.length < 6) {
            password = password.padEnd(6, "0");
          }

          if (!password) {
            password = "Gugus3Melati123!";
          }

          return {
            username: username,
            email: email,
            password: password,
            role: String(normalizedRow["role"] || normalizedRow["peran"] || "guru")
              .trim()
              .toLowerCase(),
            nama: nama,
            nip:
              normalizedRow["nip"] !== undefined
                ? String(normalizedRow["nip"]).trim()
                : normalizedRow["n i p"] !== undefined
                  ? String(normalizedRow["n i p"]).trim()
                  : "",
            kepegawaian:
              normalizedRow["kepegawaian"] !== undefined
                ? String(normalizedRow["kepegawaian"]).trim()
                : normalizedRow["status kepegawaian"] !== undefined
                  ? String(normalizedRow["status kepegawaian"]).trim()
                  : "",
            pangkat:
              normalizedRow["pangkat"] !== undefined
                ? String(normalizedRow["pangkat"]).trim()
                : normalizedRow["pangkat/golongan"] !== undefined
                  ? String(normalizedRow["pangkat/golongan"]).trim()
                  : normalizedRow["golongan"] !== undefined
                    ? String(normalizedRow["golongan"]).trim()
                    : "",
            jabatan:
              normalizedRow["jabatan"] !== undefined
                ? String(normalizedRow["jabatan"]).trim()
                : "",
            sekolah:
              normalizedRow["sekolah"] !== undefined
                ? String(normalizedRow["sekolah"]).trim()
                : normalizedRow["asal sekolah"] !== undefined
                  ? String(normalizedRow["asal sekolah"]).trim()
                  : normalizedRow["unit kerja"] !== undefined
                    ? String(normalizedRow["unit kerja"]).trim()
                    : "",
          };
        });

        setPreviewUsers(formattedUsers);
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      alert("Gagal membaca file: " + err.message, "Error", "error");
    } finally {
      e.target.value = "";
    }
  };

  const confirmUpload = async () => {
    if (!previewUsers) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const response = await fetch("/api/admin/bulk-create-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: previewUsers }),
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

      setUploadResult({
        success: successCount,
        failure: failureCount,
        errors: result.errors || [],
      });

      if (successCount === 0 && failureCount > 0) {
        alert("Peringatan: Tidak ada akun yang berhasil dibuat. Ini kemungkinan besar masalah konfigurasi database yang perlu diperbaiki dengan SQL FIX.", "Gagal Total", "error");
      } else if (failureCount > 0) {
        alert(`Berhasil: ${successCount}, Gagal: ${failureCount}. Periksa daftar kesalahan di bawah.`, "Selesai dengan Error", "info");
      } else {
        alert(`Berhasil mengimpor ${successCount} akun.`, "Sukses", "success");
      }

      if (successCount > 0) {
        fetchUsers();
      }
      setPreviewUsers(null);
    } catch (err: any) {
      alert(err.message, "Upload Gagal", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Clean White Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-main-blue shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Manajemen User
            </h2>
            <p className="text-gray-500 text-sm">
              Kelola akun Admin dan Guru dalam sistem dengan kontrol akses yang presisi.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                setEditId(null);
                setFormData({
                  username: "",
                  password: "",
                  email: "",
                  nama: "",
                  nip: "",
                  role: "guru",
                  sekolah: "",
                  jabatan: "",
                  kepegawaian: "",
                  pangkat: "",
                  foto: "",
                });
              } else {
                setShowAddForm(true);
              }
            }}
            className="px-6 py-3 bg-main-blue text-white flex items-center gap-2 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-main-blue/90 active:scale-95 transition-all shadow-md"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {showAddForm ? "Tutup Form" : "Tambah User"}
          </button>

          <label className="px-6 py-3 bg-leaf-green text-white flex items-center gap-2 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-leaf-green/90 active:scale-95 transition-all shadow-md cursor-pointer">
            <UploadCloud className="w-4 h-4" />
            {isUploading ? "Mengunggah..." : "Mass Upload"}
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end pr-2">
          <button
            onClick={downloadTemplate}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 flex items-center gap-2 font-bold rounded-xl hover:bg-gray-200 transition-all text-xs uppercase tracking-widest border border-gray-200"
          >
            <Download className="w-4 h-4" /> Download Template Excel
          </button>
      </div>

      <AnimatePresence>
        {previewUsers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8 bg-blue-50 p-6 rounded-3xl border border-blue-100 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900">
                    Preview Data Excel
                  </h3>
                  <p className="text-sm text-blue-600">
                    Silakan tinjau data berikut sebelum diimpor ke sistem.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewUsers(null)}
                  className="px-5 py-2 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={confirmUpload}
                  disabled={isUploading}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? "Mengunggah..." : `Konfirmasi & Impor ${previewUsers.length} Akun`}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-blue-100 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-blue-50 text-blue-900 sticky top-0">
                  <tr className="border-b border-blue-100">
                    <th className="p-4 font-bold">Nama</th>
                    <th className="p-4 font-bold">Username</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Password</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold">Sekolah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewUsers.map((user, idx) => {
                    const isDuplicateInExcel = previewUsers.some((u, i) => i !== idx && u.username === user.username);
                    const alreadyExistsInDB = userList.some(u => u.username === user.username);
                    const isDuplicate = isDuplicateInExcel || alreadyExistsInDB;
                    const hasMissingInfo = !user.nama || !user.username;
                    
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${isDuplicate || hasMissingInfo ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-blue-50/30'}`}
                      >
                        <td className="p-4 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            {user.nama || <span className="text-red-400 italic">Tanpa Nama</span>}
                            {hasMissingInfo && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" title="Informasi Penting Hilang" />}
                          </div>
                        </td>
                        <td className={`p-4 font-mono text-xs ${isDuplicate ? 'text-red-600 font-bold' : 'text-blue-600'}`}>
                          {user.username}
                          {isDuplicateInExcel && <span className="ml-1 text-[8px] uppercase">(Duplikat Excel)</span>}
                          {alreadyExistsInDB && <span className="ml-1 text-[8px] uppercase">(Sudah ada di Sistem)</span>}
                        </td>
                        <td className="p-4 font-mono text-xs text-gray-500">
                          {user.email}
                        </td>
                        <td className="p-4 text-gray-400 text-xs">
                          {user.password === "Gugus3Melati123!" ? "Default" : (user.password.length < 6 ? "Terlalu Pendek" : "Custom")}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{user.sekolah || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <p className="mt-4 text-[11px] text-blue-500 italic flex items-center gap-1">
              <Info className="w-3 h-3" /> Tip: Username dan Email akan otomatis dibuat unik jika kolom dikosongkan di Excel.
            </p>
          </motion.div>
        )}

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white p-8 rounded-3xl border border-blue-100"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-main-blue">
              {editId ? (
                <PenTool className="w-5 h-5" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
              {editId ? "Edit User" : "Tambah User Baru"}
            </h3>
            <form
              onSubmit={handleManualSubmit}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div className="space-y-1 lg:col-span-3">
                <ImageUpload
                  label="Unggah Foto Profil"
                  value={formData.foto}
                  onChange={(base64) =>
                    setFormData({ ...formData, foto: base64 })
                  }
                  maxWidth={400}
                  maxHeight={400}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Username
                </label>
                <input
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="e.g. budismart"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Email (Opsional)
                </label>
                <input
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="guru@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nama Lengkap
                </label>
                <input
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  placeholder="Nama Beserta Gelar"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  NIP
                </label>
                <input
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                  value={formData.nip}
                  onChange={(e) =>
                    setFormData({ ...formData, nip: e.target.value })
                  }
                  placeholder="NIP (jika ada)"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Peran (Role)
                </label>
                <select
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none bg-white"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="guru">Guru</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="space-y-1 lg:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Sekolah
                </label>
                <input
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                  value={formData.sekolah}
                  onChange={(e) =>
                    setFormData({ ...formData, sekolah: e.target.value })
                  }
                  placeholder="Asal Sekolah"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Jabatan
                </label>
                <input
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                  value={formData.jabatan}
                  onChange={(e) =>
                    setFormData({ ...formData, jabatan: e.target.value })
                  }
                  placeholder="e.g. Guru Kelas IV"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Kepegawaian
                </label>
                <select
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none bg-white"
                  value={formData.kepegawaian}
                  onChange={(e) =>
                    setFormData({ ...formData, kepegawaian: e.target.value })
                  }
                >
                  <option value="">Pilih Status</option>
                  <option value="PNS">PNS</option>
                  <option value="PPPK">PPPK</option>
                  <option value="GTT">GTT</option>
                  <option value="Honorer">Honorer</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Pangkat / Golongan
                </label>
                <input
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none"
                  value={formData.pangkat}
                  onChange={(e) =>
                    setFormData({ ...formData, pangkat: e.target.value })
                  }
                  placeholder="e.g. Penata / IIIc"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4">
                {formError && (
                  <p className="text-red-500 text-sm italic py-2">
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3 bg-gradient-to-r from-main-blue to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : editId
                      ? "Perbarui User"
                      : "Simpan User"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full">
        {/* Banner info upload jika ada */}
        {uploadResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <UploadCloud className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">
                    Proses Upload Selesai
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    {uploadResult.success} Akun berhasil dibuat,{" "}
                    {uploadResult.failure} Gagal.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadResult(null)}
                className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-2 bg-white/60 p-4 rounded-xl max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-red-600 uppercase">
                    Daftar Akun Gagal:
                  </h4>
                  {uploadResult.errors.some(e => e.error?.includes("Trigger Database")) && (
                    <button 
                      onClick={() => {
                        const win = window.open("", "_blank");
                        if (win) {
                          win.document.write(`
                            <html>
                              <head>
                                <title>SQL FIX - GUGUS 3 MELATI</title>
                                <style>
                                  body { font-family: monospace; background: #1a1a1a; color: #00ff00; padding: 20px; }
                                  pre { white-space: pre-wrap; word-wrap: break-word; }
                                  button { padding: 10px 20px; background: #00ff00; color: #000; border: none; cursor: pointer; font-weight: bold; margin-bottom: 20px; border-radius: 5px; }
                                </style>
                              </head>
                              <body>
                                <h1>SQL FIX UNTUK TRIGGER DATABASE</h1>
                                <p>Salin kode di bawah ini dan jalankan di SQL Editor Supabase Anda.</p>
                                <button onclick="navigator.clipboard.writeText(document.getElementById('sqlcode').innerText).then(() => alert('Teks SQL disalin!'))">SALIN KODE SQL</button>
                                <pre id="sqlcode">
-- 1. Pastikan kolom foto/avatar_url sinkron
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='avatar_url') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='foto') THEN
    ALTER TABLE public.user_profiles RENAME COLUMN avatar_url TO foto;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='foto') THEN
    ALTER TABLE public.user_profiles ADD COLUMN foto TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='password_text') THEN
    ALTER TABLE public.user_profiles ADD COLUMN password_text TEXT;
  END IF;
END $$;

-- 2. Perbaiki Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
  target_role public.user_role;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  default_username := LEFT(COALESCE(NULLIF(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1)), 50);
  final_username := default_username;
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username AND id != new.id) LOOP
    counter := counter + 1;
    final_username := LEFT(default_username, 40) || '_' || counter || '_' || SUBSTRING(new.id::text, 1, 4);
  END LOOP;
  IF (new.raw_user_meta_data->>'role' = 'admin') THEN
    target_role := 'admin'::public.user_role;
  ELSE
    target_role := 'guru'::public.user_role;
  END IF;
  INSERT INTO public.user_profiles (id, username, email, role, nama, foto, nip, kepegawaian, pangkat, jabatan, sekolah, password_text, created_at)
  VALUES (new.id, final_username, new.email, target_role, COALESCE(new.raw_user_meta_data->>'nama', new.raw_user_meta_data->>'full_name', final_username), COALESCE(new.raw_user_meta_data->>'foto', new.raw_user_meta_data->>'avatar_url', ''), COALESCE(new.raw_user_meta_data->>'nip', ''), COALESCE(new.raw_user_meta_data->>'kepegawaian', ''), COALESCE(new.raw_user_meta_data->>'pangkat', ''), COALESCE(new.raw_user_meta_data->>'jabatan', ''), COALESCE(new.raw_user_meta_data->>'sekolah', ''), new.raw_user_meta_data->>'password_text', now())
  ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, email = EXCLUDED.email, nama = EXCLUDED.nama, role = EXCLUDED.role, nip = EXCLUDED.nip, kepegawaian = EXCLUDED.kepegawaian, pangkat = EXCLUDED.pangkat, jabatan = EXCLUDED.jabatan, sekolah = EXCLUDED.sekolah, foto = EXCLUDED.foto, password_text = COALESCE(EXCLUDED.password_text, public.user_profiles.password_text);
  RETURN new;
EXCEPTION WHEN OTHERS THEN
    BEGIN
      INSERT INTO public.user_profiles (id, username, email, role)
      VALUES (new.id, 'user_' || SUBSTRING(new.id::text, 1, 8), new.email, 'guru'::public.user_role)
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN END;
    RETURN new;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
                                </pre>
                              </body>
                            </html>
                          `);
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 animate-pulse"
                    >
                      SOLUSI: PERBAIKI DATABASE
                    </button>
                  )}
                </div>
                <ul className="text-xs text-red-500 space-y-1">
                  {uploadResult.errors.map((error: any, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-bold whitespace-nowrap min-w-[100px]">{error.username || error.email || "Unknown"}:</span>
                      <span>{error.error || "Gagal membuat akun."}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* User List Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg">Daftar Akun Sistem</h3>
            <button
              onClick={fetchUsers}
              className="p-2 text-gray-400 hover:text-main-blue hover:bg-main-blue/5 rounded-lg transition-all"
            >
              <Activity
                className={`w-5 h-5 ${isLoadingUsers ? "animate-spin" : ""}`}
              />
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
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-400 italic"
                    >
                      Belum ada user yang terdaftar.
                    </td>
                  </tr>
                )}
                {userList.map((usr, i) => (
                  <tr
                    key={usr.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={
                          usr.foto ||
                          usr.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(usr.nama || usr.username || "U")}&background=random`
                        }
                        className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-soft-black text-sm">
                        {usr.nama || "-"}
                      </div>
                      <div className="text-xs text-main-blue font-mono">
                        {usr.username}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-gray-600">
                        {usr.nip || "-"}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase">
                        {usr.jabatan || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${usr.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}
                      >
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {usr.sekolah || "-"}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {usr.password_text || (
                        <span className="text-gray-300 italic">
                          Tersembunyi
                        </span>
                      )}
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
                          onClick={() =>
                            handleDelete(usr.id, usr.nama || usr.username)
                          }
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

function AdminOverview({ user }: { user: any }) {
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
    murid: 0,
    sharing: 0,
  });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [chartData, setChartData] = useState<any[]>(dataChart);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStatsAndLogs = async () => {
      setIsStatsLoading(true);
      try {
        const [postRes, docRes, eventRes, userRes, schoolRes, logsRes, sharingRes] =
          await Promise.all([
            supabase
              .from("posts")
              .select("*", { count: "exact", head: true })
              .throwOnError(),
            supabase
              .from("documents")
              .select("*", { count: "exact", head: true })
              .throwOnError(),
            supabase
              .from("events")
              .select("*", { count: "exact", head: true })
              .throwOnError(),
            supabase
              .from("user_profiles")
              .select("*", { count: "exact", head: true })
              .throwOnError(),
            supabase
              .from("schools")
              .select("student_count, teacher_count, jenis_sekolah")
              .throwOnError(),
            supabase
              .from("activity_logs")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(50),
            supabase
              .from("best_practices")
              .select("*", { count: "exact", head: true }),
          ]);

        const postCount = postRes.count || 0;
        const docCount = docRes.count || 0;
        const eventCount = eventRes.count || 0;
        const userCount = userRes.count || 0;
        const schoolsData = schoolRes.data || [];
        const logsData = logsRes.data || [];
        const sharingCount = sharingRes.count || 0;

        const totalStudents = schoolsData.reduce(
          (acc: number, curr: any) => acc + (Number(curr.student_count) || 0),
          0,
        );
        const totalTeachers = schoolsData.reduce(
          (acc: number, curr: any) => acc + (Number(curr.teacher_count) || 0),
          0,
        );
        const schoolCount = schoolsData.length;
        const schoolIntiCount = schoolsData.filter(
          (s: any) => s.jenis_sekolah === "Sekolah Inti",
        ).length;
        const schoolImbasCount = schoolsData.filter(
          (s: any) => s.jenis_sekolah !== "Sekolah Inti",
        ).length;

        setDbStats({
          guru: totalTeachers,
          sekolah: schoolCount,
          sekolahInti: schoolIntiCount,
          sekolahImbas: schoolImbasCount,
          berita: postCount || 0,
          dokumen: docCount || 0,
          kegiatan: eventCount || 0,
          user: userCount || 0,
          murid: totalStudents,
          sharing: sharingCount,
        });

        setActivities(logsData as ActivityLog[]);

        // Prepare chart data from logs
        if (logsData.length > 0) {
          const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
          const today = new Date();
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(today.getDate() - (6 - i));
            return {
              date: date.toISOString().split("T")[0],
              name: days[date.getDay()],
              pengunjung: 0,
              aktivitas: 0,
            };
          });

          // Sort logs into these days
          logsData.forEach((log: any) => {
            const logDate = log.created_at.split("T")[0];
            const dayEntry = last7Days.find((d) => d.date === logDate);
            if (dayEntry) {
              if (log.action === "login") dayEntry.pengunjung += 1;
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
    {
      label: "Sekolah Inti",
      value: isStatsLoading ? "..." : dbStats.sekolahInti.toString(),
      icon: BookOpen,
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Sekolah Imbas",
      value: isStatsLoading ? "..." : dbStats.sekolahImbas.toString(),
      icon: BookOpen,
      color: "from-green-500 to-emerald-400",
    },
    {
      label: "Data Guru",
      value: isStatsLoading ? "..." : dbStats.guru.toString(),
      icon: Users,
      color: "from-orange-500 to-amber-400",
    },
    {
      label: "Data Siswa",
      value: isStatsLoading ? "..." : dbStats.murid.toString(),
      icon: GraduationCap,
      color: "from-rose-500 to-pink-400",
    },
    {
      label: "Total Berita",
      value: isStatsLoading ? "..." : dbStats.berita.toString(),
      icon: FileText,
      color: "from-purple-500 to-fuchsia-400",
    },
    {
      label: "Total User",
      value: isStatsLoading ? "..." : dbStats.user.toString(),
      icon: Shield,
      color: "from-indigo-500 to-violet-400",
    },
    {
      label: "Praktik Baik",
      value: isStatsLoading ? "..." : dbStats.sharing.toString(),
      icon: Play,
      color: "from-amber-500 to-orange-400",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Admin Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-main-blue shadow-sm mb-10 flex flex-col md:flex-row md:items-center gap-8">
        <div className="w-[90px] h-[120px] rounded-3xl bg-gray-100 p-1 overflow-hidden shadow-inner shrink-0 scale-95 border border-gray-200">
          <img
            src={
              user.foto ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.nama || user.full_name || "Admin"
              )}&background=1F8FE5&color=fff`
            }
            className="w-full h-full object-cover rounded-2xl"
            alt="Profile"
          />
        </div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-main-blue/10 rounded-full border border-main-blue/10 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-main-blue animate-pulse" />
            <span className="text-[10px] font-black text-main-blue uppercase tracking-widest">Administrator System</span>
          </div>
          <div className="text-xl md:text-2xl font-black font-heading leading-tight mb-2">
            <span className="text-orange-500">Selamat Datang,</span><br/>
            <span className="text-main-blue">{user.nama || user.full_name || "Admin Gugus 3"}</span>
          </div>
          <p className="text-sm text-gray-500 font-medium max-w-xl">
            Pusat kendali operasional GUGUS 3 Kecamatan Jenu. Monitor, kelola, dan tingkatkan performa ekosistem pendidikan kita.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={i}
            className="bg-white/80 backdrop-blur-xl border border-main-orange/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity`}
            />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-heading font-black text-soft-black">
                    {stat.value}
                  </h3>
                  {(stat as any).detail && (
                    <span className="text-[10px] font-bold text-main-blue bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {(stat as any).detail}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-main-orange/20 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-main-blue" /> Grafik Aktivitas
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dx={-10}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pengunjung"
                  name="Login User"
                  stroke="#0EA5E9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPv)"
                />
                <Area
                  type="monotone"
                  dataKey="aktivitas"
                  name="Aksi Admin/Guru"
                  stroke="#22C55E"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-main-orange/20 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-heading">
              Aktivitas Terbaru
            </h3>
            <button className="text-main-blue text-sm font-medium hover:underline">
              Lihat Semua
            </button>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {activities.length > 0 ? (
              activities.slice(0, 6).map((act, i) => {
                const date = new Date(act.created_at);
                const timeStr = date.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = date.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                });

                let color = "bg-blue-500";
                let Icon = Activity;

                if (act.action === "login") {
                  color = "bg-green-500";
                  Icon = Shield;
                } else if (act.action.includes("create")) {
                  color = "bg-blue-500";
                  Icon = PlusCircle;
                } else if (act.action.includes("update")) {
                  color = "bg-amber-500";
                  Icon = PenTool;
                } else if (act.action.includes("delete")) {
                  color = "bg-red-500";
                  Icon = Trash2;
                }

                return (
                  <div
                    key={i}
                    className="relative flex items-center justify-between md:justify-normal group is-active"
                  >
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-white ${color} text-white shrink-0 shadow flex-col absolute left-0 z-10`}
                    />
                    <div className="w-[calc(100%-2rem)] pl-8">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className="font-bold text-soft-black text-xs uppercase leading-tight">
                            {act.action.replace("_", " ")}
                          </h4>
                          <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">
                            {dateStr}, {timeStr}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 line-clamp-2">
                          {act.description}
                        </p>
                        <p className="text-[9px] text-main-blue mt-1 font-bold italic">
                          Oleh: {act.user_name}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <Activity className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400 italic">
                  Belum ada rekaman aktivitas.
                </p>
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
  const [counts, setCounts] = useState({
    pelatihan: 0,
    karya: 0,
  });

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      try {
        const { data: evData } = await supabase
          .from("events")
          .select("*")
          .order("date_start", { ascending: true })
          .limit(5);
        if (evData) setEvents(evData);

        const { data: newsData } = await supabase
          .from("posts")
          .select("*")
          .in("category", ["berita", "pengumuman"])
          .order("published_at", { ascending: false })
          .limit(3);
        if (newsData) setNews(newsData);

        const [pelatihanRes, karyaRes] = await Promise.all([
          supabase
            .from("trainings")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("teacher_works")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        setCounts({
          pelatihan: pelatihanRes.count || 0,
          karya: karyaRes.count || 0,
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [user.id]);

  const activities = [
    {
      title: "Pelatihan",
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-400",
      value: `${counts.pelatihan} Pelatihan Tersedia`,
      link: "/dashboard/pelatihan",
    },
    {
      title: "Hasil Karya",
      icon: UploadCloud,
      color: "from-green-500 to-emerald-400",
      value: `${counts.karya} Karya Diupload`,
      link: "/dashboard/upload_karya",
    },
    {
      title: "Agenda KKG",
      icon: Users,
      color: "from-purple-500 to-fuchsia-400",
      value: `${events.length} Agenda Aktif`,
      link: "/dashboard/jadwal",
    },
    {
      title: "Praktik Baik",
      icon: Play,
      color: "from-indigo-500 to-violet-400",
      value: "Bagikan Inspirasi",
      link: "/dashboard/sharing",
    },
    {
      title: "Materi KKG",
      icon: BookOpen,
      color: "from-amber-500 to-yellow-400",
      value: "Lihat Materi",
      link: "/dashboard/materi",
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      {/* Guru Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-main-blue shadow-sm mb-10 flex flex-col md:flex-row items-center gap-8">
        <div className="w-[90px] h-[120px] rounded-3xl bg-gray-100 p-1 overflow-hidden shadow-inner shrink-0 scale-95 border border-gray-200">
          <img
            src={
              user.foto ||
              user.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama || user.username || "U")}&background=6366f1&color=fff&size=512`
            }
            alt="User"
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-main-blue/10 rounded-full border border-main-blue/5 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-main-blue animate-pulse" />
            <span className="text-[10px] font-black text-main-blue uppercase tracking-widest leading-none">Pendidik GUGUS 3</span>
          </div>
          <div className="text-xl md:text-3xl font-black font-heading leading-tight mb-2">
            <span className="text-leaf-green">Selamat Datang,</span><br/>
            <span className="text-main-blue">{user.nama || user.full_name || "Guru"}! 👋</span>
          </div>
          <p className="text-sm text-gray-500 font-medium max-w-lg">
            Platform terintegrasi untuk administrasi, berbagi perangkat ajar, dan informasi kegiatan di lingkungan GUGUS 3.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={() => navigate("/dashboard/upload_karya")}
            className="px-6 py-3 bg-main-blue text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-main-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <UploadCloud className="w-4 h-4" /> Upload Hasil Karya
          </button>
          <button
            onClick={() => navigate("/dashboard/pelatihan")}
            className="px-6 py-3 bg-white text-main-blue border border-main-blue rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-main-blue/5 transition-all flex items-center gap-3 active:scale-95"
          >
            <GraduationCap className="w-4 h-4" /> Ikuti Pelatihan
          </button>
        </div>
      </div>

      {/* Quick Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {activities.map((item, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            key={i}
            onClick={() => navigate(item.link)}
            className="bg-white/80 backdrop-blur-xl border border-main-orange/20 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}
            >
              <item.icon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-soft-black mb-1">{item.title}</h4>
            <p className="text-sm text-gray-500 font-medium">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-xl border border-white p-6 md:p-8 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-main-blue" /> Pengumuman Terbaru
          </h3>
          <div className="space-y-4">
            {news.map((p, i) => {
              const dateObj = new Date(p.published_at || p.created_at);
              const day = dateObj.getDate();
              const month = dateObj.toLocaleDateString("id-ID", {
                month: "short",
              });
              return (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-red-500">
                      {day}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">
                      {month}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-main-blue bg-main-blue/10 px-2 py-0.5 rounded-full mb-1 inline-block">
                      {p.category}
                    </span>
                    <h4 className="text-sm font-bold text-soft-black leading-snug">
                      {p.title}
                    </h4>
                  </div>
                </div>
              );
            })}
            {news.length === 0 && (
              <p className="text-gray-400 text-sm italic text-center py-4">
                Belum ada pengumuman.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white p-6 md:p-8 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-leaf-green" /> Agenda Mendatang
          </h3>
          <div className="space-y-4">
            {events.map((a, i) => (
              <div
                key={i}
                className="flex gap-4 items-center p-4 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <div className="w-2 h-2 rounded-full bg-leaf-green shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-soft-black text-sm">
                    {a.title}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {new Date(a.date_start).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    • {a.location}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-gray-400 text-sm italic text-center py-4">
                Belum ada agenda kegiatan.
              </p>
            )}
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
  const [announcementForm, setAnnouncementForm] = useState(
    content.announcement || { title: "", subtitle: "", desc: "" },
  );
  const [activeMenusForm, setActiveMenusForm] = useState(
    (content as any).activeMenus || {},
  );

  React.useEffect(() => {
    if (!isLoading) {
      setHeroForm(content.hero);
      setProfilForm(content.profil);
      setFooterForm(content.footer);
      setAnnouncementForm(
        content.announcement || { title: "", subtitle: "", desc: "" },
      );
      setActiveMenusForm((content as any).activeMenus || {});
    }
  }, [content, isLoading]);

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateContent({
      hero: heroForm,
      profil: profilForm,
      footer: footerForm,
      announcement: announcementForm,
      activeMenus: activeMenusForm,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Website Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-slate-400 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-200">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200 mb-2">
              <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-heading">Konfigurasi Sistem</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Pengaturan Website
            </h2>
            <p className="text-sm text-gray-500">
              Sesuaikan konten dan tampilan website publik GUGUS 3.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveContent} className="space-y-12">
        {/* Announcement Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-main-blue">
            <Menu className="w-5 h-5" /> Aktivasi Menu Guru
          </h3>
          <p className="text-xs text-gray-500 -mt-4">
            Tentukan menu mana saja yang akan dimunculkan pada dashboard Guru.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            {[
              { id: "overview", label: "Overview" },
              { id: "profil", label: "Profil Guru" },
              { id: "jadwal", label: "Jadwal KKG" },
              { id: "materi", label: "Materi KKG" },
              { id: "notulen", label: "Notulen Rapat" },
              { id: "pelatihan", label: "Pelatihan" },
              { id: "forum", label: "Forum Diskusi" },
              { id: "sharing", label: "Sharing Praktik" },
              { id: "upload_karya", label: "Upload Karya" },
            ].map((menu) => (
              <label
                key={menu.id}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-main-blue/30 transition-all shadow-sm"
              >
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded accent-main-blue"
                  checked={!!activeMenusForm[menu.id]}
                  onChange={(e) =>
                    setActiveMenusForm({
                      ...activeMenusForm,
                      [menu.id]: e.target.checked,
                    })
                  }
                />
                <span className="text-sm font-bold text-gray-700">
                  {menu.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Announcement Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-main-blue">
            <Megaphone className="w-5 h-5" /> Popup Pengumuman
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Popup Title
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Popup Subtitle
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                value={announcementForm.subtitle}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    subtitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Popup Description
              </label>
              <textarea
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                rows={3}
                value={announcementForm.desc}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    desc: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Kontak Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-main-blue">
            <MessageCircle className="w-5 h-5" /> Setelan Kontak
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nomor WhatsApp (Tanpa awalan 0 atau +, mis: 628123456789)
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                value={footerForm.waNumber || ""}
                onChange={(e) =>
                  setFooterForm({ ...footerForm, waNumber: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Sosial Media Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-main-blue">
            <Globe className="w-5 h-5" /> Media Sosial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instagram URL
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                value={footerForm.social?.instagram || ""}
                onChange={(e) =>
                  setFooterForm({
                    ...footerForm,
                    social: {
                      facebook: footerForm.social?.facebook || "",
                      tiktok: footerForm.social?.tiktok || "",
                      youtube: footerForm.social?.youtube || "",
                      instagram: e.target.value,
                    },
                  })
                }
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Facebook URL
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                value={footerForm.social?.facebook || ""}
                onChange={(e) =>
                  setFooterForm({
                    ...footerForm,
                    social: {
                      instagram: footerForm.social?.instagram || "",
                      tiktok: footerForm.social?.tiktok || "",
                      youtube: footerForm.social?.youtube || "",
                      facebook: e.target.value,
                    },
                  })
                }
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                TikTok URL
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                value={footerForm.social?.tiktok || ""}
                onChange={(e) =>
                  setFooterForm({
                    ...footerForm,
                    social: {
                      instagram: footerForm.social?.instagram || "",
                      facebook: footerForm.social?.facebook || "",
                      youtube: footerForm.social?.youtube || "",
                      tiktok: e.target.value,
                    },
                  })
                }
                placeholder="https://tiktok.com/@..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                value={footerForm.social?.youtube || ""}
                onChange={(e) =>
                  setFooterForm({
                    ...footerForm,
                    social: {
                      instagram: footerForm.social?.instagram || "",
                      facebook: footerForm.social?.facebook || "",
                      tiktok: footerForm.social?.tiktok || "",
                      youtube: e.target.value,
                    },
                  })
                }
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-main-blue">
            <ImageIcon className="w-5 h-5" /> Hero Section
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title 1
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                value={heroForm.title1}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, title1: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title 2
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                value={heroForm.title2}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, title2: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-main-blue/20 outline-none transition-all"
                rows={3}
                value={heroForm.description}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, description: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                label="Logo Sekolah"
                value={heroForm.logo}
                onChange={(base64) =>
                  setHeroForm({ ...heroForm, logo: base64 })
                }
                maxWidth={400}
                maxHeight={400}
              />
            </div>
          </div>
        </div>

        {/* Profil Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-leaf-green">
            <Users className="w-5 h-5" /> Profil Sambutan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title Sambutan
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-leaf-green/20 outline-none transition-all"
                value={profilForm.title}
                onChange={(e) =>
                  setProfilForm({ ...profilForm, title: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pesan/Quote
              </label>
              <textarea
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-leaf-green/20 outline-none transition-all"
                rows={4}
                value={profilForm.quote}
                onChange={(e) =>
                  setProfilForm({ ...profilForm, quote: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Ketua Gugus
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-leaf-green/20 outline-none transition-all"
                value={profilForm.name}
                onChange={(e) =>
                  setProfilForm({ ...profilForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jabatan Resmi
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-leaf-green/20 outline-none transition-all"
                value={profilForm.role}
                onChange={(e) =>
                  setProfilForm({ ...profilForm, role: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Periode Kepengurusan
              </label>
              <input
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-leaf-green/20 outline-none transition-all"
                value={profilForm.periodeKepengurusan || ""}
                onChange={(e) =>
                  setProfilForm({
                    ...profilForm,
                    periodeKepengurusan: e.target.value,
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                label="Foto Profil"
                value={profilForm.image}
                onChange={(base64) =>
                  setProfilForm({ ...profilForm, image: base64 })
                }
                maxWidth={400}
                maxHeight={400}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            type="submit"
            className="px-8 py-3.5 bg-gradient-to-r from-main-blue to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2"
          >
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
  const debouncedSave = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    async function loadNews() {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });
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
      featured_image_url:
        "https://images.unsplash.com/photo-1546410531-bea4cada4ff8?q=80&w=2000&auto=format&fit=crop",
      category: "berita",
    };
    const { data, error } = await supabase
      .from("posts")
      .insert([newPost])
      .select();
    if (!error && data) {
      logActivity(
        user,
        "create_berita",
        `Menambah berita baru: ${newPost.title}`,
      );
      setNews([data[0], ...news]);
    }
  };

  const handleUpdate = (id: string, updates: any) => {
    setNews(news.map((n: any) => (n.id === id ? { ...n, ...updates } : n)));

    if (debouncedSave.current) clearTimeout(debouncedSave.current);

    debouncedSave.current = setTimeout(async () => {
      if (!supabase) return;
      const { error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", id);
      if (error) {
        console.error("Error updating post:", error);
      } else {
        logActivity(user, "update_berita", `Memperbarui berita ID: ${id}`);
      }
    }, 800);
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (await confirm("Hapus berita ini?", "Konfirmasi")) {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (!error) {
        logActivity(user, "delete_berita", `Menghapus berita ID: ${id}`);
        setNews(news.filter((n: any) => n.id !== id));
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Berita Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-main-blue shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue border border-main-blue/10">
            <Newspaper className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-main-blue/10 rounded-full border border-main-blue/5 mb-2">
              <div className="w-1 h-1 rounded-full bg-main-blue animate-pulse" />
              <span className="text-[10px] font-bold text-main-blue uppercase tracking-widest font-heading">Media Informasi</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Kelola Berita & Pengumuman
            </h2>
            <p className="text-sm text-gray-500">
              Publikasikan artikel dan informasi terbaru ke portal GUGUS 3.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreate}
          className="bg-main-blue text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-main-blue/90 active:scale-95 transition-all flex items-center gap-3"
        >
          <PlusCircle className="w-4 h-4" /> Buat Berita Baru
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-10">
              Memuat data...
            </div>
          ) : news.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              Belum ada berita.
            </div>
          ) : (
            news.map((item: any) => (
              <div
                key={item.id}
                className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-all group relative"
              >
                <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Judul Berita
                    </label>
                    <input
                      className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent"
                      value={item.title}
                      onChange={(e) =>
                        handleUpdate(item.id, { title: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUpload
                      label=""
                      value={item.featured_image_url || ""}
                      onChange={(base64) =>
                        handleUpdate(item.id, { featured_image_url: base64 })
                      }
                      maxWidth={600}
                      maxHeight={400}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Kategori
                    </label>
                    <select
                      className="w-full border-b border-gray-200 text-xs outline-none bg-transparent"
                      value={item.category}
                      onChange={(e) =>
                        handleUpdate(item.id, { category: e.target.value })
                      }
                    >
                      <option value="berita">Berita</option>
                      <option value="pengumuman">Pengumuman</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Link URL
                    </label>
                    <input
                      className="w-full border-b border-gray-200 text-xs outline-none bg-transparent"
                      placeholder="https://..."
                      value={item.url || ""}
                      onChange={(e) =>
                        handleUpdate(item.id, { url: e.target.value })
                      }
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminGaleriForm({
  user,
  galleryForm,
  setGalleryForm,
  handleSaveContent,
}: any) {
  const { confirm } = useAlert();
  const [gallery, setGallery] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkTitle, setBulkTitle] = useState("");
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function loadGallery() {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false });
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
          const canvas = document.createElement("canvas");
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
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/webp", 0.8));
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
          type: "photo",
        });
        setUploadProgress((prev) => ({ ...prev, current: i + 1 }));
      } catch (err) {
        console.error("Error processing file:", err);
      }
    }

    if (newItems.length > 0) {
      const { data, error } = await supabase
        .from("gallery")
        .insert(newItems)
        .select();
      if (!error && data) {
        logActivity(
          user,
          "create_galeri_massal",
          `Upload ${newItems.length} foto ke galeri: ${bulkTitle}`,
        );
        setGallery([...data, ...gallery]);
      }
    }

    setUploadingBulk(false);
    setShowBulkUpload(false);
    setBulkTitle("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreate = async () => {
    if (!supabase) return;
    const newItem = {
      media_url:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
      title: "Judul Foto Baru",
      type: "photo",
    };
    const { data, error } = await supabase
      .from("gallery")
      .insert([newItem])
      .select();
    if (!error && data) {
      logActivity(user, "create_galeri", `Menambah foto satuan ke galeri`);
      setGallery([data[0], ...gallery]);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("gallery")
      .update(updates)
      .eq("id", id);
    if (!error) {
      logActivity(user, "update_galeri", `Memperbarui aset galeri ID: ${id}`);
      setGallery(
        gallery.map((g: any) => (g.id === id ? { ...g, ...updates } : g)),
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (await confirm("Hapus aset ini dari galeri?", "Konfirmasi")) {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (!error) {
        logActivity(user, "delete_galeri", `Menghapus aset galeri ID: ${id}`);
        setGallery(gallery.filter((g: any) => g.id !== id));
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Galeri Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-pink-500 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 border border-pink-100">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-pink-50 rounded-full border border-pink-100 mb-2">
              <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest font-heading">Dokumentasi Visual</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Kelola Galeri
            </h2>
            <p className="text-sm text-gray-500">
              Kelola koleksi foto kegiatan dan dokumentasi penting GUGUS 3.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center gap-3 ${showBulkUpload ? "bg-pink-600 text-white" : "bg-white text-pink-600 border border-pink-200"}`}
          >
            <UploadCloud className="w-4 h-4" />
            {showBulkUpload ? "Batal Massal" : "Upload Massal"}
          </button>
          <button
            onClick={handleCreate}
            className="bg-pink-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-pink-600 active:scale-95 transition-all flex items-center gap-3"
          >
            <PlusCircle className="w-4 h-4" /> Tambah Satuan
          </button>
        </div>
      </div>

      {showBulkUpload && (
        <div className="mb-8 p-6 bg-orange-50/50 rounded-2xl border-2 border-dashed border-orange-200">
          <div className="max-w-xl mx-auto space-y-4">
            <div>
              <label className="block text-sm font-bold text-orange-900 mb-2">
                Nama/Judul Kegiatan
              </label>
              <input
                type="text"
                placeholder="Contoh: Rapat Kerja Gugus 2024"
                className="w-full px-4 py-3 rounded-xl border border-orange-200 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={bulkTitle}
                onChange={(e) => setBulkTitle(e.target.value)}
              />
            </div>

            <div
              onClick={() => !uploadingBulk && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                uploadingBulk
                  ? "bg-gray-50 border-gray-200 cursor-not-allowed"
                  : "bg-white border-orange-300 hover:border-orange-500 hover:bg-orange-50/30"
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
                  <p className="text-orange-900 font-bold">
                    Sedang Mengunggah...
                  </p>
                  <div className="w-full bg-orange-200 rounded-full h-2.5 max-w-xs mx-auto">
                    <div
                      className="bg-orange-600 h-2.5 rounded-full transition-all"
                      style={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-orange-700">
                    {uploadProgress.current} dari {uploadProgress.total} foto
                    diproses
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <p className="text-orange-900 font-bold">Pilih Banyak Foto</p>
                  <p className="text-sm text-orange-600">
                    Klik untuk memilih beberapa foto sekaligus untuk kegiatan "
                    {bulkTitle || "..."}"
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-orange-100">
              <p className="text-xs text-orange-800 leading-relaxed font-medium">
                <strong>Tips:</strong> Gunakan fitur ini untuk mengunggah banyak
                dokumentasi sekaligus. Pastikan koneksi internet stabil karena
                sistem akan memproses dan mengunggah foto satu per satu secara
                otomatis.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center text-gray-400 py-10">
            Memuat galeri...
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Belum ada media galeri.
          </div>
        ) : (
          <div className="space-y-4">
            {gallery.map((item: any) => (
              <div
                key={item.id}
                className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-all group relative"
              >
                <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Judul Media
                    </label>
                    <input
                      className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent"
                      value={item.title || ""}
                      onChange={(e) =>
                        handleUpdate(item.id, { title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Tipe
                    </label>
                    <select
                      className="w-full border-b border-gray-200 text-sm outline-none bg-transparent"
                      value={item.type || "photo"}
                      onChange={(e) =>
                        handleUpdate(item.id, { type: e.target.value })
                      }
                    >
                      <option value="photo">Foto</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Media
                    </label>
                    {item.type === "photo" ? (
                      <ImageUpload
                        label=""
                        value={item.media_url || ""}
                        onChange={(base64) =>
                          handleUpdate(item.id, { media_url: base64 })
                        }
                        maxWidth={1200}
                        maxHeight={1200}
                      />
                    ) : (
                      <input
                        className="w-full border-b border-gray-200 text-sm outline-none bg-transparent"
                        placeholder="Video URL (https://youtube.com/...)"
                        value={item.media_url || ""}
                        onChange={(e) =>
                          handleUpdate(item.id, { media_url: e.target.value })
                        }
                      />
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
    </div>
  );
}

function AdminAgendaForm({ user }: { user: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSave = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    async function loadEvents() {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("events")
          .select("*")
          .order("date_start", { ascending: true });
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
      title: "Kegiatan Baru",
      description: "Deskripsi Kegiatan",
      category: "guru",
      date_start: new Date().toISOString(),
      location: "Kantor Gugus",
      image_url: "",
      detail_url: "",
      materi_url: "",
    };
    const { data, error } = await supabase
      .from("events")
      .insert([newEvent])
      .select();
    if (!error && data) {
      logActivity(
        user,
        "create_agenda",
        `Menambah agenda baru: ${newEvent.title}`,
      );
      setEvents([data[0], ...events]);
    }
  };

  const handleUpdate = (id: string, updates: any) => {
    setEvents(events.map((g: any) => (g.id === id ? { ...g, ...updates } : g)));

    if (debouncedSave.current) clearTimeout(debouncedSave.current);

    debouncedSave.current = setTimeout(async () => {
      if (!supabase) return;
      const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id);
      if (error) {
        console.error("Error updating event:", error);
      } else {
        logActivity(user, "update_agenda", `Memperbarui agenda ID: ${id}`);
      }
    }, 800);
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (window.confirm("Hapus agenda ini?")) {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (!error) {
        logActivity(user, "delete_agenda", `Menghapus agenda ID: ${id}`);
        setEvents(events.filter((g: any) => g.id !== id));
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Agenda Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-orange-500 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-100">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-100 mb-2">
              <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest font-heading">Manajemen Agenda</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Kelola Agenda
            </h2>
            <p className="text-sm text-gray-500">
              Atur jadwal pertemuan dan kegiatan KKG terdaftar di database.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreate}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-3"
        >
          <PlusCircle className="w-4 h-4" /> Tambah Agenda
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-10">
              Memuat agenda...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              Belum ada agenda kegiatan.
            </div>
          ) : (
            events.map((item: any) => (
              <div
                key={item.id}
                className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-start gap-4 hover:shadow-md transition-all group relative"
              >
                <div className="w-2 h-20 rounded-full bg-leaf-green shrink-0 mt-1" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Nama Kegiatan
                    </label>
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
                      Kategori
                    </label>
                    <select
                      className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent"
                      value={item.category}
                      onChange={(e) =>
                        handleUpdate(item.id, { category: e.target.value })
                      }
                    >
                      <option value="guru">Guru</option>
                      <option value="siswa">Siswa</option>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="kokurikuler">Kokurikuler</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Waktu (Date Start)
                    </label>
                    <input
                      className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent"
                      type="datetime-local"
                      value={
                        item.date_start
                          ? new Date(item.date_start).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        handleUpdate(item.id, {
                          date_start: new Date(e.target.value).toISOString(),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Lokasi
                    </label>
                    <input
                      className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent"
                      value={item.location || ""}
                      onChange={(e) =>
                        handleUpdate(item.id, { location: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Deskripsi Kegiatan
                    </label>
                    <textarea
                      className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent"
                      value={item.description || ""}
                      onChange={(e) =>
                        handleUpdate(item.id, { description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      URL Cover Foto
                    </label>
                    <input
                      className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent"
                      value={item.image_url || ""}
                      onChange={(e) =>
                        handleUpdate(item.id, { image_url: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      URL Detail Link
                    </label>
                    <input
                      className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent"
                      value={item.detail_url || ""}
                      onChange={(e) =>
                        handleUpdate(item.id, { detail_url: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      URL Materi (Unduh)
                    </label>
                    <input
                      className="w-full border-b border-gray-200 text-sm text-gray-600 outline-none bg-transparent"
                      value={item.materi_url || ""}
                      onChange={(e) =>
                        handleUpdate(item.id, { materi_url: e.target.value })
                      }
                    />
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminSekolahForm({ user }: { user: any }) {
  const { alert } = useAlert();
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSchoolType, setNewSchoolType] = useState("Sekolah Imbas");

  React.useEffect(() => {
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
      jenis_sekolah: newSchoolType,
      logo_url:
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2000&auto=format&fit=crop",
    };
    const { data, error } = await supabase
      .from("schools")
      .insert([newSchool])
      .select();
    setIsCreating(false);
    if (error) {
      console.error("Error creating school:", error);
      await alert(
        "Gagal menambah sekolah: " +
          (error.message || "Kesalahan tidak diketahui"),
        "Error",
      );
      return;
    }

    if (data) {
      logActivity(
        user,
        "create_sekolah",
        `Menambah sekolah baru: ${newSchool.name}`,
      );
      setSchools([...schools, data[0]]);
      await alert("Sekolah baru berhasil ditambahkan!", "Sukses");
    }
  };

  const [savingId, setSavingId] = useState<string | null>(null);
  const debouncedSave = useRef<NodeJS.Timeout | null>(null);

  const handleUpdate = (id: string, updates: any) => {
    setSchools(
      schools.map((s: any) => (s.id === id ? { ...s, ...updates } : s)),
    );

    if (debouncedSave.current) clearTimeout(debouncedSave.current);

    debouncedSave.current = setTimeout(async () => {
      if (!supabase) return;
      setSavingId(id);
      const { error } = await supabase
        .from("schools")
        .update(updates)
        .eq("id", id);
      if (error) {
        console.error("Error updating school:", error);
        await alert("Gagal memperbarui sekolah", "Error");
      } else {
        logActivity(
          user,
          "update_sekolah",
          `Memperbarui data sekolah ID: ${id}`,
        );
      }
      setSavingId(null);
    }, 800);
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (window.confirm("Hapus sekolah ini?")) {
      const { error } = await supabase.from("schools").delete().eq("id", id);
      if (!error) {
        logActivity(user, "delete_sekolah", `Menghapus sekolah ID: ${id}`);
        setSchools(schools.filter((s: any) => s.id !== id));
      } else {
        console.error("Error deleting school:", error);
        await alert(
          "Gagal menghapus sekolah: " +
            (error.message || "Kesalahan tidak diketahui"),
          "Error",
        );
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Sekolah Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-leaf-green shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-leaf-green/10 rounded-2xl flex items-center justify-center text-leaf-green border border-leaf-green/10">
            <School className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-leaf-green/10 rounded-full border border-leaf-green/5 mb-2">
              <div className="w-1 h-1 rounded-full bg-leaf-green animate-pulse" />
              <span className="text-[10px] font-bold text-leaf-green uppercase tracking-widest font-heading">Data Satker</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Kelola Sekolah
            </h2>
            <p className="text-sm text-gray-500">
              Manajemen data sekolah inti dan imbas di lingkungan GUGUS 3.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold outline-none cursor-pointer"
            value={newSchoolType}
            onChange={(e) => setNewSchoolType(e.target.value)}
          >
            <option value="Sekolah Inti">Sekolah Inti</option>
            <option value="Sekolah Imbas">Sekolah Imbas</option>
          </select>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-leaf-green text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-leaf-green/90 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            {isCreating ? "Menyimpan..." : "Tambah Sekolah"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-1 md:col-span-2 text-center text-gray-400 py-10">
              Memuat data...
            </div>
          ) : schools.length === 0 ? (
            <div className="col-span-1 md:col-span-2 text-center text-gray-400 py-10">
              Belum ada sekolah.
            </div>
          ) : (
            schools.map((school: any) => (
              <div
                key={school.id}
                className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-5 hover:shadow-md transition-shadow relative group"
              >
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
                      <img
                        src={school.logo_url}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <BookOpen className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2 pr-8 sm:pr-0">
                      <input
                        className="w-full border border-gray-200 sm:border-none p-2 sm:p-0 text-base sm:text-lg font-bold text-soft-black focus:ring-2 focus:ring-main-blue/20 sm:focus:ring-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent"
                        placeholder="Nama Sekolah..."
                        value={school.name}
                        onChange={(e) =>
                          handleUpdate(school.id, { name: e.target.value })
                        }
                      />
                      <div className="flex items-center gap-2 mt-1 sm:mt-0 w-full sm:w-auto">
                        <select
                          className="flex-1 sm:flex-none text-xs font-bold uppercase tracking-wider px-3 py-2 sm:py-1.5 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-main-blue/20 cursor-pointer"
                          value={school.jenis_sekolah || "Sekolah Imbas"}
                          onChange={(e) =>
                            handleUpdate(school.id, {
                              jenis_sekolah: e.target.value,
                            })
                          }
                          disabled={savingId === school.id}
                        >
                          <option value="Sekolah Inti">Sekolah Inti</option>
                          <option value="Sekolah Imbas">Sekolah Imbas</option>
                        </select>
                        {savingId === school.id && (
                          <span className="text-[10px] text-main-blue font-bold animate-pulse whitespace-nowrap">
                            Menyimpan...
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      className="w-full border border-gray-200 sm:border-none p-2 sm:p-0 text-sm text-gray-500 focus:ring-2 focus:ring-main-blue/20 sm:focus:ring-0 mb-4 rounded-lg sm:rounded-none bg-white sm:bg-transparent"
                      placeholder="Nama Kepala Sekolah..."
                      value={school.principal_name || ""}
                      onChange={(e) =>
                        handleUpdate(school.id, {
                          principal_name: e.target.value,
                        })
                      }
                    />
                    <ImageUpload
                      label="Foto Kepala Sekolah"
                      value={school.principal_image_url || ""}
                      onChange={(base64) =>
                        handleUpdate(school.id, { principal_image_url: base64 })
                      }
                      maxWidth={400}
                      maxHeight={400}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Total Siswa
                    </label>
                    <input
                      type="number"
                      className="w-full border-gray-200 border p-2 text-sm rounded-lg"
                      value={school.student_count || 0}
                      onChange={(e) =>
                        handleUpdate(school.id, {
                          student_count: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Total Guru
                    </label>
                    <input
                      type="number"
                      className="w-full border-gray-200 border p-2 text-sm rounded-lg"
                      value={school.teacher_count || 0}
                      onChange={(e) =>
                        handleUpdate(school.id, {
                          teacher_count: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div>
                    <ImageUpload
                      label="Logo Sekolah (Pojok Kanan Atas)"
                      value={school.logo_url || ""}
                      onChange={(base64) =>
                        handleUpdate(school.id, { logo_url: base64 })
                      }
                      maxWidth={400}
                      maxHeight={400}
                    />
                  </div>
                  <div>
                    <ImageUpload
                      label="Foto Background Sekolah"
                      value={school.image_url || ""}
                      onChange={(base64) =>
                        handleUpdate(school.id, { image_url: base64 })
                      }
                      maxWidth={1200}
                      maxHeight={800}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Visi (Pisahkan baris dengan Enter)
                    </label>
                    <textarea
                      className="w-full border-gray-200 border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                      rows={2}
                      value={school.vision || ""}
                      onChange={(e) =>
                        handleUpdate(school.id, { vision: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Moto
                    </label>
                    <input
                      className="w-full border-gray-200 border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                      value={school.motto || ""}
                      onChange={(e) =>
                        handleUpdate(school.id, { motto: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Keunggulan Sekolah
                    </label>
                    <textarea
                      className="w-full border-gray-200 border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                      rows={3}
                      value={school.keunggulan || ""}
                      onChange={(e) =>
                        handleUpdate(school.id, { keunggulan: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Google Maps Embed URL
                    </label>
                    <input
                      className="w-full border-gray-200 border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Contoh: https://www.google.com/maps/embed?..."
                      value={school.map_embed_url || ""}
                      onChange={(e) => {
                        let val = e.target.value;
                        // Detect if user pasted whole iframe tag and extract src
                        if (val.includes("<iframe") && val.includes('src="')) {
                          const match = val.match(/src="([^"]+)"/);
                          if (match && match[1]) {
                            val = match[1];
                          }
                        }
                        handleUpdate(school.id, { map_embed_url: val });
                      }}
                    />

                    {school.map_embed_url &&
                      school.map_embed_url.includes(
                        "google.com/maps/embed",
                      ) && (
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
                              <Navigation className="w-3 h-3 text-main-blue" />{" "}
                              Live Preview Peta
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(school.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white hover:bg-main-blue hover:text-white transition-colors p-1.5 rounded-lg border border-gray-100 shadow-sm opacity-0 group-hover/map:opacity-100"
                              title="Buka di Google Maps"
                            >
                              <Globe className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    {(!school.map_embed_url ||
                      !school.map_embed_url.includes(
                        "google.com/maps/embed",
                      )) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
                        <p className="text-blue-800 text-[10px] leading-relaxed">
                          <strong className="block mb-1">
                            💡 Cara Menampilkan Peta:
                          </strong>
                          1. Cari lokasi di Google Maps &gt; Klik{" "}
                          <strong>Bagikan (Share)</strong>.<br />
                          2. Pilih tab{" "}
                          <strong>Sematkan peta (Embed a map)</strong>.<br />
                          3. Klik <strong>Salin HTML (Copy HTML)</strong> lalu
                          tempelkan di sini.
                          <br />
                          <span className="opacity-70 mt-1 block italic">
                            *Sistem akan otomatis mengambil link yang
                            diperlukan.
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminKKGForm({
  kkgForm,
  setKkgForm,
  handleSaveContent,
  updateContent,
}: any) {
  const { alert } = useAlert();
  const { content } = useSiteContent();
  const [activeKkgTab, setActiveKkgTab] = useState("profil");
  const [dbStruktur, setDbStruktur] = useState<any[]>([]);
  const [isSavingToggle, setIsSavingToggle] = useState(false);
  const [localIsActive, setLocalIsActive] = useState(
    !!kkgForm.pengumuman?.isActive,
  );

  useEffect(() => {
    const isActive = !!kkgForm.pengumuman?.isActive;
    if (localIsActive !== isActive) {
      setLocalIsActive(isActive);
    }
  }, [kkgForm.pengumuman?.isActive]);

  const [localPengumuman, setLocalPengumuman] = useState(kkgForm.pengumuman || { title: "", desc: "", isActive: false });

  // Sync with prop if it changes externally
  useEffect(() => {
    if (kkgForm.pengumuman && JSON.stringify(kkgForm.pengumuman) !== JSON.stringify(localPengumuman)) {
      setLocalPengumuman(kkgForm.pengumuman);
    }
  }, [kkgForm.pengumuman]);

  // Debounced update to global state
  useEffect(() => {
    const handler = setTimeout(() => {
      setKkgForm((prev: any) => ({ ...prev, pengumuman: localPengumuman }));
    }, 500);
    return () => clearTimeout(handler);
  }, [localPengumuman]);

  // Use default values if current form fields are empty/missing
  const form = {
    ...defaultContent.kkg,
    ...kkgForm,
  };

  const visi = form.visi || "";
  const misi = form.misi || [];
  const tujuan = form.tujuan || [];
  const sejarah = form.sejarah || "";

  // KKG: handle field change locally for performance
  const [isSavingOrg, setIsSavingOrg] = useState<string | null>(null);
  const debouncedOrgSave = useRef<NodeJS.Timeout | null>(null);

  const onFieldChangeKkg = (id: string, field: string, value: string) => {
    setDbStruktur((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const loadStruktur = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("org_kkg")
        .select("*")
        .order("created_at", { ascending: true });
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
      const { data, error } = await supabase
        .from("org_kkg")
        .insert([{ role: "Jabatan Baru", name: "-", school: "-" }])
        .select();
      if (error) throw error;
      if (data) loadStruktur();
      await alert("Anggota baru berhasil ditambahkan", "Sukses", "success");
    } catch (err: any) {
      console.error("Error creating org_kkg:", err);
      await alert(
        "Gagal menambah anggota: " +
          (err.message || "Kesalahan tidak diketahui"),
        "Error",
        "error",
      );
    }
  };

  const handleOrgUpdate = async (id: string, updates: any) => {
    if (!supabase) return;

    if (debouncedOrgSave.current) clearTimeout(debouncedOrgSave.current);

    debouncedOrgSave.current = setTimeout(async () => {
      setIsSavingOrg(id);
      try {
        const { data, error } = await supabase
          .from("org_kkg")
          .update(updates)
          .eq("id", id)
          .select();
        if (error) throw error;
        if (data && data[0]) {
          setDbStruktur((prev) =>
            prev.map((item) => (item.id === id ? data[0] : item)),
          );
        }
      } catch (err: any) {
        console.error("Error updating org_kkg:", err);
        await alert(
          "Gagal menyimpan perubahan: " +
            (err.message || "Kesalahan tidak diketahui"),
          "Error",
          "error",
        );
      } finally {
        setIsSavingOrg(null);
      }
    }, 800);
  };

  const handleOrgDelete = async (id: string) => {
    if (!supabase) return;
    await supabase.from("org_kkg").delete().eq("id", id);
    loadStruktur();
  };

  return (
    <div className="space-y-10">
      {/* KKG Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-main-blue shadow-sm mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue border border-main-blue/10">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-main-blue/10 rounded-full border border-main-blue/5 mb-2">
              <div className="w-1 h-1 rounded-full bg-main-blue animate-pulse" />
              <span className="text-[10px] font-bold text-main-blue uppercase tracking-widest font-heading">Kolaborasi Guru</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Kelola KKG
            </h2>
            <p className="text-sm text-gray-500">
              Manajemen data Kelompok Kerja Guru (KKG) di wilayah GUGUS 3.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <button
            onClick={() => setActiveKkgTab("profil")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeKkgTab === "profil" ? "bg-white text-main-blue shadow-sm" : "text-gray-500 hover:text-main-blue"}`}
          >
            Profil & Visi
          </button>
          <button
            onClick={() => setActiveKkgTab("dokumen")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeKkgTab === "dokumen" ? "bg-white text-main-blue shadow-sm" : "text-gray-500 hover:text-main-blue"}`}
          >
            Dokumen Link
          </button>
          <button
            onClick={() => setActiveKkgTab("struktur")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeKkgTab === "struktur" ? "bg-white text-main-blue shadow-sm" : "text-gray-500 hover:text-main-blue"}`}
          >
            Struktur Organisasi
          </button>
          <button
            onClick={() => setActiveKkgTab("program")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeKkgTab === "program" ? "bg-white text-main-blue shadow-sm" : "text-gray-500 hover:text-main-blue"}`}
          >
            Program KKG
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-main-orange/20 shadow-xl shadow-blue-500/5">

      <form onSubmit={handleSaveContent} className="space-y-6">
        {activeKkgTab === "profil" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Sejarah KKG
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none transition-colors bg-white/50"
                rows={4}
                value={sejarah}
                onChange={(e) =>
                  setKkgForm({ ...form, sejarah: e.target.value })
                }
                placeholder="Masukkan sejarah singkat KKG..."
              />
            </div>

            <div>
              <ImageUpload
                label="Gambar Profil KKG"
                value={form.gambarProfil || ""}
                onChange={(base64) =>
                  setKkgForm({ ...form, gambarProfil: base64 })
                }
                maxWidth={600}
                maxHeight={600}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Persentase Kolaborasi
                </label>
                <input
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50"
                  value={form.persentaseKolaborasi || ""}
                  onChange={(e) =>
                    setKkgForm({
                      ...form,
                      persentaseKolaborasi: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tahun Dedikasi
                </label>
                <input
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50"
                  value={form.tahunDedikasi || ""}
                  onChange={(e) =>
                    setKkgForm({ ...form, tahunDedikasi: e.target.value })
                  }
                />
              </div>
            </div>

            {/* KKG Statistics Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700">
                  Statistik KKG
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newStats = [...(form.statistikKkg || [])];
                    newStats.push({ label: "Baru", value: 0, suffix: "" });
                    setKkgForm({ ...form, statistikKkg: newStats });
                  }}
                  className="text-xs text-main-blue hover:underline font-bold"
                >
                  + Tambah Statistik
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(form.statistikKkg || []).map((stat: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm space-y-3 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const newStats = [...(form.statistikKkg || [])];
                        newStats.splice(i, 1);
                        setKkgForm({ ...form, statistikKkg: newStats });
                      }}
                      className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-red-400 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Label
                      </label>
                      <input
                        className="w-full border-b border-gray-200 p-1 text-sm focus:border-main-blue outline-none"
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...(form.statistikKkg || [])];
                          newStats[i].label = e.target.value;
                          setKkgForm({ ...form, statistikKkg: newStats });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Nilai
                        </label>
                        <input
                          type="number"
                          className="w-full border-b border-gray-200 p-1 text-sm focus:border-main-blue outline-none font-mono"
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...(form.statistikKkg || [])];
                            newStats[i].value = Number(e.target.value);
                            setKkgForm({ ...form, statistikKkg: newStats });
                          }}
                        />
                      </div>
                      <div className="w-16">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Suffix
                        </label>
                        <input
                          className="w-full border-b border-gray-200 p-1 text-sm focus:border-main-blue outline-none"
                          placeholder="+"
                          value={stat.suffix}
                          onChange={(e) => {
                            const newStats = [...(form.statistikKkg || [])];
                            newStats[i].suffix = e.target.value;
                            setKkgForm({ ...form, statistikKkg: newStats });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(form.statistikKkg || []).length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    Belum ada statistik.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Visi KKG
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none transition-colors bg-white/50"
                rows={3}
                value={visi}
                onChange={(e) => setKkgForm({ ...form, visi: e.target.value })}
                placeholder="Masukkan visi KKG..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Misi KKG
                  </label>
                  <button
                    type="button"
                    onClick={() => setKkgForm({ ...form, misi: [...misi, ""] })}
                    className="text-xs text-main-blue hover:underline font-bold"
                  >
                    + Tambah Misi
                  </button>
                </div>
                <div className="space-y-2">
                  {misi.map((m: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:border-main-blue outline-none bg-white/50"
                        value={m}
                        onChange={(e) => {
                          const newMisi = [...misi];
                          newMisi[i] = e.target.value;
                          setKkgForm({ ...form, misi: newMisi });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newMisi = [...misi];
                          newMisi.splice(i, 1);
                          setKkgForm({ ...form, misi: newMisi });
                        }}
                        className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {misi.length === 0 && (
                    <p className="text-xs text-gray-400 italic">
                      Belum ada misi.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Tujuan KKG
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setKkgForm({ ...form, tujuan: [...tujuan, ""] })
                    }
                    className="text-xs text-main-blue hover:underline font-bold"
                  >
                    + Tambah Tujuan
                  </button>
                </div>
                <div className="space-y-2">
                  {tujuan.map((t: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:border-main-blue outline-none bg-white/50"
                        value={t}
                        onChange={(e) => {
                          const newTujuan = [...tujuan];
                          newTujuan[i] = e.target.value;
                          setKkgForm({ ...form, tujuan: newTujuan });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newTujuan = [...tujuan];
                          newTujuan.splice(i, 1);
                          setKkgForm({ ...form, tujuan: newTujuan });
                        }}
                        className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {tujuan.length === 0 && (
                    <p className="text-xs text-gray-400 italic">
                      Belum ada tujuan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeKkgTab === "dokumen" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-soft-black">Daftar Dokumen</h4>
              <button
                type="button"
                onClick={() =>
                  setKkgForm({
                    ...form,
                    dokumen: [...(form.dokumen || []), { title: "", url: "" }],
                  })
                }
                className="px-4 py-2 bg-main-blue text-white flex items-center gap-2 font-bold rounded-lg hover:bg-dark-blue transition-all text-xs"
              >
                + Tambah Dokumen
              </button>
            </div>
            <div className="space-y-4">
              {(form.dokumen || []).map(
                (doc: { title: string; url: string }, i: number) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex-1 space-y-2">
                      <input
                        className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-main-blue outline-none bg-white"
                        value={doc.title}
                        onChange={(e) => {
                          const newDokumen = [...(form.dokumen || [])];
                          newDokumen[i].title = e.target.value;
                          setKkgForm({ ...form, dokumen: newDokumen });
                        }}
                        placeholder="Judul Dokumen"
                      />
                      <input
                        className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-main-blue outline-none bg-white"
                        value={doc.url}
                        onChange={(e) => {
                          const newDokumen = [...(form.dokumen || [])];
                          newDokumen[i].url = e.target.value;
                          setKkgForm({ ...form, dokumen: newDokumen });
                        }}
                        placeholder="URL Dokumen (https://...)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newDokumen = [...(form.dokumen || [])];
                        newDokumen.splice(i, 1);
                        setKkgForm({ ...form, dokumen: newDokumen });
                      }}
                      className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ),
              )}
              {(form.dokumen || []).length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-8">
                  Belum ada dokumen.
                </p>
              )}
            </div>
          </div>
        )}

        {activeKkgTab === "struktur" && (
          <div className="space-y-8">
            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
              <h4 className="text-sm font-bold text-main-blue mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Preview Struktur
                Organisasi{" "}
                {content.profil.periodeKepengurusan && (
                  <span className="text-gray-500 font-normal">
                    | Periode: {content.profil.periodeKepengurusan}
                  </span>
                )}
              </h4>
              <div className="bg-white rounded-2xl p-4 shadow-inner overflow-x-auto min-h-[300px]">
                <OrgChart
                  members={dbStruktur}
                  onEdit={(member) => {
                    const newRole = window.prompt("Edit Jabatan:", member.role);
                    const newName = window.prompt("Edit Nama:", member.name);
                    const newSchool = window.prompt(
                      "Edit Sekolah:",
                      member.school,
                    );
                    if (
                      newRole !== null ||
                      newName !== null ||
                      newSchool !== null
                    ) {
                      handleOrgUpdate(member.id, {
                        role: newRole !== null ? newRole : member.role,
                        name: newName !== null ? newName : member.name,
                        school: newSchool !== null ? newSchool : member.school,
                      });
                    }
                  }}
                  onDelete={handleOrgDelete}
                />
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
                <div
                  key={item.id}
                  className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-start gap-4 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 justify-center items-center flex text-gray-400 shrink-0 mt-1">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Jabatan / Peran
                      </label>
                      <input
                        className="w-full border-b border-gray-200 pb-1 text-sm font-bold text-soft-black focus:border-main-blue outline-none transition-colors bg-transparent"
                        value={item.role}
                        onChange={(e) => {
                          onFieldChangeKkg(item.id, "role", e.target.value);
                          handleOrgUpdate(item.id, { role: e.target.value });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Nama Pengurus
                      </label>
                      <input
                        className="w-full border-b border-gray-200 pb-1 text-sm text-gray-600 focus:border-main-blue outline-none transition-colors bg-transparent"
                        value={item.name}
                        onChange={(e) => {
                          onFieldChangeKkg(item.id, "name", e.target.value);
                          handleOrgUpdate(item.id, { name: e.target.value });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Asal Sekolah
                      </label>
                      <input
                        className="w-full border-b border-gray-200 pb-1 text-sm text-gray-600 focus:border-main-blue outline-none transition-colors bg-transparent"
                        value={item.school}
                        onChange={(e) => {
                          onFieldChangeKkg(item.id, "school", e.target.value);
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
                        value={item.photo_url || ""}
                        onChange={(base64) => {
                          onFieldChangeKkg(item.id, "photo_url", base64);
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
              {dbStruktur.length === 0 && (
                <p className="text-gray-400 text-sm italic py-4 col-span-2 text-center">
                  Belum ada struktur organisasi.
                </p>
              )}
            </div>
          </div>
        )}

        {activeKkgTab === "program" && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Program Tahunan dan kegiatan lainnya dapat diatur di sini.
            </p>
            {Object.keys(form.programs || { tahunan: [] }).map(
              (key: string) => (
                <div
                  key={key}
                  className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-soft-black capitalize">
                      Program {key}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newPrograms = { ...(form.programs || {}) };
                        if (!newPrograms[key]) newPrograms[key] = [];
                        newPrograms[key].push({
                          title: "Program Baru",
                          desc: "",
                          date: "",
                          status: "Menunggu",
                        });
                        setKkgForm({ ...form, programs: newPrograms });
                      }}
                      className="text-xs text-main-blue hover:underline font-bold"
                    >
                      + Tambah
                    </button>
                  </div>
                  <div className="space-y-3">
                    {((form.programs && form.programs[key]) || []).map(
                      (prog: any, i: number) => (
                        <div
                          key={i}
                          className="flex gap-4 items-start bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative group"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              className="border-b border-gray-200 p-1 text-sm font-bold text-soft-black focus:border-main-blue outline-none bg-transparent"
                              placeholder="Judul Program"
                              value={prog.title}
                              onChange={(e) => {
                                const newPrograms = { ...form.programs };
                                newPrograms[key][i].title = e.target.value;
                                setKkgForm({ ...form, programs: newPrograms });
                              }}
                            />
                            <input
                              className="border-b border-gray-200 p-1 text-sm text-gray-600 focus:border-main-blue outline-none bg-transparent"
                              placeholder="Waktu / Pelaksanaan"
                              value={prog.date}
                              onChange={(e) => {
                                const newPrograms = { ...form.programs };
                                newPrograms[key][i].date = e.target.value;
                                setKkgForm({ ...form, programs: newPrograms });
                              }}
                            />
                            <textarea
                              className="border border-gray-200 rounded-lg p-2 text-sm text-gray-600 focus:border-main-blue outline-none bg-transparent col-span-1 md:col-span-2"
                              placeholder="Deskripsi Singkat"
                              value={prog.desc}
                              onChange={(e) => {
                                const newPrograms = { ...form.programs };
                                newPrograms[key][i].desc = e.target.value;
                                setKkgForm({ ...form, programs: newPrograms });
                              }}
                              rows={2}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newPrograms = { ...form.programs };
                              newPrograms[key].splice(i, 1);
                              setKkgForm({ ...form, programs: newPrograms });
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-50 p-2 rounded-lg transition-all absolute top-2 right-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ),
                    )}
                    {((form.programs && form.programs[key]) || []).length ===
                      0 && (
                      <p className="text-xs text-gray-400 italic">
                        Belum ada program {key}.
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {activeKkgTab === "pengumuman" && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-yellow-900 text-lg">
                    Pengumuman Khusus KKG
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    Pesan highlight ini akan muncul di bagian paling atas
                    halaman KKG.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-yellow-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                  <label className="relative inline-block w-[60px] h-[34px]">
                    <input
                      type="checkbox"
                      id="kkg_announcement_active"
                      checked={localIsActive}
                      onChange={(e) => {
                        const isActive = e.target.checked;
                        setLocalIsActive(isActive);

                        if (updateContent) {
                          setIsSavingToggle(true);
                          const updated = {
                            ...form,
                            pengumuman: {
                              ...(form.pengumuman || {}),
                              isActive,
                            },
                          };
                          updateContent({ kkg: updated })
                            .then(() => {
                              alert(
                                isActive
                                  ? "Pengumuman KKG diaktifkan!"
                                  : "Pengumuman KKG dinonaktifkan!",
                              );
                              console.log(
                                "Pengumuman KKG updated to:",
                                isActive,
                              );
                            })
                            .catch((err) => {
                              alert("Gagal menyimpan pengaturan!");
                              console.error("Gagal menyimpan:", err);
                              setLocalIsActive(!isActive);
                            })
                            .finally(() =>
                              setTimeout(() => setIsSavingToggle(false), 1000),
                            );
                        }
                      }}
                      className="peer sr-only"
                    />
                    <span className="absolute cursor-pointer inset-0 bg-gray-300 transition-all duration-400 rounded-full peer-checked:bg-[#2196F3] before:absolute before:content-[''] before:h-[26px] before:w-[26px] before:left-[4px] before:bottom-[4px] before:bg-white before:transition-all before:duration-400 before:rounded-full peer-checked:before:translate-x-[26px]"></span>
                  </label>
                  <label
                    htmlFor="kkg_announcement_active"
                    className="text-sm font-bold text-gray-700 cursor-pointer"
                  >
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
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      Judul Pengumuman
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-yellow-500 outline-none bg-gray-50/50 font-bold transition-all"
                      value={localPengumuman.title || ""}
                      onChange={(e) =>
                        setLocalPengumuman(prev => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Masukkan judul (misal: Rapat Koordinasi)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      Isi Pesan Pengumuman
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={localPengumuman.desc || ""}
                      onChange={(value) =>
                        setLocalPengumuman(prev => ({ ...prev, desc: value }))
                      }
                      className="w-full border border-gray-200 rounded-xl text-sm focus:border-yellow-500 outline-none bg-gray-50/50 min-h-[120px] transition-all"
                      placeholder="Tuliskan detail pengumuman yang ingin disampaikan kepada guru-guru..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
          <button
            type="submit"
            className="px-8 py-3.5 bg-gradient-to-r from-leaf-green to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/20 transition-all flex items-center gap-2"
          >
            <CheckSquare className="w-5 h-5" /> Simpan Data KKG
          </button>
        </div>
      </form>
    </div>
  </div>
);
}

function AdminGugusForm({ gugusForm, setGugusForm, handleSaveContent }: any) {
  const { alert } = useAlert();
  const { content } = useSiteContent();
  const [activeTab, setActiveTab] = useState("profil");
  const [dbStruktur, setDbStruktur] = useState<any[]>([]);

  const form = {
    ...defaultContent.gugus,
    ...gugusForm,
  };

  const visi = form.visi || "";
  const misi = form.misi || [];
  const tujuan = form.tujuan || [];
  const sejarah = form.sejarah || "";
  const programs = form.programs || [];

  // Gugus: handle field change locally for performance
  const [isSavingOrg, setIsSavingOrg] = useState<string | null>(null);
  const debouncedOrgSave = useRef<NodeJS.Timeout | null>(null);

  const onFieldChangeGugus = (id: string, field: string, value: string) => {
    setDbStruktur((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const loadStruktur = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("org_gugus")
        .select("*")
        .order("created_at", { ascending: true });
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
      const { data, error } = await supabase
        .from("org_gugus")
        .insert([{ role: "Jabatan Baru", name: "-", school: "-" }])
        .select();
      if (error) throw error;
      if (data) loadStruktur();
      await alert("Anggota baru berhasil ditambahkan", "Sukses", "success");
    } catch (err: any) {
      console.error("Error creating org_gugus:", err);
      await alert(
        "Gagal menambah anggota: " +
          (err.message || "Kesalahan tidak diketahui"),
        "Error",
        "error",
      );
    }
  };

  const handleOrgUpdate = async (id: string, updates: any) => {
    if (!supabase) return;

    if (debouncedOrgSave.current) clearTimeout(debouncedOrgSave.current);

    debouncedOrgSave.current = setTimeout(async () => {
      setIsSavingOrg(id);
      try {
        const { data, error } = await supabase
          .from("org_gugus")
          .update(updates)
          .eq("id", id)
          .select();
        if (error) throw error;
        if (data && data[0]) {
          setDbStruktur((prev) =>
            prev.map((item) => (item.id === id ? data[0] : item)),
          );
        }
      } catch (err: any) {
        console.error("Error updating org_gugus:", err);
        await alert(
          "Gagal menyimpan perubahan: " +
            (err.message || "Kesalahan tidak diketahui"),
          "Error",
          "error",
        );
      } finally {
        setIsSavingOrg(null);
      }
    }, 800);
  };

  const handleOrgDelete = async (id: string) => {
    if (!supabase) return;
    await supabase.from("org_gugus").delete().eq("id", id);
    loadStruktur();
  };

  return (
    <div className="space-y-10">
      {/* Gugus Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-orange-500 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-100">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-100 mb-2">
              <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest font-heading">Identitas Gugus</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Kelola Gugus
            </h2>
            <p className="text-sm text-gray-500">
              Manajemen profil, sejarah, visi misi, dan program kerja Gugus.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <button
            type="button"
            onClick={() => setActiveTab("profil")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "profil" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-orange-600"}`}
          >
            Profil & Visi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("struktur")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "struktur" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-orange-600"}`}
          >
            Struktur
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("program")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "program" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-orange-600"}`}
          >
            Program
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-main-orange/20 shadow-xl shadow-blue-500/5">

      <form onSubmit={handleSaveContent} className="space-y-6">
        {activeTab === "profil" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Sejarah Gugus
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50"
                rows={4}
                value={sejarah}
                onChange={(e) =>
                  setGugusForm({ ...form, sejarah: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tahun Berdiri
                </label>
                <input
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50"
                  value={form.tahunBerdiri || ""}
                  onChange={(e) =>
                    setGugusForm({ ...form, tahunBerdiri: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Sekolah Inti
                </label>
                <input
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50"
                  value={form.sekolahInti || ""}
                  onChange={(e) =>
                    setGugusForm({ ...form, sekolahInti: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Wilayah Kerja
                </label>
                <input
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50"
                  value={form.wilayahKerja || ""}
                  onChange={(e) =>
                    setGugusForm({ ...form, wilayahKerja: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Visi Gugus
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-main-blue outline-none bg-white/50"
                rows={2}
                value={visi}
                onChange={(e) =>
                  setGugusForm({ ...form, visi: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Misi Gugus
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setGugusForm({ ...form, misi: [...misi, ""] })
                    }
                    className="text-xs text-main-blue font-bold"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {misi.map((m: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className="flex-1 border border-gray-200 rounded-lg p-2 text-sm outline-none bg-white/50"
                        value={m}
                        onChange={(e) => {
                          const next = [...misi];
                          next[i] = e.target.value;
                          setGugusForm({ ...form, misi: next });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...misi];
                          next.splice(i, 1);
                          setGugusForm({ ...form, misi: next });
                        }}
                        className="text-red-400 p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Tujuan Gugus
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setGugusForm({ ...form, tujuan: [...tujuan, ""] })
                    }
                    className="text-xs text-main-blue font-bold"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {tujuan.map((t: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className="flex-1 border border-gray-200 rounded-lg p-2 text-sm outline-none bg-white/50"
                        value={t}
                        onChange={(e) => {
                          const next = [...tujuan];
                          next[i] = e.target.value;
                          setGugusForm({ ...form, tujuan: next });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...tujuan];
                          next.splice(i, 1);
                          setGugusForm({ ...form, tujuan: next });
                        }}
                        className="text-red-400 p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "struktur" && (
          <div className="space-y-6">
            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 mb-8">
              <h4 className="text-sm font-bold text-main-blue mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Preview Struktur
                Organisasi{" "}
                {content.profil.periodeKepengurusan && (
                  <span className="text-gray-500 font-normal">
                    | Periode: {content.profil.periodeKepengurusan}
                  </span>
                )}
              </h4>
              <div className="bg-white rounded-2xl p-4 shadow-inner overflow-x-auto min-h-[300px]">
                <OrgChart
                  members={dbStruktur}
                  onEdit={(member) => {
                    const newRole = window.prompt("Edit Jabatan:", member.role);
                    const newName = window.prompt("Edit Nama:", member.name);
                    const newSchool = window.prompt(
                      "Edit Sekolah:",
                      member.school,
                    );
                    if (
                      newRole !== null ||
                      newName !== null ||
                      newSchool !== null
                    ) {
                      handleOrgUpdate(member.id, {
                        role: newRole !== null ? newRole : member.role,
                        name: newName !== null ? newName : member.name,
                        school: newSchool !== null ? newSchool : member.school,
                      });
                    }
                  }}
                  onDelete={handleOrgDelete}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-soft-black">
                Daftar Pengurus Gugus
              </h4>
              <button
                type="button"
                onClick={handleOrgCreate}
                className="px-4 py-2 bg-leaf-green/10 text-leaf-green flex items-center gap-2 font-bold rounded-xl hover:bg-leaf-green/20 transition-colors"
              >
                <PlusCircle className="w-5 h-5" /> Tambah Pengurus
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {dbStruktur.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-start gap-4 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 justify-center items-center flex text-gray-400 shrink-0 mt-1">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Jabatan / Peran
                      </label>
                      <input
                        className="w-full border-b border-gray-200 pb-1 text-sm font-bold text-soft-black focus:border-main-blue outline-none transition-colors bg-transparent"
                        value={item.role}
                        onChange={(e) => {
                          onFieldChangeGugus(item.id, "role", e.target.value);
                          handleOrgUpdate(item.id, { role: e.target.value });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Nama Pengurus
                      </label>
                      <input
                        className="w-full border-b border-gray-200 pb-1 text-sm text-gray-600 focus:border-main-blue outline-none transition-colors bg-transparent"
                        value={item.name}
                        onChange={(e) => {
                          onFieldChangeGugus(item.id, "name", e.target.value);
                          handleOrgUpdate(item.id, { name: e.target.value });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Asal Sekolah
                      </label>
                      <input
                        className="w-full border-b border-gray-200 pb-1 text-sm text-gray-600 focus:border-main-blue outline-none transition-colors bg-transparent"
                        value={item.school}
                        onChange={(e) => {
                          onFieldChangeGugus(item.id, "school", e.target.value);
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
                        value={item.photo_url || ""}
                        onChange={(base64) => {
                          onFieldChangeGugus(item.id, "photo_url", base64);
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
              {dbStruktur.length === 0 && (
                <p className="text-gray-400 text-sm italic py-4 col-span-2 text-center">
                  Belum ada struktur organisasi.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "program" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-soft-black">Program Gugus</h4>
              <button
                type="button"
                onClick={() =>
                  setGugusForm({
                    ...form,
                    programs: [
                      ...programs,
                      { title: "Program Baru", desc: "", date: "" },
                    ],
                  })
                }
                className="text-xs text-main-blue font-bold"
              >
                + Tambah Program
              </button>
            </div>
            <div className="space-y-4">
              {programs.map((p: any, i: number) => (
                <div
                  key={i}
                  className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-3 relative group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      className="w-full border-b border-gray-200 p-1 text-sm font-bold text-soft-black outline-none bg-transparent"
                      placeholder="Judul Program"
                      value={p.title}
                      onChange={(e) => {
                        const next = [...programs];
                        next[i].title = e.target.value;
                        setGugusForm({ ...form, programs: next });
                      }}
                    />
                    <input
                      className="w-full border-b border-gray-200 p-1 text-sm text-gray-600 outline-none bg-transparent"
                      placeholder="Waktu"
                      value={p.date}
                      onChange={(e) => {
                        const next = [...programs];
                        next[i].date = e.target.value;
                        setGugusForm({ ...form, programs: next });
                      }}
                    />
                    <textarea
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-600 outline-none bg-white/50 col-span-2"
                      rows={2}
                      placeholder="Deskripsi"
                      value={p.desc}
                      onChange={(e) => {
                        const next = [...programs];
                        next[i].desc = e.target.value;
                        setGugusForm({ ...form, programs: next });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...programs];
                      next.splice(i, 1);
                      setGugusForm({ ...form, programs: next });
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
          <button
            type="submit"
            className="px-8 py-3.5 bg-main-blue text-white rounded-xl font-bold shadow-lg shadow-main-blue/20"
          >
            Simpan Profil Gugus
          </button>
        </div>
      </form>
    </div>
  </div>
);
}

function AdminPenghargaanForm() {
  const [awards, setAwards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSave = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    async function loadAwards() {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("awards")
          .select("*")
          .order("created_at", { ascending: false });
        setAwards(data || []);
      } catch (err) {
        console.error("Error fetching awards:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAwards();
  }, []);

  const { alert } = useAlert();
  const [newAward, setNewAward] = useState({
    title: "",
    category: "Guru",
    year: new Date().getFullYear(),
    description: "",
    image_url: "",
    rank: ""
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNewAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("awards")
      .insert([newAward])
      .select();
    if (!error && data) {
      setAwards([data[0], ...awards]);
      setNewAward({ title: "", category: "Guru", year: new Date().getFullYear(), description: "", image_url: "" });
      setIsAdding(false);
      alert("Penghargaan berhasil ditambahkan!", "Sukses", "success");
    } else {
      console.error("Error adding award:", error);
      alert("Gagal menambahkan penghargaan: " + (error?.message || "Terjadi kesalahan"), "Error", "error");
    }
  };

  const handleCreate = async () => {
    setIsAdding(true);
  };

  const handleUpdate = (id: string, updates: any) => {
    setAwards(awards.map((a: any) => (a.id === id ? { ...a, ...updates } : a)));

    if (debouncedSave.current) clearTimeout(debouncedSave.current);

    debouncedSave.current = setTimeout(async () => {
      if (!supabase) return;
      const { error } = await supabase
        .from("awards")
        .update(updates)
        .eq("id", id);
      if (error) {
        console.error("Error updating award:", error);
      }
    }, 800);
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (window.confirm("Hapus penghargaan ini?")) {
      const { error } = await supabase.from("awards").delete().eq("id", id);
      if (!error) {
        setAwards(awards.filter((a: any) => a.id !== id));
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Penghargaan Clean Header */}
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
              Kelola Penghargaan
            </h2>
            <p className="text-sm text-gray-500">
              Kelola data penghargaan dan sertifikat prestasi di lingkungan GUGUS 3.
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

      {isAdding && (
        <form onSubmit={handleAddNewAward} className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-700">Tambah Penghargaan Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nama Penghargaan" className="p-2 border rounded" value={newAward.title} onChange={e => setNewAward({...newAward, title: e.target.value})} required/>
            <input placeholder="Peringkat Kejuaraan (misal: Juara 1)" className="p-2 border rounded" value={newAward.rank} onChange={e => setNewAward({...newAward, rank: e.target.value})}/>
            <input placeholder="Tahun" type="number" className="p-2 border rounded" value={newAward.year} onChange={e => setNewAward({...newAward, year: parseInt(e.target.value)})} required/>
            <select className="p-2 border rounded" value={newAward.category} onChange={e => setNewAward({...newAward, category: e.target.value})}>
                <option value="Guru">Guru</option>
                <option value="Siswa">Siswa</option>
                <option value="Kepala Sekolah">Kepala Sekolah</option>
                <option value="Sekolah">Sekolah</option>
            </select>
            <input placeholder="URL Foto Penghargaan" className="p-2 border rounded" value={newAward.image_url} onChange={e => setNewAward({...newAward, image_url: e.target.value})}/>
          </div>
          <p className="text-xs text-gray-500">Catatan: Masukkan URL foto penghargaan. Fitur unggah foto langsung sedang dalam pengembangan.</p>
          <textarea placeholder="Deskripsi" className="w-full p-2 border rounded" value={newAward.description} onChange={e => setNewAward({...newAward, description: e.target.value})} />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Simpan</button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-200 px-4 py-2 rounded">Batal</button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center text-gray-400 py-10">Memuat data...</div>
        ) : awards.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Belum ada penghargaan.
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
                        Nama Penghargaan
                    </label>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                        {item.category}
                    </span>
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
                      Peringkat
                  </label>
                  <input
                    className="w-full border-b border-gray-200 text-sm font-medium text-gray-600 outline-none bg-transparent"
                    value={item.rank || ""}
                    onChange={(e) =>
                      handleUpdate(item.id, { rank: e.target.value })
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
                    className="w-full border-b border-gray-200 text-sm font-bold text-soft-black outline-none bg-transparent"
                    value={item.category}
                    onChange={(e) =>
                      handleUpdate(item.id, { category: e.target.value })
                    }
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Sekolah">Sekolah</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <ImageUpload
                    label="Foto Penghargaan"
                    value={item.image_url || ""}
                    onChange={(base64) =>
                      handleUpdate(item.id, { image_url: base64 })
                    }
                    maxWidth={600}
                    maxHeight={400}
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Deskripsi
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

function AdminPengumumanForm() {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function loadNews() {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("posts")
          .select("*")
          .eq("category", "pengumuman")
          .order("created_at", { ascending: false });
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
      category: "pengumuman",
    };
    const { data, error } = await supabase
      .from("posts")
      .insert([newPost])
      .select();
    if (!error && data) {
      setNews([data[0], ...news]);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    if (!supabase) return;
    const { error } = await supabase.from("posts").update(updates).eq("id", id);
    if (!error) {
      setNews(news.map((n: any) => (n.id === id ? { ...n, ...updates } : n)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (window.confirm("Hapus pengumuman ini?")) {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (!error) {
        setNews(news.filter((n: any) => n.id !== id));
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Pengumuman Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-red-500 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-red-50 rounded-full border border-red-100 mb-2">
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest font-heading">Informasi Penting</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Kelola Pengumuman
            </h2>
            <p className="text-sm text-gray-500">
              Publikasikan pengumuman mendesak dan informasi resmi Gugus 3.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreate}
          className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-red-600 active:scale-95 transition-all flex items-center gap-3"
        >
          <PlusCircle className="w-4 h-4" /> Buat Pengumuman
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 mb-6">
          {isLoading ? (
            <div className="text-center text-gray-400 py-10">
              Memuat data...
            </div>
          ) : news.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              Belum ada pengumuman.
            </div>
          ) : (
            news.map((item: any) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 group"
              >
                <div className="flex-1 grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Judul Pengumuman
                    </label>
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
                      Isi Singkat Pengumuman
                    </label>
                    <textarea
                      className="w-full border-b border-gray-200 text-sm text-soft-black outline-none bg-transparent"
                      value={item.content}
                      rows={2}
                      onChange={(e) =>
                        handleUpdate(item.id, { content: e.target.value })
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
    </div>
  );
}

function AdminGuruForm({ user }: { user: any }) {
  const [gurus, setGurus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function loadGurus() {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("role", "guru");
        // Map avatar_url to foto and APPLY SORTING
        const mappedData = (data || []).map((g) => ({
          ...g,
          foto: g.foto || g.avatar_url,
        })).sort((a, b) => {
          // 1. Sort by School (A-Z)
          const schoolA = (a.sekolah || "").toLowerCase();
          const schoolB = (b.sekolah || "").toLowerCase();
          if (schoolA < schoolB) return -1;
          if (schoolA > schoolB) return 1;
          
          // 2. If same school, sort by Position priority
          const normalizeJab = (val: string) => {
            let j = val.toLowerCase().trim();
            // Normalize Roman numerals and numbers
            if (j.includes("kelas 1")) j = j.replace("kelas 1", "kelas i");
            if (j.includes("kelas 2")) j = j.replace("kelas 2", "kelas ii");
            if (j.includes("kelas 3")) j = j.replace("kelas 3", "kelas iii");
            if (j.includes("kelas 4")) j = j.replace("kelas 4", "kelas iv");
            if (j.includes("kelas 5")) j = j.replace("kelas 5", "kelas v");
            if (j.includes("kelas 6")) j = j.replace("kelas 6", "kelas vi");
            return j;
          };

          const jabA = normalizeJab(a.jabatan || "");
          const jabB = normalizeJab(b.jabatan || "");
          
          const priority: Record<string, number> = {
            "kepala sekolah": 1,
            "guru kelas i": 2,
            "guru kelas ii": 3,
            "guru kelas iii": 4,
            "guru kelas iv": 5,
            "guru kelas v": 6,
            "guru kelas vi": 7,
            "guru pjok": 8,
            "guru paibp": 9,
            "guru pai": 9
          };

          const pA = priority[jabA] || 99;
          const pB = priority[jabB] || 99;
          
          if (pA !== pB) return pA - pB;
          
          // 3. If same position, sort by Name (A-Z)
          return (a.nama || "").localeCompare(b.nama || "");
        });
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
      // Gunakan field foto untuk DB yang telah dimigrasi
      const dbUpdates = { ...updates };
      // Hapus jika ada properti avatar_url bawaan lama agar tidak error
      if ('avatar_url' in dbUpdates) {
        delete dbUpdates.avatar_url;
      }

      const { error } = await supabase
        .from("user_profiles")
        .update(dbUpdates)
        .eq("id", id);
      if (error) throw error;
      logActivity(user, "update_guru", `Memperbarui profil guru ID: ${id}`);
      setGurus((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      );
    } catch (err) {
      console.error("Error updating guru:", err);
    }
  };

  return (
    <div className="space-y-10">
      {/* Guru Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-leaf-green shadow-sm mb-10 flex flex-col md:flex-row md:items-center gap-10">
        <div className="w-16 h-16 bg-leaf-green/10 rounded-2xl flex items-center justify-center text-leaf-green border border-leaf-green/10 shrink-0">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-leaf-green/10 rounded-full border border-leaf-green/5 mb-2">
            <div className="w-1 h-1 rounded-full bg-leaf-green animate-pulse" />
            <span className="text-[10px] font-bold text-leaf-green uppercase tracking-widest font-heading">Database Pendidik</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-soft-black">
            Kelola Guru
          </h2>
          <p className="text-sm text-gray-500">
            Daftar profil guru yang terdaftar dalam sistem GUGUS 3.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-[10px] uppercase tracking-wider w-16">
                Foto
              </th>
              <th className="p-4 font-bold text-[10px] uppercase tracking-wider">
                Nama
              </th>
              <th className="p-4 font-bold text-[10px] uppercase tracking-wider">
                NIP
              </th>
              <th className="p-4 font-bold text-[10px] uppercase tracking-wider">
                Pangkat/Gol
              </th>
              <th className="p-4 font-bold text-[10px] uppercase tracking-wider">
                Kepegawaian
              </th>
              <th className="p-4 font-bold text-[10px] uppercase tracking-wider">
                Jabatan
              </th>
              <th className="p-4 font-bold text-[10px] uppercase tracking-wider">
                Sekolah
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : gurus.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-400">
                  Belum ada data guru
                </td>
              </tr>
            ) : (
              gurus.map((g, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="p-4 font-medium align-middle">
                    <ImageUpload
                      label=""
                      compact={true}
                      value={
                        g.foto ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(g.nama || g.username || "G")}&background=random`
                      }
                      onChange={(base64) =>
                        handleUpdateGuru(g.id, { foto: base64 })
                      }
                      maxWidth={200}
                      maxHeight={200}
                    />
                  </td>
                  <td className="p-4 font-medium align-middle">
                    {g.nama || g.username || "-"}
                  </td>
                  <td className="p-4 text-gray-500 align-middle">
                    {g.nip || "-"}
                  </td>
                  <td className="p-4 text-gray-500 align-middle">
                    {g.pangkat || "-"}
                  </td>
                  <td className="p-4 text-gray-500 align-middle">
                    {g.kepegawaian || "-"}
                  </td>
                  <td className="p-4 text-gray-500 align-middle">
                    {g.jabatan || "-"}
                  </td>
                  <td className="p-4 text-gray-500 align-middle">
                    {g.sekolah || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminFinanceManagement({ user }: { user: any }) {
  const { alert } = useAlert();
  const [records, setRecords] = useState<FinanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    activity_name: "",
    income: 0,
    expense: 0,
    date: new Date().toISOString().split("T")[0],
  });

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/finance/records");
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
      const response = await fetch("/api/finance/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Gagal menyimpan data");

      logActivity(
        user,
        "create_finance",
        `Menambah data keuangan: ${formData.activity_name}`,
      );
      await alert("Data keuangan berhasil disimpan!");
      setFormData({
        activity_name: "",
        income: 0,
        expense: 0,
        date: new Date().toISOString().split("T")[0],
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
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Gagal menghapus data");
      logActivity(user, "delete_finance", `Menghapus data keuangan ID: ${id}`);
      fetchRecords();
    } catch (err: any) {
      console.error(err);
    }
  };

  const totalIncome = records.reduce(
    (sum, r) => sum + (Number(r.income) || 0),
    0,
  );
  const totalExpense = records.reduce(
    (sum, r) => sum + (Number(r.expense) || 0),
    0,
  );
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-10">
      {/* Keuangan Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-leaf-green shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-leaf-green/10 rounded-2xl flex items-center justify-center text-leaf-green border border-leaf-green/10 shrink-0">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-leaf-green/10 rounded-full border border-leaf-green/5 mb-2">
              <div className="w-1 h-1 rounded-full bg-leaf-green animate-pulse" />
              <span className="text-[10px] font-bold text-leaf-green uppercase tracking-widest font-heading">Akuntansi Gugus</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Kelola Keuangan
            </h2>
            <p className="text-sm text-gray-500">
              Manajemen arus kas, pemasukan, dan pengeluaran operasional GUGUS 3.
            </p>
          </div>
        </div>
        
        <div className="text-right bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 shadow-inner">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Saldo Saat Ini
          </p>
          <h3 className="text-2xl font-bold text-soft-black truncate">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(balance)}
          </h3>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-main-orange/20 shadow-xl shadow-blue-500/5">

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end"
        >
          <div className="md:col-span-1 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Tanggal
            </label>
            <input
              type="date"
              className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:border-main-blue transition-colors"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-1 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Keterangan / Kegiatan
            </label>
            <input
              type="text"
              placeholder="Contoh: Iuran Bulanan"
              className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:border-main-blue transition-colors"
              value={formData.activity_name}
              onChange={(e) =>
                setFormData({ ...formData, activity_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-leaf-green">
              Pemasukan (Rp)
            </label>
            <input
              type="number"
              className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:border-leaf-green transition-colors font-mono font-bold text-leaf-green"
              value={formData.income}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  income: Number(e.target.value),
                  expense: 0,
                })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-red-500">
              Pengeluaran (Rp)
            </label>
            <input
              type="number"
              className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:border-red-500 transition-colors font-mono font-bold text-red-500"
              value={formData.expense}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expense: Number(e.target.value),
                  income: 0,
                })
              }
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-main-blue text-white rounded-xl font-bold flex items-center gap-2 hover:bg-dark-blue transition-all shadow-lg shadow-main-blue/20"
            >
              <PlusCircle className="w-5 h-5" />
              {isSubmitting ? "Menyimpan..." : "Tambah Catatan"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-soft-black">Data Transaksi</h3>
          <div className="flex gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                Total Pemasukan
              </span>
              <span className="text-leaf-green font-bold">
                {new Intl.NumberFormat("id-ID").format(totalIncome)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                Total Pengeluaran
              </span>
              <span className="text-red-500 font-bold">
                {new Intl.NumberFormat("id-ID").format(totalExpense)}
              </span>
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
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-400 animate-pulse"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Belum ada data transaksi.
                  </td>
                </tr>
              ) : (
                (() => {
                  let runningBalance = 0;
                  const sortedForBalance = [...records].sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime(),
                  );
                  const recordsWithBalance = sortedForBalance.map((r) => {
                    runningBalance +=
                      (Number(r.income) || 0) - (Number(r.expense) || 0);
                    return { ...r, runningBalance };
                  });
                  return recordsWithBalance.reverse().map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold text-soft-black">
                        {record.activity_name}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-leaf-green">
                        {record.income > 0
                          ? `+ ${new Intl.NumberFormat("id-ID").format(record.income)}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-red-500">
                        {record.expense > 0
                          ? `- ${new Intl.NumberFormat("id-ID").format(record.expense)}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-gray-400">
                        {new Intl.NumberFormat("id-ID").format(
                          record.runningBalance,
                        )}
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
  const [activeSubTab, setActiveSubTab] = useState<"editor" | "list">("list");
  const [trainings, setTrainings] = useState<any[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const { content, updateContent } = useSiteContent() as any;
  const isDownloadEnabled = content?.certificateDownloadEnabled !== false;

  useEffect(() => {
    const fetchTrainings = async () => {
      const { data } = await supabase.from("trainings").select("*");
      setTrainings(data || []);
    };
    fetchTrainings();
  }, []);

  const handleToggleDownload = () => {
    updateContent({ certificateDownloadEnabled: !isDownloadEnabled });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-main-blue shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue border border-main-blue/5 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Manajemen Sertifikat
            </h2>
            <p className="text-sm text-gray-500">
              Kelola desain template dan penerbitan sertifikat pelatihan.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer bg-amber-50 px-4 py-2.5 rounded-xl text-amber-700 text-xs font-bold border border-amber-100 shadow-sm">
            <input
              type="checkbox"
              className="w-4 h-4 accent-amber-600 rounded"
              checked={isDownloadEnabled}
              onChange={handleToggleDownload}
            />
            Tombol Unduh Guru
          </label>
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button
              onClick={() => setActiveSubTab("list")}
              className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${activeSubTab === "list" ? "bg-white text-main-blue shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              Daftar Sertifikat
            </button>
            <button
              onClick={() => setActiveSubTab("editor")}
              className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${activeSubTab === "editor" ? "bg-white text-main-blue shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              Desain Template
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === "list" ? (
        <DataManagementTable
          user={user}
          table="training_certificates"
          title="Daftar Sertifikat Terbit"
          icon={Award}
          fields={[
            { name: "user_id", label: "ID Guru / Email" },
            { name: "training_id", label: "ID Pelatihan" },
            { name: "certificate_number", label: "Nomor Sertifikat" },
            {
              name: "certificate_url",
              label: "File Sertifikat (PDF)",
              type: "file",
            },
          ]}
        />
      ) : (
        <div className="space-y-4">
          <select
            className="w-full p-4 rounded-xl border border-gray-200"
            value={selectedTrainingId}
            onChange={(e) => setSelectedTrainingId(e.target.value)}
          >
            <option value="">Pilih Pelatihan (Default/Global)</option>
            {trainings.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <AdminCertificateEditor trainingId={selectedTrainingId} />
        </div>
      )}
    </div>
  );
}

function AdminMonitoring() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5 flex flex-col items-center justify-center min-h-[400px] text-center"
    >
      <Activity className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold font-heading text-soft-black mb-2">
        Monitoring Aktivitas
      </h2>
      <p className="text-gray-500 text-sm max-w-md">
        Fitur monitoring aktivitas log pendidik dan absensi terekam di database
        akan diaktifkan segera.
      </p>
    </motion.div>
  );
}

function AdminUpload() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5 flex flex-col items-center justify-center min-h-[400px] text-center"
    >
      <UploadCloud className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold font-heading text-soft-black mb-2">
        Upload Dokumen
      </h2>
      <p className="text-gray-500 text-sm max-w-md">
        Modul sinkronisasi file ke Storage untuk data RPP, silabus, & perangkat
        ajar lainnya.
      </p>
    </motion.div>
  );
}

function AdminLaporan() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-main-orange/20 shadow-xl shadow-blue-500/5 flex flex-col items-center justify-center min-h-[400px] text-center"
    >
      <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold font-heading text-soft-black mb-2">
        Laporan Statistik
      </h2>
      <p className="text-gray-500 text-sm max-w-md">
        Data laporan ditarik dari tabel kegiatan CMS yang dapat di-export ke
        format Excel/PDF.
      </p>
    </motion.div>
  );
}

function AdminStrukturManager() {
  const [activeTab, setActiveTab] = useState<"kkg" | "gugus">("kkg");

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-main-orange shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-main-orange/10 rounded-2xl flex items-center justify-center text-main-orange border border-main-orange/5 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Manajemen KKG & Gugus
            </h2>
            <p className="text-sm text-gray-500">
              Kelola informasi dan struktur KKG serta Gugus dari satu tempat.
            </p>
          </div>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button
            onClick={() => setActiveTab("kkg")}
            className={`px-8 py-2.5 rounded-lg font-bold text-xs transition-all ${activeTab === "kkg" ? "bg-white text-main-blue shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            KKG
          </button>
          <button
            onClick={() => setActiveTab("gugus")}
            className={`px-8 py-2.5 rounded-lg font-bold text-xs transition-all ${activeTab === "gugus" ? "bg-white text-main-blue shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Gugus
          </button>
        </div>
      </div>

      {activeTab === "kkg" ? (
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
    const newState =
      typeof updater === "function" ? updater(currentState) : updater;
    updateContent({ kkg: newState });
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateContent({ kkg: kkgForm });
  };

  return (
    <AdminKKGForm
      kkgForm={kkgForm}
      setKkgForm={setKkgForm}
      handleSaveContent={handleSaveContent}
      updateContent={updateContent}
    />
  );
}

function AdminGugusFormWrapper() {
  const { content, updateContent, gugusForm, setGugusForm, handleSaveContent } =
    useSiteContent() as any;
  return (
    <AdminGugusForm
      gugusForm={gugusForm}
      setGugusForm={setGugusForm}
      handleSaveContent={handleSaveContent}
    />
  );
}

function UserProfileEdit({
  user,
  onUpdate,
}: {
  user: any;
  onUpdate: (data: any) => void;
}) {
  const { alert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({
    nama: user.nama || "",
    nip: user.nip || "",
    jabatan: user.jabatan || "",
    sekolah: user.sekolah || "",
    kepegawaian: user.kepegawaian || "",
    pangkat: user.pangkat || "",
    email: user.email || "",
    foto: user.foto || user.avatar_url || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, id: user.id }),
      });
      if (!response.ok) throw new Error("Gagal memperbarui profil");
      logActivity(user, "update_profil", `Memperbarui profil pribadi`);
      onUpdate(profile);
      await alert("Profil berhasil diperbarui.", "Sukses", "success");
    } catch (err: any) {
      alert(err.message, "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      {/* Profile Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-main-blue shadow-sm mb-10 flex flex-col md:flex-row md:items-center gap-10">
        <div className="relative group shrink-0">
          <div className="w-24 h-32 rounded-2xl bg-gray-50 p-1 border border-gray-100 shadow-sm overflow-hidden transition-transform group-hover:scale-105 duration-500">
             <div className="w-full h-full rounded-xl overflow-hidden bg-white">
               <img
                  src={
                    profile.foto ||
                    profile.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nama || "U")}&background=6366f1&color=fff`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
               />
             </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-main-blue rounded-full flex items-center justify-center text-white border-2 border-white shadow-md">
             <UserIcon className="w-4 h-4" />
          </div>
        </div>
        
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-main-blue/5 rounded-full border border-main-blue/10 mb-2">
             <Settings className="w-3 h-3 text-main-blue" />
             <span className="text-[10px] font-bold text-main-blue uppercase tracking-widest font-heading">Pengaturan Akun</span>
          </div>
          <h2 className="text-3xl font-bold text-soft-black tracking-tight mb-1">
            {profile.nama || "Profil Guru"}
          </h2>
          <p className="text-gray-500 font-medium max-w-md text-sm">
            Perbarui identitas dan data profesional Anda untuk sinkronisasi sistem yang akurat.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200 border border-gray-100 overflow-hidden"
      >
        <div className="p-10 md:p-12">
          <form
            onSubmit={handleSave}
            className="space-y-10"
          >
            {/* Photo Upload Section */}
            <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Unggah Foto Identitas Baru</label>
              <ImageUpload
                label="Klik untuk ganti foto profil"
                value={profile.foto}
                onChange={(base64) => setProfile({ ...profile, foto: base64 })}
                maxWidth={400}
                maxHeight={400}
              />
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-main-blue transition-colors">Nama Lengkap & Gelar</label>
                <div className="relative">
                  <input
                    className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 p-4 text-sm font-bold focus:border-main-blue focus:bg-white outline-none transition-all"
                    value={profile.nama}
                    onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                  />
                  <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-main-blue transition-colors">Alamat Email Aktif</label>
                <div className="relative">
                  <input
                    className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 p-4 text-sm font-bold focus:border-main-blue focus:bg-white outline-none transition-all"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-main-blue transition-colors">NIP / NUPTK</label>
                <input
                  className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 p-4 text-sm font-bold focus:border-main-blue focus:bg-white outline-none transition-all"
                  value={profile.nip}
                  onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-main-blue transition-colors">Jabatan Struktural</label>
                <input
                  className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 p-4 text-sm font-bold focus:border-main-blue focus:bg-white outline-none transition-all"
                  value={profile.jabatan}
                  onChange={(e) =>
                    setProfile({ ...profile, jabatan: e.target.value })
                  }
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-main-blue transition-colors">Satuan Pendidikan</label>
                <input
                  className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 p-4 text-sm font-bold focus:border-main-blue focus:bg-white outline-none transition-all"
                  value={profile.sekolah}
                  onChange={(e) =>
                    setProfile({ ...profile, sekolah: e.target.value })
                  }
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-main-blue transition-colors">Golongan / Pangkat</label>
                <input
                  className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 p-4 text-sm font-bold focus:border-main-blue focus:bg-white outline-none transition-all"
                  value={profile.pangkat}
                  onChange={(e) =>
                    setProfile({ ...profile, pangkat: e.target.value })
                  }
                />
              </div>

              <div className="group col-span-full">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-main-blue transition-colors">Status Kepegawaian</label>
                <select
                  className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 p-4 text-sm font-bold focus:border-main-blue focus:bg-white outline-none transition-all appearance-none"
                  value={profile.kepegawaian}
                  onChange={(e) =>
                    setProfile({ ...profile, kepegawaian: e.target.value })
                  }
                >
                  <option value="">Pilih Status</option>
                  <option value="PNS">Pegawai Negeri Sipil (PNS)</option>
                  <option value="PPPK">PPPK</option>
                  <option value="GTT">Guru Tidak Tetap (GTT)</option>
                  <option value="Honor">Guru Honorer Sekolah</option>
                </select>
              </div>
            </div>

            <div className="pt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-slate-800 to-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                   <CheckCircle className="w-5 h-5" />
                )}
                {loading ? "Menyimpan Data..." : "Perbarui Profil Saya"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
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
      const { data: res, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
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
        const { error } = await supabase
          .from(table)
          .update(formData)
          .eq("id", editId);
        if (error) throw error;
        logActivity(user, `update_${table}`, `Memperbarui data di ${title}`);
        await alert("Data Berhasil Diperbarui");
      } else {
        const insertData = { ...formData };
        console.log("Saving insertData:", insertData);
        if (user?.id && !insertData.user_id) {
          insertData.user_id = user.id;
        }
        const { data, error } = await supabase.from(table).insert([insertData]).select();
        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
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
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
        logActivity(
          user,
          `delete_${table}`,
          `Menghapus data di ${title} ID: ${id}`,
        );
        fetchData();
      } catch (err: any) {
        alert(err.message, "Error", "error");
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Data Management Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-main-blue shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue border border-main-blue/10 shrink-0">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-main-blue/10 rounded-full border border-main-blue/5 mb-2">
              <div className="w-1 h-1 rounded-full bg-main-blue animate-pulse" />
              <span className="text-[10px] font-bold text-main-blue uppercase tracking-widest font-heading">Manajemen Data</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              {title}
            </h2>
            <p className="text-sm text-gray-500">
              Kelola koleksi {title.toLowerCase()} Anda dengan sistem administrasi yang efisien dan terorganisir.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-main-blue text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-dark-blue active:scale-95 transition-all flex items-center gap-3"
        >
          {showForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {showForm ? "Tutup Form" : `Tambah ${title.split(" ").pop()}`}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {fields.map((f: any) => (
                <div
                  key={f.name}
                  className={
                    f.type === "textarea" || f.type === "file"
                      ? "col-span-full"
                      : ""
                  }
                >
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    {f.label}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-main-blue outline-none"
                      rows={4}
                      value={formData[f.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.name]: e.target.value })
                      }
                    />
                  ) : f.type === "select" ? (
                    <select
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-main-blue outline-none bg-white"
                      value={formData[f.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.name]: e.target.value })
                      }
                    >
                      <option value="">Pilih</option>
                      {f.options.map((opt: any) => {
                        const label = typeof opt === "string" ? opt : opt.label;
                        const value = typeof opt === "string" ? opt : opt.value;
                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  ) : f.type === "file" ? (
                    <ImageUpload
                      label={f.label}
                      value={formData[f.name] || ""}
                      onChange={(base64) =>
                        setFormData({ ...formData, [f.name]: base64 })
                      }
                    />
                  ) : (
                    <input
                      type={f.type || "text"}
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-main-blue outline-none"
                      value={formData[f.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.name]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
              <div className="col-span-full flex justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-main-blue text-white rounded-xl font-bold shadow-lg"
                >
                  Simpan Data
                </button>
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
                {fields.map((f: any) => (
                  <th
                    key={f.name}
                    className="px-6 py-4 text-xs font-bold text-gray-500 uppercase"
                  >
                    {f.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={fields.length + 1}
                    className="p-10 text-center text-gray-400 italic"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={fields.length + 1}
                    className="p-10 text-center text-gray-400 italic"
                  >
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {fields.map((f: any) => (
                      <td
                        key={f.name}
                        className="px-6 py-4 text-sm font-medium text-gray-700 max-w-[200px] truncate"
                      >
                        {f.type === "date"
                          ? new Date(item[f.name]).toLocaleDateString("id-ID")
                          : f.type === "select"
                            ? (() => {
                                let val = item[f.name];
                                if (
                                  table === "trainings" &&
                                  f.name === "status" &&
                                  item.date_start
                                ) {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const trainingDate = new Date(item.date_start);
                                  trainingDate.setHours(0, 0, 0, 0);
                                  if (trainingDate > today) val = "planned";
                                  else if (trainingDate.getTime() === today.getTime())
                                    val = "ongoing";
                                  else val = "completed";
                                }
                                const opt = f.options.find(
                                  (o: any) =>
                                    (typeof o === "string" ? o : o.value) ===
                                    val,
                                );
                                return typeof opt === "string"
                                  ? opt
                                  : opt?.label || val || "-";
                              })()
                            : f.type === "file"
                              ? (item[f.name] ? "Terisi" : "-")
                            : f.type === "url" 
                              ? (item[f.name] ? <a href={item[f.name]} target="_blank" rel="noopener noreferrer" className="text-main-blue hover:underline whitespace-nowrap overflow-hidden text-ellipsis block w-full">{item[f.name]}</a> : "-")
                              : item[f.name] || "-"}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setFormData(item);
                            setEditId(item.id);
                            setShowForm(true);
                          }}
                          className="p-2 text-main-blue hover:bg-main-blue/5 rounded-lg"
                        >
                          <PenTool className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DataViewList({
  table,
  title,
  icon: Icon,
  filterColumn,
  filterValue,
}: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query: any = supabase
          .from(table)
          .select("*")
          .order("created_at", { ascending: false });
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
    <div className="space-y-10">
      {/* Dynamic Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-indigo-500 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100 shrink-0">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100 mb-2">
              <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-heading">Akses Konten</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              {title}
            </h2>
            <p className="text-sm text-gray-500">
              Kelola dan telusuri {title.toLowerCase()} untuk menunjang kegiatan belajar-mengajar Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Menyelaraskan Data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <Icon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold italic">Belum ada {title.toLowerCase()} yang diterbitkan.</p>
          </div>
        ) : (
          data.map((item) => (
            <motion.div
              whileHover={{ y: -10 }}
              key={item.id}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200 border border-gray-100 overflow-hidden flex flex-col group h-full"
            >
              <div className="p-8 pb-4">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <h3 className="font-black text-soft-black text-xl mb-3 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed flex-1">
                  {item.description || item.content || "Konten tersedia untuk dilihat dan diunduh."}
                </p>
              </div>
              
              <div className="mt-auto p-8 pt-0">
                <div className="flex flex-col gap-3">
                  {item.file_url && (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-gradient-to-r from-main-blue to-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest text-center uppercase shadow-lg shadow-main-blue/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Buka Dokumen
                    </a>
                  )}
                  {item.video_url && (
                    <a
                      href={item.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl text-[10px] font-black tracking-widest text-center uppercase shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Putar Materi
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function TeacherAttendance({ user }: { user: any }) {
  const { alert } = useAlert();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const { data, error } = await supabase
          .from("trainings")
          .select("*")
          .eq("status", "ongoing");
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
      const { error } = await supabase
        .from("training_participants")
        .upsert([{ 
          training_id: trainingId, 
          user_id: user.id,
          status: 'attended',
          attended_at: new Date().toISOString()
        }], { onConflict: 'training_id,user_id' });
      if (error) throw error;
      await alert("Absensi Berhasil Dicatat!", "Sukses", "success");
    } catch (err: any) {
      alert(err.message, "Error", "error");
    }
  };

  return (
    <div className="space-y-10">
      {/* Attendance Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-emerald-500 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-100 shrink-0">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100 mb-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-heading">Waktu Presensi</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Presensi Pelatihan
            </h2>
            <p className="text-sm text-gray-500">
              Catat kehadiran Anda secara digital untuk setiap sesi pelatihan yang sedang berlangsung.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Memverifikasi Program...</p>
        </div>
      ) : trainings.length === 0 ? (
        <div className="bg-gray-50/50 p-16 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-gray-200 border border-gray-100">
             <Activity className="w-10 h-10" />
          </div>
          <p className="text-gray-500 font-bold text-lg mb-2">
            Tidak ada pelatihan aktif saat ini.
          </p>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Silakan periksa jadwal pelatihan mendatang untuk melakukan pendaftaran terlebih dahulu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {trainings.map((t) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={t.id}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                   <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-soft-black text-xl mb-1 group-hover:text-emerald-600 transition-colors">{t.title}</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                       <MapPin className="w-3 h-3" /> {t.location}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                       <Calendar className="w-3 h-3" /> {new Date(t.date_start).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleAbsen(t.id)}
                className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Konfirmasi Kehadiran
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ForumSystem({ user }: { user: any }) {
  const [activeView, setActiveView] = useState<"list" | "create" | "detail">(
    "list",
  );
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Step 2: Fetch profiles for authors
      const authorIds = [...new Set(postsData.map(p => p.user_id).filter(Boolean))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("user_profiles")
        .select("id, nama, full_name, username, foto")
        .in("id", authorIds);

      // Step 3: Join locally
      const joinedData = postsData.map(post => ({
        ...post,
        author: profilesData?.find(profile => profile.id === post.user_id)
      }));

      setPosts(joinedData);
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
    setActiveView("list");
    fetchPosts();
  };

  const handleViewDetail = (post: any) => {
    setSelectedPost(post);
    setActiveView("detail");
  };

  return (
    <div className="space-y-10">
      {/* Forum Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-indigo-500 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100 shrink-0">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100 mb-2">
              <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-heading">Kolaborasi Aktif</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Forum Diskusi
            </h2>
            <p className="text-sm text-gray-500">
              Ruang kolektif untuk berbagi ide, memecahkan masalah, dan menginspirasi sesama pendidik di Gugus 3.
            </p>
          </div>
        </div>
        
        {activeView === "list" ? (
          <button
            onClick={() => setActiveView("create")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3"
          >
            <PlusCircle className="w-4 h-4" />
            Mulai Diskusi Baru
          </button>
        ) : (
          <button
            onClick={() => setActiveView("list")}
            className="bg-gray-100 text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-medium">
          Memuat diskusi...
        </div>
      ) : activeView === "create" ? (
        <CreateForumPostForm user={user} onSuccess={handleCreateSuccess} />
      ) : activeView === "detail" ? (
        <ForumDetail post={selectedPost} user={user} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Belum ada diskusi. Jadilah yang pertama memulai!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <motion.div
                whileHover={{ x: 5 }}
                key={post.id}
                onClick={() => handleViewDetail(post)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-main-blue/30 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden border">
                    <img
                      src={
                        post.author?.foto ||
                        post.author?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${post.author?.nama || "Guru"}&background=random`
                      }
                      alt="Author"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-main-blue uppercase tracking-widest bg-main-blue/5 px-2 py-0.5 rounded-full">
                      {post.category || "Umum"}
                    </span>
                    <h3 className="font-bold text-soft-black mt-1 mb-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        Oleh:{" "}
                        {post.author?.nama || post.user_id?.substring(0, 8)}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString("id-ID")}
                      </span>
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

function CreateForumPostForm({
  user,
  onSuccess,
}: {
  user: any;
  onSuccess: () => void;
}) {
  const { alert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Umum",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content)
      return alert("Harap isi judul dan konten diskusi.");

    setLoading(true);
    try {
      const { error } = await supabase.from("forum_posts").insert([
        {
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          category: formData.category,
        },
      ]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-3xl mx-auto"
    >
      <h3 className="text-xl font-bold font-heading mb-6 text-soft-black">
        Buat Topik Baru
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Pilih Kategori
          </label>
          <div className="flex flex-wrap gap-2">
            {["Umum", "Kurikulum", "Media", "Administrasi", "Inovasi"].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.category === cat ? "bg-main-blue text-white shadow-md" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                >
                  {cat}
                </button>
              ),
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Judul Diskusi
          </label>
          <input
            placeholder="Apa yang ingin Anda diskusikan?"
            className="w-full border-b border-gray-200 p-2 focus:border-main-blue outline-none text-lg font-bold"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Detail Pembahasan
          </label>
          <textarea
            placeholder="Tuliskan detail pertanyaan atau pengalaman Anda..."
            rows={8}
            className="w-full border border-gray-100 p-4 rounded-2xl focus:border-main-blue outline-none bg-gray-50/50"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-main-blue text-white rounded-2xl font-bold shadow-lg shadow-main-blue/20 hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {loading ? "Sedang Menerbitkan..." : "Terbitkan Diskusi Sekarang"}
        </button>
      </form>
    </motion.div>
  );
}

function ForumDetail({ post, user }: { post: any; user: any }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const { alert } = useAlert();

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      // Step 1: Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("forum_comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // Step 2: Fetch profiles for commentators
      const userIds = [...new Set(commentsData.map(c => c.user_id).filter(Boolean))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("user_profiles")
        .select("id, nama, full_name, username, foto")
        .in("id", userIds);

      // Step 3: Join locally
      const joinedData = commentsData.map(comment => ({
        ...comment,
        author: profilesData?.find(profile => profile.id === comment.user_id)
      }));

      setComments(joinedData || []);
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
      const { error } = await supabase.from("forum_comments").insert([
        {
          post_id: post.id,
          user_id: user.id,
          content: newComment,
        },
      ]);

      if (error) throw error;
      setNewComment("");
      fetchComments();
    } catch (err: any) {
      alert(err.message, "Error", "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full overflow-hidden border">
            <img
              src={
                post.author?.foto ||
                post.author?.avatar_url ||
                `https://ui-avatars.com/api/?name=${post.author?.nama || "Guru"}&background=random`
              }
              alt="Author"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-soft-black">
              {post.author?.nama || "Pengguna"}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <h1 className="text-2xl font-bold font-heading text-soft-black mb-4">
          {post.title}
        </h1>
        <div className="prose prose-blue max-w-none text-gray-600 mb-6 bg-gray-50/50 p-6 rounded-2xl whitespace-pre-wrap">
          {post.content}
        </div>
        <div className="flex items-center gap-4 py-4 border-t border-gray-50">
          <span className="text-[10px] font-extrabold text-main-blue bg-main-blue/10 px-3 py-1 rounded-full uppercase tracking-widest">
            {post.category}
          </span>
        </div>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold font-heading flex items-center gap-2 text-soft-black">
          <MessageSquare className="w-5 h-5 text-main-blue" />
          Tanggapan Komunitas ({comments.length})
        </h3>

        {loadingComments ? (
          <div className="py-10 text-center text-gray-400 text-sm italic">
            Memuat tanggapan...
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white/50 p-8 rounded-3xl text-center italic text-gray-400 text-sm border border-dashed border-gray-200">
            Belum ada tanggapan. Jadilah yang pertama memberikan respon!
          </div>
        ) : (
          comments.map((comment) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={comment.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border bg-gray-100">
                  <img
                    src={
                      comment.author?.foto ||
                      comment.author?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${comment.author?.nama || "Guru"}&background=random`
                    }
                    alt="Commenter"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-soft-black">
                    {comment.author?.nama || "Guru"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(comment.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed pl-11">
                {comment.content}
              </p>
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
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={submittingReply || !newComment.trim()}
            className="bg-main-blue text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-main-blue/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {submittingReply ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function TeacherJadwalCards() {
  const [agendas, setAgendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgendas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date_start", { ascending: false }); // Show newest first

      if (error) throw error;
      setAgendas(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
  }, []);

  const handleSeedData = async () => {
    setLoading(true);
    const dummyEvents = [
      {
        title: "Workshop Kurikulum Merdeka",
        description: "Membahas implementasi Kurikulum Merdeka di sekolah masing-masing.",
        category: "guru",
        date_start: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        location: "Aula SDN 1 Melati",
      },
      {
        title: "Seminar Teknologi Pendidikan",
        description: "Penggunaan media interaktif untuk pembelajaran efektif.",
        category: "seminar",
        date_start: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        location: "Gedung Serbaguna",
      },
      {
        title: "Rapat Koordinasi KKG",
        description: "Rapat rutin untuk mengevaluasi program kerja bulan ini.",
        category: "guru",
        date_start: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        location: "Ruang Guru",
      }
    ];

    try {
      await supabase.from("events").insert(dummyEvents);
      await fetchAgendas();
    } catch(err) {
      console.error("Error seeding:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Jadwal Clean Header */}
      <div className="bg-white p-8 rounded-[2rem] border-l-8 border-orange-500 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-100 shrink-0">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-100 mb-2">
              <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest font-heading">Informasi Agenda</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-soft-black">
              Jadwal Kegiatan
            </h2>
            <p className="text-sm text-gray-500">
              Pantau agenda kegiatan KKG mendatang dan riwayat agar tidak terlewatkan.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Menyiapkan Jadwal...</p>
        </div>
      ) : agendas.length === 0 ? (
        <div className="bg-gray-50/50 p-16 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
          <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-bold italic mb-6">Belum ada agenda kegiatan.</p>
          <button 
            onClick={handleSeedData}
            className="px-6 py-3 bg-main-blue text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Isi Data Contoh Sekarang
          </button>
        </div>
      ) : (
        <div className="relative border-l-4 border-orange-500/20 ml-4 md:ml-8 space-y-12 pb-10 mt-8">
          {agendas.map((item, index) => {
            const dateObj = new Date(item.date_start);
            const isPast = dateObj < new Date();
            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={item.id}
                className="relative pl-8 md:pl-12 group"
              >
                {/* Node Marker */}
                <div className={`absolute -left-[14px] top-8 w-6 h-6 bg-white border-4 ${isPast ? 'border-gray-400 shadow-gray-400/40' : 'border-orange-500 shadow-orange-500/40'} rounded-full shadow-lg group-hover:scale-125 transition-transform z-10`} />
                <div className={`absolute -left-12 top-6 text-right w-12 hidden md:block`}>
                   <p className="text-xl font-black text-gray-800 leading-none">{dateObj.getDate()}</p>
                   <p className="text-xs font-bold text-gray-500 uppercase">{dateObj.toLocaleString("id-ID", { month: "short" })}</p>
                </div>

                {/* Content Card */}
                <div className={`bg-white rounded-[2rem] shadow-xl shadow-gray-200 border border-gray-100 overflow-hidden flex flex-col md:flex-row relative transition-all hover:shadow-2xl hover:-translate-y-1 ${isPast ? 'opacity-80 grayscale-[20%]' : ''}`}>
                  {/* Left Side: Date Banner (Mobile only) */}
                  <div className={`md:hidden bg-gradient-to-br ${isPast ? 'from-gray-100 to-gray-200' : 'from-orange-50 to-orange-100'} p-6 border-b border-gray-50 flex items-center gap-4`}>
                     <div className={`w-16 h-16 bg-white rounded-[1.25rem] flex flex-col items-center justify-center shadow-md border border-gray-100`}>
                        <span className="text-[10px] font-black text-gray-400 uppercase leading-none">
                          {dateObj.toLocaleString("id-ID", { month: "short" })}
                        </span>
                        <span className={`text-3xl font-black ${isPast ? 'text-gray-500' : 'text-orange-500'} leading-none mt-1`}>
                          {dateObj.getDate()}
                        </span>
                     </div>
                     <div>
                       <h3 className="font-black text-soft-black text-xl line-clamp-2 leading-tight">
                         {item.title}
                       </h3>
                       <div className="flex items-center gap-2 mt-2">
                         <span className={`text-[10px] font-black ${isPast ? 'text-gray-500 bg-gray-100' : 'text-orange-600 bg-orange-100'} px-3 py-1 bg-white rounded-full uppercase tracking-widest`}>
                           {item.category || "Kegiatan"}
                         </span>
                       </div>
                     </div>
                  </div>

                  {/* Desktop Title & Details Area */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="hidden md:flex justify-between items-start mb-4">
                       <h3 className="font-black text-soft-black text-2xl group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight pr-4">
                         {item.title}
                       </h3>
                       <span className={`text-[10px] whitespace-nowrap font-black ${isPast ? 'text-gray-500 bg-gray-100' : 'text-orange-600 bg-orange-100'} px-4 py-2 rounded-full uppercase tracking-widest`}>
                          {item.category || "Kegiatan"}
                       </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                       <div className="flex items-center gap-4 group/item">
                          <div className={`w-10 h-10 rounded-xl ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-orange-50 text-orange-500'} flex items-center justify-center transition-colors shrink-0`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Lokasi</p>
                            <p className="text-sm font-bold text-soft-black line-clamp-1">{item.location || "Sekolah / Online"}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 group/item">
                          <div className={`w-10 h-10 rounded-xl ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-orange-50 text-orange-500'} flex items-center justify-center transition-colors shrink-0`}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Waktu</p>
                            <p className="text-sm font-bold text-soft-black">Pukul {dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute:"2-digit" })} WIB</p>
                          </div>
                       </div>
                    </div>

                    <div className={`pt-6 mt-6 border-t ${isPast ? 'border-gray-200' : 'border-gray-50'}`}>
                      <p className="text-xs text-gray-500 italic leading-relaxed line-clamp-3">
                        "{item.description || "Agenda rutin pengembangan keprofesian berkelanjutan."}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeacherTrainingCards({ user }: { user: any }) {
  const { alert } = useAlert();
  const { content } = useSiteContent() as any;
  const isDownloadEnabled = content?.certificateDownloadEnabled !== false;
  const { generateTeacherPDF } = useCertificateGenerator();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [certConfig, setCertConfig] = useState<any>(null);
  const [certRecords, setCertRecords] = useState<Record<string, any>>({});
  const [activeSubTab, setActiveSubTab] = useState<
    "daftar" | "absensi" | "sertifikat"
  >("daftar");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase || !user) return;
    setLoading(true);
    try {
      // Fetch Trainings
      const { data: tData, error: tError } = await supabase
        .from("trainings")
        .select("*")
        .order("date_start", { ascending: false });

      if (tError) throw tError;
      setTrainings(tData || []);

      // Fetch User Registrations
      const { data: rData } = await supabase
        .from("training_participants")
        .select("*")
        .eq("user_id", user.id);

      const regMap: Record<string, any> = {};
      rData?.forEach((reg) => {
        regMap[reg.training_id] = reg;
      });
      setRegistrations(regMap);
      
      // Fetch User Certificate Records
      const { data: certData } = await supabase
        .from("training_certificates")
        .select("*")
        .eq("user_id", user.id);
        
      const certMap: Record<string, any> = {};
      certData?.forEach((cert) => {
        certMap[cert.training_id] = cert;
      });
      setCertRecords(certMap);

      // Fetch Certificate Config
      const { data: sData } = await supabase
        .from("site_settings")
        .select("content")
        .eq("id", 1)
        .single();

      if (sData?.content?.certificate_configs) {
        setCertConfig(sData.content.certificate_configs);
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
      const { error } = await supabase.from("training_participants").insert({
        user_id: user.id,
        training_id: trainingId,
        status: "registered",
        registered_at: new Date().toISOString(),
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
        .from("training_participants")
        .update({
          status: "attended",
          attended_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("training_id", trainingId);

      if (error) throw error;
      alert("Daftar hadir berhasil diisi!", "Sukses", "success");
      fetchData();
    } catch (err: any) {
      alert(err.message, "Gagal Absen", "error");
    }
  };

  const handleDownload = async (training: any) => {
    const config = certConfig ? (certConfig[training.id] || certConfig["default"]) : null;
    if (!config) {
      alert("Template sertifikat belum diatur oleh admin.", "Info", "info");
      return;
    }

    let certNumber = "";

    // Auto-record to training_certificates and generate number
    if (supabase) {
      try {
        // Check if certificate record already exists
        const { data: existingCert } = await supabase
          .from("training_certificates")
          .select("certificate_number")
          .eq("user_id", user.id)
          .eq("training_id", training.id)
          .maybeSingle();

        if (existingCert?.certificate_number) {
          certNumber = existingCert.certificate_number;
        } else {
          // Generate an automatic certificate number: [Nomer]/CERT-KKG/[Bulan Romawi]/[Tahun]
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth() + 1;
          const romanMonths = [
            "I",
            "II",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
            "X",
            "XI",
            "XII",
          ];
          const randomPart = Math.floor(1000 + Math.random() * 9000);
          certNumber = `${randomPart}/CERT-KKG/${romanMonths[month - 1]}/${year}`;

          const { data: newCert } = await supabase.from("training_certificates").insert({
            user_id: user.id,
            training_id: training.id,
            certificate_number: certNumber,
            certificate_url: "Generated Individually",
          }).select().single();

          if (newCert) setCertRecords((prev) => ({ ...prev, [training.id]: newCert }));

          logActivity(
            user,
            "download_cert",
            `Mengunduh sertifikat pelatihan: ${training.title}`,
          );
        }
      } catch (err) {
        console.error("Gagal mencatat rincian sertifikat:", err);
      }
    }

    // Generate PDF with the number
    await generateTeacherPDF(user, training, config, certNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-600 border-green-200";
      case "planned":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ongoing":
        return "Sedang Berlangsung";
      case "planned":
        return "Direncanakan";
      case "completed":
        return "Selesai";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Training Clean Header */}
      <div className="bg-white p-6 md:p-8 rounded-[3rem] border-l-8 border-main-blue shadow-sm mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue border border-main-blue/10 shrink-0">
            <GraduationCap className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-main-blue/5 rounded-full border border-main-blue/10 mb-2">
               <div className="w-1 h-1 rounded-full bg-main-blue animate-ping" />
               <span className="text-[10px] font-bold text-main-blue uppercase tracking-widest font-heading">Pusat Belajar</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-heading text-soft-black">
              Portal Pelatihan <span className="text-main-blue">Guru</span>
            </h2>
            <p className="text-sm text-gray-500 max-w-lg leading-relaxed mt-1">
              Akses materi eksklusif, tingkatkan kompetensi profesional, dan kelola sertifikasi Anda dalam satu platform modern.
            </p>
          </div>
        </div>

        {/* Tab System Modernized */}
        <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar bg-gray-50 p-1.5 rounded-2xl shrink-0 border border-gray-100 shadow-inner snap-x">
          {[
            { id: "daftar", label: "Program", icon: Calendar, activeColor: "bg-white text-main-blue shadow-sm" },
            { id: "absensi", label: "Riwayat", icon: CheckSquare, activeColor: "bg-white text-orange-500 shadow-sm" },
            { id: "sertifikat", label: "Sertifikat", icon: Award, activeColor: "bg-white text-amber-500 shadow-sm" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative shrink-0 snap-center whitespace-nowrap ${
                activeSubTab === tab.id
                  ? tab.activeColor
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
              }`}
            >
              <tab.icon className={`w-4 h-4`} />
              {tab.label}
              {activeSubTab === tab.id && (
                <motion.div layoutId="tab-indicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-current rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Memuat data...</div>
      ) : (
        <AnimatePresence mode="wait">
          {activeSubTab === "daftar" && (
            <motion.div
              key="daftar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {trainings.length === 0 ? (
                <div className="md:col-span-2 bg-gray-50 p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">
                  <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Belum ada program pelatihan yang tersedia.
                  </p>
                </div>
              ) : (
                trainings.map((item) => {
                  const reg = registrations[item.id];
                  const isRegistered = !!reg;
                  const hasAttended = reg?.status === "attended";

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const trainingDate = new Date(item.date_start);
                  trainingDate.setHours(0, 0, 0, 0);

                  let autoStatus = item.status || "planned";
                  if (trainingDate > today) autoStatus = "planned";
                  else if (trainingDate.getTime() === today.getTime())
                    autoStatus = "ongoing";
                  else autoStatus = "completed";

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -8 }}
                      className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all flex flex-col group relative"
                    >
                      {/* Sub-header inside card for status */}
                      <div className="absolute top-6 left-6 z-10">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm backdrop-blur-md ${
                          autoStatus === 'ongoing' ? 'bg-leaf-green/90 text-white border-leaf-green/20' :
                          autoStatus === 'planned' ? 'bg-main-blue/90 text-white border-main-blue/20' :
                          'bg-gray-800/80 text-white border-gray-700'
                        }`}>
                          {getStatusLabel(autoStatus)}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row flex-1">
                        {/* Day & Month Badge Section */}
                        <div className={`sm:w-24 flex flex-col items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-gray-50 bg-gradient-to-b ${
                           autoStatus === 'ongoing' ? 'from-leaf-green/5 to-white' :
                           autoStatus === 'planned' ? 'from-main-blue/5 to-white' :
                           'from-gray-50 to-white'
                        }`}>
                          <div className="relative">
                            <div className={`w-20 h-20 rounded-[1.5rem] bg-white shadow-xl flex flex-col items-center justify-center border-t-4 ${
                               autoStatus === 'ongoing' ? 'border-t-leaf-green border-leaf-green/10' :
                               autoStatus === 'planned' ? 'border-t-main-blue border-main-blue/10' :
                               'border-t-gray-400 border-gray-100'
                            }`}>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                {new Date(item.date_start).toLocaleString(
                                  "id-ID",
                                  { month: "short" },
                                )}
                              </span>
                              <span className={`text-4xl font-black leading-none mt-1 ${
                                autoStatus === 'ongoing' ? 'text-leaf-green' :
                                autoStatus === 'planned' ? 'text-main-blue' :
                                'text-gray-700'
                              }`}>
                                {new Date(item.date_start).getDate()}
                              </span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-50">
                               <Calendar className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex-1">
                          <h3 className="font-black text-soft-black text-lg mb-2 leading-tight tracking-tight group-hover:text-main-blue transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                            {item.description}
                          </p>
                          
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center gap-2 bg-gray-50/80 p-2 rounded-xl border border-gray-100 overflow-hidden">
                               <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-main-blue shrink-0">
                                  <MapPin className="w-3 h-3" />
                               </div>
                               <div className="min-w-0">
                                  <p className="text-[8px] font-black text-gray-400 uppercase leading-none mb-0.5">Lokasi</p>
                                  <p className="text-[10px] font-bold text-soft-black truncate">{item.location}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50/80 p-2 rounded-xl border border-gray-100 overflow-hidden">
                               <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-leaf-green shrink-0">
                                  <Clock className="w-3 h-3" />
                               </div>
                               <div className="min-w-0">
                                  <p className="text-[8px] font-black text-gray-400 uppercase leading-none mb-0.5">Waktu</p>
                                  <p className="text-[10px] font-bold text-soft-black truncate">{new Date(item.date_start).toLocaleTimeString("id-ID", { hour: "2-digit", minute:"2-digit" })} WIB</p>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer / Actions */}
                      <div className="p-4 bg-gradient-to-r from-gray-50/50 to-white border-t border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex flex-col gap-2">
                           {isRegistered ? (
                             <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-100 self-start">
                               <CheckCircle className="w-4 h-4 text-green-500" />
                               <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">Terdaftar</span>
                             </div>
                           ) : (
                             <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest pl-2">
                               Belum Terdaftar
                             </div>
                           )}
                           {hasAttended && (item.materi_url || item.video_url) && (
                             <div className="flex flex-wrap items-center gap-2 mt-1">
                               {item.materi_url && (
                                 <a 
                                   href={item.materi_url} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-main-blue rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-colors border border-blue-100"
                                 >
                                   <BookOpen className="w-3 h-3" /> Unduh Materi
                                 </a>
                               )}
                               {item.video_url && (
                                 <a 
                                   href={item.video_url} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase hover:bg-red-100 transition-colors border border-red-100"
                                 >
                                   <Play className="w-3 h-3" /> Rekaman Video
                                 </a>
                               )}
                             </div>
                           )}
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
                          {!isRegistered ? (
                            <button
                              onClick={() => handleRegister(item.id)}
                              disabled={autoStatus === "completed"}
                              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex justify-center items-center gap-2 shadow-lg shrink-0 ${
                                autoStatus === "completed"
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                  : "bg-main-blue text-white shadow-main-blue/20 hover:scale-105 active:scale-95"
                              }`}
                            >
                              <PlusCircle className="w-4 h-4 shrink-0" /> <span className="truncate">{autoStatus === "completed" ? "Pelatihan Selesai" : "Daftar Sekarang"}</span>
                            </button>
                          ) : !hasAttended ? (
                            <button
                              onClick={() => handleAttendance(item.id)}
                              disabled={autoStatus === "completed"}
                              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-[10px] font-black shadow-lg transition-all flex justify-center items-center gap-2 shrink-0 ${
                                autoStatus === "completed"
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200"
                                  : "bg-leaf-green text-white shadow-leaf-green/20 hover:scale-105 active:scale-95"
                              }`}
                            >
                              <UserCheck className="w-4 h-4 shrink-0" /> <span className="truncate">{autoStatus === "completed" ? "Waktu Berakhir" : "Konfirmasi Hadir"}</span>
                            </button>
                          ) : (
                            <div className="w-full sm:w-auto px-5 py-2.5 bg-white text-gray-400 rounded-xl text-[10px] font-black border border-gray-100 shadow-sm flex justify-center items-center gap-2 shrink-0">
                               <Award className="w-4 h-4 text-amber-500" /> <span className="truncate">Selesai</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {activeSubTab === "absensi" && (
            <motion.div
              key="absensi"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-gray-50">
                  <tr className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    <th className="px-8 py-4">Pelatihan</th>
                    <th className="px-8 py-4">Tanggal Daftar</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Absensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Object.values(registrations).length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-8 py-20 text-center text-gray-300"
                      >
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                          <BookOpen className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="font-medium italic">Belum ada riwayat pendaftaran.</p>
                      </td>
                    </tr>
                  ) : (
                    Object.values(registrations).map((reg: any) => {
                      const training = trainings.find(
                        (t) => t.id === reg.training_id,
                      );
                      const isAttended = reg.status === "attended";

                      return (
                        <tr key={reg.id} className="text-sm group hover:bg-blue-50/30 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                               <div className={`w-2 h-8 rounded-full ${isAttended ? 'bg-leaf-green' : 'bg-main-blue opacity-30'}`} />
                               <div>
                                  <p className="font-black text-soft-black leading-tight mb-0.5">{training?.title || "Unknown"}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase">{training?.location}</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                               <span className="font-black text-gray-600">{new Date(reg.registered_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                               <span className="text-[10px] text-gray-400 font-bold uppercase">Terdaftar Pada</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                               isAttended 
                                ? "bg-green-50 text-green-600 border-green-100" 
                                : "bg-blue-50 text-main-blue border-blue-100"
                            }`}>
                               {isAttended ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-main-blue/40 animate-pulse" />}
                               {isAttended ? "Hadir" : "Terdaftar"}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {reg.attended_at ? (
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-400">
                                  {new Date(reg.attended_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                                </span>
                                <span className="text-[10px] text-gray-300 font-bold uppercase">Waktu Absensi</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAttendance(reg.training_id)}
                                className="px-6 py-2 bg-main-blue/10 text-main-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-main-blue hover:text-white transition-all shadow-md shadow-main-blue/5"
                              >
                                Isi Sekarang
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            </motion.div>
          )}

          {activeSubTab === "sertifikat" && (
            <motion.div
              key="sertifikat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {Object.values(registrations).filter(
                (r: any) => r.status === "attended",
              ).length === 0 ? (
                <div className="md:col-span-2 bg-gray-50 p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Award className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-gray-400 mb-2">Belum Tersedia</h3>
                  <p className="text-gray-400 max-w-sm mx-auto font-medium">
                    Selesaikan pelatihan dan pastikan daftar hadir terisi untuk mendapatkan sertifikat Anda.
                  </p>
                </div>
              ) : (
                Object.values(registrations)
                  .filter((r: any) => r.status === "attended")
                  .map((reg: any) => {
                    const training = trainings.find(
                      (t) => t.id === reg.training_id,
                    );
                    const isDownloaded = !!certRecords[reg.training_id];
                    
                    return (
                      <motion.div
                        key={reg.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-8 rounded-[3rem] border-2 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all relative overflow-hidden group ${
                           isDownloaded 
                            ? 'bg-gradient-to-br from-green-50 to-white border-green-100 shadow-xl shadow-green-500/5' 
                            : 'bg-gradient-to-br from-amber-50 to-white border-amber-100 shadow-xl shadow-amber-500/5'
                        }`}
                      >
                        {/* Background Decoration */}
                        <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 blur-3xl opacity-20 ${isDownloaded ? 'bg-green-500' : 'bg-amber-500'}`} />

                        <div className="flex items-center gap-6 relative z-10">
                          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform ${
                             isDownloaded ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'
                          }`}>
                             {isDownloaded ? <CheckCircle className="w-8 h-8" /> : <Award className="w-8 h-8" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Penghargaan Pelatihan</p>
                            <h4 className="font-black text-soft-black text-lg leading-tight mb-1">
                              {training?.title}
                            </h4>
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full animate-pulse ${isDownloaded ? 'bg-green-500' : 'bg-amber-500'}`} />
                               <span className={`text-[11px] font-bold ${isDownloaded ? 'text-green-600' : 'text-amber-600'}`}>
                                 {isDownloaded ? "Sertifikat Terverifikasi" : "Siap Diunduh"}
                               </span>
                            </div>
                          </div>
                        </div>

                        {isDownloadEnabled ? (
                          <button
                            onClick={() => handleDownload(training)}
                            className={`px-8 py-4 text-white rounded-2xl transition-all shadow-2xl relative z-10 flex items-center gap-3 font-black text-xs active:scale-90 ${
                               isDownloaded 
                                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' 
                                : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                            }`}
                          >
                            <Download className="w-5 h-5" />
                            {isDownloaded ? "Cetak Ulang" : "Unduh Sekarang"}
                          </button>
                        ) : (
                          <div className="px-6 py-3 bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                             Terkunci
                          </div>
                        )}
                      </motion.div>
                    );
                  })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
