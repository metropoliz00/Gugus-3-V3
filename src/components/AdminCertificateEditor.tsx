import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Text, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { supabase } from "../lib/supabase";

const StageComponent = Stage as any;
const LayerComponent = Layer as any;
const TextComponent = Text as any;
const KonvaImageComponent = KonvaImage as any;
import {
  Award,
  Save,
  Download,
  Plus,
  Trash2,
  Move,
  Type,
  Settings,
  RefreshCw,
  Image as ImageIcon,
  Database,
  Users,
  Edit3,
  CheckCircle2,
  UserCheck,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "./ImageUpload";
import { useAlert } from "../contexts/AlertContext";

// =================================
// TYPES
// =================================

interface FieldType {
  id: string;
  field_name: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: string;
  color: string;
  page?: number;
  align?: "left" | "center" | "right";
}

interface PlaceholderConfig {
  label: string;
  placeholder: string;
  dbField: string;
}

interface CertificateConfig {
  templateUrl: string;
  templateUrl2?: string;
  fields: FieldType[];
  canvasWidth: number;
  canvasHeight: number;
  placeholders?: PlaceholderConfig[];
}

// =================================
// IMAGE COMPONENT
// =================================

function URLImage({ src }: { src: string }) {
  const [image] = useImage(src, "anonymous");
  return image ? <KonvaImageComponent image={image} width={1000} height={700} /> : null;
}

// =================================
// MAIN COMPONENT
// =================================

export function useCertificateGenerator() {
  const { alert } = useAlert();

  const generateTeacherPDF = async (
    teacher: any,
    training: any,
    config: CertificateConfig,
    certNumber?: string,
  ) => {
    try {
      if (!config) {
        alert("Konfigurasi/Template sertifikat belum diatur.", "Info", "info");
        return;
      }

      const pdfDoc = await PDFDocument.create();
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const fieldsList = Array.isArray(config?.fields) ? config.fields : [];

      const replacePlaceholders = (text: string) => {
        if (!text) return "";
        let result = text;
        const placeholders = config?.placeholders || [
          { label: "Nama Lengkap", placeholder: "[nama]", dbField: "nama" },
          { label: "NIP", placeholder: "[nip]", dbField: "nip" },
          {
            label: "Satuan Kerja",
            placeholder: "[sekolah]",
            dbField: "sekolah",
          },
          {
            label: "Judul Pelatihan",
            placeholder: "[title]",
            dbField: "title",
          },
          {
            label: "Peran Dalam Kegiatan",
            placeholder: "[peran]",
            dbField: "peran",
          },
          {
            label: "Nomor Sertifikat",
            placeholder: "[certificate_number]",
            dbField: "certificate_number",
          },
          {
            label: "Tgl Pelaksanaan",
            placeholder: "[date_start]",
            dbField: "date_start",
          },
        ];

        placeholders.forEach((p) => {
          if (!p || !p.placeholder) return;
          const regex = new RegExp(
            p.placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "g",
          );

          if (p.dbField === "certificate_number") {
            result = result.replace(regex, certNumber || "-");
          } else if (p.dbField === "date_start") {
            const val = training?.date_start
              ? new Date(training.date_start).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", 
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "-";
            result = result.replace(regex, val);
          } else if (p.dbField === "peran" || p.dbField === "role" || p.placeholder === "[peran]") {
            const val = teacher?.peran || teacher?.role_in_activity || teacher?.guest_peran || training?.peran || "PESERTA";
            result = result.replace(regex, val.toString().toUpperCase());
          } else {
            // Check teacher first then training
            const val = (teacher && teacher[p.dbField] != null) 
              ? teacher[p.dbField] 
              : ((training && training[p.dbField] != null) ? training[p.dbField] : "-");
            let textToInsert = val.toString();
            if (p.dbField === "peran" || p.placeholder === "[peran]") {
              textToInsert = textToInsert.toUpperCase();
            }
            result = result.replace(regex, textToInsert);
          }
        });
        return result;
      };

      // Helper to embed image safely and with compression (target size 200-300 KB)
      const embedImage = async (url: string) => {
        try {
          const jpegDataUrl = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              const canvas = document.createElement("canvas");
              
              const maxWidth = 1400;
              let width = img.width;
              let height = img.height;
              if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = img.height * ratio;
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return reject("Canvas context error");
              
              // Draw white background in case source image has transparency
              ctx.fillStyle = "#FFFFFF";
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              
              // Compress to JPEG with 0.70 quality
              resolve(canvas.toDataURL("image/jpeg", 0.70));
            };
            img.onerror = () => reject("Image load error");
            img.src = url;
          });
          
          const res = await fetch(jpegDataUrl);
          const buffer = await res.arrayBuffer();
          return await pdfDoc.embedJpg(buffer);
        } catch (err) {
          console.error("Embed error, attempting fallback:", err);
          try {
            const res = await fetch(url);
            const contentType = res.headers.get("content-type");
            const buffer = await res.arrayBuffer();
            const isPng = contentType?.includes("png") || url.toLowerCase().includes(".png") || url.startsWith("data:image/png");
            if (isPng) {
              return await pdfDoc.embedPng(buffer);
            }
            return await pdfDoc.embedJpg(buffer);
          } catch (fallbackErr) {
            console.error("Fallback embed error:", fallbackErr);
            return null;
          }
        }
      };

      // --- PAGE 1 ---
      const page1Fields = fieldsList.filter((f) => (f.page || 1) === 1);
      const page1 = pdfDoc.addPage([
        config?.canvasWidth || 1000,
        config?.canvasHeight || 700,
      ]);
      if (config?.templateUrl) {
        const image = await embedImage(config.templateUrl);
        if (image) {
          page1.drawImage(image, {
            x: 0,
            y: 0,
            width: config?.canvasWidth || 1000,
            height: config?.canvasHeight || 700,
          });
        }
      }

      page1Fields.forEach((field) => {
        const hex = field.color || "#000000";
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const fontToUse =
          field.fontWeight === "bold" ? fontBold : fontRegular;
        const textToDraw = replacePlaceholders(field.text || "");
        const textWidth = fontToUse.widthOfTextAtSize(
          textToDraw,
          field.fontSize || 12,
        );

        let finalX = field.x || 0;
        if (field.align === "center") {
          finalX = (field.x || 0) - textWidth / 2;
        } else if (field.align === "right") {
          finalX = (field.x || 0) - textWidth;
        }

        page1.drawText(textToDraw, {
          x: finalX,
          y: (config?.canvasHeight || 700) - (field.y || 0) - (field.fontSize || 12) * 0.8,
          size: field.fontSize || 12,
          font: fontToUse,
          color: rgb(r, g, b),
        });
      });

      // --- PAGE 2 ---
      const page2Fields = fieldsList.filter((f) => f.page === 2);
      if (config?.templateUrl2 || page2Fields.length > 0) {
        const page2 = pdfDoc.addPage([
          config?.canvasWidth || 1000,
          config?.canvasHeight || 700,
        ]);
        if (config?.templateUrl2) {
          const image = await embedImage(config.templateUrl2);
          if (image) {
            page2.drawImage(image, {
              x: 0,
              y: 0,
              width: config?.canvasWidth || 1000,
              height: config?.canvasHeight || 700,
            });
          }
        }

        page2Fields.forEach((field) => {
          const hex = field.color || "#000000";
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;

          const fontToUse =
            field.fontWeight === "bold" ? fontBold : fontRegular;
          const textToDraw = replacePlaceholders(field.text || "");
          const textWidth = fontToUse.widthOfTextAtSize(
            textToDraw,
            field.fontSize || 12,
          );

          let finalX = field.x || 0;
          if (field.align === "center") {
            finalX = (field.x || 0) - textWidth / 2;
          } else if (field.align === "right") {
            finalX = (field.x || 0) - textWidth;
          }

          page2.drawText(textToDraw, {
            x: finalX,
            y: (config?.canvasHeight || 700) - (field.y || 0) - (field.fontSize || 12) * 0.8,
            size: field.fontSize || 12,
            font: fontToUse,
            color: rgb(r, g, b),
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const namaLengkap =
        teacher?.nama || teacher?.full_name || teacher?.name || "Peserta";
      
      const getExecutionYear = () => {
        if (training?.date_start) {
          const d = new Date(training.date_start);
          if (!isNaN(d.getTime())) return d.getFullYear().toString();
        }
        if (training?.date) {
          const match = training.date.match(/\b(20\d{2})\b/);
          if (match) return match[1];
        }
        return new Date().getFullYear().toString();
      };

      const executionYear = getExecutionYear();
      const fileName = `${namaLengkap}_${training?.title || "Kegiatan"}_${executionYear}.pdf`;

      saveAs(
        new Blob([pdfBytes], { type: "application/pdf" }),
        fileName,
      );
    } catch (err: any) {
      alert("Gagal generate sertifikat: " + err.message, "Error", "error");
    }
  };

  return { generateTeacherPDF };
}

function DraggableField({
  field,
  updateField,
}: {
  key?: string | number;
  field: FieldType;
  updateField: (id: string, updates: Partial<FieldType>) => void;
}) {
  const textRef = useRef<any>(null);

  useEffect(() => {
    if (textRef.current) {
      if (field.align === "center") {
        textRef.current.offsetX(textRef.current.width() / 2);
      } else if (field.align === "right") {
        textRef.current.offsetX(textRef.current.width());
      } else {
        textRef.current.offsetX(0);
      }
    }
  }, [field.text, field.fontSize, field.fontWeight, field.align]);

  return (
    <TextComponent
      ref={textRef}
      text={field.text}
      x={field.x}
      y={field.y}
      fontSize={field.fontSize}
      fontStyle={field.fontWeight === "bold" ? "bold" : "normal"}
      fontFamily="Helvetica"
      draggable
      fill={field.color}
      onDragMove={(e) => {
        const node = e.target;
        updateField(field.id, { x: node.x(), y: node.y() });
      }}
      onDragStart={() => {
        document.body.style.cursor = "grabbing";
      }}
      onDragEnd={(e) => {
        const node = e.target;
        updateField(field.id, { x: node.x(), y: node.y() });
        document.body.style.cursor = "grab";
      }}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "grab";
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "default";
      }}
    />
  );
}

export async function migrateCertificateConfigToTable(key: string, configObj: any) {
  if (!supabase || !configObj) return;

  const rawKey = (key === "default" || !key) ? null : key;
  let activeKey: string | null = null;

  if (rawKey) {
    try {
      const { data: tr } = await supabase
        .from("trainings")
        .select("id")
        .eq("id", rawKey)
        .maybeSingle();

      if (tr?.id) {
        activeKey = tr.id;
      } else {
        // Key is not in trainings table (e.g., event ID or custom activity ID).
        // Skip inserting into training_certificates to prevent foreign key violation.
        return;
      }
    } catch (e) {
      return;
    }
  }

  const jsonString = JSON.stringify(configObj);

  try {
    // 1. Search for existing template config row for this training_id
    const query = supabase.from("training_certificates").select("*");
    if (!activeKey) {
      query.is("training_id", null);
    } else {
      query.eq("training_id", activeKey);
    }

    const { data: dbRows, error: selectErr } = await query;
    if (selectErr) {
      console.warn("Notice checking training_certificates table:", selectErr);
    }

    const existingRow = dbRows?.find((row: any) => 
      row.certificate_number === "TEMPLATE_CONFIG" || 
      (row.certificate_url && row.certificate_url.startsWith("{") && (row.certificate_url.includes("templateUrl") || row.certificate_url.includes("fields")))
    );

    const fullPayload: any = {
      training_id: activeKey,
      certificate_number: "TEMPLATE_CONFIG",
      certificate_url: jsonString,
      certificate_config: configObj,
      updated_at: new Date().toISOString()
    };

    if (existingRow?.id) {
      const { error: updateErr } = await supabase
        .from("training_certificates")
        .update(fullPayload)
        .eq("id", existingRow.id);
      
      if (updateErr) {
        const fallbackPayload = {
          training_id: activeKey,
          certificate_number: "TEMPLATE_CONFIG",
          certificate_url: jsonString,
          updated_at: new Date().toISOString()
        };
        await supabase
          .from("training_certificates")
          .update(fallbackPayload)
          .eq("id", existingRow.id);
      }
    } else {
      const { error: insertErr } = await supabase
        .from("training_certificates")
        .insert([fullPayload]);
      
      if (insertErr) {
        const fallbackPayload = {
          training_id: activeKey,
          certificate_number: "TEMPLATE_CONFIG",
          certificate_url: jsonString,
          updated_at: new Date().toISOString()
        };
        await supabase
          .from("training_certificates")
          .insert([fallbackPayload]);
      }
    }
  } catch (err) {
    console.warn("Notice updating training_certificates template config:", err);
  }
}

export async function fetchCertificateConfigsMap(): Promise<Record<string, any>> {
  const configsMap: Record<string, any> = {};

  if (supabase) {
    // 1. Fetch from training_certificates table
    try {
      const { data: dbRows } = await supabase
        .from("training_certificates")
        .select("*");

      if (dbRows && dbRows.length > 0) {
        dbRows.forEach((row: any) => {
          let parsed: any = null;
          const isTemplate = row.certificate_number === "TEMPLATE_CONFIG" || 
            (row.certificate_config && typeof row.certificate_config === "object") ||
            (row.certificate_url && row.certificate_url.startsWith("{") && (row.certificate_url.includes("templateUrl") || row.certificate_url.includes("fields")));
            
          if (isTemplate) {
            if (row.certificate_config && typeof row.certificate_config === "object") {
              parsed = row.certificate_config;
            } else if (row.certificate_url && row.certificate_url.startsWith("{")) {
              try {
                parsed = JSON.parse(row.certificate_url);
              } catch (e) {}
            }
            if (parsed && typeof parsed === "object") {
              if (!Array.isArray(parsed.fields)) {
                parsed.fields = [];
              }
              const mappedKey = row.training_id || "default";
              configsMap[mappedKey] = parsed;
            }
          }
        });
      }
    } catch (e) {
      console.warn("Failed fetching configs from training_certificates table:", e);
    }

    // 2. Fallback & migrate from site_settings
    try {
      const { data: sData } = await supabase
        .from("site_settings")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      const siteConfigs = sData?.content?.certificate_configs || {};
      Object.keys(siteConfigs).forEach((k) => {
        if (!configsMap[k] && siteConfigs[k]) {
          const cfg = { ...siteConfigs[k] };
          if (!Array.isArray(cfg.fields)) cfg.fields = [];
          configsMap[k] = cfg;
          migrateCertificateConfigToTable(k, cfg);
        }
      });
      if (sData?.content?.certificate_config && !configsMap["default"]) {
        const defaultConfig = { ...sData.content.certificate_config };
        if (!Array.isArray(defaultConfig.fields)) defaultConfig.fields = [];
        configsMap["default"] = defaultConfig;
        migrateCertificateConfigToTable("default", defaultConfig);
      }
    } catch (e) {}
  }

  return configsMap;
}

export default function AdminCertificateEditor({ trainingId }: { trainingId?: string }) {
  const { alert } = useAlert();
  const { generateTeacherPDF } = useCertificateGenerator();
  const stageRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState<number>(1);
  const [isCustomConfig, setIsCustomConfig] = useState(false);

  // TEMPLATE IMAGES
  const [templateUrl, setTemplateUrl] = useState("");
  const [templateUrl2, setTemplateUrl2] = useState("");

  // CANVAS SIZE (Landscape A4ish aspect)
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 700;

  // FIELDS
  const [fields, setFields] = useState<FieldType[]>([
    {
      id: "nama",
      field_name: "Nama Peserta",
      text: "[nama]",
      x: 500,
      y: 350,
      fontSize: 40,
      fontWeight: "bold",
      color: "#000000",
      page: 1,
    },
  ]);

  const [availablePlaceholders, setAvailablePlaceholders] = useState<
    PlaceholderConfig[]
  >([
    { label: "Nama Lengkap", placeholder: "[nama]", dbField: "nama" },
    { label: "NIP", placeholder: "[nip]", dbField: "nip" },
    { label: "Peran Dalam Kegiatan", placeholder: "[peran]", dbField: "peran" },
    { label: "Pangkat/Gol", placeholder: "[pangkat]", dbField: "pangkat" },
    { label: "Satuan Kerja", placeholder: "[sekolah]", dbField: "sekolah" },
    { label: "Jabatan", placeholder: "[jabatan]", dbField: "jabatan" },
    {
      label: "Status Pegawai",
      placeholder: "[kepegawaian]",
      dbField: "kepegawaian",
    },
    { label: "Judul Pelatihan", placeholder: "[title]", dbField: "title" },
    {
      label: "Tgl Pelaksanaan",
      placeholder: "[date_start]",
      dbField: "date_start",
    },
    {
      label: "Nomor Sertifikat",
      placeholder: "[certificate_number]",
      dbField: "certificate_number",
    },
  ]);
  const [showAddPlaceholder, setShowAddPlaceholder] = useState(false);
  const [newPH, setNewPH] = useState({
    label: "",
    placeholder: "",
    dbField: "",
  });
  const [downloadEnabled, setDownloadEnabled] = useState<boolean>(true);

  // PARTICIPANT ROLE MANAGEMENT
  const [participantsList, setParticipantsList] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<any | null>(null);
  const [newParticipantRole, setNewParticipantRole] = useState("PESERTA");
  const [customParticipantRole, setCustomParticipantRole] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const [showSqlNotice, setShowSqlNotice] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // =================================
  // LOAD CONFIG FROM DB
  // =================================

  useEffect(() => {
    loadConfig();
    loadParticipants();
  }, [trainingId]);

  async function loadParticipants() {
    if (!supabase) return;
    setLoadingParticipants(true);
    try {
      let query = supabase.from("training_participants").select("*").order("id", { ascending: false });
      if (trainingId) {
        query = query.or(`training_id.eq.${trainingId},event_id.eq.${trainingId}`);
      }
      const { data: parts, error } = await query;
      if (error) throw error;

      const [profilesRes, teachersRes] = await Promise.all([
        supabase.from("user_profiles").select("*"),
        supabase.from("teachers").select("*")
      ]);

      const allProfiles = profilesRes.data || [];
      const allTeachers = teachersRes.data || [];
      
      let usersMap: Record<string, any> = {};
      allProfiles.forEach(p => {
        usersMap[p.id] = p;
      });
      allTeachers.forEach(t => {
        if (!usersMap[t.id]) {
          usersMap[t.id] = t;
        } else {
          usersMap[t.id] = { ...usersMap[t.id], ...t };
        }
      });

      // Filter strictly for participants who have status "attended" or "hadir" for this specific training
      const attendedParts = (parts || []).filter(p => {
        const s = (p.status || "").toLowerCase();
        return s === "attended" || s === "hadir" || s === "sukses" || s === "hadir_absen";
      });

      const formatted = attendedParts.map(p => {
        const u = p.user_id ? usersMap[p.user_id] : null;
        let localRole = "";
        try {
          localRole = localStorage.getItem(`override_peran_${p.id}`) || "";
        } catch (e) {}
        const currentPeran = (localRole || p.peran || p.guest_peran || p.role_in_activity || "PESERTA").toString().toUpperCase();
        return {
          ...p,
          participant_name: p.guest_name || u?.full_name || u?.nama || u?.username || "Peserta",
          participant_nip: p.guest_nip || u?.nip || "-",
          participant_school: p.guest_institution || u?.school_name || u?.sekolah || "-",
          participant_position: p.guest_position || u?.position || u?.jabatan || "-",
          current_peran: currentPeran,
          peran: currentPeran
        };
      });

      setParticipantsList(formatted);
    } catch (err) {
      console.error("Error loading participants:", err);
    } finally {
      setLoadingParticipants(false);
    }
  }

  async function handleUpdateRole() {
    if (!editingParticipant || !supabase) return;
    setSavingRole(true);
    try {
      const rawRole = newParticipantRole === "LAINNYA" ? (customParticipantRole.trim() || "PESERTA") : newParticipantRole;
      const finalRole = rawRole.toUpperCase();

      // Always set local override so certificates download with the new role immediately
      try {
        localStorage.setItem(`override_peran_${editingParticipant.id}`, finalRole);
      } catch (e) {}

      let isColumnMissing = false;
      let dbError: any = null;

      const { error: partErr } = await supabase
        .from("training_participants")
        .update({
          peran: finalRole,
        })
        .eq("id", editingParticipant.id);

      if (partErr) {
        if (partErr.message?.includes("column") || partErr.code === "PGRST204") {
          isColumnMissing = true;
        } else {
          dbError = partErr;
        }
      }

      // Update training_certificates stored json if exists
      const pId = editingParticipant.user_id || editingParticipant.guest_account_id;
      if (pId) {
        try {
          const { data: certs } = await supabase
            .from("training_certificates")
            .select("*")
            .or(`user_id.eq.${pId},guest_account_id.eq.${pId}`);

          if (certs && certs.length > 0) {
            for (const c of certs) {
              try {
                let certObj = typeof c.certificate_url === "string" && c.certificate_url.startsWith("{") 
                  ? JSON.parse(c.certificate_url) 
                  : {};
                certObj.peran = finalRole;
                await supabase
                  .from("training_certificates")
                  .update({ certificate_url: JSON.stringify(certObj) })
                  .eq("id", c.id);
              } catch (e) {
                console.warn("Notice updating certificate JSON:", e);
              }
            }
          }
        } catch (e) {}
      }

      // Update local state participantsList immediately
      setParticipantsList(prev => prev.map(item => {
        if (item.id === editingParticipant.id) {
          return {
            ...item,
            peran: finalRole,
            current_peran: finalRole
          };
        }
        return item;
      }));

      setEditingParticipant(null);
      setCustomParticipantRole("");

      if (dbError) {
        throw dbError;
      }

      if (isColumnMissing) {
        setShowSqlNotice(true);
        await alert(
          `Peran ${editingParticipant.participant_name} berhasil diperbarui di sistem menjadi "${finalRole}"! Sertifikat dapat langsung diunduh dengan versi terbaru.\n\nCatatan Database: Kolom 'peran' belum ada di database Supabase Anda. Silakan salin & jalankan SQL yang kami tampilkan di bawah di Supabase SQL Editor.`,
          "Peran Diperbarui",
          "info"
        );
      } else {
        await alert(`Peran ${editingParticipant.participant_name} berhasil diperbarui menjadi ${finalRole}!`, "Sukses", "success");
      }
    } catch (err: any) {
      await alert("Gagal memperbarui peran: " + err.message, "Gagal", "error");
    } finally {
      setSavingRole(false);
    }
  }

  async function handleDownloadUpdatedCertificate(p: any) {
    try {
      const actId = p.training_id || p.event_id || trainingId;
      let actObj: any = null;
      if (actId) {
        const { data: tr } = await supabase.from("trainings").select("*").eq("id", actId).maybeSingle();
        if (tr) actObj = tr;
        else {
          const { data: ev } = await supabase.from("events").select("*").eq("id", actId).maybeSingle();
          if (ev) actObj = ev;
        }
      }
      if (!actObj) {
        actObj = { title: "Kegiatan Pelatihan / Agenda", date_start: new Date().toISOString() };
      }

      const allConfigs = await fetchCertificateConfigsMap();
      const config = (actId ? allConfigs[actId] : null) || allConfigs["default"] || {
        templateUrl,
        templateUrl2,
        fields,
        placeholders: availablePlaceholders
      };

      const currentPeran = (p.peran || p.guest_peran || p.current_peran || "PESERTA").toString().toUpperCase();
      const teacherPayload = {
        nama: p.participant_name,
        nip: p.participant_nip,
        sekolah: p.participant_school,
        jabatan: p.participant_position,
        peran: currentPeran,
        guest_peran: currentPeran
      };

      const certNumber = `${Math.floor(1000 + Math.random() * 9000)}/CERT-KKG/${new Date().getFullYear()}`;

      await generateTeacherPDF(teacherPayload, actObj, config, certNumber);
    } catch (err: any) {
      await alert("Gagal mengunduh sertifikat: " + err.message, "Gagal", "error");
    }
  }

  async function loadConfig() {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const allConfigs = await fetchCertificateConfigsMap();
      const activeKey = trainingId || "default";
      const hasCustom = trainingId ? !!allConfigs[trainingId] : false;
      setIsCustomConfig(hasCustom);

      let config = trainingId ? allConfigs[trainingId] : null;

      // Fallback 1: load default key from certificate_configs
      if (!config) {
        config = allConfigs["default"];
      }

      if (config) {
        if (config.templateUrl) setTemplateUrl(config.templateUrl);
        if (config.templateUrl2) setTemplateUrl2(config.templateUrl2);
        if (config.fields)
          setFields(config.fields.map((f: any) => ({ ...f, page: f.page || 1 })));
        if (config.placeholders) setAvailablePlaceholders(config.placeholders);
        setDownloadEnabled(config.downloadEnabled !== false);
      } else {
        // Reset to default
        setTemplateUrl("");
        setTemplateUrl2("");
        setDownloadEnabled(true);
        setFields([
          {
            id: "nama",
            field_name: "Nama Peserta",
            text: "[nama]",
            x: 500,
            y: 350,
            fontSize: 40,
            fontWeight: "bold",
            color: "#000000",
            page: 1,
            align: "center",
          },
        ]);
        setAvailablePlaceholders([
          { label: "Nama Lengkap", placeholder: "[nama]", dbField: "nama" },
          { label: "NIP", placeholder: "[nip]", dbField: "nip" },
          { label: "Peran Dalam Kegiatan", placeholder: "[peran]", dbField: "peran" },
          { label: "Pangkat/Gol", placeholder: "[pangkat]", dbField: "pangkat" },
          { label: "Satuan Kerja", placeholder: "[sekolah]", dbField: "sekolah" },
          { label: "Jabatan", placeholder: "[jabatan]", dbField: "jabatan" },
          {
            label: "Status Pegawai",
            placeholder: "[kepegawaian]",
            dbField: "kepegawaian",
          },
          { label: "Judul Pelatihan", placeholder: "[title]", dbField: "title" },
          {
            label: "Tgl Pelaksanaan",
            placeholder: "[date_start]",
            dbField: "date_start",
          },
          {
            label: "Nomor Sertifikat",
            placeholder: "[certificate_number]",
            dbField: "certificate_number",
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading certificate config:", err);
    } finally {
      setLoading(false);
    }
  }

  // =================================
  // UPDATE FIELD
  // =================================

  function updateField(id: string, updates: Partial<FieldType>) {
    setFields((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  // =================================
  // SAVE TO DB
  // =================================

  async function saveConfig() {
    if (!supabase) {
      alert(
        "Supabase tidak terhubung. Tidak dapat menyimpan.",
        "Error",
        "error",
      );
      return;
    }
    setSaving(true);
    try {
      const activeKey = trainingId || "default";
      const configPayload = {
        templateUrl,
        templateUrl2,
        fields,
        availablePlaceholders,
        canvasWidth: CANVAS_WIDTH,
        canvasHeight: CANVAS_HEIGHT,
        downloadEnabled: downloadEnabled,
      };

      // 1. Save certificate config to site_settings content as guaranteed persistent store
      const { data: siteData } = await supabase
        .from("site_settings")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      const newContent = { ...(siteData?.content || {}) };
      if (!newContent.certificate_configs) {
        newContent.certificate_configs = {};
      }
      newContent.certificate_configs[activeKey] = configPayload;
      if (activeKey === "default") {
        newContent.certificate_config = configPayload;
      }

      const { error: siteErr } = await supabase.from("site_settings").upsert({
        id: 1,
        content: newContent,
        updated_at: new Date().toISOString(),
      });

      if (siteErr) {
        throw new Error("Gagal menyimpan ke site_settings: " + (siteErr.message || JSON.stringify(siteErr)));
      }

      // 2. Sync to training_certificates SQL table if key is a valid training
      try {
        await migrateCertificateConfigToTable(activeKey, configPayload);
      } catch (migErr) {
        console.warn("Notice syncing to training_certificates table:", migErr);
      }

      // Auto generate certificates for participants who have 'attended' this activity
      try {
        await ensureCertificatesExist();
      } catch (err) {
        console.error("Auto generate certificates on template save failed:", err);
      }

      if (trainingId) {
        setIsCustomConfig(true);
      }

      await alert(
        "Konfigurasi sertifikat berhasil disimpan",
        "Sukses",
        "success",
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menyimpan konfigurasi sertifikat", "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  }

  // =================================
  // GENERATE PREVIEW PDF
  // =================================

  async function generatePDF() {
    try {
      const pdfDoc = await PDFDocument.create();
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Helper to embed image safely and with compression (target size 200-300 KB)
      const embedImage = async (url: string) => {
        try {
          const jpegDataUrl = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              const canvas = document.createElement("canvas");
              
              const maxWidth = 1400;
              let width = img.width;
              let height = img.height;
              if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = img.height * ratio;
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return reject("Canvas context error");
              
              // Draw white background in case source image has transparency
              ctx.fillStyle = "#FFFFFF";
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              
              // Compress to JPEG with 0.70 quality
              resolve(canvas.toDataURL("image/jpeg", 0.70));
            };
            img.onerror = () => reject("Image load error");
            img.src = url;
          });
          
          const res = await fetch(jpegDataUrl);
          const buffer = await res.arrayBuffer();
          return await pdfDoc.embedJpg(buffer);
        } catch (err) {
          console.error("Embed error, attempting fallback:", err);
          try {
            const res = await fetch(url);
            const contentType = res.headers.get("content-type");
            const buffer = await res.arrayBuffer();
            const isPng = contentType?.includes("png") || url.toLowerCase().includes(".png") || url.startsWith("data:image/png");
            if (isPng) {
              return await pdfDoc.embedPng(buffer);
            }
            return await pdfDoc.embedJpg(buffer);
          } catch (fallbackErr) {
            console.error("Fallback embed error:", fallbackErr);
            return null;
          }
        }
      };

      // --- PAGE 1 ---
      const page1 = pdfDoc.addPage([CANVAS_WIDTH, CANVAS_HEIGHT]);
      if (templateUrl) {
        const image = await embedImage(templateUrl);
        if (image) {
          page1.drawImage(image, {
            x: 0,
            y: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
          });
        } else {
          alert("Gagal memuat background halaman 1. Pastikan file valid.");
        }
      }

      fields
        .filter((f) => (f.page || 1) === 1)
        .forEach((field) => {
          const hex = field.color || "#000000";
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;

          const fontToUse =
            field.fontWeight === "bold" ? fontBold : fontRegular;
          const textToDraw = field.text;
          const textWidth = fontToUse.widthOfTextAtSize(
            textToDraw,
            field.fontSize,
          );

          let finalX = field.x;
          if (field.align === "center") {
            finalX = field.x - textWidth / 2;
          } else if (field.align === "right") {
            finalX = field.x - textWidth;
          }

          page1.drawText(textToDraw, {
            x: finalX,
            y: CANVAS_HEIGHT - field.y - field.fontSize * 0.8,
            size: field.fontSize,
            font: fontToUse,
            color: rgb(r, g, b),
          });
        });

      // --- PAGE 2 ---
      const page2 = pdfDoc.addPage([CANVAS_WIDTH, CANVAS_HEIGHT]);
      if (templateUrl2) {
        const image = await embedImage(templateUrl2);
        if (image) {
          page2.drawImage(image, {
            x: 0,
            y: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
          });
        } else {
          alert("Gagal memuat background halaman 2. Pastikan file valid.");
        }
      }

      fields
        .filter((f) => f.page === 2)
        .forEach((field) => {
          const hex = field.color || "#000000";
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;

          const fontToUse =
            field.fontWeight === "bold" ? fontBold : fontRegular;
          const textToDraw = field.text;
          const textWidth = fontToUse.widthOfTextAtSize(
            textToDraw,
            field.fontSize,
          );

          let finalX = field.x;
          if (field.align === "center") {
            finalX = field.x - textWidth / 2;
          } else if (field.align === "right") {
            finalX = field.x - textWidth;
          }

          page2.drawText(textToDraw, {
            x: finalX,
            y: CANVAS_HEIGHT - field.y - field.fontSize * 0.8,
            size: field.fontSize,
            font: fontToUse,
            color: rgb(r, g, b),
          });
        });

      const pdfBytes = await pdfDoc.save();
      saveAs(
        new Blob([pdfBytes], { type: "application/pdf" }),
        "preview-sertifikat.pdf",
      );
    } catch (err: any) {
      alert("Gagal generate PDF: " + err.message, "Error", "error");
    }
  }

  const addField = () => {
    const id = "field_" + Date.now();
    setFields([
      ...fields,
      {
        id,
        field_name: "Field Baru",
        text: "[Isi Field]",
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        fontSize: 20,
        fontWeight: "normal",
        color: "#000000",
        page: activePage,
        align: "center",
      },
    ]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-main-blue animate-spin" />
          <p className="text-gray-500 font-bold">Memuat Editor Sertifikat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Editor Section */}
      <div className="flex-1 space-y-6 min-w-0 pb-4">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">
                Desain Template Sertifikat
              </h2>
              <p className="text-xs text-gray-500">
                Atur tata letak teks pada sertifikat pelatihan.
              </p>
              {trainingId && (
                <div className="mt-1.5 flex items-center">
                  {isCustomConfig ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Desain Khas Kegiatan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-500 border border-amber-200" title="Lakukan modifikasi lalu klik Simpan Layout untuk menyimpan desain unik untuk kegiatan ini">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Menggunakan Desain Default
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-main-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-main-blue/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Menyimpan..." : "Simpan Layout"}
            </button>
            <button
              onClick={generatePDF}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-leaf-green text-white rounded-xl font-bold text-sm shadow-lg shadow-leaf-green/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Download className="w-4 h-4" />
              Preview PDF
            </button>
          </div>
        </div>

        {/* Page Switcher */}
        <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm self-start">
          <button
            onClick={() => setActivePage(1)}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activePage === 1 ? "bg-main-blue text-white shadow-lg shadow-main-blue/20" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Halaman 1 (Depan)
          </button>
          <button
            onClick={() => setActivePage(2)}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activePage === 2 ? "bg-main-blue text-white shadow-lg shadow-main-blue/20" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Halaman 2 (Belakang)
          </button>
        </div>

        {/* Canvas Area */}
        <div className="bg-gray-100 p-4 rounded-[2rem] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 min-h-[500px]">
          <div className="w-full flex items-center justify-between mb-4 px-4">
            <div className="flex items-center gap-2 text-main-blue">
              <Move className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Editor Visual
              </span>
            </div>
            <p className="text-[10px] text-gray-500 italic">
              * Klik & Geser teks untuk mengatur posisi secara presisi.
            </p>
          </div>

          <div
            className="bg-white shadow-2xl relative overflow-auto max-w-full modern-scrollbar"
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          >
            <StageComponent width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={stageRef}>
              <LayerComponent listening={true}>
                {/* TEMPLATE */}
                {activePage === 1 ? (
                  templateUrl ? (
                    <URLImage src={templateUrl} />
                  ) : (
                    <KonvaImageComponent
                      image={undefined as any}
                      width={CANVAS_WIDTH}
                      height={CANVAS_HEIGHT}
                      fill="#f3f4f6"
                    />
                  )
                ) : templateUrl2 ? (
                  <URLImage src={templateUrl2} />
                ) : (
                  <KonvaImageComponent
                    image={undefined as any}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    fill="#f3f4f6"
                  />
                )}

                {/* DRAG TEXT */}
                {fields
                  .filter((f) => (f.page || 1) === activePage)
                  .map((field) => (
                    <DraggableField
                      key={field.id}
                      field={field}
                      updateField={updateField}
                    />
                  ))}
              </LayerComponent>
            </StageComponent>
            {((activePage === 1 && !templateUrl) ||
              (activePage === 2 && !templateUrl2)) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                <Settings className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">
                  Harap upload atau pilih file background sertifikat untuk
                  Halaman {activePage} melalui panel kontrol di samping.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* KELOLA PERAN & SERTIFIKAT PESERTA KEGIATAN */}
        <div className="w-full bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h3 className="text-xl font-bold font-heading text-soft-black flex items-center gap-2">
                <Users className="w-6 h-6 text-main-blue" />
                Kelola Peran & Sertifikat Peserta Kegiatan
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Admin dapat mengubah peran peserta (Peserta, Narasumber, Panitia, Pemateri, dll) untuk kegiatan sedang berjalan maupun selesai. Sertifikat yang diunduh otomatis menggunakan peran versi terbaru.
              </p>
            </div>
            <button
              onClick={loadParticipants}
              disabled={loadingParticipants}
              className="px-4 py-2.5 bg-main-blue/10 text-main-blue hover:bg-main-blue hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loadingParticipants ? "animate-spin" : ""}`} />
              Refresh Data
            </button>
          </div>



          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, NIP, atau sekolah..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-main-blue transition-all"
              />
            </div>
            <span className="text-xs font-bold text-gray-400">
              Total: {participantsList.length} Peserta Registered/Attended
            </span>
          </div>

          {/* Participants Table / Cards */}
          {loadingParticipants ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-main-blue animate-spin" />
              <p className="text-xs font-bold text-gray-400">Memuat Daftar Peserta...</p>
            </div>
          ) : participantsList.length === 0 ? (
            <div className="py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
              <UserCheck className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-400">Belum ada peserta terdaftar untuk kegiatan ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto modern-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Peserta / NIP</th>
                    <th className="py-3 px-4">Instansi / Sekolah</th>
                    <th className="py-3 px-4">Status Absensi</th>
                    <th className="py-3 px-4">Peran Saat Ini</th>
                    <th className="py-3 px-4 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {participantsList
                    .filter((p) => {
                      if (!participantSearch.trim()) return true;
                      const q = participantSearch.toLowerCase();
                      return (
                        (p.participant_name || "").toLowerCase().includes(q) ||
                        (p.participant_nip || "").toLowerCase().includes(q) ||
                        (p.participant_school || "").toLowerCase().includes(q)
                      );
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/30 transition-all">
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-800">{p.participant_name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">NIP: {p.participant_nip}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-medium">
                          {p.participant_school}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === "attended" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            {p.status === "attended" ? "Hadir" : "Terdaftar"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm shadow-amber-500/20">
                            {p.current_peran}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingParticipant(p);
                                const knownRoles = ["PESERTA", "NARASUMBER", "PANITIA", "MODERATOR", "PEMATERI", "FASILITATOR"];
                                if (knownRoles.includes(p.current_peran)) {
                                  setNewParticipantRole(p.current_peran);
                                  setCustomParticipantRole("");
                                } else {
                                  setNewParticipantRole("LAINNYA");
                                  setCustomParticipantRole(p.current_peran);
                                }
                              }}
                              className="px-3 py-1.5 bg-main-blue/10 text-main-blue hover:bg-main-blue hover:text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Ubah Peran
                            </button>
                            <button
                              onClick={() => handleDownloadUpdatedCertificate(p)}
                              className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20"
                              title="Unduh sertifikat peserta versi terbaru dengan peran yang sudah diperbarui"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Unduh Sertifikat Terbaru
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal Ubah Peran Peserta */}
          <AnimatePresence>
            {editingParticipant && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setEditingParticipant(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl space-y-6 z-10"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="text-lg font-bold font-heading text-soft-black">
                        Atur Peran Peserta (Admin)
                      </h4>
                      <p className="text-xs text-gray-500">
                        Ubah peran peserta pada sertifikat kegiatan ini.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingParticipant(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-1">
                      <p className="font-bold text-gray-800">{editingParticipant.participant_name}</p>
                      <p className="text-gray-500 font-mono">NIP: {editingParticipant.participant_nip}</p>
                      <p className="text-gray-500">{editingParticipant.participant_school}</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                        Pilih Peran Baru dalam Kegiatan:
                      </label>
                      <select
                        value={newParticipantRole}
                        onChange={(e) => setNewParticipantRole(e.target.value)}
                        className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs font-bold focus:border-main-blue outline-none"
                      >
                        <option value="PESERTA">PESERTA</option>
                        <option value="NARASUMBER">NARASUMBER</option>
                        <option value="PANITIA">PANITIA</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="PEMATERI">PEMATERI</option>
                        <option value="FASILITATOR">FASILITATOR</option>
                        <option value="LAINNYA">Lainnya (Ketik Manual)...</option>
                      </select>
                    </div>

                    {newParticipantRole === "LAINNYA" && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                          Ketik Peran Khusus:
                        </label>
                        <input
                          type="text"
                          value={customParticipantRole}
                          onChange={(e) => setCustomParticipantRole(e.target.value.toUpperCase())}
                          placeholder="Contoh: PANITIA PELAKSANA"
                          className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs font-bold uppercase focus:border-main-blue outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setEditingParticipant(null)}
                      className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleUpdateRole}
                      disabled={savingRole}
                      className="flex-1 py-3 bg-main-blue text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-main-blue/20 flex items-center justify-center gap-2"
                    >
                      {savingRole ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingRole ? "Menyimpan..." : "Simpan Peran Terbaru"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Sidebar */}
      <div className="w-full lg:w-[400px] space-y-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg space-y-8 h-full">
          {/* Status Unduh Sertifikat Khas Kegiatan */}
          <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-gray-700 text-xs">Status Tombol Unduh</h3>
                <p className="text-[10px] text-gray-400">Atur akses tombol download sertifikat untuk kegiatan ini</p>
              </div>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <input
                type="checkbox"
                className="w-4 h-4 accent-amber-500 rounded"
                checked={downloadEnabled}
                onChange={(e) => setDownloadEnabled(e.target.checked)}
              />
              <span className="text-xs font-bold text-gray-700">Aktifkan Sertifikat</span>
            </label>
          </div>

          {/* Template Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-main-blue" />
              <h3 className="font-bold text-gray-700">Template Background</h3>
            </div>

            <div className="space-y-4">
              <ImageUpload
                label="Halaman Depan (PNG/JPG)"
                value={templateUrl}
                onChange={(val) => setTemplateUrl(val)}
                maxWidth={1200}
                maxHeight={1200}
                quality={0.6}
              />

              <ImageUpload
                label="Halaman Belakang (PNG/JPG)"
                value={templateUrl2}
                onChange={(val) => setTemplateUrl2(val)}
                maxWidth={1200}
                maxHeight={1200}
                quality={0.6}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-main-blue" />
                <h3 className="font-bold text-gray-700">Elemen Teks</h3>
              </div>
              <button
                onClick={addField}
                className="p-2 bg-main-blue/10 text-main-blue rounded-xl hover:bg-main-blue hover:text-white transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto modern-scrollbar pr-2">
              {fields
                .filter((f) => (f.page || 1) === activePage)
                .map((field) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={field.id}
                    className="p-5 bg-gray-50 rounded-2xl border border-gray-200 relative group"
                  >
                    <button
                      onClick={() => removeField(field.id)}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                          Nama Field / Label
                        </label>
                        <input
                          type="text"
                          value={field.field_name}
                          onChange={(e) =>
                            updateField(field.id, {
                              field_name: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:border-main-blue outline-none"
                          placeholder="Contoh: Nama Guru"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                          Teks Preview
                        </label>
                        <textarea
                          value={field.text}
                          onChange={(e) =>
                            updateField(field.id, { text: e.target.value })
                          }
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:border-main-blue outline-none"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                            Ukuran Font
                          </label>
                          <input
                            type="number"
                            value={field.fontSize}
                            onChange={(e) =>
                              updateField(field.id, {
                                fontSize: Number(e.target.value),
                              })
                            }
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:border-main-blue outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                            Halaman
                          </label>
                          <select
                            value={field.page || 1}
                            onChange={(e) =>
                              updateField(field.id, {
                                page: Number(e.target.value),
                              })
                            }
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:border-main-blue outline-none"
                          >
                            <option value={1}>Halaman 1</option>
                            <option value={2}>Halaman 2</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                            Warna Teks
                          </label>
                          <input
                            type="color"
                            value={field.color}
                            onChange={(e) =>
                              updateField(field.id, { color: e.target.value })
                            }
                            className="w-full h-9 bg-white border border-gray-200 px-1 py-1 rounded-xl cursor-pointer"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                              Gaya
                            </label>
                            <button
                              onClick={() =>
                                updateField(field.id, {
                                  fontWeight:
                                    field.fontWeight === "bold"
                                      ? "normal"
                                      : "bold",
                                })
                              }
                              className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all ${field.fontWeight === "bold" ? "bg-main-blue text-white border-main-blue" : "bg-white text-gray-500 border-gray-200"}`}
                            >
                              Bold
                            </button>
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                              Align
                            </label>
                            <select
                              value={field.align || "left"}
                              onChange={(e) =>
                                updateField(field.id, {
                                  align: e.target.value as
                                    | "left"
                                    | "center"
                                    | "right",
                                })
                              }
                              className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-main-blue outline-none"
                            >
                              <option value="left">Kiri</option>
                              <option value="center">Tengah</option>
                              <option value="right">Kanan</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                            Posisi X
                          </label>
                          <input
                            type="number"
                            value={Math.round(field.x)}
                            onChange={(e) =>
                              updateField(field.id, {
                                x: Number(e.target.value),
                              })
                            }
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:border-main-blue outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                            Posisi Y
                          </label>
                          <input
                            type="number"
                            value={Math.round(field.y)}
                            onChange={(e) =>
                              updateField(field.id, {
                                y: Number(e.target.value),
                              })
                            }
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:border-main-blue outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-main-blue/10 rounded-xl flex items-center justify-center text-main-blue">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-main-blue uppercase tracking-widest">
                    Sinkronisasi Database
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Klik untuk menambah element teks otomatis.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddPlaceholder(!showAddPlaceholder)}
                className="p-1.5 bg-main-blue/10 text-main-blue rounded-lg hover:bg-main-blue hover:text-white transition-all shadow-sm"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {showAddPlaceholder && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-white rounded-2xl border border-main-blue/20 shadow-sm space-y-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-bold text-gray-400 uppercase mb-1 block">
                      Label
                    </label>
                    <input
                      placeholder="Nama Lengkap"
                      className="w-full border border-gray-100 p-2 rounded-lg text-[10px] outline-none focus:border-main-blue"
                      value={newPH.label}
                      onChange={(e) =>
                        setNewPH({ ...newPH, label: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-gray-400 uppercase mb-1 block">
                      Placeholder
                    </label>
                    <input
                      placeholder="[nama]"
                      className="w-full border border-gray-100 p-2 rounded-lg text-[10px] outline-none focus:border-main-blue"
                      value={newPH.placeholder}
                      onChange={(e) =>
                        setNewPH({ ...newPH, placeholder: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[8px] font-bold text-gray-400 uppercase mb-1 block">
                    Field DB (Key)
                  </label>
                  <input
                    placeholder="full_name"
                    className="w-full border border-gray-100 p-2 rounded-lg text-[10px] outline-none focus:border-main-blue"
                    value={newPH.dbField}
                    onChange={(e) =>
                      setNewPH({ ...newPH, dbField: e.target.value })
                    }
                  />
                </div>
                <button
                  onClick={() => {
                    if (!newPH.label || !newPH.placeholder || !newPH.dbField)
                      return;
                    setAvailablePlaceholders([...availablePlaceholders, newPH]);
                    setNewPH({ label: "", placeholder: "", dbField: "" });
                    setShowAddPlaceholder(false);
                  }}
                  className="w-full py-2 bg-main-blue text-white rounded-xl text-[10px] font-bold"
                >
                  Tambah Placeholder
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {availablePlaceholders.map((p, idx) => (
                <div key={idx} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      const newField: FieldType = {
                        id: Math.random().toString(36).substr(2, 9),
                        field_name: p.label,
                        text: p.placeholder,
                        x: CANVAS_WIDTH / 2,
                        y: CANVAS_HEIGHT / 2,
                        fontSize: 20,
                        fontWeight: "normal",
                        color: "#000000",
                        page: activePage,
                        align: "center",
                      };
                      setFields([...fields, newField]);
                    }}
                    className="w-full h-full flex flex-col bg-white p-3 rounded-2xl border border-blue-100 hover:border-main-blue hover:shadow-md transition-all text-left"
                  >
                    <span className="text-[9px] text-gray-400 font-bold uppercase mb-1">
                      {p.label}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-main-blue font-bold">
                        {p.placeholder}
                      </span>
                      <Plus className="w-3 h-3 text-main-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvailablePlaceholders(
                        availablePlaceholders.filter((_, i) => i !== idx),
                      );
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-50 text-red-500 border border-red-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm z-10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-white/50 rounded-xl border border-blue-50">
              <p className="text-[9px] text-gray-500 italic flex items-center gap-2">
                <span className="w-1 h-1 bg-main-blue rounded-full"></span>
                Klik pada kotak di atas untuk langsung menambahkan element teks
                ke sertifikat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function ensureCertificatesExist(userId?: string) {
  if (!supabase) return;
  try {
    // 1. Fetch certificate configurations map from database/table
    const configs = await fetchCertificateConfigsMap();
    const actIds = Object.keys(configs); // These are the IDs of trainings/events with templates

    if (actIds.length === 0) return;

    // 2. Fetch attended participants
    let partQuery = supabase
      .from("training_participants")
      .select("*")
      .eq("status", "attended");

    if (userId) {
      partQuery = partQuery.or(`user_id.eq.${userId},guest_account_id.eq.${userId}`);
    }

    const { data: participants } = await partQuery;
    if (!participants || participants.length === 0) return;

    // 3. Fetch existing certificate records to prevent duplicate generation
    let certQuery = supabase
      .from("training_certificates")
      .select("*");

    if (userId) {
      certQuery = certQuery.or(`user_id.eq.${userId},guest_account_id.eq.${userId}`);
    }

    const { data: existingCerts } = await certQuery;
    const existingSet = new Set<string>();
    existingCerts?.forEach((c: any) => {
      const uId = c.user_id || c.guest_account_id;
      if (uId) {
        existingSet.add(`${uId}_${c.training_id}`);
      }
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

    // 4. Generate missing certificates
    for (const p of participants) {
      const actId = p.training_id || p.event_id;
      if (!actId) continue;

      // Check if there is a config for this activity, or fallback to default
      const hasConfig = !!configs[actId] || !!configs["default"];
      if (!hasConfig) continue;

      const pId = p.user_id || p.guest_account_id;
      if (pId) {
        const key = `${pId}_${actId}`;
        if (!existingSet.has(key)) {
          existingSet.add(key);

          // Unique combo user_activity is missing, let's create a certificate
          const randomPart = Math.floor(1000 + Math.random() * 9000);
          const certNumber = `${randomPart}/CERT-KKG/${romanMonths[month - 1]}/${year}`;

          const participantPeran = (p.peran || p.guest_peran || p.role_in_activity || "PESERTA").toString().toUpperCase();

          const certPayload: any = {
            training_id: actId,
            certificate_number: certNumber,
            certificate_url: JSON.stringify({ activity_id: actId, certificate_number: certNumber, peran: participantPeran, url: "Generated Individually" }),
            created_at: new Date().toISOString()
          };

          if (p.is_guest) {
            certPayload.guest_account_id = p.guest_account_id;
          } else {
            certPayload.user_id = p.user_id;
          }

          try {
            const { error } = await supabase.from("training_certificates").insert(certPayload);
            if (error) throw error;
          } catch (insertErr) {
            // Fallback: store activity_id and certificate_number inside certificate_url JSON text field with nullable training_id
            const fallbackPayload: any = {
              training_id: null,
              certificate_number: certNumber,
              certificate_url: JSON.stringify({ activity_id: actId, certificate_number: certNumber, url: "Generated Individually" }),
              created_at: new Date().toISOString()
            };
            if (p.is_guest) {
              fallbackPayload.guest_account_id = p.guest_account_id;
            } else {
              fallbackPayload.user_id = p.user_id;
            }
            await supabase.from("training_certificates").insert(fallbackPayload);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error auto-generating certificates:", err);
  }
}

