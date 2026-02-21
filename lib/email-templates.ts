import crypto from "crypto";

const APP_NAME = "Currico";

const UNSUBSCRIBE_SECRET =
  process.env.UNSUBSCRIBE_SECRET || process.env.AUTH_SECRET || "fallback-secret";

// -- Unsubscribe helpers --------------------------------------------------

export function generateUnsubscribeUrl(userId: string, notificationType: string): string {
  const sig = crypto
    .createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(userId + notificationType)
    .digest("hex");
  const baseUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";
  return `${baseUrl}/api/unsubscribe?user=${userId}&type=${notificationType}&sig=${sig}`;
}

export function verifyUnsubscribeToken(userId: string, type: string, sig: string): boolean {
  const expected = crypto
    .createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(userId + type)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// -- Shared email template ------------------------------------------------

interface EmailTemplateParams {
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  unsubscribeUrl?: string;
  locale?: "de" | "en";
}

interface EmailOutput {
  html: string;
  text: string;
}

export function wrapEmailTemplate({
  title,
  body,
  ctaText,
  ctaUrl,
  unsubscribeUrl,
  locale = "de",
}: EmailTemplateParams): EmailOutput {
  const isDe = locale === "de";

  // -- Plain text version -------------------------------------------------
  const textParts = [title, "", body];
  if (ctaText && ctaUrl) {
    textParts.push("", `${ctaText}: ${ctaUrl}`);
  }
  if (unsubscribeUrl) {
    textParts.push(
      "",
      "---",
      isDe
        ? `E-Mail-Benachrichtigungen abbestellen: ${unsubscribeUrl}`
        : `Unsubscribe from email notifications: ${unsubscribeUrl}`
    );
  }
  textParts.push("", `-- ${APP_NAME}`);
  const text = textParts.join("\n");

  // -- HTML version -------------------------------------------------------
  const ctaHtml =
    ctaText && ctaUrl
      ? `<tr><td style="padding: 24px 0 0 0; text-align: center;">
           <a href="${ctaUrl}" style="display: inline-block; background: #1e66f5; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">${ctaText}</a>
         </td></tr>`
      : "";

  const unsubscribeHtml = unsubscribeUrl
    ? `<tr><td style="padding: 16px 0 0 0; text-align: center;">
         <a href="${unsubscribeUrl}" style="color: #9ca0b0; font-size: 12px; text-decoration: underline;">
           ${isDe ? "E-Mail-Benachrichtigungen abbestellen" : "Unsubscribe from email notifications"}
         </a>
       </td></tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #eff1f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff1f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 520px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e1e2e; padding: 20px 32px; text-align: center;">
              <span style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${APP_NAME}</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h2 style="color: #1e1e2e; margin: 0 0 16px 0; font-size: 20px;">${title}</h2>
                    <p style="color: #4c4f69; line-height: 1.6; margin: 0;">${body}</p>
                  </td>
                </tr>
                ${ctaHtml}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #ccd0da; padding: 20px 32px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #9ca0b0; font-size: 12px; margin: 0;">${APP_NAME} &ndash; ${isDe ? "Bildungsplattform Schweiz" : "Swiss Education Platform"}</p>
                  </td>
                </tr>
                ${unsubscribeHtml}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, text };
}

// -- External subscriber unsubscribe URL -----------------------------------

export function generateExternalUnsubscribeUrl(email: string): string {
  const sig = crypto
    .createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(email + "NEWSLETTER_EXTERNAL")
    .digest("hex");
  const baseUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";
  return `${baseUrl}/api/unsubscribe?user=${encodeURIComponent(email)}&type=NEWSLETTER_EXTERNAL&sig=${sig}`;
}

// -- Digest email template ------------------------------------------------

interface DigestMaterial {
  id: string;
  title: string;
  price: number;
  sellerName: string;
}

interface DigestEmailParams {
  materials: DigestMaterial[];
  unsubscribeUrl: string;
  locale?: "de" | "en";
  isPersonalized?: boolean;
}

/** Escape user-supplied strings before embedding in HTML emails */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderDigestEmail({
  materials,
  unsubscribeUrl,
  locale = "de",
  isPersonalized = true,
}: DigestEmailParams): EmailOutput {
  const isDe = locale === "de";
  const baseUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";
  const count = materials.length;

  const heading = isPersonalized
    ? isDe
      ? `${count} neue Materialien für Sie`
      : `${count} new materials for you`
    : isDe
      ? "Neue Materialien auf Currico"
      : "New materials on Currico";

  const intro = isPersonalized
    ? isDe
      ? "Basierend auf Ihrem Profil und Ihren Favoriten haben wir neue Materialien für Sie zusammengestellt."
      : "Based on your profile and favorites, we've put together new materials for you."
    : isDe
      ? "Entdecken Sie die neuesten Materialien auf Currico."
      : "Discover the latest materials on Currico.";

  const freeLabel = isDe ? "Gratis" : "Free";
  const ctaLabel = isDe ? "Alle Materialien entdecken" : "Discover all materials";
  const unsubLabel = isDe ? "Newsletter abbestellen" : "Unsubscribe from newsletter";

  // -- Plain text version -------------------------------------------------
  const textParts = [heading, "", intro, ""];
  for (const m of materials) {
    const price = m.price === 0 ? freeLabel : `CHF ${(m.price / 100).toFixed(2)}`;
    textParts.push(`- ${m.title} (${m.sellerName}) — ${price}`);
    textParts.push(`  ${baseUrl}/${locale}/materialien/${m.id}`);
  }
  textParts.push("", `${ctaLabel}: ${baseUrl}/${locale}/materialien`);
  textParts.push("", "---", `${unsubLabel}: ${unsubscribeUrl}`);
  textParts.push("", `-- ${APP_NAME}`);
  const text = textParts.join("\n");

  // -- HTML version -------------------------------------------------------
  const materialRows = materials
    .map((m) => {
      const price =
        m.price === 0
          ? `<span style="color: #40a02b; font-weight: 600;">${freeLabel}</span>`
          : `<span style="color: #1e1e2e; font-weight: 600;">CHF ${(m.price / 100).toFixed(2)}</span>`;
      const url = `${baseUrl}/${locale}/materialien/${m.id}`;
      return `<tr>
  <td style="padding: 12px 0; border-bottom: 1px solid #e6e9ef;">
    <a href="${url}" style="text-decoration: none; color: inherit; display: block;">
      <p style="margin: 0 0 4px 0; color: #1e1e2e; font-weight: 600; font-size: 15px;">${escapeHtml(m.title)}</p>
      <p style="margin: 0; color: #6c6f85; font-size: 13px;">${escapeHtml(m.sellerName)} &middot; ${price}</p>
    </a>
  </td>
</tr>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #eff1f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff1f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 520px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e1e2e; padding: 20px 32px; text-align: center;">
              <span style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${APP_NAME}</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #1e1e2e; margin: 0 0 8px 0; font-size: 20px;">${heading}</h2>
              <p style="color: #4c4f69; line-height: 1.6; margin: 0 0 24px 0;">${intro}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${materialRows}
              </table>
              <div style="padding: 24px 0 0 0; text-align: center;">
                <a href="${baseUrl}/${locale}/materialien" style="display: inline-block; background: #1e66f5; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">${ctaLabel}</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #ccd0da; padding: 20px 32px; text-align: center;">
              <p style="color: #9ca0b0; font-size: 12px; margin: 0 0 8px 0;">${APP_NAME} &ndash; ${isDe ? "Bildungsplattform Schweiz" : "Swiss Education Platform"}</p>
              <a href="${unsubscribeUrl}" style="color: #9ca0b0; font-size: 12px; text-decoration: underline;">${unsubLabel}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, text };
}
