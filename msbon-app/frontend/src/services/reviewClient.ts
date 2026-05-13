import axios from "axios";
import type { Review, ReviewRequest } from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function submitReview(
  payload: ReviewRequest,
  _staffId: string
): Promise<Review> {
  // Auth + reviewer identity come from the JWT via the axios interceptor.
  const res = await axios.post(`${BASE}/reviews`, payload);
  return res.data;
}

export async function getReviews(transcriptId: string): Promise<Review[]> {
  const res = await axios.get(`${BASE}/reviews/${transcriptId}`);
  return res.data;
}
