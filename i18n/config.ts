// English temporarily disabled - platform is German-only for Swiss German market
// To re-enable English, change to: export const locales = ['de', 'en'] as const;
export const locales = ["de"] as const;
export const defaultLocale = "de" as const;

export type Locale = (typeof locales)[number];
