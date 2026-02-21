import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyDigest } from "@/lib/digest";
import { unauthorized, serverError } from "@/lib/api";
import { captureError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Auth: verify CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return serverError("CRON_SECRET not configured");
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return unauthorized();
  }

  // Idempotency: skip if any user received a digest within the last 6 hours
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const recentDigest = await prisma.user.findFirst({
    where: {
      notify_newsletter: true,
      last_digest_at: { gt: sixHoursAgo },
    },
    select: { id: true },
  });

  if (recentDigest) {
    return NextResponse.json({ skipped: true, reason: "Digest already sent within last 6 hours" });
  }

  try {
    const stats = await sendWeeklyDigest();
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    captureError("Newsletter digest cron failed:", error);
    return serverError(error instanceof Error ? error.message : "Internal error");
  }
}
