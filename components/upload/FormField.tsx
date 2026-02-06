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
      className={`text-text w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:shadow-lg focus:ring-2 focus:outline-none ${
        hasError
          ? "border-error bg-error/5 focus:border-error focus:ring-error/20 focus:shadow-error/10"
          : "border-border bg-bg focus:border-primary focus:ring-primary/20 focus:shadow-primary/10"
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
      className={`text-text w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:shadow-lg focus:ring-2 focus:outline-none ${
        hasError
          ? "border-error bg-error/5 focus:border-error focus:ring-error/20 focus:shadow-error/10"
          : "border-border bg-bg focus:border-primary focus:ring-primary/20 focus:shadow-primary/10"
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
      className={`text-text w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:shadow-lg focus:ring-2 focus:outline-none ${
        hasError
          ? "border-error bg-error/5 focus:border-error focus:ring-error/20 focus:shadow-error/10"
          : "border-border bg-bg focus:border-primary focus:ring-primary/20 focus:shadow-primary/10"
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
      className={`group flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-all duration-200 ${
        hasError
          ? "bg-error/5 border-error/30 border-2"
          : checked
            ? "bg-primary/5 border-primary/20 border-2"
            : "hover:bg-surface-elevated border-2 border-transparent"
      } `}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-200 ${
          hasError
            ? "border-error"
            : checked
              ? "border-primary bg-primary"
              : "border-border group-hover:border-primary/50"
        } `}
      >
        {checked && (
          <svg className="text-text-on-accent h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
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
      className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${
        checked
          ? "border-primary bg-primary/10 shadow-primary/10 shadow-lg"
          : "border-border bg-bg hover:border-primary/50 hover:shadow-md"
      } `}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="text-primary focus:ring-primary/20 h-5 w-5"
      />
      <div>
        <div className="text-text font-semibold">{label}</div>
        {description && <div className="text-text-muted text-sm">{description}</div>}
      </div>
      {checked && (
        <div className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full">
          <svg className="text-text-on-accent h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </label>
  );
}
