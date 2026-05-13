import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import type { Program, ProgramForm } from "../types";
import { DEFAULT_PROGRAM_FORM } from "../types";
import Section from "../components/layout/Section";
import SectionLabel from "../components/ui/SectionLabel";
import DisplayHeading from "../components/ui/DisplayHeading";
import CTAButton from "../components/ui/CTAButton";
import SeverityBadge from "../components/ui/SeverityBadge";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

async function fetchPrograms(): Promise<Program[]> {
  const res = await axios.get(`${BASE}/programs`);
  return res.data;
}

async function addProgram(body: Omit<Program, "id" | "is_active">): Promise<Program> {
  const res = await axios.post(`${BASE}/programs`, body);
  return res.data;
}

export default function ProgramsPage() {
  const qc = useQueryClient();
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: fetchPrograms,
  });

  const [form, setForm] = useState<ProgramForm>(DEFAULT_PROGRAM_FORM);
  const [showForm, setShowForm] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      addProgram({
        ...form,
        accreditation_expires: form.accreditation_expires || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      setShowForm(false);
      setForm(DEFAULT_PROGRAM_FORM);
    },
  });

  return (
    <Section bg="cream" padding="lg" container="wide">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-3">
          <SectionLabel>Catalog</SectionLabel>
          <DisplayHeading as="h1" size="lg">
            Accredited programs.
          </DisplayHeading>
          <p className="font-sans text-body-md text-charcoal-muted max-w-[55ch]">
            The Mississippi nursing programs the accreditation rules query against.
            Adding a program here makes it available to ACCR-001 immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className={`px-6 py-3 border font-sans text-label uppercase tracking-wider transition-colors duration-200 min-h-[44px]
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta
            ${showForm
              ? "bg-cream text-charcoal border-charcoal-faint hover:border-terracotta hover:text-terracotta"
              : "bg-terracotta text-cream border-terracotta hover:bg-terracotta-dark"
            }`}
        >
          {showForm ? "Cancel" : "Add program"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden mb-12"
          >
            <div className="border border-charcoal-faint bg-cream-dark p-8 md:p-12">
              <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-2">
                New program
              </p>
              <DisplayHeading as="h2" size="md" className="mb-10">
                Add to catalog.
              </DisplayHeading>

              <div className="flex flex-col gap-10">
                <fieldset className="flex flex-col gap-8">
                  <legend className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-4">
                    Institution
                  </legend>
                  <div className="grid md:grid-cols-2 gap-8">
                    <Field
                      label="Institution name"
                      value={form.institution_name}
                      onChange={(v) => setForm({ ...form, institution_name: v })}
                    />
                    <Field
                      label="Program name"
                      value={form.program_name}
                      onChange={(v) => setForm({ ...form, program_name: v })}
                    />
                    <Field
                      label="State"
                      value={form.state}
                      onChange={(v) => setForm({ ...form, state: v })}
                      placeholder="MS"
                    />
                    <Field
                      label="Accreditation type"
                      value={form.accreditation_type}
                      onChange={(v) => setForm({ ...form, accreditation_type: v })}
                      placeholder="Baccalaureate"
                    />
                  </div>
                </fieldset>

                <fieldset className="flex flex-col gap-8">
                  <legend className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-4">
                    Accreditation
                  </legend>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
                        Accrediting body
                      </label>
                      <select
                        value={form.accreditation_body}
                        onChange={(e) => setForm({ ...form, accreditation_body: e.target.value })}
                        className="bg-transparent border-0 border-b-2 border-charcoal-faint focus:border-terracotta focus:outline-none transition-colors duration-200 py-3 font-sans text-body-md text-charcoal"
                      >
                        <option value="">Select…</option>
                        <option value="ACEN">ACEN</option>
                        <option value="CCNE">CCNE</option>
                        <option value="STATE">STATE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                    <Field
                      label="Expires (optional)"
                      type="date"
                      value={form.accreditation_expires}
                      onChange={(v) => setForm({ ...form, accreditation_expires: v })}
                    />
                  </div>
                </fieldset>

                <div className="pt-4">
                  <CTAButton
                    type="button"
                    onClick={() => mutation.mutate()}
                    loading={mutation.isPending}
                    loadingLabel="Saving…"
                    disabled={!form.institution_name || !form.accreditation_body}
                  >
                    Save program
                  </CTAButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-charcoal-faint border-t-terracotta rounded-full"
          />
        </div>
      ) : programs.length === 0 ? (
        <p className="py-20 text-center font-display italic text-display-md text-charcoal-muted" style={{ fontVariationSettings: '"opsz" 36, "wght" 300' }}>
          No programs in the catalog yet.
        </p>
      ) : (
        <div className="border-t border-b border-charcoal-faint">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-faint">
                <th className="text-left py-4 pr-4 font-sans text-label uppercase tracking-wider text-charcoal-muted font-medium">
                  Institution
                </th>
                <th className="text-left py-4 px-4 font-sans text-label uppercase tracking-wider text-charcoal-muted font-medium">
                  Program
                </th>
                <th className="text-left py-4 px-4 font-sans text-label uppercase tracking-wider text-charcoal-muted font-medium">
                  Accreditor
                </th>
                <th className="text-left py-4 px-4 font-sans text-label uppercase tracking-wider text-charcoal-muted font-medium hidden md:table-cell">
                  State
                </th>
                <th className="text-left py-4 px-4 font-sans text-label uppercase tracking-wider text-charcoal-muted font-medium hidden lg:table-cell">
                  Expires
                </th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-charcoal-faint last:border-b-0"
                >
                  <td className="py-5 pr-4 font-display text-body-md text-charcoal" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                    {p.institution_name}
                  </td>
                  <td className="py-5 px-4 font-sans text-body-md text-charcoal-muted">
                    {p.program_name}
                  </td>
                  <td className="py-5 px-4">
                    <SeverityBadge
                      label={p.accreditation_body}
                      tone={p.accreditation_body === "ACEN" || p.accreditation_body === "CCNE" ? "neutral" : "alert"}
                    />
                  </td>
                  <td className="py-5 px-4 hidden md:table-cell font-sans text-body-md text-charcoal-muted">
                    {p.state}
                  </td>
                  <td className="py-5 px-4 hidden lg:table-cell font-sans text-body-sm text-charcoal-muted">
                    {p.accreditation_expires || "—"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}

function Field({ label, value, onChange, type = "text", placeholder }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent border-0 border-b-2 border-charcoal-faint focus:border-terracotta focus:outline-none transition-colors duration-200 py-3 font-sans text-body-md text-charcoal placeholder:text-charcoal-muted/50"
      />
    </div>
  );
}
