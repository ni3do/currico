"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Shield, Trash2, Check, X, Mail, AlertTriangle } from "lucide-react";
import { useAccountData } from "@/lib/hooks/useAccountData";

export default function SettingsAccountPage() {
  const { userData } = useAccountData();

  // Email verification resend state
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        throw new Error(data.error || "Fehler beim Senden");
      }

      setVerificationSent(true);
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten");
    } finally {
      setVerificationSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-text text-xl font-semibold">Konto & Sicherheit</h2>
        <p className="text-text-muted mt-1 text-sm">
          Verwalten Sie Ihre Kontoeinstellungen und Sicherheitsoptionen
        </p>
      </div>

      {/* Account Info Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Shield className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-text font-semibold">Kontostatus</h3>
              <p className="text-text-muted text-sm">Informationen zu Ihrem Konto</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-border rounded-lg border p-4">
              <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                Kontotyp
              </p>
              <p className="text-text mt-1 font-semibold">
                {userData?.isSeller ? "Verkäufer" : "Käufer"}
              </p>
            </div>
            <div className="border-border rounded-lg border p-4">
              <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                E-Mail-Status
              </p>
              <div className="mt-1">
                {userData?.emailVerified ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-success/20 rounded-full p-1">
                      <Check className="text-success h-3 w-3" />
                    </div>
                    <span className="text-success font-semibold">Verifiziert</span>
                  </div>
                ) : verificationSent ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-success/20 rounded-full p-1">
                      <Mail className="text-success h-3 w-3" />
                    </div>
                    <span className="text-success text-sm font-semibold">E-Mail gesendet!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleResendVerification}
                    disabled={verificationSending}
                    className="group flex items-center gap-2 transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="bg-warning/20 rounded-full p-1">
                      {verificationSending ? (
                        <div className="border-warning h-3 w-3 animate-spin rounded-full border border-t-transparent" />
                      ) : (
                        <X className="text-warning h-3 w-3" />
                      )}
                    </div>
                    <span className="text-warning font-semibold group-hover:underline">
                      {verificationSending ? "Wird gesendet..." : "Nicht verifiziert"}
                    </span>
                    {!verificationSending && (
                      <span className="text-text-muted text-xs">(Klicken zum Senden)</span>
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

      {/* Danger Zone Card */}
      <div className="border-error/30 bg-error/5 rounded-xl border">
        <div className="border-error/30 border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-error/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Trash2 className="text-error h-5 w-5" />
            </div>
            <div>
              <h3 className="text-error font-semibold">Gefahrenzone</h3>
              <p className="text-text-muted text-sm">Unwiderrufliche Aktionen</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {!showDeleteConfirm ? (
            <>
              <p className="text-text-secondary mb-4 text-sm">
                Das Löschen Ihres Kontos ist unwiderruflich. Alle Ihre Daten, hochgeladenen
                Materialien und Käufe werden permanent gelöscht.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="border-error text-error hover:bg-error hover:text-text-on-accent inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Konto löschen
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-error/10 flex items-start gap-3 rounded-lg p-4">
                <AlertTriangle className="text-error mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-error text-sm font-semibold">Sind Sie sicher?</p>
                  <p className="text-text-secondary mt-1 text-sm">
                    Diese Aktion kann nicht rückgängig gemacht werden. Alle Materialien, Bewertungen
                    und Kontodaten werden gelöscht.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-text-muted mb-1 block text-xs">
                  Tippen Sie <strong>LÖSCHEN</strong> zur Bestätigung
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="border-border bg-surface text-text w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="LÖSCHEN"
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
                  Abbrechen
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
                        setDeleteError(data.error || "Fehler beim Löschen");
                      }
                    } catch {
                      setDeleteError("Netzwerkfehler");
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  disabled={deleteConfirmText !== "LÖSCHEN" || deleting}
                  className="bg-error text-text-on-accent hover:bg-error/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Wird gelöscht..." : "Endgültig löschen"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
