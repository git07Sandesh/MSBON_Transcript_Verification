import axios from "axios";
import { supabase } from "./supabaseClient";

/* Attach the live Supabase access token to every outbound request.
 * supabase-js auto-refreshes near expiry, so getSession() stays fresh. */
axios.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* On a 401 from the API, force a sign-out so the app falls back to login.
 * Avoids a stale-token loop. */
axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await supabase.auth.signOut();
    }
    return Promise.reject(err);
  }
);
