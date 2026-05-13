import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export interface PublicInsights {
  transcripts_total: number;
  flags_total: number;
  reviews_total: number;
  overrides_total: number;
  rules_active: number;
  accredited_programs: number;
  days_running: number;
}

export interface RuleCount       { rule_id: string;  count: number }
export interface StatusCount     { status: string;   count: number }
export interface DecisionCount   { decision: string; count: number }
export interface DailyCount      { date: string;     count: number }
export interface RecentAction {
  timestamp: string;
  actor_id: string;
  action_type: string;
  transcript_id: string | null;
  outcome: string;
}

export interface FullInsights {
  public:                  PublicInsights;
  transcript_status:       StatusCount[];
  top_firing_rules:        RuleCount[];
  decision_breakdown:      DecisionCount[];
  decisions_last_14_days:  DailyCount[];
  recent_actions:          RecentAction[];
}

export async function fetchPublicInsights(): Promise<PublicInsights> {
  const res = await axios.get(`${BASE}/insights/public`);
  return res.data;
}

export async function fetchFullInsights(): Promise<FullInsights> {
  const res = await axios.get(`${BASE}/insights/summary`);
  return res.data;
}
