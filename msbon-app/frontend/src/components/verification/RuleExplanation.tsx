interface Props {
  explanation: string;
  sourceExcerpt: string | null;
}

export default function RuleExplanation({ explanation, sourceExcerpt }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-body-md text-charcoal leading-relaxed">
        {explanation}
      </p>
      {sourceExcerpt && (
        <blockquote className="border-l-2 border-terracotta pl-4 py-1">
          <p
            className="font-display italic text-body-md text-charcoal-muted"
            style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
          >
            {sourceExcerpt}
          </p>
          <p className="mt-2 font-sans text-label uppercase tracking-wider text-charcoal-muted">
            Source excerpt
          </p>
        </blockquote>
      )}
    </div>
  );
}
