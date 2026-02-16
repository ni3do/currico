import { prisma } from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email";
import type { NotificationType } from "@prisma/client";

/** Maps notification type → user preference column */
const TYPE_TO_PREF: Record<NotificationType, string> = {
  SALE: "notify_sales",
  FOLLOW: "notify_new_followers",
  REVIEW: "notify_review_reminders",
  COMMENT: "notify_comments",
  SYSTEM: "notify_platform_updates",
};

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

/**
 * Create an in-app notification for a user.
 * Also sends an email if the user has opted in for this notification type.
 * Fire-and-forget — callers should use .catch() so failures don't block.
 */
export async function createNotification(params: CreateNotificationParams) {
  const notification = await prisma.notification.create({
    data: {
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
    },
  });

  // Send email in the background — don't await so it doesn't slow the caller
  sendEmailIfOptedIn(params).catch((err) =>
    console.error("Failed to send notification email:", err)
  );

  return notification;
}

async function sendEmailIfOptedIn(params: CreateNotificationParams) {
  const prefColumn = TYPE_TO_PREF[params.type];
  if (!prefColumn) return;

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      email: true,
      preferred_language: true,
      notify_sales: true,
      notify_new_from_followed: true,
      notify_new_followers: true,
      notify_review_reminders: true,
      notify_comments: true,
      notify_platform_updates: true,
    },
  });

  if (!user) return;

  // Check if the user has opted in for this notification type
  const prefs: Record<string, boolean> = {
    notify_sales: user.notify_sales,
    notify_new_from_followed: user.notify_new_from_followed,
    notify_new_followers: user.notify_new_followers,
    notify_review_reminders: user.notify_review_reminders,
    notify_comments: user.notify_comments,
    notify_platform_updates: user.notify_platform_updates,
  };
  if (!prefs[prefColumn]) return;

  const locale = (user.preferred_language === "en" ? "en" : "de") as "de" | "en";

  await sendNotificationEmail({
    email: user.email,
    title: params.title,
    body: params.body || params.title,
    link: params.link,
    locale,
    notificationType: params.type,
    userId: params.userId,
  });
}

/**
 * Notify a seller that one of their materials was purchased.
 */
export function notifySale(sellerId: string, resourceTitle: string, amount: number) {
  const formatted = (amount / 100).toFixed(2);
  createNotification({
    userId: sellerId,
    type: "SALE",
    title: `Neuer Verkauf: ${resourceTitle}`,
    body: `Ihr Material "${resourceTitle}" wurde für CHF ${formatted} verkauft.`,
    link: "/konto",
  }).catch((err) => console.error("Failed to create sale notification:", err));
}

/**
 * Notify a user that someone followed them.
 */
export function notifyFollow(followedUserId: string, followerName: string) {
  createNotification({
    userId: followedUserId,
    type: "FOLLOW",
    title: "Neuer Follower",
    body: `${followerName} folgt Ihnen jetzt.`,
    link: "/konto",
  }).catch((err) => console.error("Failed to create follow notification:", err));
}

/**
 * Notify a seller that their material received a new review.
 */
export function notifyReview(sellerId: string, resourceTitle: string, rating: number) {
  createNotification({
    userId: sellerId,
    type: "REVIEW",
    title: `Neue Bewertung: ${resourceTitle}`,
    body: `Ihr Material "${resourceTitle}" hat eine ${rating}-Sterne-Bewertung erhalten.`,
    link: "/konto",
  }).catch((err) => console.error("Failed to create review notification:", err));
}

/**
 * Notify a seller that someone commented on their material.
 */
export function notifyComment(sellerId: string, resourceTitle: string, commenterName: string) {
  createNotification({
    userId: sellerId,
    type: "COMMENT",
    title: `Neuer Kommentar: ${resourceTitle}`,
    body: `${commenterName} hat einen Kommentar zu "${resourceTitle}" hinterlassen.`,
    link: "/konto",
  }).catch((err) => console.error("Failed to create comment notification:", err));
}

/**
 * Notify a comment author that someone replied to their comment.
 */
