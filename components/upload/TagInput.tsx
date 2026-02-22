"use client";

import { useState, useCallback, KeyboardEvent, useRef } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  /** Error message for max reached */
  maxMessage?: string;
  /** Error message for duplicates */
  duplicateMessage?: string;
  /** Error message for too short */
  tooShortMessage?: string;
  disabled?: boolean;
}

export function TagInput({
  tags,
  onChange,
  maxTags = 10,
  minLength = 2,
  maxLength = 30,
  placeholder,
  maxMessage,
  duplicateMessage,
  tooShortMessage,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.toLowerCase().trim();
      if (tag.length < minLength || tag.length > maxLength) return;
      if (tags.includes(tag)) {
        setError(duplicateMessage ?? null);
        setTimeout(() => setError(null), 2000);
        return;
      }
      if (tags.length >= maxTags) {
        setError(maxMessage ?? null);
        setTimeout(() => setError(null), 2000);
        return;
      }
      onChange([...tags, tag]);
      setInputValue("");
      setError(null);
    },
    [tags, onChange, maxTags, minLength, maxLength, maxMessage, duplicateMessage]
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div>
      <div
        className={`border-border bg-bg focus-within:border-primary focus-within:ring-primary/20 flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border px-3 py-2 transition-colors focus-within:ring-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-text"}`}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span
            key={tag}
            className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
          >
            #{tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="hover:text-error ml-0.5 transition-colors"
                aria-label={`${tag} entfernen`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {tags.length < maxTags && !disabled && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? placeholder : ""}
            maxLength={maxLength}
            className="text-text placeholder:text-text-faint min-w-[120px] flex-1 border-none bg-transparent py-0.5 text-sm outline-none"
            disabled={disabled}
          />
        )}
      </div>
      {error && <p className="text-error mt-1 text-xs">{error}</p>}
    </div>
  );
}
