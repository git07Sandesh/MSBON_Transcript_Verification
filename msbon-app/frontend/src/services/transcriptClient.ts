import axios from "axios";
import type {
  TranscriptDetail,
  TranscriptListResponse,
} from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function uploadTranscript(
  file: File,
  uploadedBy: string
): Promise<{ id: string; filename: string; status: string; uploaded_at: string; uploaded_by: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("uploaded_by", uploadedBy);
  // Auth is JWT via the axios interceptor; no custom identity header.
  const res = await axios.post(`${BASE}/transcripts/upload`, form);
  return res.data;
}

export async function processTranscript(
  transcriptId: string,
  _staffId: string
): Promise<{ transcript_id: string; status: string; message: string }> {
  const res = await axios.post(
    `${BASE}/transcripts/${transcriptId}/process`,
    {}
  );
  return res.data;
}

export async function getTranscript(transcriptId: string): Promise<TranscriptDetail> {
  const res = await axios.get(`${BASE}/transcripts/${transcriptId}`);
  return res.data;
}

export async function listTranscripts(
  skip = 0,
  limit = 20,
  status?: string
): Promise<TranscriptListResponse> {
  const params: Record<string, unknown> = { skip, limit };
  if (status) params.status = status;
  const res = await axios.get(`${BASE}/transcripts`, { params });
  return res.data;
}
