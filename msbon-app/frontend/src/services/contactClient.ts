import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export interface ContactPayload {
  name: string;
  email: string;
  organization?: string;
  message: string;
  is_state_board: boolean;
}

export async function sendContactMessage(payload: ContactPayload): Promise<{ ok: true }> {
  const res = await axios.post(`${BASE}/contact`, payload);
  return res.data;
}
