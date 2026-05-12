import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Text, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { supabase } from "../lib/supabase";
import { Award, Save, Download, Plus, Trash2, Move, Type, Settings, RefreshCw } from "lucide-react";
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
}

interface CertificateConfig {
  templateUrl: string;
  fields: FieldType[];
  canvasWidth: number;
  canvasHeight: number;
}

// =================================
// IMAGE COMPONENT
// =================================

function URLImage({ src }: { src: string }) {
  const [image] = useImage(src, "anonymous");
  return image ? <KonvaImage image={image} width={1000} height={700} /> : null;
}

// =================================
// MAIN COMPONENT
// =================================

export default function AdminCertificateEditor() {
  const { alert } = useAlert();
  const stageRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // TEMPLATE IMAGE
  const [templateUrl, setTemplateUrl] = useState("");
  
  // CANVAS SIZE (Landscape A4ish aspect)
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 700;

  // FIELDS
  const [fields, setFields] = useState<FieldType[]>([
    {
      id: "nama",
      field_name: "Nama Peserta",
      text: "[Nama Peserta]",
      x: 500,
      y: 350,
      fontSize: 40,
      fontWeight: "bold",
      color: "#000000"
    },
    {
      id: "nip",
      field_name: "NIP",
      text: "NIP. 123456789",
      x: 500,
      y: 420,
      fontSize: 20,
      fontWeight: "normal",
      color: "#000000"
    }
  ]);

  // =================================
  // LOAD CONFIG FROM DB
  // =================================

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("content")
        .eq("id", 1)
        .single();

      if (error) throw error;
      
      const config = data?.content?.certificate_config as CertificateConfig;
      if (config) {
        if (config.templateUrl) setTemplateUrl(config.templateUrl);
        if (config.fields) setFields(config.fields);
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
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }

  // =================================
  // SAVE TO DB
  // =================================

  async function saveConfig() {
    if (!supabase) return;
    setSaving(true);
    try {
      // Get current content first
      const { data: current, error: fetchError } = await supabase
        .from("site_settings")
        .select("content")
        .eq("id", 1)
        .single();
      
      if (fetchError) throw fetchError;

      const newContent = {
        ...current.content,
        certificate_config: {
          templateUrl,
          fields,
          canvasWidth: CANVAS_WIDTH,
          canvasHeight: CANVAS_HEIGHT
        }
      };

      const { error } = await supabase
        .from("site_settings")
        .update({ content: newContent, updated_at: new Date().toISOString() })
        .eq("id", 1);

      if (error) throw error;
      await alert("Konfigurasi sertifikat berhasil disimpan", "Sukses", "success");
    } catch (err: any) {
      console.error(err);
      alert(err.message, "Gagal menyimpan", "error");
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
      // Letter landscape roughly 842x595 (A4)
      // Custom size matching our canvas aspect
      const page = pdfDoc.addPage([CANVAS_WIDTH, CANVAS_HEIGHT]);

      if (templateUrl) {
        try {
          const imageBytes = await fetch(templateUrl).then((res) => res.arrayBuffer());
          // Determine if PNG or JPG
          let image;
          if (templateUrl.toLowerCase().endsWith('.png') || templateUrl.startsWith('data:image/png')) {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            image = await pdfDoc.embedJpg(imageBytes);
          }
          
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
          });
        } catch (e) {
          console.error("Failed to embed image in PDF", e);
        }
      }

      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      fields.forEach((field) => {
        // Convert hex to rgb
        const hex = field.color || "#000000";
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        page.drawText(field.text, {
          x: field.x - (field.text.length * field.fontSize * 0.25), // Rough centering adjustment if needed, but we use drag position
          y: CANVAS_HEIGHT - field.y - (field.fontSize * 0.5), // pdf-lib uses bottom-left origin
          size: field.fontSize,
          font: field.fontWeight === 'bold' ? fontBold : fontRegular,
          color: rgb(r, g, b),
        });
      });

      const pdfBytes = await pdfDoc.save();
      saveAs(new Blob([pdfBytes], { type: "application/pdf" }), "preview-sertifikat.pdf");
    } catch (err: any) {
      alert("Gagal generate PDF: " + err.message, "Error", "error");
    }
  }

  const addField = () => {
    const id = "field_" + Date.now();
    setFields([...fields, {
      id,
      field_name: "Field Baru",
      text: "[Isi Field]",
      x: 100,
      y: 100,
      fontSize: 20,
      fontWeight: "normal",
      color: "#000000"
    }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
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
      <div className="flex-1 space-y-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-main-blue/10 rounded-2xl flex items-center justify-center text-main-blue">
               <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">Desain Template Sertifikat</h2>
              <p className="text-xs text-gray-500">Atur tata letak teks pada sertifikat pelatihan.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
               onClick={saveConfig}
               disabled={saving}
               className="flex-1 sm:flex-none px-6 py-2.5 bg-main-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-main-blue/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan Layout'}
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

        {/* Canvas Area */}
        <div className="bg-gray-100 p-4 rounded-[2rem] flex items-center justify-center overflow-auto modern-scrollbar border-2 border-dashed border-gray-200 min-h-[500px]">
          <div className="bg-white shadow-2xl relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={stageRef}>
              <Layer>
                {/* TEMPLATE */}
                {templateUrl ? (
                  <URLImage src={templateUrl} />
                ) : (
                  <KonvaImage 
                    image={undefined as any} 
                    width={CANVAS_WIDTH} 
                    height={CANVAS_HEIGHT} 
                    fill="#f3f4f6"
                  />
                )}

                {/* DRAG TEXT */}
                {fields.map((field) => (
                  <Text
                    key={field.id}
                    text={field.text}
                    x={field.x}
                    y={field.y}
                    fontSize={field.fontSize}
                    fontStyle={field.fontWeight === 'bold' ? 'bold' : 'normal'}
                    fontFamily="Helvetica"
                    draggable
                    fill={field.color}
                    align="center"
                    onDragEnd={(e) => {
                       updateField(field.id, { x: e.target.x(), y: e.target.y() });
                    }}
                    onMouseEnter={() => { document.body.style.cursor = 'move'; }}
                    onMouseLeave={() => { document.body.style.cursor = 'default'; }}
                  />
                ))}
              </Layer>
            </Stage>
            {!templateUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                 <Settings className="w-16 h-16 text-gray-200 mb-4" />
                 <p className="text-gray-400 font-medium">Harap upload atau pilih file background sertifikat (template) melalui panel kontrol di samping.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Sidebar */}
      <div className="w-full lg:w-[400px] space-y-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg space-y-8 h-full">
          {/* Template Selection */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-main-blue" />
                <h3 className="font-bold text-gray-700">Template Background</h3>
             </div>
             <ImageUpload 
                label="Background Sertifikat (Rekomendasi Landscape A4)" 
                value={templateUrl} 
                onChange={val => setTemplateUrl(val)} 
                maxWidth={2000}
                maxHeight={2000}
             />
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

             <div className="space-y-4 max-h-[600px] overflow-y-auto modern-scrollbar pr-2">
                {fields.map((field) => (
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Nama Field / Label</label>
                        <input
                          type="text"
                          value={field.field_name}
                          onChange={(e) => updateField(field.id, { field_name: e.target.value })}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:border-main-blue outline-none"
                          placeholder="Contoh: Nama Guru"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Teks Preview</label>
                        <textarea
                          value={field.text}
                          onChange={(e) => updateField(field.id, { text: e.target.value })}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:border-main-blue outline-none"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Ukuran Font</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={field.fontSize}
                              onChange={(e) => updateField(field.id, { fontSize: Number(e.target.value) })}
                              className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:border-main-blue outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Warna Teks</label>
                          <input
                            type="color"
                            value={field.color}
                            onChange={(e) => updateField(field.id, { color: e.target.value })}
                            className="w-full h-9 bg-white border border-gray-200 px-1 py-1 rounded-xl cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                         <button 
                            onClick={() => updateField(field.id, { fontWeight: field.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${field.fontWeight === 'bold' ? 'bg-main-blue text-white border-main-blue' : 'bg-white text-gray-500 border-gray-200'}`}
                         >
                            Bold
                         </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-mono italic">
                         <span>X: {Math.round(field.x)}px</span>
                         <span>Y: {Math.round(field.y)}px</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
