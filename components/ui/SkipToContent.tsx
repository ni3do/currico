"use client";

import { useTranslations } from "next-intl";

export function SkipToContent() {
  const t = useTranslations("common");

  return (
    <a
      href="#main-content"
      className="bg-primary text-text-on-accent fixed top-0 left-1/2 z-[100] -translate-x-1/2 -translate-y-full rounded-b-lg px-4 py-2 text-sm font-medium transition-transform focus:translate-y-0 focus:outline-none"
      onClick={(e) => {
        e.preventDefault();
        const main = document.querySelector("main");
        if (main) {
          main.setAttribute("tabindex", "-1");
          main.focus();
          main.removeAttribute("tabindex");
        }
      }}
    >
      {t("skipToContent")}
    </a>
  );
}
