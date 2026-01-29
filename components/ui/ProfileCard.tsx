"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FileText, Users, UserPlus, UserCheck, CheckCircle } from "lucide-react";
import { getSubjectPillClass as defaultGetSubjectPillClass } from "@/lib/constants/subject-colors";

export interface ProfileCardProps {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  subjects: string[];
  resourceCount: number;
  followerCount: number;
  isVerified?: boolean;
  /** Custom pill class getter function */
  getSubjectPillClass?: (subject: string) => string;
  /** Whether the current user is following this profile */
  isFollowing?: boolean;
  /** Callback when follow button is clicked */
  onFollowToggle?: (id: string, currentState: boolean) => Promise<boolean>;
  /** Show/hide the follow button */
  showFollowButton?: boolean;
}

export function ProfileCard({
  id,
  name,
  image,
  bio,
  subjects,
  resourceCount,
  followerCount,
  isVerified = false,
  getSubjectPillClass = defaultGetSubjectPillClass,
  isFollowing: initialFollowing = false,
  onFollowToggle,
  showFollowButton = false,
}: ProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [displayedFollowerCount, setDisplayedFollowerCount] = useState(followerCount);

  // Sync with parent's follow state
  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  // Sync follower count from props
  useEffect(() => {
    setDisplayedFollowerCount(followerCount);
  }, [followerCount]);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onFollowToggle || followLoading) return;

    setFollowLoading(true);
    try {
      const success = await onFollowToggle(id, isFollowing);
      if (success) {
        setIsFollowing(!isFollowing);
        setDisplayedFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      }
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <Link
      href={`/profile/${id}`}
      className="card group flex h-full cursor-pointer flex-col overflow-hidden"
    >
      {/* Profile Header Image - 16:9 aspect ratio like ResourceCard */}
      <div className="bg-bg-secondary relative aspect-[16/9] w-full overflow-hidden">
        {/* Background pattern/gradient */}
        <div className="from-primary/20 via-accent/10 to-success/20 absolute inset-0 bg-gradient-to-br" />

        {/* Decorative circles */}
        <div className="bg-primary/10 absolute -top-8 -right-8 h-32 w-32 rounded-full" />
        <div className="bg-accent/10 absolute -bottom-4 -left-4 h-24 w-24 rounded-full" />

        {/* Centered Avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          {image ? (
            <div className="relative">
              <Image
                src={image}
                alt={name}
                width={80}
                height={80}
                className="border-surface h-20 w-20 rounded-full border-4 object-cover shadow-lg transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
              />
              {isVerified && (
                <div className="bg-success absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-sm">
                  <CheckCircle className="h-4 w-4 text-white" fill="currentColor" />
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="from-primary to-success flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br text-2xl font-bold text-white shadow-lg transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]">
                {name.charAt(0).toUpperCase()}
              </div>
              {isVerified && (
                <div className="bg-success absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-sm">
                  <CheckCircle className="h-4 w-4 text-white" fill="currentColor" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Follow Button - Top Right */}
        {showFollowButton && (
          <button
            onClick={handleFollowClick}
            disabled={followLoading}
            className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-95 disabled:opacity-50 ${
              isFollowing
                ? "border-primary/50 text-primary border bg-white/90"
                : "bg-primary hover:bg-primary-hover text-white"
            }`}
            aria-label={isFollowing ? "Entfolgen" : "Folgen"}
          >
            {followLoading ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : isFollowing ? (
              <UserCheck className="h-3.5 w-3.5" />
            ) : (
              <UserPlus className="h-3.5 w-3.5" />
            )}
            {isFollowing ? "Gefolgt" : "Folgen"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Name */}
        <h3 className="text-text group-hover:text-primary mb-2 text-center text-lg font-bold transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
          {name}
        </h3>

        {/* Bio */}
        {bio && (
          <p className="text-text-muted mb-3 line-clamp-2 text-center text-sm leading-relaxed">
            {bio}
          </p>
        )}

        {/* Subject Pills */}
        {subjects.length > 0 && (
          <div className="mb-4 flex flex-wrap justify-center gap-1.5">
            {subjects.slice(0, 3).map((subject) => (
              <span key={subject} className={`pill text-xs ${getSubjectPillClass(subject)}`}>
                {subject}
              </span>
            ))}
            {subjects.length > 3 && (
              <span className="text-text-muted text-xs">+{subjects.length - 3}</span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Footer: Stats */}
        <div className="border-border-subtle flex items-center justify-between border-t pt-4">
          <div className="text-text-muted flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 transition-colors duration-300">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{resourceCount}</span>
            </span>
            <span className="flex items-center gap-1.5 transition-colors duration-300">
              <Users className="h-4 w-4" />
              <span className="font-medium">{displayedFollowerCount}</span>
            </span>
          </div>
          <svg
            className="text-text-muted group-hover:text-primary h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default ProfileCard;
