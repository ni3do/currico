"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setVisible(scrollY > 200);
    }

    // Check initial scroll position
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Nach oben scrollen"
      className="bg-surface border-border text-text-muted hover:text-primary hover:border-primary/40 fixed right-6 bottom-20 z-[60] flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all hover:shadow-xl"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
