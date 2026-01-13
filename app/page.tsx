"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { content } from "@/lib/content";

const { common, homePage } = content;

export default function Home() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[--background]">
      {/* Header - Strict Horizontal Navigation with subtle shadow */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Professional, Institutional */}
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[--primary] rounded-[--radius-sm]">
                <span className="text-white font-bold text-lg">{common.brand.logoText}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-[--gray-800] leading-tight">{common.brand.name}</span>
                <span className="text-xs text-[--text-muted] leading-tight">{common.brand.tagline}</span>
              </div>
            </Link>

            {/* Navigation - Strict Horizontal */}
            <nav className="hidden lg:flex items-center">
              <div className="flex items-center border-r border-[--border] pr-6 mr-6">
                <Link href="/resources" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  {common.navigation.resources}
                </Link>
                <Link href={session ? "/dashboard/seller" : "/login"} className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  {common.navigation.dashboard}
                </Link>
                <Link href="/coming-soon" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  {common.navigation.forSchools}
                </Link>
                <Link href="/coming-soon" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  {common.navigation.aboutUs}
                </Link>
                <Link href="/coming-soon" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
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
                    <Link href="/login" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[--text-secondary] hover:text-[--primary]"
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

          {/* Mobile Menu Panel */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-[--border] py-4">
              <nav className="flex flex-col space-y-2">
                <Link href="/resources" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  {common.navigation.resources}
                </Link>
                <Link href={session ? "/dashboard/seller" : "/login"} className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  {common.navigation.dashboard}
                </Link>
                <Link href="/coming-soon" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  {common.navigation.forSchools}
                </Link>
                <Link href="/coming-soon" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  {common.navigation.aboutUs}
                </Link>
                <Link href="/coming-soon" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
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
                      <Link href="/login" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
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

      <main>
        {/* Hero Section - Split-Screen Layout */}
        <section className="bg-[--background]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 py-16 lg:py-24 items-center">
              {/* Left Side - Text Content */}
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[--primary-light] rounded-[--radius-sm] mb-6">
                  <span className="text-[--primary] text-sm font-medium">{homePage.hero.badge}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[--gray-800] leading-tight tracking-tight">
                  {homePage.hero.title}
                </h1>
                <p className="mt-6 text-lg text-[--text-muted] leading-relaxed max-w-xl">
                  {homePage.hero.description}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/resources"
                    className="inline-flex items-center justify-center rounded-[--radius-md] bg-[--primary] px-6 py-3.5 font-semibold text-white hover:bg-[--primary-hover] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,82,204,0.25)]"
                  >
                    {homePage.hero.primaryButton}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center rounded-[--radius-md] bg-[--gray-100] px-6 py-3.5 font-semibold text-[--text-heading] hover:bg-[--gray-200] transition-all"
                  >
                    {homePage.hero.secondaryButton}
                  </a>
                </div>
                <div className="mt-10 pt-8 border-t border-[--border]">
                  <p className="text-sm text-[--text-muted] mb-3">{homePage.hero.trustLabel}</p>
                  <div className="flex items-center gap-6 text-[--text-light]">
                    <span className="text-sm font-medium">{homePage.hero.trustBadges.lehrplan21}</span>
                    <span className="text-[--border]">|</span>
                    <span className="text-sm font-medium">{homePage.hero.trustBadges.qualityChecked}</span>
                    <span className="text-[--border]">|</span>
                    <span className="text-sm font-medium">{homePage.hero.trustBadges.swissStandard}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Hero Image */}
              <div className="order-1 lg:order-2">
                <div
                  className="w-full h-[320px] sm:h-[400px] lg:h-[480px] rounded-[--radius-lg] bg-[--gray-100]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Navigation - Clean Horizontal */}
        <section className="bg-[--sidebar-bg] border-y border-[--border]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 py-4 overflow-x-auto">
              <Link href="/resources" className="px-4 py-2 rounded-[--radius-sm] bg-[--primary] text-white font-medium text-sm whitespace-nowrap">
                {homePage.categories.allSubjects}
              </Link>
              <Link href="/resources?subject=NMG" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                {homePage.categories.science}
              </Link>
              <Link href="/resources?subject=Deutsch" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                {homePage.categories.languages}
              </Link>
              <Link href="/resources?subject=Mathematik" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                {homePage.categories.math}
              </Link>
              <Link href="/resources?subject=BG" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                {homePage.categories.arts}
              </Link>
              <Link href="/resources?subject=Geschichte" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                {homePage.categories.history}
              </Link>
              <Link href="/resources?subject=Musik" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                {homePage.categories.music}
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Resources - Clean Card Grid */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-[--gray-800]">{homePage.featuredResources.title}</h2>
                <p className="mt-2 text-[--text-muted]">{homePage.featuredResources.description}</p>
              </div>
              <Link href="/resources" className="hidden sm:flex items-center text-[--primary] font-medium text-sm hover:underline">
                {common.buttons.viewAll}
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <article
                className="group bg-white rounded-[--radius-lg] overflow-hidden transition-all duration-200 hover:-translate-y-1"
                style={{ boxShadow: 'var(--shadow-card)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
              >
                <div
                  className="w-full h-[180px] bg-[--gray-100]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[--accent-light] text-[--accent] text-xs font-semibold rounded-full">
                      {homePage.featuredResources.card1.category}
                    </span>
                    <span className="px-3 py-1 bg-[--gray-100] text-[--text-muted] text-xs font-medium rounded-full">
                      {homePage.featuredResources.card1.cycle}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[--text-heading] group-hover:text-[--primary] transition-colors">
                    {homePage.featuredResources.card1.title}
                  </h3>
                  <p className="mt-2 text-sm text-[--text-muted] line-clamp-2">
                    {homePage.featuredResources.card1.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[--gray-100] flex items-center justify-between">
                    <span className="text-sm text-[--text-muted]">{homePage.featuredResources.card1.documents}</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-[--text-body]">
                      <svg className="w-4 h-4 text-[--warning]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {homePage.featuredResources.card1.rating}
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 2 */}
              <article
                className="group bg-white rounded-[--radius-lg] overflow-hidden transition-all duration-200 hover:-translate-y-1"
                style={{ boxShadow: 'var(--shadow-card)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
              >
                <div
                  className="w-full h-[180px] bg-[--gray-100]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[--secondary-light] text-[--secondary] text-xs font-semibold rounded-full">
                      {homePage.featuredResources.card2.category}
                    </span>
                    <span className="px-3 py-1 bg-[--gray-100] text-[--text-muted] text-xs font-medium rounded-full">
                      {homePage.featuredResources.card2.cycle}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[--text-heading] group-hover:text-[--primary] transition-colors">
                    {homePage.featuredResources.card2.title}
                  </h3>
                  <p className="mt-2 text-sm text-[--text-muted] line-clamp-2">
                    {homePage.featuredResources.card2.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[--gray-100] flex items-center justify-between">
                    <span className="text-sm text-[--text-muted]">{homePage.featuredResources.card2.documents}</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-[--text-body]">
                      <svg className="w-4 h-4 text-[--warning]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {homePage.featuredResources.card2.rating}
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 3 */}
              <article
                className="group bg-white rounded-[--radius-lg] overflow-hidden transition-all duration-200 hover:-translate-y-1"
                style={{ boxShadow: 'var(--shadow-card)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
              >
                <div
                  className="w-full h-[180px] bg-[--gray-100]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[--primary-light] text-[--primary] text-xs font-semibold rounded-full">
                      {homePage.featuredResources.card3.category}
                    </span>
                    <span className="px-3 py-1 bg-[--gray-100] text-[--text-muted] text-xs font-medium rounded-full">
                      {homePage.featuredResources.card3.cycle}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[--text-heading] group-hover:text-[--primary] transition-colors">
                    {homePage.featuredResources.card3.title}
                  </h3>
                  <p className="mt-2 text-sm text-[--text-muted] line-clamp-2">
                    {homePage.featuredResources.card3.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[--gray-100] flex items-center justify-between">
                    <span className="text-sm text-[--text-muted]">{homePage.featuredResources.card3.documents}</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-[--text-body]">
                      <svg className="w-4 h-4 text-[--warning]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {homePage.featuredResources.card3.rating}
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/resources" className="inline-flex items-center text-[--primary] font-medium text-sm hover:underline">
                {homePage.featuredResources.viewAllMobile}
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section - Clean Grid */}
        <section id="features" className="bg-[--background] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-semibold text-[--gray-800]">
                {homePage.features.title}
              </h2>
              <p className="mt-4 text-lg text-[--text-muted]">
                {homePage.features.description}
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-[--radius-lg] p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center justify-center w-12 h-12 bg-[--primary-light] rounded-[--radius-lg] mb-6">
                  <svg className="w-6 h-6 text-[--primary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[--text-heading]">
                  {homePage.features.feature1.title}
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  {homePage.features.feature1.description}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-[--radius-lg] p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center justify-center w-12 h-12 bg-[--accent-light] rounded-[--radius-lg] mb-6">
                  <svg className="w-6 h-6 text-[--accent]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[--text-heading]">
                  {homePage.features.feature2.title}
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  {homePage.features.feature2.description}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-[--radius-lg] p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center justify-center w-12 h-12 bg-[--secondary-light] rounded-[--radius-lg] mb-6">
                  <svg className="w-6 h-6 text-[--secondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[--text-heading]">
                  {homePage.features.feature3.title}
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  {homePage.features.feature3.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Clean numbers */}
        <section className="bg-white py-20 border-y border-[--border]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-[--primary]">{homePage.stats.materials.value}</div>
                <div className="mt-2 text-sm text-[--text-muted] font-medium">{homePage.stats.materials.label}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[--accent]">{homePage.stats.teachers.value}</div>
                <div className="mt-2 text-sm text-[--text-muted] font-medium">{homePage.stats.teachers.label}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[--secondary]">{homePage.stats.schools.value}</div>
                <div className="mt-2 text-sm text-[--text-muted] font-medium">{homePage.stats.schools.label}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[--primary]">{homePage.stats.satisfaction.value}</div>
                <div className="mt-2 text-sm text-[--text-muted] font-medium">{homePage.stats.satisfaction.label}</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[--primary] py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              {homePage.cta.title}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {homePage.cta.description}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-[--radius-md] bg-white px-6 py-3.5 font-semibold text-[--primary-solid] hover:bg-[--gray-100] transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {homePage.cta.primaryButton}
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center justify-center rounded-[--radius-md] bg-white/10 px-6 py-3.5 font-semibold text-white border border-white/20 hover:bg-white/20 transition-all"
              >
                {homePage.cta.secondaryButton}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Grounded with slate background */}
      <footer className="bg-[--sidebar-bg] border-t border-[--border]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-[--primary] rounded-[--radius-sm]">
                  <span className="text-white font-bold text-sm">{common.brand.logoText}</span>
                </div>
                <span className="text-lg font-semibold text-[--text-heading]">{common.brand.name}</span>
              </div>
              <p className="text-sm text-[--text-muted] leading-relaxed">
                {common.footer.brandDescription}
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-[--text-heading] text-sm uppercase tracking-wider">{common.footer.platformSection.title}</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/resources" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">{common.footer.platformSection.resources}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">{common.footer.platformSection.forSchools}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">{common.footer.platformSection.pricing}</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-[--text-heading] text-sm uppercase tracking-wider">{common.footer.infoSection.title}</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/coming-soon" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">{common.footer.infoSection.aboutUs}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">{common.footer.infoSection.contact}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">{common.footer.infoSection.help}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-[--text-heading] text-sm uppercase tracking-wider">{common.footer.legalSection.title}</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/coming-soon" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">{common.footer.legalSection.privacy}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">{common.footer.legalSection.terms}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">{common.footer.legalSection.imprint}</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[--gray-200] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[--text-muted]">
              {common.footer.copyright}
            </p>
            <p className="text-sm text-[--text-light]">
              {common.footer.initiative}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
