import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

const FORMAT_CONFIG: Record<string, { color: string; bgColor: string }> = {
  pdf: { color: "text-error", bgColor: "bg-error/10" },
  word: { color: "text-primary", bgColor: "bg-primary/10" },
  powerpoint: { color: "text-warning", bgColor: "bg-warning/10" },
  excel: { color: "text-success", bgColor: "bg-success/10" },
  onenote: { color: "text-accent", bgColor: "bg-accent/10" },
  other: { color: "text-text-muted", bgColor: "bg-surface-elevated" },
};

interface MaterialTypeBadgeProps {
  format: string;
  size?: "sm" | "md";
}

export function MaterialTypeBadge({ format, size = "md" }: MaterialTypeBadgeProps) {
  const t = useTranslations("common.materialTypes");
  const config = FORMAT_CONFIG[format] || FORMAT_CONFIG.other;

  const formatKey = FORMAT_CONFIG[format] ? format : "other";
  const label = t(formatKey);

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-3 py-1 text-sm gap-1.5";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${sizeClasses}`}
    >
      <FileText className={`${iconSize} ${config.color}`} />
      <span className={config.color}>{label}</span>
    </span>
  );
}
