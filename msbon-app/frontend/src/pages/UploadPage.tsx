import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileDropzone from "../components/upload/FileDropzone";
import UploadProgressBar from "../components/upload/UploadProgressBar";
import { uploadTranscript, processTranscript } from "../services/transcriptClient";
import { useUIStore } from "../store/uiStore";
import Section from "../components/layout/Section";
import SectionLabel from "../components/ui/SectionLabel";
import DisplayHeading from "../components/ui/DisplayHeading";
import FadeUp from "../components/motion/FadeUp";

type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

const STATUS_MESSAGE: Record<UploadStatus, string> = {
  idle:       "",
  uploading:  "Uploading file…",
  processing: "Extracting, then verifying against twelve rules…",
  done:       "Verification complete. Opening the transcript…",
  error:      "Upload failed.",
};

export default function UploadPage() {
  const staffId = useUIStore((s) => s.staffId);
  const [status, setStatus]   = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  async function handleFile(file: File) {
    setStatus("uploading");
    setMessage(`${STATUS_MESSAGE.uploading} (${file.name})`);
    try {
      const uploaded = await uploadTranscript(file, staffId);
      setStatus("processing");
      setMessage(STATUS_MESSAGE.processing);
      await processTranscript(uploaded.id, staffId);
      setStatus("done");
      setMessage(STATUS_MESSAGE.done);
      setTimeout(() => navigate(`/app/transcripts/${uploaded.id}`), 1200);
    } catch (err: unknown) {
      setStatus("error");
      const m =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Upload failed.";
      setMessage(m);
    }
  }

  return (
    <Section bg="cream" padding="xl" container="prose">
      <FadeUp>
        <SectionLabel>Upload</SectionLabel>
        <DisplayHeading as="h1" size="lg" className="mt-4">
          Upload transcript.
        </DisplayHeading>
        <p
          className="font-display italic text-body-lg text-charcoal-muted mt-6"
          style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
        >
          We extract, then verify against twelve rules. You decide.
        </p>
      </FadeUp>

      <FadeUp delay={0.1} className="mt-12 flex flex-col gap-8">
        <FileDropzone
          onFile={handleFile}
          disabled={status === "uploading" || status === "processing"}
        />
        <UploadProgressBar status={status} message={message} />
      </FadeUp>

      <FadeUp delay={0.2} className="mt-16 pt-10 border-t border-charcoal-faint">
        <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-4">
          What happens next
        </p>
        <ol className="flex flex-col gap-4">
          {[
            "We confirm the file's actual type by reading its magic bytes, then save it under a random ID.",
            "An LLM extracts the structured fields (student, institution, courses, dates). The PoC ships with a deterministic mock so the demo works without a Gemini key.",
            "Twelve transparent rules run on the extracted data. Every flag carries its rule, source excerpt, and a plain-language explanation.",
            "You decide. Override requires a written reason. Every action lands in the audit log.",
          ].map((step, i) => (
            <li key={i} className="flex gap-5">
              <span
                aria-hidden="true"
                className="flex-none font-display text-display-md text-terracotta w-10"
                style={{ fontVariationSettings: '"opsz" 36, "wght" 300' }}
              >
                0{i + 1}
              </span>
              <p className="font-sans text-body-md text-charcoal-muted leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </FadeUp>
    </Section>
  );
}
