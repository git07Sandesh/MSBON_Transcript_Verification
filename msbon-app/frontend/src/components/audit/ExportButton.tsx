import { buildExportUrl } from "../../services/auditClient";

interface Props {
  transcriptId: string;
}

export default function ExportButton({ transcriptId }: Props) {
  const linkBase =
    "px-5 py-3 font-sans text-label uppercase tracking-wider transition-colors duration-200 min-h-[44px] inline-flex items-center";

  return (
    <div className="flex gap-3">
      <a
        href={buildExportUrl(transcriptId, "csv")}
        download
        className={`${linkBase} bg-terracotta text-cream hover:bg-terracotta-dark`}
      >
        Export CSV
      </a>
      <a
        href={buildExportUrl(transcriptId, "json")}
        download
        className={`${linkBase} bg-cream text-terracotta border border-terracotta hover:bg-terracotta-light`}
      >
        Export JSON
      </a>
    </div>
  );
}
