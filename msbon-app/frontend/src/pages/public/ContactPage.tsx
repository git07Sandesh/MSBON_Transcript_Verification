import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Section        from "../../components/layout/Section";
import FadeUp         from "../../components/motion/FadeUp";
import SectionLabel   from "../../components/ui/SectionLabel";
import DisplayHeading from "../../components/ui/DisplayHeading";
import CTAButton      from "../../components/ui/CTAButton";
import { sendContactMessage, type ContactPayload } from "../../services/contactClient";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError]   = useState<string>("");
  const [form, setForm]     = useState<ContactPayload>({
    name: "",
    email: "",
    organization: "",
    message: "",
    is_state_board: false,
  });

  const ids = {
    name:    useId(),
    email:   useId(),
    org:     useId(),
    message: useId(),
    board:   useId(),
    error:   useId(),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("submitting");
    try {
      await sendContactMessage(form);
      setStatus("success");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response
          ?.data?.error?.message ??
        "Something went wrong. Please try again or email the team directly.";
      setError(message);
      setStatus("error");
    }
  }

  function update<K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const isInvalid = !form.name.trim() || !form.email.trim() || !form.message.trim();

  return (
    <>
      {/* HERO -------------------------------------------------------------- */}
      <Section bg="cream" padding="xl">
        <FadeUp className="max-w-[60ch]">
          <SectionLabel>Get in touch</SectionLabel>
          <DisplayHeading as="h1" size="xl" className="mt-4">
            Tell us what you need.
          </DisplayHeading>
          <p
            className="font-display italic text-body-lg text-charcoal-muted mt-8"
            style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
          >
            We answer every message. If you're with a state board, a school of nursing,
            or a journalist working on licensure fraud, we'll prioritize your note.
          </p>
        </FadeUp>
      </Section>

      {/* FORM -------------------------------------------------------------- */}
      <Section bg="cream-dark" padding="xl" container="prose">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center py-16"
            >
              <p
                className="font-display italic text-display-md text-charcoal"
                style={{ fontVariationSettings: '"opsz" 36, "wght" 400' }}
              >
                Thank you. We'll be in touch.
              </p>
              <p className="mt-6 font-sans text-body-md text-charcoal-muted">
                Replies usually come within two business days.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-10"
              noValidate
            >
              <Field
                id={ids.name}
                label="Name"
                value={form.name}
                onChange={(v) => update("name", v)}
                required
                autoComplete="name"
              />
              <Field
                id={ids.email}
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                required
                autoComplete="email"
              />
              <Field
                id={ids.org}
                label="Organization (optional)"
                value={form.organization ?? ""}
                onChange={(v) => update("organization", v)}
                autoComplete="organization"
              />

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={ids.message}
                  className="font-sans text-label uppercase tracking-wider text-charcoal-muted"
                >
                  Message <span className="text-terracotta">·</span>
                </label>
                <textarea
                  id={ids.message}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  required
                  aria-required="true"
                  aria-describedby={status === "error" ? ids.error : undefined}
                  rows={6}
                  className="bg-transparent border-0 border-b-2 border-charcoal-faint focus:border-terracotta focus:outline-none transition-colors duration-200 py-3 font-sans text-body-md text-charcoal placeholder:text-charcoal-muted/50 resize-none"
                />
              </div>

              <label htmlFor={ids.board} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id={ids.board}
                  checked={form.is_state_board}
                  onChange={(e) => update("is_state_board", e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="flex-none mt-1 w-4 h-4 border-2 border-charcoal flex items-center justify-center peer-checked:bg-terracotta peer-checked:border-terracotta peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-terracotta transition-colors"
                >
                  {form.is_state_board && (
                    <svg viewBox="0 0 12 12" className="w-3 h-3 text-cream" fill="none">
                      <path d="M2 6.5L5 9l5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="font-sans text-body-md text-charcoal-muted group-hover:text-charcoal transition-colors">
                  I'm with a state board, school of nursing, or licensure agency.
                </span>
              </label>

              <div className="pt-4 flex flex-col gap-4">
                <CTAButton
                  type="submit"
                  loading={status === "submitting"}
                  loadingLabel="Sending…"
                  disabled={isInvalid}
                >
                  Send message
                </CTAButton>
                {status === "error" && (
                  <p
                    id={ids.error}
                    role="alert"
                    className="font-sans text-body-sm text-terracotta-dark"
                  >
                    {error}
                  </p>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </Section>
    </>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  autoComplete?: string;
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
  type = "text",
  autoComplete,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-sans text-label uppercase tracking-wider text-charcoal-muted"
      >
        {label}
        {required && <span className="text-terracotta"> ·</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-required={required}
        autoComplete={autoComplete}
        className="bg-transparent border-0 border-b-2 border-charcoal-faint focus:border-terracotta focus:outline-none transition-colors duration-200 py-3 font-sans text-body-md text-charcoal placeholder:text-charcoal-muted/50"
      />
    </div>
  );
}
