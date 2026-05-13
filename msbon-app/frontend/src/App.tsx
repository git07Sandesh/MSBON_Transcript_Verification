import "./services/axiosSetup";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useUIStore } from "./store/uiStore";

import PublicHeader from "./components/layout/PublicHeader";
import PublicFooter from "./components/layout/PublicFooter";
import AppShell from "./components/layout/AppShell";
import CommandPalette from "./components/cmdk/CommandPalette";
import ShortcutsHelp from "./components/cmdk/ShortcutsHelp";
import { useGlobalShortcuts } from "./hooks/useKeyboardShortcuts";

import HomePage        from "./pages/public/HomePage";
import ImpactPage      from "./pages/public/ImpactPage";
import HowItWorksPage  from "./pages/public/HowItWorksPage";
import ContactPage     from "./pages/public/ContactPage";
import GlossaryPage    from "./pages/public/GlossaryPage";

import LoginPage          from "./pages/LoginPage";
import UploadPage         from "./pages/UploadPage";
import TranscriptListPage from "./pages/TranscriptListPage";
import VerificationPage   from "./pages/VerificationPage";
import AuditLogPage       from "./pages/AuditLogPage";
import ProgramsPage       from "./pages/ProgramsPage";
import DashboardPage      from "./pages/DashboardPage";
import ComparePage        from "./pages/ComparePage";

const queryClient = new QueryClient();

/* Animate page transitions everywhere — public and authenticated. */
function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>
    </AnimatePresence>
  );
}

/* Public marketing layout: header + animated content + footer. */
function PublicLayout() {
  return (
    <>
      <PublicHeader />
      <AnimatedOutlet />
      <PublicFooter />
    </>
  );
}

/* Authenticated staff layout: gates routes on JWT presence and mounts the
 * global command palette + shortcuts help. */
function ProtectedLayout() {
  const token    = useUIStore((s) => s.token);
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen,    setHelpOpen]    = useState(false);

  useGlobalShortcuts({
    onOpenPalette: () => setPaletteOpen(true),
    onOpenHelp:    () => setHelpOpen((v) => !v),
  });

  if (!token) {
    return <Navigate to="/app/login" replace state={{ from: location }} />;
  }
  return (
    <AppShell onOpenPalette={() => setPaletteOpen(true)}>
      <AnimatedOutlet />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ShortcutsHelp  open={helpOpen}    onClose={() => setHelpOpen(false)} />
    </AppShell>
  );
}

/* Login route renders bare (no AppShell) — and bounces to /app/dashboard
 * if a token already exists. */
function LoginRoute() {
  const token = useUIStore((s) => s.token);
  if (token) return <Navigate to="/app/dashboard" replace />;
  return <LoginPage />;
}

/* Scroll to top on every route change. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route path="/"              element={<HomePage />} />
            <Route path="/impact"        element={<ImpactPage />} />
            <Route path="/how-it-works"  element={<HowItWorksPage />} />
            <Route path="/contact"       element={<ContactPage />} />
            <Route path="/glossary"      element={<GlossaryPage />} />
          </Route>

          {/* Bare login (no app chrome) */}
          <Route path="/app/login" element={<LoginRoute />} />

          {/* Authenticated staff app */}
          <Route element={<ProtectedLayout />}>
            <Route path="/app"                       element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/app/dashboard"             element={<DashboardPage />} />
            <Route path="/app/upload"                element={<UploadPage />} />
            <Route path="/app/transcripts"           element={<TranscriptListPage />} />
            <Route path="/app/transcripts/:id"       element={<VerificationPage />} />
            <Route path="/app/audit"                 element={<AuditLogPage />} />
            <Route path="/app/audit/:id"             element={<AuditLogPage />} />
            <Route path="/app/programs"              element={<ProgramsPage />} />
            <Route path="/app/compare"               element={<ComparePage />} />
          </Route>

          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
