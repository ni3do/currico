"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useUploadWizard, Step } from "./UploadWizardContext";
import { FileText, BookOpen, Tag, Upload, Check, AlertTriangle } from "lucide-react";

interface StepConfig {
  step: Step;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export function StepNavigationBar() {
  const { currentStep, goToStep, canNavigateToStep, isStepValid, isStepComplete, getFieldErrors } =
    useUploadWizard();
  const tSteps = useTranslations("uploadWizard.steps");
  const tValidation = useTranslations("uploadWizard.validation");

  const steps: StepConfig[] = useMemo(
    () => [
      {
        step: 1 as Step,
        label: tSteps("basics"),
        shortLabel: tSteps("basicsShort"),
        icon: FileText,
        description: tSteps("basicsDescription"),
      },
      {
        step: 2 as Step,
        label: tSteps("curriculum"),
        shortLabel: tSteps("curriculumShort"),
        icon: BookOpen,
        description: tSteps("curriculumDescription"),
      },
      {
        step: 3 as Step,
        label: tSteps("price"),
        shortLabel: tSteps("priceShort"),
        icon: Tag,
        description: tSteps("priceDescription"),
      },
      {
        step: 4 as Step,
        label: tSteps("files"),
        shortLabel: tSteps("filesShort"),
        icon: Upload,
        description: tSteps("filesDescription"),
      },
    ],
    [tSteps]
  );

  return (
    <div className="mb-8">
      {/* Desktop Navigation */}
      <div className="hidden sm:block">
        <nav className="flex items-center justify-center" aria-label={tSteps("navLabel")}>
          {steps.map((stepConfig, index) => {
            const { step, label, icon: Icon, description } = stepConfig;
            const isCurrent = step === currentStep;
            const isVisited = canNavigateToStep(step);
            const isComplete = isStepComplete(step);
            const isValid = isStepValid(step);
            const errors = getFieldErrors(step);
            const hasWarning = isVisited && !isValid && errors.length > 0;

            return (
              <div key={step} className="flex items-center">
                {/* Step Button */}
                <div className="group relative flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => isVisited && goToStep(step)}
                    disabled={!isVisited}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      hasWarning
                        ? "border-warning bg-warning text-text-on-accent hover:shadow-warning/30 cursor-pointer hover:scale-105 hover:shadow-lg"
                        : isComplete && isValid
                          ? "border-success bg-success text-text-on-accent hover:shadow-success/30 cursor-pointer hover:scale-105 hover:shadow-lg"
                          : isCurrent
                            ? "border-primary bg-primary text-text-on-accent shadow-primary/30 ring-primary/20 scale-110 shadow-lg ring-4"
                            : isVisited
                              ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                              : "border-border bg-surface text-text-muted cursor-not-allowed"
                    } `}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`${label}${hasWarning ? ` (${tSteps("incomplete")})` : isComplete ? ` (${tSteps("complete")})` : ""}`}
                  >
                    {hasWarning ? (
                      <AlertTriangle className="h-6 w-6" />
                    ) : isComplete && isValid ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </button>

                  {/* Step Label */}
                  <span
                    className={`mt-2 text-center text-xs font-medium transition-colors ${
                      hasWarning
                        ? "text-warning"
                        : isComplete && isValid
                          ? "text-success"
                          : isCurrent
                            ? "text-primary font-semibold"
                            : isVisited
                              ? "text-text"
                              : "text-text-muted"
                    } `}
                  >
                    {label}
                  </span>

                  {/* Tooltip with errors */}
                  {isVisited && (
                    <div
                      className={`pointer-events-none absolute -bottom-2 left-1/2 z-50 w-64 -translate-x-1/2 translate-y-full rounded-xl border p-3 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 ${hasWarning ? "border-warning/50 bg-surface" : "border-border bg-surface-elevated"} `}
                    >
                      <div className="text-sm">
                        <div className="text-text mb-1 font-medium">{description}</div>
                        {errors.length > 0 ? (
                          <ul className="space-y-1">
                            {errors.slice(0, 3).map((error, i) => (
                              <li key={i} className="text-warning flex items-start gap-1.5 text-xs">
                                <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                {error.message}
                              </li>
                            ))}
                            {errors.length > 3 && (
                              <li className="text-text-muted text-xs">
                                {tValidation("moreErrors", { count: errors.length - 3 })}
                              </li>
                            )}
                          </ul>
                        ) : (
                          <div className="text-success flex items-center gap-1.5 text-xs">
                            <Check className="h-3 w-3" />
                            {tValidation("allComplete")}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="bg-border relative mx-4 h-1 w-16 overflow-hidden rounded-full lg:w-24">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                        step < currentStep
                          ? hasWarning
                            ? "from-warning to-warning w-full bg-gradient-to-r"
                            : "from-success to-success w-full bg-gradient-to-r"
                          : step === currentStep
                            ? "from-primary to-primary/50 w-1/2 bg-gradient-to-r"
                            : "w-0"
                      } `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between px-2">
          {steps.map((stepConfig) => {
            const { step, shortLabel, icon: Icon } = stepConfig;
            const isCurrent = step === currentStep;
            const isVisited = canNavigateToStep(step);
            const isComplete = isStepComplete(step);
            const isValid = isStepValid(step);
            const hasWarning = isVisited && !isValid;

            return (
              <button
                key={step}
                type="button"
                onClick={() => isVisited && goToStep(step)}
                disabled={!isVisited}
                className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 transition-all ${
                  isCurrent ? "bg-primary/10" : isVisited ? "hover:bg-surface-elevated" : ""
                } `}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    hasWarning
                      ? "border-warning bg-warning text-text-on-accent"
                      : isComplete && isValid
                        ? "border-success bg-success text-text-on-accent"
                        : isCurrent
                          ? "border-primary bg-primary text-text-on-accent"
                          : isVisited
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border bg-surface text-text-muted"
                  } `}
                >
                  {hasWarning ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : isComplete && isValid ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    hasWarning
                      ? "text-warning"
                      : isCurrent
                        ? "text-primary"
                        : isVisited
                          ? "text-text"
                          : "text-text-muted"
                  } `}
                >
                  {shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Step Indicator */}
        <div className="mt-3 text-center">
          <span className="text-text-muted text-sm">
            {tSteps("progress", { current: currentStep, total: 4 })}
            {currentStep === 4 && ` – ${tSteps("almostDone")}`}
          </span>
        </div>
      </div>
    </div>
  );
}
