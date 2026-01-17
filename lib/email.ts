import { Resend } from "resend";

const APP_NAME = "EasyLehrer";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

function getFromEmail(): string {
  return process.env.EMAIL_FROM || "noreply@easylehrer.ch";
}

interface SendEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send an email verification link to a user
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  locale: string = "de"
): Promise<SendEmailResult> {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/${locale}/auth/verify-email?token=${token}`;

  const subject =
    locale === "de"
      ? `${APP_NAME}: E-Mail-Adresse bestätigen`
      : `${APP_NAME}: Verify your email address`;

  const textContent =
    locale === "de"
      ? `Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie folgenden Link öffnen:\n\n${verifyUrl}\n\nDieser Link ist 24 Stunden gültig.\n\nFalls Sie diese E-Mail nicht angefordert haben, können Sie sie ignorieren.`
      : `Please verify your email address by opening the following link:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.\n\nIf you did not request this email, you can safely ignore it.`;

  const htmlContent =
    locale === "de"
      ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>E-Mail bestätigen</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a365d; margin-bottom: 24px;">E-Mail-Adresse bestätigen</h1>
  <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den Button unten klicken:</p>
  <p style="margin: 32px 0;">
    <a href="${verifyUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">E-Mail bestätigen</a>
  </p>
  <p style="color: #666; font-size: 14px;">Dieser Link ist 24 Stunden gültig.</p>
  <p style="color: #666; font-size: 14px;">Falls Sie diese E-Mail nicht angefordert haben, können Sie sie ignorieren.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="color: #999; font-size: 12px;">${APP_NAME} - Bildungsplattform Schweiz</p>
</body>
</html>
`
      : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a365d; margin-bottom: 24px;">Verify your email address</h1>
  <p>Please verify your email address by clicking the button below:</p>
  <p style="margin: 32px 0;">
    <a href="${verifyUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Verify Email</a>
  </p>
  <p style="color: #666; font-size: 14px;">This link is valid for 24 hours.</p>
  <p style="color: #666; font-size: 14px;">If you did not request this email, you can safely ignore it.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="color: #999; font-size: 12px;">${APP_NAME} - Swiss Education Platform</p>
</body>
</html>
`;

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });

    if (error) {
      console.error("Failed to send verification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error sending verification email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Generate a secure random token for email verification
 */
export function generateVerificationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Token expiration time (24 hours)
 */
export const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
