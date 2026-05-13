import { useId } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export default function AnnotationInput({
  label,
  value,
  onChange,
  disabled,
  required,
  placeholder,
}: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-sans text-label uppercase tracking-wider text-charcoal-muted"
      >
        {label}
        {required && <span className="text-terracotta"> ·</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-transparent border-0 border-b-2 border-charcoal-faint focus:border-terracotta focus:outline-none transition-colors duration-200 py-2 font-sans text-body-md text-charcoal placeholder:text-charcoal-muted/50 disabled:opacity-40 resize-none"
      />
    </div>
  );
}
