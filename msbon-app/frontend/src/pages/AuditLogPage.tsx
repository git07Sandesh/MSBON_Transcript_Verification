import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getAuditLogsForTranscript, listAuditLogs } from "../services/auditClient";
import AuditLogTable from "../components/audit/AuditLogTable";
import AuditLogFilters from "../components/audit/AuditLogFilters";
import ExportButton from "../components/audit/ExportButton";
import Section from "../components/layout/Section";
import SectionLabel from "../components/ui/SectionLabel";
import DisplayHeading from "../components/ui/DisplayHeading";

export default function AuditLogPage() {
  const { id } = useParams<{ id?: string }>();
  const [actionType, setActionType] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit", id, actionType],
    queryFn: () =>
      id
        ? getAuditLogsForTranscript(id)
        : listAuditLogs(0, 200, actionType || undefined),
  });

  return (
    <Section bg="cream" padding="lg" container="wide">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-3">
          <SectionLabel>
            {id ? `Audit · transcript ${id.slice(0, 8)}…` : "Audit"}
          </SectionLabel>
          <DisplayHeading as="h1" size="lg">
            {id ? "Audit trail." : "Audit log."}
          </DisplayHeading>
          <p className="font-sans text-body-md text-charcoal-muted">
            {id
              ? "Every action recorded for this transcript, in order."
              : `${logs.length} entr${logs.length === 1 ? "y" : "ies"} captured.`}
          </p>
        </div>
        {id && <ExportButton transcriptId={id} />}
      </div>

      {id && (
        <Link
          to={`/app/transcripts/${id}`}
          className="inline-block mb-10 font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta nav-underline transition-colors"
        >
          ← Back to transcript
        </Link>
      )}

      {!id && (
        <AuditLogFilters actionType={actionType} onActionTypeChange={setActionType} />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-charcoal-faint border-t-terracotta rounded-full"
          />
        </div>
      ) : (
        <AuditLogTable logs={logs} />
      )}
    </Section>
  );
}
