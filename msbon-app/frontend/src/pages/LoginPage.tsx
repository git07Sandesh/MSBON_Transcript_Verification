import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import DisplayHeading from "../components/ui/DisplayHeading";
import SectionLabel from "../components/ui/SectionLabel";
import CTAButton from "../components/ui/CTAButton";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // App.tsx redirects to /app/dashboard once the auth-state listener
      // fires and the token lands in the zustand store.
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || "Sign-in failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <header className="container-editorial flex items-center justify-between py-6">
        <Link
          to="/"
          className="font-display text-body-md text-charcoal hover:text-terracotta transition-colors"
          style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
        >
          MSBON&nbsp;<span className="text-charcoal-muted">·</span>&nbsp;Verification
        </Link>
        <Link
          to="/"
          className="font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta transition-colors"
        >
          Back to site
        </Link>
      </header>

      <div className="flex-1 flex items-center">
        <div className="container-prose w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-10"
          >
            <div>
              <SectionLabel>Staff sign-in</SectionLabel>
              <DisplayHeading as="h1" size="lg" className="mt-4">
                Sign in to continue.
              </DisplayHeading>
              <p
                className="font-display italic text-body-lg text-charcoal-muted mt-6"
                style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
              >
                For authorized MSBON reviewers, administrators, and compliance auditors.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="font-sans text-label uppercase tracking-wider text-charcoal-muted"
                >
                  Email <span className="text-terracotta">·</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                  aria-required="true"
                  autoComplete="email"
                  placeholder="admin@msbon.local"
                  className="bg-transparent border-0 border-b-2 border-charcoal-faint focus:border-terracotta focus:outline-none transition-colors duration-200 py-3 font-sans text-body-md text-charcoal placeholder:text-charcoal-muted/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="font-sans text-label uppercase tracking-wider text-charcoal-muted"
                >
                  Password <span className="text-terracotta">·</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required="true"
                  autoComplete="current-password"
                  placeholder="demo"
                  className="bg-transparent border-0 border-b-2 border-charcoal-faint focus:border-terracotta focus:outline-none transition-colors duration-200 py-3 font-sans text-body-md text-charcoal placeholder:text-charcoal-muted/50"
                />
              </div>

              {error && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-sans text-body-sm text-terracotta-dark"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex flex-col gap-6">
                <CTAButton
                  type="submit"
                  disabled={!email || !password}
                  loading={loading}
                  loadingLabel="Signing in…"
                >
                  Sign in
                </CTAButton>
                <p className="font-sans text-body-sm text-charcoal-muted">
                  Demo accounts: <code className="font-display italic">admin@msbon.local</code> · <code className="font-display italic">reviewer1@msbon.local</code> · <code className="font-display italic">viewer1@msbon.local</code> · all use password <code className="font-display italic">demo</code>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
