import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    CKEDITOR: any;
  }
}

interface CKEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function CKEditor({ value, onChange, placeholder, id = 'editor' }: CKEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let script = document.querySelector(`script[src="https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js"]`) as HTMLScriptElement;

    const initEditor = () => {
      if (window.CKEDITOR && containerRef.current) {
        // Destroy existing instance if any
        if (editorRef.current) {
          editorRef.current.destroy();
        }

        editorRef.current = window.CKEDITOR.replace(containerRef.current, {
          height: 300,
          toolbar: [
            { name: 'document', items: ['Source', '-', 'Save', 'NewPage', 'ExportPdf', 'Preview', 'Print', '-', 'Templates'] },
            { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
            { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
            { name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
            '/',
            { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'] },
            { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
            { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
            { name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
            '/',
            { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
            { name: 'colors', items: ['TextColor', 'BGColor'] },
            { name: 'tools', items: ['Maximize', 'ShowBlocks'] },
            { name: 'about', items: ['About'] }
          ],
          removeButtons: ''
        });

        editorRef.current.setData(value || "");

        editorRef.current.on('change', () => {
          const data = editorRef.current.getData();
          onChange(data);
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.src = "https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js";
      script.async = true;
      document.head.appendChild(script);
      script.addEventListener("load", initEditor);
    } else {
      if (window.CKEDITOR) {
        initEditor();
      } else {
        script.addEventListener("load", initEditor);
      }
    }

    return () => {
      // CKEditor has some async issues sometimes on unmount
      if (script) {
        script.removeEventListener("load", initEditor);
      }
      try {
        if (editorRef.current) {
          editorRef.current.removeAllListeners();
          editorRef.current.destroy(true);
          editorRef.current = null;
        }
      } catch (e) {
        console.error("Error destroying CKEditor:", e);
      }
    };
  }, []); // Run once on mount

  // Only update editor if value changes externally, avoids jumping cursor
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getData()) {
      // Save current selection/cursor position if needed, but for simplicity we'll just set data
      editorRef.current.setData(value || "");
    }
  }, [value]);

  return (
    <div className="ckeditor-wrapper">
      <textarea ref={containerRef} id={id} defaultValue={value} placeholder={placeholder} />
    </div>
  );
}
