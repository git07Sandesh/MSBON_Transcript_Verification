export interface Course {
  code: string | null;
  name: string;
  grade: string;
  credits: number | null;
  semester: string | null;
  year: string | null;
}

export interface ExtractedData {
  student_name: string | null;
  institution_name: string | null;
  program_name: string | null;
  degree_type: string | null;
  graduation_date: string | null;
  graduation_confirmed: boolean;
  enrollment_date: string | null;
  courses: Course[];
  extraction_confidence: number | null;
  extracted_at: string;
  llm_model_used: string;
}

export interface Review {
  id: string;
  flag_id: string;
  reviewer_id: string;
  decision: "CONFIRMED" | "OVERRIDDEN" | "NEEDS_MORE_INFO";
  annotation: string | null;
  override_reason: string | null;
  reviewed_at: string;
}

export interface Flag {
  id: string;
  rule_id: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  category: "GRADUATION" | "ACCREDITATION" | "COURSE" | "FRAUD" | "FORMAT";
  description: string;
  source_excerpt: string | null;
  explanation: string;
  is_fraud_indicator: boolean;
  flagged_at: string;
  review: Review | null;
}

export interface TranscriptDetail {
  id: string;
  filename: string;
  status: TranscriptStatus;
  uploaded_at: string;
  processed_at: string | null;
  uploaded_by: string;
  extracted_data: ExtractedData | null;
  flags: Flag[];
}

export interface TranscriptListItem {
  id: string;
  filename: string;
  status: TranscriptStatus;
  uploaded_at: string;
  processed_at: string | null;
  uploaded_by: string;
}

export type TranscriptStatus =
  | "UPLOADED"
  | "EXTRACTING"
  | "EXTRACTED"
  | "VERIFYING"
  | "VERIFIED"
  | "FLAGGED"
  | "CLEAR"
  | "REVIEWED";

export interface TranscriptListResponse {
  items: TranscriptListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuditLog {
  id: string;
  transcript_id: string | null;
  actor_id: string;
  action_type: string;
  action_detail: string;
  outcome: string;
  timestamp: string;
  ip_address: string | null;
}

export interface Program {
  id: string;
  institution_name: string;
  program_name: string;
  accreditation_body: string;
  accreditation_type: string;
  state: string;
  is_active: boolean;
  accreditation_expires: string | null;
}

export interface ReviewRequest {
  flag_id: string;
  transcript_id: string;
  reviewer_id: string;
  decision: "CONFIRMED" | "OVERRIDDEN" | "NEEDS_MORE_INFO";
  annotation?: string;
  override_reason?: string;
}

/**
 * Form state type for the Add Program form in ProgramsPage.
 * All fields are strings because HTML inputs return string values.
 * accreditation_expires is an ISO date string or empty string.
 */
export interface ProgramForm {
  institution_name: string;
  program_name: string;
  accreditation_body: string;
  accreditation_type: string;
  state: string;
  accreditation_expires: string;
}

/** Default (empty) state for the ProgramForm. */
export const DEFAULT_PROGRAM_FORM: ProgramForm = {
  institution_name: "",
  program_name: "",
  accreditation_body: "",
  accreditation_type: "",
  state: "",
  accreditation_expires: "",
};
