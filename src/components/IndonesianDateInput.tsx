import React, { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";

interface IndonesianDateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
}

// Convert YYYY-MM-DD or ISO string to DD - MM - YYYY
export function formatToIndoDate(val?: string): string {
  if (!val) return "";
  // If val is ISO string or YYYY-MM-DD
  const clean = val.split("T")[0];
  const parts = clean.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    if (y && m && d) {
      return `${d.padStart(2, "0")} - ${m.padStart(2, "0")} - ${y}`;
    }
  }
  return val;
}

// Convert DD - MM - YYYY or raw digits DDMMYYYY to YYYY-MM-DD
export function parseIndoToIsoDate(val: string): string {
  if (!val) return "";
  const digits = val.replace(/\D/g, "");
  if (digits.length === 8) {
    const d = digits.slice(0, 2);
    const m = digits.slice(2, 4);
    const y = digits.slice(4, 8);
    const dayNum = parseInt(d, 10);
    const monthNum = parseInt(m, 10);
    const yearNum = parseInt(y, 10);
    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  return "";
}

// Auto-mask digits to dd - mm - yyyy format
export function maskIndoDateInput(inputVal: string): string {
  const digits = inputVal.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} - ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} - ${digits.slice(2, 4)} - ${digits.slice(4)}`;
}

export const IndonesianDateInput: React.FC<IndonesianDateInputProps> = ({
  value = "",
  onChange,
  className = "",
  required = false,
  disabled = false,
  placeholder = "dd - mm - yyyy",
  name,
  id,
}) => {
  const [displayVal, setDisplayVal] = useState<string>(() => formatToIndoDate(value));
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayVal(formatToIndoDate(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const masked = maskIndoDateInput(raw);
    setDisplayVal(masked);

    const iso = parseIndoToIsoDate(masked);
    if (iso && onChange) {
      onChange(iso);
    } else if (masked === "" && onChange) {
      onChange("");
    }
  };

  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    if (isoVal) {
      setDisplayVal(formatToIndoDate(isoVal));
      if (onChange) {
        onChange(isoVal);
      }
    }
  };

  const openCalendarPicker = () => {
    if (disabled) return;
    if (hiddenDateRef.current) {
      if ("showPicker" in hiddenDateRef.current) {
        try {
          (hiddenDateRef.current as any).showPicker();
        } catch (err) {
          hiddenDateRef.current.focus();
          hiddenDateRef.current.click();
        }
      } else {
        hiddenDateRef.current.focus();
        hiddenDateRef.current.click();
      }
    }
  };

  const cleanIsoForPicker = value ? value.split("T")[0] : "";

  return (
    <div className="relative inline-flex items-center w-full">
      <input
        type="text"
        id={id}
        name={name}
        value={displayVal}
        onChange={handleTextChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={
          className ||
          "w-full bg-white border border-gray-200 px-4 py-2.5 pr-10 rounded-xl outline-none focus:border-main-blue text-sm transition-colors"
        }
      />
      <button
        type="button"
        onClick={openCalendarPicker}
        disabled={disabled}
        title="Pilih Tanggal (dd - mm - yyyy)"
        className="absolute right-2 text-gray-400 hover:text-main-blue p-1.5 rounded-lg transition-colors cursor-pointer"
      >
        <Calendar className="w-4 h-4" />
      </button>

      {/* Hidden native HTML date input for calendar popover trigger */}
      <input
        ref={hiddenDateRef}
        type="date"
        value={cleanIsoForPicker}
        onChange={handleHiddenDateChange}
        disabled={disabled}
        className="sr-only opacity-0 w-0 h-0 pointer-events-none absolute"
        tabIndex={-1}
      />
    </div>
  );
};

export default IndonesianDateInput;
