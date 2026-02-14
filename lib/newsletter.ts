import { prisma } from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email";

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1000;

export async function sendNewsletter(newsletterId: string) {
  const newsletter = await prisma.newsletter.findUnique({ where: { id: newsletterId } });
  if (!newsletter || newsletter.status !== "SENDING") return;

  try {
    // Get all opted-in users
    const users = await prisma.user.findMany({
      where: { notify_newsletter: true },
      select: { id: true, email: true, preferred_language: true },
    });

    // Get confirmed external subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { confirmed: true, unsubscribed_at: null },
      select: { email: true },
    });

    const allEmails = [
      ...users.map((u) => ({
        email: u.email,
        locale: u.preferred_language === "en" ? ("en" as const) : ("de" as const),
      })),
      ...subscribers.map((s) => ({ email: s.email, locale: "de" as const })),
    ];

    // Deduplicate by email
    const seen = new Set<string>();
    const unique = allEmails.filter((e) => {
      if (seen.has(e.email)) return false;
      seen.add(e.email);
      return true;
    });

    let sent = 0;
    for (let i = 0; i < unique.length; i += BATCH_SIZE) {
      const batch = unique.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(({ email, locale }) =>
          sendNotificationEmail({
            email,
            title: newsletter.subject,
            body: newsletter.content,
            locale,
          })
        )
      );
      sent += batch.length;

      // Update progress
      await prisma.newsletter.update({
        where: { id: newsletterId },
        data: { recipient_count: sent },
      });

      // Rate limit delay between batches
      if (i + BATCH_SIZE < unique.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    // Mark as sent
    await prisma.newsletter.update({
      where: { id: newsletterId },
      data: { status: "SENT", sent_at: new Date(), recipient_count: sent },
    });
  } catch (error) {
    console.error("Newsletter send failed:", error);
    await prisma.newsletter.update({
      where: { id: newsletterId },
      data: { status: "FAILED" },
    });
  }
}
