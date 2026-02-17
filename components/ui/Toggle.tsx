"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, description, className = "" }: ToggleProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="focus-visible:ring-primary relative flex items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2"
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <div
          className={`h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-border"}`}
        >
          <div
            className={`bg-surface absolute top-0.5 h-5 w-5 rounded-full shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </div>
      </button>
      {label && <span className="text-text text-sm font-medium">{label}</span>}
      {description && <span className="text-text-muted text-sm">{description}</span>}
    </div>
  );
}
