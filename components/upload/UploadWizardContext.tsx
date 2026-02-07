"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

// Storage key for localStorage
const STORAGE_KEY = "currico_upload_draft";

// Types
export type Step = 1 | 2 | 3 | 4;

export interface FormData {
  // Step 1: Basics
  title: string;
  description: string;
  language: string;
  dialect: "STANDARD" | "SWISS" | "BOTH";
  resourceType: string;

  // Step 2: Curriculum
  cycle: string;
  subject: string;
  subjectCode: string;
  canton: string;
  competencies: string[];
  lehrmittelIds: string[];

  // Step 3: Properties
  priceType: "free" | "paid";
  price: string;
  editable: boolean;
  licenseScope: string;

  // Step 4: Files (stored as metadata, actual files can't be persisted)
  fileNames: string[];
  previewFileNames: string[];

  // Legal confirmations
  legalOwnContent: boolean;
  legalNoTextbookScans: boolean;
  legalNoTrademarks: boolean;
  legalSwissGerman: boolean;
  legalTermsAccepted: boolean;
}

export interface TouchedFields {
  title: boolean;
  description: boolean;
  language: boolean;
  dialect: boolean;
  resourceType: boolean;
  cycle: boolean;
  subject: boolean;
  canton: boolean;
  competencies: boolean;
  lehrmittelIds: boolean;
  priceType: boolean;
  price: boolean;
  editable: boolean;
  files: boolean;
  previewFiles: boolean;
  legalOwnContent: boolean;
  legalNoTextbookScans: boolean;
  legalNoTrademarks: boolean;
  legalSwissGerman: boolean;
  legalTermsAccepted: boolean;
}

export interface FieldError {
  field: string;
  message: string;
}

interface DraftData {
  formData: FormData;
  currentStep: Step;
  visitedSteps: Step[];
  lastSavedAt: string;
}

interface UploadWizardContextType {
  // Form state
  formData: FormData;
  updateFormData: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  updateMultipleFields: (updates: Partial<FormData>) => void;

  // Step navigation
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  visitedSteps: Step[];
  canNavigateToStep: (step: Step) => boolean;
  goToStep: (step: Step) => void;
  goNext: () => void;
  goBack: () => void;

  // Validation
  touchedFields: TouchedFields;
  markFieldTouched: (field: keyof TouchedFields) => void;
  markStepTouched: (step: Step) => void;
  getFieldErrors: (step: Step) => FieldError[];
  isStepValid: (step: Step) => boolean;
  isStepComplete: (step: Step) => boolean;

  // Draft management
  lastSavedAt: Date | null;
  hasDraft: boolean;
  clearDraft: () => void;
  isSaving: boolean;
  serverSynced: boolean;
  serverDraftId: string | null;

  // File management (actual File objects, not persisted)
  files: File[];
  setFiles: (files: File[]) => void;
  previewFiles: File[];
  setPreviewFiles: (files: File[]) => void;
}

const defaultFormData: FormData = {
  title: "",
  description: "",
  language: "de",
  dialect: "BOTH",
  resourceType: "pdf",
  cycle: "",
  subject: "",
  subjectCode: "",
  canton: "",
  competencies: [],
  lehrmittelIds: [],
  priceType: "paid",
  price: "",
  editable: false,
  licenseScope: "individual",
  fileNames: [],
  previewFileNames: [],
  legalOwnContent: false,
  legalNoTextbookScans: false,
  legalNoTrademarks: false,
  legalSwissGerman: false,
  legalTermsAccepted: false,
};

const defaultTouchedFields: TouchedFields = {
  title: false,
  description: false,
  language: false,
  dialect: false,
  resourceType: false,
  cycle: false,
  subject: false,
  canton: false,
  competencies: false,
  lehrmittelIds: false,
  priceType: false,
  price: false,
  editable: false,
  files: false,
  previewFiles: false,
  legalOwnContent: false,
  legalNoTextbookScans: false,
  legalNoTrademarks: false,
  legalSwissGerman: false,
  legalTermsAccepted: false,
};

