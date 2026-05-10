import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (base64: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  className?: string;
  compact?: boolean;
  aspect34?: boolean;
}

export default function ImageUpload({ 
  label = "Upload Foto", 
  value, 
  onChange, 
  maxWidth = 800, 
  maxHeight = 800,
  quality = 0.8,
  className = "",
  compact = false,
  aspect34 = false
}: ImageUploadProps & { aspect34?: boolean }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Hanya file gambar yang diperbolehkan.");
      return;
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
          // Convert to WebP for better compression
          const dataUrl = canvas.toDataURL('image/webp', quality);
          onChange(dataUrl);
        }
        setIsLoading(false);
      };
      
      // Some error handling for image loading
      img.onerror = () => {
        alert("Gagal memproses gambar.");
        setIsLoading(false);
      }
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
        alert("Gagal membaca file.");
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
        className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
          isDragging ? 'border-main-blue bg-blue-50/50' : 'border-gray-200 hover:border-main-blue/50 bg-gray-50'
        } ${value ? 'p-2' : 'p-6'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
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
             <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm shrink-0 bg-white p-0.5 mx-auto">
               <img src={value} className="w-full h-full object-cover rounded-full" alt="Upload preview" />
             </div>
          ) : (
            <div className="flex gap-4 items-center">
              <div
                className={`${aspect34 ? "w-20 h-[106.6px]" : "w-16 h-16"} rounded-xl overflow-hidden shadow-sm shrink-0 bg-white p-1`}
              >
                <img
                  src={value}
                  className="w-full h-full object-cover rounded-lg"
                  alt="Upload preview"
                />
              </div>
               <div className="flex-1">
                 <p className="text-sm font-semibold text-gray-700 mb-1">Gambar terpilih</p>
                 <p className="text-xs text-gray-500">Klik atau drag untuk mengganti (akan diperkecil otomatis).</p>
               </div>
            </div>
          )
        ) : (
          compact ? (
            <div className="flex flex-col items-center justify-center text-center cursor-pointer p-1">
              <UploadCloud className="w-5 h-5 text-gray-400 hover:text-main-blue transition-colors" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6 text-main-blue" />
              </div>
              <p className="text-sm font-bold text-gray-700 mb-1">Pilih Gambar</p>
              <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Klik atau drag & drop file gambar (JPG, PNG, GIF). Ukuran akan dioptimasi otomatis.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
