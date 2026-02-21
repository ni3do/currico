import { createCipheriv, createDecipheriv, randomBytes, createHash, timingSafeEqual } from "crypto";
import { TOTP, Secret } from "otpauth";
import QRCode from "qrcode";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ISSUER = "Currico";

function getEncryptionKey(): Buffer {
  const hex = process.env.TOTP_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("TOTP_ENCRYPTION_KEY must be a 32-byte hex string (64 characters)");
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt a TOTP secret with AES-256-GCM
 */
export function encryptSecret(secret: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:encrypted (all hex)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt a TOTP secret from AES-256-GCM
 */
export function decryptSecret(encryptedStr: string): string {
  const key = getEncryptionKey();
  const parts = encryptedStr.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted secret format");
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = Buffer.from(parts[2], "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final("utf8");
}

/**
 * Generate a new TOTP setup (secret + QR code)
 */
export async function generateTOTPSetup(email: string): Promise<{
  secret: string;
  encrypted: string;
  qrCodeUrl: string;
}> {
  const totp = new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });

  const secret = totp.secret.base32;
  const encrypted = encryptSecret(secret);
  const otpauthUri = totp.toString();
  const qrCodeUrl = await QRCode.toDataURL(otpauthUri);

  return { secret, encrypted, qrCodeUrl };
}

/**
 * Validate a TOTP token against an encrypted secret
 * window=1 allows codes from the previous and next period (90s total)
 */
export function validateTOTP(token: string, encryptedSecret: string): boolean {
  const secret = decryptSecret(encryptedSecret);
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });

  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}

/**
 * Generate 10 single-use backup codes
 * Returns plaintext codes (shown once) and hashed versions (stored)
 */
export function generateBackupCodes(): {
  codes: string[];
  hashes: { hash: string; used: boolean }[];
} {
  const codes: string[] = [];
  const hashes: { hash: string; used: boolean }[] = [];

  for (let i = 0; i < 10; i++) {
    // 8-char alphanumeric code (lowercase for easy typing)
    const code = randomBytes(5).toString("hex").slice(0, 8);
    codes.push(code);
    hashes.push({
      hash: createHash("sha256").update(code).digest("hex"),
      used: false,
    });
  }

  return { codes, hashes };
}

/**
 * Safely parse backup_codes JSON field from Prisma
 * Returns validated array or empty array if data is corrupt
 */
export function parseBackupCodes(raw: unknown): { hash: string; used: boolean }[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is { hash: string; used: boolean } =>
      typeof entry === "object" &&
      entry !== null &&
      typeof entry.hash === "string" &&
      typeof entry.used === "boolean"
  );
}

/**
 * Validate a backup code against stored hashes (single-use, timing-safe)
 */
export function validateBackupCode(
  code: string,
  storedHashes: { hash: string; used: boolean }[]
): { valid: boolean; updatedHashes: { hash: string; used: boolean }[] } {
  const inputHash = createHash("sha256").update(code.toLowerCase().trim()).digest("hex");
  const inputHashBuffer = Buffer.from(inputHash, "hex");

  let found = false;
  const updatedHashes = storedHashes.map((entry) => {
    if (entry.used || found) return entry;
    const storedBuffer = Buffer.from(entry.hash, "hex");
    if (
      storedBuffer.length === inputHashBuffer.length &&
      timingSafeEqual(inputHashBuffer, storedBuffer)
    ) {
      found = true;
      return { ...entry, used: true };
    }
    return entry;
  });

  return { valid: found, updatedHashes };
}
