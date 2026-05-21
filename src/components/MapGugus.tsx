import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { MapPin, School, Info, ArrowRight, Compass, Layers, ShieldCheck, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface SchoolData {
  id: string;
  name: string;
  jenis_sekolah: string;
  logo_url?: string;
  image_url?: string;
  address?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  map_embed_url?: string;
  akreditasi?: string;
}

const PREDEFINED_COORDS: Record<string, { lat: number; lng: number }> = {
  "upt sdn mentoso": { lat: -6.832742, lng: 112.022335 },
  "sdn mentoso": { lat: -6.832742, lng: 112.022335 },
  "mentoso": { lat: -6.832742, lng: 112.022335 },
  "upt sdn remen 1": { lat: -6.808304, lng: 112.008123 },
  "sdn remen 1": { lat: -6.808304, lng: 112.008123 },
  "remen 1": { lat: -6.808304, lng: 112.008123 },
  "upt sdn remen 2": { lat: -6.815214, lng: 112.015244 },
  "sdn remen 2": { lat: -6.815214, lng: 112.015244 },
  "remen 2": { lat: -6.815214, lng: 112.015244 },
  "upt sdn tasikharjo": { lat: -6.828311, lng: 111.983844 },
  "sdn tasikharjo": { lat: -6.828311, lng: 111.983844 },
  "tasikharjo": { lat: -6.828311, lng: 111.983844 },
  "sdn jenu 1": { lat: -6.88512, lng: 112.0132 },
  "sdn jenu 2": { lat: -6.88750, lng: 112.0172 },
  "sdn jenu 3": { lat: -6.88920, lng: 112.0205 }
};

function extractCoordsFromEmbedUrl(url: string) {
  if (!url) return null;
  // !2d112.0163353!3d-6.8875567
  const dMatch = url.match(/!2d(-?\d+\.\d+)/);
  const tMatch = url.match(/!3d(-?\d+\.\d+)/);
  if (dMatch && tMatch) {
    return {
      lat: parseFloat(tMatch[1]),
      lng: parseFloat(dMatch[1])
    };
  }
  const qMatch = url.match(/[?&](q|cbll|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return {
      lat: parseFloat(qMatch[2]),
      lng: parseFloat(qMatch[3])
    };
  }
  return null;
}

export default function MapGugus() {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 1. Load Leaflet CDN Assets
  useEffect(() => {
    // Inject Link CSS
    const linkId = "leaflet-css-cdn";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    // Inject JS Script
    const scriptId = "leaflet-js-cdn";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.crossOrigin = "";
      script.onload = () => {
        setLeafletReady(true);
      };
      document.body.appendChild(script);
    } else {
      if ((window as any).L) {
        setLeafletReady(true);
      }
    }
  }, []);

  // 2. Fetch Schools from Supabase
  useEffect(() => {
    async function loadSchools() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("schools")
          .select("*")
          .order("jenis_sekolah", { ascending: true });
        if (error) throw error;
        setSchools(data || []);
      } catch (err) {
        console.error("Error loading schools for map:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSchools();
  }, []);

  // 3. Initialize and Update Map
  useEffect(() => {
    if (!leafletReady || isLoading || !mapContainerRef.current || schools.length === 0) return;

    const L = (window as any).L;
    if (!L) return;

    // Check if map is already initialized, clear it if true
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Custom school centers around Jenu, Tuban
    const centerLat = -6.832;
    const centerLng = 112.010;

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    mapRef.current = map;

    // Load beautiful minimalist light theme tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20
    }).addTo(map);

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Helper to get coordinates
    const getSchoolCoords = (school: SchoolData, idx: number) => {
      // Try embed url first
      if (school.map_embed_url) {
        const coords = extractCoordsFromEmbedUrl(school.map_embed_url);
        if (coords) return coords;
      }

      // Try predefined mapping
      const key = school.name.toLowerCase().trim();
      if (PREDEFINED_COORDS[key]) {
        return PREDEFINED_COORDS[key];
      }

      // Fallback: search key partials
      for (const [nameKey, value] of Object.entries(PREDEFINED_COORDS)) {
        if (key.includes(nameKey) || nameKey.includes(key)) {
          return value;
        }
      }

      // Otherwise scatter around centro
      // Introduce calculated pattern so they don't overlap completely
      const angle = (idx * 2 * Math.PI) / (schools.length || 1);
      const radius = 0.015 + (idx * 0.003); // scatter radius
      return {
        lat: centerLat + Math.sin(angle) * radius,
        lng: centerLng + Math.cos(angle) * radius
      };
    };

    // Plot each school
    schools.forEach((school, index) => {
      const coords = getSchoolCoords(school, index);
      const isInti = school.jenis_sekolah === "Sekolah Inti";

      // Design unique HTML for the custom marker featuring School Building Building Icon & Name Label
      const markerHtml = `
        <div class="flex flex-col items-center select-none" style="transform: translate(-50%, -100%);">
          <!-- Tooltip Label -->
          <div class="px-2.5 py-1 rounded-lg shadow-md border text-[10px] font-extrabold whitespace-nowrap bg-white text-soft-black leading-tight border-gray-100 ${isInti ? "ring-2 ring-main-blue/30 scale-105" : "scale-95"} mb-1 transition-all duration-300">
            ${school.name}
          </div>
          <!-- Pin body -->
          <div class="relative flex items-center justify-center">
            <!-- Ripple Effect for Sekolah Inti -->
            ${isInti ? `
              <div class="absolute w-10 h-10 bg-main-blue/20 rounded-full animate-ping"></div>
              <div class="absolute w-8 h-8 bg-main-blue/30 rounded-full animate-pulse"></div>
            ` : ""}
            
            <!-- Icon frame -->
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transition-all transform hover:scale-115 active:scale-95 cursor-pointer ${
              isInti 
                ? "bg-gradient-to-br from-main-blue to-dark-blue" 
                : "bg-gradient-to-br from-leaf-green to-emerald-600"
            }">
              <!-- School Building Graphic (Simple SVG) -->
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            
            <!-- Pin stalk -->
            <div class="w-1 h-2 -mt-[2px] ${isInti ? "bg-main-blue" : "bg-leaf-green"} mx-auto rounded-b shadow"></div>
          </div>
        </div>
      `;

      // Create Leaflet DivIcon
      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-school-marker",
        iconSize: [120, 70],
        iconAnchor: [60, 65]
      });

      // Add to map
      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon })
        .addTo(map)
        .on("click", () => {
          setSelectedSchool(school);
          map.setView([coords.lat, coords.lng], 15, { animate: true, duration: 1 });
        });

      markersRef.current.push(marker);
    });

    // Auto-adjust fit map boundaries to show all plotted schools nicely
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    return () => {
      markersRef.current.forEach(m => m.remove());
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletReady, isLoading, schools]);

  // Focus Map to specified school
  const zoomToSchool = (school: SchoolData) => {
    if (!mapRef.current) return;
    setSelectedSchool(school);

    // Get coordinates using identical logic
    const idx = schools.findIndex(s => s.id === school.id);
    const isInti = school.jenis_sekolah === "Sekolah Inti";
    
    // Calculate custom coordinates
    let coords = null;
    if (school.map_embed_url) {
      coords = extractCoordsFromEmbedUrl(school.map_embed_url);
    }
    
    if (!coords) {
      const nameKey = school.name.toLowerCase().trim();
      coords = PREDEFINED_COORDS[nameKey] || Object.values(PREDEFINED_COORDS)[idx % 5];
    }

    if (coords) {
      mapRef.current.setView([coords.lat, coords.lng], 15.5, {
        animate: true,
        duration: 1.2
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-main-orange/20 shadow-xl p-4 sm:p-6">
      {/* Map Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-main-orange/10 rounded-2xl flex items-center justify-center text-main-orange">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-heading font-extrabold text-lg text-soft-black">Peta Digital Jaringan Pendidikan</h4>
            <p className="text-xs text-gray-500">Pemetaan visual lokasi Sekolah Inti & Sekolah Imbas Gugus 3 Melati</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-gray-50 p-2 sm:p-3 rounded-2xl border border-gray-100 font-bold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl shadow-sm border border-gray-200/50">
            <div className="w-3.5 h-3.5 bg-gradient-to-tr from-main-blue to-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">
              <span className="font-extrabold">I</span>
            </div>
            <span className="text-main-blue">Sekolah Inti</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl shadow-sm border border-gray-200/50">
            <div className="w-3.5 h-3.5 bg-gradient-to-tr from-leaf-green to-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white">
              <span className="font-extrabold">M</span>
            </div>
            <span className="text-leaf-green">Sekolah Imbas</span>
          </div>
        </div>
      </div>

      {/* Main Container Core */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar School List Selection Panel */}
        <div className="lg:col-span-1 max-h-[500px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-gray-200">
          <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 pl-1 block">Daftar Sekolah Anggota</p>
          {schools.length === 0 ? (
            <div className="text-center text-xs text-gray-400 py-6">Memuat daftar sekolah...</div>
          ) : (
            schools.map((school) => {
              const isInti = school.jenis_sekolah === "Sekolah Inti";
              const isCurrent = selectedSchool?.id === school.id;
              return (
                <button
                  key={school.id}
                  onClick={() => zoomToSchool(school)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isCurrent
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-main-blue ring-1 ring-main-blue/20"
                      : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isInti 
                      ? "bg-blue-100/50 border-blue-200 text-main-blue" 
                      : "bg-green-100/50 border-green-200 text-leaf-green"
                  }`}>
                    <School className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-soft-black truncate leading-tight">{school.name}</p>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isInti ? "text-main-blue" : "text-leaf-green"}`}>
                      {school.jenis_sekolah}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Map Stage Viewer */}
        <div className="lg:col-span-3 relative bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden shadow-inner h-[400px] sm:h-[500px]">
          {(!leafletReady || isLoading) && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 border-4 border-main-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">Menyiapkan peta digital...</p>
            </div>
          )}
          
          {/* Map canvas container */}
          <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 10 }} />

          {/* Floating School Detail Popup Indicator Overlay */}
          {selectedSchool && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-white/95 backdrop-blur-md rounded-2.5rem p-4 border border-gray-100 shadow-2xl z-[1000] max-w-sm w-auto animate-fade-in-up">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                  <img
                    src={selectedSchool.logo_url || "https://www.image2url.com/r2/default/images/1778156189287-e4930eb4-3c36-4ace-8420-ca8908132e66.png"}
                    alt="Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    selectedSchool.jenis_sekolah === "Sekolah Inti"
                      ? "bg-main-blue/10 text-main-blue"
                      : "bg-leaf-green/10 text-leaf-green"
                  }`}>
                    {selectedSchool.jenis_sekolah}
                  </span>
                  <p className="font-extrabold text-sm text-soft-black mt-1 leading-tight">{selectedSchool.name}</p>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5 leading-tight truncate">
                    Kepsek: {selectedSchool.principal_name || "-"}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                    <span>Siswa: <strong className="text-soft-black font-extrabold">{selectedSchool.student_count || 0}</strong></span>
                    <span>Guru: <strong className="text-soft-black font-extrabold">{selectedSchool.teacher_count || 0}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100/80">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-leaf-green" /> Verifikasi Gugus
                </span>
                <a
                  href="#sekolah"
                  onClick={() => {
                    const el = document.getElementById("sekolah");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    // Give a slight delay then activate selected school modal in the listing page
                    const btn = document.querySelector(`button[onClick*="setSelectedSchool"]`);
                    if (btn) (btn as HTMLButtonElement).click();
                  }}
                  className="px-3.5 py-1.5 bg-soft-black hover:bg-main-blue text-white rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all hover:scale-103 shadow active:scale-95 flex items-center gap-1.5 cursor-pointer leading-tight"
                >
                  Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
