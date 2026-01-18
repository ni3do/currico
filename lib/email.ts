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

interface PurchaseEmailParams {
  email: string;
  resourceTitle: string;
  amount: number; // Amount in cents
  downloadToken?: string; // For guest checkout
  isGuest: boolean;
  locale?: string;
}

/**
 * Send a purchase confirmation email with download link
 */
export async function sendPurchaseConfirmationEmail({
  email,
  resourceTitle,
  amount,
  downloadToken,
  isGuest,
  locale = "de",
}: PurchaseEmailParams): Promise<SendEmailResult> {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";

  // Format price (cents to CHF with 2 decimals)
  const formattedPrice = (amount / 100).toFixed(2);

  // Build the appropriate download/library link
  const downloadLink = isGuest && downloadToken
    ? `${baseUrl}/${locale}/download/${downloadToken}`
    : `${baseUrl}/${locale}/account/library`;

  const subject =
    locale === "de"
      ? `${APP_NAME}: Kaufbestätigung - ${resourceTitle}`
      : `${APP_NAME}: Purchase Confirmation - ${resourceTitle}`;

  const downloadInfo =
    locale === "de"
      ? isGuest
        ? "Ihr Download-Link ist 7 Tage gültig und kann bis zu 3 Mal verwendet werden."
        : "Sie finden Ihren Kauf in Ihrer Bibliothek."
      : isGuest
        ? "Your download link is valid for 7 days and can be used up to 3 times."
        : "You can find your purchase in your library.";

  const ctaText =
    locale === "de"
      ? isGuest
        ? "Material herunterladen"
        : "Zur Bibliothek"
      : isGuest
        ? "Download Material"
        : "Go to Library";

  const accountPrompt =
    isGuest && locale === "de"
      ? `<p style="color: #666; font-size: 14px; margin-top: 24px;">Erstellen Sie ein Konto, um zukünftige Käufe dauerhaft zu speichern und jederzeit darauf zugreifen zu können.</p>`
      : isGuest
        ? `<p style="color: #666; font-size: 14px; margin-top: 24px;">Create an account to permanently save future purchases and access them anytime.</p>`
        : "";

  const textContent =
    locale === "de"
      ? `Vielen Dank für Ihren Kauf!\n\nMaterial: ${resourceTitle}\nPreis: CHF ${formattedPrice}\n\n${downloadInfo}\n\nDownload-Link: ${downloadLink}\n\n${isGuest ? "Erstellen Sie ein Konto, um zukünftige Käufe dauerhaft zu speichern." : ""}`
      : `Thank you for your purchase!\n\nMaterial: ${resourceTitle}\nPrice: CHF ${formattedPrice}\n\n${downloadInfo}\n\nDownload link: ${downloadLink}\n\n${isGuest ? "Create an account to permanently save future purchases." : ""}`;

  const htmlContent =
    locale === "de"
      ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kaufbestätigung</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a365d; margin-bottom: 24px;">Vielen Dank für Ihren Kauf!</h1>

  <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0; font-weight: 500;">Material:</p>
    <p style="margin: 0 0 16px 0; font-size: 18px;">${resourceTitle}</p>
    <p style="margin: 0 0 8px 0; font-weight: 500;">Preis:</p>
    <p style="margin: 0; font-size: 18px;">CHF ${formattedPrice}</p>
  </div>

  <p>${downloadInfo}</p>

  <p style="margin: 32px 0;">
    <a href="${downloadLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">${ctaText}</a>
  </p>

  ${accountPrompt}

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
  <title>Purchase Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a365d; margin-bottom: 24px;">Thank you for your purchase!</h1>

  <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0; font-weight: 500;">Material:</p>
    <p style="margin: 0 0 16px 0; font-size: 18px;">${resourceTitle}</p>
    <p style="margin: 0 0 8px 0; font-weight: 500;">Price:</p>
    <p style="margin: 0; font-size: 18px;">CHF ${formattedPrice}</p>
  </div>

  <p>${downloadInfo}</p>

  <p style="margin: 32px 0;">
    <a href="${downloadLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">${ctaText}</a>
  </p>

  ${accountPrompt}

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
      console.error("Failed to send purchase confirmation email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error sending purchase confirmation email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Send a contact form notification email to admins
 */
export async function sendContactNotificationEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();
    const adminEmail = process.env.ADMIN_EMAIL || "admin@easylehrer.ch";

    const subjectLabels: Record<string, string> = {
      general: "Allgemeine Anfrage",
      support: "Support",
      sales: "Verkauf",
      partnership: "Partnerschaft",
      feedback: "Feedback",
    };

    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: adminEmail,
      subject: `[${APP_NAME}] Neue Kontaktanfrage: ${subjectLabels[subject] || subject}`,
      text: `Neue Kontaktanfrage von ${name} (${email})

Betreff: ${subjectLabels[subject] || subject}

Nachricht:
${message}

---
Diese E-Mail wurde automatisch generiert.`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Neue Kontaktanfrage</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1e3a5f;">Neue Kontaktanfrage</h2>
  <p><strong>Von:</strong> ${name} (${email})</p>
  <p><strong>Betreff:</strong> ${subjectLabels[subject] || subject}</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <p><strong>Nachricht:</strong></p>
  <p style="white-space: pre-wrap;">${message}</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <p style="color: #6b7280; font-size: 12px;">Diese E-Mail wurde automatisch generiert.</p>
</body>
</html>`,
    });

    if (error) {
      console.error("Failed to send contact notification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error sending contact notification email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
