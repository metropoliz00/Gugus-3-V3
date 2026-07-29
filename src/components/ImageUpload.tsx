import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (base64: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  className?: string;
  compact?: boolean;
}

export default function ImageUpload({ 
  label = "Upload Foto", 
  value, 
  onChange, 
  maxWidth = 600, 
  maxHeight = 600,
  quality = 0.5,
  className = "",
  compact = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  let customAlert: any = null;
  try {
    const context = useAlert();
    customAlert = context.alert;
  } catch (e) {
    customAlert = async (msg: string) => { alert(msg); };
  }

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      if (customAlert) {
        await customAlert("Hanya file gambar (JPG, PNG, GIF, WEBP) yang diperbolehkan.", "Format Salah", "error");
      }
      return;
    }

    // Warn if user attempts to upload massive image (over 5MB) before processing
    if (file.size > 5 * 1024 * 1024) {
      if (customAlert) {
         await customAlert(
           "Gambar yang Anda pilih berukuran sangat besar. Sistem kami akan berusaha mengecilkan dan mengompresnya secara otomatis agar database tetap ringan. Proses ini mungkin memakan waktu beberapa detik.",
           "Mendeteksi Gambar Besar",
           "info"
         );
      }
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
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
          
          let dataUrl = '';
          try {
            dataUrl = canvas.toDataURL('image/webp', quality);
          } catch (err) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          onChange(dataUrl);
        }
        setIsLoading(false);
      };
      
      // Some error handling for image loading
      img.onerror = () => {
        if (customAlert) {
          customAlert("Gagal memproses gambar yang dipilih.", "Error", "error");
        }
        setIsLoading(false);
      }
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
        if (customAlert) {
          customAlert("Gagal membaca file gambar.", "Error", "error");
        }
        setIsLoading(false);
    }
    
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-semibold text-gray-700">{label}</label>}
      <div 
        className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors cursor-pointer ${
          isDragging ? 'border-main-blue bg-blue-50/50' : 'border-gray-200 hover:border-main-blue/50 bg-gray-50'
        } ${value ? 'p-2' : 'p-6'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer" 
          accept="image/*"
          title="Pilih Gambar"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />
        
        {isLoading ? (
          <div className="flex flex-col flex-1 items-center justify-center p-4">
             <div className="w-8 h-8 rounded-full border-2 border-main-blue border-t-transparent animate-spin mb-2"></div>
             {!compact && <p className="text-xs text-gray-500 font-medium">Memproses gambar...</p>}
          </div>
        ) : value ? (
          compact ? (
             <div className="flex items-center justify-between gap-2">
               <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm shrink-0 bg-white p-0.5 border border-gray-200">
                 <img src={value} className="w-full h-full object-cover rounded-full" alt="Upload preview" />
               </div>
               <button
                 type="button"
                 onClick={(e) => {
                   e.stopPropagation();
                   fileInputRef.current?.click();
                 }}
                 className="px-2.5 py-1 bg-main-blue text-white rounded-lg text-[10px] font-bold hover:bg-blue-600 transition-colors shadow-sm"
               >
                 Pilih Foto
               </button>
             </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
               <div className="flex gap-3 items-center flex-1 min-w-0">
                 <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 bg-white p-1 border border-gray-200">
                   <img src={value} className="w-full h-full object-cover rounded-lg" alt="Upload preview" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-semibold text-gray-700 truncate mb-0.5">Gambar terpilih</p>
                   <p className="text-xs text-gray-500">Klik tombol atau drag untuk mengganti foto.</p>
                 </div>
               </div>
               <button
                 type="button"
                 onClick={(e) => {
                   e.stopPropagation();
                   fileInputRef.current?.click();
                 }}
                 className="w-full sm:w-auto px-4 py-2 bg-main-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
               >
                 <UploadCloud className="w-4 h-4" />
                 Pilih Foto
               </button>
            </div>
          )
        ) : (
          compact ? (
            <div className="flex items-center justify-center gap-2 cursor-pointer p-1">
              <UploadCloud className="w-5 h-5 text-main-blue" />
              <span className="text-xs font-bold text-main-blue">Pilih Foto</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6 text-main-blue" />
              </div>
              <p className="text-sm font-bold text-gray-700 mb-1">Pilih Gambar</p>
              <p className="text-xs text-gray-500 max-w-[220px] mx-auto mb-3">Klik tombol di bawah atau drag & drop file gambar (JPG, PNG, WEBP).</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-main-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                Pilih Foto
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
