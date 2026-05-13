import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitReview } from "../../services/reviewClient";
import DecisionButtons from "./DecisionButtons";
import AnnotationInput from "./AnnotationInput";
import CTAButton from "../ui/CTAButton";

interface Props {
  flagId: string;
  transcriptId: string;
  staffId: string;
  onSubmitted: () => void;
}

type Decision = "CONFIRMED" | "OVERRIDDEN" | "NEEDS_MORE_INFO";

export default function ReviewForm({
  flagId,
  transcriptId,
  staffId,
  onSubmitted,
}: Props) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [annotation, setAnnotation] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      submitReview(
        {
          flag_id: flagId,
          transcript_id: transcriptId,
          reviewer_id: staffId,
          decision: decision!,
          annotation: annotation || undefined,
          override_reason: decision === "OVERRIDDEN" ? overrideReason : undefined,
        },
        staffId
      ),
    onSuccess: () => onSubmitted(),
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response
          ?.data?.error?.message ?? "Submission failed.";
      setError(message);
    },
  });

  function handleSubmit() {
    setError(null);
    if (!decision) {
      setError("Select a decision first.");
      return;
    }
    if (decision === "OVERRIDDEN" && !overrideReason.trim()) {
      setError("Override requires a written reason.");
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <DecisionButtons
        selected={decision}
        onSelect={setDecision}
        disabled={mutation.isPending}
      />

      <AnnotationInput
        label="Note (optional)"
        value={annotation}
        onChange={setAnnotation}
        disabled={mutation.isPending}
        placeholder="Anything a future reviewer should know."
      />

      {decision === "OVERRIDDEN" && (
        <AnnotationInput
          label="Override reason"
          value={overrideReason}
          onChange={setOverrideReason}
          disabled={mutation.isPending}
          required
          placeholder="Required for an override. This will be logged."
        />
      )}

      {error && (
        <p role="alert" className="font-sans text-body-sm text-terracotta">
          {error}
        </p>
      )}

      <div>
        <CTAButton
          type="button"
          onClick={handleSubmit}
          disabled={!decision || mutation.isPending}
          loading={mutation.isPending}
          loadingLabel="Submitting…"
        >
          Submit review
        </CTAButton>
      </div>
    </div>
  );
}
