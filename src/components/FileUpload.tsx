import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File as FileIcon, Link as LinkIcon, ExternalLink, Copy, Trash2, Check, FileText } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

interface FileUploadProps {
  label?: string;
  value?: string;
  onChange: (dataUrlOrUrl: string, filename?: string) => void;
  accept?: string;
  className?: string;
  compact?: boolean;
}

export default function FileUpload({ 
  label = "Upload File Dokumen", 
  value, 
  onChange, 
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar",
  className = "",
  compact = false
}: FileUploadProps) {
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  let customAlert: any = null;
  try {
    const context = useAlert();
    customAlert = context.alert;
  } catch (e) {
    customAlert = async (msg: string) => { alert(msg); };
  }

  useEffect(() => {
    // If value is a link, set mode to link if not data URL
    if (value && !value.startsWith('data:')) {
      if (value.startsWith('http') || value.startsWith('blob:')) {
        setUploadMode('link');
      }
    }
  }, [value]);

  const processFile = async (file: File) => {
    // Limit file size to 15 MB since it is uploaded to Supabase Storage
    const MAX_SIZE_MB = 15.0;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      if (customAlert) {
         await customAlert(
           `Ukuran file '${file.name}' (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas ${MAX_SIZE_MB} MB.\n\nTips: Silakan kompres file Anda atau pilih opsi 'Tautan Direct' untuk memasukkan link Google Drive/OneDrive/Dropbox.`,
           "Ukuran File Terlalu Besar",
           "error"
         );
      }
      return;
    }

    setIsLoading(true);

    // Create Blob URL for instant viewing
    try {
      const generatedBlob = URL.createObjectURL(file);
      setBlobUrl(generatedBlob);
    } catch (err) {
      console.warn("Could not create object blob URL:", err);
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileData: dataUrl,
            fileName: file.name,
            fileType: file.type
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          let parsedErr = "Gagal upload";
          try {
            const parsed = JSON.parse(errText);
            parsedErr = parsed.error || parsedErr;
          } catch {
            parsedErr = errText || parsedErr;
          }
          throw new Error(parsedErr);
        }

        const resData = await response.json();
        // Return the REAL persistent public URL!
        onChange(resData.url, file.name);
      } catch (uploadError: any) {
        console.error("Storage upload error:", uploadError);
        if (customAlert) {
          await customAlert(
            "Gagal mengunggah file ke cloud storage: " + uploadError.message,
            "Upload Gagal",
            "error"
          );
        }
        // Rollback local states on error
        setBlobUrl(null);
        setFileName('');
        setFileSize('');
        onChange('');
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      if (customAlert) {
        customAlert("Gagal membaca file yang dipilih.", "Error", "error");
      }
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleOpenLink = () => {
    if (!value && !blobUrl) return;
    
    const targetUrl = blobUrl || value;
    if (!targetUrl) return;

    if (targetUrl.startsWith('data:')) {
      // Open data URL in blob format for clean viewing
      try {
        const arr = targetUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const tempBlobUrl = URL.createObjectURL(blob);
        window.open(tempBlobUrl, '_blank');
      } catch (e) {
        window.open(targetUrl, '_blank');
      }
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    const targetUrl = blobUrl || value || '';
    if (targetUrl) {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    setFileName('');
    setFileSize('');
    onChange('');
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

  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        {value ? (
          <div className="flex items-center gap-1.5 p-1.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs min-w-0">
            <FileText className="w-4 h-4 text-main-blue shrink-0" />
            <span className="break-words break-all leading-snug flex-1 font-medium text-gray-700 min-w-0">
              {fileName || (value.startsWith('data:') ? 'Dokumen Terlampir' : 'Link Dokumen')}
            </span>
            <button
              type="button"
              onClick={handleOpenLink}
              title="Buka / Preview Link Blob"
              className="p-1 hover:bg-blue-100 rounded text-main-blue transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              title="Hapus file"
              className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1 items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-600 flex items-center justify-center gap-1.5 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-main-blue" />
              <span>Upload Dokumen</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept={accept}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">{label}</label>
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                uploadMode === 'file' ? 'bg-white text-main-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UploadCloud className="w-3 h-3" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                uploadMode === 'link' ? 'bg-white text-main-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Tautan / Link Direct</span>
            </button>
          </div>
        </div>
      )}

      {value ? (
        <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200/80 rounded-xl space-y-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-main-blue text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 break-words break-all leading-snug">
                {fileName || (value.startsWith('data:') ? 'Dokumen Terupload' : 'Link File / Tautan Dokumen')}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap mt-0.5 min-w-0">
                {fileSize && <span>{fileSize} •</span>}
                <span className="font-mono text-[10px] text-blue-600 break-words break-all">
                  {value.startsWith('data:') ? 'Format Data/Blob Terkonversi' : 'Tautan Web External'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-blue-100">
            <button
              type="button"
              onClick={handleOpenLink}
              className="flex-1 py-1.5 px-3 bg-main-blue hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Dokumen (Blob)</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-1.5 px-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              title="Hapus / Ganti Dokumen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : uploadMode === 'link' ? (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste link dokumen (https://... / Google Drive / OneDrive)"
              className="w-full px-3.5 py-2.5 pl-9 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue"
            />
            <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <p className="text-[11px] text-gray-500">
            Masukkan tautan langsung atau URL Google Drive / OneDrive untuk lampiran dokumen.
          </p>
        </div>
      ) : (
        <div 
          className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all cursor-pointer ${
            isDragging ? 'border-main-blue bg-blue-50/60 scale-[0.99]' : 'border-gray-200 hover:border-main-blue/60 bg-gray-50/80 hover:bg-blue-50/20'
          } p-5`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept={accept}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processFile(e.target.files[0]);
              }
            }}
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <div className="w-7 h-7 rounded-full border-2 border-main-blue border-t-transparent animate-spin mb-2"></div>
              <p className="text-xs text-gray-600 font-semibold">Memproses & mengonversi file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-main-blue flex items-center justify-center mb-2 shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-800 mb-0.5">
                Klik atau Seret File Dokumen Ke Sini
              </p>
              <p className="text-[11px] text-gray-500">
                Otomatis dikonversi menjadi Blob / Link Data siap pakai (PDF, DOCX, XLSX, PPTX)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

