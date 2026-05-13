const ACTION_TYPES = [
  { value: "",              label: "All actions" },
  { value: "UPLOAD",        label: "Uploads" },
  { value: "EXTRACT",       label: "Extractions" },
  { value: "VERIFY",        label: "Verifications" },
  { value: "REVIEW_FLAG",   label: "Confirmations" },
  { value: "OVERRIDE_FLAG", label: "Overrides" },
  { value: "EXPORT",        label: "Exports" },
];

interface Props {
  actionType: string;
  onActionTypeChange: (v: string) => void;
}

export default function AuditLogFilters({ actionType, onActionTypeChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      <span className="font-sans text-label uppercase tracking-wider text-charcoal-muted mr-2">
        Filter
      </span>
      {ACTION_TYPES.map((opt) => {
        const active = opt.value === actionType;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onActionTypeChange(opt.value)}
            className={`px-4 py-2 border font-sans text-label uppercase tracking-wider transition-colors duration-200 min-h-[44px]
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta
              ${active
                ? "bg-terracotta text-cream border-terracotta"
                : "bg-cream text-charcoal border-charcoal-faint hover:border-terracotta hover:text-terracotta"
              }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
