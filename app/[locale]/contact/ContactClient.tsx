"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function ContactClient() {
  const t = useTranslations("contactPage");
  const tCommon = useTranslations("common");
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
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.contact") }]} />
          <h1 className="text-text text-2xl font-bold">{t("hero.title")}</h1>
          <p className="text-text-muted mt-1">{t("hero.subtitle")}</p>
        </div>

        {/* Contact Form & Info Section */}
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Contact Form - Left Side (3 columns) */}
          <div className="lg:col-span-3">
            <div className="card p-8 sm:p-10">
              <h2 className="text-text mb-8 text-xl font-semibold sm:text-2xl">
                {t("form.title")}
              </h2>

              {submitStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-success-light mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                    <svg
                      className="text-success h-8 w-8"
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
                  <h3 className="text-text mb-2 text-lg font-semibold">{t("form.successTitle")}</h3>
                  <p className="text-text-muted">{t("form.successMessage")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email Row */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="text-text mb-2 block text-sm font-medium">
                        {t("form.nameLabel")} <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t("form.namePlaceholder")}
                        required
                        className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-text mb-2 block text-sm font-medium">
                        {t("form.emailLabel")} <span className="text-error">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t("form.emailPlaceholder")}
                        required
                        className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="text-text mb-2 block text-sm font-medium">
                      {t("form.phoneLabel")}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("form.phonePlaceholder")}
                      className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                    />
                    <p className="text-text-muted mt-2 text-sm">{t("form.phoneHint")}</p>
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label htmlFor="subject" className="text-text mb-2 block text-sm font-medium">
                      {t("form.subjectLabel")} <span className="text-error">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
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
                    <label htmlFor="message" className="text-text mb-2 block text-sm font-medium">
                      {t("form.messageLabel")} <span className="text-error">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("form.messagePlaceholder")}
                      rows={5}
                      required
                      className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full resize-none rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
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
                      className="border-border text-primary focus:ring-primary/20 mt-1 h-4 w-4 rounded"
                    />
                    <label
                      htmlFor="consent"
                      className="text-text-secondary text-sm leading-relaxed"
                    >
                      {t("form.consentText")}
                    </label>
                  </div>

                  {/* Error Message */}
                  {submitStatus === "error" && errorMessage && (
                    <div className="border-error/50 bg-error/10 flex items-center gap-3 rounded-lg border p-4">
                      <svg
                        className="text-error h-5 w-5 flex-shrink-0"
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
                      <p className="text-error text-sm">{errorMessage}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.consent}
                    className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex w-full items-center justify-center rounded-lg px-8 py-3 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
                  >
                    {isSubmitting ? t("form.submitting") : t("form.submitButton")}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Direct Contact Info - Right Side (2 columns) */}
          <div className="lg:col-span-2">
            <h2 className="text-text mb-8 text-xl font-semibold sm:text-2xl">
              {t("direct.title")}
            </h2>

            <div className="space-y-6">
              {/* Email Card */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                    <svg
                      className="text-primary h-6 w-6"
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
                    <h3 className="text-text mb-1 font-semibold">{t("direct.email.title")}</h3>
                    <p className="text-text-muted mb-2 text-sm">{t("direct.email.description")}</p>
                    <a
                      href="mailto:info@currico.ch"
                      className="text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                      info@currico.ch
                    </a>
                  </div>
                </div>
              </div>

              {/* Response Time Info */}
              <div className="border-success/30 bg-success/10 flex items-center gap-3 rounded-lg border p-4">
                <svg
                  className="text-success h-5 w-5 flex-shrink-0"
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
                <p className="text-text-secondary text-sm">{t("direct.responseTime")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ CTA Section */}
        <div className="mt-12 text-center">
          <h2 className="text-text mb-4 text-xl font-semibold">{t("faq.title")}</h2>
          <p className="text-text-muted">{t("faq.description")}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
