"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FocusTrapProps {
  children: ReactNode;
  /** Called when Escape is pressed */
  onEscape?: () => void;
  /** Whether the trap is active */
  active?: boolean;
}

/**
 * Traps keyboard focus within its children.
 * - Cycles Tab/Shift+Tab through focusable elements
 * - Calls onEscape when Escape is pressed
 * - Restores focus to the previously focused element on unmount
 */
export function FocusTrap({ children, onEscape, active = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store the element that had focus before the trap
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element inside the trap
    const container = containerRef.current;
    if (!container) return;

    const focusFirst = () => {
      const focusable = getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    };

    // Small delay to ensure the modal is rendered
    requestAnimationFrame(focusFirst);

    return () => {
      // Restore focus on unmount
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        e.stopPropagation();
        onEscape();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);

  return <div ref={containerRef}>{children}</div>;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.closest("[hidden]") && el.offsetParent !== null
  );
}
