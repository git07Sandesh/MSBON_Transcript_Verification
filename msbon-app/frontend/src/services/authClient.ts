import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function login(staffId: string, password: string): Promise<LoginResponse> {
  const res = await axios.post(`${BASE}/auth/login`, { staff_id: staffId, password });
  return res.data;
}
