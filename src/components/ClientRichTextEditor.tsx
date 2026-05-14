import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
    return <div className={`border border-gray-200 rounded-xl p-3 ${className}`}>Memuat Editor...</div>;
  }

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
    />
  );
};

export default ClientRichTextEditor;