export function notifyCommentReply(
  commentAuthorId: string,
  resourceTitle: string,
  replierName: string
) {
  createNotification({
    userId: commentAuthorId,
    type: "COMMENT",
    title: `Neue Antwort auf Ihren Kommentar`,
    body: `${replierName} hat auf Ihren Kommentar zu "${resourceTitle}" geantwortet.`,
    link: "/konto",
  }).catch((err) => console.error("Failed to create comment reply notification:", err));
}

/**
 * Notify a seller that their material was approved.
 */
export function notifyMaterialApproved(
  authorId: string,
  resourceTitle: string,
  materialId: string
) {
  createNotification({
    userId: authorId,
    type: "SYSTEM",
    title: `Material freigegeben: ${resourceTitle}`,
    body: `Ihr Material "${resourceTitle}" wurde geprüft und ist jetzt öffentlich sichtbar.`,
    link: `/materialien/${materialId}`,
  }).catch((err) => console.error("Failed to create material approved notification:", err));
}

/**
 * Notify a seller that their material was rejected.
 */
export function notifyMaterialRejected(
  authorId: string,
  resourceTitle: string,
  rejectionReason?: string
) {
  const body = rejectionReason
    ? `Ihr Material "${resourceTitle}" wurde abgelehnt. Grund: ${rejectionReason}`
    : `Ihr Material "${resourceTitle}" wurde abgelehnt. Bitte überprüfen Sie die Richtlinien und laden Sie es erneut hoch.`;

  createNotification({
    userId: authorId,
    type: "SYSTEM",
    title: `Material abgelehnt: ${resourceTitle}`,
    body,
    link: "/konto/uploads",
  }).catch((err) => console.error("Failed to create material rejected notification:", err));
}

/**
 * Notify a user that they were manually verified as a seller by an admin.
 */
export function notifyManualVerification(userId: string) {
  createNotification({
    userId,
    type: "SYSTEM",
    title: "Verkäufer-Verifizierung bestätigt",
    body: "Ihr Konto wurde manuell als verifizierter Verkäufer freigeschaltet. Sie erhalten nun das Verifizierungsabzeichen.",
    link: "/konto",
  }).catch((err) => console.error("Failed to create manual verification notification:", err));
}

/**
 * Check if a resource has hit a download milestone and notify the author.
 * Thresholds: 10, 50, 100, 500, 1000
 * Deduplicates by checking existing milestone notifications.
 */
export async function checkDownloadMilestone(resourceId: string) {
  const MILESTONES = [10, 50, 100, 500, 1000];

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: {
      title: true,
      seller_id: true,
      _count: {
        select: { downloads: true, transactions: true },
      },
    },
  });

  if (!resource) return;

  const totalDownloads = resource._count.downloads + resource._count.transactions;

  // Find the highest milestone reached
  const reached = MILESTONES.filter((m) => totalDownloads >= m);
  if (reached.length === 0) return;

  const milestone = reached[reached.length - 1];

  // Check if we already notified for this milestone
  const existing = await prisma.notification.findFirst({
    where: {
      user_id: resource.seller_id,
      type: "SYSTEM",
      title: { contains: `${milestone} Downloads` },
      body: { contains: resource.title },
    },
  });

  if (existing) return;

  createNotification({
    userId: resource.seller_id,
    type: "SYSTEM",
    title: `Meilenstein: ${milestone} Downloads erreicht!`,
    body: `Ihr Material "${resource.title}" hat ${milestone} Downloads erreicht. Herzlichen Glückwunsch!`,
    link: "/konto/uploads",
  }).catch((err) => console.error("Failed to create download milestone notification:", err));
}

/**
 * Notify followers when a seller publishes new material.
 */
export function notifyNewMaterial(
  followerIds: string[],
  resourceTitle: string,
  sellerName: string
) {
  if (followerIds.length === 0) return;

  prisma.notification
    .createMany({
      data: followerIds.map((followerId) => ({
        user_id: followerId,
        type: "FOLLOW" as NotificationType,
        title: `Neues Material von ${sellerName}`,
        body: `${sellerName} hat "${resourceTitle}" veröffentlicht.`,
        link: "/materialien",
      })),
    })
    .catch((err) => console.error("Failed to create new material notifications:", err));
}
