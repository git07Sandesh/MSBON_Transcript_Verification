import { NavLink, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useUIStore } from "../../store/uiStore";

const NAV = [
  { to: "/app/dashboard",   label: "Dashboard" },
  { to: "/app/upload",      label: "Upload" },
  { to: "/app/transcripts", label: "Transcripts" },
  { to: "/app/audit",       label: "Audit" },
  { to: "/app/programs",    label: "Programs" },
];

interface AppShellProps {
  children: ReactNode;
  onOpenPalette?: () => void;
}

export default function AppShell({ children, onOpenPalette }: AppShellProps) {
  const logout  = useUIStore((s) => s.logout);
  const staffId = useUIStore((s) => s.staffId);
  const { pathname } = useLocation();

  return (
    <>
      <nav className="bg-cream border-b border-charcoal-faint sticky top-0 z-40">
        <div className="container-editorial flex items-center h-16 md:h-20 gap-8">
          <Link
            to="/app/transcripts"
            className="font-display text-body-md text-charcoal hover:text-terracotta transition-colors"
            style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
          >
            MSBON&nbsp;<span className="text-charcoal-muted">·</span>&nbsp;Verification
          </Link>

          <div className="hidden md:flex items-center gap-7 ml-4">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative font-sans text-label uppercase tracking-wider transition-colors duration-200 py-2 ${
                    active ? "text-terracotta" : "text-charcoal hover:text-terracotta"
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="app-nav-indicator"
                      className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-terracotta"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-5">
            {onOpenPalette && (
              <button
                type="button"
                onClick={onOpenPalette}
                aria-label="Open command palette (Cmd-K)"
                className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 border border-charcoal-faint hover:border-terracotta hover:text-terracotta text-charcoal-muted transition-colors min-h-[36px]"
              >
                <span className="font-sans text-body-sm">Search…</span>
                <kbd className="font-sans text-body-sm tracking-tight">⌘K</kbd>
              </button>
            )}
            <Link
              to="/"
              className="hidden md:inline-block font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta transition-colors"
            >
              Public site
            </Link>
            <span className="font-sans text-body-sm text-charcoal-muted">
              {staffId || "—"}
            </span>
            <button
              onClick={logout}
              className="font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta transition-colors min-h-[44px] flex items-center"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {children}
    </>
  );
}
