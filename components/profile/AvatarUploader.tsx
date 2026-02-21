"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  displayName: string;
  onUpload: (file: File) => Promise<void>;
  errorInvalidType?: string;
  errorTooLarge?: string;
  errorUploadFailed?: string;
  uploadLabel?: string;
}

export function AvatarUploader({
  currentAvatarUrl,
  displayName,
  onUpload,
  errorInvalidType,
  errorTooLarge,
  errorUploadFailed,
  uploadLabel,
}: AvatarUploaderProps) {
  const t = useTranslations("avatar");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError(errorInvalidType || t("errorInvalidType"));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError(errorTooLarge || t("errorTooLarge"));
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
      setError(errorUploadFailed || t("errorUploadFailed"));
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
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        aria-label={uploadLabel || t("uploadLabel")}
        className="group relative cursor-pointer disabled:cursor-wait"
      >
        {/* Avatar display */}
        <div className="border-border from-primary to-success group-hover:border-primary relative h-24 w-24 overflow-hidden rounded-full border-4 bg-gradient-to-br transition-colors">
          {displayedAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayedAvatar} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="text-text-on-accent flex h-full w-full items-center justify-center text-2xl font-bold">
              {initials}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/30">
            <Camera
              className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>

        {/* Camera badge */}
        <span
          className="border-bg bg-primary text-text-on-accent group-hover:bg-success absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors"
          aria-hidden="true"
        >
          <Camera className="h-4 w-4" />
        </span>
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label={uploadLabel || t("uploadLabel")}
      />

      {/* Error message */}
      {error && <p className="text-error mt-2 text-center text-sm">{error}</p>}
    </div>
  );
}
