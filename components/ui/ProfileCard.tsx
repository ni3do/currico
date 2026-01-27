"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FileText, Users } from "lucide-react";

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
}

const defaultGetSubjectPillClass = (subject: string): string => {
  const subjectMap: Record<string, string> = {
    Deutsch: "pill-deutsch",
    Mathematik: "pill-mathe",
    NMG: "pill-nmg",
    BG: "pill-gestalten",
    Musik: "pill-musik",
    Sport: "pill-sport",
    Englisch: "pill-fremdsprachen",
    Franzosisch: "pill-fremdsprachen",
    French: "pill-fremdsprachen",
    English: "pill-fremdsprachen",
  };
  return subjectMap[subject] || "pill-primary";
};

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
}: ProfileCardProps) {
  return (
    <Link
      href={`/profile/${id}`}
      className="card group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex flex-1 flex-col p-5">
        {/* Header: Avatar + Name */}
        <div className="mb-4 flex items-center gap-3">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={48}
              height={48}
              className="border-border h-12 w-12 rounded-full border-2 object-cover"
            />
          ) : (
            <div className="from-primary to-success flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-text group-hover:text-primary truncate font-semibold transition-colors">
              {name}
            </h3>
            {isVerified && (
              <span className="text-success inline-flex items-center gap-1 text-xs">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verifiziert
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {bio && <p className="text-text-muted mb-3 line-clamp-2 text-sm">{bio}</p>}

        {/* Subject Pills */}
        {subjects.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
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
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {resourceCount}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {followerCount}
            </span>
          </div>
          <svg
            className="text-text-muted group-hover:text-primary h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
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
