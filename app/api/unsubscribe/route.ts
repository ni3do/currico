import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/email-templates";

/** Maps notification type param to database column */
const TYPE_TO_COLUMN: Record<string, string> = {
  SALE: "notify_sales",
  FOLLOW: "notify_new_followers",
  REVIEW: "notify_review_reminders",
  COMMENT: "notify_comments",
  SYSTEM: "notify_platform_updates",
};

function htmlPage(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #eff1f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
  <div style="background: #ffffff; border-radius: 12px; padding: 40px; max-width: 460px; width: 100%; text-align: center; margin: 20px;">
    <h1 style="color: #1e1e2e; font-size: 22px; margin: 0 0 16px 0;">${title}</h1>
    <p style="color: #4c4f69; line-height: 1.6; margin: 0;">${message}</p>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("user");
  const type = searchParams.get("type");
  const sig = searchParams.get("sig");

  if (!userId || !type || !sig) {
    return new NextResponse(
      htmlPage("Link ungültig", "Der Abmelde-Link ist ungültig oder unvollständig."),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (!verifyUnsubscribeToken(userId, type, sig)) {
    return new NextResponse(
      htmlPage("Link ungültig", "Der Abmelde-Link ist ungültig oder abgelaufen."),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const column = TYPE_TO_COLUMN[type];
  if (!column) {
    return new NextResponse(htmlPage("Fehler", "Unbekannter Benachrichtigungstyp."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { [column]: false },
    });
  } catch {
    return new NextResponse(
      htmlPage(
        "Fehler",
        "Beim Abmelden ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
      ),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const typeLabels: Record<string, string> = {
    SALE: "Verkaufsbenachrichtigungen",
    FOLLOW: "Follower-Benachrichtigungen",
    REVIEW: "Bewertungsbenachrichtigungen",
    COMMENT: "Kommentar-Benachrichtigungen",
    SYSTEM: "Plattform-Updates",
  };

  const label = typeLabels[type] || "Benachrichtigungen";

  return new NextResponse(
    htmlPage(
      "Erfolgreich abgemeldet",
      `Sie erhalten keine ${label} mehr per E-Mail. Sie können dies jederzeit in Ihren Kontoeinstellungen ändern.`
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
