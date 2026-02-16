/**
 * Central definition of cookies used by the application.
 * Referenced by both the cookie policy page and CookieConsent component.
 */

export type CookieDefinition = {
  name: string;
  /** i18n key suffix for the purpose description */
  purposeKey: string;
  /** i18n key suffix for the duration label */
  durationKey: string;
  type: "essential" | "analytics";
};

export const APP_COOKIES: CookieDefinition[] = [
  {
    name: "authjs.session-token",
    purposeKey: "sessionToken",
    durationKey: "thirtyDays",
    type: "essential",
  },
  {
    name: "next-auth.csrf-token",
    purposeKey: "csrfToken",
    durationKey: "session",
    type: "essential",
  },
];

/**
 * Items stored in localStorage (not cookies), listed on the cookie page
 * for transparency.
 */
export type LocalStorageDefinition = {
  name: string;
  purposeKey: string;
};

export const APP_LOCAL_STORAGE: LocalStorageDefinition[] = [
  {
    name: "cookie-consent",
    purposeKey: "consent",
  },
  {
    name: "theme",
    purposeKey: "theme",
  },
];
