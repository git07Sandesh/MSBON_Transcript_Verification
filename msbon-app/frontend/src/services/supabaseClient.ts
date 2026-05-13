/* The browser-side Supabase client. Anon key is safe to expose; the
 * service-role key never reaches this bundle. Auth state is persisted in
 * localStorage by default; the app listens to onAuthStateChange in
 * uiStore.ts to react to sign-in/sign-out.
 */
import { createClient } from "@supabase/supabase-js";

const url     = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
    "Create frontend/.env.local with those two values."
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
