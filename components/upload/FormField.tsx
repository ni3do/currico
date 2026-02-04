"use client";

import { ReactNode } from "react";
import { InfoTooltip, FIELD_TOOLTIPS } from "./InfoTooltip";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  tooltipKey?: keyof typeof FIELD_TOOLTIPS;
  required?: boolean;
  error?: string;
  touched?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  tooltipKey,
  required = false,
  error,
  touched = false,
  hint,
  children,
  className = "",
}: FormFieldProps) {
  const showError = touched && error;
  const tooltip = tooltipKey ? FIELD_TOOLTIPS[tooltipKey] : null;

  return (
    <div className={className}>
      <label className="text-text mb-2 flex items-center gap-1.5 text-sm font-medium">
        <span>
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </span>
        {tooltip && (
          <InfoTooltip
            content={tooltip.content}
            example={(tooltip as { content: string; example?: string }).example}
          />
        )}
      </label>

      {children}

      {/* Error Message */}
      {showError && (
        <div className="text-error mt-1.5 flex items-center gap-1.5 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hint (only show if no error) */}
      {hint && !showError && <p className="text-text-muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}

// Input component with error styling
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function FormInput({ hasError, className = "", ...props }: FormInputProps) {
  return (
    <input
      {...props}
      className={`text-text w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none ${
        hasError
          ? "border-error bg-error/5 focus:border-error focus:ring-error/20"
          : "border-border bg-bg focus:border-primary focus:ring-primary/20"
      } placeholder:text-text-faint ${className} `}
    />
  );
}

// Textarea component with error styling
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function FormTextarea({ hasError, className = "", ...props }: FormTextareaProps) {
  return (
    <textarea
      {...props}
      className={`text-text w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none ${
        hasError
          ? "border-error bg-error/5 focus:border-error focus:ring-error/20"
          : "border-border bg-bg focus:border-primary focus:ring-primary/20"
      } placeholder:text-text-faint ${className} `}
    />
  );
}

// Select component with error styling
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export function FormSelect({ hasError, className = "", children, ...props }: FormSelectProps) {
  return (
    <select
      {...props}
      className={`text-text w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none ${
        hasError
          ? "border-error bg-error/5 focus:border-error focus:ring-error/20"
          : "border-border bg-bg focus:border-primary focus:ring-primary/20"
      } ${className} `}
    >
      {children}
    </select>
  );
}

// Checkbox component with label
interface FormCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  hasError?: boolean;
  tooltipKey?: keyof typeof FIELD_TOOLTIPS;
}

export function FormCheckbox({
  checked,
  onChange,
  label,
  description,
  hasError,
  tooltipKey,
}: FormCheckboxProps) {
  const tooltip = tooltipKey ? FIELD_TOOLTIPS[tooltipKey] : null;

  return (
    <label
      className={`hover:bg-bg flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors ${hasError ? "bg-error/5 border-error/30 rounded-lg border" : ""} `}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`mt-0.5 h-5 w-5 rounded focus:ring-2 ${
          hasError
            ? "border-error text-error focus:ring-error/20"
            : "border-border bg-bg text-primary focus:ring-primary/20"
        } `}
      />
      <div className="flex-1">
        <div className="text-text flex items-center gap-1.5 font-medium">
          {label}
          {tooltip && (
            <InfoTooltip
              content={tooltip.content}
              example={(tooltip as { content: string; example?: string }).example}
            />
          )}
        </div>
        {description && <div className="text-text-muted mt-0.5 text-sm">{description}</div>}
      </div>
    </label>
  );
}

// Radio group option
interface RadioOptionProps {
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  description?: string;
}

export function RadioOption({ value, checked, onChange, label, description }: RadioOptionProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${checked ? "border-primary bg-primary/10" : "border-border bg-bg hover:border-primary/50"} `}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="text-primary focus:ring-primary/20 h-4 w-4"
      />
      <div>
        <div className="text-text font-medium">{label}</div>
        {description && <div className="text-text-muted text-xs">{description}</div>}
      </div>
    </label>
  );
}
