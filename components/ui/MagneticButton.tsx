"use client";

import { useRef, useState, useCallback, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  /** Max displacement in pixels (default 5) */
  maxDisplacement?: number;
  /** How much the button follows the cursor (0-1, default 0.3) */
  strength?: number;
  className?: string;
}

/**
 * Wrapper that gives its child a subtle "magnetic" pull toward the cursor.
 * Desktop-only (pointer: fine), disabled for prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  maxDisplacement = 5,
  strength = 0.3,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (e.clientX - centerX) * strength;
      const dy = (e.clientY - centerY) * strength;

      // Clamp to max displacement
      const clampedX = Math.max(-maxDisplacement, Math.min(maxDisplacement, dx));
      const clampedY = Math.max(-maxDisplacement, Math.min(maxDisplacement, dy));

      setPosition({ x: clampedX, y: clampedY });
    },
    [strength, maxDisplacement]
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      className={className}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}
