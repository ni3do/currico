/**
 * Swiss IBAN Validation Utilities
 * Swiss IBANs have 21 characters and start with "CH"
 * Format: CHxx xxxx xxxx xxxx xxxx x
 */

// Remove spaces and convert to uppercase
function normalizeIBAN(iban: string): string {
  return iban.replace(/\s/g, "").toUpperCase();
}

// Validate Swiss IBAN format and checksum
export function isValidSwissIBAN(iban: string): boolean {
  const normalized = normalizeIBAN(iban);

  // Swiss IBAN must be 21 characters and start with CH
  if (normalized.length !== 21 || !normalized.startsWith("CH")) {
    return false;
  }

  // Check if it contains only valid characters (letters and digits)
  if (!/^[A-Z0-9]+$/.test(normalized)) {
    return false;
  }

  // Validate checksum using mod-97 algorithm
  return validateIBANChecksum(normalized);
}

// MOD-97 checksum validation (ISO 7064)
function validateIBANChecksum(iban: string): boolean {
  // Move first 4 characters to end
  const rearranged = iban.slice(4) + iban.slice(0, 4);

  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  let numericString = "";
  for (const char of rearranged) {
    if (char >= "A" && char <= "Z") {
      numericString += (char.charCodeAt(0) - 55).toString();
    } else {
      numericString += char;
    }
  }

  // Calculate mod 97 using string arithmetic (to handle large numbers)
  let remainder = 0;
  for (const digit of numericString) {
    remainder = (remainder * 10 + parseInt(digit, 10)) % 97;
  }

  return remainder === 1;
}

// Format IBAN with spaces for display
export function formatIBAN(iban: string): string {
  const normalized = normalizeIBAN(iban);
  // Format: CHxx xxxx xxxx xxxx xxxx x
  return normalized.replace(/(.{4})/g, "$1 ").trim();
}

// Mask IBAN for display (show only last 4 characters)
export function maskIBAN(iban: string): string {
  const normalized = normalizeIBAN(iban);
  if (normalized.length < 4) return "****";

  const lastFour = normalized.slice(-4);
  const masked = "CH** **** **** **** *" + lastFour.slice(-1);
  return masked;
}
