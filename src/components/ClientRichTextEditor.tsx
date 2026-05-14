import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const ClientRichTextEditor: React.FC<Props> = ({ value, onChange, className, placeholder }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`border border-gray-200 rounded-xl p-3 bg-gray-50 flex items-center justify-center text-gray-400 ${className}`}>Memuat Editor...</div>;
  }

  try {
    return (
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        className={className}
        placeholder={placeholder}
      />
    );
  } catch (error) {
    console.error("ReactQuill render error:", error);
    return <div className={`p-3 bg-red-50 text-red-500 rounded-xl ${className}`}>Error memuat editor.</div>;
  }
};

export default ClientRichTextEditor;
