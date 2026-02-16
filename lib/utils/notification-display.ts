import { Receipt, UserPlus, Star, MessageSquare, Info } from "lucide-react";
import type { NotificationType } from "@/lib/types/account";

export const TYPE_ICON: Record<NotificationType, typeof Receipt> = {
  SALE: Receipt,
  FOLLOW: UserPlus,
  REVIEW: Star,
  COMMENT: MessageSquare,
  SYSTEM: Info,
};

export const TYPE_COLOR: Record<NotificationType, string> = {
  SALE: "bg-success/10 text-success",
  FOLLOW: "bg-primary/10 text-primary",
  REVIEW: "bg-warning/10 text-warning",
  COMMENT: "bg-blue/10 text-blue",
  SYSTEM: "bg-accent/10 text-accent",
};

export function timeAgo(
  dateStr: string,
  t: (key: string, values?: Record<string, number>) => string
) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t("justNow");
  if (minutes < 60) return t("minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  return t("daysAgo", { count: days });
}
