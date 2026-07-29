import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const defaultContent = {
  hero: {
    title1: "GUGUS 03 MELATI",
    title2: "KECAMATAN JENU",
    description: "Kolaboratif, Inovatif, dan Berkualitas. Menggerakkan komunitas pendidik di Gugus 03 Melati Kecamatan Jenu menuju transformasi digital yang inklusif.",
    logo: "https://www.image2url.com/r2/default/images/1778156189287-e4930eb4-3c36-4ace-8420-ca8908132e66.png"
  },
  stats: [
    { id: 1, label: "Sekolah Imbas", value: 6, suffix: "", color: "text-dark-green" },
    { id: 2, label: "Guru Profesional", value: 120, suffix: "+", color: "text-main-blue" },
    { id: 3, label: "Total Siswa", value: 1500, suffix: "+", color: "text-accent-orange" },
  ],
  profil: {
    title: "Bersama Kita Tumbuh, Menginspirasi Masa Depan",
    quote: "\"Pendidikan bukan sekadar transfer ilmu, melainkan proses membentuk karakter dan peradaban. Di Gugus 03 Melati Kecamatan Jenu, kami berkomitmen menjadi wadah kolaborasi antar sekolah untuk memastikan setiap anak mendapatkan hak pendidikan terbaiknya.\"",
    name: "Sulastri, S.Pd",
    role: "Ketua Gugus 03 Melati Kecamatan Jenu",
    periodeKepengurusan: "2024-2027",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop"
  },
  footer: {
    description: "Mewujudkan ekosistem pendidikan yang kolaboratif, inovatif, dan berkualitas di Kecamatan Jenu untuk generasi penerus bangsa.",
    address: "Sekretariat Gugus 03 Jalan Raya Mentoso, Desa Mentoso Kec. Jenu, Kabupaten Tuban, Jawa Timur 62352",
    phone: "085604431706",
    email: "gugus3jenu@gmail.com",
    waNumber: "6281234567890",
    social: {
      instagram: "#",
      facebook: "#",
      tiktok: "#",
      youtube: "#"
    }
  },
  schools: [
    { 
      name: "UPT SD Negeri Mentoso", 
      head: "Sulastri, S.Pd", 
      headImg: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
      students: 320, 
      teachers: 24, 
      img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2000&auto=format&fit=crop",
      visi: "Terwujudnya siswa yang beriman, berprestasi, ramah lingkungan dan berwawasan global.",
      misi: [
        "Meningkatkan keimanan dan ketakwaan melalui kegiatan keagamaan.",
        "Membangun lingkungan sekolah yang bersih, sehat, dan asri.",
        "Meningkatkan kualitas pembelajaran melalui pendekatan inovatif."
      ],
      tujuan: [
        "Menghasilkan lulusan yang cerdas dan berkarakter.",
        "Mampu bersaing di tingkat regional maupun nasional."
      ],
      moto: "Berprestasi dalam Karya, Berpijak pada Budaya Bangsa",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.757833075678!2d111.96674681669921!3d-6.790938361099195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7706a1d4715501%3A0xeebd2de5c7c2b3e8!2sJenu%2C%20Tuban%20Regency%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1703649514732!5m2!1sen!2sid"
    },
    { 
      name: "UPT SD Negeri Sumurgeneng 1", 
      head: "Umar Faroch, S.Pd.I", 
      headImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop",
      students: 280, 
      teachers: 20, 
      img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064&auto=format&fit=crop",
      visi: "Mewujudkan sekolah unggul dalam prestasi dan berkarakter profil pelajar Pancasila.",
      misi: [
        "Melaksanakan pembelajaran yang aktif, kreatif, efektif, dan menyenangkan.",
        "Mengembangkan potensi minat dan bakat siswa di bidang akademik dan non-akademik.",
      ],
      tujuan: [
        "Terwujudnya peningkatan mutu lulusan secara akademis.",
        "Terbentuknya karakter jujur, disiplin, dan bertanggung jawab."
      ],
      moto: "Belajar Cerdas, Bekerja Ikhlas, Berkarya Tuntas",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.757833075678!2d111.96674681669921!3d-6.790938361099195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7706a1d4715501%3A0xeebd2de5c7c2b3e8!2sJenu%2C%20Tuban%20Regency%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1703649514732!5m2!1sen!2sid"
    },
    { 
      name: "UPT SD Negeri Sumurgeneng 2", 
      head: "Umar Faroch, S.Pd.I", 
      headImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop",
      students: 410, 
      teachers: 30, 
      img: "https://images.unsplash.com/photo-1546410531-bea4cada4ff8?q=80&w=2000&auto=format&fit=crop",
      visi: "Generasi unggul yang religius, berbudaya lingkungan, dan mandiri.",
      misi: [
        "Menanamkan nilai-nilai keagamaan dalam kehidupan sehari-hari.",
        "Mengembangkan kemandirian melalui program ekstrakurikuler."
      ],
      tujuan: [
        "Menanamkan karakter peduli lingkungan sejak dini.",
        "Mampu menjadi teladan bagi masyarakat sekitar."
      ],
      moto: "Santun Berperilaku, Unggul Bermutu",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.757833075678!2d111.96674681669921!3d-6.790938361099195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7706a1d4715501%3A0xeebd2de5c7c2b3e8!2sJenu%2C%20Tuban%20Regency%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1703649514732!5m2!1sen!2sid"
    },
    { 
      name: "UPT SD Negeri Remen 1", 
      head: "Sunarsih, S.Pd", 
      headImg: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
      students: 250, 
      teachers: 18, 
      img: "https://images.unsplash.com/photo-1510531704581-5b28709ec68c?q=80&w=2000&auto=format&fit=crop",
      visi: "Pusat keunggulan pendidikan yang berwawasan global dan cinta tanah air.",
      misi: [
        "Meningkatkan rasa nasionalisme melalui pendidikan kewarganegaraan.",
        "Melengkapi sarana prasarana penunjang pembelajaran."
      ],
      tujuan: [
        "Memiliki prestasi tingkat nasional di bidang seni maupun olahraga.",
        "Menciptakan lingkungan yang mendukung penguasaan bahasa dan tata krama."
      ],
      moto: "Mendidik dengan Hati, Meraih Prestasi",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.757833075678!2d111.96674681669921!3d-6.790938361099195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7706a1d4715501%3A0xeebd2de5c7c2b3e8!2sJenu%2C%20Tuban%20Regency%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1703649514732!5m2!1sen!2sid"
    },
    { 
      name: "UPT SD Negeri Remen 2", 
      head: "Nurhariadji, S.Pd", 
      headImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop",
      students: 210, 
      teachers: 15, 
      img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop",
      visi: "Terwujudnya sekolah yang ramah anak, kreatif, dan mandiri.",
      misi: [
        "Menyelenggarakan pendidikan yang menyenangkan dan bermakna.",
        "Mengembangkan minat baca pada peserta didik."
      ],
      tujuan: [
        "Menumbuhkan kebiasaan positif melalui kegiatan literasi.",
        "Mampu menghadapi tantangan perubahan zaman."
      ],
      moto: "Tiada Hari Tanpa Prestasi",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.757833075678!2d111.96674681669921!3d-6.790938361099195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7706a1d4715501%3A0xeebd2de5c7c2b3e8!2sJenu%2C%20Tuban%20Regency%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1703649514732!5m2!1sen!2sid"
    },
    { 
      name: "UPT SD Negeri Tasikharjo", 
      head: "Totok, S.Pd.SD", 
      headImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop",
      students: 350, 
      teachers: 22, 
      img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop",
      visi: "Sekolah berkarakter, berbudaya, dan kompetitif dalam era IPTEK.",
      misi: [
        "Mengintegrasikan teknologi dalam proses pembelajaran.",
        "Melibatkan masyarakat dalam pelestarian budaya lokal."
      ],
      tujuan: [
        "Menjadi sekolah rujukan dalam penerapan kurikulum berbasis teknologi.",
        "Meluluskan siswa yang cakap digital dan berakhlak mulia."
      ],
      moto: "Maju Bersama, Hebat Semua",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.757833075678!2d111.96674681669921!3d-6.790938361099195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7706a1d4715501%3A0xeebd2de5c7c2b3e8!2sJenu%2C%20Tuban%20Regency%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1703649514732!5m2!1sen!2sid"
    }
  ],
  kkg: {
    sejarah: "",
    gambarProfil: "",
    persentaseKolaborasi: "",
    tahunDedikasi: "",
    anggotaAktif: "",
    programDiselesaikan: 0,
    totalWorkshop: 0,
    realisasiProgram: 0,
    partisipasiGuru: 0,
    statistikKkg: [],
    visi: "",
    misi: [],
    tujuan: [],
    dokumen: [],
    pengumuman: {
      title: "",
      desc: "",
      isActive: false
    },
    struktur: [],
    programs: {}
  },
  news: [
    { title: "Penerapan Kurikulum Merdeka di Jenu", date: "12 Mar 2024", author: "Humas Gugus", img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop", cat: "Berita" },
    { title: "Jadwal Workshop Peningkatan Kompetensi Guru", date: "10 Mar 2024", author: "Admin", img: "https://images.unsplash.com/photo-1427504494785-3b9ca2044fcc?q=80&w=2000&auto=format&fit=crop", cat: "Pengumuman" },
    { title: "Pentingnya Pendidikan Karakter Siswa", date: "08 Mar 2024", author: "Budi S.", img: "https://images.unsplash.com/photo-1546410531-bea4cada4ff8?q=80&w=2000&auto=format&fit=crop", cat: "Artikel" },
  ],
  gallery: [
    { type: 'image', size: 'large', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop' },
    { type: 'image', size: 'small', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop' },
    { type: 'image', size: 'small', url: 'https://images.unsplash.com/photo-1546410531-bea4cada4ff8?q=80&w=2000&auto=format&fit=crop' },
    { type: 'video', size: 'medium', url: 'https://images.unsplash.com/photo-1510531704581-5b28709ec68c?q=80&w=2000&auto=format&fit=crop' },
    { type: 'image', size: 'medium', url: 'https://images.unsplash.com/photo-1427504494785-3b9ca2044fcc?q=80&w=2000&auto=format&fit=crop' },
  ],
  gugus: {
    sejarah: "",
    visi: "",
    misi: [],
    tujuan: [],
    tahunBerdiri: "",
    sekolahInti: "",
    wilayahKerja: "",
    struktur: [],
    programs: [],
    dokumen: []
  },
  agenda: [
    { title: 'Rapat Persiapan Ujian', time: 'Kamis, 09:00 WIB', location: 'Ruang Guru Utama' },
    { title: 'Pertemuan KKG Gugus 03', time: 'Jumat, 13:00 WIB', location: 'SDN Mentoso' },
    { title: 'Batas Upload Nilai Akhir', time: 'Senin Depan', location: 'Daring (Sistem)' },
  ],
  announcement: {
    active: true,
    title: "Pengumuman & Informasi",
    subtitle: "Gugus 03 Melati Kecamatan Jenu",
    desc: "Mari ikuti berbagai kegiatan dan program unggulan komunitas pendidik Gugus 03 Melati Kecamatan Jenu.",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=1200",
    linkUrl: "",
    buttonText: "Lihat Selengkapnya"
  },
  activeMenus: {
    overview: true,
    profil: true,
    jadwal: true,
    materi: true,
    notulen: true,
    pelatihan: true,
    forum: true,
    sharing: true,
    upload_karya: true,
    gugus: true,
    kkg: true,
    berita: true,
    galeri: true,
    download: true
  }
};

export type SiteContent = typeof defaultContent;

const recursivelyReplaceGugus3 = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return obj.replace(/Gugus 3(?!\d)/gi, (match) => {
      if (match.toUpperCase() === match) return 'GUGUS 03';
      if (match.toLowerCase() === match) return 'gugus 03';
      return 'Gugus 03';
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(item => recursivelyReplaceGugus3(item));
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = recursivelyReplaceGugus3(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

const sanitizeSiteContent = (raw: any): any => {
  if (!raw || typeof raw !== 'object') return raw;
  const copy = JSON.parse(JSON.stringify(raw));

  // 1. Strip heavy certificate configs from site_settings so each config is stored separately in training_certificates SQL table
  delete copy.certificate_configs;
  delete copy.certificate_config;

  // 2. Strip heavy arrays that belong in separate SQL tables
  delete copy.schools;
  delete copy.news;
  delete copy.gallery;

  // 3. Clean up oversized Base64 strings (>250KB) anywhere inside JSON
  const cleanOversizedBase64 = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string' && obj[key].startsWith('data:') && obj[key].length > 2500000) {
        obj[key] = '';
      } else if (typeof obj[key] === 'object') {
        cleanOversizedBase64(obj[key]);
      }
    }
  };
  cleanOversizedBase64(copy);

  return copy;
};

const mergeContent = (base: any, incomingRaw: any) => {
  if (!incomingRaw) return base;
  const incoming = recursivelyReplaceGugus3(incomingRaw);
  return {
    ...base,
    ...incoming,
    hero: base.hero && incoming.hero ? { ...base.hero, ...incoming.hero } : (incoming.hero || base.hero),
    profil: base.profil && incoming.profil ? { ...base.profil, ...incoming.profil } : (incoming.profil || base.profil),
    footer: base.footer && incoming.footer ? { ...base.footer, ...incoming.footer } : (incoming.footer || base.footer),
    kkg: base.kkg && incoming.kkg ? {
      ...base.kkg,
      ...incoming.kkg,
      programs: incoming.kkg.programs || base.kkg.programs,
      programCategories: incoming.kkg.programCategories || base.kkg.programCategories,
      statistikKkg: incoming.kkg.statistikKkg || base.kkg.statistikKkg,
      dokumen: incoming.kkg.dokumen || base.kkg.dokumen,
    } : (incoming.kkg || base.kkg),
    gugus: base.gugus && incoming.gugus ? {
      ...base.gugus,
      ...incoming.gugus,
      programs: incoming.gugus.programs || base.gugus.programs,
      dokumen: incoming.gugus.dokumen || base.gugus.dokumen,
    } : (incoming.gugus || base.gugus),
    announcement: base.announcement && incoming.announcement ? { ...base.announcement, ...incoming.announcement } : (incoming.announcement || base.announcement),
    activeMenus: base.activeMenus && incoming.activeMenus ? { ...base.activeMenus, ...incoming.activeMenus } : (incoming.activeMenus || base.activeMenus),
  };
};

const getInitialContent = (): SiteContent => {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('siteContent');
      if (local) {
        const parsed = JSON.parse(local);
        return mergeContent(defaultContent, parsed);
      }
    } catch (e) {
      console.warn("Failed to load initial site content from localStorage:", e);
    }
  }
  return defaultContent;
};

interface SiteContextType {
  content: SiteContent;
  updateContent: (newContent: Partial<SiteContent>) => Promise<void>;
  isLoading: boolean;
  saveMessage: string | null;
}

const SiteContext = createContext<SiteContextType>({
  content: defaultContent,
  updateContent: async () => {},
  isLoading: true,
  saveMessage: null,
});

export const useSiteContent = () => useContext(SiteContext);

export const SiteProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<SiteContent>(getInitialContent);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadContent = async (retryCount = 0) => {
    try {
      if (supabase) {
        const { data: siteData, error: siteError } = await supabase.from('site_settings').select('content').eq('id', 1).single();
        let rawContent = siteData?.content ? { ...siteData.content } : {};
        delete rawContent.kkg;
        delete rawContent.gugus;

        const { data: kkgData } = await supabase.from('kkg_settings').select('content').eq('id', 1).single();
        let kkgParsed = kkgData?.content ? { ...kkgData.content } : {};
        const { data: kkgDocData } = await supabase.from('kkg_documents').select('content').eq('id', 1).single();
        if (kkgDocData && kkgDocData.content) {
          kkgParsed.dokumen = kkgDocData.content;
        }
        const { data: kkgProgRows } = await supabase.from('kkg_programs').select('*');
        const kkgProgramsMapped: any = {
          tahunan: [],
          workshop: [],
          supervisi: [],
          media: []
        };
        if (kkgProgRows) {
          kkgProgRows.forEach((row: any) => {
            const cat = row.category_id || 'tahunan';
            if (!kkgProgramsMapped[cat]) {
              kkgProgramsMapped[cat] = [];
            }
            kkgProgramsMapped[cat].push({
              id: row.id,
              title: row.title || '',
              desc: row.desc_text || '',
              date: row.execution_date || '',
              status: row.status || 'rencana'
            });
          });
        }
        kkgParsed.programs = kkgProgramsMapped;
        rawContent.kkg = kkgParsed;

        const { data: gugusData } = await supabase.from('gugus_settings').select('content').eq('id', 1).single();
        let gugusParsed = gugusData?.content ? { ...gugusData.content } : {};
        const { data: gugusDocData } = await supabase.from('gugus_documents').select('content').eq('id', 1).single();
        if (gugusDocData && gugusDocData.content) {
          gugusParsed.dokumen = gugusDocData.content;
        }
        const { data: gugusProgRows } = await supabase.from('gugus_programs').select('*').order('created_at', { ascending: true });
        const gugusProgramsMapped: any[] = [];
        if (gugusProgRows) {
          gugusProgRows.forEach((row: any) => {
            gugusProgramsMapped.push({
              id: row.id,
              title: row.title || '',
              desc: row.desc_text || '',
              date: row.execution_date || '',
              status: row.status || 'rencana'
            });
          });
        }
        gugusParsed.programs = gugusProgramsMapped;
        rawContent.gugus = gugusParsed;

        const merged = mergeContent(defaultContent, rawContent);
        setContent(merged);
        try {
          localStorage.setItem('siteContent', JSON.stringify(merged));
        } catch (storageError) {
          console.warn("Failed to store siteContent in localStorage:", storageError);
        }
      }
    } catch (e) {
      console.error("Backend load error:", e);
      if (retryCount < 3) {
        setTimeout(() => loadContent(retryCount + 1), 800 * (retryCount + 1));
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();

    let channelSite: any = null;
    let channelKkg: any = null;
    let channelGugus: any = null;
    let channelKkgDoc: any = null;
    let channelKkgProg: any = null;
    let channelGugusDoc: any = null;
    let channelGugusProg: any = null;
    if (supabase) {
      channelSite = supabase
        .channel('realtime_site_settings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_settings', filter: 'id=eq.1' },
          (payload) => {
            if (payload.new && (payload.new as any).content) {
              loadContent();
            }
          }
        )
        .subscribe();

      channelKkg = supabase
        .channel('realtime_kkg_settings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'kkg_settings', filter: 'id=eq.1' },
          (payload) => {
            if (payload.new && (payload.new as any).content) {
              loadContent();
            }
          }
        )
        .subscribe();

      channelGugus = supabase
        .channel('realtime_gugus_settings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gugus_settings', filter: 'id=eq.1' },
          (payload) => {
            if (payload.new && (payload.new as any).content) {
              loadContent();
            }
          }
        )
        .subscribe();

      channelKkgDoc = supabase
        .channel('realtime_kkg_documents')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'kkg_documents', filter: 'id=eq.1' },
          (payload) => {
            if (payload.new && (payload.new as any).content) {
              loadContent();
            }
          }
        )
        .subscribe();

      channelKkgProg = supabase
        .channel('realtime_kkg_programs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'kkg_programs' },
          () => {
            loadContent();
          }
        )
        .subscribe();

      channelGugusDoc = supabase
        .channel('realtime_gugus_documents')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gugus_documents', filter: 'id=eq.1' },
          (payload) => {
            if (payload.new && (payload.new as any).content) {
              loadContent();
            }
          }
        )
        .subscribe();

      channelGugusProg = supabase
        .channel('realtime_gugus_programs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gugus_programs' },
          () => {
            loadContent();
          }
        )
        .subscribe();
    }

    const handleOnline = () => {
      loadContent();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      if (channelSite && supabase) supabase.removeChannel(channelSite);
      if (channelKkg && supabase) supabase.removeChannel(channelKkg);
      if (channelGugus && supabase) supabase.removeChannel(channelGugus);
      if (channelKkgDoc && supabase) supabase.removeChannel(channelKkgDoc);
      if (channelKkgProg && supabase) supabase.removeChannel(channelKkgProg);
      if (channelGugusDoc && supabase) supabase.removeChannel(channelGugusDoc);
      if (channelGugusProg && supabase) supabase.removeChannel(channelGugusProg);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const updateContent = async (newContent: Partial<SiteContent>) => {
    const updated = mergeContent(content, newContent);
    const cleanPayload = sanitizeSiteContent(updated);

    const isValidUUID = (str: string) => {
      if (!str) return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    };

    setContent(updated);
    try {
      localStorage.setItem('siteContent', JSON.stringify(cleanPayload));
    } catch (storageError) {
      console.warn("Failed to store siteContent in localStorage:", storageError);
    }
    setSaveMessage("Menyimpan...");
    
    try {
      if (supabase) {
        if (newContent.kkg) {
          const kkgObj = { ...updated.kkg };
          const kkgDokumen = kkgObj.dokumen || [];
          const kkgPrograms = kkgObj.programs || {};
          delete kkgObj.dokumen;
          delete kkgObj.programs;
          const cleanKkg = sanitizeSiteContent(kkgObj);
          const { error: kkgErr } = await supabase.from('kkg_settings').upsert({ id: 1, content: cleanKkg });
          if (kkgErr) {
            console.error("Error saving kkg_settings:", kkgErr);
            throw new Error("Gagal menyimpan kkg_settings: " + kkgErr.message);
          }

          const { error: kkgDocErr } = await supabase.from('kkg_documents').upsert({ id: 1, content: kkgDokumen });
          if (kkgDocErr) {
            console.error("Error saving kkg_documents:", kkgDocErr);
            throw new Error("Gagal menyimpan kkg_documents: " + kkgDocErr.message);
          }

          const kkgProgRows: any[] = [];
          Object.keys(kkgPrograms).forEach((catId) => {
            const list = kkgPrograms[catId] || [];
            list.forEach((item: any) => {
              const row: any = {
                category_id: catId,
                title: item.title || '',
                desc_text: item.desc || '',
                execution_date: item.date || '',
                status: item.status || 'rencana'
              };
              if (item.id && isValidUUID(item.id)) {
                row.id = item.id;
              }
              kkgProgRows.push(row);
            });
          });

          const { error: kkgDelErr } = await supabase.from('kkg_programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (kkgDelErr) {
            console.error("Error deleting old kkg_programs:", kkgDelErr);
            throw new Error("Gagal mengosongkan tabel kkg_programs: " + kkgDelErr.message);
          }
          
          if (kkgProgRows.length > 0) {
            const { error: kkgInsErr } = await supabase.from('kkg_programs').insert(kkgProgRows);
            if (kkgInsErr) {
              console.error("Error inserting kkg_programs:", kkgInsErr);
              throw new Error("Gagal memasukkan data program KKG baru: " + kkgInsErr.message);
            }
          }
        }

        if (newContent.gugus) {
          const gugusObj = { ...updated.gugus };
          const gugusDokumen = gugusObj.dokumen || [];
          const gugusPrograms = gugusObj.programs || [];
          delete gugusObj.dokumen;
          delete gugusObj.programs;
          const cleanGugus = sanitizeSiteContent(gugusObj);
          const { error: gugusErr } = await supabase.from('gugus_settings').upsert({ id: 1, content: cleanGugus });
          if (gugusErr) {
            console.error("Error saving gugus_settings:", gugusErr);
            throw new Error("Gagal menyimpan gugus_settings: " + gugusErr.message);
          }

          const { error: gugusDocErr } = await supabase.from('gugus_documents').upsert({ id: 1, content: gugusDokumen });
          if (gugusDocErr) {
            console.error("Error saving gugus_documents:", gugusDocErr);
            throw new Error("Gagal menyimpan gugus_documents: " + gugusDocErr.message);
          }

          const gugusProgRows: any[] = [];
          const list = gugusPrograms || [];
          list.forEach((item: any) => {
            const row: any = {
              title: item.title || '',
              desc_text: item.desc || '',
              execution_date: item.date || '',
              status: item.status || 'rencana'
            };
            if (item.id && isValidUUID(item.id)) {
              row.id = item.id;
            }
            gugusProgRows.push(row);
          });

          const { error: gugusDelErr } = await supabase.from('gugus_programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (gugusDelErr) {
            console.error("Error deleting old gugus_programs:", gugusDelErr);
            throw new Error("Gagal mengosongkan tabel gugus_programs: " + gugusDelErr.message);
          }
          
          if (gugusProgRows.length > 0) {
            const { error: gugusInsErr } = await supabase.from('gugus_programs').insert(gugusProgRows);
            if (gugusInsErr) {
              console.error("Error inserting gugus_programs:", gugusInsErr);
              throw new Error("Gagal memasukkan data program Gugus baru: " + gugusInsErr.message);
            }
          }
        }

        const sitePayload = { ...cleanPayload };
        delete sitePayload.kkg;
        delete sitePayload.gugus;

        const { error } = await supabase.from('site_settings').upsert({ id: 1, content: sitePayload });
        if (!error) {
          setSaveMessage("Berhasil tersimpan!");
        } else {
          console.error("Supabase site_settings error:", error);
          setSaveMessage("Gagal menyimpan ke server.");
          throw new Error("Gagal menyimpan ke server database: " + (error.message || "Unknown error"));
        }
      } else {
        setSaveMessage("Disimpan ke browser.");
      }
    } catch (e: any) {
      console.error("Error in updateContent:", e);
      setSaveMessage("Gagal menyimpan.");
      throw e;
    }

    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };

  return (
    <SiteContext.Provider value={{ content, updateContent, isLoading, saveMessage }}>
      {children}
    </SiteContext.Provider>
  );
};
