import { prisma } from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email";
import type { NotificationType } from "@prisma/client";

/** Maps notification type → user preference column */
const TYPE_TO_PREF: Record<NotificationType, string> = {
  SALE: "notify_sales",
  FOLLOW: "notify_new_from_followed",
  REVIEW: "notify_review_reminders",
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
      notify_review_reminders: true,
      notify_platform_updates: true,
    },
  });

  if (!user) return;

  // Check if the user has opted in for this notification type
  const prefs: Record<string, boolean> = {
    notify_sales: user.notify_sales,
    notify_new_from_followed: user.notify_new_from_followed,
    notify_review_reminders: user.notify_review_reminders,
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
