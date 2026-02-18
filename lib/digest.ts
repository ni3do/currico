import { prisma } from "@/lib/db";
import { getTransporter, getFromEmail } from "@/lib/email";
import {
  renderDigestEmail,
  generateUnsubscribeUrl,
  generateExternalUnsubscribeUrl,
} from "@/lib/email-templates";
import { toStringArray } from "@/lib/json-array";
import { Prisma } from "@prisma/client";

const APP_NAME = "Currico";
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1000;
const MAX_MATERIALS = 10;

interface DigestMaterial {
  id: string;
  title: string;
  price: number;
  sellerName: string;
}

/**
 * Get personalized digest materials for a registered user.
 * Matches by subject overlap, cycle overlap, or followed sellers.
 */
export async function getDigestMaterialsForUser(
  userId: string,
  subjects: string[],
  cycles: string[],
  followedIds: string[],
  lastDigestAt: Date | null
): Promise<DigestMaterial[]> {
  const cutoff = lastDigestAt ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const hasFilters = subjects.length > 0 || cycles.length > 0 || followedIds.length > 0;

  if (!hasFilters) {
    return getGenericTopMaterials(cutoff);
  }

  // Build OR conditions for matching
  const orConditions: Prisma.Sql[] = [];

  if (subjects.length > 0) {
    orConditions.push(Prisma.sql`r."subjects"::jsonb ?| ${subjects}::text[]`);
  }

  if (cycles.length > 0) {
    orConditions.push(Prisma.sql`r."cycles"::jsonb ?| ${cycles}::text[]`);
  }

  if (followedIds.length > 0) {
    orConditions.push(Prisma.sql`r."seller_id" IN (${Prisma.join(followedIds)})`);
  }

  const whereOr = Prisma.join(orConditions, " OR ");

  const rows = await prisma.$queryRaw<
    { id: string; title: string; price: number; seller_name: string }[]
  >`
    SELECT r."id", r."title", r."price", COALESCE(u."display_name", u."name", 'Unbekannt') AS seller_name
    FROM "resources" r
    JOIN "users" u ON u."id" = r."seller_id"
    WHERE r."status" = 'VERIFIED'
      AND r."is_public" = true
      AND r."is_published" = true
      AND r."created_at" > ${cutoff}
      AND r."seller_id" != ${userId}
      AND (${whereOr})
    ORDER BY r."created_at" DESC
    LIMIT ${MAX_MATERIALS}
  `;

  if (rows.length === 0) {
    return getGenericTopMaterials(cutoff);
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    price: r.price,
    sellerName: r.seller_name,
  }));
}

/**
 * Get top recent materials (no personalization).
 * Used for external subscribers and users with empty profiles.
 */
export async function getGenericTopMaterials(cutoff: Date): Promise<DigestMaterial[]> {
  const rows = await prisma.$queryRaw<
    { id: string; title: string; price: number; seller_name: string }[]
  >`
    SELECT r."id", r."title", r."price", COALESCE(u."display_name", u."name", 'Unbekannt') AS seller_name
    FROM "resources" r
    JOIN "users" u ON u."id" = r."seller_id"
    WHERE r."status" = 'VERIFIED'
      AND r."is_public" = true
      AND r."is_published" = true
      AND r."created_at" > ${cutoff}
    ORDER BY r."created_at" DESC
    LIMIT ${MAX_MATERIALS}
  `;

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    price: r.price,
    sellerName: r.seller_name,
  }));
}

interface DigestStats {
  sent: number;
  skipped: number;
  failed: number;
}

/**
 * Main orchestrator: sends the weekly digest to all opted-in users
 * and confirmed external newsletter subscribers.
 */
