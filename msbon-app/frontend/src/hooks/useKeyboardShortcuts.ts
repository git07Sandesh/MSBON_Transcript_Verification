/* Global keyboard shortcuts for the authenticated staff app. Mounted once
 * in App.tsx inside ProtectedLayout. Page-specific shortcuts (j/k, c/o/n)
 * are bound on the pages that own them.
 */
import { useNavigate } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";

interface Args {
  onOpenPalette: () => void;
  onOpenHelp:    () => void;
}

export function useGlobalShortcuts({ onOpenPalette, onOpenHelp }: Args) {
  const navigate = useNavigate();

  useHotkeys("mod+k, /", (e) => {
    e.preventDefault();
    onOpenPalette();
  }, { enableOnFormTags: false });

  useHotkeys("shift+/", (e) => {
    // shift+/ is the "?" key on US keyboards
    e.preventDefault();
    onOpenHelp();
  }, { enableOnFormTags: false });

  useHotkeys("g>d", () => navigate("/app/dashboard"),  { enableOnFormTags: false });
  useHotkeys("g>t", () => navigate("/app/transcripts"), { enableOnFormTags: false });
  useHotkeys("g>u", () => navigate("/app/upload"),     { enableOnFormTags: false });
  useHotkeys("g>a", () => navigate("/app/audit"),      { enableOnFormTags: false });
  useHotkeys("g>p", () => navigate("/app/programs"),   { enableOnFormTags: false });
}
