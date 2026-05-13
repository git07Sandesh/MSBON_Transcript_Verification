type Decision = "CONFIRMED" | "OVERRIDDEN" | "NEEDS_MORE_INFO";

interface Props {
  selected: Decision | null;
  onSelect: (d: Decision) => void;
  disabled?: boolean;
}

const OPTIONS: { value: Decision; label: string; helper: string }[] = [
  { value: "CONFIRMED",       label: "Confirm flag",  helper: "The system was right." },
  { value: "OVERRIDDEN",      label: "Override",      helper: "The flag is not a real issue." },
  { value: "NEEDS_MORE_INFO", label: "Needs info",    helper: "Hold pending more evidence." },
];

export default function DecisionButtons({ selected, onSelect, disabled }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Review decision">
      {OPTIONS.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(opt.value)}
            disabled={disabled}
            className={`flex flex-col items-start gap-1 px-5 py-4 border text-left transition-colors duration-200 min-h-[44px]
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta
              ${active
                ? "bg-terracotta text-cream border-terracotta"
                : "bg-cream text-charcoal border-charcoal-faint hover:border-terracotta hover:text-terracotta"
              }
              disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <span className="font-sans text-label uppercase tracking-wider font-medium">
              {opt.label}
            </span>
            <span
              className={`font-sans text-body-sm ${
                active ? "text-cream/80" : "text-charcoal-muted"
              }`}
            >
              {opt.helper}
            </span>
          </button>
        );
      })}
    </div>
  );
}
