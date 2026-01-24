"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function ContactPage() {
  const t = useTranslations("contactPage");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitStatus("success");
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main>
        {/* Hero Section */}
        <section className="bg-[var(--color-bg)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text)] leading-tight tracking-tight">
                {t("hero.title")}
              </h1>
              <p className="mt-6 text-xl text-[var(--color-text-muted)] leading-relaxed">
                {t("hero.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="bg-[var(--color-bg-secondary)] py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Contact Form - Left Side (3 columns) */}
              <div className="lg:col-span-3">
                <div className="card p-8 sm:p-10">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-8">
                    {t("form.title")}
                  </h2>

                  {submitStatus === "success" ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="flex items-center justify-center w-16 h-16 bg-[var(--color-success-light)] rounded-full mb-6">
                        <svg className="w-8 h-8 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                        {t("form.successTitle")}
                      </h3>
                      <p className="text-[var(--color-text-muted)]">
                        {t("form.successMessage")}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name & Email Row */}
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                          >
                            {t("form.nameLabel")} <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t("form.namePlaceholder")}
                            required
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                          >
                            {t("form.emailLabel")} <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t("form.emailPlaceholder")}
                            required
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                        >
                          {t("form.phoneLabel")}
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder={t("form.phonePlaceholder")}
                          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
                        />
                        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                          {t("form.phoneHint")}
                        </p>
                      </div>

                      {/* Subject Field */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                        >
                          {t("form.subjectLabel")} <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
                        >
                          <option value="">{t("form.subjectPlaceholder")}</option>
                          <option value="general">{t("form.subjects.general")}</option>
                          <option value="support">{t("form.subjects.support")}</option>
                          <option value="sales">{t("form.subjects.sales")}</option>
                          <option value="partnership">{t("form.subjects.partnership")}</option>
                          <option value="feedback">{t("form.subjects.feedback")}</option>
                        </select>
                      </div>

                      {/* Message Field */}
                      <div>
                        <label
                          htmlFor="message"
                          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                        >
                          {t("form.messageLabel")} <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder={t("form.messagePlaceholder")}
                          rows={5}
                          required
                          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors resize-none"
                        />
                      </div>

                      {/* GDPR Consent */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="consent"
                          name="consent"
                          checked={formData.consent}
                          onChange={handleChange}
                          required
                          className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
                        />
                        <label
                          htmlFor="consent"
                          className="text-sm text-[var(--color-text-secondary)] leading-relaxed"
                        >
                          {t("form.consentText")}
                        </label>
                      </div>

                      {/* Error Message */}
                      {submitStatus === "error" && errorMessage && (
                        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-error)]/50 bg-[var(--color-error)]/10 p-4">
                          <svg className="w-5 h-5 flex-shrink-0 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-[var(--color-error)]">{errorMessage}</p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || !formData.consent}
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-8 py-3 font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                      >
                        {isSubmitting ? t("form.submitting") : t("form.submitButton")}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Direct Contact Info - Right Side (2 columns) */}
              <div className="lg:col-span-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-8">
                  {t("direct.title")}
                </h2>

                <div className="space-y-6">
                  {/* Email Card */}
                  <div className="card p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-primary-light)] rounded-full flex-shrink-0">
                        <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--color-text)] mb-1">
                          {t("direct.email.title")}
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-2">
                          {t("direct.email.description")}
                        </p>
                        <a
                          href="mailto:info@currico.ch"
                          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors"
                        >
                          info@currico.ch
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Response Time Info */}
                  <div className="flex items-center gap-3 rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-4">
                    <svg className="w-5 h-5 flex-shrink-0 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("direct.responseTime")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ CTA Section */}
        <section className="bg-[var(--color-bg)] py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-4">
              {t("faq.title")}
            </h2>
            <p className="text-[var(--color-text-muted)] mb-8">
              {t("faq.description")}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
