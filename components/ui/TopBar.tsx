"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { content } from "@/lib/content";

const { common } = content;

export default function TopBar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm"
      style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-[--primary] rounded-[--radius-sm]">
              <span className="text-white font-bold text-lg">{common.brand.logoText}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-[--gray-800] leading-tight">{common.brand.name}</span>
              <span className="text-xs text-[--text-muted] leading-tight">{common.brand.tagline}</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center">
            <div className="flex items-center border-r border-[--border] pr-6 mr-6">
              <Link
                href="/resources"
                className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
              >
                {common.navigation.resources}
              </Link>
              <Link
                href={session ? "/dashboard/seller" : "/login"}
                className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
              >
                {common.navigation.dashboard}
              </Link>
              <Link
                href="/coming-soon"
                className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
              >
                {common.navigation.forSchools}
              </Link>
              <Link
                href="/coming-soon"
                className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
              >
                {common.navigation.aboutUs}
              </Link>
              <Link
                href="/coming-soon"
                className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
              >
                {common.navigation.contact}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
                >
                  {common.navigation.logout}
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
                  >
                    {common.navigation.login}
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-[--radius-sm] bg-[--primary] px-5 py-2 font-medium text-white text-sm hover:bg-[--primary-hover] transition-colors"
                  >
                    {common.navigation.register}
                  </Link>
                </>
              )}
            </div>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[--text-secondary] hover:text-[--primary]"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[--border] py-4">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/resources"
                className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
              >
                {common.navigation.resources}
              </Link>
              <Link
                href={session ? "/dashboard/seller" : "/login"}
                className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
              >
                {common.navigation.dashboard}
              </Link>
              <Link
                href="/coming-soon"
                className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
              >
                {common.navigation.forSchools}
              </Link>
              <Link
                href="/coming-soon"
                className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
              >
                {common.navigation.aboutUs}
              </Link>
              <Link
                href="/coming-soon"
                className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
              >
                {common.navigation.contact}
              </Link>
              <div className="border-t border-[--border] pt-4 mt-2 flex flex-col space-y-2">
                {session ? (
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors text-left"
                  >
                    {common.navigation.logout}
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors"
                    >
                      {common.navigation.login}
                    </Link>
                    <Link
                      href="/register"
                      className="mx-4 rounded-[--radius-sm] bg-[--primary] px-5 py-2 font-medium text-white text-sm hover:bg-[--primary-hover] transition-colors text-center"
                    >
                      {common.navigation.register}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
