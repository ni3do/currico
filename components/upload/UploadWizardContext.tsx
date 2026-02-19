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
import { useTranslations } from "next-intl";
import { saveDraftFiles, loadDraftFiles, clearDraftFiles } from "@/lib/utils/draft-file-storage";
import { SONSTIGE_CODE } from "@/lib/validations/material";

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
  tags: string[];

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

  // File management (actual File objects, persisted via IndexedDB)
  files: File[];
  setFiles: (files: File[]) => void;
  previewFiles: File[];
  setPreviewFiles: (files: File[]) => void;
  filesRestored: boolean;
}

const defaultFormData: FormData = {
  title: "",
  description: "",
  language: "de",
  dialect: "BOTH",
  resourceType: "pdf",
  tags: [],
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
  const tValidation = useTranslations("uploadWizard.validation");
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

  // File objects (persisted via IndexedDB)
  const [files, setFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [filesRestored, setFilesRestored] = useState(false);
  const filesLoadedRef = useRef(false);

  // Load draft files from IndexedDB on mount
  useEffect(() => {
    if (filesLoadedRef.current || !initialDraft) return;
    filesLoadedRef.current = true;

    (async () => {
      try {
        const [mainFiles, prevFiles] = await Promise.all([
          loadDraftFiles("main_files"),
          loadDraftFiles("preview_files"),
        ]);
        if (mainFiles.length > 0) {
          setFiles(mainFiles);
          setFilesRestored(true);
        }
        if (prevFiles.length > 0) {
          setPreviewFiles(prevFiles);
        }
      } catch (error) {
        console.error("Failed to restore draft files:", error);
      }
    })();
  }, [initialDraft]);

  // Save files to IndexedDB when they change (1000ms debounce)
  useEffect(() => {
    // Skip the initial empty-files state before restoration
    if (!filesLoadedRef.current) return;

    const timeoutId = setTimeout(() => {
      saveDraftFiles("main_files", files);
      saveDraftFiles("preview_files", previewFiles);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [files, previewFiles]);

  // Save to localStorage whenever form data changes (debounced 500ms)
  useEffect(() => {
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
  }, [formData, currentStep, visitedSteps]);

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
            errors.push({ field: "title", message: tValidation("titleRequired") });
          } else if (formData.title.trim().length < 5) {
            errors.push({ field: "title", message: tValidation("titleMinLength") });
          } else if (formData.title.trim().length > 64) {
            errors.push({ field: "title", message: tValidation("titleMaxLength") });
          }

          if (!formData.description.trim()) {
            errors.push({ field: "description", message: tValidation("descriptionRequired") });
          } else if (formData.description.trim().length < 20) {
            errors.push({
              field: "description",
              message: tValidation("descriptionMinLength"),
            });
          } else if (formData.description.trim().length > 2000) {
            errors.push({
              field: "description",
              message: tValidation("descriptionMaxLength"),
            });
          }
          break;

        case 2: {
          const isSonstige = formData.subjectCode === SONSTIGE_CODE;
          if (!isSonstige && !formData.cycle) {
            errors.push({ field: "cycle", message: tValidation("cycleRequired") });
          }
          if (!formData.subject) {
            errors.push({ field: "subject", message: tValidation("subjectRequired") });
          }
          if (formData.competencies.length > 5) {
            errors.push({ field: "competencies", message: tValidation("competenciesMax") });
          }
          break;
        }

        case 3:
          if (formData.priceType === "paid") {
            if (!formData.price) {
              errors.push({ field: "price", message: tValidation("priceRequired") });
            } else {
              const priceNum = parseFloat(formData.price);
              if (isNaN(priceNum) || priceNum < 0) {
                errors.push({ field: "price", message: tValidation("pricePositive") });
              } else if (priceNum > 50) {
                errors.push({ field: "price", message: tValidation("priceMax") });
              } else if (priceNum > 0 && priceNum < 0.5) {
                errors.push({ field: "price", message: tValidation("priceMin") });
              } else if (Math.round(priceNum * 100) % 50 !== 0) {
                errors.push({
                  field: "price",
                  message: tValidation("priceStep"),
                });
              }
            }
          }
          break;

        case 4:
          if (files.length === 0) {
            errors.push({ field: "files", message: tValidation("fileRequired") });
          }
          if (!formData.legalOwnContent) {
            errors.push({
              field: "legalOwnContent",
              message: tValidation("legalOwnContent"),
            });
          }
          if (!formData.legalNoTextbookScans) {
            errors.push({
              field: "legalNoTextbookScans",
              message: tValidation("legalNoScans"),
            });
          }
          if (!formData.legalNoTrademarks) {
            errors.push({
              field: "legalNoTrademarks",
              message: tValidation("legalNoTrademarks"),
            });
          }
          if (!formData.legalSwissGerman) {
            errors.push({
              field: "legalSwissGerman",
              message: tValidation("legalSwissGerman"),
            });
          }
          if (!formData.legalTermsAccepted) {
            errors.push({
              field: "legalTermsAccepted",
              message: tValidation("legalTerms"),
            });
          }
          break;
      }

      return errors;
    },
    [formData, files, tValidation]
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
          if (formData.subjectCode === SONSTIGE_CODE) return formData.subject !== "";
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

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear local draft:", error);
    }
    clearDraftFiles();
    setFormData(defaultFormData);
    setCurrentStep(1);
    setVisitedSteps([1]);
    setTouchedFields(defaultTouchedFields);
    setLastSavedAt(null);
    setHasDraft(false);
    setFiles([]);
    setPreviewFiles([]);
    setFilesRestored(false);
  }, []);

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
    files,
    setFiles,
    previewFiles,
    setPreviewFiles,
    filesRestored,
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
