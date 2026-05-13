import axios from "axios";
import type { AuditLog } from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function listAuditLogs(
  skip = 0,
  limit = 100,
  actionType?: string
): Promise<AuditLog[]> {
  const params: Record<string, unknown> = { skip, limit };
  if (actionType) params.action_type = actionType;
  const res = await axios.get(`${BASE}/audit-logs`, { params });
  return res.data;
}

export async function getAuditLogsForTranscript(transcriptId: string): Promise<AuditLog[]> {
  const res = await axios.get(`${BASE}/audit-logs/${transcriptId}`);
  return res.data;
}

export function buildExportUrl(transcriptId: string, format: "json" | "csv"): string {
  const base = import.meta.env.VITE_API_BASE_URL || "/api/v1";
  return `${base}/audit-logs/${transcriptId}/export?format=${format}`;
}
