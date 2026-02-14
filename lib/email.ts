import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const APP_NAME = "Currico";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration incomplete. Required: SMTP_HOST, SMTP_USER, SMTP_PASSWORD");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    requireTLS: port === 587, // Require STARTTLS for port 587
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

function getFromEmail(): string {
  return process.env.EMAIL_FROM || process.env.SMTP_USER || "info@currico.ch";
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
    const transport = getTransporter();
    await transport.sendMail({
      from: getFromEmail(),
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });

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
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
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
  const downloadLink =
    isGuest && downloadToken
      ? `${baseUrl}/${locale}/download/${downloadToken}`
      : `${baseUrl}/${locale}/konto?tab=library`;

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
    const transport = getTransporter();
    await transport.sendMail({
      from: getFromEmail(),
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });

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
    const transport = getTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || "info@currico.ch";

    const subjectLabels: Record<string, string> = {
      general: "Allgemeine Anfrage",
      support: "Support",
      sales: "Verkauf",
      partnership: "Partnerschaft",
      feedback: "Feedback",
    };

    await transport.sendMail({
      from: getFromEmail(),
      to: adminEmail,
      replyTo: email,
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

    return { success: true };
  } catch (err) {
    console.error("Error sending contact notification email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(params: {
  email: string;
  token: string;
  locale?: "de" | "en";
}): Promise<SendEmailResult> {
  const { email, token, locale = "de" } = params;

  try {
    const transport = getTransporter();
    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";
    const resetUrl = `${baseUrl}/${locale}/passwort-zuruecksetzen?token=${token}`;

    const isDe = locale === "de";

    const subject = isDe
      ? `${APP_NAME} – Passwort zurücksetzen`
      : `${APP_NAME} – Reset your password`;

    const heading = isDe ? "Passwort zurücksetzen" : "Reset your password";
    const intro = isDe
      ? "Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten."
      : "We received a request to reset your password.";
    const buttonText = isDe ? "Neues Passwort setzen" : "Set new password";
    const expiry = isDe ? "Dieser Link ist 1 Stunde gültig." : "This link is valid for 1 hour.";
    const ignore = isDe
      ? "Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren."
      : "If you didn't request this, you can safely ignore this email.";

    const html = `
      <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 20px;">
        <h2 style="color: #1e1e2e; margin-bottom: 16px;">${heading}</h2>
        <p style="color: #4c4f69; line-height: 1.6;">${intro}</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; background: #1e66f5; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">${buttonText}</a>
        </div>
        <p style="color: #6c6f85; font-size: 14px;">${expiry}</p>
        <p style="color: #6c6f85; font-size: 14px;">${ignore}</p>
        <hr style="border: none; border-top: 1px solid #ccd0da; margin: 24px 0;" />
        <p style="color: #9ca0b0; font-size: 12px;">${APP_NAME}</p>
      </div>
    `;

    const text = `${heading}\n\n${intro}\n\n${buttonText}: ${resetUrl}\n\n${expiry}\n\n${ignore}`;

    await transport.sendMail({
      from: `"${APP_NAME}" <${getFromEmail()}>`,
      to: email,
      subject,
      text,
      html,
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Send a notification email (sale, follow, review, system).
 * Called from createNotification() when the user has opted in.
 */
export async function sendNotificationEmail(params: {
  email: string;
  title: string;
  body: string;
  link?: string;
  locale?: "de" | "en";
}): Promise<SendEmailResult> {
  const { email, title, body, link, locale = "de" } = params;

  try {
    const transport = getTransporter();
    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";

    const isDe = locale === "de";
    const ctaText = isDe ? "Auf Currico ansehen" : "View on Currico";
    const fullLink = link ? `${baseUrl}${link.startsWith("/") ? `/${locale}${link}` : link}` : null;

    const ctaHtml = fullLink
      ? `<p style="margin: 24px 0; text-align: center;">
           <a href="${fullLink}" style="display: inline-block; background: #1e66f5; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">${ctaText}</a>
         </p>`
      : "";

    const text = `${title}\n\n${body}${fullLink ? `\n\n${ctaText}: ${fullLink}` : ""}`;

    const html = `
      <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 20px;">
        <h2 style="color: #1e1e2e; margin-bottom: 16px;">${title}</h2>
        <p style="color: #4c4f69; line-height: 1.6;">${body}</p>
        ${ctaHtml}
        <hr style="border: none; border-top: 1px solid #ccd0da; margin: 24px 0;" />
        <p style="color: #9ca0b0; font-size: 12px;">${APP_NAME}</p>
      </div>
    `;

    await transport.sendMail({
      from: `"${APP_NAME}" <${getFromEmail()}>`,
      to: email,
      subject: `${APP_NAME}: ${title}`,
      text,
      html,
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to send notification email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Verify SMTP connection is working
 * Useful for health checks and debugging
 */
export async function verifyEmailConnection(): Promise<SendEmailResult> {
  try {
    const transport = getTransporter();
    await transport.verify();
    return { success: true };
  } catch (err) {
    console.error("SMTP connection verification failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
