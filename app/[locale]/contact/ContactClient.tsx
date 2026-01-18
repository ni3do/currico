"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function ContactClient() {
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
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Hero Section */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl leading-tight font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="mt-6 text-xl leading-relaxed text-text-muted">
                {t("hero.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="bg-bg-secondary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
              {/* Contact Form - Left Side (3 columns) */}
              <div className="lg:col-span-3">
                <div className="card p-8 sm:p-10">
                  <h2 className="mb-8 text-xl font-semibold text-text sm:text-2xl">
                    {t("form.title")}
                  </h2>

                  {submitStatus === "success" ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                        <svg
                          className="h-8 w-8 text-success"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-text">
                        {t("form.successTitle")}
                      </h3>
                      <p className="text-text-muted">{t("form.successMessage")}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name & Email Row */}
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-text"
                          >
                            {t("form.nameLabel")}{" "}
                            <span className="text-error">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t("form.namePlaceholder")}
                            required
                            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text transition-colors placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-text"
                          >
                            {t("form.emailLabel")}{" "}
                            <span className="text-error">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t("form.emailPlaceholder")}
                            required
                            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text transition-colors placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="mb-2 block text-sm font-medium text-text"
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
                          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text transition-colors placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        />
                        <p className="mt-2 text-sm text-text-muted">
                          {t("form.phoneHint")}
                        </p>
                      </div>

                      {/* Subject Field */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="mb-2 block text-sm font-medium text-text"
                        >
                          {t("form.subjectLabel")}{" "}
                          <span className="text-error">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        >
                          <option value="">{t("form.subjectPlaceholder")}</option>
                          <option value="general">{t("form.subjects.general")}</option>
                          <option value="feedback">{t("form.subjects.feedback")}</option>
                          <option value="partnership">{t("form.subjects.partnership")}</option>
                          <option value="support">{t("form.subjects.support")}</option>
                          <option value="sales">{t("form.subjects.sales")}</option>
                        </select>
                      </div>

                      {/* Message Field */}
                      <div>
                        <label
                          htmlFor="message"
                          className="mb-2 block text-sm font-medium text-text"
                        >
                          {t("form.messageLabel")}{" "}
                          <span className="text-error">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder={t("form.messagePlaceholder")}
                          rows={5}
                          required
                          className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3 text-text transition-colors placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
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
                          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                        />
                        <label
                          htmlFor="consent"
                          className="text-sm leading-relaxed text-text-secondary"
                        >
                          {t("form.consentText")}
                        </label>
                      </div>

                      {/* Error Message */}
                      {submitStatus === "error" && errorMessage && (
                        <div className="flex items-center gap-3 rounded-lg border border-error/50 bg-error/10 p-4">
                          <svg
                            className="h-5 w-5 flex-shrink-0 text-error"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm text-error">{errorMessage}</p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || !formData.consent}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-8 py-3 font-semibold text-text-on-accent transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
                      >
                        {isSubmitting ? t("form.submitting") : t("form.submitButton")}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Direct Contact Info - Right Side (2 columns) */}
              <div className="lg:col-span-2">
                <h2 className="mb-8 text-xl font-semibold text-text sm:text-2xl">
                  {t("direct.title")}
                </h2>

                <div className="space-y-6">
                  {/* Email Card */}
                  <div className="card p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-light">
                        <svg
                          className="h-6 w-6 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-text">
                          {t("direct.email.title")}
                        </h3>
                        <p className="mb-2 text-sm text-text-muted">
                          {t("direct.email.description")}
                        </p>
                        <a
                          href="mailto:hello@easylehrer.ch"
                          className="font-medium text-primary transition-colors hover:text-primary-hover"
                        >
                          hello@easylehrer.ch
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Response Time Info */}
                  <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-success"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-text-secondary">
                      {t("direct.responseTime")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ CTA Section */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-xl font-semibold text-text sm:text-2xl">
              {t("faq.title")}
            </h2>
            <p className="mb-8 text-text-muted">{t("faq.description")}</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