const UploadWizardContext = createContext<UploadWizardContextType | null>(null);

// Helper to safely load draft from localStorage
function loadDraftFromStorage(): DraftData | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load draft:", error);
  }
  return null;
}

export function UploadWizardProvider({ children }: { children: ReactNode }) {
  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated";

  // Load draft once and reuse across all useState initializers
  const [initialDraft] = useState(() => loadDraftFromStorage());

  const [formData, setFormData] = useState<FormData>(initialDraft?.formData ?? defaultFormData);
  const [currentStep, setCurrentStep] = useState<Step>(initialDraft?.currentStep ?? 1);
  const [visitedSteps, setVisitedSteps] = useState<Step[]>(initialDraft?.visitedSteps ?? [1]);
  const [touchedFields, setTouchedFields] = useState<TouchedFields>(defaultTouchedFields);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    initialDraft ? new Date(initialDraft.lastSavedAt) : null
  );
  const [hasDraft, setHasDraft] = useState(initialDraft !== null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);
  const [serverSynced, setServerSynced] = useState(false);
  const [serverDraftId, setServerDraftId] = useState<string | null>(null);
  const serverSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // File objects (can't be persisted to localStorage)
  const [files, setFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);

  // Load server draft on mount (prefer server over localStorage if newer)
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadServerDraft() {
      try {
        const response = await fetch("/api/drafts?type=material");
        if (!response.ok) return;
        const { draft: serverDraft } = await response.json();
        if (!serverDraft) return;

        setServerDraftId(serverDraft.id);

        const serverUpdated = new Date(serverDraft.updated_at);
        const localUpdated = initialDraft ? new Date(initialDraft.lastSavedAt) : null;

        // Use server draft if it's newer than local
        if (!localUpdated || serverUpdated > localUpdated) {
          const serverData = serverDraft.data as DraftData;
          if (serverData?.formData) {
            setFormData(serverData.formData);
            setCurrentStep(serverData.currentStep ?? 1);
            setVisitedSteps(serverData.visitedSteps ?? [1]);
            setLastSavedAt(serverUpdated);
            setHasDraft(true);
            setServerSynced(true);
          }
        } else {
          // Local is newer, mark as needing server sync
          setServerSynced(false);
        }
      } catch {
        // Server unavailable, localStorage fallback is already loaded
      }
    }
    loadServerDraft();
  }, [isAuthenticated, initialDraft]);

  // Save to localStorage whenever form data changes (debounced 500ms)
  useEffect(() => {
    if (!isInitialized) return;

    const timeoutId = setTimeout(() => {
      setIsSaving(true);
      try {
        const draft: DraftData = {
          formData,
          currentStep,
          visitedSteps,
          lastSavedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        setLastSavedAt(new Date());
        setHasDraft(true);
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
      setIsSaving(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, visitedSteps, isInitialized]);

  // Dual-write to server (debounced 2s, separate from localStorage)
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    if (serverSaveTimeoutRef.current) {
      clearTimeout(serverSaveTimeoutRef.current);
    }

    serverSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const draftData: DraftData = {
          formData,
          currentStep,
          visitedSteps,
          lastSavedAt: new Date().toISOString(),
        };
        const response = await fetch("/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "material", data: draftData }),
        });
        if (response.ok) {
          const { draft } = await response.json();
          setServerDraftId(draft.id);
          setServerSynced(true);
        } else {
          setServerSynced(false);
        }
      } catch {
        setServerSynced(false);
      }
    }, 2000); // 2s debounce for server

    return () => {
      if (serverSaveTimeoutRef.current) {
        clearTimeout(serverSaveTimeoutRef.current);
      }
    };
  }, [formData, currentStep, visitedSteps, isInitialized, isAuthenticated]);

  // Update form data
  const updateFormData = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateMultipleFields = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Mark field as touched (for validation display)
  const markFieldTouched = useCallback((field: keyof TouchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Mark all fields in a step as touched
  const markStepTouched = useCallback((step: Step) => {
    const stepFields: Record<Step, (keyof TouchedFields)[]> = {
      1: ["title", "description", "language", "dialect", "resourceType"],
      2: ["cycle", "subject", "canton", "competencies", "lehrmittelIds"],
      3: ["priceType", "price", "editable"],
      4: [
        "files",
        "previewFiles",
        "legalOwnContent",
        "legalNoTextbookScans",
        "legalNoTrademarks",
        "legalSwissGerman",
        "legalTermsAccepted",
      ],
    };

    setTouchedFields((prev) => {
      const updates = { ...prev };
      stepFields[step].forEach((field) => {
        updates[field] = true;
      });
      return updates;
    });
  }, []);

  // Get validation errors for a step
  const getFieldErrors = useCallback(
    (step: Step): FieldError[] => {
      const errors: FieldError[] = [];

      switch (step) {
        case 1:
          if (!formData.title.trim()) {
            errors.push({ field: "title", message: "Titel ist erforderlich" });
          } else if (formData.title.trim().length < 5) {
            errors.push({ field: "title", message: "Titel muss mindestens 5 Zeichen haben" });
          } else if (formData.title.trim().length > 100) {
            errors.push({ field: "title", message: "Titel darf maximal 100 Zeichen haben" });
          }

          if (!formData.description.trim()) {
            errors.push({ field: "description", message: "Beschreibung ist erforderlich" });
          } else if (formData.description.trim().length < 20) {
            errors.push({
              field: "description",
              message: "Beschreibung muss mindestens 20 Zeichen haben",
            });
          } else if (formData.description.trim().length > 2000) {
            errors.push({
              field: "description",
              message: "Beschreibung darf maximal 2000 Zeichen haben",
            });
          }
          break;

        case 2:
          if (!formData.cycle) {
            errors.push({ field: "cycle", message: "Zyklus ist erforderlich" });
          }
          if (!formData.subject) {
            errors.push({ field: "subject", message: "Fach ist erforderlich" });
          }
          break;

        case 3:
          if (formData.priceType === "paid") {
            if (!formData.price) {
              errors.push({ field: "price", message: "Preis ist erforderlich" });
            } else {
              const priceNum = parseFloat(formData.price);
              if (isNaN(priceNum) || priceNum < 0) {
                errors.push({ field: "price", message: "Preis muss eine positive Zahl sein" });
              } else if (priceNum > 50) {
                errors.push({ field: "price", message: "Preis darf maximal CHF 50 sein" });
              } else if (priceNum < 1 && priceNum > 0) {
                errors.push({ field: "price", message: "Mindestpreis ist CHF 1" });
              }
            }
          }
          break;

        case 4:
          if (files.length === 0) {
            errors.push({ field: "files", message: "Mindestens eine Datei ist erforderlich" });
          }
          if (!formData.legalOwnContent) {
            errors.push({
              field: "legalOwnContent",
              message: "Bitte bestätigen Sie, dass Sie eigene Inhalte verwenden",
            });
          }
          if (!formData.legalNoTextbookScans) {
            errors.push({
              field: "legalNoTextbookScans",
              message: "Bitte bestätigen Sie, dass keine Lehrmittel-Scans enthalten sind",
            });
          }
          if (!formData.legalNoTrademarks) {
            errors.push({
              field: "legalNoTrademarks",
              message: "Bitte bestätigen Sie, dass keine geschützten Marken enthalten sind",
            });
          }
          if (!formData.legalSwissGerman) {
            errors.push({
              field: "legalSwissGerman",
              message: "Bitte bestätigen Sie die Schweizer Rechtschreibung",
            });
          }
          if (!formData.legalTermsAccepted) {
            errors.push({
              field: "legalTermsAccepted",
              message: "Bitte akzeptieren Sie die Verkäufervereinbarung",
            });
          }
          break;
      }

      return errors;
    },
    [formData, files]
  );

  // Check if step is valid
  const isStepValid = useCallback(
    (step: Step): boolean => {
      return getFieldErrors(step).length === 0;
    },
    [getFieldErrors]
  );

  // Check if step is complete (all required fields filled, may still have minor issues)
  const isStepComplete = useCallback(
    (step: Step): boolean => {
      switch (step) {
        case 1:
          return formData.title.trim().length > 0 && formData.description.trim().length > 0;
        case 2:
          return formData.cycle !== "" && formData.subject !== "";
        case 3:
          return (
            formData.priceType === "free" ||
            (formData.priceType === "paid" && formData.price !== "")
          );
        case 4:
          return (
            files.length > 0 &&
            formData.legalOwnContent &&
            formData.legalNoTextbookScans &&
            formData.legalNoTrademarks &&
            formData.legalSwissGerman &&
            formData.legalTermsAccepted
          );
        default:
          return false;
      }
    },
    [formData, files]
  );

  // Navigation
  const canNavigateToStep = useCallback(
    (step: Step): boolean => {
      return visitedSteps.includes(step);
    },
    [visitedSteps]
  );

  const goToStep = useCallback(
    (step: Step) => {
      if (canNavigateToStep(step)) {
        setCurrentStep(step);
      }
    },
    [canNavigateToStep]
  );

  const goNext = useCallback(() => {
    if (currentStep < 4) {
      const nextStep = (currentStep + 1) as Step;
      markStepTouched(currentStep);
      setCurrentStep(nextStep);
      if (!visitedSteps.includes(nextStep)) {
        setVisitedSteps((prev) => [...prev, nextStep]);
      }
    }
  }, [currentStep, visitedSteps, markStepTouched]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  }, [currentStep]);

  // Clear draft (local + server)
  const clearDraft = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear local draft:", error);
    }
    // Delete server draft
    if (serverDraftId) {
      try {
        await fetch(`/api/drafts/${serverDraftId}`, { method: "DELETE" });
      } catch {
        // Server delete failed, not critical
      }
    }
    setFormData(defaultFormData);
    setCurrentStep(1);
    setVisitedSteps([1]);
    setTouchedFields(defaultTouchedFields);
    setLastSavedAt(null);
    setHasDraft(false);
    setServerSynced(false);
    setServerDraftId(null);
    setFiles([]);
    setPreviewFiles([]);
  }, [serverDraftId]);

  // Sync file names to formData for display purposes
  // This effect updates derived state when files change - valid pattern for persistence
  useEffect(() => {
    const fileNames = files.map((f) => f.name);
    const previewFileNames = previewFiles.map((f) => f.name);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({
      ...prev,
      fileNames,
      previewFileNames,
    }));
  }, [files, previewFiles]);

  const value: UploadWizardContextType = {
    formData,
    updateFormData,
    updateMultipleFields,
    currentStep,
    setCurrentStep,
    visitedSteps,
    canNavigateToStep,
    goToStep,
    goNext,
    goBack,
    touchedFields,
    markFieldTouched,
    markStepTouched,
    getFieldErrors,
    isStepValid,
    isStepComplete,
    lastSavedAt,
    hasDraft,
    clearDraft,
    isSaving,
    serverSynced,
    serverDraftId,
    files,
    setFiles,
    previewFiles,
    setPreviewFiles,
  };

  return <UploadWizardContext.Provider value={value}>{children}</UploadWizardContext.Provider>;
}

export function useUploadWizard() {
  const context = useContext(UploadWizardContext);
  if (!context) {
    throw new Error("useUploadWizard must be used within an UploadWizardProvider");
  }
  return context;
}
