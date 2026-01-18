"use client";

interface PayoutFormProps {
  legalFirstName: string;
  legalLastName: string;
  iban: string;
  addressStreet: string;
  addressCity: string;
  addressPostal: string;
  onChange: (field: string, value: string | string[]) => void;
  errors: Record<string, string>;
}

export function PayoutForm({
  legalFirstName,
  legalLastName,
  iban,
  addressStreet,
  addressCity,
  addressPostal,
  onChange,
  errors,
}: PayoutFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="legal_first_name"
            className="mb-2 block text-sm font-medium text-text"
          >
            Vorname (rechtlich)
          </label>
          <input
            type="text"
            id="legal_first_name"
            name="legal_first_name"
            value={legalFirstName}
            onChange={(e) => onChange("legal_first_name", e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text focus:border-accent focus:outline-none"
          />
          {errors.legal_first_name && (
            <p className="mt-1 text-sm text-red-500">{errors.legal_first_name}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="legal_last_name"
            className="mb-2 block text-sm font-medium text-text"
          >
            Nachname (rechtlich)
          </label>
          <input
            type="text"
            id="legal_last_name"
            name="legal_last_name"
            value={legalLastName}
            onChange={(e) => onChange("legal_last_name", e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text focus:border-accent focus:outline-none"
          />
          {errors.legal_last_name && (
            <p className="mt-1 text-sm text-red-500">{errors.legal_last_name}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="iban" className="mb-2 block text-sm font-medium text-text">
          IBAN
        </label>
        <input
          type="text"
          id="iban"
          name="iban"
          value={iban}
          onChange={(e) => onChange("iban", e.target.value)}
          placeholder="CH00 0000 0000 0000 0000 0"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text focus:border-accent focus:outline-none"
        />
        {errors.iban && <p className="mt-1 text-sm text-red-500">{errors.iban}</p>}
      </div>

      <div>
        <label
          htmlFor="address_street"
          className="mb-2 block text-sm font-medium text-text"
        >
          Strasse und Hausnummer
        </label>
        <input
          type="text"
          id="address_street"
          name="address_street"
          value={addressStreet}
          onChange={(e) => onChange("address_street", e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text focus:border-accent focus:outline-none"
        />
        {errors.address_street && (
          <p className="mt-1 text-sm text-red-500">{errors.address_street}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="address_postal"
            className="mb-2 block text-sm font-medium text-text"
          >
            PLZ
          </label>
          <input
            type="text"
            id="address_postal"
            name="address_postal"
            value={addressPostal}
            onChange={(e) => onChange("address_postal", e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text focus:border-accent focus:outline-none"
          />
          {errors.address_postal && (
            <p className="mt-1 text-sm text-red-500">{errors.address_postal}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="address_city"
            className="mb-2 block text-sm font-medium text-text"
          >
            Ort
          </label>
          <input
            type="text"
            id="address_city"
            name="address_city"
            value={addressCity}
            onChange={(e) => onChange("address_city", e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text focus:border-accent focus:outline-none"
          />
          {errors.address_city && (
            <p className="mt-1 text-sm text-red-500">{errors.address_city}</p>
          )}
        </div>
      </div>
    </div>
  );
}
