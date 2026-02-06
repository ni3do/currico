"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-error/30 bg-error/10 text-error",
  warning: "border-warning/30 bg-warning/10 text-warning",
  info: "border-primary/30 bg-primary/10 text-primary",
};

const AUTO_DISMISS_MS: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 7000,
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(AUTO_DISMISS_MS[toast.type]);
  const startTimeRef = useRef(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(toast.id), remainingRef.current);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onDismiss]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    remainingRef.current = Math.max(
      remainingRef.current - (Date.now() - startTimeRef.current),
      1000
    );
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(toast.id), remainingRef.current);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${STYLES[toast.type]}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="text-text text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-text-muted hover:text-text ml-2 flex-shrink-0 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Container - top-right on desktop, bottom-center on mobile */}
      <div className="pointer-events-none fixed top-4 right-4 z-[200] hidden flex-col gap-2 sm:flex">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
      <div className="pointer-events-none fixed right-4 bottom-4 left-4 z-[200] flex flex-col items-center gap-2 sm:hidden">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
