"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  UserPlus,
  UserCheck,
  Calendar,
  MapPin,
  Instagram,
  Lock,
  Loader2,
  Globe,
  GraduationCap,
  School2,
  Share2,
  Check,
} from "lucide-react";
import { VerifiedSellerBadge } from "@/components/ui/VerifiedSellerBadge";
import { SellerBadge } from "@/components/ui/SellerBadge";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import type { PublicProfileData } from "@/lib/types/profile";

// Map DB value → i18n key suffix in accountPage.settingsProfile namespace
const EXPERIENCE_KEY_MAP: Record<string, string> = {
  "0-2": "experience0_2",
  "3-5": "experience3_5",
  "6-10": "experience6_10",
  "11-20": "experience11_20",
  "20+": "experience20plus",
};

interface ProfileHeroProps {
  profile: PublicProfileData;
  displayName: string;
  onFollowToggle: () => Promise<void>;
  followLoading: boolean;
}

export function ProfileHero({
  profile,
  displayName,
  onFollowToggle,
  followLoading,
}: ProfileHeroProps) {
  const t = useTranslations("profile");
  const tExp = useTranslations("accountPage.settingsProfile");
  const locale = useLocale();
  const dateLocale = locale === "de" ? "de-CH" : "en-US";
  const [avatarError, setAvatarError] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const showInitials = !profile.image || avatarError;

  const experienceKey = profile.teaching_experience
    ? EXPERIENCE_KEY_MAP[profile.teaching_experience]
    : null;

  return (
    <FadeIn className="from-primary/15 via-accent/8 to-success/15 mb-8 overflow-hidden rounded-2xl bg-gradient-to-r">
      <div className="p-6 sm:p-8">
        <StaggerChildren className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Avatar */}
          <StaggerItem className="flex-shrink-0">
            {showInitials ? (
              <div className="from-primary to-success text-text-on-accent flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br text-4xl font-bold shadow-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
            ) : (
              <Image
                src={profile.image!}
                alt={displayName}
                width={112}
                height={112}
                className="border-bg h-28 w-28 rounded-full border-4 object-cover shadow-lg"
                onError={() => setAvatarError(true)}
              />
            )}
          </StaggerItem>

          {/* Profile Info */}
          <StaggerItem className="min-w-0 flex-1">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-text text-2xl font-bold sm:text-3xl">{displayName}</h1>
                {profile.is_verified_seller && (
                  <div className="mt-1">
                    <VerifiedSellerBadge variant="full" />
                  </div>
                )}
                {/* Seller Level Badge */}
                <div className="mt-2">
                  <SellerBadge
                    points={profile.seller_xp}
                    cachedLevel={profile.seller_level}
                    variant="full"
                  />
                </div>
                {/* Teacher Verified Badge */}
                {profile.is_teacher_verified && (
                  <span className="bg-success/15 text-success mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {t("teacherVerified")}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="border-border bg-surface text-text-muted hover:text-text hover:bg-surface-elevated flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-95"
                  aria-label={t("shareLabel")}
                >
                  {shareCopied ? (
                    <Check className="text-success h-4 w-4" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {shareCopied ? t("shareCopied") : t("share")}
                  </span>
                </button>
                {!profile.isOwnProfile ? (
                  <button
                    onClick={onFollowToggle}
                    disabled={followLoading}
                    className={`flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-95 disabled:opacity-60 ${
                      profile.isFollowing
                        ? "border-primary text-primary hover:bg-primary/10 border"
                        : "bg-primary hover:bg-primary-hover text-text-on-accent"
                    }`}
                    aria-label={profile.isFollowing ? t("unfollow") : t("follow")}
                  >
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : profile.isFollowing ? (
                      <UserCheck className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {profile.isFollowing ? t("following") : t("follow")}
                  </button>
                ) : (
                  <Link
                    href="/konto/settings"
                    className="border-border bg-surface text-text hover:bg-surface-elevated flex items-center gap-2 rounded-full border px-6 py-2.5 font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-95"
                  >
                    {t("editProfile")}
                  </Link>
                )}
              </div>
            </div>

            {/* Private Profile Notice */}
            {profile.is_private && !profile.isOwnProfile && (
              <div className="bg-surface border-border text-text-muted mb-3 flex items-center gap-2 rounded-lg border p-3 text-sm">
                <Lock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>{t("privacy.noticePartial")}</span>
              </div>
            )}

            {/* Bio */}
            {profile.bio && !profile.is_private && (
              <p className="text-text-secondary mb-3 leading-relaxed">{profile.bio}</p>
            )}

            {/* Meta: location, school, experience, member since */}
            <div className="text-text-muted flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {!profile.is_private && profile.cantons.length > 0 && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {profile.cantons.join(", ")}
                </div>
              )}
              {!profile.is_private && profile.school && (
                <div className="flex items-center gap-1">
                  <School2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {profile.school}
                </div>
              )}
              {!profile.is_private && experienceKey && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                  {tExp(experienceKey as never)}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {t("memberSince")}{" "}
                {new Date(profile.created_at).toLocaleDateString(dateLocale, {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Social Media + Subject Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {!profile.is_private && profile.website && (
                <a
                  href={
                    profile.website.startsWith("http")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t("website")}: ${profile.website}`}
                  className="text-text-muted hover:text-primary border-border hover:bg-primary/10 flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {t("website")}
                </a>
              )}
              {!profile.is_private && profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Instagram: @${profile.instagram}`}
                  className="text-text-muted hover:text-primary border-border hover:bg-accent/10 flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
                >
                  <Instagram className="h-3.5 w-3.5" />@{profile.instagram}
                </a>
              )}
              {!profile.is_private && profile.pinterest && (
                <a
                  href={`https://pinterest.com/${profile.pinterest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Pinterest: @${profile.pinterest}`}
                  className="text-text-muted hover:text-primary border-border hover:bg-error/10 flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                  </svg>
                  @{profile.pinterest}
                </a>
              )}
              {!profile.is_private &&
                profile.subjects.map((subject) => (
                  <span key={subject} className={`pill text-xs ${getSubjectPillClass(subject)}`}>
                    {subject}
                  </span>
                ))}
            </div>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </FadeIn>
  );
}
