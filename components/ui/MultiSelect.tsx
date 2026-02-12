"use client";

import { useState, useRef, useEffect } from "react";

interface MultiSelectProps {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  getTagClassName?: (item: string) => string;
  searchPlaceholder?: string;
  noResultsText?: string;
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Auswählen...",
  required = false,
  error,
  getTagClassName,
  searchPlaceholder = "Suchen...",
  noResultsText = "Keine Optionen gefunden",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter((s) => s !== option));
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-text mb-2 block text-sm font-medium">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>

      {/* Selected tags */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-bg min-h-[42px] w-full cursor-pointer rounded-lg border px-3 py-2 ${
          error ? "border-error" : "border-border focus-within:border-primary"
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm ${
                getTagClassName ? `pill ${getTagClassName(item)}` : "bg-primary/20 text-primary"
              }`}
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(item);
                }}
                className="hover:text-error ml-1"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
          {selected.length === 0 && <span className="text-text-muted">{placeholder}</span>}
        </div>
      </div>

      {error && <p className="text-error mt-1 text-sm">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div className="border-border bg-surface absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border shadow-lg">
          {/* Search input */}
          <div className="border-border bg-surface sticky top-0 border-b p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="border-border bg-bg text-text focus:border-primary w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options */}
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="text-text-muted px-3 py-2 text-sm">{noResultsText}</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleOption(option)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    selected.includes(option)
                      ? getTagClassName
                        ? `pill ${getTagClassName(option)}`
                        : "bg-primary/20 text-primary"
                      : "text-text hover:bg-surface-elevated"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      selected.includes(option) ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {selected.includes(option) && (
                      <svg
                        className="text-text-on-accent h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
