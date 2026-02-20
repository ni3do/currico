"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  Shield,
  Trash2,
  Check,
  X,
  Mail,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAccountData } from "@/lib/hooks/useAccountData";

type TwoFactorState = "disabled" | "setup" | "enabled";

export default function SettingsAccountPage() {
  const { userData, refreshUserData } = useAccountData();
  const t = useTranslations("accountPage.settingsAccount");

  // Email verification resend state
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA state
  const [twoFactorState, setTwoFactorState] = useState<TwoFactorState>(
    userData?.twoFactorEnabled ? "enabled" : "disabled"
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [showManualSecret, setShowManualSecret] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);
  // Password prompt for disable/regenerate
  const [passwordPromptAction, setPasswordPromptAction] = useState<"disable" | "regenerate" | null>(
    null
  );
  const [promptPassword, setPromptPassword] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Password validation
  const passwordMinLength = newPassword.length >= 8;
  const passwordHasPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword);
  const passwordValid = passwordMinLength && passwordHasPattern;
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmitPassword =
    currentPassword.length > 0 && passwordValid && passwordsMatch && confirmPassword.length > 0;

  // Derive 2FA state from userData when it loads (only if we haven't started setup)
  const effectiveTwoFactorState =
    twoFactorState === "setup" || backupCodes
      ? twoFactorState
      : userData?.twoFactorEnabled
        ? "enabled"
        : "disabled";

  // Resend email verification
  const handleResendVerification = async () => {
    if (verificationSending) return;

    setVerificationSending(true);
    setVerificationError(null);

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("sendError"));
      }

      setVerificationSent(true);
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : t("genericError"));
    } finally {
      setVerificationSending(false);
    }
  };

  // Map API error codes to i18n keys
  const mapPasswordError = (code: string): string => {
    const errorMap: Record<string, string> = {
      RATE_LIMITED: "password.errorRateLimited",
      FIELDS_REQUIRED: "password.errorFieldsRequired",
      PASSWORDS_MISMATCH: "password.mismatch",
      PASSWORD_TOO_SHORT: "password.requirements",
      PASSWORD_TOO_WEAK: "password.requirements",
      CURRENT_PASSWORD_WRONG: "password.errorCurrentWrong",
      SAME_PASSWORD: "password.errorSamePassword",
      NO_PASSWORD_SET: "password.oauthMessage",
      USER_NOT_FOUND: "password.genericError",
    };
    const key = errorMap[code];
    return key ? t(key) : t("password.genericError");
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitPassword || passwordChanging) return;

    setPasswordChanging(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setPasswordError(mapPasswordError(data.error));
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError(t("password.genericError"));
    } finally {
      setPasswordChanging(false);
    }
  };

  // 2FA: Start setup
  const handleStartSetup = async () => {
    setTwoFactorLoading(true);
    setTwoFactorError(null);

    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "RATE_LIMITED") {
          setTwoFactorError(t("twoFactor.errorRateLimited"));
        } else {
          setTwoFactorError(t("twoFactor.setup.errorGeneric"));
        }
        return;
      }

      const { qrCodeUrl: qr, secret } = await res.json();
      setQrCodeUrl(qr);
      setManualSecret(secret);
      setTwoFactorState("setup");
    } catch {
      setTwoFactorError(t("twoFactor.setup.errorGeneric"));
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // 2FA: Verify code to complete setup
  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    setTwoFactorError(null);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: totpCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "INVALID_CODE") {
          setTwoFactorError(t("twoFactor.setup.invalidCode"));
        } else if (data.error === "RATE_LIMITED") {
          setTwoFactorError(t("twoFactor.errorRateLimited"));
        } else {
          setTwoFactorError(t("twoFactor.setup.errorGeneric"));
        }
        return;
      }

      const { backupCodes: codes } = await res.json();
      setBackupCodes(codes);
      setTwoFactorState("enabled");
      setTotpCode("");
      setQrCodeUrl(null);
      setManualSecret(null);
      await refreshUserData();
    } catch {
      setTwoFactorError(t("twoFactor.setup.errorGeneric"));
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // 2FA: Cancel setup
  const handleCancelSetup = () => {
    setTwoFactorState("disabled");
    setQrCodeUrl(null);
    setManualSecret(null);
    setTotpCode("");
    setTwoFactorError(null);
  };

  // 2FA: Password prompt actions (disable / regenerate)
  const handlePasswordPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordPromptAction) return;

    setPromptLoading(true);
    setPromptError(null);

    try {
      const endpoint =
        passwordPromptAction === "disable"
          ? "/api/auth/2fa/disable"
          : "/api/auth/2fa/regenerate-backup-codes";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: promptPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "WRONG_PASSWORD") {
          setPromptError(t("twoFactor.passwordPrompt.wrongPassword"));
        } else if (data.error === "RATE_LIMITED") {
          setPromptError(t("twoFactor.errorRateLimited"));
        } else {
          setPromptError(t("twoFactor.passwordPrompt.errorGeneric"));
        }
        return;
      }

      if (passwordPromptAction === "disable") {
        setTwoFactorState("disabled");
        setBackupCodes(null);
      } else {
        const { backupCodes: codes } = await res.json();
        setBackupCodes(codes);
      }

      setPasswordPromptAction(null);
      setPromptPassword("");
      await refreshUserData();
    } catch {
      setPromptError(t("twoFactor.passwordPrompt.errorGeneric"));
    } finally {
      setPromptLoading(false);
    }
  };

  // Copy secret to clipboard
  const handleCopySecret = async () => {
    if (!manualSecret) return;
    await navigator.clipboard.writeText(manualSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  // Copy all backup codes
  const handleCopyBackupCodes = async () => {
    if (!backupCodes) return;
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setBackupCodesCopied(true);
    setTimeout(() => setBackupCodesCopied(false), 2000);
  };

  // Count remaining backup codes from userData
  const backupCodesRemaining = userData?.backupCodesRemaining ?? 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-text text-xl font-semibold">{t("title")}</h2>
        <p className="text-text-muted mt-1 text-sm">{t("subtitle")}</p>
      </div>

      {/* Account Info Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Shield className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-text font-semibold">{t("accountStatus")}</h3>
              <p className="text-text-muted text-sm">{t("accountStatusDesc")}</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-border rounded-lg border p-4">
              <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                {t("accountType")}
              </p>
              <p className="text-text mt-1 font-semibold">
                {userData?.isSeller ? t("seller") : t("buyer")}
              </p>
            </div>
            <div className="border-border rounded-lg border p-4">
              <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                {t("emailStatus")}
              </p>
              <div className="mt-1">
                {userData?.emailVerified ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-success/20 rounded-full p-1">
                      <Check className="text-success h-3 w-3" />
                    </div>
                    <span className="text-success font-semibold">{t("verified")}</span>
                  </div>
                ) : verificationSent ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-success/20 rounded-full p-1">
                      <Mail className="text-success h-3 w-3" />
                    </div>
                    <span className="text-success text-sm font-semibold">{t("emailSent")}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleResendVerification}
                    disabled={verificationSending}
                    className="group flex items-center gap-2 transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="bg-warning/20 rounded-full p-1">
                      {verificationSending ? (
                        <div className="border-warning h-3 w-3 animate-spin rounded-full border border-t-transparent" />
                      ) : (
                        <X className="text-warning h-3 w-3" />
                      )}
                    </div>
                    <span className="text-warning font-semibold group-hover:underline">
                      {verificationSending ? t("sending") : t("notVerified")}
                    </span>
                    {!verificationSending && (
                      <span className="text-text-muted text-xs">{t("clickToSend")}</span>
                    )}
                  </button>
                )}
                {verificationError && (
                  <p className="text-error mt-1 text-xs">{verificationError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Lock className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-text font-semibold">{t("password.title")}</h3>
              <p className="text-text-muted text-sm">{t("password.subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {userData?.hasPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-text mb-1 block text-sm font-medium">
                  {t("password.currentPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordError(null);
                      setPasswordSuccess(false);
                    }}
                    placeholder={t("password.currentPlaceholder")}
                    autoComplete="current-password"
                    className="border-border bg-surface text-text w-full rounded-lg border px-4 py-3 pr-12 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2"
                    aria-label={t(
                      showCurrentPassword ? "password.hidePassword" : "password.showPassword"
                    )}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-text mb-1 block text-sm font-medium">
                  {t("password.newPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError(null);
                      setPasswordSuccess(false);
                    }}
                    placeholder={t("password.newPlaceholder")}
                    autoComplete="new-password"
                    className="border-border bg-surface text-text w-full rounded-lg border px-4 py-3 pr-12 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2"
                    aria-label={t(
                      showNewPassword ? "password.hidePassword" : "password.showPassword"
                    )}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword.length > 0 && !passwordValid && (
                  <p className="text-warning mt-1 text-xs">{t("password.requirements")}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-text mb-1 block text-sm font-medium">
                  {t("password.confirmPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError(null);
                      setPasswordSuccess(false);
                    }}
                    placeholder={t("password.confirmPlaceholder")}
                    autoComplete="new-password"
                    className="border-border bg-surface text-text w-full rounded-lg border px-4 py-3 pr-12 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2"
                    aria-label={t(
                      showConfirmPassword ? "password.hidePassword" : "password.showPassword"
                    )}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-error mt-1 text-xs">{t("password.mismatch")}</p>
                )}
              </div>

              {/* Error / Success feedback */}
              {passwordError && <p className="text-error text-sm">{passwordError}</p>}
              {passwordSuccess && (
                <div className="flex items-center gap-2">
                  <div className="bg-success/20 rounded-full p-1">
                    <Check className="text-success h-3 w-3" />
                  </div>
                  <span className="text-success text-sm font-semibold">
                    {t("password.success")}
                  </span>
                </div>
              )}

              {/* Submit + forgot password link */}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={!canSubmitPassword || passwordChanging}
                  className="bg-primary text-text-on-accent hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordChanging ? t("password.submitting") : t("password.submit")}
                </button>
                <Link href="/passwort-vergessen" className="text-primary text-sm hover:underline">
                  {t("password.forgotPasswordLink")}
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-text-secondary text-sm">{t("password.oauthMessage")}</p>
              <Link
                href="/passwort-vergessen"
                className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                {t("password.setPasswordLink")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Smartphone className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-text font-semibold">{t("twoFactor.title")}</h3>
              <p className="text-text-muted text-sm">{t("twoFactor.subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {/* Backup codes display (shown after setup or regenerate) */}
          {backupCodes && (
            <div className="mb-6 space-y-4">
              <div className="bg-warning/10 border-warning/30 rounded-lg border p-4">
                <h4 className="text-warning mb-1 text-sm font-semibold">
                  {t("twoFactor.backupCodes.title")}
                </h4>
                <p className="text-text-muted text-xs">{t("twoFactor.backupCodes.warning")}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, i) => (
                  <div
                    key={i}
                    className="border-border rounded-lg border px-3 py-2 text-center font-mono text-sm tracking-wider"
                  >
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCopyBackupCodes}
                  className="border-border text-text hover:bg-surface-elevated inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
                >
                  {backupCodesCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      {t("twoFactor.backupCodes.copied")}
                    </>
                  ) : (
                    t("twoFactor.backupCodes.copyAll")
                  )}
                </button>
                <button
                  onClick={() => setBackupCodes(null)}
                  className="bg-primary text-text-on-accent hover:bg-primary/90 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  {t("twoFactor.backupCodes.close")}
                </button>
              </div>
            </div>
          )}

          {/* Password prompt modal (for disable / regenerate) */}
          {passwordPromptAction && (
            <div className="mb-6">
              <form onSubmit={handlePasswordPromptSubmit} className="space-y-4">
                <div>
                  <h4 className="text-text mb-1 font-semibold">
                    {t("twoFactor.passwordPrompt.title")}
                  </h4>
                  <p className="text-text-muted text-sm">
                    {t("twoFactor.passwordPrompt.description")}
                  </p>
                </div>
                <div>
                  <label className="text-text mb-1 block text-sm font-medium">
                    {t("twoFactor.passwordPrompt.passwordLabel")}
                  </label>
                  <input
                    type="password"
                    value={promptPassword}
                    onChange={(e) => {
                      setPromptPassword(e.target.value);
                      setPromptError(null);
                    }}
                    placeholder={t("twoFactor.passwordPrompt.passwordPlaceholder")}
                    autoComplete="current-password"
                    className="border-border bg-surface text-text w-full rounded-lg border px-4 py-3 text-sm"
                  />
                </div>
                {promptError && <p className="text-error text-sm">{promptError}</p>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordPromptAction(null);
                      setPromptPassword("");
                      setPromptError(null);
                    }}
                    className="border-border text-text hover:bg-surface-elevated rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  >
                    {t("twoFactor.passwordPrompt.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={!promptPassword || promptLoading}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      passwordPromptAction === "disable"
                        ? "bg-error text-text-on-accent hover:bg-error/90"
                        : "bg-primary text-text-on-accent hover:bg-primary/90"
                    }`}
                  >
                    {promptLoading
                      ? t("twoFactor.passwordPrompt.confirming")
                      : t("twoFactor.passwordPrompt.confirm")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Main 2FA content (hidden when showing prompt/backup codes) */}
          {!passwordPromptAction && !backupCodes && (
            <>
              {/* OAuth-only users without password */}
              {!userData?.hasPassword ? (
                <div className="space-y-3">
                  <p className="text-text-secondary text-sm">{t("twoFactor.requiresPassword")}</p>
                  <Link
                    href="/passwort-vergessen"
                    className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  >
                    {t("password.setPasswordLink")}
                  </Link>
                </div>
              ) : effectiveTwoFactorState === "disabled" ? (
                /* Disabled state */
                <div className="space-y-4">
                  <p className="text-text-muted text-sm">{t("twoFactor.disabled.description")}</p>
                  {twoFactorError && <p className="text-error text-sm">{twoFactorError}</p>}
                  <button
                    onClick={handleStartSetup}
                    disabled={twoFactorLoading}
                    className="bg-primary text-text-on-accent hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Smartphone className="h-4 w-4" />
                    {twoFactorLoading
                      ? t("twoFactor.setup.verifying")
                      : t("twoFactor.disabled.enable")}
                  </button>
                </div>
              ) : effectiveTwoFactorState === "setup" ? (
                /* Setup state */
                <div className="space-y-5">
                  <p className="text-text-muted text-sm">{t("twoFactor.setup.step1")}</p>

                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div className="flex justify-center">
                      <div className="rounded-xl bg-white p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrCodeUrl} alt="QR Code" className="h-48 w-48" />
                      </div>
                    </div>
                  )}

                  {/* Manual secret entry */}
                  <div>
                    <button
                      onClick={() => setShowManualSecret(!showManualSecret)}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      {t("twoFactor.setup.manualEntry")}
                    </button>
                    {showManualSecret && manualSecret && (
                      <div className="mt-2 flex items-center gap-2">
                        <code className="bg-surface-elevated text-text flex-1 rounded-lg px-3 py-2 font-mono text-xs break-all">
                          {manualSecret}
                        </code>
                        <button
                          onClick={handleCopySecret}
                          className="border-border text-text hover:bg-surface-elevated shrink-0 rounded-lg border px-2 py-1.5 text-xs transition-colors"
                        >
                          {secretCopied
                            ? t("twoFactor.setup.copied")
                            : t("twoFactor.backupCodes.copyAll")}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Verification form */}
                  <form onSubmit={handleVerifySetup} className="space-y-4">
                    <p className="text-text-muted text-sm">{t("twoFactor.setup.step2")}</p>
                    <div>
                      <label className="text-text mb-1 block text-sm font-medium">
                        {t("twoFactor.setup.verifyLabel")}
                      </label>
                      <input
                        type="text"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder={t("twoFactor.setup.verifyPlaceholder")}
                        className="border-border bg-surface text-text w-full rounded-lg border px-4 py-3 text-center text-lg tracking-widest"
                      />
                    </div>
                    {twoFactorError && <p className="text-error text-sm">{twoFactorError}</p>}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleCancelSetup}
                        className="border-border text-text hover:bg-surface-elevated rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                      >
                        {t("twoFactor.setup.cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={totpCode.length !== 6 || twoFactorLoading}
                        className="bg-primary text-text-on-accent hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {twoFactorLoading
                          ? t("twoFactor.setup.verifying")
                          : t("twoFactor.setup.verify")}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Enabled state */
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-success/20 rounded-full p-1">
                      <Check className="text-success h-3 w-3" />
                    </div>
                    <span className="text-success text-sm font-semibold">
                      {t("twoFactor.enabled.status")}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm">{t("twoFactor.enabled.description")}</p>

                  {typeof backupCodesRemaining === "number" && (
                    <p className="text-text-muted text-xs">
                      {t("twoFactor.enabled.backupCodesRemaining", { count: backupCodesRemaining })}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setPasswordPromptAction("regenerate")}
                      className="border-border text-text hover:bg-surface-elevated inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                    >
                      {t("twoFactor.enabled.regenerateCodes")}
                    </button>
                    <button
                      onClick={() => setPasswordPromptAction("disable")}
                      className="border-error text-error hover:bg-error hover:text-text-on-accent inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                    >
                      {t("twoFactor.enabled.disable")}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="border-error/30 bg-error/5 rounded-xl border">
        <div className="border-error/30 border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-error/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Trash2 className="text-error h-5 w-5" />
            </div>
            <div>
              <h3 className="text-error font-semibold">{t("dangerZone")}</h3>
              <p className="text-text-muted text-sm">{t("dangerZoneDesc")}</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {!showDeleteConfirm ? (
            <>
              <p className="text-text-secondary mb-4 text-sm">{t("deleteWarning")}</p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="border-error text-error hover:bg-error hover:text-text-on-accent inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {t("deleteAccount")}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-error/10 flex items-start gap-3 rounded-lg p-4">
                <AlertTriangle className="text-error mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-error text-sm font-semibold">{t("areYouSure")}</p>
                  <p className="text-text-secondary mt-1 text-sm">{t("deleteConfirmDesc")}</p>
                  <ul className="text-text-secondary mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <X className="text-error h-3.5 w-3.5 flex-shrink-0" />
                      {t("deleteConsequences.materials")}
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="text-error h-3.5 w-3.5 flex-shrink-0" />
                      {t("deleteConsequences.purchases")}
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="text-error h-3.5 w-3.5 flex-shrink-0" />
                      {t("deleteConsequences.reviews")}
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="text-error h-3.5 w-3.5 flex-shrink-0" />
                      {t("deleteConsequences.earnings")}
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="text-error h-3.5 w-3.5 flex-shrink-0" />
                      {t("deleteConsequences.followers")}
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <label className="text-text-muted mb-1 block text-xs">
                  {t.rich("typeToConfirm", {
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="border-border bg-surface text-text w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder={t("confirmKeyword")}
                />
              </div>
              {deleteError && <p className="text-error text-sm">{deleteError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                    setDeleteError(null);
                  }}
                  className="border-border text-text hover:bg-surface-elevated rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true);
                    setDeleteError(null);
                    try {
                      const response = await fetch("/api/users/me", {
                        method: "DELETE",
                      });
                      if (response.ok) {
                        await signOut({ callbackUrl: "/" });
                      } else {
                        const data = await response.json();
                        setDeleteError(data.error || t("deleteError"));
                      }
                    } catch {
                      setDeleteError(t("networkError"));
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  disabled={deleteConfirmText !== t("confirmKeyword") || deleting}
                  className="bg-error text-text-on-accent hover:bg-error/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? t("deleting") : t("deletePermanently")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
