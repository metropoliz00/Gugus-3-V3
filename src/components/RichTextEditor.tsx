import { forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link'
];

export const RichTextEditor = forwardRef<ReactQuill, RichTextEditorProps>(({ value, onChange, placeholder, className }, ref) => {
  return (
    <div className={`rich-text-editor-wrapper ${className || ''}`}>
      <ReactQuill
        ref={ref}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-gray-50 rounded-2xl overflow-hidden [&_.ql-toolbar]:rounded-t-2xl [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-white [&_.ql-toolbar]:border-b-2 [&_.ql-toolbar]:border-gray-100 [&_.ql-container]:border-none [&_.ql-container]:font-sans [&_.ql-container]:text-sm [&_.ql-editor]:min-h-[200px]"
      />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';
