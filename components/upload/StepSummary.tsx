"use client";

import { useTranslations } from "next-intl";
import { useUploadWizard, Step } from "./UploadWizardContext";
import {
  FileText,
  BookOpen,
  Tag,
  Upload,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Edit2,
} from "lucide-react";
import { useState } from "react";

interface StepSummaryItemProps {
  step: Step;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
}

function StepSummaryItem({ step, title, icon: Icon, isOpen, onToggle }: StepSummaryItemProps) {
  const tCommon = useTranslations("common");
  const tSummary = useTranslations("uploadWizard.summary");
  const tFields = useTranslations("uploadWizard.fields");
  const { formData, files, goToStep, isStepComplete, isStepValid, getFieldErrors, visitedSteps } =
    useUploadWizard();

  const isVisited = visitedSteps.includes(step);
  const isComplete = isStepComplete(step);
  const isValid = isStepValid(step);
  const errors = getFieldErrors(step);
  const hasWarning = isVisited && !isValid && errors.length > 0;

  // Get summary content for each step
  const getSummaryContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-2 text-sm">
            {formData.title ? (
              <div className="flex items-start gap-2">
                <span className="text-text-muted w-24 flex-shrink-0">{tSummary("labelTitle")}</span>
                <span className="text-text truncate font-medium">{formData.title}</span>
              </div>
            ) : (
              <div className="text-text-muted italic">{tSummary("noTitle")}</div>
            )}
            {formData.description ? (
              <div className="flex items-start gap-2">
                <span className="text-text-muted w-24 flex-shrink-0">
                  {tSummary("labelDescription")}
                </span>
                <span className="text-text line-clamp-2">{formData.description}</span>
              </div>
            ) : null}
            <div className="text-text-muted flex items-center gap-4 text-xs">
              <span>
                {tSummary("labelLanguage")} {formData.language.toUpperCase()}
              </span>
              <span>
                {tSummary("labelType")} {formData.resourceType.toUpperCase()}
              </span>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-2 text-sm">
            {formData.cycle ? (
              <div className="flex items-center gap-2">
                <span className="text-text-muted w-24 flex-shrink-0">{tSummary("labelCycle")}</span>
                <span className="text-text font-medium">
                  {tSummary("cycleValue", { cycle: formData.cycle })}
                </span>
              </div>
            ) : (
              <div className="text-text-muted italic">{tSummary("noCycle")}</div>
            )}
            {formData.subject ? (
              <div className="flex items-center gap-2">
                <span className="text-text-muted w-24 flex-shrink-0">
                  {tSummary("labelSubject")}
                </span>
                <span className="text-text font-medium">{formData.subject}</span>
              </div>
            ) : null}
            {formData.competencies.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-text-muted w-24 flex-shrink-0">
                  {tSummary("labelCompetencies")}
                </span>
                <div className="flex flex-wrap gap-1">
                  {formData.competencies.slice(0, 3).map((code) => (
                    <span
                      key={code}
                      className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium"
                    >
                      {code}
                    </span>
                  ))}
                  {formData.competencies.length > 3 && (
                    <span className="text-text-muted text-xs">
                      {tSummary("moreItems", { count: formData.competencies.length - 3 })}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text-muted w-24 flex-shrink-0">
                {tSummary("labelPriceType")}
              </span>
              <span className="text-text font-medium">
                {formData.priceType === "free" ? tFields("priceFree") : tFields("pricePaid")}
              </span>
            </div>
            {formData.priceType === "paid" && formData.price && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted w-24 flex-shrink-0">{tSummary("labelPrice")}</span>
                <span className="text-text font-medium">CHF {formData.price}</span>
              </div>
            )}
            {formData.editable && (
              <div className="text-text-muted text-xs">{tSummary("editableNote")}</div>
            )}
          </div>
        );

      case 4:
        const legalCount = [
          formData.legalOwnContent,
          formData.legalNoTextbookScans,
          formData.legalNoTrademarks,
          formData.legalSwissGerman,
          formData.legalTermsAccepted,
        ].filter(Boolean).length;

        return (
          <div className="space-y-2 text-sm">
            {files.length > 0 ? (
              <div className="flex items-start gap-2">
                <span className="text-text-muted w-24 flex-shrink-0">{tSummary("labelFiles")}</span>
                <div className="space-y-1">
                  {files.slice(0, 2).map((file, i) => (
                    <div key={i} className="text-text max-w-[200px] truncate">
                      {file.name}
                    </div>
                  ))}
                  {files.length > 2 && (
                    <span className="text-text-muted text-xs">
                      {tSummary("moreItems", { count: files.length - 2 })}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-text-muted italic">{tSummary("noFiles")}</div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-text-muted w-24 flex-shrink-0">{tSummary("labelLegal")}</span>
              <span className={legalCount === 5 ? "text-success" : "text-warning"}>
                {tSummary("legalStatus", { count: legalCount })}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isVisited) {
    return (
      <div className="border-border bg-surface rounded-xl border p-4 opacity-50">
        <div className="flex items-center gap-3">
          <div className="bg-border flex h-8 w-8 items-center justify-center rounded-full">
            <Icon className="text-text-muted h-4 w-4" />
          </div>
          <span className="text-text-muted font-medium">{title}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border transition-all ${
        hasWarning
          ? "border-warning/50 bg-warning/5"
          : isComplete && isValid
            ? "border-success/50 bg-success/5"
            : "border-border bg-surface"
      } `}
    >
      {/* Header */}
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 p-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            hasWarning
              ? "bg-warning text-text-on-accent"
              : isComplete && isValid
                ? "bg-success text-text-on-accent"
                : "bg-primary/10 text-primary"
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
        <span className="text-text flex-1 text-left font-medium">{title}</span>
        {isOpen ? (
          <ChevronUp className="text-text-muted h-5 w-5" />
        ) : (
          <ChevronDown className="text-text-muted h-5 w-5" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-border border-t px-4 pt-3 pb-4">
          {getSummaryContent()}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-3 space-y-1">
              {errors.map((error, i) => (
                <div key={i} className="text-warning flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  {error.message}
                </div>
              ))}
            </div>
          )}

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => goToStep(step)}
            className="text-primary hover:bg-primary/10 mt-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
            {tCommon("buttons.edit")}
          </button>
        </div>
      )}
    </div>
  );
}

export function StepSummary() {
  const tSteps = useTranslations("uploadWizard.steps");
  const tSummary = useTranslations("uploadWizard.summary");
  const [openSteps, setOpenSteps] = useState<Step[]>([]);

  const toggleStep = (step: Step) => {
    setOpenSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
  };

  const steps: {
    step: Step;
    titleKey: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { step: 1, titleKey: "basics", icon: FileText },
    { step: 2, titleKey: "curriculum", icon: BookOpen },
    { step: 3, titleKey: "price", icon: Tag },
    { step: 4, titleKey: "files", icon: Upload },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-text-muted text-sm font-semibold tracking-wide uppercase">
        {tSummary("title")}
      </h3>
      {steps.map(({ step, titleKey, icon }) => (
        <StepSummaryItem
          key={step}
          step={step}
          title={tSteps(titleKey)}
          icon={icon}
          isOpen={openSteps.includes(step)}
          onToggle={() => toggleStep(step)}
        />
      ))}
    </div>
  );
}
