import { create } from "zustand";
import { supabase } from "../services/supabaseClient";

interface UIState {
  staffId: string;             // user email (display label)
  setStaffId: (id: string) => void;
  token: string | null;        // Supabase access token
  setToken: (token: string | null) => void;
  role: string;                // app role from app_metadata.role
  setRole: (r: string) => void;
  logout: () => Promise<void>;
  selectedTranscriptId: string | null;
  setSelectedTranscriptId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  staffId: "",
  setStaffId: (id) => set({ staffId: id }),
  token: null,
  setToken: (token) => set({ token }),
  role: "viewer",
  setRole: (r) => set({ role: r }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ token: null, staffId: "", role: "viewer" });
  },
  selectedTranscriptId: null,
  setSelectedTranscriptId: (id) => set({ selectedTranscriptId: id }),
}));

/* Hydrate on boot from any existing Supabase session, then keep in sync. */
function applySession(session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) {
  if (!session) {
    useUIStore.setState({ token: null, staffId: "", role: "viewer" });
    return;
  }
  const role = (session.user.app_metadata?.role as string) || "viewer";
  useUIStore.setState({
    token: session.access_token,
    staffId: session.user.email || session.user.id,
    role,
  });
}

supabase.auth.getSession().then(({ data }) => applySession(data.session));
supabase.auth.onAuthStateChange((_event, session) => applySession(session));
