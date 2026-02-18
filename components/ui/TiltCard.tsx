"use client";

import { useRef, useState, useCallback, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  /** Max tilt angle in degrees (default 3) */
  maxTilt?: number;
  /** Spring stiffness for reset animation (default 300) */
  stiffness?: number;
  className?: string;
}

/**
 * Wrapper that applies a subtle 3D perspective tilt on hover.
 * Follows the cursor position within the card to calculate rotateX/rotateY.
 * Disabled for prefers-reduced-motion.
 */
export function TiltCard({ children, maxTilt = 3, stiffness = 300, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();

      // Position relative to center (-0.5 to 0.5)
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // Invert Y for natural tilt (cursor at top → tilt toward viewer)
      setTilt({
        rotateX: -y * maxTilt * 2,
        rotateY: x * maxTilt * 2,
      });
    },
    [maxTilt]
  );

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
      }}
      transition={{
        type: "spring",
        stiffness,
        damping: 20,
        mass: 0.5,
      }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className={className}
    >
      {/* Light reflection overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovering ? 0.06 : 0,
          background: `radial-gradient(circle at ${50 + tilt.rotateY * 10}% ${50 - tilt.rotateX * 10}%, white, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
