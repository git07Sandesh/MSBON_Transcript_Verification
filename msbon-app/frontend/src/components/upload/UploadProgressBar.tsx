import { motion, AnimatePresence } from "framer-motion";

interface Props {
  status: "idle" | "uploading" | "processing" | "done" | "error";
  message?: string;
}

const STATUS_WIDTH: Record<string, string> = {
  uploading:  "33%",
  processing: "70%",
  done:       "100%",
  error:      "100%",
};

const STATUS_BAR: Record<string, string> = {
  uploading:  "bg-terracotta",
  processing: "bg-terracotta",
  done:       "bg-charcoal",
  error:      "bg-terracotta",
};

export default function UploadProgressBar({ status, message }: Props) {
  if (status === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-3"
      >
        <div className="w-full h-[2px] bg-charcoal-faint overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: STATUS_WIDTH[status] }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full ${STATUS_BAR[status]}`}
          />
        </div>
        {message && (
          <p
            className={`font-sans text-body-sm ${
              status === "error" ? "text-terracotta" : "text-charcoal-muted"
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
