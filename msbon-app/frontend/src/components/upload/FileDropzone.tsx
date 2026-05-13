import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function FileDropzone({ onFile, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.005 }}
      whileTap={disabled ? {} : { scale: 0.995 }}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label="Drop transcript file or click to browse"
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`relative border-2 border-dashed p-14 text-center cursor-pointer transition-colors duration-200
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta
        ${dragging
          ? "border-terracotta bg-terracotta-light"
          : "border-charcoal-faint hover:border-terracotta/40 hover:bg-cream-dark"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={disabled ? undefined : handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-4">
        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className={dragging ? "text-terracotta" : "text-charcoal-muted"}
        >
          <path
            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className="font-display text-body-md text-charcoal" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
            Drop a transcript here or{" "}
            <span className="text-terracotta underline underline-offset-4 decoration-terracotta/40">
              browse
            </span>
          </p>
          <p className="mt-2 font-sans text-body-sm text-charcoal-muted">
            PDF, PNG, JPEG, TIFF · max 10 MB
          </p>
        </div>
      </div>
    </motion.div>
  );
}
