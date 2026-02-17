/**
 * Common validation utilities used across the application
 */

/**
 * Validates an email address format
 * @param email - The email address to validate
 * @returns true if the email format is valid
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates password meets minimum requirements
 * @param password - The password to validate
 * @param minLength - Minimum length (default: 8)
 * @returns true if the password meets requirements
 */
export function isValidPassword(password: string, minLength: number = 8): boolean {
  return password.length >= minLength;
}

// Common passwords that should be rejected (top frequently-used passwords >= 8 chars)
const COMMON_PASSWORDS = new Set([
  "password",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyui",
  "abcdefgh",
  "abc12345",
  "password1",
  "iloveyou",
  "sunshine",
  "princess",
  "football",
  "trustno1",
  "baseball",
  "letmein1",
  "superman",
  "passw0rd",
  "master12",
  "welcome1",
  "shadow12",
  "michael1",
  "qwerty12",
  "dragon12",
  "mustang1",
  "jennifer",
  "12341234",
  "11111111",
  "00000000",
  "abcd1234",
  "asdfghjk",
  "zxcvbnm1",
  "qwertzui",
  "passwort",
  "hallo123",
  "geheim12",
]);

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

export interface PasswordRequirement {
  key: string;
  met: boolean;
}

export function checkPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { key: "minLength", met: password.length >= 8 },
    { key: "uppercase", met: /[A-Z]/.test(password) },
    { key: "lowercase", met: /[a-z]/.test(password) },
    { key: "number", met: /\d/.test(password) },
  ];
}

export type PasswordStrength = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 8 || isCommonPassword(password)) return "weak";

  const reqs = checkPasswordRequirements(password);
  const metCount = reqs.filter((r) => r.met).length;

  if (metCount === 4 && (password.length >= 12 || /[^a-zA-Z0-9]/.test(password))) {
    return "strong";
  }

  if (metCount >= 3) return "medium";

  return "weak";
}
