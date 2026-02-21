"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, AlertCircle, Mail } from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/ui/animations";

// Swiss phone number pattern: +41/0 prefix, 9-10 digits
const SWISS_PHONE_PATTERN = /^(\+41|0)\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

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
  const [honeypot, setHoneypot] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceId, setReferenceId] = useState<string | null>(null);

  // Warn user about unsaved changes when navigating away
  const hasFormData = formData.name || formData.email || formData.phone || formData.message;
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasFormData && submitStatus !== "success") {
        e.preventDefault();
      }
    },
    [hasFormData, submitStatus]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear phone error on edit
    if (name === "phone") {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — bots fill hidden fields
    if (honeypot) return;

    // Validate phone if provided
    if (formData.phone && !SWISS_PHONE_PATTERN.test(formData.phone.trim())) {
      setPhoneError(t("form.phoneError"));
      return;
    }

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
        throw new Error(data.error || tCommon("errors.sendFailed"));
      }

      setReferenceId(data.id ?? null);
      setSubmitStatus("success");
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : tCommon("errors.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 2xl:max-w-[1440px]">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.contact") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("hero.title")}</h1>
          <p className="text-text-muted mt-1">{t("hero.subtitle")}</p>
        </div>

        {/* FAQ CTA Section */}
        <div className="border-border bg-surface mb-8 flex flex-col items-center gap-3 rounded-xl border p-6 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <h2 className="text-text text-lg font-semibold">{t("faq.title")}</h2>
            <p className="text-text-muted mt-1 text-sm">{t("faq.description")}</p>
          </div>
          <Link
            href="/hilfe"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            {t("faq.linkLabel")}
          </Link>
        </div>

        {/* Contact Form & Info Section */}
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Contact Form - Left Side (3 columns) */}
          <FadeIn className="lg:col-span-3">
            <div className="card p-8 sm:p-10">
              <h2 className="text-text mb-8 text-xl font-semibold sm:text-2xl">
                {t("form.title")}
              </h2>

              {submitStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-success-light mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                    <Check className="text-success h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="text-text mb-2 text-lg font-semibold">{t("form.successTitle")}</h3>
                  <p className="text-text-muted">{t("form.successMessage")}</p>
                  <p className="text-text-muted mt-2 text-sm">{t("form.successNextSteps")}</p>
                  {referenceId && (
                    <p className="bg-bg-secondary mt-4 inline-block rounded-lg px-4 py-2 text-sm">
                      <span className="text-text-muted">{t("form.referenceLabel")}</span>{" "}
                      <span className="text-text font-mono font-medium">{referenceId}</span>
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field — hidden from users, catches bots */}
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

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
                        autoComplete="name"
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
                        autoComplete="email"
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
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("form.phonePlaceholder")}
                      className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                    />
                    <p className="text-text-muted mt-2 text-sm">{t("form.phoneHint")}</p>
                    {phoneError && <p className="text-error mt-1 text-sm">{phoneError}</p>}
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
                      className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-full border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                    >
                      <option value="">{t("form.subjectPlaceholder")}</option>
                      <option value="general">{t("form.subjects.general")}</option>
                      <option value="feedback">{t("form.subjects.feedback")}</option>
                      <option value="partnership">{t("form.subjects.partnership")}</option>
                      <option value="support">{t("form.subjects.support")}</option>
                      <option value="sales">{t("form.subjects.sales")}</option>
                      <option value="refund">{t("form.subjects.refund")}</option>
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
                    <label htmlFor="consent" className="text-text-muted text-sm leading-relaxed">
                      {t("form.consentText")}
                    </label>
                  </div>

                  {/* Error Message */}
                  {submitStatus === "error" && errorMessage && (
                    <div className="border-error/50 bg-error/10 flex items-center gap-3 rounded-lg border p-4">
                      <AlertCircle
                        className="text-error h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <p className="text-error text-sm">{errorMessage}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.consent}
                    className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex w-full items-center justify-center rounded-lg px-8 py-3 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
                  >
                    {isSubmitting ? t("form.submitting") : t("form.submitButton")}
                  </button>
                </form>
              )}
            </div>
          </FadeIn>

          {/* Direct Contact Info - Right Side (2 columns) */}
          <FadeIn delay={0.1} className="lg:col-span-2">
            <h2 className="text-text mb-8 text-xl font-semibold sm:text-2xl">
              {t("direct.title")}
            </h2>

            <div className="space-y-6">
              {/* Email Card */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                    <Mail className="text-primary h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-text mb-1 font-semibold">{t("direct.email.title")}</h3>
                    <p className="text-text-muted mb-2 text-sm">{t("direct.email.description")}</p>
                    <a
                      href={`mailto:${t("direct.emailAddress")}`}
                      className="text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                      {t("direct.emailAddress")}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </main>

      <Footer />
    </div>
  );
}
