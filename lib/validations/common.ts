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
