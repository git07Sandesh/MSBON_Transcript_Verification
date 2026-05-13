/* Generates an authenticated, single-shot download link for the verification
 * PDF report. Because the endpoint is JWT-gated and a plain <a href> can't
 * carry custom headers, we fetch the bytes ourselves with the axios interceptor
 * attaching the token, then materialize a blob URL for download.
 */
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function downloadVerificationReport(
  transcriptId: string,
  filename = `MSBON_verification_${transcriptId.slice(0, 8)}.pdf`
): Promise<void> {
  const res = await axios.get(`${BASE}/transcripts/${transcriptId}/report.pdf`, {
    responseType: "blob",
  });
  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Free the blob once the browser has had a tick to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
