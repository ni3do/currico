"use client";

import { useTranslations } from "next-intl";
import { FileText, Users, UserCheck } from "lucide-react";
import { StaggerChildren, StaggerItem } from "@/components/ui/animations";

interface ProfileStatsProps {
  resourceCount: number;
  followerCount: number;
  followingCount: number;
  isPrivate: boolean;
}

const stats = [
  {
    key: "materials" as const,
    icon: FileText,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  { key: "followers" as const, icon: Users, colorClass: "text-success", bgClass: "bg-success/10" },
  {
    key: "following" as const,
    icon: UserCheck,
    colorClass: "text-accent",
    bgClass: "bg-accent/10",
  },
];

export function ProfileStats({
  resourceCount,
  followerCount,
  followingCount,
  isPrivate,
}: ProfileStatsProps) {
  const t = useTranslations("profile");

  const values: Record<string, number> = {
    materials: resourceCount,
    followers: followerCount,
    following: followingCount,
  };

  // For private profiles, only show the materials stat
  const visibleStats = isPrivate ? stats.filter((s) => s.key === "materials") : stats;

  return (
    <StaggerChildren
      className={`mb-8 grid gap-4 ${isPrivate ? "max-w-xs grid-cols-1" : "grid-cols-3"}`}
    >
      {visibleStats.map(({ key, icon: Icon, colorClass, bgClass }) => (
        <StaggerItem
          key={key}
          variant="card"
          className="border-border bg-surface flex items-center gap-3 rounded-xl border p-5"
        >
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${bgClass}`}
          >
            <Icon className={`h-5 w-5 ${colorClass}`} aria-hidden="true" />
          </div>
          <div>
            <div className={`text-2xl font-bold ${colorClass}`}>{values[key]}</div>
            <div className="text-text-muted text-sm">{t(`stats.${key}`)}</div>
          </div>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