export async function sendWeeklyDigest(): Promise<DigestStats> {
  const stats: DigestStats = { sent: 0, skipped: 0, failed: 0 };
  const transport = getTransporter();
  const fromEmail = getFromEmail();

  // 1. Fetch opted-in users
  const users = await prisma.user.findMany({
    where: { notify_newsletter: true },
    select: {
      id: true,
      email: true,
      preferred_language: true,
      last_digest_at: true,
      subjects: true,
      cycles: true,
      following: { select: { followed_id: true } },
    },
  });

  // 2. Fetch confirmed external subscribers
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { confirmed: true, unsubscribed_at: null },
    select: { id: true, email: true, last_digest_at: true },
  });

  // 3. Deduplicate by email — users take priority
  const userEmails = new Set(users.map((u) => u.email));
  const uniqueSubscribers = subscribers.filter((s) => !userEmails.has(s.email));

  // 4. Process registered users
  const genericCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let cachedGenericMaterials: DigestMaterial[] | null = null;

  type Recipient =
    | {
        kind: "user";
        id: string;
        email: string;
        locale: "de" | "en";
        materials: DigestMaterial[];
        isPersonalized: boolean;
        unsubscribeUrl: string;
      }
    | {
        kind: "subscriber";
        id: string;
        email: string;
        locale: "de";
        materials: DigestMaterial[];
        isPersonalized: false;
        unsubscribeUrl: string;
      };

  const recipients: Recipient[] = [];

  // Prepare user recipients
  for (const user of users) {
    const subjects = toStringArray(user.subjects);
    const cycles = toStringArray(user.cycles);
    const followedIds = user.following.map((f) => f.followed_id);

    const materials = await getDigestMaterialsForUser(
      user.id,
      subjects,
      cycles,
      followedIds,
      user.last_digest_at
    );

    if (materials.length === 0) {
      stats.skipped++;
      continue;
    }

    const hasFilters = subjects.length > 0 || cycles.length > 0 || followedIds.length > 0;
    const unsubscribeUrl = generateUnsubscribeUrl(user.id, "NEWSLETTER");
    const locale = user.preferred_language === "en" ? ("en" as const) : ("de" as const);

    recipients.push({
      kind: "user",
      id: user.id,
      email: user.email,
      locale,
      materials,
      isPersonalized: hasFilters,
      unsubscribeUrl,
    });
  }

  // Prepare external subscriber recipients
  if (uniqueSubscribers.length > 0) {
    if (!cachedGenericMaterials) {
      cachedGenericMaterials = await getGenericTopMaterials(genericCutoff);
    }

    if (cachedGenericMaterials.length === 0) {
      stats.skipped += uniqueSubscribers.length;
    } else {
      for (const sub of uniqueSubscribers) {
        const unsubscribeUrl = generateExternalUnsubscribeUrl(sub.email);
        recipients.push({
          kind: "subscriber",
          id: sub.id,
          email: sub.email,
          locale: "de",
          materials: cachedGenericMaterials,
          isPersonalized: false,
          unsubscribeUrl,
        });
      }
    }
  }

  // 5. Send in batches
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (recipient) => {
        const { html, text } = renderDigestEmail({
          materials: recipient.materials,
          unsubscribeUrl: recipient.unsubscribeUrl,
          locale: recipient.locale,
          isPersonalized: recipient.isPersonalized,
        });

        const subject = recipient.isPersonalized
          ? recipient.locale === "de"
            ? `${APP_NAME}: ${recipient.materials.length} neue Materialien für Sie`
            : `${APP_NAME}: ${recipient.materials.length} new materials for you`
          : recipient.locale === "de"
            ? `${APP_NAME}: Neue Materialien auf Currico`
            : `${APP_NAME}: New materials on Currico`;

        await transport.sendMail({
          from: `"${APP_NAME}" <${fromEmail}>`,
          to: recipient.email,
          subject,
          text,
          html,
        });

        // Update last_digest_at
        if (recipient.kind === "user") {
          await prisma.user.update({
            where: { id: recipient.id },
            data: { last_digest_at: new Date() },
          });
        } else {
          await prisma.newsletterSubscriber.update({
            where: { id: recipient.id },
            data: { last_digest_at: new Date() },
          });
        }
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        stats.sent++;
      } else {
        stats.failed++;
        console.error("Digest send failed:", result.reason);
      }
    }

    // Rate limit delay between batches
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return stats;
}
