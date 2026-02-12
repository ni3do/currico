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
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative flex items-center ${className}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <div
        className={`h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-border"}`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </div>
    </button>
  );
}
