"use client";

import { useState } from "react";
import { formatIBAN, isValidSwissIBAN } from "@/lib/utils/iban";

interface PayoutFormProps {
  legalFirstName: string;
  legalLastName: string;
  iban: string;
  addressStreet: string;
  addressCity: string;
  addressPostal: string;
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

export function PayoutForm({
  legalFirstName,
  legalLastName,
  iban,
  addressStreet,
  addressCity,
  addressPostal,
  onChange,
  errors = {},
}: PayoutFormProps) {
  const [ibanTouched, setIbanTouched] = useState(false);

  const handleIBANChange = (value: string) => {
    // Remove spaces and format
    const cleaned = value.replace(/\s/g, "").toUpperCase();
    onChange("iban", cleaned);
  };

  const ibanValid = iban ? isValidSwissIBAN(iban) : true;
  const showIBANError = ibanTouched && iban && !ibanValid;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-lg border border-[var(--color-warning)]/50 bg-[var(--color-warning)]/10 p-4">
        <svg
          className="h-5 w-5 flex-shrink-0 text-[var(--color-warning)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <p className="font-medium text-[var(--color-warning)]">
            Auszahlungsdaten erforderlich
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Diese Informationen werden für Rechnungen und Auszahlungen benötigt
            und sind nicht öffentlich sichtbar.
          </p>
        </div>
      </div>

      {/* Legal Name */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Vorname (rechtlich) <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            type="text"
            value={legalFirstName}
            onChange={(e) => onChange("legal_first_name", e.target.value)}
            placeholder="Maria"
            className={`w-full rounded-lg border bg-[var(--color-bg)] px-4 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
              errors.legal_first_name
                ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
                : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
            }`}
          />
          {errors.legal_first_name && (
            <p className="mt-1 text-sm text-[var(--color-error)]">{errors.legal_first_name}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Nachname (rechtlich) <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            type="text"
            value={legalLastName}
            onChange={(e) => onChange("legal_last_name", e.target.value)}
            placeholder="Schmidt"
            className={`w-full rounded-lg border bg-[var(--color-bg)] px-4 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
              errors.legal_last_name
                ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
                : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
            }`}
          />
          {errors.legal_last_name && (
            <p className="mt-1 text-sm text-[var(--color-error)]">{errors.legal_last_name}</p>
          )}
        </div>
      </div>

      {/* IBAN */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
          IBAN (Schweiz) <span className="text-[var(--color-error)]">*</span>
        </label>
        <input
          type="text"
          value={iban ? formatIBAN(iban) : ""}
          onChange={(e) => handleIBANChange(e.target.value)}
          onBlur={() => setIbanTouched(true)}
          placeholder="CH93 0076 2011 6238 5295 7"
          className={`w-full rounded-lg border bg-[var(--color-bg)] px-4 py-2 font-mono text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
            showIBANError || errors.iban
              ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
              : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
          }`}
        />
        {showIBANError && (
          <p className="mt-1 text-sm text-[var(--color-error)]">
            Bitte geben Sie eine gültige Schweizer IBAN ein
          </p>
        )}
        {errors.iban && <p className="mt-1 text-sm text-[var(--color-error)]">{errors.iban}</p>}
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Schweizer IBAN beginnt mit CH und hat 21 Zeichen
        </p>
      </div>

      {/* Address (optional) */}
      <div className="border-t border-[var(--color-border)] pt-6">
        <h4 className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">
          Adresse (optional, für Rechnungen)
        </h4>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Strasse und Hausnummer
            </label>
            <input
              type="text"
              value={addressStreet}
              onChange={(e) => onChange("address_street", e.target.value)}
              placeholder="Bahnhofstrasse 1"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                PLZ
              </label>
              <input
                type="text"
                value={addressPostal}
                onChange={(e) => onChange("address_postal", e.target.value)}
                placeholder="8001"
                maxLength={4}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Ort
              </label>
              <input
                type="text"
                value={addressCity}
                onChange={(e) => onChange("address_city", e.target.value)}
                placeholder="Zürich"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
