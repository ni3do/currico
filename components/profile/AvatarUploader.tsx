"use client";

import { useState, useRef } from "react";

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  displayName: string;
  onUpload: (file: File) => Promise<void>;
}

export function AvatarUploader({
  currentAvatarUrl,
  displayName,
  onUpload,
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Bitte wählen Sie ein Bild aus (JPG, PNG)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Das Bild darf maximal 2MB gross sein");
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch {
      setError("Fehler beim Hochladen. Bitte versuchen Sie es erneut.");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const displayedAvatar = previewUrl || currentAvatarUrl;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Avatar display */}
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-success)]">
          {displayedAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayedAvatar}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
              {initials}
            </div>
          )}

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>

        {/* Upload button overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--color-primary)] text-white hover:bg-[var(--color-success)] transition-colors disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Instructions */}
      <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
        JPG, PNG oder WebP. Max 2MB.
      </p>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-center text-sm text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
